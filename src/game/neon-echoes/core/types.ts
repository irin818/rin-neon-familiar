export type GameLocale = 'zh' | 'en'

export type SceneId =
  | 'neon-balcony'
  | 'service-corridor'
  | 'signal-gate'
  | 'rin-safehouse'
  | 'rooftop-relay'

export type GraffitiId = 'blind-eye' | 'pulse-arrow' | 'echo-mark'
export type MoodId = 'guarded' | 'focused' | 'relieved' | 'curious' | 'warm'

export interface LocalizedText {
  zh: string
  en: string
}

export interface GameSettings {
  masterVolume: number
  musicVolume: number
  ambienceVolume: number
  effectsVolume: number
  dialogueVolume: number
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant'
  reducedMotion: boolean
  glitchEnabled: boolean
  subtitlesEnabled: boolean
}

export interface CompanionState {
  trust: number
  curiosity: number
  caution: number
  stress: number
  familiarity: number
  currentMood: MoodId
  rememberedChoices: string[]
  recentEvents: string[]
}

export interface DialogueHistoryEntry {
  id: string
  speaker: string
  text: LocalizedText
}

export interface WorldState {
  saveVersion: 1
  currentChapter: 'chapter-0' | 'city-open'
  currentScene: SceneId
  visitedScenes: SceneId[]
  completedEvents: string[]
  inventory: string[]
  unlockedGraffiti: GraffitiId[]
  selectedGraffiti: GraffitiId
  relationship: CompanionState
  playerChoices: Record<string, string>
  cityRegions: Record<SceneId, 'locked' | 'available' | 'changed'>
  dialogueHistory: DialogueHistoryEntry[]
  activeDialogueId: string | null
  activeDialogueNodeId: string | null
  settings: GameSettings
  startedAt: string
  updatedAt: string
}

export interface StateEffects {
  completeEvents?: string[]
  addItems?: string[]
  unlockGraffiti?: GraffitiId[]
  relationship?: Partial<Record<'trust' | 'curiosity' | 'caution' | 'stress' | 'familiarity', number>>
  mood?: MoodId
  rememberChoice?: string
  choice?: { key: string; value: string }
  unlockScenes?: SceneId[]
  changeScenes?: SceneId[]
}

export type GameAction =
  | { type: 'VISIT_SCENE'; sceneId: SceneId }
  | { type: 'APPLY_EFFECTS'; effects: StateEffects }
  | { type: 'APPLY_EFFECTS_ONCE'; id: string; effects: StateEffects }
  | { type: 'SELECT_GRAFFITI'; graffitiId: GraffitiId }
  | { type: 'OPEN_DIALOGUE'; dialogueId: string; nodeId: string }
  | { type: 'SET_DIALOGUE_NODE'; nodeId: string | null }
  | { type: 'ADD_DIALOGUE_HISTORY'; entry: DialogueHistoryEntry }
  | { type: 'CLOSE_DIALOGUE' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'IMPORT_SAVE'; state: WorldState }
  | { type: 'RESET_GAME'; now?: string }

export interface HotspotRequirement {
  events?: string[]
  missingEvents?: string[]
  items?: string[]
  graffiti?: GraffitiId[]
}

export interface SceneHotspot {
  id: string
  label: LocalizedText
  description: LocalizedText
  x: number
  y: number
  size: number
  kind: 'inspect' | 'collect' | 'graffiti' | 'dialogue' | 'exit' | 'hack'
  requirement?: HotspotRequirement
  disabledText?: LocalizedText
  action: string
}

export interface SceneExit {
  id: string
  to: SceneId
  label: LocalizedText
  requirement?: HotspotRequirement
  transition: 'door' | 'corridor' | 'ladder' | 'signal'
}

export interface GameScene {
  id: SceneId
  title: LocalizedText
  subtitle: LocalizedText
  background: string
  backgroundPosition: string
  music: string
  ambientSound: string
  hotspots: SceneHotspot[]
  exits: SceneExit[]
  characters: string[]
  conditions: HotspotRequirement
  events: string[]
  entryDialogue: string | null
  worldStateRequirements: HotspotRequirement
}

export interface DialogueChoice {
  id: string
  text: LocalizedText
  next: string | null
  condition?: HotspotRequirement
  effects?: StateEffects
}

export interface DialogueNode {
  id: string
  speaker: 'RIN' | 'PLAYER' | 'SYSTEM'
  text: LocalizedText
  emotion: MoodId | 'neutral'
  choices?: DialogueChoice[]
  next: string | null
  conditions?: HotspotRequirement
  effects?: StateEffects
}

export interface DialogueTree {
  id: string
  startNode: string
  nodes: Record<string, DialogueNode>
}
