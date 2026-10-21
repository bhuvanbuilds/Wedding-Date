/*
 * Adapted from "Depth Carousel" by React Bits — https://reactbits.dev/components/depth-carousel
 * Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0 —
 * see THIRD_PARTY_NOTICES.md.
 *
 * Changes for this site: only horizontal wheel/trackpad gestures move the
 * carousel (vertical scrolling always reaches the page), depth is shown with
 * the tint overlay instead of per-frame CSS filters (cheaper on phones),
 * responsive lazy images, a "sample" tag, wedding styling, and refs updated in
 * effects for React's compiler rules.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { gsap } from '../../animations/gsap'
import './DepthCarousel.css'

export interface DepthCarouselItem {
  image: string
  srcSet?: string
  alt?: string
  sample?: boolean
}

type TiltDirection = 'left' | 'right'

export interface DepthCarouselProps {
  items: DepthCarouselItem[]
  cardWidth?: number
  cardHeight?: number
  radius?: number
  tint?: string
  depth?: number
  spread?: number
  tilt?: number
  tiltDirection?: TiltDirection
  perspective?: number
  visibleCards?: number
  falloff?: number
  duration?: number
  ease?: string
  loop?: boolean
  showControls?: boolean
  showIndicators?: boolean
  label?: string
  onChange?: (index: number) => void
  className?: string
}

interface CarouselConfig {
  count: number
  depth: number
  spread: number
  tilt: number
  tiltDirection: TiltDirection
  visibleCards: number
  falloff: number
  duration: number
  ease: string
  loop: boolean
  cardWidth: number
}

interface DragState {
  x: number
  startPos: number
  lastX: number
  lastT: number
  v: number
  moved: boolean
  id: number
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function DepthCarousel({
  items,
  cardWidth = 280,
  cardHeight = 370,
  radius = 4,
  tint = '#18050d',
  depth = 180,
  spread = 56,
  tilt = 18,
  tiltDirection = 'right',
  perspective = 1300,
  visibleCards = 3,
  falloff = 0.22,
  duration = 700,
  ease = 'power3.out',
  loop = true,
  showControls = true,
  showIndicators = true,
  label = 'Photo gallery',
  onChange,
  className = '',
}: DepthCarouselProps) {
  const count = items.length

  const rootRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([])

  const posRef = useRef(0)
  const focusRef = useRef(0)
  const tweenRef = useRef<ReturnType<typeof gsap.to> | null>(null)
  const scaleRef = useRef(1)
  const onChangeRef = useRef(onChange)
  const dragRef = useRef<DragState | null>(null)
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedRef = useRef(false)

  const [active, setActive] = useState(0)

  const config = useMemo<CarouselConfig>(
    () => ({ count, depth, spread, tilt, tiltDirection, visibleCards, falloff, duration, ease, loop, cardWidth }),
    [count, depth, spread, tilt, tiltDirection, visibleCards, falloff, duration, ease, loop, cardWidth],
  )
  const cfgRef = useRef(config)

  const layout = useCallback((pos: number) => {
    const cfg = cfgRef.current
    const n = cfg.count
    if (!n) return
    const dir = cfg.tiltDirection === 'left' ? -1 : 1
    const sc = scaleRef.current

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i]
      if (!el) continue

      let d = i - pos
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n
        if (d > n / 2) d -= n
      }

      const back = Math.max(0, d)
      const shown = Math.abs(d) <= cfg.visibleCards + 0.5
      const tz = -cfg.depth * d
      const tx = dir * cfg.spread * d
      const ry = dir * cfg.tilt * clamp(d, 0, 1)

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1
      if (!shown) opacity = 0

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`
      el.style.opacity = opacity.toFixed(3)
      el.style.zIndex = String(Math.round(2000 - d * 20))
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none'
      el.style.visibility = opacity > 0.001 ? 'visible' : 'hidden'

      const ov = overlayRefs.current[i]
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.35, 0, 0.88).toFixed(3)
    }
  }, [])

  // Keep the latest props available to gesture handlers without re-binding them.
  useLayoutEffect(() => {
    cfgRef.current = config
    onChangeRef.current = onChange
    layout(posRef.current)
  }, [config, onChange, layout])

  const notify = useCallback((idx: number) => {
    setActive(idx)
    onChangeRef.current?.(idx)
  }, [])

  const tweenTo = useCallback(
    (target: number, animate: boolean) => {
      tweenRef.current?.kill()
      const cfg = cfgRef.current
      const proxy = { p: posRef.current }
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p
          layout(proxy.p)
        },
        onComplete: () => {
          const n = cfg.count
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n
          layout(posRef.current)
        },
      })
    },
    [layout],
  )

  const setFocus = useCallback(
    (rawIndex: number, animate = true) => {
      const cfg = cfgRef.current
      const n = cfg.count
      if (!n) return
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1)
      let delta = idx - posRef.current
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n
        if (delta > n / 2) delta -= n
      }
      tweenTo(posRef.current + delta, animate)
      if (idx !== focusRef.current) {
        focusRef.current = idx
        notify(idx)
      }
    },
    [tweenTo, notify],
  )

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step, true), [setFocus])

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      const cfg = cfgRef.current
      // Less reserved edge room than the original (60 vs 120px) so photos stay large on phones.
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 60
      scaleRef.current = clamp(w / needed, 0.4, 1)
      layout(posRef.current)
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [layout])

  // Only clearly horizontal wheel/trackpad gestures move the carousel, so a
  // guest scrolling down the page never gets stuck on it.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const cfg = cfgRef.current
      if (cfg.count < 2 || Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return
      e.preventDefault()
      tweenRef.current?.kill()
      const delta = e.deltaMode === 1 ? e.deltaX * 24 : e.deltaX
      posRef.current += clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6)
      layout(posRef.current)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
    }
  }, [layout, setFocus])

  useEffect(
    () => () => {
      tweenRef.current?.kill()
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
    },
    [],
  )

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (cfgRef.current.count < 2) return
    tweenRef.current?.kill()
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId,
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const stepPx = Math.max(cfgRef.current.cardWidth * 0.55 * scaleRef.current, 40)
    const dx = e.clientX - drag.x
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true
      rootRef.current?.setPointerCapture(drag.id)
    }
    if (!drag.moved) return
    const now = performance.now()
    drag.v = (e.clientX - drag.lastX) / Math.max(now - drag.lastT, 1)
    drag.lastX = e.clientX
    drag.lastT = now
    posRef.current = drag.startPos - dx / stepPx
    layout(posRef.current)
  }

  const onPointerEnd = () => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (!drag.moved) {
      // A plain tap: if it never moved, snap back to the focused card.
      setFocus(focusRef.current, true)
      return
    }
    const stepPx = Math.max(cfgRef.current.cardWidth * 0.55 * scaleRef.current, 40)
    setFocus(Math.round(posRef.current - (drag.v * 180) / stepPx), true)
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      navigateBy(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      navigateBy(1)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ '--dc-perspective': `${perspective}px` } as CSSProperties}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage">
        {items.map((item, i) => (
          <div
            key={item.image}
            className="depth-carousel__card"
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={active !== i}
            onClick={() => {
              if (!dragRef.current?.moved) setFocus(i, true)
            }}
          >
            <img
              className="depth-carousel__img"
              src={item.image}
              srcSet={item.srcSet}
              sizes={`${cardWidth}px`}
              alt={item.alt ?? ''}
              loading={i < 3 || i > count - 2 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
            {item.sample && <span className="depth-carousel__sample">Sample photo</span>}
            <span
              className="depth-carousel__tint"
              ref={(el) => {
                overlayRefs.current[i] = el
              }}
              style={{ background: tint }}
            />
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous photo"
            onClick={() => navigateBy(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next photo"
            onClick={() => navigateBy(1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Photos">
          {items.map((item, i) => (
            <button
              key={item.image}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to photo ${i + 1}`}
              className={`depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={() => setFocus(i, true)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
