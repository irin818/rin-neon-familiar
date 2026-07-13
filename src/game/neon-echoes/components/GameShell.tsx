import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { neonAudio } from '../core/audioManager'
import { requirementsMet } from '../core/state'
import type { GameLocale, SceneHotspot, SceneId } from '../core/types'
import { dialogues } from '../data/dialogues'
import { scenes } from '../data/scenes'
import { GameStateProvider, useGameState } from '../hooks/GameStateProvider'
import { AcousticHackPanel } from './AcousticHackPanel'
import { CityMap } from './CityMap'
import { DialoguePanel } from './DialoguePanel'
import { GameHud } from './GameHud'
import { GraffitiCanvas } from './GraffitiCanvas'
import { OpeningSequence } from './OpeningSequence'
import { PauseMenu } from './PauseMenu'
import { SceneViewport } from './SceneViewport'
import '../game.css'

interface GameShellProps {
  locale: GameLocale
  onExit: () => void
}

type ModalId = 'graffiti' | 'acoustic' | 'map' | null

export default function GameShell(props: GameShellProps) {
  return <GameStateProvider><GameShellContent {...props} /></GameStateProvider>
}

function GameShellContent({ locale, onExit }: GameShellProps) {
  const { state, dispatch, saveStatus } = useGameState()
  const [mode, setMode] = useState<'opening' | 'playing'>(() => state.completedEvents.includes('hand-taken') ? 'playing' : 'opening')
  const [paused, setPaused] = useState(false)
  const [modal, setModal] = useState<ModalId>(null)
  const [notice, setNotice] = useState('')
  const [transition, setTransition] = useState<string | null>(null)
  const transitionTimer = useRef(0)
  const noticeTimer = useRef(0)
  const chapterCompletionSeen = useRef(state.completedEvents.includes('chapter-0-complete'))
  const scene = scenes[state.currentScene]
  const activeDialogue = state.activeDialogueId !== null
  const interactionLocked = paused || modal !== null || activeDialogue || transition !== null

  const showNotice = useCallback((text: string) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(text)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2800)
  }, [])

  const openDialogue = useCallback((dialogueId: string) => {
    const tree = dialogues[dialogueId]
    if (!tree) return
    dispatch({ type: 'OPEN_DIALOGUE', dialogueId, nodeId: tree.startNode })
  }, [dispatch])

  useEffect(() => {
    document.body.classList.add('neon-echoes-active')
    return () => document.body.classList.remove('neon-echoes-active')
  }, [])

  useEffect(() => {
    neonAudio.applySettings(state.settings)
    neonAudio.setScene(state.currentScene)
  }, [state.currentScene, state.settings])

  useEffect(() => {
    if (mode !== 'playing' || !scene.entryDialogue) return
    const marker = `entry-dialogue:${scene.id}`
    if (state.completedEvents.includes(marker)) return
    dispatch({ type: 'APPLY_EFFECTS', effects: { completeEvents: [marker] } })
    openDialogue(scene.entryDialogue)
  }, [dispatch, mode, openDialogue, scene.entryDialogue, scene.id, state.completedEvents])

  useEffect(() => {
    if (!activeDialogue && !chapterCompletionSeen.current && state.completedEvents.includes('chapter-0-complete')) {
      chapterCompletionSeen.current = true
      const timer = window.setTimeout(() => setModal('map'), 500)
      return () => window.clearTimeout(timer)
    }
  }, [activeDialogue, state.completedEvents])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setPaused(true)
        void neonAudio.suspend()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (modal) setModal(null)
        else setPaused((value) => !value)
      }
      if (event.key.toLowerCase() === 'm' && mode === 'playing' && !activeDialogue) {
        event.preventDefault()
        setModal((value) => value === 'map' ? null : 'map')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeDialogue, modal, mode])

  useEffect(() => () => {
    window.clearTimeout(transitionTimer.current)
    window.clearTimeout(noticeTimer.current)
    void neonAudio.destroy()
  }, [])

  const takeHand = useCallback(() => {
    void neonAudio.unlock(state.settings)
    dispatch({
      type: 'APPLY_EFFECTS',
      effects: {
        completeEvents: ['hand-taken'],
        unlockScenes: ['service-corridor'],
        relationship: { trust: 5, stress: 9 },
        mood: 'focused',
      },
    })
    setTransition(locale === 'zh' ? '正在突破现实边界' : 'BREACHING REALITY BOUNDARY')
    transitionTimer.current = window.setTimeout(() => {
      setMode('playing')
      setTransition(null)
      openDialogue('drone-alert')
      neonAudio.playCue('danger')
    }, state.settings.reducedMotion ? 120 : 850)
  }, [dispatch, locale, openDialogue, state.settings])

  const travelTo = useCallback((sceneId: SceneId) => {
    if (sceneId === state.currentScene) {
      setModal(null)
      return
    }
    const next = scenes[sceneId]
    if (!requirementsMet(state, next.worldStateRequirements)) {
      showNotice(locale === 'zh' ? '该城市节点尚未解锁。' : 'THAT CITY NODE IS STILL LOCKED.')
      return
    }
    setModal(null)
    setTransition(locale === 'zh' ? `正在进入：${next.title.zh}` : `ENTERING: ${next.title.en}`)
    transitionTimer.current = window.setTimeout(() => {
      dispatch({ type: 'APPLY_EFFECTS', effects: { unlockScenes: [sceneId] } })
      dispatch({ type: 'VISIT_SCENE', sceneId })
      setTransition(null)
      neonAudio.playCue('ui')
    }, state.settings.reducedMotion ? 80 : 620)
  }, [dispatch, locale, showNotice, state])

  const handleHotspot = useCallback((hotspot: SceneHotspot) => {
    if (interactionLocked) return
    if (hotspot.action === 'locked') {
      showNotice(hotspot.disabledText?.[locale] ?? hotspot.description[locale])
      neonAudio.playCue('graffiti-fail')
      return
    }
    if (hotspot.action === 'take-hand') {
      takeHand()
      return
    }
    if (hotspot.action.startsWith('exit:')) {
      travelTo(hotspot.action.slice(5) as SceneId)
      return
    }
    if (hotspot.action === 'collect-spray') {
      dispatch({
        type: 'APPLY_EFFECTS',
        effects: {
          completeEvents: ['spray-found'],
          addItems: ['spray-can'],
          unlockGraffiti: ['blind-eye'],
          relationship: { curiosity: 4 },
          mood: 'curious',
        },
      })
      neonAudio.playCue('collect')
      showNotice(locale === 'zh' ? '获得：RIN 喷漆 / 解锁：盲眼' : 'ACQUIRED: RIN SPRAY / UNLOCKED: BLIND EYE')
      openDialogue('graffiti-found')
      return
    }
    if (hotspot.action.startsWith('graffiti:')) {
      setModal('graffiti')
      return
    }
    if (hotspot.action.startsWith('hack:')) {
      setModal('acoustic')
      return
    }
    if (hotspot.action.startsWith('dialogue:')) {
      openDialogue(hotspot.action.slice(9))
      return
    }
    if (hotspot.action === 'open-map') {
      setModal('map')
      return
    }
    const eventId = hotspot.action === 'inspect-city' ? 'city-scanned' : hotspot.action === 'inspect-next-echo' ? 'relay-echo-heard' : hotspot.action
    dispatch({ type: 'APPLY_EFFECTS', effects: { completeEvents: [eventId] } })
    showNotice(hotspot.description[locale])
    neonAudio.playCue('ui')
  }, [dispatch, interactionLocked, locale, openDialogue, showNotice, takeHand, travelTo])

  const sceneClass = useMemo(() => [
    'ne-game',
    paused ? 'ne-game--paused' : '',
    state.settings.reducedMotion ? 'ne-game--reduced' : '',
    !state.settings.glitchEnabled ? 'ne-game--no-glitch' : '',
  ].filter(Boolean).join(' '), [paused, state.settings.glitchEnabled, state.settings.reducedMotion])

  return (
    <div className={sceneClass} aria-label={locale === 'zh' ? 'RIN 霓虹回声游戏' : 'RIN Neon Echoes game'}>
      {mode === 'opening' ? (
        <OpeningSequence locale={locale} scene={scenes['neon-balcony']} state={state} onTakeHand={takeHand} />
      ) : (
        <>
          <SceneViewport scene={scene} state={state} locale={locale} interactive={!interactionLocked} onHotspot={handleHotspot} />
          <GameHud
            locale={locale}
            scene={scene}
            state={state}
            saveStatus={saveStatus}
            onPause={() => setPaused(true)}
            onMap={() => setModal('map')}
            onSelectGraffiti={(graffitiId) => dispatch({ type: 'SELECT_GRAFFITI', graffitiId })}
          />
        </>
      )}

      {notice ? <div className="ne-notice" role="status">{notice}</div> : null}
      {transition ? <div className="ne-transition" role="status"><i /><span>{transition}</span><b /></div> : null}
      {activeDialogue && !paused ? <DialoguePanel locale={locale} onClose={() => undefined} /> : null}
      {modal === 'graffiti' && !paused ? <GraffitiCanvas locale={locale} graffitiId={state.selectedGraffiti} onClose={() => setModal(null)} onSuccess={() => {
        dispatch({
          type: 'APPLY_EFFECTS',
          effects: {
            completeEvents: ['camera-disabled', 'echo-mark-preview'],
            unlockScenes: ['signal-gate'],
            relationship: { trust: 5, stress: -3 },
            mood: 'focused',
          },
        })
        setModal(null)
        showNotice(locale === 'zh' ? '盲眼生效 / 监控节点离线' : 'BLIND EYE ACTIVE / WATCHER OFFLINE')
      }} /> : null}
      {modal === 'acoustic' && !paused ? <AcousticHackPanel locale={locale} onClose={() => setModal(null)} onSuccess={() => {
        dispatch({
          type: 'APPLY_EFFECTS',
          effects: {
            completeEvents: ['acoustic-gate-open'],
            unlockScenes: ['rin-safehouse'],
            relationship: { trust: 6, stress: -7 },
            mood: 'relieved',
          },
        })
        setModal(null)
        showNotice(locale === 'zh' ? '声学密钥同步 / 通道已开启' : 'ACOUSTIC KEY SYNCED / PASSAGE OPEN')
      }} /> : null}
      {modal === 'map' && !paused ? <CityMap locale={locale} state={state} onClose={() => setModal(null)} onTravel={travelTo} /> : null}
      {paused ? <PauseMenu locale={locale} onResume={() => {
        setPaused(false)
        void neonAudio.resume()
      }} onMap={() => {
        setPaused(false)
        setModal('map')
      }} onExit={onExit} onRestart={() => {
        setPaused(false)
        setModal(null)
        setMode('opening')
      }} /> : null}
    </div>
  )
}
