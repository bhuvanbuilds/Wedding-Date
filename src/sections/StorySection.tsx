import { useRef } from 'react'
import { ease, gsap, mediaConditions, SplitText, splitClasses, useGSAP } from '../animations/gsap'
import { RoseSprig, SectionLabel, VerticalRail } from '../components/shared/Decor'
import { wedding } from '../config/wedding'
import type { Person, StoryPhoto } from '../types/wedding'

function ArchPortrait({ person, photo, side }: { person: Person; photo?: StoryPhoto; side: 'left' | 'right' }) {
  return (
    <figure className={`arch arch--${side}`}>
      <div className="arch__frame">
        {photo ? (
          <img
            className="arch__img"
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="arch__placeholder" aria-hidden="true">
            <RoseSprig className="arch__sprig" />
            <span className="arch__vertical">{person.fullName}</span>
          </div>
        )}
      </div>
      <figcaption className="arch__caption">{photo?.caption ?? person.fullName}</figcaption>
    </figure>
  )
}

export function StorySection() {
  const root = useRef<HTMLElement>(null)
  const { story, couple, verse } = wedding
  const [firstPhoto, secondPhoto, ...morePhotos] = story.photos

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.utils.toArray<HTMLElement>('.story [data-reveal]').forEach((el) =>
            gsap.from(el, {
              autoAlpha: 0,
              duration: 0.8,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }),
          )
          return
        }

        // Verse: words brighten as the guest reads down the page.
        const verseSplit = new SplitText('.verse__text', { ...splitClasses, type: 'words' })
        gsap.fromTo(
          verseSplit.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: '.verse', start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
          },
        )
        gsap.from('.verse__stamp', {
          scale: 1.8,
          rotate: -18,
          autoAlpha: 0,
          duration: 0.7,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: '.verse__ref', start: 'top 88%', once: true },
        })

        const title = new SplitText('.story__title', { ...splitClasses, type: 'chars', mask: 'chars' })
        gsap.from(title.chars, {
          yPercent: 160,
          duration: 1.3,
          ease: ease.enter,
          stagger: 0.05,
          scrollTrigger: { trigger: '.story__title', start: 'top 85%', once: true },
        })

        // Arches open like curtains, then drift gently.
        gsap.utils.toArray<HTMLElement>('.arch').forEach((arch, index) => {
          gsap.fromTo(
            arch.querySelector('.arch__frame'),
            { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 0 0)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 999px 999px 0 0)',
              duration: 1.8,
              ease: 'expo.inOut',
              delay: index * 0.18,
              scrollTrigger: { trigger: arch, start: 'top 85%', once: true },
            },
          )
          gsap.to(arch, {
            yPercent: index % 2 ? -10 : 6,
            ease: 'none',
            scrollTrigger: { trigger: '.arches', start: 'top bottom', end: 'bottom top', scrub: true },
          })
          const img = arch.querySelector('.arch__img')
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.18, yPercent: -6 },
              {
                scale: 1.05,
                yPercent: 6,
                ease: 'none',
                scrollTrigger: { trigger: arch, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            )
          }
        })
        gsap.from('.arches__amp', {
          autoAlpha: 0,
          scale: 0.5,
          duration: 1.4,
          ease: ease.enter,
          scrollTrigger: { trigger: '.arches', start: 'top 70%', once: true },
        })

        gsap.utils.toArray<HTMLElement>('.story [data-reveal]').forEach((el) =>
          gsap.from(el, {
            y: 28,
            autoAlpha: 0,
            duration: 1.2,
            ease: ease.enter,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
        )

        return () => {
          verseSplit.revert()
          title.revert()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      id="story"
      ref={root}
      className="scene story paper torn-top"
      data-nav-theme="light"
      aria-labelledby="story-title"
    >
      <VerticalRail side="right">Chapter 03 — Romance</VerticalRail>
      <RoseSprig className="story__sprig story__sprig--top" />

      <blockquote className="verse">
        <span className="verse__mark" aria-hidden="true">
          “
        </span>
        <p className="verse__text">{verse.text}</p>
        <footer className="verse__ref">
          <span className="verse__stamp" aria-hidden="true">
            {couple.monogram.replace(/\s+/g, '')}
          </span>
          <cite>
            {verse.reference} <small>({verse.translation})</small>
          </cite>
        </footer>
      </blockquote>

      <div className="story__head">
        <SectionLabel index="03">Then &amp; now</SectionLabel>
        <h2 id="story-title" className="story__title">
          {story.heading}
        </h2>
        {story.subtitle && <p className="story__subtitle">{story.subtitle}</p>}
      </div>

      {story.cover ? (
        <figure className="story__cover" data-reveal>
          <img
            src={story.cover.src}
            alt={story.cover.alt}
            width={story.cover.width}
            height={story.cover.height}
            loading="lazy"
            decoding="async"
          />
        </figure>
      ) : (
        <div className="arches">
          <ArchPortrait person={couple.partnerOne} photo={firstPhoto} side="left" />
          <span className="arches__amp" aria-hidden="true">
            &amp;
          </span>
          <ArchPortrait person={couple.partnerTwo} photo={secondPhoto} side="right" />
        </div>
      )}

      <div className="story__body">
        {story.intro ? (
          <p className="story__intro" data-reveal>
            {story.intro}
          </p>
        ) : (
          <p className="story__intro story__intro--quiet" data-reveal>
            Two names, one story — still being written,
            <br />
            and you are part of it.
          </p>
        )}
      </div>

      {story.chapters.length > 0 && (
        <ol className="timeline">
          {story.chapters.map((chapter) => (
            <li className="timeline__item" key={`${chapter.label}-${chapter.title}`} data-reveal>
              <span className="timeline__label">{chapter.label}</span>
              <h3 className="timeline__title">{chapter.title}</h3>
              <p className="timeline__body">{chapter.body}</p>
              {chapter.photo && (
                <img
                  className="timeline__photo"
                  src={chapter.photo.src}
                  alt={chapter.photo.alt}
                  width={chapter.photo.width}
                  height={chapter.photo.height}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </li>
          ))}
        </ol>
      )}

      {morePhotos.length > 0 && (
        <div className="story__gallery">
          {morePhotos.map((photo) => (
            <figure key={photo.src} className="story__photo" data-reveal>
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
              />
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
