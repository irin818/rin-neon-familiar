import { describe, expect, it } from 'vitest'
import { createInitialWorldState, worldStateReducer } from '../core/state'
import { computeSyncError, isAcousticSyncComplete } from './acoustic'
import { RuleBasedCompanionProvider } from './companion'
import { recognizeGraffiti, type GraffitiPoint } from './graffiti'

const eyePath: GraffitiPoint[] = [
  { x: 0.12, y: 0.5 }, { x: 0.24, y: 0.35 }, { x: 0.4, y: 0.28 }, { x: 0.58, y: 0.3 },
  { x: 0.78, y: 0.42 }, { x: 0.88, y: 0.5 }, { x: 0.76, y: 0.62 }, { x: 0.58, y: 0.7 },
  { x: 0.4, y: 0.68 }, { x: 0.24, y: 0.62 }, { x: 0.12, y: 0.5 },
]

describe('Reality Graffiti recognizer', () => {
  it('accepts a closed eye-shaped trace', () => {
    const result = recognizeGraffiti(eyePath, 'blind-eye')
    expect(result.accepted).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('rejects a short accidental stroke', () => {
    const result = recognizeGraffiti([{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }], 'blind-eye')
    expect(result.accepted).toBe(false)
    expect(result.reason).toBe('too-short')
  })
})

describe('Acoustic hacking', () => {
  it('accepts the target frequency and phase', () => {
    expect(computeSyncError(68, 37)).toBe(0)
    expect(isAcousticSyncComplete(68, 37)).toBe(true)
  })

  it('keeps distant values locked', () => {
    expect(computeSyncError(10, 95)).toBeGreaterThan(8)
    expect(isAcousticSyncComplete(10, 95)).toBe(false)
  })
})

describe('Rule-based companion', () => {
  it('changes her address after a remembered choice', () => {
    const provider = new RuleBasedCompanionProvider()
    const state = worldStateReducer(createInitialWorldState(), {
      type: 'APPLY_EFFECTS',
      effects: { choice: { key: 'name-response', value: 'silence' } },
    })
    expect(provider.getAddress(state, 'en')).toBe('quiet partner')
  })
})
