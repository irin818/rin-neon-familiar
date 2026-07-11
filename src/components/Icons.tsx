import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ChevronRightIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><path d="m9 5 7 7-7 7" /></svg>
}

export function ArrowDownIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><path d="M12 4v15M6.5 13.5 12 19l5.5-5.5" /></svg>
}

export function SoundIcon({ muted = false, ...props }: IconProps & { muted?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><path d="M4 10v4h3l4 3V7l-4 3H4Z" />{muted ? <path d="m16 10 4 4m0-4-4 4" /> : <><path d="M15 9.5c1.3 1.4 1.3 3.6 0 5" /><path d="M18 7c2.8 2.8 2.8 7.2 0 10" /></>}</svg>
}

export function MenuIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><path d="M4 7h16M8 12h12M4 17h16" /></svg>
}

export function CloseIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export function PlayIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M8 5.4v13.2a1 1 0 0 0 1.55.83l9.2-6.6a1 1 0 0 0 0-1.66l-9.2-6.6A1 1 0 0 0 8 5.4Z" /></svg>
}

export function PauseIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>
}

export function WaveformIcon(props: IconProps) {
  return <svg viewBox="0 0 64 32" aria-hidden="true" {...props}><g fill="currentColor"><rect x="2" y="13" width="3" height="6" rx="1"/><rect x="8" y="9" width="3" height="14" rx="1"/><rect x="14" y="5" width="3" height="22" rx="1"/><rect x="20" y="11" width="3" height="10" rx="1"/><rect x="26" y="2" width="3" height="28" rx="1"/><rect x="32" y="7" width="3" height="18" rx="1"/><rect x="38" y="12" width="3" height="8" rx="1"/><rect x="44" y="5" width="3" height="22" rx="1"/><rect x="50" y="10" width="3" height="12" rx="1"/><rect x="56" y="13" width="3" height="6" rx="1"/></g></svg>
}
