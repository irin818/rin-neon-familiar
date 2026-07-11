import { describe, expect, it } from 'vitest';

import {
  FIRST_SIGNAL_AT_MS,
  RIN_DUAL_LINK_CHART,
  SIGNAL_STEP_MS,
  advanceGame,
  applyInput,
  createGameState,
  getGrade,
  getOutcome,
  judgeTiming,
  type ChartNote,
} from './engine';

const TEST_CHART: readonly ChartNote[] = [
  { id: 'g1', atMs: 1_000, action: 'green' },
  { id: 'p1', atMs: 2_000, action: 'pink' },
  { id: 'd1', atMs: 3_000, action: 'dual' },
];

function testState(tolerant = false) {
  return createGameState({ chart: TEST_CHART, tolerant });
}

describe('RIN Dual Link chart', () => {
  it('builds the fixed 32-signal production chart', () => {
    expect(RIN_DUAL_LINK_CHART).toHaveLength(32);
    expect(RIN_DUAL_LINK_CHART[0]).toMatchObject({
      atMs: FIRST_SIGNAL_AT_MS,
      action: 'green',
    });
    expect(RIN_DUAL_LINK_CHART[7]).toMatchObject({ action: 'dual' });
    expect(RIN_DUAL_LINK_CHART[31]).toMatchObject({
      atMs: FIRST_SIGNAL_AT_MS + 31 * SIGNAL_STEP_MS,
      action: 'dual',
    });

    const state = createGameState();
    expect(state.maxScore).toBe(3_600);
  });
});

describe('timing judgements', () => {
  it.each([
    [0, 'perfect'],
    [90, 'perfect'],
    [-90, 'perfect'],
    [91, 'good'],
    [180, 'good'],
    [181, 'ok'],
    [300, 'ok'],
    [301, null],
  ] as const)('judges a %ims delta as %s', (deltaMs, expected) => {
    expect(judgeTiming(deltaMs)).toBe(expected);
  });

  it('widens every timing band by 1.5 in tolerant mode', () => {
    expect(judgeTiming(135, true)).toBe('perfect');
    expect(judgeTiming(270, true)).toBe('good');
    expect(judgeTiming(450, true)).toBe('ok');
    expect(judgeTiming(451, true)).toBeNull();
  });
});

describe('input and scoring', () => {
  it('awards perfect, good, and ok points without a combo multiplier', () => {
    let state = applyInput(testState(), 'green', 1_000);
    state = applyInput(state, 'pink', 2_170);
    state = applyInput(state, 'dual', 3_280);

    expect(state.score).toBe(100 + 70 + 80);
    expect(state.combo).toBe(3);
    expect(state.maxCombo).toBe(3);
    expect(state.hits).toBe(3);
    expect(state.notes.map((note) => note.judgement)).toEqual([
      'perfect',
      'good',
      'ok',
    ]);
  });

  it('matches the nearest pending signal of the same action', () => {
    const chart: readonly ChartNote[] = [
      { id: 'early', atMs: 1_000, action: 'green' },
      { id: 'near', atMs: 1_400, action: 'green' },
      { id: 'other', atMs: 1_200, action: 'pink' },
    ];
    const state = applyInput(createGameState({ chart }), 'green', 1_250);

    expect(state.notes.find((note) => note.id === 'near')?.judgement).toBe(
      'good',
    );
    expect(state.notes.find((note) => note.id === 'early')?.judgement).toBeNull();
    expect(state.notes.find((note) => note.id === 'other')?.judgement).toBeNull();
  });

  it('breaks combo on noise without consuming the wrong signal', () => {
    let state = applyInput(testState(), 'green', 1_000);
    expect(state.combo).toBe(1);

    state = applyInput(state, 'green', 1_500);

    expect(state.noiseCount).toBe(1);
    expect(state.combo).toBe(0);
    expect(state.notes[1].judgement).toBeNull();
    expect(state.lastFeedback?.judgement).toBe('noise');

    state = applyInput(state, 'pink', 2_000);
    expect(state.notes[1].judgement).toBe('perfect');
    expect(state.score).toBe(200);
  });

  it('does not let a single-channel action consume a dual signal', () => {
    let state = advanceGame(testState(), 2_301);
    state = applyInput(state, 'green', 3_000);

    expect(state.notes[2].judgement).toBeNull();
    expect(state.lastFeedback?.judgement).toBe('noise');

    state = applyInput(state, 'dual', 3_000);
    expect(state.notes[2].judgement).toBe('perfect');
    expect(state.notes[2].points).toBe(200);
  });

  it('accepts a 450ms edge hit only in tolerant mode', () => {
    const tolerant = applyInput(testState(true), 'green', 1_450);
    expect(tolerant.notes[0].judgement).toBe('ok');
    expect(tolerant.score).toBe(40);

    const normal = applyInput(testState(), 'green', 1_450);
    expect(normal.notes[0].judgement).toBe('miss');
    expect(normal.lastFeedback?.judgement).toBe('noise');
  });
});

describe('time advancement and results', () => {
  it('keeps the inclusive edge hittable and misses immediately after it', () => {
    const atEdge = advanceGame(testState(), 1_300);
    expect(atEdge.notes[0].judgement).toBeNull();

    const afterEdge = advanceGame(atEdge, 1_301);
    expect(afterEdge.notes[0].judgement).toBe('miss');
    expect(afterEdge.misses).toBe(1);
    expect(afterEdge.combo).toBe(0);
  });

  it('advances all overdue signals deterministically', () => {
    const state = advanceGame(testState(), 3_301);

    expect(state.notes.map((note) => note.judgement)).toEqual([
      'miss',
      'miss',
      'miss',
    ]);
    expect(state.misses).toBe(3);
    expect(state.phase).toBe('results');
    expect(state.result).toMatchObject({
      score: 0,
      accuracy: 0,
      grade: 'D',
      outcome: 'unstable',
    });
  });

  it('finishes a perfect chart with an S and a stable link', () => {
    let state = applyInput(testState(), 'green', 1_000);
    state = applyInput(state, 'pink', 2_000);
    state = applyInput(state, 'dual', 3_000);

    expect(state.phase).toBe('results');
    expect(state.result).toEqual({
      score: 400,
      maxScore: 400,
      accuracy: 100,
      grade: 'S',
      outcome: 'stable',
      maxCombo: 3,
      tolerant: false,
    });
  });

  it('rounds displayed accuracy to one decimal but grades raw accuracy', () => {
    expect(getGrade(94.999)).toBe('A');
    expect(getGrade(95)).toBe('S');
    expect(getOutcome(59.999)).toBe('unstable');
    expect(getOutcome(60)).toBe('stable');
  });

  it('rejects a backwards clock', () => {
    const state = advanceGame(testState(), 500);
    expect(() => advanceGame(state, 499)).toThrow(/cannot move backwards/i);
  });
});
