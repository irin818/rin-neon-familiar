import { useMemo, useState } from 'react'
import { neonAudio } from '../core/audioManager'
import type { GameLocale } from '../core/types'
import { ACOUSTIC_TARGET, computeSyncError, isAcousticSyncComplete, waveformPath } from '../systems/acoustic'

interface AcousticHackPanelProps {
  locale: GameLocale
  onSuccess: () => void
  onClose: () => void
}

export function AcousticHackPanel({ locale, onSuccess, onClose }: AcousticHackPanelProps) {
  const [frequency, setFrequency] = useState(42)
  const [phase, setPhase] = useState(68)
  const [attempted, setAttempted] = useState(false)
  const error = computeSyncError(frequency, phase)
  const livePath = useMemo(() => waveformPath(frequency, phase), [frequency, phase])
  const targetPath = useMemo(() => waveformPath(ACOUSTIC_TARGET.frequency, ACOUSTIC_TARGET.phase), [])
  const ready = isAcousticSyncComplete(frequency, phase)

  const adjust = (kind: 'frequency' | 'phase', amount: number) => {
    setAttempted(false)
    if (kind === 'frequency') setFrequency((value) => Math.max(0, Math.min(100, value + amount)))
    else setPhase((value) => Math.max(0, Math.min(100, value + amount)))
    neonAudio.playCue('ui')
  }

  const submit = () => {
    setAttempted(true)
    if (ready) {
      neonAudio.playCue('sync')
      window.setTimeout(onSuccess, 500)
    } else neonAudio.playCue('graffiti-fail')
  }

  return (
    <div className="ne-modal ne-acoustic" role="dialog" aria-modal="true" aria-labelledby="acoustic-title">
      <div className="ne-modal__header">
        <div><span>CHAPTER 0 / ACOUSTIC KEY</span><h2 id="acoustic-title">{locale === 'zh' ? '信号门' : 'SIGNAL GATE'}</h2></div>
        <button type="button" onClick={onClose} aria-label={locale === 'zh' ? '关闭声音黑客界面' : 'Close acoustic hacking'}>ESC</button>
      </div>
      <p>{locale === 'zh' ? '调整两个参数，使绿色波形接近粉色目标。误差低于 8% 即可打开通道。' : 'Tune both parameters until the green wave meets the pink target. Error below 8% opens the gate.'}</p>
      <div className="ne-acoustic__scope" aria-label={`${locale === 'zh' ? '当前同步误差' : 'Current sync error'} ${error}%`}>
        <svg viewBox="0 0 680 170" role="img" aria-label={locale === 'zh' ? '实时与目标波形' : 'Live and target waveforms'}>
          <path className="ne-acoustic__grid" d="M0 42.5H680M0 85H680M0 127.5H680M170 0V170M340 0V170M510 0V170" />
          <path className="ne-acoustic__target" d={targetPath} />
          <path className="ne-acoustic__live" d={livePath} />
        </svg>
        <strong>SYNC ERROR <b>{error}%</b></strong>
      </div>
      <div className="ne-acoustic__controls">
        <ParameterControl locale={locale} label={locale === 'zh' ? '频率' : 'FREQUENCY'} value={frequency} onChange={setFrequency} onAdjust={(amount) => adjust('frequency', amount)} />
        <ParameterControl locale={locale} label={locale === 'zh' ? '相位' : 'PHASE'} value={phase} onChange={setPhase} onAdjust={(amount) => adjust('phase', amount)} />
      </div>
      <button type="button" className={`ne-acoustic__submit ${ready ? 'is-ready' : ''}`} onClick={submit}>{locale === 'zh' ? '同步信号门' : 'SYNC GATE'}</button>
      <div className="ne-acoustic__feedback" aria-live="polite">
        {attempted ? (ready ? (locale === 'zh' ? '同步成功 / 通道开启' : 'SYNC COMPLETE / GATE OPEN') : (locale === 'zh' ? '波形仍未对齐' : 'WAVEFORMS NOT YET ALIGNED')) : (locale === 'zh' ? 'RIN：稳住，慢慢调整。' : 'RIN: KEEP IT STEADY.')}
      </div>
    </div>
  )
}

function ParameterControl({ locale, label, value, onChange, onAdjust }: { locale: GameLocale; label: string; value: number; onChange: (value: number) => void; onAdjust: (amount: number) => void }) {
  return (
    <div className="ne-parameter">
      <label htmlFor={`ne-${label}`}>{label}<strong>{value}</strong></label>
      <div><button type="button" onClick={() => onAdjust(-2)} aria-label={`${locale === 'zh' ? '减少' : 'Decrease'} ${label}`}>−</button><input id={`ne-${label}`} type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} /><button type="button" onClick={() => onAdjust(2)} aria-label={`${locale === 'zh' ? '增加' : 'Increase'} ${label}`}>＋</button></div>
    </div>
  )
}
