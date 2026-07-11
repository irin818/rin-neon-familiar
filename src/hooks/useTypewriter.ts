import { useEffect, useState } from 'react'

export function useTypewriter(text: string, speed = 24) {
  const [cursor, setCursor] = useState(() => ({ target: text, index: 0 }))
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const visibleText = reduceMotion
    ? text
    : cursor.target === text
      ? text.slice(0, cursor.index)
      : ''

  useEffect(() => {
    if (reduceMotion || (cursor.target === text && cursor.index >= text.length)) return
    const nextIndex = cursor.target === text ? cursor.index + 1 : 1
    const timer = window.setTimeout(() => {
      setCursor({ target: text, index: nextIndex })
    }, speed)
    return () => window.clearTimeout(timer)
  }, [cursor.index, cursor.target, reduceMotion, speed, text])

  return visibleText
}
