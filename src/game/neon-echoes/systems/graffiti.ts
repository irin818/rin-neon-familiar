import type { GraffitiId } from '../core/types'

export interface GraffitiPoint {
  x: number
  y: number
}

export interface GraffitiResult {
  accepted: boolean
  score: number
  reason: 'ok' | 'too-short' | 'too-flat' | 'not-closed' | 'wrong-direction'
}

const distance = (a: GraffitiPoint, b: GraffitiPoint) => Math.hypot(a.x - b.x, a.y - b.y)

export function recognizeGraffiti(points: GraffitiPoint[], graffitiId: GraffitiId): GraffitiResult {
  if (points.length < 8) return { accepted: false, score: 0, reason: 'too-short' }
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const width = Math.max(...xs) - Math.min(...xs)
  const height = Math.max(...ys) - Math.min(...ys)
  const pathLength = points.slice(1).reduce((total, point, index) => total + distance(points[index], point), 0)
  const closure = distance(points[0], points.at(-1)!)

  if (graffitiId === 'blind-eye') {
    if (width < 0.42 || pathLength < 1.05) return { accepted: false, score: 18, reason: 'too-short' }
    if (height < 0.14 || height / Math.max(width, 0.01) > 0.9) return { accepted: false, score: 34, reason: 'too-flat' }
    const closureRatio = closure / Math.max(width, height, 0.01)
    const score = Math.round(Math.max(0, 100 - closureRatio * 90 - Math.abs(height / width - 0.42) * 45))
    return closureRatio <= 0.38
      ? { accepted: true, score: Math.max(70, score), reason: 'ok' }
      : { accepted: false, score, reason: 'not-closed' }
  }

  if (graffitiId === 'pulse-arrow') {
    const direction = points.at(-1)!.x - points[0].x
    const score = Math.round(Math.min(100, pathLength * 55 + Math.max(0, direction) * 45))
    return direction > 0.42 && width > 0.5
      ? { accepted: true, score: Math.max(70, score), reason: 'ok' }
      : { accepted: false, score, reason: 'wrong-direction' }
  }

  const score = Math.round(Math.min(100, pathLength * 60 + height * 25))
  return pathLength > 1.35 && width > 0.3 && height > 0.3
    ? { accepted: true, score: Math.max(70, score), reason: 'ok' }
    : { accepted: false, score, reason: 'too-short' }
}
