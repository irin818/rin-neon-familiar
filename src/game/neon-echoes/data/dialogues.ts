import type { DialogueTree } from '../core/types'

export const dialogues: Record<string, DialogueTree> = {
  'drone-alert': {
    id: 'drone-alert',
    startNode: 'alert',
    nodes: {
      alert: {
        id: 'alert',
        speaker: 'RIN',
        text: {
          zh: '巡逻无人机发现我们了。跟紧我，别让频道断开。',
          en: 'A patrol drone found us. Stay close—don’t let the channel break.',
        },
        emotion: 'focused',
        next: 'move-tip',
        effects: { relationship: { trust: 2, stress: 8 }, mood: 'focused' },
      },
      'move-tip': {
        id: 'move-tip',
        speaker: 'SYSTEM',
        text: {
          zh: '移动鼠标或拖动画面观察环境；使用 Tab 可以依次聚焦信号热点。',
          en: 'Move the pointer or drag the scene to look around. Press Tab to focus signal hotspots.',
        },
        emotion: 'neutral',
        next: null,
      },
    },
  },
  'corridor-entry': {
    id: 'corridor-entry',
    startNode: 'warning',
    nodes: {
      warning: {
        id: 'warning',
        speaker: 'RIN',
        text: {
          zh: '摄像头封住了出口。先找喷漆——城市系统相信符号，比相信人更快。',
          en: 'The watcher sealed the exit. Find spray first—the city trusts symbols faster than people.',
        },
        emotion: 'focused',
        next: null,
      },
    },
  },
  'graffiti-found': {
    id: 'graffiti-found',
    startNode: 'found',
    nodes: {
      found: {
        id: 'found',
        speaker: 'RIN',
        text: {
          zh: '第一个现实涂鸦：盲眼。画出闭合的眼形，让监控把我们从现实里漏掉。',
          en: 'Your first Reality Graffiti: Blind Eye. Draw a closed eye and make the watcher miss us in reality.',
        },
        emotion: 'curious',
        next: null,
        effects: { relationship: { curiosity: 4 }, mood: 'curious' },
      },
    },
  },
  'signal-gate-entry': {
    id: 'signal-gate-entry',
    startNode: 'steady',
    nodes: {
      steady: {
        id: 'steady',
        speaker: 'RIN',
        text: {
          zh: '它不是密码，只是在等一段正确的呼吸。把频率和相位推到目标附近。',
          en: 'It isn’t a password. It is waiting for the right breath. Bring frequency and phase near the target.',
        },
        emotion: 'focused',
        next: null,
      },
    },
  },
  'safehouse-name': {
    id: 'safehouse-name',
    startNode: 'question',
    nodes: {
      question: {
        id: 'question',
        speaker: 'RIN',
        text: {
          zh: '这里暂时安全。告诉我——你还记得自己的名字吗？',
          en: 'We are safe for now. Tell me—do you still remember your name?',
        },
        emotion: 'guarded',
        next: null,
        choices: [
          {
            id: 'answer',
            text: { zh: '“我记得。”', en: '“I remember.”' },
            next: 'answer-response',
            effects: {
              relationship: { trust: 10, familiarity: 8, caution: -5 },
              mood: 'warm',
              rememberChoice: 'remembered-name',
              choice: { key: 'name-response', value: 'answer' },
            },
          },
          {
            id: 'silence',
            text: { zh: '保持沉默', en: 'Remain silent' },
            next: 'silence-response',
            effects: {
              relationship: { trust: 2, curiosity: 7, caution: 5 },
              mood: 'curious',
              rememberChoice: 'kept-silent',
              choice: { key: 'name-response', value: 'silence' },
            },
          },
          {
            id: 'counter',
            text: { zh: '“你为什么想知道？”', en: '“Why do you want to know?”' },
            next: 'counter-response',
            effects: {
              relationship: { trust: 5, curiosity: 10, familiarity: 4 },
              mood: 'curious',
              rememberChoice: 'asked-her-motive',
              choice: { key: 'name-response', value: 'counter' },
            },
          },
        ],
      },
      'answer-response': {
        id: 'answer-response',
        speaker: 'RIN',
        text: {
          zh: '那就先替我保管好它。城市最喜欢从人身上偷走名字。',
          en: 'Then keep it safe for me. Names are what this city likes to steal first.',
        },
        emotion: 'warm',
        next: 'chapter-end',
      },
      'silence-response': {
        id: 'silence-response',
        speaker: 'RIN',
        text: {
          zh: '……没关系。沉默也可以是答案。我会等你愿意说的时候。',
          en: '…That’s all right. Silence can be an answer. I’ll wait until you want to speak.',
        },
        emotion: 'curious',
        next: 'chapter-end',
      },
      'counter-response': {
        id: 'counter-response',
        speaker: 'RIN',
        text: {
          zh: '因为我想确认，把手伸给我的人还是你。这个问题很公平。',
          en: 'Because I wanted to know the person who took my hand is still you. Fair question.',
        },
        emotion: 'curious',
        next: 'chapter-end',
      },
      'chapter-end': {
        id: 'chapter-end',
        speaker: 'SYSTEM',
        text: {
          zh: 'CHAPTER 0 完成。屋顶中继站与城市节点图已开放。',
          en: 'CHAPTER 0 COMPLETE. Rooftop Relay and the city node map are now online.',
        },
        emotion: 'neutral',
        next: null,
        effects: {
          completeEvents: ['safehouse-conversation', 'chapter-0-complete'],
          unlockScenes: ['rooftop-relay'],
          changeScenes: ['service-corridor', 'signal-gate'],
          relationship: { stress: -24, familiarity: 6 },
          mood: 'relieved',
        },
      },
    },
  },
  'relay-entry': {
    id: 'relay-entry',
    startNode: 'open-city',
    nodes: {
      'open-city': {
        id: 'open-city',
        speaker: 'RIN',
        text: {
          zh: '现在你可以选择下一段路了。别急——城市已经开始记住你留下的痕迹。',
          en: 'Now you can choose the next route. No rush—the city has started remembering your marks.',
        },
        emotion: 'warm',
        next: null,
      },
    },
  },
}
