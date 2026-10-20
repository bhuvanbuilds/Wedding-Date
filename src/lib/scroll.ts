import { gsap } from '../animations/gsap'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

/** Smoothly scrolls to a section. Guests can interrupt at any time. */
export function scrollToSection(id: string, options: { onComplete?: () => void; delay?: number } = {}) {
  const target = id === 'top' ? 0 : document.getElementById(id)
  if (target === null) return
  if (prefersReducedMotion()) {
    if (target === 0) window.scrollTo({ top: 0 })
    else target.scrollIntoView()
    options.onComplete?.()
    return
  }
  const destination = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY
  const distance = Math.abs(destination - window.scrollY)
  gsap.to(window, {
    scrollTo: { y: destination, autoKill: true },
    duration: Math.min(2, Math.max(0.8, distance / 2400)),
    delay: options.delay ?? 0,
    ease: 'power3.inOut',
    overwrite: true,
    onComplete: options.onComplete,
  })
}
