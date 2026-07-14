import { useRef, useState, type ChangeEvent } from 'react'
import { neonAudio } from '../core/audioManager'
import type { GameLocale, GameSettings } from '../core/types'
import { useGameState } from '../hooks/GameStateProvider'

interface PauseMenuProps {
  locale: GameLocale
  onResume: () => void
  onMap: () => void
  onExit: () => void
  onRestart: () => void
}

export function PauseMenu({ locale, onResume, onMap, onExit, onRestart }: PauseMenuProps) {
  const { state, dispatch, saveStatus, loadIssue, exportGame, importGame, resetGame } = useGameState()
  const inputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState('')
  const zh = locale === 'zh'

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: value } })
    neonAudio.applySettings({ ...state.settings, [key]: value })
  }

  const exportSave = () => {
    const blob = new Blob([exportGame()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'rin-neon-echoes-save.json'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const importSave = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    void file.text().then((json) => {
      const issue = importGame(json)
      setImportMessage(issue === 'none' ? (zh ? '存档导入成功' : 'SAVE IMPORTED') : (zh ? '存档无法读取，已保留当前进度' : 'SAVE COULD NOT BE READ; CURRENT PROGRESS KEPT'))
    })
    event.target.value = ''
  }

  const reset = () => {
    if (!window.confirm(zh ? '确认清除当前进度并开始新游戏？' : 'Clear current progress and start a new game?')) return
    resetGame()
    onRestart()
  }

  return (
    <div className="ne-modal ne-pause" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <div className="ne-modal__header"><div><span>RIN: NEON ECHOES</span><h2 id="pause-title">{zh ? '连接已暂停' : 'LINK PAUSED'}</h2></div><button type="button" onClick={onResume}>ESC</button></div>
      <div className="ne-pause__layout">
        <nav aria-label={zh ? '暂停菜单' : 'Pause menu'}>
          <button type="button" onClick={onResume}>{zh ? '继续游戏' : 'RESUME'}</button>
          <button type="button" onClick={onMap}>{zh ? '城市节点图' : 'CITY NODE MAP'}</button>
          <button type="button" onClick={exportSave}>{zh ? '导出存档 JSON' : 'EXPORT SAVE JSON'}</button>
          <button type="button" onClick={() => inputRef.current?.click()}>{zh ? '导入存档' : 'IMPORT SAVE'}</button>
          <input ref={inputRef} className="ne-visually-hidden" type="file" accept="application/json,.json" onChange={importSave} />
          <button type="button" onClick={reset}>{zh ? '新游戏 / 重置' : 'NEW GAME / RESET'}</button>
          <button type="button" onClick={onExit}>{zh ? '返回原网站' : 'RETURN TO WEBSITE'}</button>
        </nav>
        <div className="ne-settings">
          <h3>{zh ? '声音' : 'AUDIO'}</h3>
          {([
            ['masterVolume', zh ? '总音量' : 'MASTER'],
            ['musicVolume', zh ? '音乐' : 'MUSIC'],
            ['ambienceVolume', zh ? '环境' : 'AMBIENCE'],
            ['effectsVolume', zh ? '效果' : 'EFFECTS'],
            ['dialogueVolume', zh ? '对话提示' : 'DIALOGUE'],
          ] as const).map(([key, label]) => (
            <label key={key}>{label}<input type="range" min="0" max="1" step="0.01" value={state.settings[key]} onChange={(event) => updateSetting(key, Number(event.target.value))} /></label>
          ))}
          <h3>{zh ? '显示与文字' : 'DISPLAY & TEXT'}</h3>
          <label>{zh ? '文字速度' : 'TEXT SPEED'}<select value={state.settings.textSpeed} onChange={(event) => updateSetting('textSpeed', event.target.value as GameSettings['textSpeed'])}><option value="slow">SLOW</option><option value="normal">NORMAL</option><option value="fast">FAST</option><option value="instant">INSTANT</option></select></label>
          <label className="ne-settings__check"><input type="checkbox" checked={state.settings.subtitlesEnabled} onChange={(event) => updateSetting('subtitlesEnabled', event.target.checked)} />{zh ? '字幕' : 'SUBTITLES'}</label>
          <label className="ne-settings__check"><input type="checkbox" checked={state.settings.reducedMotion} onChange={(event) => updateSetting('reducedMotion', event.target.checked)} />{zh ? '减少动态效果' : 'REDUCED MOTION'}</label>
          <label className="ne-settings__check"><input type="checkbox" checked={state.settings.glitchEnabled} onChange={(event) => updateSetting('glitchEnabled', event.target.checked)} />{zh ? '故障闪烁' : 'GLITCH EFFECTS'}</label>
        </div>
      </div>
      <div className="ne-pause__status" aria-live="polite">
        <span>{saveStatus === 'saved' ? (zh ? '自动存档：完成' : 'AUTOSAVE: COMPLETE') : saveStatus === 'saving' ? (zh ? '自动存档：写入中' : 'AUTOSAVE: WRITING') : (zh ? '自动存档：不可用' : 'AUTOSAVE: UNAVAILABLE')}</span>
        <span>{importMessage || (loadIssue !== 'none' ? (zh ? '旧存档异常，已安全恢复' : 'SAVE ISSUE RECOVERED SAFELY') : '')}</span>
      </div>
    </div>
  )
}
