import type { GameLocale, SceneId, WorldState } from '../core/types'

export interface CompanionProvider {
  getHint(state: WorldState, sceneId: SceneId, locale: GameLocale): string
  getAddress(state: WorldState, locale: GameLocale): string
}

export class RuleBasedCompanionProvider implements CompanionProvider {
  getAddress(state: WorldState, locale: GameLocale) {
    const choice = state.playerChoices['name-response']
    if (choice === 'silence') return locale === 'zh' ? '安静的搭档' : 'quiet partner'
    if (choice === 'counter') return locale === 'zh' ? '问题很多的人' : 'question-maker'
    if (state.relationship.trust >= 35) return locale === 'zh' ? '搭档' : 'partner'
    return locale === 'zh' ? '信号接收者' : 'receiver'
  }

  getHint(state: WorldState, sceneId: SceneId, locale: GameLocale) {
    const zh = locale === 'zh'
    if (sceneId === 'neon-balcony' && !state.completedEvents.includes('hand-taken')) {
      return zh ? '我还在这里。准备好就抓住我的手。' : 'I’m still here. Take my hand when you’re ready.'
    }
    if (sceneId === 'neon-balcony') {
      return zh ? '巡逻来了，走左侧通道。' : 'The patrol is here. Take the passage on the left.'
    }
    if (sceneId === 'service-corridor' && !state.inventory.includes('spray-can')) {
      return zh ? '先看左侧地面，旧箱子里可能还有能用的东西。' : 'Check the floor on the left. The old case may still hold something useful.'
    }
    if (sceneId === 'service-corridor' && !state.completedEvents.includes('camera-disabled')) {
      return zh ? '闭合眼形。让监控以为这里什么都没有。' : 'Close the eye shape. Make the watcher believe there is nothing here.'
    }
    if (sceneId === 'service-corridor') {
      return zh ? '监控断线了，穿过封锁通道。' : 'The watcher is blind. Cross the blocked passage.'
    }
    if (sceneId === 'signal-gate' && !state.completedEvents.includes('acoustic-gate-open')) {
      return zh ? '别追求完美，只要把误差压到 8% 以内。' : 'Don’t chase perfection. Bring the error under 8%.'
    }
    if (sceneId === 'signal-gate') {
      return zh ? '密钥已经同步。门后就是安全屋。' : 'The key is synced. The safehouse is beyond the gate.'
    }
    if (sceneId === 'rin-safehouse' && !state.completedEvents.includes('chapter-0-complete')) {
      return zh ? '我不会替你回答。这个选择只属于你。' : 'I won’t answer for you. This choice belongs to you.'
    }
    const address = this.getAddress(state, locale)
    return zh ? `${address}，城市节点已经在线。` : `${address}, the city nodes are online.`
  }
}

export const companionProvider: CompanionProvider = new RuleBasedCompanionProvider()
