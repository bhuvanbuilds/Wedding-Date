import { useRef, useState } from 'react'
import { ease, gsap, mediaConditions, SplitText, splitClasses, useGSAP } from '../animations/gsap'
import { DepthCarousel } from '../components/gallery/DepthCarousel'
import type { DepthCarouselItem } from '../components/gallery/DepthCarousel'
import { SectionLabel } from '../components/shared/Decor'
import { wedding } from '../config/wedding'
import type { GalleryPhoto } from '../types/wedding'

/** Responsive sources for CDN images (Unsplash); local files are used as-is. */
function toItem(photo: GalleryPhoto): DepthCarouselItem {
  const base = { alt: photo.alt, sample: photo.sample }
  if (!photo.src.includes('images.unsplash.com')) return { ...base, image: photo.src }
  const at = (w: number) =>
    photo.src.replace(/([?&])w=\d+/, `$1w=${w}`).replace(/fit=crop/, 'fit=crop&h=' + Math.round(w * 1.32))
  return { ...base, image: at(640), srcSet: `${at(420)} 420w, ${at(640)} 640w, ${at(900)} 900w` }
}

const pad = (n: number) => String(n).padStart(2, '0')
const items = wedding.gallery.photos.map(toItem)

/** "Moments" — a gallery of photographs in a swipeable depth carousel. */
export function MomentsSection() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const { gallery } = wedding
  const total = gallery.photos.length
  const current = gallery.photos[active]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.from('.moments__head > *, .moments__stage, .moments__caption', {
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
          })
          return
        }
        const title = new SplitText('.moments__title', { ...splitClasses, type: 'words,chars', mask: 'words' })
        gsap
          .timeline({
            defaults: { ease: ease.enter },
            scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
          })
          .from('.moments__head .section-label', { autoAlpha: 0, y: 12, duration: 1 })
          .from(title.chars, { yPercent: 160, duration: 1.2, stagger: 0.03 }, 0.1)
          .from('.moments__lede', { autoAlpha: 0, y: 14, duration: 1 }, 0.4)
          .from('.moments__stage', { autoAlpha: 0, y: 50, rotate: -1.5, duration: 1.5 }, 0.45)
          .from('.moments__caption', { autoAlpha: 0, y: 12, duration: 1 }, 0.9)
        return () => title.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  if (!total) return null

  return (
    <section
      id="moments"
      ref={root}
      className="scene moments paper"
      data-nav-theme="light"
      aria-labelledby="moments-title"
    >
      <header className="moments__head">
        <SectionLabel index="04">Moments</SectionLabel>
        <h2 id="moments-title" className="moments__title">
          {gallery.heading}
        </h2>
        <p className="moments__lede">{gallery.intro}</p>
      </header>

      <div className="moments__stage">
        <DepthCarousel
          items={items}
          label={gallery.heading}
          onChange={setActive}
          cardWidth={300}
          cardHeight={400}
          spread={40}
          depth={170}
        />
      </div>

      <p className="moments__caption" aria-live="polite">
        <span className="moments__count">
          {pad(active + 1)} <small>/ {pad(total)}</small>
        </span>
        {current?.caption && <span className="moments__text">{current.caption}</span>}
      </p>
      <p className="moments__hint" aria-hidden="true">
        Swipe or tap the photos
      </p>
    </section>
  )
}
