import { useRef, useState } from 'react'
import { ease, gsap, mediaConditions, useGSAP } from '../animations/gsap'
import { GlowField } from '../components/atmosphere/GlowField'
import { PetalField } from '../components/atmosphere/PetalField'
import { ScratchHeart } from '../components/reveal/ScratchHeart'
import { Rose, SectionLabel, WaxSeal } from '../components/shared/Decor'
import { Icon } from '../components/shared/Icon'
import { wedding } from '../config/wedding'
import { burst, burstFrom } from '../lib/fx'
import { scrollToSection } from '../lib/scroll'
import { formatLongDate } from '../lib/time'

export function InvitationSection() {
  const root = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const [revealed, setRevealed] = useState(false)
  const celebratedRef = useRef(false)

  // Card entrance as the guest arrives.
  const { context } = useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.invitation-card', start: 'top 85%', once: true },
          defaults: { ease: ease.enter },
        })
        if (reduce) {
          tl.from('.invitation-card, .scratch-instructions', { autoAlpha: 0, duration: 0.8 })
          return
        }
        tl.from('.invitation-card', { y: 70, rotate: -2.5, autoAlpha: 0, duration: 1.6 })
          .from('.invitation .rose', { scale: 0.6, autoAlpha: 0, duration: 1.8, stagger: 0.12 }, 0.1)
          .from('.card-content > *:not(.heart-scratch)', { y: 16, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.35)
          .from('.heart-scratch', { scale: 0.86, autoAlpha: 0, duration: 1.4 }, 0.55)
          .from(
            '.invitation .wax-seal',
            { scale: 1.6, autoAlpha: 0, rotate: -30, duration: 0.9, ease: 'back.out(1.6)' },
            1,
          )
          .from('.scratch-instructions > *', { y: 12, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.9)
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // The reveal moment — tweens join the section's GSAP context for cleanup.
  const celebrate = () => {
    const heart = root.current?.querySelector('.heart-scratch')
    const card = root.current?.querySelector('.invitation-card')
    if (!heart || !card) return
    const reduce = window.matchMedia(mediaConditions.reduce).matches
    const rect = heart.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    if (reduce) {
      context.add(() => {
        gsap.to('.scratch-canvas', { autoAlpha: 0, duration: 0.5 })
        gsap.fromTo('.heart-scratch__glow', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 })
        gsap.from('.invitation__after', { autoAlpha: 0, duration: 0.6, delay: 0.3 })
      })
      burst(cx, cy, { kinds: { spark: 20, heart: 6 }, speed: 200 })
      return
    }

    context.add(() => {
      const tl = gsap.timeline({ defaults: { ease: ease.enter } })
      tl.to('.scratch-canvas', { autoAlpha: 0, scale: 1.06, filter: 'blur(6px)', duration: 0.9, ease: 'power2.out' }, 0)
        .to(card, { scale: 1.035, y: -8, duration: 0.5, ease: 'power2.out' }, 0)
        .to(card, { scale: 1, y: 0, duration: 1.4, ease: 'elastic.out(1, 0.55)' }, 0.5)
        .fromTo('.heart-scratch__glow', { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 1.6 }, 0.1)
        .fromTo('.heart-date', { scale: 0.86 }, { scale: 1, duration: 1.6 }, 0.1)
        .fromTo('.date-month-year', { letterSpacing: '0em' }, { letterSpacing: '0.08em', duration: 1.6 }, 0.2)
        .add(() => burst(cx, cy, { kinds: { spark: 64, heart: 10 }, speed: 520, gravity: 90, life: 1.7 }), 0.15)
        .add(
          () =>
            burst(cx, rect.top + rect.height * 0.15, {
              kinds: { heart: 14 },
              angle: -Math.PI / 2,
              spread: 1.4,
              speed: 300,
              gravity: -20,
              life: 2.4,
            }),
          0.55,
        )
        .add(() => {
          burst(-10, window.innerHeight * 0.25, {
            kinds: { petal: 12 },
            angle: -0.15,
            spread: 0.7,
            speed: 420,
            gravity: 50,
            life: 2.6,
          })
          burst(window.innerWidth + 10, window.innerHeight * 0.3, {
            kinds: { petal: 12 },
            angle: Math.PI + 0.15,
            spread: 0.7,
            speed: 420,
            gravity: 50,
            life: 2.6,
          })
        }, 0.8)
        .add(
          () =>
            burstFrom(card, {
              kinds: { spark: 26, petal: 8 },
              angle: Math.PI / 2,
              spread: 1.2,
              speed: 240,
              gravity: 220,
              life: 2.2,
            }),
          1.3,
        )
        .from('.invitation__after > *', { autoAlpha: 0, y: 14, duration: 1, stagger: 0.12 }, 1.1)
    })
  }

  const revealDate = () => {
    if (celebratedRef.current) return
    celebratedRef.current = true
    setRevealed(true)
    if (progressRef.current) progressRef.current.style.setProperty('--progress', '1')
    requestAnimationFrame(() => celebrate())
  }

  const onProgress = (cleared: number) => {
    progressRef.current?.style.setProperty('--progress', String(Math.min(1, cleared / 0.6)))
  }

  const longDate = formatLongDate(wedding.weddingDate)

  return (
    <section
      id="invitation"
      ref={root}
      className="scene invitation"
      data-nav-theme="dark"
      aria-labelledby="invitation-title"
    >
      <div className="invitation__bg" aria-hidden="true" />
      <GlowField density={40} className="invitation__motes" />
      <PetalField density={5} wind={10} opacity={0.6} />
      <Rose className="rose-top-left" />
      <Rose className="rose-top-right" />
      <Rose className="rose-bottom-left" />
      <Rose className="rose-bottom-right" />

      <SectionLabel index="01" className="invitation__label">
        A little secret
      </SectionLabel>

      <article className="invitation-card">
        <div className="card-paper">
          <div className="card-content">
            <p className="eyebrow">With love, we invite you</p>
            <div className="ornament" aria-hidden="true">
              <span />
              <svg viewBox="0 0 24 24">
                <path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11Z" />
              </svg>
              <span />
            </div>
            <p className="card-names">
              {wedding.couple.partnerOne.fullName} <em>&amp;</em> {wedding.couple.partnerTwo.fullName}
            </p>
            <h2 id="invitation-title" className="card-teaser">
              {wedding.invitation.teaser}
            </h2>
            <ScratchHeart onReveal={revealDate} onProgress={onProgress} revealed={revealed} />
            <p className="card-revealed-line" aria-live="polite">
              {revealed ? longDate : ' '}
            </p>
            <div className="card-footer">
              <span>Forever begins</span>
              <span className="footer-flourish" aria-hidden="true">
                ✦
              </span>
              <span>with a little magic</span>
            </div>
          </div>
        </div>
        <WaxSeal className="invitation__seal" size={74} />
      </article>

      <div className="scratch-instructions">
        {!revealed ? (
          <>
            <p>{wedding.invitation.instruction}</p>
            <span className="scratch-progress" ref={progressRef} aria-hidden="true" />
            <button type="button" className="btn btn--ghost" onClick={revealDate}>
              <Icon name="sparkle" /> Reveal the date
            </button>
          </>
        ) : (
          <div className="invitation__after">
            <p className="invitation__save">Save the date</p>
            <button type="button" className="btn btn--glow" onClick={() => scrollToSection('date')}>
              <span>Count down with us</span>
              <Icon name="arrowDown" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
