export type SignalAction = 'green' | 'pink' | 'dual';

export type HitJudgement = 'perfect' | 'good' | 'ok';
export type NoteJudgement = HitJudgement | 'miss';
export type FeedbackJudgement = NoteJudgement | 'noise';
export type GamePhase = 'playing' | 'results';
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';
export type LinkOutcome = 'stable' | 'unstable';

export interface ChartNote {
  readonly id: string;
  readonly atMs: number;
  readonly action: SignalAction;
}

export interface JudgedNote extends ChartNote {
  readonly judgement: NoteJudgement | null;
  readonly judgedAtMs: number | null;
  readonly deltaMs: number | null;
  readonly points: number;
}

export interface GameFeedback {
  readonly judgement: FeedbackJudgement;
  readonly action: SignalAction | null;
  readonly noteId: string | null;
  readonly atMs: number;
  readonly deltaMs: number | null;
  readonly points: number;
}

export interface GameResult {
  readonly score: number;
  readonly maxScore: number;
  readonly accuracy: number;
  readonly grade: Grade;
  readonly outcome: LinkOutcome;
  readonly maxCombo: number;
  readonly tolerant: boolean;
}

export interface GameState {
  readonly phase: GamePhase;
  readonly tolerant: boolean;
  readonly elapsedMs: number;
  readonly notes: readonly JudgedNote[];
  readonly score: number;
  readonly maxScore: number;
  readonly combo: number;
  readonly maxCombo: number;
  readonly hits: number;
  readonly misses: number;
  readonly noiseCount: number;
  readonly lastFeedback: GameFeedback | null;
  readonly result: GameResult | null;
}

export interface CreateGameOptions {
  readonly chart?: readonly ChartNote[];
  readonly tolerant?: boolean;
}

export interface TimingWindows {
  readonly perfect: number;
  readonly good: number;
  readonly ok: number;
}

export const BASE_TIMING_WINDOWS: TimingWindows = Object.freeze({
  perfect: 90,
  good: 180,
  ok: 300,
});

export const TOLERANT_WINDOW_MULTIPLIER = 1.5;
export const SIGNAL_STEP_MS = 750;
export const FIRST_SIGNAL_AT_MS = 2_000;

export const SIGNAL_SEQUENCE =
  'GPGPGGPD' + 'PGPGPPGD' + 'GPPGGPGD' + 'PGGPPGPD';

const ACTION_BY_SYMBOL: Readonly<Record<string, SignalAction>> = Object.freeze({
  G: 'green',
  P: 'pink',
  D: 'dual',
});

export const RIN_DUAL_LINK_CHART: readonly ChartNote[] = Object.freeze(
  [...SIGNAL_SEQUENCE].map((symbol, index) =>
    Object.freeze({
      id: `signal-${String(index + 1).padStart(2, '0')}`,
      atMs: FIRST_SIGNAL_AT_MS + index * SIGNAL_STEP_MS,
      action: ACTION_BY_SYMBOL[symbol],
    }),
  ),
);

export function getTimingWindows(tolerant = false): TimingWindows {
  if (!tolerant) {
    return BASE_TIMING_WINDOWS;
  }

  return {
    perfect: BASE_TIMING_WINDOWS.perfect * TOLERANT_WINDOW_MULTIPLIER,
    good: BASE_TIMING_WINDOWS.good * TOLERANT_WINDOW_MULTIPLIER,
    ok: BASE_TIMING_WINDOWS.ok * TOLERANT_WINDOW_MULTIPLIER,
  };
}

export function getNoteMaxScore(action: SignalAction): number {
  return action === 'dual' ? 200 : 100;
}

export function judgeTiming(
  deltaMs: number,
  tolerant = false,
): HitJudgement | null {
  const distance = Math.abs(deltaMs);
  const windows = getTimingWindows(tolerant);

  if (distance <= windows.perfect) return 'perfect';
  if (distance <= windows.good) return 'good';
  if (distance <= windows.ok) return 'ok';
  return null;
}

export function getGrade(accuracy: number): Grade {
  if (accuracy >= 95) return 'S';
  if (accuracy >= 85) return 'A';
  if (accuracy >= 70) return 'B';
  if (accuracy >= 50) return 'C';
  return 'D';
}

export function getOutcome(accuracy: number): LinkOutcome {
  return accuracy >= 60 ? 'stable' : 'unstable';
}

export function createGameState(options: CreateGameOptions = {}): GameState {
  const chart = normalizeChart(options.chart ?? RIN_DUAL_LINK_CHART);
  const notes = chart.map<JudgedNote>((note) => ({
    ...note,
    judgement: null,
    judgedAtMs: null,
    deltaMs: null,
    points: 0,
  }));

  return {
    phase: 'playing',
    tolerant: options.tolerant ?? false,
    elapsedMs: 0,
    notes,
    score: 0,
    maxScore: notes.reduce(
      (total, note) => total + getNoteMaxScore(note.action),
      0,
    ),
    combo: 0,
    maxCombo: 0,
    hits: 0,
    misses: 0,
    noiseCount: 0,
    lastFeedback: null,
    result: null,
  };
}

export function advanceGame(state: GameState, elapsedMs: number): GameState {
  assertElapsedTime(state, elapsedMs);

  if (state.phase === 'results') return state;

  const missWindow = getTimingWindows(state.tolerant).ok;
  let missesAdded = 0;
  let lastMiss: JudgedNote | null = null;

  const notes: JudgedNote[] = [];
  for (const note of state.notes) {
    if (note.judgement !== null || elapsedMs - note.atMs <= missWindow) {
      notes.push(note);
      continue;
    }

    missesAdded += 1;
    const missedNote: JudgedNote = {
      ...note,
      judgement: 'miss',
      judgedAtMs: elapsedMs,
      deltaMs: elapsedMs - note.atMs,
      points: 0,
    };
    lastMiss = missedNote;
    notes.push(missedNote);
  }

  const advanced: GameState = {
    ...state,
    elapsedMs,
    notes,
    combo: missesAdded > 0 ? 0 : state.combo,
    misses: state.misses + missesAdded,
    lastFeedback:
      lastMiss === null
        ? state.lastFeedback
        : {
            judgement: 'miss',
            action: lastMiss.action,
            noteId: lastMiss.id,
            atMs: elapsedMs,
            deltaMs: lastMiss.deltaMs,
            points: 0,
          },
  };

  return finishIfReady(advanced);
}

export function applyInput(
  state: GameState,
  action: SignalAction,
  elapsedMs: number,
): GameState {
  const advanced = advanceGame(state, elapsedMs);
  if (advanced.phase === 'results') return advanced;

  const hitWindow = getTimingWindows(advanced.tolerant).ok;
  const candidate = findNearestMatchingNote(
    advanced.notes,
    action,
    elapsedMs,
    hitWindow,
  );

  if (candidate === null) {
    return {
      ...advanced,
      combo: 0,
      noiseCount: advanced.noiseCount + 1,
      lastFeedback: {
        judgement: 'noise',
        action,
        noteId: null,
        atMs: elapsedMs,
        deltaMs: null,
        points: 0,
      },
    };
  }

  const deltaMs = elapsedMs - candidate.atMs;
  const judgement = judgeTiming(deltaMs, advanced.tolerant);
  if (judgement === null) {
    // findNearestMatchingNote already applies the same window. This protects
    // the invariant if timing rules are changed independently in the future.
    return advanced;
  }

  const points = getPoints(candidate.action, judgement);
  const combo = advanced.combo + 1;
  const notes = advanced.notes.map((note) =>
    note.id === candidate.id
      ? {
          ...note,
          judgement,
          judgedAtMs: elapsedMs,
          deltaMs,
          points,
        }
      : note,
  );

  return finishIfReady({
    ...advanced,
    notes,
    score: advanced.score + points,
    combo,
    maxCombo: Math.max(advanced.maxCombo, combo),
    hits: advanced.hits + 1,
    lastFeedback: {
      judgement,
      action,
      noteId: candidate.id,
      atMs: elapsedMs,
      deltaMs,
      points,
    },
  });
}

function normalizeChart(chart: readonly ChartNote[]): readonly ChartNote[] {
  if (chart.length === 0) {
    throw new Error('A game chart must contain at least one signal.');
  }

  const ids = new Set<string>();
  const normalized = chart.map((note) => {
    if (!note.id || ids.has(note.id)) {
      throw new Error(`Chart signal ids must be unique: ${note.id || '<empty>'}`);
    }
    if (!Number.isFinite(note.atMs) || note.atMs < 0) {
      throw new Error(`Invalid signal time for ${note.id}: ${note.atMs}`);
    }

    ids.add(note.id);
    return { ...note };
  });

  normalized.sort((left, right) =>
    left.atMs === right.atMs
      ? left.id.localeCompare(right.id)
      : left.atMs - right.atMs,
  );
  return normalized;
}

function assertElapsedTime(state: GameState, elapsedMs: number): void {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError(`Elapsed time must be finite and non-negative: ${elapsedMs}`);
  }
  if (elapsedMs < state.elapsedMs) {
    throw new RangeError(
      `Elapsed time cannot move backwards: ${elapsedMs} < ${state.elapsedMs}`,
    );
  }
}

function findNearestMatchingNote(
  notes: readonly JudgedNote[],
  action: SignalAction,
  elapsedMs: number,
  hitWindow: number,
): JudgedNote | null {
  let candidate: JudgedNote | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const note of notes) {
    if (note.judgement !== null || note.action !== action) continue;

    const distance = Math.abs(elapsedMs - note.atMs);
    if (distance > hitWindow) continue;

    if (
      distance < nearestDistance ||
      (distance === nearestDistance &&
        candidate !== null &&
        note.atMs < candidate.atMs)
    ) {
      candidate = note;
      nearestDistance = distance;
    }
  }

  return candidate;
}

function getPoints(action: SignalAction, judgement: HitJudgement): number {
  const base = getNoteMaxScore(action);
  if (judgement === 'perfect') return base;
  if (judgement === 'good') return base * 0.7;
  return base * 0.4;
}

function finishIfReady(state: GameState): GameState {
  if (state.notes.some((note) => note.judgement === null)) return state;

  const lastSignalAtMs = state.notes[state.notes.length - 1]!.atMs;
  if (state.elapsedMs < lastSignalAtMs) return state;

  const rawAccuracy = (state.score / state.maxScore) * 100;
  const accuracy = Number(rawAccuracy.toFixed(1));

  return {
    ...state,
    phase: 'results',
    combo: state.combo,
    result: {
      score: state.score,
      maxScore: state.maxScore,
      accuracy,
      grade: getGrade(rawAccuracy),
      outcome: getOutcome(rawAccuracy),
      maxCombo: state.maxCombo,
      tolerant: state.tolerant,
    },
  };
}
