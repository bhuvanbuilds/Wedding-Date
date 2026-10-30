import { useRef } from 'react'
import { ease, gsap, mediaConditions, SplitText, splitClasses, useGSAP } from '../animations/gsap'
import { RoseSprig, SectionLabel } from '../components/shared/Decor'
import { wedding } from '../config/wedding'
import type { GalleryPhoto } from '../types/wedding'

/** Responsive sources for CDN images (Unsplash); local files are used as-is. */
function sources(photo: GalleryPhoto) {
  if (!photo.src.includes('images.unsplash.com')) return { src: photo.src }
  const at = (w: number) => photo.src.replace(/([?&])w=\d+/, `$1w=${w}`)
  return { src: at(900), srcSet: `${at(480)} 480w, ${at(720)} 720w, ${at(1100)} 1100w` }
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * "Moments" — scrolling down locks the section and glides a strip of
 * photographs sideways; at the end of the strip the page carries on down.
 * With reduced motion it becomes a plain swipeable row.
 */
export function MomentsSection() {
  const root = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const { gallery } = wedding
  const total = gallery.photos.length

  useGSAP(
    () => {
      const section = root.current
      const track = trackRef.current
      if (!section || !track) return
      const mm = gsap.matchMedia()

      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.from('.moments__head > *', {
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.08,
            scrollTrigger: { trigger: section, start: 'top 75%', once: true },
          })
          return
        }

        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
        const frames = gsap.utils.toArray<HTMLElement>('.moment')

        // One timeline drives the strip, the counter, the progress line and the dusk tint.
        const strip = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`
              if (counterRef.current) {
                counterRef.current.textContent = pad(
                  Math.min(total, Math.max(1, Math.round(self.progress * (total - 1)) + 1)),
                )
              }
            },
          },
        })

        gsap.fromTo(
          '.moments__dusk',
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true },
          },
        )

        frames.forEach((frame, index) => {
          const img = frame.querySelector('img')
          // Photos drift inside their frames as the strip moves — a window, not a slide.
          if (img) {
            gsap.fromTo(
              img,
              { xPercent: -7 },
              {
                xPercent: 7,
                ease: 'none',
                scrollTrigger: {
                  containerAnimation: strip,
                  trigger: frame,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              },
            )
          }
          gsap.from(frame.querySelector('.moment__frame'), {
            clipPath: index % 2 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: {
              containerAnimation: strip,
              trigger: frame,
              start: 'left 92%',
              toggleActions: 'play none none reverse',
            },
          })
          gsap.from(frame.querySelector('figcaption'), {
            autoAlpha: 0,
            y: 14,
            duration: 1,
            ease: ease.enter,
            scrollTrigger: {
              containerAnimation: strip,
              trigger: frame,
              start: 'left 80%',
              toggleActions: 'play none none reverse',
            },
          })
        })

        const title = new SplitText('.moments__title', { ...splitClasses, type: 'words,chars', mask: 'words' })
        gsap.from(title.chars, {
          yPercent: 160,
          duration: 1.2,
          ease: ease.enter,
          stagger: 0.03,
          scrollTrigger: { trigger: section, start: 'top 70%', once: true },
        })
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
      <div className="moments__dusk" aria-hidden="true" />
      <header className="moments__head">
        <SectionLabel index="04">Moments</SectionLabel>
        <h2 id="moments-title" className="moments__title">
          {gallery.heading}
        </h2>
        <p className="moments__meta" aria-hidden="true">
          <span ref={counterRef} className="moments__count">
            01
          </span>
          <span className="moments__of">/ {pad(total)}</span>
          <span className="moments__progress">
            <span ref={progressRef} />
          </span>
        </p>
      </header>

      <ol className="moments__track" ref={trackRef}>
        <li className="moments__intro">
          <RoseSprig className="moments__sprig" />
          <p>{gallery.intro}</p>
          <span className="moments__hint" aria-hidden="true">
            keep scrolling <i>→</i>
          </span>
        </li>
        {gallery.photos.map((photo, index) => {
          const { src, srcSet } = sources(photo)
          return (
            <li key={photo.src} className={`moment moment--${photo.shape} moment--${index % 2 ? 'low' : 'high'}`}>
              <figure>
                <div className="moment__frame">
                  <img
                    src={src}
                    srcSet={srcSet}
                    sizes="(max-width: 700px) 80vw, 40vw"
                    alt={photo.alt}
                    style={{ objectPosition: photo.objectPosition }}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                  {photo.sample && <span className="moment__sample">Sample photo</span>}
                </div>
                <figcaption>
                  <span className="moment__num">{pad(index + 1)}</span>
                  {photo.caption && <span className="moment__caption">{photo.caption}</span>}
                </figcaption>
              </figure>
            </li>
          )
        })}
        <li className="moments__outro">
          <p>{gallery.outro}</p>
        </li>
      </ol>
    </section>
  )
}
