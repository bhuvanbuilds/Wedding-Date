/** Rough device-capability heuristics used to scale particle budgets. */

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithMemory) : undefined

export const isLowPower = Boolean(nav && ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3))

export const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** Multiplier applied to particle counts. */
export function qualityScale() {
  if (typeof window === 'undefined') return 1
  const area = window.innerWidth * window.innerHeight
  const areaScale = Math.min(1.25, Math.max(0.55, area / (1280 * 800)))
  return (isLowPower ? 0.6 : 1) * areaScale
}

export const maxCanvasDpr = () => Math.min(window.devicePixelRatio || 1, isLowPower ? 1.5 : 2)
