import { useRef, useState, type PointerEvent } from 'react'
import { heroImage } from '../data/stories'
import type { Locale } from './Header'
import { ArrowDownIcon, ChevronRightIcon, WaveformIcon } from './Icons'

interface HeroProps {
  locale: Locale
}

export function Hero({ locale }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [synced, setSynced] = useState(false)

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    sectionRef.current?.style.setProperty('--hero-x', `${x * 7}px`)
    sectionRef.current?.style.setProperty('--hero-y', `${y * 5}px`)
  }

  const copy = locale === 'zh'
    ? {
        headingBefore: '与',
        headingAfter: '同频',
        body: '连接霓虹城的失落频道，和她一起完成今晚的信号任务。',
        primary: '进入频道',
        secondary: '查看档案',
        scroll: '向下进入系统',
        artAlt: 'RIN 在霓虹城市天台向访客伸出手',
        syncOn: '同步 RIN 频道',
        syncOff: '断开频道同步',
        scrollLabel: '滚动到双生故事',
        statusLabel: '系统状态',
      }
    : {
        headingBefore: 'SYNC',
        headingAfter: 'NOW',
        body: 'Reconnect the lost channel of Neon City and complete tonight’s signal mission together.',
        primary: 'ENTER CHANNEL',
        secondary: 'OPEN ARCHIVE',
        scroll: 'SCROLL TO BOOT',
        artAlt: 'RIN reaches toward the visitor from a neon city rooftop',
        syncOn: 'Sync the RIN channel',
        syncOff: 'Disconnect channel sync',
        scrollLabel: 'Scroll to the dual story',
        statusLabel: 'System status',
      }

  return (
    <section
      ref={sectionRef}
      id="home"
      className={`hero ${synced ? 'hero--synced' : ''}`}
      aria-labelledby="hero-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        sectionRef.current?.style.setProperty('--hero-x', '0px')
        sectionRef.current?.style.setProperty('--hero-y', '0px')
      }}
    >
      <div className="hero__image-wrap">
        <img
          className="hero__image"
          src={heroImage}
          alt={copy.artAlt}
          width="1254"
          height="1254"
          fetchPriority="high"
        />
      </div>
      <div className="hero__grid" aria-hidden="true" />

      <aside className="hero__vertical-rail" aria-hidden="true">
        <span>ENTER THE NIGHT / FOLLOW THE SIGNAL</span>
        <i />
      </aside>

      <div className="hero__content">
        <p className="hero__identity">RIN · NEON FAMILIAR</p>
        <h1 id="hero-title">
          <span>{copy.headingBefore}</span>
          <em>RIN</em>
          <span>{copy.headingAfter}</span>
        </h1>
        <p className="hero__body">{copy.body}</p>
        <div className="hero__actions">
          <a className="button button--primary" href="#story">
            <span>{copy.primary}</span><ChevronRightIcon />
          </a>
          <a className="button button--ghost" href="#archive">
            <span>{copy.secondary}</span><ChevronRightIcon />
          </a>
        </div>
      </div>

      <button
        type="button"
        className="sync-core"
        onClick={() => setSynced((value) => !value)}
        aria-pressed={synced}
        aria-label={synced ? copy.syncOff : copy.syncOn}
      >
        <span className="sync-core__ring sync-core__ring--outer" aria-hidden="true" />
        <span className="sync-core__ring sync-core__ring--inner" aria-hidden="true" />
        <span className="sync-core__center"><WaveformIcon /></span>
        <strong>{synced ? 'SYNCED' : 'TAP TO SYNC'}</strong>
      </button>

      <a className="scroll-cue" href="#story" aria-label={copy.scrollLabel}>
        <span>{copy.scroll}</span>
        <ArrowDownIcon />
      </a>

      <div className="hero__status" aria-label={copy.statusLabel}>
        <span><i className="status-dot status-dot--green" />SIGNAL ONLINE <b>///</b></span>
        <span><i className="status-dot status-dot--violet" />NIGHT MODE <b>///</b></span>
        <span><i className={`status-dot ${synced ? 'status-dot--green' : ''}`} />{synced ? 'SYNC LOCKED' : 'SYNC READY'} <b>///</b></span>
      </div>
    </section>
  )
}
