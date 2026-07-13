import type { GraffitiId, LocalizedText } from '../core/types'

export interface GraffitiDefinition {
  id: GraffitiId
  name: LocalizedText
  short: string
  description: LocalizedText
  charges: number
  color: string
}

export const graffitiDefinitions: Record<GraffitiId, GraffitiDefinition> = {
  'blind-eye': {
    id: 'blind-eye',
    name: { zh: '盲眼', en: 'BLIND EYE' },
    short: '◉',
    description: { zh: '让监控设备暂时失效。', en: 'Temporarily blinds surveillance devices.' },
    charges: 3,
    color: '#d7ff4d',
  },
  'pulse-arrow': {
    id: 'pulse-arrow',
    name: { zh: '脉冲箭头', en: 'PULSE ARROW' },
    short: '➤',
    description: { zh: '创建短时间加速路径。', en: 'Creates a short acceleration route.' },
    charges: 2,
    color: '#6ee7dc',
  },
  'echo-mark': {
    id: 'echo-mark',
    name: { zh: '回声标记', en: 'ECHO MARK' },
    short: '✦',
    description: { zh: '显露附近隐藏信号。', en: 'Reveals nearby hidden signals.' },
    charges: 2,
    color: '#ff66bd',
  },
}

export const itemNames: Record<string, LocalizedText> = {
  'spray-can': { zh: 'RIN 喷漆', en: 'RIN SPRAY CAN' },
  'echo-fragment': { zh: '回声碎片', en: 'ECHO FRAGMENT' },
}
