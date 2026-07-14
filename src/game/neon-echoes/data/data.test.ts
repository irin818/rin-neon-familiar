import { describe, expect, it } from 'vitest'
import { createInitialWorldState, requirementsMet, worldStateReducer } from '../core/state'
import { dialogues } from './dialogues'
import { sceneOrder, scenes } from './scenes'

describe('Neon Echoes data graph', () => {
  it('defines five complete, normalized city nodes', () => {
    expect(sceneOrder).toHaveLength(5)
    expect(Object.keys(scenes)).toEqual(sceneOrder)
    for (const scene of Object.values(scenes)) {
      expect(scene.background).toContain('/assets/rin-')
      expect(scene.music).not.toBe('')
      expect(scene.ambientSound).not.toBe('')
      expect(scene.characters.every((id) => id === 'rin-green' || id === 'rin-pink')).toBe(true)
      for (const hotspot of scene.hotspots) {
        expect(hotspot.x).toBeGreaterThanOrEqual(0)
        expect(hotspot.x).toBeLessThanOrEqual(100)
        expect(hotspot.y).toBeGreaterThanOrEqual(0)
        expect(hotspot.y).toBeLessThanOrEqual(100)
      }
    }
  })

  it('keeps the chapter route locked until each preceding system changes', () => {
    let state = createInitialWorldState()
    expect(requirementsMet(state, scenes['service-corridor'].worldStateRequirements)).toBe(false)
    state = worldStateReducer(state, { type: 'APPLY_EFFECTS', effects: { completeEvents: ['hand-taken'] } })
    expect(requirementsMet(state, scenes['service-corridor'].worldStateRequirements)).toBe(true)
    expect(requirementsMet(state, scenes['signal-gate'].worldStateRequirements)).toBe(false)
    state = worldStateReducer(state, { type: 'APPLY_EFFECTS', effects: { completeEvents: ['camera-disabled'] } })
    expect(requirementsMet(state, scenes['signal-gate'].worldStateRequirements)).toBe(true)
    state = worldStateReducer(state, { type: 'APPLY_EFFECTS', effects: { completeEvents: ['acoustic-gate-open'] } })
    expect(requirementsMet(state, scenes['rin-safehouse'].worldStateRequirements)).toBe(true)
    expect(requirementsMet(state, scenes['rooftop-relay'].worldStateRequirements)).toBe(false)
  })

  it('defines three safehouse choices that converge on chapter completion', () => {
    const tree = dialogues['safehouse-name']
    const choices = tree.nodes.question.choices ?? []
    expect(choices.map((choice) => choice.id)).toEqual(['answer', 'silence', 'counter'])
    for (const choice of choices) expect(tree.nodes[choice.next ?? '']).toBeDefined()
    expect(tree.nodes['chapter-end'].effects?.completeEvents).toContain('chapter-0-complete')
  })
})
