import type { Locale } from './Header'

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <a className="brand brand--footer" href="#home"><span className="brand__name">RIN / 00</span></a>
      <p>AN INTERACTIVE NEON FAMILIAR EXPERIENCE · 2026</p>
      <div><a href="#story">STORY</a><a href="#archive">ARCHIVE</a><a href="#game">GAME</a></div>
      <small>{locale === 'zh' ? '角色画面来自项目提供素材 · 游戏进度仅保存在本机' : 'CHARACTER ART USES PROJECT-SUPPLIED ASSETS · GAME PROGRESS STAYS ON THIS DEVICE'}</small>
    </footer>
  )
}
