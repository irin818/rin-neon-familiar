import { useEffect, useState } from 'react'
import { ArchiveRoom } from './components/ArchiveRoom'
import { Footer } from './components/Footer'
import { Header, type Locale } from './components/Header'
import { Hero } from './components/Hero'
import { HudFrame } from './components/HudFrame'
import { SignalGame } from './components/SignalGame'
import { StoryArchive } from './components/StoryArchive'
import { useAmbientAudio } from './hooks/useAmbientAudio'
import { useScrollSpy } from './hooks/useScrollSpy'

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh')
  const activeSection = useScrollSpy()
  const ambientAudio = useAmbientAudio()

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
        <Hero locale={locale} />
        <StoryArchive locale={locale} />
        <ArchiveRoom locale={locale} />
        <SignalGame locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}
