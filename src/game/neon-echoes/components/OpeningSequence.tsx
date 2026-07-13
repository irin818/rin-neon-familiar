import { useEffect, useState } from 'react'
import type { GameLocale, GameScene, WorldState } from '../core/types'
import { SceneViewport } from './SceneViewport'

interface OpeningSequenceProps {
  locale: GameLocale
  scene: GameScene
  state: WorldState
  onTakeHand: () => void
}

export function OpeningSequence({ locale, scene, state, onTakeHand }: OpeningSequenceProps) {
  const [phase, setPhase] = useState<'scan' | 'ready' | 'pull'>('scan')
  const reduced = state.settings.reducedMotion

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('ready'), reduced ? 100 : 1250)
    return () => window.clearTimeout(timer)
  }, [reduced])

  const takeHand = () => {
    if (phase !== 'ready') return
    setPhase('pull')
    onTakeHand()
  }

  return (
    <div className={`ne-opening ne-opening--${phase}`}>
      <SceneViewport scene={scene} state={state} locale={locale} interactive={false} onHotspot={() => undefined} />
      <div className="ne-opening__shade" aria-hidden="true" />
      <div className="ne-opening__scan" aria-live="polite">
        <span>RIN: NEON ECHOES</span>
        <strong>{phase === 'scan' ? (locale === 'zh' ? '正在扫描城市信号' : 'SCANNING CITY SIGNAL') : (locale === 'zh' ? '连接已建立' : 'CONNECTION ESTABLISHED')}</strong>
        <i><b /></i>
      </div>
      {phase !== 'scan' ? (
        <button type="button" className="ne-opening__hand" onClick={takeHand} disabled={phase === 'pull'}>
          <span>{locale === 'zh' ? '抓住她的手' : 'TAKE HER HAND'}</span>
          <small>{locale === 'zh' ? '点击进入霓虹都市' : 'CLICK TO ENTER NEON CITY'}</small>
        </button>
      ) : null}
      <p className="ne-opening__chapter">CHAPTER 0<br /><b>{locale === 'zh' ? '抓住我的手' : 'TAKE MY HAND'}</b></p>
    </div>
  )
}
