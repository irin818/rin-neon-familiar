import type { GameAction, GameSettings, StateEffects, WorldState } from './types'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
const unique = <T,>(values: readonly T[]) => [...new Set(values)]

export const defaultSettings: GameSettings = {
  masterVolume: 0.72,
  musicVolume: 0.34,
  ambienceVolume: 0.48,
  effectsVolume: 0.7,
  dialogueVolume: 0.62,
  textSpeed: 'normal',
  reducedMotion: false,
  glitchEnabled: true,
  subtitlesEnabled: true,
}

export function createInitialWorldState(now = new Date().toISOString()): WorldState {
  return {
    saveVersion: 1,
    currentChapter: 'chapter-0',
    currentScene: 'neon-balcony',
    visitedScenes: ['neon-balcony'],
    completedEvents: [],
    inventory: [],
    unlockedGraffiti: [],
    selectedGraffiti: 'blind-eye',
    relationship: {
      trust: 18,
      curiosity: 28,
      caution: 62,
      stress: 44,
      familiarity: 6,
      currentMood: 'guarded',
      rememberedChoices: [],
      recentEvents: [],
    },
    playerChoices: {},
    cityRegions: {
      'neon-balcony': 'available',
      'service-corridor': 'locked',
      'signal-gate': 'locked',
      'rin-safehouse': 'locked',
      'rooftop-relay': 'locked',
    },
    dialogueHistory: [],
    activeDialogueId: null,
    activeDialogueNodeId: null,
    settings: { ...defaultSettings },
    startedAt: now,
    updatedAt: now,
  }
}

function applyEffects(state: WorldState, effects: StateEffects): WorldState {
  const relationshipDelta = effects.relationship ?? {}
  const relationship = {
    ...state.relationship,
    trust: clamp(state.relationship.trust + (relationshipDelta.trust ?? 0)),
    curiosity: clamp(state.relationship.curiosity + (relationshipDelta.curiosity ?? 0)),
    caution: clamp(state.relationship.caution + (relationshipDelta.caution ?? 0)),
    stress: clamp(state.relationship.stress + (relationshipDelta.stress ?? 0)),
    familiarity: clamp(state.relationship.familiarity + (relationshipDelta.familiarity ?? 0)),
    currentMood: effects.mood ?? state.relationship.currentMood,
    rememberedChoices: effects.rememberChoice
      ? unique([...state.relationship.rememberedChoices, effects.rememberChoice])
      : state.relationship.rememberedChoices,
    recentEvents: unique([
      ...state.relationship.recentEvents,
      ...(effects.completeEvents ?? []),
    ]).slice(-8),
  }

  const cityRegions = { ...state.cityRegions }
  for (const sceneId of effects.unlockScenes ?? []) cityRegions[sceneId] = 'available'
  for (const sceneId of effects.changeScenes ?? []) cityRegions[sceneId] = 'changed'

  const playerChoices = effects.choice
    ? { ...state.playerChoices, [effects.choice.key]: effects.choice.value }
    : state.playerChoices

  const completedEvents = unique([...state.completedEvents, ...(effects.completeEvents ?? [])])

  return {
    ...state,
    currentChapter: completedEvents.includes('chapter-0-complete') ? 'city-open' : state.currentChapter,
    completedEvents,
    inventory: unique([...state.inventory, ...(effects.addItems ?? [])]),
    unlockedGraffiti: unique([...state.unlockedGraffiti, ...(effects.unlockGraffiti ?? [])]),
    relationship,
    playerChoices,
    cityRegions,
  }
}

export function worldStateReducer(state: WorldState, action: GameAction): WorldState {
  const updatedAt = new Date().toISOString()

  switch (action.type) {
    case 'VISIT_SCENE':
      return {
        ...state,
        currentScene: action.sceneId,
        visitedScenes: unique([...state.visitedScenes, action.sceneId]),
        updatedAt,
      }
    case 'APPLY_EFFECTS':
      return { ...applyEffects(state, action.effects), updatedAt }
    case 'APPLY_EFFECTS_ONCE': {
      const marker = `effect:${action.id}`
      if (state.completedEvents.includes(marker)) return state
      return {
        ...applyEffects(state, {
          ...action.effects,
          completeEvents: [...(action.effects.completeEvents ?? []), marker],
        }),
        updatedAt,
      }
    }
    case 'SELECT_GRAFFITI':
      return state.unlockedGraffiti.includes(action.graffitiId)
        ? { ...state, selectedGraffiti: action.graffitiId, updatedAt }
        : state
    case 'OPEN_DIALOGUE':
      return {
        ...state,
        activeDialogueId: action.dialogueId,
        activeDialogueNodeId: action.nodeId,
        updatedAt,
      }
    case 'SET_DIALOGUE_NODE':
      return { ...state, activeDialogueNodeId: action.nodeId, updatedAt }
    case 'ADD_DIALOGUE_HISTORY':
      return state.dialogueHistory.some((entry) => entry.id === action.entry.id) ? state : {
        ...state,
        dialogueHistory: [...state.dialogueHistory, action.entry].slice(-60),
        updatedAt,
      }
    case 'CLOSE_DIALOGUE':
      return { ...state, activeDialogueId: null, activeDialogueNodeId: null, updatedAt }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings }, updatedAt }
    case 'IMPORT_SAVE':
      return { ...action.state, updatedAt }
    case 'RESET_GAME':
      return createInitialWorldState(action.now)
    default:
      return state
  }
}

export function requirementsMet(state: WorldState, requirement?: {
  events?: string[]
  missingEvents?: string[]
  items?: string[]
  graffiti?: string[]
}) {
  if (!requirement) return true
  return (requirement.events ?? []).every((id) => state.completedEvents.includes(id))
    && (requirement.missingEvents ?? []).every((id) => !state.completedEvents.includes(id))
    && (requirement.items ?? []).every((id) => state.inventory.includes(id))
    && (requirement.graffiti ?? []).every((id) => state.unlockedGraffiti.includes(id as never))
}
