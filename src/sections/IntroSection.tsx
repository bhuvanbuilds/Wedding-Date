import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { duration, ease, gsap, mediaConditions, SplitText, splitClasses, stagger, useGSAP } from '../animations/gsap'
import { GlowField } from '../components/atmosphere/GlowField'
import { PetalField } from '../components/atmosphere/PetalField'
import { HeartCanvas } from '../components/intro/HeartCanvas'
import type { HeartApi, HeartState } from '../components/intro/HeartCanvas'
import { VerticalRail } from '../components/shared/Decor'
import { Icon } from '../components/shared/Icon'
import { wedding } from '../config/wedding'
import { burst } from '../lib/fx'
import { scrollToSection } from '../lib/scroll'

export function IntroSection() {
  const root = useRef<HTMLElement>(null)
  const heartState = useRef<HeartState>({ gather: 0, beat: 0, glow: 0, disperse: 0, opacity: 0 })
  const heartApi = useRef<HeartApi | null>(null)
  const heartAnchor = useRef<HTMLButtonElement>(null)
  const introTimeline = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const leaving = useRef(false)

  const { context } = useGSAP(
    () => {
      const state = heartState.current
      const mm = gsap.matchMedia()

      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }

        if (reduce) {
          gsap.set(state, { gather: 1, glow: 1, beat: 0, opacity: 1, disperse: 0 })
          introTimeline.current = gsap
            .timeline()
            .to('.intro__veil', { autoAlpha: 0, duration: 0.6 })
            .from('[data-intro-fade]', { autoAlpha: 0, duration: 0.8, stagger: 0.08 })
          return
        }

        const names = new SplitText('.intro__name', { ...splitClasses, type: 'words,chars', mask: 'words' })
        const tagline = new SplitText('.intro__tagline', { ...splitClasses, type: 'words' })

        const tl = gsap.timeline({ defaults: { ease: ease.enter } })
        tl.to('.intro__veil', { autoAlpha: 0, duration: 1.4, ease: 'sine.out' })
          .to(state, { opacity: 1, duration: 0.9, ease: 'sine.out' }, 0.1)
          .to(state, { gather: 1, duration: 2.4, ease: 'power2.inOut' }, 0.15)
          .to(state, { glow: 1, duration: 2, ease: 'sine.inOut' }, 1.3)
          .to(state, { beat: 1, duration: 1.2, ease: 'sine.in' }, 1.9)
          .from('.intro__eyebrow', { autoAlpha: 0, y: 12, duration: duration.m }, 1.3)
          .from(names.chars, { yPercent: 160, rotate: 6, duration: 1.3, stagger: stagger.chars }, 1.5)
          .from('.intro__amp', { autoAlpha: 0, scale: 0.6, rotate: -12, duration: 1.6 }, 1.85)
          .from(tagline.words, { autoAlpha: 0, y: 14, filter: 'blur(6px)', duration: 1.1, stagger: stagger.words }, 2.3)
          .from('.intro__petals', { autoAlpha: 0, duration: 2.4, ease: 'sine.inOut' }, 1.8)
          .from('.intro__actions > *', { autoAlpha: 0, y: 18, duration: duration.m, stagger: stagger.items }, 2.6)
          .from('.intro__chrome', { autoAlpha: 0, duration: duration.m, stagger: 0.1 }, 0.4)
        introTimeline.current = tl

        return () => {
          names.revert()
          tagline.revert()
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  // Handlers add their tweens to the GSAP context so they are cleaned up on unmount.
  const onHeartTap = (event: MouseEvent<HTMLButtonElement>) => {
    const api = heartApi.current
    if (!api) return
    const center = api.center()
    const x = event.clientX || center.x
    const y = event.clientY || center.y
    api.ripple(x, y)
    burst(center.x, center.y - center.radius * 0.1, {
      kinds: { heart: 10, spark: 26 },
      speed: 260,
      gravity: -30,
      life: 1.4,
    })
    const state = heartState.current
    context.add(() =>
      gsap.fromTo(state, { glow: 1.7 }, { glow: 1, duration: 1.2, ease: 'sine.out', overwrite: 'auto' }),
    )
  }

  const enterStory = () => {
    if (leaving.current) return
    leaving.current = true
    introTimeline.current?.progress(1)
    const state = heartState.current
    const center = heartApi.current?.center()
    const reduce = window.matchMedia(mediaConditions.reduce).matches

    if (reduce) {
      scrollToSection('invitation', { onComplete: () => (leaving.current = false) })
      return
    }

    context.add(() =>
      gsap
        .timeline({
          onComplete: () => {
            // Quietly rebuild the opening for guests who scroll back up.
            gsap.set(state, { disperse: 0, gather: 0, glow: 0 })
            gsap.set('.intro__content', { autoAlpha: 1, y: 0 })
            gsap.to(state, { gather: 1, glow: 1, beat: 1, duration: 2.6, ease: 'power2.inOut' })
            leaving.current = false
          },
        })
        .to(state, { beat: 0, duration: 0.3, ease: 'sine.out' }, 0)
        .to(state, { glow: 2.2, duration: 0.35, ease: 'power2.out' }, 0)
        .to(state, { disperse: 1, duration: 1.5, ease: 'power2.in' }, 0.15)
        .to(state, { glow: 0, duration: 1, ease: 'sine.in' }, 0.4)
        .add(() => {
          if (!center) return
          burst(center.x, center.y, {
            kinds: { petal: 22, spark: 34, heart: 8 },
            speed: 620,
            gravity: 120,
            life: 1.8,
            scale: 1.1,
          })
        }, 0.2)
        .to('.intro__content', { autoAlpha: 0, y: -40, duration: 0.8, ease: ease.scene }, 0.1)
        .add(() => scrollToSection('invitation'), 0.55)
        .to({}, { duration: 1.6 }),
    )
  }

  const skipIntro = () => {
    introTimeline.current?.progress(1)
    scrollToSection('invitation')
  }

  return (
    <section id="top" ref={root} className="scene intro" data-nav-theme="dark" aria-label="Welcome">
      <div className="intro__bg" aria-hidden="true" />
      <GlowField density={70} className="intro__motes" />
      <div className="intro__petals">
        <PetalField density={9} wind={14} opacity={0.85} />
      </div>
      <HeartCanvas stateRef={heartState} apiRef={heartApi} anchorRef={heartAnchor} className="intro__heart" />
      <button
        ref={heartAnchor}
        type="button"
        className="intro__heart-hit"
        onClick={onHeartTap}
        aria-label="Touch the heart"
      />

      <div className="intro__content">
        <p className="intro__eyebrow" data-intro-fade>
          ({wedding.intro.eyebrow})
        </p>
        <h1 className="intro__names" data-intro-fade>
          <span className="intro__name">{wedding.couple.partnerOne.fullName}</span>
          <span className="intro__amp" aria-label="and">
            &amp;
          </span>
          <span className="intro__name">{wedding.couple.partnerTwo.fullName}</span>
        </h1>
        <p className="intro__tagline" data-intro-fade>
          {wedding.intro.tagline}
        </p>
        <div className="intro__actions" data-intro-fade>
          <button type="button" className="btn btn--glow" onClick={enterStory}>
            <span>Enter Our Story</span>
            <Icon name="heart" />
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection('celebrations')}>
            Straight to event details
          </button>
        </div>
      </div>

      <div className="intro__chrome intro__scroll" data-intro-fade aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
      <button type="button" className="intro__chrome intro__skip" data-intro-fade onClick={skipIntro}>
        Skip intro <Icon name="arrowDown" />
      </button>
      <VerticalRail side="right" className="intro__chrome">
        {wedding.verse.reference}
      </VerticalRail>
      <div className="intro__veil" aria-hidden="true" />
    </section>
  )
}
