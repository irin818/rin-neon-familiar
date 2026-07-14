import { describe, expect, it } from 'vitest'
import { createInitialWorldState, worldStateReducer } from './state'
import {
  clearWorldState,
  loadWorldState,
  NEON_ECHOES_SAVE_KEY,
  parseSaveJson,
  persistWorldState,
  type StorageLike,
} from './saveManager'

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

describe('Neon Echoes save manager', () => {
  it('round-trips a versioned world state', () => {
    const storage = new MemoryStorage()
    const state = worldStateReducer(createInitialWorldState(), {
      type: 'APPLY_EFFECTS',
      effects: { completeEvents: ['hand-taken'], relationship: { trust: 4 } },
    })
    expect(persistWorldState(storage, state)).toBe(true)
    const loaded = loadWorldState(storage)
    expect(loaded.issue).toBe('none')
    expect(loaded.state.completedEvents).toContain('hand-taken')
    expect(loaded.state.relationship.trust).toBe(22)
  })

  it('recovers from malformed JSON without throwing', () => {
    const loaded = parseSaveJson('{bad json')
    expect(loaded.issue).toBe('corrupt')
    expect(loaded.state.currentScene).toBe('neon-balcony')
  })

  it('rejects unsupported versions', () => {
    const loaded = parseSaveJson(JSON.stringify({ saveVersion: 999, currentScene: 'neon-balcony', relationship: {} }))
    expect(loaded.issue).toBe('unsupported')
  })

  it('rejects an unknown scene instead of loading a broken world', () => {
    const state = createInitialWorldState()
    const loaded = parseSaveJson(JSON.stringify({ ...state, currentScene: 'not-a-real-node' }))
    expect(loaded.issue).toBe('unsupported')
    expect(loaded.state.currentScene).toBe('neon-balcony')
  })

  it('sanitizes imported collections, settings and relationship values', () => {
    const state = createInitialWorldState()
    const loaded = parseSaveJson(JSON.stringify({
      ...state,
      visitedScenes: ['service-corridor', 'fake-node', 42],
      unlockedGraffiti: ['blind-eye', 'unknown-symbol'],
      relationship: { ...state.relationship, trust: 999, stress: 'high' },
      settings: { ...state.settings, masterVolume: 4, textSpeed: 'warp' },
    }))
    expect(loaded.issue).toBe('none')
    expect(loaded.state.visitedScenes).toEqual(['service-corridor', 'neon-balcony'])
    expect(loaded.state.unlockedGraffiti).toEqual(['blind-eye'])
    expect(loaded.state.relationship.trust).toBe(100)
    expect(loaded.state.relationship.stress).toBe(44)
    expect(loaded.state.settings.masterVolume).toBe(1)
    expect(loaded.state.settings.textSpeed).toBe('normal')
  })

  it('clears the stored save', () => {
    const storage = new MemoryStorage()
    storage.setItem(NEON_ECHOES_SAVE_KEY, '{}')
    expect(clearWorldState(storage)).toBe(true)
    expect(storage.getItem(NEON_ECHOES_SAVE_KEY)).toBeNull()
  })

  it('degrades when storage is unavailable', () => {
    expect(loadWorldState(null).issue).toBe('unavailable')
    expect(persistWorldState(null, createInitialWorldState())).toBe(false)
  })
})
