import { gsap } from '../animations/gsap'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

/** Smoothly scrolls to a section. Guests can interrupt at any time. */
export function scrollToSection(
  id: string,
  options: { onComplete?: () => void; delay?: number; duration?: number; ease?: string } = {},
) {
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
    duration: options.duration ?? Math.min(2, Math.max(1, distance / 2000)),
    delay: options.delay ?? 0,
    ease: options.ease ?? 'power3.inOut',
    overwrite: true,
    onComplete: options.onComplete,
  })
}
