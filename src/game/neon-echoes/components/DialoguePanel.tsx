import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { neonAudio } from '../core/audioManager'
import { requirementsMet } from '../core/state'
import type { DialogueChoice, GameLocale } from '../core/types'
import { dialogues } from '../data/dialogues'
import { useGameState } from '../hooks/GameStateProvider'

const speedMs = { slow: 46, normal: 28, fast: 14, instant: 0 } as const

interface DialoguePanelProps {
  locale: GameLocale
  onClose: () => void
}

export function DialoguePanel({ locale, onClose }: DialoguePanelProps) {
  const { state, dispatch } = useGameState()
  const [textState, setTextState] = useState({ key: '', text: '' })
  const [historyOpen, setHistoryOpen] = useState(false)
  const tree = state.activeDialogueId ? dialogues[state.activeDialogueId] : null
  const node = tree && state.activeDialogueNodeId ? tree.nodes[state.activeDialogueNodeId] : null
  const fullText = node?.text[locale] ?? ''
  const textKey = `${tree?.id ?? ''}:${node?.id ?? ''}:${locale}:${state.settings.textSpeed}`
  const displayedText = state.settings.textSpeed === 'instant'
    ? fullText
    : textState.key === textKey ? textState.text : ''
  const choices = useMemo(() => (node?.choices ?? []).filter((choice) => requirementsMet(state, choice.condition)), [node?.choices, state])
  const complete = displayedText === fullText

  useEffect(() => {
    if (!tree || !node) return
    dispatch({
      type: 'ADD_DIALOGUE_HISTORY',
      entry: { id: `${tree.id}:${node.id}`, speaker: node.speaker, text: node.text },
    })
    if (node.effects) dispatch({ type: 'APPLY_EFFECTS_ONCE', id: `dialogue:${tree.id}:${node.id}`, effects: node.effects })
    neonAudio.playCue('dialogue')
  }, [dispatch, node, tree])

  useEffect(() => {
    if (!fullText) return
    const delay = speedMs[state.settings.textSpeed]
    if (delay === 0) return
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTextState({ key: textKey, text: fullText.slice(0, index) })
      if (index >= fullText.length) window.clearInterval(timer)
    }, delay)
    return () => window.clearInterval(timer)
  }, [fullText, state.settings.textSpeed, textKey])

  if (!tree || !node) return null

  const goTo = (next: string | null) => {
    if (next) dispatch({ type: 'SET_DIALOGUE_NODE', nodeId: next })
    else {
      dispatch({ type: 'CLOSE_DIALOGUE' })
      onClose()
    }
  }

  const choose = (choice: DialogueChoice) => {
    if (choice.effects) dispatch({ type: 'APPLY_EFFECTS_ONCE', id: `choice:${tree.id}:${node.id}:${choice.id}`, effects: choice.effects })
    goTo(choice.next)
  }

  const continueDialogue = () => {
    if (!complete) {
      setTextState({ key: textKey, text: fullText })
      return
    }
    if (choices.length === 0) goTo(node.next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      continueDialogue()
    }
  }

  return (
    <aside className="ne-dialogue" aria-label={locale === 'zh' ? '剧情对话' : 'Story dialogue'} onKeyDown={onKeyDown} tabIndex={-1}>
      <div className="ne-dialogue__signal"><i /> DUAL LINK / {state.relationship.currentMood.toUpperCase()}</div>
      <button type="button" className="ne-dialogue__history-toggle" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
        {locale === 'zh' ? '记录' : 'LOG'}
      </button>
      <div className="ne-dialogue__speaker"><span>{node.speaker}</span><small>{node.emotion.toUpperCase()}</small></div>
      <p className="ne-dialogue__text" aria-live="polite">{displayedText}<i aria-hidden="true" /></p>
      {!complete ? (
        <button type="button" className="ne-dialogue__continue" onClick={continueDialogue}>{locale === 'zh' ? '显示全部' : 'REVEAL TEXT'}</button>
      ) : choices.length > 0 ? (
        <div className="ne-dialogue__choices">
          {choices.map((choice, index) => (
            <button key={choice.id} type="button" onClick={() => choose(choice)}><span>{String(index + 1).padStart(2, '0')}</span>{choice.text[locale]}</button>
          ))}
        </div>
      ) : (
        <button type="button" className="ne-dialogue__continue" onClick={() => goTo(node.next)}>{node.next ? (locale === 'zh' ? '继续' : 'CONTINUE') : (locale === 'zh' ? '关闭频道' : 'CLOSE CHANNEL')}</button>
      )}
      <span className="ne-dialogue__hint">ENTER / SPACE</span>

      {historyOpen ? (
        <div className="ne-dialogue__history" aria-label={locale === 'zh' ? '对话历史' : 'Dialogue history'}>
          {state.dialogueHistory.map((entry) => <p key={entry.id}><strong>{entry.speaker}</strong>{entry.text[locale]}</p>)}
        </div>
      ) : null}
    </aside>
  )
}
