/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  clearWorldState,
  loadWorldState,
  parseSaveJson,
  persistWorldState,
  serializeWorldState,
  type SaveReadResult,
} from '../core/saveManager'
import { worldStateReducer } from '../core/state'
import type { GameAction, WorldState } from '../core/types'

type SaveStatus = 'saved' | 'saving' | 'unavailable'

interface GameStateContextValue {
  state: WorldState
  dispatch: Dispatch<GameAction>
  saveStatus: SaveStatus
  loadIssue: SaveReadResult['issue']
  resetGame: () => void
  importGame: (json: string) => SaveReadResult['issue']
  exportGame: () => string
}

const GameStateContext = createContext<GameStateContextValue | null>(null)

function getStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [initialRead] = useState(() => loadWorldState(getStorage()))
  const [state, dispatch] = useReducer(worldStateReducer, initialRead.state)
  const [loadIssue, setLoadIssue] = useState<SaveReadResult['issue']>(initialRead.issue)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initialRead.issue === 'unavailable' ? 'unavailable' : 'saved')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = persistWorldState(getStorage(), state)
      setSaveStatus(saved ? 'saved' : 'unavailable')
    }, 180)
    return () => window.clearTimeout(timer)
  }, [state])

  const resetGame = useCallback(() => {
    clearWorldState(getStorage())
    dispatch({ type: 'RESET_GAME' })
    setLoadIssue('none')
  }, [])

  const importGame = useCallback((json: string) => {
    const result = parseSaveJson(json)
    setLoadIssue(result.issue)
    if (result.issue === 'none') dispatch({ type: 'IMPORT_SAVE', state: result.state })
    return result.issue
  }, [])

  const exportGame = useCallback(() => serializeWorldState(state), [state])

  const value = useMemo<GameStateContextValue>(() => ({
    state,
    dispatch,
    saveStatus,
    loadIssue,
    resetGame,
    importGame,
    exportGame,
  }), [exportGame, importGame, loadIssue, resetGame, saveStatus, state])

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>
}

export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) throw new Error('useGameState must be used inside GameStateProvider')
  return context
}
