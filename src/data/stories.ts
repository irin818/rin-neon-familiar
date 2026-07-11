export type StoryId = 'dual' | 'rooftop' | 'studio'
export type ChannelId = 'green' | 'pink'

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`

export interface StoryChapter {
  id: StoryId
  index: string
  title: string
  titleEn: string
  location: string
  image: string
  imageAlt: string
  imageAltEn: string
  position: string
  dialogue: Record<ChannelId, string>
  response: Record<ChannelId, string>
  dialogueEn: Record<ChannelId, string>
  responseEn: Record<ChannelId, string>
}

export const storyChapters: readonly StoryChapter[] = [
  {
    id: 'dual',
    index: '01',
    title: '双生直播',
    titleEn: 'DUAL STREAM',
    location: 'NEON ROOM / 23:47',
    image: asset('rin-dual.webp'),
    imageAlt: '黑绿 RIN 与粉色双生角色在霓虹直播间合影',
    imageAltEn: 'Green RIN and her pink twin pose together in a neon streaming room',
    position: 'center 44%',
    dialogue: {
      green: '频道接通。今晚，你想先听谁的故事？别担心，我们都在这里。',
      pink: '粉色回路收到你的回应啦。准备好一起把整座城市点亮了吗？',
    },
    response: {
      green: '绿频已锁定。她向你递来一只发光的兔兔信号。',
      pink: '粉频开始升温。她笑着把下一段节拍交给了你。',
    },
    dialogueEn: {
      green: 'Channel connected. Whose story do you want to hear first? Don’t worry—we are both here.',
      pink: 'The pink circuit heard you. Ready to light the whole city together?',
    },
    responseEn: {
      green: 'Green frequency locked. She passes you a glowing rabbit signal.',
      pink: 'Pink frequency warms up. Smiling, she hands you the next beat.',
    },
  },
  {
    id: 'rooftop',
    index: '02',
    title: '天台信号',
    titleEn: 'ROOFTOP SIGNAL',
    location: 'ROOFTOP / 00:12',
    image: asset('rin-rooftop.webp'),
    imageAlt: 'RIN 在霓虹城市天台伸手邀请访客',
    imageAltEn: 'RIN reaches out to invite the visitor across a neon city rooftop',
    position: 'center 48%',
    dialogue: {
      green: '城市最安静的时候，丢失的频率反而最清楚。跟紧我，别掉线。',
      pink: '我从另一条频道看见你们了。屋顶边缘的粉色灯牌就是路标。',
    },
    response: {
      green: '你握住她伸来的手，天台的绿色灯线向前延伸。',
      pink: '远处的粉色讯号闪了两次，回应了你们的位置。',
    },
    dialogueEn: {
      green: 'When the city is quietest, lost frequencies become clear. Stay close and don’t drop the link.',
      pink: 'I can see you from the other channel. Follow the pink sign at the rooftop edge.',
    },
    responseEn: {
      green: 'You take her hand. A green light path stretches across the rooftop.',
      pink: 'A distant pink signal flashes twice, acknowledging your location.',
    },
  },
  {
    id: 'studio',
    index: '03',
    title: '创作室',
    titleEn: 'CREATOR ROOM',
    location: 'STUDIO / 02:06',
    image: asset('rin-studio.webp'),
    imageAlt: 'RIN 坐在夜间创作室的电脑与发光键盘前',
    imageAltEn: 'RIN sits at a computer and glowing keyboard in a nighttime creator room',
    position: 'center 38%',
    dialogue: {
      green: '这里保存着频道的每一帧记忆。你听见键盘下面那段低频了吗？',
      pink: '我把高频藏进了右边声道。两边同时响起，才是完整的我们。',
    },
    response: {
      green: '屏幕亮起，绿色波形与你的呼吸逐渐重合。',
      pink: '粉色声道接入成功，双生信号只差最后一次同步。',
    },
    dialogueEn: {
      green: 'Every frame of the channel is stored here. Can you hear the low frequency beneath the keys?',
      pink: 'I hid the high band in the right channel. Only both sides together make us complete.',
    },
    responseEn: {
      green: 'The display wakes. Its green waveform settles into the rhythm of your breathing.',
      pink: 'Pink channel connected. Only one final dual sync remains.',
    },
  },
] as const

export const arcadeImage = asset('rin-arcade.webp')
export const heroImage = asset('rin-rooftop.webp')
export const dualImage = asset('rin-dual.webp')
