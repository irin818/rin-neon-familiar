import { describe, expect, it } from 'vitest'
import { createInitialWorldState, requirementsMet, worldStateReducer } from './state'

describe('Neon Echoes world state', () => {
  it('starts at the balcony with every later city node locked', () => {
    const state = createInitialWorldState('2026-07-12T00:00:00.000Z')
    expect(state.currentScene).toBe('neon-balcony')
    expect(state.cityRegions['service-corridor']).toBe('locked')
    expect(state.unlockedGraffiti).toEqual([])
  })

  it('applies inventory, graffiti, relationship and scene effects once', () => {
    const state = createInitialWorldState()
    const next = worldStateReducer(state, {
      type: 'APPLY_EFFECTS',
      effects: {
        completeEvents: ['spray-found', 'spray-found'],
        addItems: ['spray-can'],
        unlockGraffiti: ['blind-eye'],
        relationship: { trust: 7, stress: -9 },
        unlockScenes: ['service-corridor'],
      },
    })
    expect(next.completedEvents).toEqual(['spray-found'])
    expect(next.inventory).toEqual(['spray-can'])
    expect(next.unlockedGraffiti).toEqual(['blind-eye'])
    expect(next.relationship.trust).toBe(25)
    expect(next.relationship.stress).toBe(35)
    expect(next.cityRegions['service-corridor']).toBe('available')
  })

  it('clamps relationship variables and opens the city after chapter completion', () => {
    const state = createInitialWorldState()
    const next = worldStateReducer(state, {
      type: 'APPLY_EFFECTS',
      effects: {
        completeEvents: ['chapter-0-complete'],
        relationship: { trust: 200, caution: -200 },
      },
    })
    expect(next.relationship.trust).toBe(100)
    expect(next.relationship.caution).toBe(0)
    expect(next.currentChapter).toBe('city-open')
  })

  it('checks normalized hotspot requirements', () => {
    const state = worldStateReducer(createInitialWorldState(), {
      type: 'APPLY_EFFECTS',
      effects: { completeEvents: ['camera-disabled'], addItems: ['spray-can'] },
    })
    expect(requirementsMet(state, { events: ['camera-disabled'], items: ['spray-can'] })).toBe(true)
    expect(requirementsMet(state, { missingEvents: ['camera-disabled'] })).toBe(false)
  })

  it('applies dialogue and choice effects only once', () => {
    const state = createInitialWorldState()
    const action = {
      type: 'APPLY_EFFECTS_ONCE' as const,
      id: 'choice:safehouse-name:question:counter',
      effects: { relationship: { trust: 5 }, choice: { key: 'name-response', value: 'counter' } },
    }
    const once = worldStateReducer(state, action)
    const twice = worldStateReducer(once, action)
    expect(once.relationship.trust).toBe(23)
    expect(twice).toBe(once)
    expect(twice.playerChoices['name-response']).toBe('counter')
  })
})
