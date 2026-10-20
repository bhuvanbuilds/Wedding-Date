import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, useGSAP)

/**
 * Motion language for the whole site. Every timeline pulls from here so the
 * experience feels like one film rather than a collection of effects.
 */
export const ease = {
  /** Entrances: long, soft settle. */
  enter: 'expo.out',
  /** Scene transitions: cinematic in-and-out. */
  scene: 'power3.inOut',
  /** Small UI responses. */
  ui: 'power2.out',
  /** Heartbeat & breathing. */
  breathe: 'sine.inOut',
} as const

export const duration = { xs: 0.3, s: 0.6, m: 1, l: 1.6, xl: 2.4 } as const

/**
 * Classes for SplitText pieces. Masks inherit them with a -mask suffix, which
 * base.css uses to give masks room for ascenders, descenders and swashes.
 */
export const splitClasses = { wordsClass: 'split-word', charsClass: 'split-char', linesClass: 'split-line' } as const

export const stagger = { chars: 0.035, words: 0.06, lines: 0.12, items: 0.1 } as const

/** Shared gsap.matchMedia conditions. */
export const mediaConditions = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
}

ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: ease.ui, duration: duration.s })

export { gsap, ScrollTrigger, SplitText, useGSAP }
