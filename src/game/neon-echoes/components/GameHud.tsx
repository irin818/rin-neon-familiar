import type { GameLocale, GameScene, WorldState } from '../core/types'
import { graffitiDefinitions, itemNames } from '../data/content'
import { companionProvider } from '../systems/companion'
import { InventoryIcon, MapIcon, SignalIcon } from './GameIcons'

interface GameHudProps {
  locale: GameLocale
  scene: GameScene
  state: WorldState
  saveStatus: 'saved' | 'saving' | 'unavailable'
  onPause: () => void
  onMap: () => void
  onSelectGraffiti: (id: WorldState['selectedGraffiti']) => void
}

function objective(state: WorldState, locale: GameLocale) {
  const zh = locale === 'zh'
  if (!state.completedEvents.includes('hand-taken')) return zh ? '抓住 RIN 的手' : 'TAKE RIN’S HAND'
  if (state.currentScene === 'neon-balcony') return zh ? '进入维修走廊' : 'ENTER THE SERVICE CORRIDOR'
  if (!state.inventory.includes('spray-can')) return zh ? '找到喷漆箱' : 'FIND THE SPRAY CASE'
  if (!state.completedEvents.includes('camera-disabled')) return zh ? '让监控节点失明' : 'BLIND THE WATCHER'
  if (state.currentScene === 'service-corridor') return zh ? '穿过封锁通道' : 'CROSS THE BLOCKED PASSAGE'
  if (!state.completedEvents.includes('acoustic-gate-open')) return zh ? '同步声学密钥' : 'SYNC THE ACOUSTIC KEY'
  if (state.currentScene === 'signal-gate') return zh ? '穿过信号门' : 'CROSS THE SIGNAL GATE'
  if (!state.completedEvents.includes('chapter-0-complete')) return zh ? '在安全屋与 RIN 交谈' : 'TALK TO RIN IN THE SAFEHOUSE'
  return zh ? '探索城市节点' : 'EXPLORE THE CITY NODES'
}

function relationshipLabel(state: WorldState, locale: GameLocale) {
  const zh = locale === 'zh'
  if (state.relationship.currentMood === 'warm') return zh ? '链路温暖' : 'WARM LINK'
  if (state.relationship.currentMood === 'relieved') return zh ? '压力缓解' : 'PRESSURE EASED'
  if (state.relationship.currentMood === 'curious') return zh ? '她在观察你' : 'SHE IS CURIOUS'
  if (state.relationship.currentMood === 'focused') return zh ? '行动专注' : 'FOCUSED'
  return zh ? '谨慎连接' : 'GUARDED LINK'
}

export function GameHud({ locale, scene, state, saveStatus, onPause, onMap, onSelectGraffiti }: GameHudProps) {
  return (
    <div className="ne-hud" aria-label={locale === 'zh' ? '游戏状态界面' : 'Game status interface'}>
      <div className="ne-hud__scene">
        <span>CHAPTER 0</span>
        <strong>{scene.title[locale]}</strong>
        <small>{scene.subtitle[locale]}</small>
        <p><i />{objective(state, locale)}</p>
      </div>

      <div className="ne-hud__companion">
        <div><SignalIcon /><span>RIN / SIGNAL TRACE</span></div>
        <strong>{relationshipLabel(state, locale)}</strong>
        <span className="ne-hud__trust" aria-label={relationshipLabel(state, locale)}>
          {Array.from({ length: 8 }, (_, index) => <i key={index} className={index < Math.max(1, Math.ceil(state.relationship.trust / 13)) ? 'is-on' : ''} />)}
        </span>
        <small>{companionProvider.getHint(state, state.currentScene, locale)}</small>
      </div>

      <div className="ne-hud__graffiti" aria-label={locale === 'zh' ? '现实涂鸦选择器' : 'Reality Graffiti selector'}>
        <span>REALITY GRAFFITI</span>
        <div>
          {(Object.keys(graffitiDefinitions) as WorldState['selectedGraffiti'][]).map((id) => {
            const definition = graffitiDefinitions[id]
            const unlocked = state.unlockedGraffiti.includes(id)
            return (
              <button
                key={id}
                type="button"
                className={state.selectedGraffiti === id ? 'is-active' : ''}
                disabled={!unlocked}
                onClick={() => onSelectGraffiti(id)}
                title={definition.description[locale]}
                aria-label={definition.name[locale]}
              >
                <b>{unlocked ? definition.short : '×'}</b><span>{definition.name[locale]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="ne-hud__inventory">
        <span><InventoryIcon />{locale === 'zh' ? '物品' : 'INVENTORY'}</span>
        <div>{state.inventory.length > 0 ? state.inventory.map((id) => <b key={id}>{itemNames[id]?.[locale] ?? id}</b>) : <i>—</i>}</div>
      </div>

      <div className="ne-hud__system">
        <button type="button" onClick={onPause} aria-label={locale === 'zh' ? '暂停游戏' : 'Pause game'}><kbd>ESC</kbd><span>{locale === 'zh' ? '暂停' : 'PAUSE'}</span></button>
        <button type="button" onClick={onMap} aria-label={locale === 'zh' ? '城市地图' : 'City map'}><MapIcon /><span>{locale === 'zh' ? '地图' : 'MAP'}</span></button>
        <small className={`ne-save-state ne-save-state--${saveStatus}`}>{saveStatus === 'saved' ? (locale === 'zh' ? '已自动保存' : 'AUTOSAVED') : saveStatus === 'saving' ? (locale === 'zh' ? '保存中' : 'SAVING') : (locale === 'zh' ? '本机存储不可用' : 'LOCAL SAVE UNAVAILABLE')}</small>
      </div>
    </div>
  )
}
