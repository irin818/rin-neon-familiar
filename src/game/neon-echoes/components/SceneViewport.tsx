import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { requirementsMet } from '../core/state'
import type { GameLocale, GameScene, SceneHotspot, WorldState } from '../core/types'
import { CrosshairIcon } from './GameIcons'

const rainDrops = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  x: (index * 47) % 101,
  delay: -((index * 0.17) % 2.4),
  duration: 0.9 + (index % 7) * 0.13,
}))

interface SceneViewportProps {
  scene: GameScene
  state: WorldState
  locale: GameLocale
  interactive?: boolean
  onHotspot: (hotspot: SceneHotspot) => void
}

export function SceneViewport({ scene, state, locale, interactive = true, onHotspot }: SceneViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointerDown = useRef(false)
  const [imageFailed, setImageFailed] = useState(false)

  const visibleHotspots = useMemo(() => scene.hotspots.filter((hotspot) => {
    const completedMissing = hotspot.requirement?.missingEvents?.some((event) => state.completedEvents.includes(event))
    if (completedMissing) return false
    if (hotspot.id === 'hidden-echo' && !requirementsMet(state, hotspot.requirement)) return false
    return true
  }), [scene.hotspots, state])

  const setCamera = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' && !pointerDown.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    viewportRef.current?.style.setProperty('--camera-x', x.toFixed(3))
    viewportRef.current?.style.setProperty('--camera-y', y.toFixed(3))
  }

  return (
    <div
      ref={viewportRef}
      className={`ne-scene ${imageFailed ? 'ne-scene--fallback' : ''}`}
      onPointerDown={(event) => {
        pointerDown.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        setCamera(event)
      }}
      onPointerMove={setCamera}
      onPointerUp={(event) => {
        pointerDown.current = false
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { pointerDown.current = false }}
      onPointerLeave={() => {
        if (!pointerDown.current) {
          viewportRef.current?.style.setProperty('--camera-x', '0')
          viewportRef.current?.style.setProperty('--camera-y', '0')
        }
      }}
    >
      {!imageFailed ? (
        <img
          className="ne-scene__image"
          src={scene.background}
          alt=""
          draggable={false}
          style={{ objectPosition: scene.backgroundPosition }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="ne-scene__fallback" role="img" aria-label={locale === 'zh' ? '场景图片无法加载，已使用信号网格降级画面' : 'Scene image unavailable; signal-grid fallback active'}>
          <SignalFallbackText locale={locale} />
        </div>
      )}
      <div className="ne-scene__depth ne-scene__depth--far" aria-hidden="true" />
      <div className="ne-scene__depth ne-scene__depth--near" aria-hidden="true" />
      <div className="ne-scene__rain" aria-hidden="true">
        {rainDrops.map((drop) => (
          <i key={drop.id} style={{ '--rain-x': `${drop.x}%`, '--rain-delay': `${drop.delay}s`, '--rain-duration': `${drop.duration}s` } as CSSProperties} />
        ))}
      </div>
      <div className="ne-scene__scanline" aria-hidden="true" />

      {interactive ? (
        <div className="ne-hotspots" aria-label={locale === 'zh' ? '场景交互热点' : 'Scene interaction hotspots'}>
          {visibleHotspots.map((hotspot, index) => {
            const enabled = requirementsMet(state, hotspot.requirement)
            const label = enabled ? hotspot.label[locale] : (hotspot.disabledText?.[locale] ?? hotspot.label[locale])
            return (
              <button
                key={hotspot.id}
                type="button"
                className={`ne-hotspot ne-hotspot--${hotspot.kind} ${enabled ? '' : 'is-locked'}`}
                style={{
                  '--hotspot-x': `${hotspot.x}%`,
                  '--hotspot-y': `${hotspot.y}%`,
                  '--hotspot-size': `${hotspot.size * 6}px`,
                } as CSSProperties}
                aria-label={label}
                aria-disabled={!enabled}
                onClick={() => enabled ? onHotspot(hotspot) : onHotspot({ ...hotspot, action: 'locked' })}
              >
                <span className="ne-hotspot__ring"><CrosshairIcon /></span>
                <span className="ne-hotspot__label"><b>{String(index + 1).padStart(2, '0')}</b>{hotspot.label[locale]}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function SignalFallbackText({ locale }: { locale: GameLocale }) {
  return <span>{locale === 'zh' ? '视觉链路中断 / 游戏逻辑保持在线' : 'VISUAL LINK LOST / GAMEPLAY REMAINS ONLINE'}</span>
}
