import { useRef, useState } from 'react'
import { ease, gsap, mediaConditions, SplitText, splitClasses, stagger, useGSAP } from '../animations/gsap'
import { PetalField } from '../components/atmosphere/PetalField'
import { Envelope } from '../components/intro/Envelope'
import { VerticalRail } from '../components/shared/Decor'
import { Icon } from '../components/shared/Icon'
import { wedding } from '../config/wedding'
import { scrollToSection } from '../lib/scroll'

/**
 * Opening: a sealed envelope, then the couple's photograph with their names
 * and the invitation line. The wedding date stays a secret for the scratch card.
 */
export function IntroSection() {
  const root = useRef<HTMLElement>(null)
  const [opened, setOpened] = useState(false)

  const { context } = useGSAP(
    () => {
      // Held hidden until the envelope opens.
      gsap.set('.hero__photo', { scale: 1.12 })
    },
    { scope: root },
  )

  const reveal = () => {
    setOpened(true)
    const reduce = window.matchMedia(mediaConditions.reduce).matches
    context.add(() => {
      if (reduce) {
        gsap.set('.hero__photo', { scale: 1 })
        gsap.from('.hero__content > *', { autoAlpha: 0, duration: 0.6, stagger: 0.06 })
        return
      }
      const names = new SplitText('.hero__name', { ...splitClasses, type: 'words,chars', mask: 'words' })
      gsap
        .timeline({ defaults: { ease: ease.enter } })
        .to('.hero__photo', { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
        .from('.hero__eyebrow', { autoAlpha: 0, y: 12, duration: 1 }, 0.35)
        .from(names.chars, { yPercent: 160, duration: 1.2, stagger: stagger.chars }, 0.5)
        .from('.hero__amp', { autoAlpha: 0, scale: 0.6, duration: 1.3 }, 0.8)
        .from('.hero__invite, .hero__secret', { autoAlpha: 0, y: 14, duration: 1, stagger: 0.12 }, 1.1)
        .from('.hero__actions > *', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 }, 1.4)
    })
  }

  return (
    <section
      id="top"
      ref={root}
      className={`scene hero ${opened ? 'is-open' : ''}`}
      data-nav-theme="dark"
      aria-label="Welcome"
    >
      <Envelope onOpen={reveal} />
      <div className="hero__photo">
        <img
          className="hero__img"
          src="/photos/hero-600.jpg"
          srcSet="/photos/hero-600.jpg 600w, /photos/hero-887.jpg 887w"
          sizes="(max-width: 700px) 100vw, 560px"
          width={887}
          height={1774}
          alt={`${wedding.couple.partnerOne.fullName} and ${wedding.couple.partnerTwo.fullName}`}
          fetchPriority="high"
          decoding="async"
        />
        {/* Same photo, blurred, shown only from ~70% down — a soft lens fade into the invitation. */}
        <img
          className="hero__img hero__img--blur"
          src="/photos/hero-600.jpg"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      </div>{' '}
      <div className="hero__petals" aria-hidden="true">
        {opened && <PetalField density={5} wind={10} opacity={0.7} />}
      </div>
      <div className="hero__content">
        <p className="hero__eyebrow">Together with their families</p>
        <h1 className="hero__names">
          <span className="hero__heart" aria-hidden="true" />
          <span className="hero__name">{wedding.couple.partnerOne.fullName}</span>
          <span className="hero__amp" aria-label="and">
            &amp;
          </span>
          <span className="hero__name">{wedding.couple.partnerTwo.fullName}</span>
        </h1>
        <p className="hero__invite">invite you to join them in celebrating their marriage</p>
        <p className="hero__secret">{wedding.invitation.teaser}</p>
        <div className="hero__actions">
          <button
            type="button"
            className="btn btn--glow"
            onClick={() => scrollToSection('invitation', { duration: 1.6 })}
          >
            <span>Open our invitation</span>
            <Icon name="arrowDown" />
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection('celebrations')}>
            Straight to event details
          </button>
        </div>
      </div>
      <VerticalRail side="right">{wedding.verse.reference}</VerticalRail>
    </section>
  )
}
