import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { dualImage } from '../data/stories'
import {
  advanceGame,
  applyInput,
  createGameState,
  type GameState,
  type SignalAction,
} from '../game/engine'
import type { Locale } from './Header'
import { PauseIcon, PlayIcon, SoundIcon, WaveformIcon } from './Icons'

type UiPhase = 'idle' | 'countdown' | 'playing' | 'paused' | 'results'

const APPEAR_AHEAD_MS = 1_600
const BEST_SCORE_KEY = 'rin-dual-link-best'
function readBestScore() {
  try {
    const parsed = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0)
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0
  } catch {
    return 0
  }
}

function storeBestScore(score: number) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // The game remains fully playable when storage is unavailable.
  }
}

interface SignalGameProps {
  locale: Locale
}

export function SignalGame({ locale }: SignalGameProps) {
  const [uiPhase, setUiPhase] = useState<UiPhase>('idle')
  const [countdown, setCountdown] = useState(3)
  const [tolerant, setTolerant] = useState(false)
  const [sequenceMode, setSequenceMode] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [game, setGame] = useState<GameState>(() => createGameState())
  const [bestScore, setBestScore] = useState(readBestScore)
  const shellRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef(game)
  const originRef = useRef(0)
  const resumeRef = useRef(false)
  const rafRef = useRef(0)
  const lastPaintRef = useRef(0)
  const audioRef = useRef<AudioContext | null>(null)

  const copy = locale === 'zh'
    ? {
        title: '双生信号',
        intro: '在兔兔信号抵达核心时完成同步。绿色、粉色与双生频道将依次接入。',
        start: '启动链路',
        help: 'A / ← 绿频　 D / → 粉频　 SPACE 双生',
        assist: '辅助判定（更宽的时间窗口）',
        sequence: '顺序模式（无计时，逐个信号）',
        pause: '暂停链路',
        resume: '继续校准',
        restart: '再次同步',
        back: '返回档案',
        frozenTitle: '链路已冻结',
        stableTitle: '双生直播稳定',
        unstableTitle: '信号需要重连',
        accuracy: '同步率',
        maxCombo: '最高连击',
        score: '得分',
        green: '绿频',
        dual: '双生',
        pink: '粉频',
        sequenceHint: '选择当前信号对应的按钮，没有时间限制。',
        sequenceMode: 'SEQUENCE MODE / 无计时顺序模式',
        gameLabel: 'RIN 双生信号游戏',
        soundOff: '关闭游戏音效',
        soundOn: '开启游戏音效',
        fieldLabel: '双生信号游戏区域',
        touchLabel: '触屏游戏控制',
        artAlt: '黑绿与粉色双生 RIN 在霓虹直播间',
        assistMode: 'ASSIST MODE / 辅助判定',
      }
    : {
        title: 'DUAL SIGNAL',
        intro: 'Sync each rabbit signal as it reaches the core. Green, pink and dual channels arrive in sequence.',
        start: 'START LINK',
        help: 'A / ← GREEN　 D / → PINK　 SPACE DUAL',
        assist: 'ASSIST TIMING WINDOW',
        sequence: 'SEQUENCE MODE (UNTIMED SIGNALS)',
        pause: 'PAUSE LINK',
        resume: 'RESUME CALIBRATION',
        restart: 'SYNC AGAIN',
        back: 'BACK TO ARCHIVE',
        frozenTitle: 'LINK FROZEN',
        stableTitle: 'DUAL STREAM STABLE',
        unstableTitle: 'SIGNAL NEEDS RECONNECTING',
        accuracy: 'SYNC RATE',
        maxCombo: 'MAX COMBO',
        score: 'SCORE',
        green: 'GREEN',
        dual: 'DUAL',
        pink: 'PINK',
        sequenceHint: 'Choose the button matching the current signal. There is no timer.',
        sequenceMode: 'SEQUENCE MODE / UNTIMED',
        gameLabel: 'RIN dual signal game',
        soundOff: 'Turn game sound off',
        soundOn: 'Turn game sound on',
        fieldLabel: 'Dual signal game field',
        touchLabel: 'Touch game controls',
        artAlt: 'Green and pink twin RIN characters in a neon streaming room',
        assistMode: 'ASSIST MODE',
      }

  const feedbackLabels = locale === 'zh'
    ? {
        perfect: 'PERFECT · 完美同步',
        good: 'GOOD · 信号接入',
        ok: 'OK · 勉强稳定',
        miss: 'MISS · 信号丢失',
        noise: 'NO SIGNAL · 频道错误',
      }
    : {
        perfect: 'PERFECT · SIGNAL SYNCED',
        good: 'GOOD · SIGNAL LINKED',
        ok: 'OK · LINK HOLDING',
        miss: 'MISS · SIGNAL LOST',
        noise: 'NO SIGNAL · WRONG CHANNEL',
      }

  useEffect(() => {
    gameRef.current = game
  }, [game])

  const playTone = useCallback((action: SignalAction, success: boolean) => {
    if (!soundOn) return
    const context = audioRef.current?.state === 'closed'
      ? new AudioContext()
      : audioRef.current ?? new AudioContext()
    audioRef.current = context
    const emitTone = () => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = success ? 'sine' : 'sawtooth'
      oscillator.frequency.value = success
        ? action === 'green' ? 220 : action === 'pink' ? 330 : 275
        : 105
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.2)
    }

    if (context.state === 'suspended') {
      void context.resume().then(emitTone).catch(() => setSoundOn(false))
    } else {
      emitTone()
    }
  }, [soundOn])

  const beginCountdown = useCallback((resume = false) => {
    resumeRef.current = resume
    if (!resume) {
      const fresh = createGameState({ tolerant })
      gameRef.current = fresh
      setGame(fresh)
    }
    setCountdown(3)
    setUiPhase('countdown')
  }, [tolerant])

  useEffect(() => {
    if (uiPhase !== 'countdown') return
    let value = 3
    const timer = window.setInterval(() => {
      value -= 1
      if (value <= 0) {
        window.clearInterval(timer)
        originRef.current = performance.now() - (resumeRef.current ? gameRef.current.elapsedMs : 0)
        setUiPhase('playing')
      } else {
        setCountdown(value)
      }
    }, 800)
    return () => window.clearInterval(timer)
  }, [uiPhase])

  useEffect(() => {
    if (uiPhase !== 'playing' || sequenceMode) return

    const tick = (now: number) => {
      const elapsed = Math.max(gameRef.current.elapsedMs, now - originRef.current)
      const next = advanceGame(gameRef.current, elapsed)
      gameRef.current = next
      if (now - lastPaintRef.current > 33 || next.phase === 'results') {
        lastPaintRef.current = now
        setGame(next)
      }
      if (next.phase === 'results') {
        const score = next.result?.score ?? 0
        setBestScore((current) => {
          const best = Math.max(current, score)
          storeBestScore(best)
          return best
        })
        setUiPhase('results')
        return
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafRef.current)
  }, [sequenceMode, uiPhase])

  const triggerInput = useCallback((action: SignalAction) => {
    if (uiPhase !== 'playing') return
    const sequentialNote = sequenceMode
      ? gameRef.current.notes.find((note) => note.judgement === null)
      : null
    if (sequenceMode && !sequentialNote) return
    const elapsed = sequentialNote
      ? Math.max(gameRef.current.elapsedMs, sequentialNote.atMs)
      : Math.max(gameRef.current.elapsedMs, performance.now() - originRef.current)
    const next = applyInput(gameRef.current, action, elapsed)
    const hit = next.lastFeedback?.judgement
    playTone(action, hit !== 'miss' && hit !== 'noise')
    gameRef.current = next
    setGame(next)
    if (next.phase === 'results') {
      const score = next.result?.score ?? 0
      setBestScore((current) => {
        const best = Math.max(current, score)
        storeBestScore(best)
        return best
      })
      setUiPhase('results')
    }
  }, [playTone, sequenceMode, uiPhase])

  useEffect(() => {
    if (uiPhase === 'playing') shellRef.current?.focus()
  }, [uiPhase])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (uiPhase !== 'playing' || event.repeat) return
    if ((event.target as HTMLElement).closest('button, input, a, label')) return
    const key = event.key.toLowerCase()
    const action: SignalAction | null = key === 'a' || key === 'arrowleft'
      ? 'green'
      : key === 'd' || key === 'arrowright'
        ? 'pink'
        : key === ' ' || key === 'spacebar'
          ? 'dual'
          : null
    if (!action) return
    event.preventDefault()
    triggerInput(action)
  }

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && (uiPhase === 'playing' || uiPhase === 'countdown')) setUiPhase('paused')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [uiPhase])

  useEffect(() => () => {
    window.cancelAnimationFrame(rafRef.current)
    void audioRef.current?.close()
  }, [])

  const judgedCount = game.notes.filter((note) => note.judgement !== null).length
  const progress = sequenceMode
    ? (judgedCount / game.notes.length) * 100
    : Math.min(100, (game.elapsedMs / 25_250) * 100)
  const result = game.result
  const feedback = game.lastFeedback?.judgement
  const sequenceSignal = sequenceMode
    ? game.notes.find((note) => note.judgement === null)
    : null

  return (
    <section id="game" className="game-section" aria-labelledby="game-title">
      <div className="section-heading game-section__heading">
        <span className="section-number">03 / SIGNAL GAME</span>
        <div>
          <h2 id="game-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
      </div>

      <div
        ref={shellRef}
        className={`game-shell game-shell--${uiPhase}`}
        tabIndex={-1}
        aria-label={copy.gameLabel}
        onKeyDown={handleKeyDown}
      >
        <img className="game-shell__art" src={dualImage} alt={copy.artAlt} width="1536" height="1024" loading="lazy" />
        <span className="game-shell__edge" aria-hidden="true" />

        <div className="game-hud">
          <div><span>SCORE</span><strong>{String(game.score).padStart(4, '0')}</strong></div>
          <div><span>COMBO</span><strong>×{game.combo}</strong></div>
          <div><span>BEST</span><strong>{String(bestScore).padStart(4, '0')}</strong></div>
          <button type="button" className="game-sound" onClick={() => setSoundOn((value) => !value)} aria-pressed={soundOn} aria-label={soundOn ? copy.soundOff : copy.soundOn}><SoundIcon muted={!soundOn} /></button>
          {uiPhase === 'playing' ? <button type="button" className="game-pause" onClick={() => setUiPhase('paused')} aria-label={copy.pause}><PauseIcon /></button> : null}
        </div>

        <div
          className="game-progress"
          role="progressbar"
          aria-label={locale === 'zh' ? '关卡进度' : 'LEVEL PROGRESS'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        ><span style={{ width: `${progress}%` }} /></div>

        {(uiPhase === 'playing' || uiPhase === 'paused' || uiPhase === 'countdown') ? (
          <div className="signal-field" aria-label={copy.fieldLabel}>
            <div className="signal-lane signal-lane--green"><span>GREEN / A</span></div>
            <div className="signal-lane signal-lane--dual"><span>DUAL / SPACE</span></div>
            <div className="signal-lane signal-lane--pink"><span>PINK / D</span></div>
            <div className="target-line" aria-hidden="true"><i /><WaveformIcon /><i /></div>
            {sequenceSignal ? (
              <div className={`sequence-prompt sequence-prompt--${sequenceSignal.action}`} role="status" aria-live="assertive">
                <span>NEXT SIGNAL / {String(judgedCount + 1).padStart(2, '0')}</span>
                <strong>{sequenceSignal.action === 'green' ? `G · ${copy.green}` : sequenceSignal.action === 'pink' ? `P · ${copy.pink}` : `∞ · ${copy.dual}`}</strong>
                <small>{copy.sequenceHint}</small>
              </div>
            ) : null}
            {!sequenceMode ? game.notes.map((note) => {
              const delta = note.atMs - game.elapsedMs
              if (note.judgement !== null || delta > APPEAR_AHEAD_MS || delta < -450) return null
              const noteProgress = Math.max(0, Math.min(1.18, (APPEAR_AHEAD_MS - delta) / APPEAR_AHEAD_MS))
              const isNear = Math.abs(delta) <= 450
              const noteNumber = Number(note.id.slice(-2))
              return (
                <span
                  key={note.id}
                  className={`signal-note signal-note--${note.action} ${isNear ? 'is-near' : ''}`}
                  style={{
                    '--note-progress': noteProgress,
                    '--note-top': `${9 + noteProgress * 70}%`,
                    '--reduced-top': isNear ? '72%' : `${18 + (noteNumber % 4) * 11}%`,
                  } as CSSProperties}
                  aria-hidden="true"
                >
                  {note.action === 'green' ? 'G' : note.action === 'pink' ? 'P' : '∞'}
                  <small>{delta > 450 ? Math.max(1, Math.ceil(delta / 1000)) : 'NOW'}</small>
                </span>
              )
            }) : null}
            {feedback ? <div key={`${feedback}-${game.lastFeedback?.atMs}`} className={`game-feedback game-feedback--${feedback} ${sequenceMode ? 'game-feedback--sequence' : ''}`} role="status" aria-live="polite">{feedbackLabels[feedback]}</div> : null}
          </div>
        ) : null}

        {uiPhase === 'idle' ? (
          <div className="game-overlay game-overlay--intro">
            <span>RIN // DUAL LINK</span>
            <h3>{copy.title}</h3>
            <p>{copy.intro}</p>
            <button type="button" className="button button--primary" onClick={() => beginCountdown(false)}><PlayIcon /><span>{copy.start}</span></button>
            <p className="control-help">{copy.help}</p>
            <div className="game-mode-options">
              <label className="assist-toggle"><input type="checkbox" checked={tolerant} onChange={(event) => setTolerant(event.target.checked)} /><span>{copy.assist}</span></label>
              <label className="assist-toggle"><input type="checkbox" checked={sequenceMode} onChange={(event) => setSequenceMode(event.target.checked)} /><span>{copy.sequence}</span></label>
            </div>
          </div>
        ) : null}

        {uiPhase === 'countdown' ? <div className="game-overlay game-overlay--countdown" aria-live="assertive"><span>CALIBRATING</span><strong>{countdown}</strong></div> : null}

        {uiPhase === 'paused' ? (
          <div className="game-overlay game-overlay--paused" aria-live="polite">
            <span>LINK FROZEN</span><h3>{copy.frozenTitle}</h3>
            <button type="button" className="button button--primary" onClick={() => beginCountdown(true)}><PlayIcon /><span>{copy.resume}</span></button>
          </div>
        ) : null}

        {uiPhase === 'results' && result ? (
          <div className="game-overlay game-overlay--results" aria-live="polite">
            <span>{result.outcome === 'stable' ? 'SYNC COMPLETE' : 'SIGNAL UNSTABLE'}</span>
            <strong className={`result-grade result-grade--${result.grade.toLowerCase()}`}>{result.grade}</strong>
            <h3>{result.outcome === 'stable' ? copy.stableTitle : copy.unstableTitle}</h3>
            <dl><div><dt>{copy.accuracy}</dt><dd>{result.accuracy}%</dd></div><div><dt>{copy.maxCombo}</dt><dd>×{result.maxCombo}</dd></div><div><dt>{copy.score}</dt><dd>{result.score} / {result.maxScore}</dd></div></dl>
            {result.tolerant ? <small>{copy.assistMode}</small> : null}
            {sequenceMode ? <small>{copy.sequenceMode}</small> : null}
            <div className="result-actions"><button type="button" className="button button--primary" onClick={() => beginCountdown(false)}>{copy.restart}</button><a className="button button--ghost" href="#archive">{copy.back}</a></div>
          </div>
        ) : null}

        {uiPhase === 'playing' ? (
          <div className="touch-controls" aria-label={copy.touchLabel}>
            <button type="button" onClick={() => triggerInput('green')}><span>A</span>{copy.green}</button>
            <button type="button" onClick={() => triggerInput('dual')}><span>∞</span>{copy.dual}</button>
            <button type="button" onClick={() => triggerInput('pink')}><span>D</span>{copy.pink}</button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
