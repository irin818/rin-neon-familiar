import { useMemo, useState } from 'react'
import { storyChapters, type ChannelId, type StoryId } from '../data/stories'
import { useTypewriter } from '../hooks/useTypewriter'
import type { Locale } from './Header'
import { ChevronRightIcon } from './Icons'

interface StoryArchiveProps {
  locale: Locale
}

export function StoryArchive({ locale }: StoryArchiveProps) {
  const [chapterId, setChapterId] = useState<StoryId>('dual')
  const [channel, setChannel] = useState<ChannelId>('green')
  const [responseChannel, setResponseChannel] = useState<ChannelId | null>(null)

  const activeIndex = storyChapters.findIndex((chapter) => chapter.id === chapterId)
  const chapter = storyChapters[activeIndex]
  const dialogue = locale === 'zh' ? chapter.dialogue : chapter.dialogueEn
  const chapterResponse = locale === 'zh' ? chapter.response : chapter.responseEn
  const currentText = responseChannel ? chapterResponse[responseChannel] : dialogue[channel]
  const typedText = useTypewriter(currentText)

  const copy = useMemo(() => locale === 'zh'
    ? {
        title: '双生夜行档案',
        intro: '同一座霓虹城，两条彼此回应的频率。选择频道，听见她们没有说完的故事。',
        green: 'GREEN RIN',
        pink: 'PINK RIN',
        greenChoice: '进入绿色频道',
        pinkChoice: '回应粉色频道',
        archive: '记忆档案',
        open: '打开记录',
        chapterGroup: '故事章节',
        dialogue: '互动对话终端',
        channelGroup: '选择发言频道',
        previous: '上一个章节',
        next: '下一个章节',
      }
    : {
        title: 'DUAL NIGHT ARCHIVE',
        intro: 'One neon city. Two frequencies answering each other. Choose a channel and hear the unfinished story.',
        green: 'GREEN RIN',
        pink: 'PINK RIN',
        greenChoice: 'ENTER GREEN CHANNEL',
        pinkChoice: 'ANSWER PINK CHANNEL',
        archive: 'MEMORY ARCHIVE',
        open: 'OPEN LOG',
        chapterGroup: 'Story chapters',
        dialogue: 'Interactive dialogue terminal',
        channelGroup: 'Choose a speaking channel',
        previous: 'Previous chapter',
        next: 'Next chapter',
      }, [locale])

  const selectChapter = (id: StoryId) => {
    setChapterId(id)
    setResponseChannel(null)
  }

  const chooseChannel = (nextChannel: ChannelId) => {
    setChannel(nextChannel)
    setResponseChannel(nextChannel)
  }

  const moveChapter = (direction: -1 | 1) => {
    const next = (activeIndex + direction + storyChapters.length) % storyChapters.length
    selectChapter(storyChapters[next].id)
  }

  return (
    <section id="story" className="story-section" aria-labelledby="story-title">
      <div className="section-heading story-section__heading">
        <span className="section-number">01 / STORY</span>
        <div>
          <h2 id="story-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
      </div>

      <div className="story-console">
        <div className="chapter-rail" role="group" aria-label={copy.chapterGroup}>
          {storyChapters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={chapterId === item.id}
              className={chapterId === item.id ? 'is-active' : ''}
              onClick={() => selectChapter(item.id)}
            >
              <span>{item.index}</span>
              <strong>{locale === 'zh' ? item.title : item.titleEn}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        <figure className="story-media">
          <img
            key={chapter.image}
            src={chapter.image}
            alt={locale === 'zh' ? chapter.imageAlt : chapter.imageAltEn}
            width="1536"
            height="1024"
            loading="lazy"
            style={{ objectPosition: chapter.position }}
          />
          <figcaption>
            <span>{chapter.index}</span>
            <strong>{chapter.titleEn}</strong>
            <small>{chapter.location}</small>
          </figcaption>
          <span className="story-media__scan" aria-hidden="true" />
        </figure>

        <aside className={`dialogue-terminal dialogue-terminal--${channel}`} aria-label={copy.dialogue}>
          <div className="terminal-topline">
            <span>DUAL LINK / 23:47</span>
            <i className="status-dot status-dot--green" />
          </div>
          <div className="channel-tabs" role="group" aria-label={copy.channelGroup}>
            <button type="button" aria-pressed={channel === 'green'} className={channel === 'green' ? 'is-active' : ''} onClick={() => { setChannel('green'); setResponseChannel(null) }}>{copy.green}</button>
            <button type="button" aria-pressed={channel === 'pink'} className={channel === 'pink' ? 'is-active' : ''} onClick={() => { setChannel('pink'); setResponseChannel(null) }}>{copy.pink}</button>
          </div>
          <div className="dialogue-copy" aria-live="polite">
            <p><span className="dialogue-prompt">&gt;</span>{typedText}<i className="type-cursor" aria-hidden="true" /></p>
          </div>
          <div className="dialogue-choices">
            <button type="button" onClick={() => chooseChannel('green')}>
              <span>{copy.greenChoice}</span><ChevronRightIcon />
            </button>
            <button type="button" onClick={() => chooseChannel('pink')}>
              <span>{copy.pinkChoice}</span><ChevronRightIcon />
            </button>
          </div>
          <div className="terminal-controls">
            <button type="button" onClick={() => moveChapter(-1)} aria-label={copy.previous}>PREV</button>
            <button type="button" onClick={() => setResponseChannel(null)}>{copy.open}</button>
            <button type="button" onClick={() => moveChapter(1)} aria-label={copy.next}>NEXT</button>
          </div>
        </aside>
      </div>

      <div className="filmstrip" aria-label={copy.archive}>
        <span className="filmstrip__label">{copy.archive}</span>
        <div className="filmstrip__items">
          {storyChapters.map((item) => (
            <button key={item.id} type="button" className={chapterId === item.id ? 'is-active' : ''} onClick={() => selectChapter(item.id)} aria-label={locale === 'zh' ? `打开${item.title}` : `Open ${item.titleEn}`}>
              <img src={item.image} alt="" width="320" height="180" loading="lazy" style={{ objectPosition: item.position }} />
              <span>{item.index} / {locale === 'zh' ? item.title : item.titleEn}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
