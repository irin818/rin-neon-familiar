import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { ArchiveRoom } from './components/ArchiveRoom'
import { Footer } from './components/Footer'
import { Header, type Locale } from './components/Header'
import { Hero } from './components/Hero'
import { HudFrame } from './components/HudFrame'
import { SignalGame } from './components/SignalGame'
import { StoryArchive } from './components/StoryArchive'
import { useAmbientAudio } from './hooks/useAmbientAudio'
import { useScrollSpy } from './hooks/useScrollSpy'

const NeonEchoesGame = lazy(() => import('./game/neon-echoes/components/GameShell'))

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh')
  const [gameActive, setGameActive] = useState(() => window.location.hash === '#neon-echoes')
  const activeSection = useScrollSpy()
  const ambientAudio = useAmbientAudio()

  const enterGame = useCallback(() => {
    ambientAudio.stop()
    window.history.pushState(null, '', '#neon-echoes')
    setGameActive(true)
  }, [ambientAudio])

  const exitGame = useCallback(() => {
    window.history.pushState(null, '', '#home')
    setGameActive(false)
    window.requestAnimationFrame(() => document.getElementById('home')?.scrollIntoView({ block: 'start' }))
  }, [])

  useEffect(() => {
    const handleHash = () => setGameActive(window.location.hash === '#neon-echoes')
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('popstate', handleHash)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('popstate', handleHash)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [locale])

  useEffect(() => {
    let timer = 0
    const scrollToHash = () => {
      const id = window.location.hash.slice(1)
      if (!id) return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 100)
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  if (gameActive) return (
    <Suspense fallback={<div className="game-module-loading" role="status"><span>RIN: NEON ECHOES</span><strong>{locale === 'zh' ? '正在建立城市连接' : 'CONNECTING TO NEON CITY'}</strong></div>}>
      <NeonEchoesGame locale={locale} onExit={exitGame} />
    </Suspense>
  )

  return (
    <div className="app-shell">
      <a className="skip-link" href="#story">{locale === 'zh' ? '跳到主要内容' : 'Skip to main content'}</a>
      <HudFrame />
      <Header
        activeSection={activeSection}
        locale={locale}
        onLocaleChange={setLocale}
        soundEnabled={ambientAudio.enabled}
        onSoundToggle={ambientAudio.toggle}
      />
      <main>
        <Hero locale={locale} onEnterGame={enterGame} />
        <StoryArchive locale={locale} />
        <ArchiveRoom locale={locale} />
        <SignalGame locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}
