import type { GameLocale, SceneId, WorldState } from '../core/types'
import { sceneOrder, scenes } from '../data/scenes'

interface CityMapProps {
  locale: GameLocale
  state: WorldState
  onTravel: (sceneId: SceneId) => void
  onClose: () => void
}

export function CityMap({ locale, state, onTravel, onClose }: CityMapProps) {
  return (
    <div className="ne-modal ne-map" role="dialog" aria-modal="true" aria-labelledby="map-title">
      <div className="ne-modal__header">
        <div><span>NEON CITY / NODE NETWORK</span><h2 id="map-title">{locale === 'zh' ? '城市节点图' : 'CITY NODE MAP'}</h2></div>
        <button type="button" onClick={onClose} aria-label={locale === 'zh' ? '关闭地图' : 'Close map'}>ESC</button>
      </div>
      <p>{locale === 'zh' ? '访问过的区域和被你改变的系统会保留在城市记录中。' : 'Visited districts and systems you altered remain in the city record.'}</p>
      <div className="ne-map__network">
        <span className="ne-map__line" aria-hidden="true" />
        {sceneOrder.map((sceneId, index) => {
          const scene = scenes[sceneId]
          const status = state.cityRegions[sceneId]
          const visited = state.visitedScenes.includes(sceneId)
          const disabled = status === 'locked'
          return (
            <button
              key={sceneId}
              type="button"
              className={`${state.currentScene === sceneId ? 'is-current' : ''} ${visited ? 'is-visited' : ''} is-${status}`}
              disabled={disabled}
              onClick={() => onTravel(sceneId)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{scene.title[locale]}</strong>
              <small>{disabled ? (locale === 'zh' ? '未解锁' : 'LOCKED') : status === 'changed' ? (locale === 'zh' ? '已改变' : 'ALTERED') : visited ? (locale === 'zh' ? '已访问' : 'VISITED') : (locale === 'zh' ? '可进入' : 'AVAILABLE')}</small>
            </button>
          )
        })}
      </div>
      <div className="ne-map__legend"><span><i />ONLINE</span><span><i />ALTERED</span><span><i />LOCKED</span></div>
    </div>
  )
}
