import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ease, gsap, mediaConditions, useGSAP } from '../../animations/gsap'
import { wedding } from '../../config/wedding'
import { burst } from '../../lib/fx'
import { WaxSeal } from '../shared/Decor'

/**
 * The sealed envelope guests see first. Tapping the wax seal lifts the flap,
 * parts the envelope and reveals the invitation underneath.
 */
export function Envelope({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const opening = useRef(false)

  // The page stays put until the envelope is opened.
  useEffect(() => {
    if (open) return
    document.documentElement.classList.add('is-locked')
    window.scrollTo(0, 0)
    return () => document.documentElement.classList.remove('is-locked')
  }, [open])

  const { context } = useGSAP(
    () => {
      gsap.from('.envelope__hint, .envelope__names', { autoAlpha: 0, y: 10, duration: 1.2, delay: 0.4, stagger: 0.15 })
      gsap.from('.envelope__seal', { scale: 0.7, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.6)', delay: 0.2 })
    },
    { scope: root },
  )

  const openEnvelope = () => {
    if (opening.current) return
    opening.current = true
    const seal = root.current?.querySelector('.envelope__seal')?.getBoundingClientRect()
    const reduce = window.matchMedia(mediaConditions.reduce).matches
    const finish = () => {
      setOpen(true)
      onOpen()
    }
    if (reduce) {
      context.add(() => gsap.to(root.current, { autoAlpha: 0, duration: 0.5, onComplete: finish }))
      return
    }
    context.add(() => {
      gsap
        .timeline({ defaults: { ease: ease.scene }, onComplete: finish })
        .to('.envelope__hint, .envelope__names', { autoAlpha: 0, duration: 0.3 }, 0)
        .to('.envelope__seal', { scale: 1.18, duration: 0.18, ease: 'power2.out' }, 0)
        .add(() => {
          if (seal) {
            burst(seal.left + seal.width / 2, seal.top + seal.height / 2, {
              kinds: { spark: 30, heart: 10, petal: 10 },
              speed: 420,
              gravity: 80,
              life: 1.6,
            })
          }
        }, 0.16)
        .to('.envelope__seal', { scale: 0.4, autoAlpha: 0, rotate: 25, duration: 0.45, ease: 'power2.in' }, 0.18)
        .to('.envelope__flap--top', { rotateX: 178, duration: 0.9 }, 0.35)
        .set('.envelope__flap--top', { zIndex: 0 }, 0.8)
        .to('.envelope__flap--left', { xPercent: -105, duration: 1.1 }, 1.0)
        .to('.envelope__flap--right', { xPercent: 105, duration: 1.1 }, 1.0)
        .to('.envelope__flap--bottom', { yPercent: 105, duration: 1.1 }, 1.0)
        .to('.envelope__flap--top', { yPercent: -105, duration: 1.1 }, 1.0)
        .to('.envelope__inner', { autoAlpha: 0, duration: 0.8 }, 1.15)
    })
  }

  if (open) return null

  // Rendered at page level so it sits above the navigation and every section.
  return createPortal(
    <div ref={root} className="envelope" role="dialog" aria-modal="true" aria-label="Your invitation">
      <div className="envelope__inner" aria-hidden="true" />
      <div className="envelope__flap envelope__flap--left" aria-hidden="true" />
      <div className="envelope__flap envelope__flap--right" aria-hidden="true" />
      <div className="envelope__flap envelope__flap--bottom" aria-hidden="true" />
      <div className="envelope__flap envelope__flap--top" aria-hidden="true" />

      <p className="envelope__names">
        {wedding.couple.partnerOne.shortName} <em>&amp;</em> {wedding.couple.partnerTwo.shortName}
      </p>
      <button type="button" className="envelope__seal" onClick={openEnvelope} aria-label="Open the invitation">
        <WaxSeal size={118} />
      </button>
      <p className="envelope__hint">Tap the seal to open</p>
    </div>,
    document.body,
  )
}
