import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ease, gsap, mediaConditions, useGSAP } from '../animations/gsap'
import { SectionLabel, VerticalRail } from '../components/shared/Decor'
import { VenuePanel } from '../components/travel/VenuePanel'
import { venueById, wedding } from '../config/wedding'

export function TravelSection() {
  const root = useRef<HTMLElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // One tab per distinct venue, labelled by the events held there.
  const venues = useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const event of wedding.events) groups.set(event.venueId, [...(groups.get(event.venueId) ?? []), event.name])
    return Array.from(groups.entries())
      .map(([id, eventNames]) => ({ venue: venueById(id), eventNames }))
      .filter((item): item is { venue: NonNullable<typeof item.venue>; eventNames: string[] } => Boolean(item.venue))
  }, [])
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        gsap.from('.travel__head > *, .venue-tabs', {
          y: reduce ? 0 : 24,
          autoAlpha: 0,
          duration: reduce ? 0.6 : 1.1,
          ease: ease.enter,
          stagger: 0.1,
          scrollTrigger: { trigger: '.travel__head', start: 'top 85%', once: true },
        })
        gsap.from('.venue', {
          y: reduce ? 0 : 40,
          autoAlpha: 0,
          duration: reduce ? 0.6 : 1.3,
          ease: ease.enter,
          scrollTrigger: { trigger: '.venue', start: 'top 85%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + venues.length) % venues.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const current = venues[active]

  return (
    <section
      id="travel"
      ref={root}
      className="scene travel paper torn-top torn-bottom"
      data-nav-theme="light"
      aria-labelledby="travel-title"
    >
      <VerticalRail side="right">Chapter 05 — Find your way</VerticalRail>
      <header className="travel__head">
        <SectionLabel index="05">Find your way</SectionLabel>
        <h2 id="travel-title" className="travel__title">
          Getting there
        </h2>
        <p className="travel__lede">
          Everything you need on the day — one tap to the map, and the easiest ways to arrive.
        </p>
      </header>

      {venues.length > 1 && (
        <div className="venue-tabs" role="tablist" aria-label="Choose a venue">
          {venues.map((item, index) => (
            <button
              key={item.venue.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              role="tab"
              id={`venue-tab-${item.venue.id}`}
              aria-selected={active === index}
              aria-controls="venue-panel"
              tabIndex={active === index ? 0 : -1}
              className={active === index ? 'is-active' : ''}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onTabKey(event, index)}
            >
              {item.eventNames.join(' & ')}
            </button>
          ))}
          <span
            className="venue-tabs__indicator"
            style={{ transform: `translateX(${active * 100}%)`, width: `${100 / venues.length}%` }}
            aria-hidden="true"
          />
        </div>
      )}

      {current && (
        <div
          id="venue-panel"
          role={venues.length > 1 ? 'tabpanel' : undefined}
          aria-labelledby={venues.length > 1 ? `venue-tab-${current.venue.id}` : undefined}
          key={current.venue.id}
          className="venue-panel"
        >
          <VenuePanel venue={current.venue} eventNames={current.eventNames} />
        </div>
      )}
    </section>
  )
}
