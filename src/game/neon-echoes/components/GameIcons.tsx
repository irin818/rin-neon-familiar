import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function MapIcon(props: Props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></svg>
}

export function EyeGlyph(props: Props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}><path d="M2.5 12s3.5-5.4 9.5-5.4 9.5 5.4 9.5 5.4-3.5 5.4-9.5 5.4S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
}

export function InventoryIcon(props: Props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" /></svg>
}

export function SignalIcon(props: Props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}><path d="M3 12h3l2-5 4 10 3-7 2 4h4" /></svg>
}

export function CrosshairIcon(props: Props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
}
