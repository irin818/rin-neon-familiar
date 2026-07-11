import { useEffect, useState } from 'react'

const sectionIds = ['home', 'story', 'archive', 'game'] as const
export type SectionId = (typeof sectionIds)[number]

export function useScrollSpy(): SectionId {
  const [active, setActive] = useState<SectionId>('home')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible && sectionIds.includes(visible.target.id as SectionId)) {
          setActive(visible.target.id as SectionId)
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.1, 0.4] },
    )

    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return active
}
