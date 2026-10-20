import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { ease, gsap, mediaConditions, SplitText, useGSAP } from '../animations/gsap'
import { LanternSky } from '../components/atmosphere/LanternSky'
import type { LanternSkyApi } from '../components/atmosphere/LanternSky'
import { PetalField } from '../components/atmosphere/PetalField'
import { Icon } from '../components/shared/Icon'
import { wedding } from '../config/wedding'
import { burstFrom } from '../lib/fx'
import { scrollToSection } from '../lib/scroll'
import { formatLongDate } from '../lib/time'

const SECRET_TAPS = 5

export function FinaleSection() {
  const root = useRef<HTMLElement>(null)
  const sky = useRef<LanternSkyApi | null>(null)
  const [taps, setTaps] = useState(0)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const secretOpen = taps >= SECRET_TAPS

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.from('.finale__content > *', {
            autoAlpha: 0,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: { trigger: '.finale__content', start: 'top 80%', once: true },
          })
          return
        }
        const heading = new SplitText('.finale__title', { type: 'lines,words', mask: 'lines' })
        gsap
          .timeline({
            defaults: { ease: ease.enter },
            scrollTrigger: { trigger: '.finale__content', start: 'top 75%', once: true },
          })
          .from('.finale__eyebrow', { autoAlpha: 0, y: 10, duration: 1 })
          .from(heading.words, { yPercent: 110, duration: 1.5, stagger: 0.07 }, 0.15)
          .from('.finale__signature', { autoAlpha: 0, y: 14, filter: 'blur(6px)', duration: 1.4 }, 0.9)
          .from(
            '.finale__date, .finale__actions > *, .finale__secret-heart',
            { autoAlpha: 0, y: 14, duration: 1, stagger: 0.1 },
            1.2,
          )
        // The sky slowly deepens as the guest settles into the last scene.
        gsap.fromTo(
          '.finale__sky',
          { opacity: 0.35 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: true },
          },
        )
        return () => heading.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const releaseLantern = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return
    sky.current?.release(event.clientX, event.clientY)
  }

  const share = async () => {
    const url = wedding.siteUrl ?? window.location.href.split('#')[0]
    const text = `${wedding.couple.partnerOne.shortName} & ${wedding.couple.partnerTwo.shortName} — ${wedding.projectName}`
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareNote('Link copied — share the love.')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setShareNote(url)
    }
  }

  return (
    <section
      id="finale"
      ref={root}
      className="scene finale"
      data-nav-theme="dark"
      aria-labelledby="finale-title"
      onPointerDown={releaseLantern}
    >
      <div className="finale__bg" aria-hidden="true" />
      <div className="finale__sky">
        <LanternSky apiRef={sky} />
      </div>
      <div className="finale__petals" aria-hidden="true">
        <PetalField density={4} wind={8} opacity={0.5} />
      </div>
      <div className="finale__horizon" aria-hidden="true" />

      <div className="finale__content">
        <p className="finale__eyebrow">(07 — With gratitude)</p>
        <h2 id="finale-title" className="finale__title">
          {wedding.closing.heading}
        </h2>
        <p className="finale__signature">{wedding.closing.signature}</p>
        <p className="finale__date">{formatLongDate(wedding.weddingDate)}</p>

        <div className="finale__actions">
          <button type="button" className="btn btn--glow" onClick={() => scrollToSection('celebrations')}>
            <span>Revisit event details</span>
            <Icon name="calendar" />
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => void share()}>
            <Icon name="share" /> Share the invitation
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection('top')}>
            Back to the beginning <Icon name="arrowUp" />
          </button>
        </div>
        {shareNote && (
          <p className="finale__share-note" role="status">
            {shareNote}
          </p>
        )}

        <button
          type="button"
          className={`finale__secret-heart ${secretOpen ? 'is-open' : ''}`}
          aria-label={secretOpen ? 'Secret revealed' : 'A little heart'}
          onClick={(event) => {
            burstFrom(event.currentTarget, {
              kinds: { heart: 4 + taps * 2, spark: 8 },
              speed: 160 + taps * 40,
              gravity: -40,
              life: 1.2,
            })
            setTaps((value) => value + 1)
          }}
        >
          <Icon name="heart" />
        </button>
        <p className={`finale__secret ${secretOpen ? 'is-open' : ''}`} aria-live="polite">
          {secretOpen
            ? 'You found our little secret: every heart that taps here is a heart we are grateful for. See you on the day ✦'
            : taps > 0
              ? `${SECRET_TAPS - taps} more…`
              : ''}
        </p>
        <p className="finale__hint">Tap the sky to send a lantern of your own.</p>
      </div>
    </section>
  )
}
