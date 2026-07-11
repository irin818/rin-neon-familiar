import { useState, type CSSProperties } from 'react'
import { arcadeImage } from '../data/stories'
import type { Locale } from './Header'

type HotspotId = 'rin' | 'live' | 'signal'

const hotspots: readonly { id: HotspotId; label: string; x: string; y: string }[] = [
  { id: 'live', label: 'LIVE WINDOW', x: '77%', y: '28%' },
  { id: 'rin', label: 'RIN CHANNEL', x: '49%', y: '48%' },
  { id: 'signal', label: 'RABBIT SIGNAL', x: '26%', y: '69%' },
]

interface ArchiveRoomProps {
  locale: Locale
}

export function ArchiveRoom({ locale }: ArchiveRoomProps) {
  const [active, setActive] = useState<HotspotId>('rin')
  const content = locale === 'zh'
    ? {
        title: '直播回路',
        intro: '点击画面中的信号节点，读取 RIN 的直播场景与频道设定。',
        imageAlt: 'RIN 站在兔兔信号与直播界面环绕的霓虹舞台',
        selectorLabel: '档案信号节点',
        rin: { title: 'RIN CHANNEL', text: '黑绿频道的核心。耳机、猫耳与酸性荧光构成她在不同场景中的稳定识别信号。' },
        live: { title: 'LIVE WINDOW', text: '直播窗口把访客的回应带入场景。网页中的对话选择会像弹幕一样改变当前频道。' },
        signal: { title: 'RABBIT SIGNAL', text: '兔兔图形只是无对白的信号载体：绿色、粉色与双生三类，稍后会成为游戏节拍。' },
      }
    : {
        title: 'LIVE CIRCUIT',
        intro: 'Select a signal node to inspect RIN’s broadcast space and channel language.',
        imageAlt: 'RIN stands on a neon stage surrounded by rabbit signals and live broadcast panels',
        selectorLabel: 'Archive signal nodes',
        rin: { title: 'RIN CHANNEL', text: 'The black-and-green channel core. Headphones, cat ears and acid light keep her identity consistent across scenes.' },
        live: { title: 'LIVE WINDOW', text: 'The broadcast window carries visitor responses into the scene. Dialogue choices alter the active channel like live chat.' },
        signal: { title: 'RABBIT SIGNAL', text: 'Rabbit marks are silent signal carriers only: green, pink and dual. They become the rhythm cues in the game.' },
      }
  const detail = content[active]

  return (
    <section id="archive" className="archive-section" aria-labelledby="archive-title">
      <div className="archive-stage">
        <div className="archive-stage__image">
          <img src={arcadeImage} alt={content.imageAlt} width="1055" height="1491" loading="lazy" />
          <span className="archive-stage__fade" aria-hidden="true" />
          {hotspots.map((spot, index) => (
            <button
              key={spot.id}
              type="button"
              className={`hotspot ${active === spot.id ? 'is-active' : ''}`}
              style={{ '--hotspot-x': spot.x, '--hotspot-y': spot.y } as CSSProperties}
              aria-label={spot.label}
              aria-pressed={active === spot.id}
              onClick={() => setActive(spot.id)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{spot.label}</strong>
            </button>
          ))}
        </div>

        <div className="archive-copy">
          <span className="section-number">02 / ARCHIVE</span>
          <h2 id="archive-title">{content.title}</h2>
          <p className="archive-copy__intro">{content.intro}</p>
          <div className="archive-readout" aria-live="polite">
            <span>NODE / {hotspots.findIndex((spot) => spot.id === active) + 1}</span>
            <h3>{detail.title}</h3>
            <p>{detail.text}</p>
          </div>
          <div className="archive-selector" role="group" aria-label={content.selectorLabel}>
            {hotspots.map((spot, index) => (
              <button key={spot.id} type="button" className={active === spot.id ? 'is-active' : ''} onClick={() => setActive(spot.id)} aria-pressed={active === spot.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>{spot.label}
              </button>
            ))}
          </div>
          <a className="text-link" href="#game">NEXT / SIGNAL GAME <span aria-hidden="true">↘</span></a>
        </div>
      </div>
    </section>
  )
}
