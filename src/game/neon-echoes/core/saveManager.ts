import { createInitialWorldState, defaultSettings } from './state'
import { dialogues } from '../data/dialogues'
import type { GraffitiId, MoodId, SceneId, WorldState } from './types'

export const NEON_ECHOES_SAVE_KEY = 'rin-neon-echoes-save'
export const CURRENT_SAVE_VERSION = 1

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface SaveReadResult {
  state: WorldState
  issue: 'none' | 'unavailable' | 'corrupt' | 'unsupported'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const sceneIds: SceneId[] = ['neon-balcony', 'service-corridor', 'signal-gate', 'rin-safehouse', 'rooftop-relay']
const graffitiIds: GraffitiId[] = ['blind-eye', 'pulse-arrow', 'echo-mark']
const moodIds: MoodId[] = ['guarded', 'focused', 'relieved', 'curious', 'warm']
const regionStatuses = ['locked', 'available', 'changed'] as const
const textSpeeds = ['slow', 'normal', 'fast', 'instant'] as const

const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === 'string' && values.includes(value as T)
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
const finiteNumber = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback
const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value))

function stringRecord(value: unknown) {
  if (!isRecord(value)) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

export function migrateSave(value: unknown): WorldState | null {
  if (!isRecord(value) || value.saveVersion !== CURRENT_SAVE_VERSION) return null
  const initial = createInitialWorldState()
  if (!isOneOf(value.currentScene, sceneIds) || !isRecord(value.relationship)) return null

  const completedEvents = stringArray(value.completedEvents)
  const visitedScenes = stringArray(value.visitedScenes).filter((id): id is SceneId => isOneOf(id, sceneIds))
  const unlockedGraffiti = stringArray(value.unlockedGraffiti).filter((id): id is GraffitiId => isOneOf(id, graffitiIds))
  const relationship = value.relationship
  const importedSettings = isRecord(value.settings) ? value.settings : {}
  const importedRegions = isRecord(value.cityRegions) ? value.cityRegions : {}
  const cityRegions = { ...initial.cityRegions }
  for (const sceneId of sceneIds) {
    if (isOneOf(importedRegions[sceneId], regionStatuses)) cityRegions[sceneId] = importedRegions[sceneId]
  }
  const dialogueHistory = Array.isArray(value.dialogueHistory) ? value.dialogueHistory.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.speaker !== 'string' || !isRecord(entry.text)) return []
    if (typeof entry.text.zh !== 'string' || typeof entry.text.en !== 'string') return []
    return [{ id: entry.id, speaker: entry.speaker, text: { zh: entry.text.zh, en: entry.text.en } }]
  }).slice(-60) : []
  const dialogueId = typeof value.activeDialogueId === 'string' && dialogues[value.activeDialogueId] ? value.activeDialogueId : null
  const dialogueNodeId = dialogueId && typeof value.activeDialogueNodeId === 'string' && dialogues[dialogueId].nodes[value.activeDialogueNodeId]
    ? value.activeDialogueNodeId
    : null

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    currentChapter: completedEvents.includes('chapter-0-complete') ? 'city-open' : 'chapter-0',
    currentScene: value.currentScene,
    visitedScenes: [...new Set([...visitedScenes, value.currentScene])],
    completedEvents: [...new Set(completedEvents)],
    inventory: [...new Set(stringArray(value.inventory))],
    unlockedGraffiti: [...new Set(unlockedGraffiti)],
    selectedGraffiti: isOneOf(value.selectedGraffiti, graffitiIds) ? value.selectedGraffiti : initial.selectedGraffiti,
    relationship: {
      trust: clamp(finiteNumber(relationship.trust, initial.relationship.trust), 0, 100),
      curiosity: clamp(finiteNumber(relationship.curiosity, initial.relationship.curiosity), 0, 100),
      caution: clamp(finiteNumber(relationship.caution, initial.relationship.caution), 0, 100),
      stress: clamp(finiteNumber(relationship.stress, initial.relationship.stress), 0, 100),
      familiarity: clamp(finiteNumber(relationship.familiarity, initial.relationship.familiarity), 0, 100),
      currentMood: isOneOf(relationship.currentMood, moodIds) ? relationship.currentMood : initial.relationship.currentMood,
      rememberedChoices: stringArray(relationship.rememberedChoices),
      recentEvents: stringArray(relationship.recentEvents).slice(-8),
    },
    playerChoices: stringRecord(value.playerChoices),
    cityRegions,
    dialogueHistory,
    activeDialogueId: dialogueNodeId ? dialogueId : null,
    activeDialogueNodeId: dialogueNodeId,
    settings: {
      masterVolume: clamp(finiteNumber(importedSettings.masterVolume, defaultSettings.masterVolume), 0, 1),
      musicVolume: clamp(finiteNumber(importedSettings.musicVolume, defaultSettings.musicVolume), 0, 1),
      ambienceVolume: clamp(finiteNumber(importedSettings.ambienceVolume, defaultSettings.ambienceVolume), 0, 1),
      effectsVolume: clamp(finiteNumber(importedSettings.effectsVolume, defaultSettings.effectsVolume), 0, 1),
      dialogueVolume: clamp(finiteNumber(importedSettings.dialogueVolume, defaultSettings.dialogueVolume), 0, 1),
      textSpeed: isOneOf(importedSettings.textSpeed, textSpeeds) ? importedSettings.textSpeed : defaultSettings.textSpeed,
      reducedMotion: typeof importedSettings.reducedMotion === 'boolean' ? importedSettings.reducedMotion : defaultSettings.reducedMotion,
      glitchEnabled: typeof importedSettings.glitchEnabled === 'boolean' ? importedSettings.glitchEnabled : defaultSettings.glitchEnabled,
      subtitlesEnabled: typeof importedSettings.subtitlesEnabled === 'boolean' ? importedSettings.subtitlesEnabled : defaultSettings.subtitlesEnabled,
    },
    startedAt: typeof value.startedAt === 'string' ? value.startedAt : initial.startedAt,
    updatedAt: new Date().toISOString(),
  }
}

export function parseSaveJson(json: string): SaveReadResult {
  try {
    const raw = JSON.parse(json) as unknown
    const migrated = migrateSave(raw)
    if (!migrated) {
      const version = isRecord(raw) ? raw.saveVersion : undefined
      return { state: createInitialWorldState(), issue: typeof version === 'number' ? 'unsupported' : 'corrupt' }
    }
    return { state: migrated, issue: 'none' }
  } catch {
    return { state: createInitialWorldState(), issue: 'corrupt' }
  }
}

export function loadWorldState(storage: StorageLike | null): SaveReadResult {
  if (!storage) return { state: createInitialWorldState(), issue: 'unavailable' }
  try {
    const value = storage.getItem(NEON_ECHOES_SAVE_KEY)
    return value ? parseSaveJson(value) : { state: createInitialWorldState(), issue: 'none' }
  } catch {
    return { state: createInitialWorldState(), issue: 'unavailable' }
  }
}

export function persistWorldState(storage: StorageLike | null, state: WorldState) {
  if (!storage) return false
  try {
    storage.setItem(NEON_ECHOES_SAVE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearWorldState(storage: StorageLike | null) {
  if (!storage) return false
  try {
    storage.removeItem(NEON_ECHOES_SAVE_KEY)
    return true
  } catch {
    return false
  }
}

export function serializeWorldState(state: WorldState) {
  return JSON.stringify(state, null, 2)
}
