import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { SectionId } from '../hooks/useScrollSpy'
import { CloseIcon, MenuIcon, SoundIcon } from './Icons'

export type Locale = 'zh' | 'en'

interface HeaderProps {
  activeSection: SectionId
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  soundEnabled: boolean
  onSoundToggle: () => void
}

const navItems: readonly { id: SectionId; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'story', label: 'STORY' },
  { id: 'archive', label: 'ARCHIVE' },
  { id: 'game', label: 'SIGNAL GAME' },
]

export function Header({
  activeSection,
  locale,
  onLocaleChange,
  soundEnabled,
  onSoundToggle,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const timer = window.setTimeout(() => navRef.current?.querySelector<HTMLAnchorElement>('a')?.focus(), 200)
    return () => window.clearTimeout(timer)
  }, [menuOpen])

  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !menuOpen) return
    setMenuOpen(false)
    window.requestAnimationFrame(() => menuButtonRef.current?.focus())
  }

  return (
    <header className="site-header" onKeyDown={handleHeaderKeyDown}>
      <a className="brand" href="#home" aria-label={locale === 'zh' ? 'RIN 首页' : 'RIN home'} onClick={() => setMenuOpen(false)}>
        <span className="brand__name">RIN / 00</span>
        <span className="brand__bars" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      </a>

      <nav ref={navRef} id="mobile-navigation" className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} aria-label={locale === 'zh' ? '主导航' : 'Primary navigation'}>
        {navItems.map((item) => (
          <a
            key={item.id}
            className={activeSection === item.id ? 'is-active' : ''}
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? 'location' : undefined}
            onClick={() => {
              if (menuOpen) window.requestAnimationFrame(() => menuButtonRef.current?.focus())
              setMenuOpen(false)
            }}
          >
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="header-tools">
        <button
          className="sound-toggle"
          type="button"
          onClick={onSoundToggle}
          aria-pressed={soundEnabled}
          aria-label={locale === 'zh' ? (soundEnabled ? '关闭环境音' : '开启环境音') : (soundEnabled ? 'Turn ambient sound off' : 'Turn ambient sound on')}
        >
          <SoundIcon muted={!soundEnabled} />
          <span>{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span>
        </button>
        <div className="locale-switch" role="group" aria-label={locale === 'zh' ? '语言选择' : 'Language selection'}>
          <button type="button" className={locale === 'zh' ? 'is-active' : ''} onClick={() => onLocaleChange('zh')} aria-pressed={locale === 'zh'}>中</button>
          <span>/</span>
          <button type="button" className={locale === 'en' ? 'is-active' : ''} onClick={() => onLocaleChange('en')} aria-pressed={locale === 'en'}>EN</button>
        </div>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={locale === 'zh' ? (menuOpen ? '关闭导航' : '打开导航') : (menuOpen ? 'Close navigation' : 'Open navigation')}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  )
}
