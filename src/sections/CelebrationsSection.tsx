import { useRef } from 'react'
import { ease, gsap, mediaConditions, SplitText, splitClasses, useGSAP } from '../animations/gsap'
import { GlowField } from '../components/atmosphere/GlowField'
import { EventCard } from '../components/events/EventCard'
import { SectionLabel, VerticalRail } from '../components/shared/Decor'
import { wedding } from '../config/wedding'

export function CelebrationsSection() {
  const root = useRef<HTMLElement>(null)
  const [marriage, reception] = wedding.events

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        const cards = gsap.utils.toArray<HTMLElement>('.event-card')
        if (reduce) {
          cards.forEach((card) =>
            gsap.from(card, {
              autoAlpha: 0,
              duration: 0.8,
              scrollTrigger: { trigger: card, start: 'top 85%', once: true },
            }),
          )
          return
        }
        const title = new SplitText('.celebrations__title', { ...splitClasses, type: 'words,chars', mask: 'words' })
        gsap.from(title.chars, {
          yPercent: 160,
          duration: 1.2,
          ease: ease.enter,
          stagger: 0.03,
          scrollTrigger: { trigger: '.celebrations__title', start: 'top 85%', once: true },
        })
        cards.forEach((card) => {
          const tl = gsap.timeline({
            defaults: { ease: ease.enter },
            scrollTrigger: { trigger: card, start: 'top 82%', once: true },
          })
          tl.fromTo(
            card,
            { clipPath: 'inset(12% 6% 12% 6% round 4px)', autoAlpha: 0, y: 60 },
            {
              clipPath: 'inset(0% 0% 0% 0% round 4px)',
              autoAlpha: 1,
              y: 0,
              duration: 1.6,
              ease: 'expo.out',
              clearProps: 'clipPath',
            },
          )
            .from(card.querySelector('.event-card__numeral'), { autoAlpha: 0, scale: 0.6, duration: 1.4 }, 0.3)
            .from(
              card.querySelectorAll('.event-card__head > div > *'),
              { yPercent: 60, autoAlpha: 0, duration: 1, stagger: 0.08 },
              0.35,
            )
            .from(card.querySelectorAll('.event-row'), { x: -16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.55)
            .from(
              card.querySelectorAll('.event-card__actions > *'),
              { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.08 },
              0.85,
            )
            .from(card.querySelector('.event-card__sprig'), { autoAlpha: 0, rotate: -12, duration: 1.6 }, 0.5)
        })
        return () => title.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      id="celebrations"
      ref={root}
      className="scene celebrations"
      data-nav-theme="light"
      aria-labelledby="celebrations-title"
    >
      <div className="celebrations__bg" aria-hidden="true" />
      <div className="celebrations__evening" aria-hidden="true">
        <GlowField density={26} colors={['#D8B477', '#C61E45', '#F0C9CF']} rise={5} />
      </div>
      <VerticalRail side="left">Chapter 05 — Celebration</VerticalRail>

      <header className="celebrations__head">
        <SectionLabel index="05">Two celebrations</SectionLabel>
        <h2 id="celebrations-title" className="celebrations__title">
          Join us
        </h2>
        <p className="celebrations__lede">One love, celebrated twice — with the people who mean the most to us.</p>
      </header>

      <div className="celebrations__cards">
        <EventCard event={marriage} variant="light" numeral="I" />
        <div className="celebrations__dusk" aria-hidden="true">
          <span />
          <em>and then</em>
          <span />
        </div>
        <EventCard event={reception} variant="dark" numeral="II" />
      </div>
    </section>
  )
}
