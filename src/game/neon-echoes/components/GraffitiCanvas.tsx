import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { neonAudio } from '../core/audioManager'
import type { GameLocale, GraffitiId } from '../core/types'
import { graffitiDefinitions } from '../data/content'
import { recognizeGraffiti, type GraffitiPoint, type GraffitiResult } from '../systems/graffiti'
import { EyeGlyph } from './GameIcons'

const assistEye: GraffitiPoint[] = [
  { x: 0.12, y: 0.5 }, { x: 0.24, y: 0.35 }, { x: 0.4, y: 0.28 }, { x: 0.58, y: 0.3 },
  { x: 0.78, y: 0.42 }, { x: 0.88, y: 0.5 }, { x: 0.76, y: 0.62 }, { x: 0.58, y: 0.7 },
  { x: 0.4, y: 0.68 }, { x: 0.24, y: 0.62 }, { x: 0.12, y: 0.5 },
]

interface GraffitiCanvasProps {
  locale: GameLocale
  graffitiId: GraffitiId
  onSuccess: () => void
  onClose: () => void
}

export function GraffitiCanvas({ locale, graffitiId, onSuccess, onClose }: GraffitiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<GraffitiPoint[]>([])
  const drawingRef = useRef(false)
  const successTimer = useRef(0)
  const [result, setResult] = useState<GraffitiResult | null>(null)
  const definition = graffitiDefinitions[graffitiId]

  const drawPoints = (points: GraffitiPoint[]) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width, height)
    context.lineWidth = 5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = definition.color
    context.shadowColor = definition.color
    context.shadowBlur = 14
    context.beginPath()
    points.forEach((point, index) => {
      const x = point.x * width
      const y = point.y * height
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.stroke()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => drawPoints(pointsRef.current))
    observer.observe(canvas)
    return () => observer.disconnect()
  })

  useEffect(() => () => window.clearTimeout(successTimer.current), [])

  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    }
  }

  const finish = (points: GraffitiPoint[]) => {
    const next = recognizeGraffiti(points, graffitiId)
    setResult(next)
    neonAudio.playCue(next.accepted ? 'graffiti-ok' : 'graffiti-fail')
    if (next.accepted) successTimer.current = window.setTimeout(onSuccess, 700)
  }

  const clear = () => {
    pointsRef.current = []
    setResult(null)
    drawPoints([])
  }

  const runKeyboardAssist = () => {
    pointsRef.current = assistEye
    drawPoints(assistEye)
    finish(assistEye)
  }

  return (
    <div className="ne-modal ne-graffiti" role="dialog" aria-modal="true" aria-labelledby="graffiti-title">
      <div className="ne-modal__header">
        <div><span>REALITY GRAFFITI / 01</span><h2 id="graffiti-title">{definition.name[locale]}</h2></div>
        <button type="button" onClick={onClose} aria-label={locale === 'zh' ? '关闭涂鸦界面' : 'Close graffiti interface'}>ESC</button>
      </div>
      <p>{locale === 'zh' ? '按住并画出闭合眼形。轨迹会在松开时识别。' : 'Hold and draw a closed eye. The trace is recognized when released.'}</p>
      <div className="ne-graffiti__surface">
        <EyeGlyph className="ne-graffiti__guide" />
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label={locale === 'zh' ? '盲眼涂鸦绘制区域' : 'Blind Eye graffiti drawing surface'}
          onPointerDown={(event) => {
            drawingRef.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            pointsRef.current = [pointFromEvent(event)]
            setResult(null)
            drawPoints(pointsRef.current)
          }}
          onPointerMove={(event) => {
            if (!drawingRef.current) return
            pointsRef.current = [...pointsRef.current, pointFromEvent(event)]
            drawPoints(pointsRef.current)
          }}
          onPointerUp={(event) => {
            if (!drawingRef.current) return
            drawingRef.current = false
            event.currentTarget.releasePointerCapture(event.pointerId)
            finish(pointsRef.current)
          }}
          onPointerCancel={() => { drawingRef.current = false }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              runKeyboardAssist()
            }
          }}
        />
      </div>
      <div className="ne-graffiti__footer">
        <div className={`ne-graffiti__result ${result?.accepted ? 'is-success' : result ? 'is-fail' : ''}`} aria-live="polite">
          {result ? (result.accepted
            ? `${locale === 'zh' ? '符号锁定' : 'GLYPH LOCKED'} / ${result.score}%`
            : `${locale === 'zh' ? '轨迹未识别' : 'TRACE REJECTED'} / ${result.score}%`) : (locale === 'zh' ? '等待轨迹' : 'AWAITING TRACE')}
        </div>
        <button type="button" onClick={clear}>{locale === 'zh' ? '清除' : 'CLEAR'}</button>
        <button type="button" onClick={runKeyboardAssist}>{locale === 'zh' ? '键盘辅助描摹' : 'KEYBOARD ASSIST'}</button>
      </div>
    </div>
  )
}
