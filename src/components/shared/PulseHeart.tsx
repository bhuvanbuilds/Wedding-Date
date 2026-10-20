/*
 * Adapted from "Pulse Heart" by React Bits — https://reactbits.dev/micro/pulse-heart
 * Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0 —
 * see THIRD_PARTY_NOTICES.md.
 *
 * Changes for this site: inline heart glyph (no icon package), a "tally" mode
 * where every tap adds one, wedding palette, and state handling that keeps
 * refs out of render for React's compiler rules.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent, PointerEvent } from 'react'
import './PulseHeart.css'

const HEART = 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z'
/** Portion of the animation spent contracting to a dot; the rest springs back. */
const OUT = 0.4

const back = (k: number, c: number) => {
  const u = k - 1
  return 1 + (c + 1) * u ** 3 + c * u ** 2
}
const swellOf = (t: number, c: number) =>
  t <= 0 ? 0 : t < OUT ? 1 - (1 - t / OUT) ** 3 : 1 - back((t - OUT) / (1 - OUT), c)
const format = (n: number) => new Intl.NumberFormat().format(n)
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

type Roll = { a: string; b: string; at: number; up: boolean }
type Cell = { ch: string } | { top: string; bottom: string }

export interface PulseHeartProps {
  defaultLiked?: boolean
  count?: number
  showCount?: boolean
  /** "toggle" likes/unlikes; "tally" adds one on every tap and stays lit. */
  mode?: 'toggle' | 'tally'
  onChange?: (liked: boolean, count: number, event: MouseEvent<HTMLButtonElement>) => void
  size?: number
  likedColor?: string
  idleColor?: string
  pillColor?: string
  textColor?: string
  duration?: number
  dotSize?: number
  overshoot?: number
  beat?: number
  rollDuration?: number
  label?: string
  className?: string
}

export function PulseHeart({
  defaultLiked = false,
  count = 0,
  showCount = true,
  mode = 'toggle',
  onChange,
  size = 22,
  likedColor = '#C61E45',
  idleColor = '#D8B477',
  pillColor = 'rgba(24, 5, 13, 0.45)',
  textColor = '#FFF7EC',
  duration = 560,
  dotSize = 0.3,
  overshoot = 1.7,
  beat = 3,
  rollDuration = 350,
  label = 'Send love',
  className = '',
}: PulseHeartProps) {
  const [liked, setLiked] = useState(defaultLiked)
  const [total, setTotal] = useState(count)
  // While the pulse plays, the old state stays on screen until the heart is a dot.
  const [snapshot, setSnapshot] = useState<{ liked: boolean; count: number } | null>(null)
  const [roll, setRoll] = useState<Roll | null>(null)
  const shown = snapshot ?? { liked, count: total }

  const rootRef = useRef<HTMLButtonElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const glyphRef = useRef<SVGGElement>(null)
  const rollRef = useRef<HTMLSpanElement>(null)
  const raf = useRef(0)
  const rollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const viaPointer = useRef(false)

  useLayoutEffect(() => {
    const el = rollRef.current
    if (!el || !roll) return
    el.style.transition = 'none'
    el.style.transform = `translateY(${roll.up ? '0' : '-1em'})`
    el.getBoundingClientRect()
    el.style.transition = ''
    el.style.transform = `translateY(${roll.up ? '-1em' : '0'})`
  }, [roll])

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      clearTimeout(rollTimer.current)
    },
    [],
  )

  const startRoll = (from: number, to: number) => {
    if (from === to) return
    const a = format(from)
    const b = format(to)
    const changed = a.length === b.length ? [...b].flatMap((ch, i) => (ch !== a[i] ? [i] : [])) : []
    setRoll({ a, b, at: changed.length === 1 ? changed[0] : -1, up: to > from })
    clearTimeout(rollTimer.current)
    rollTimer.current = setTimeout(() => setRoll(null), rollDuration)
  }

  const run = (from: { liked: boolean; count: number }, nextCount: number) => {
    const root = rootRef.current
    const pill = pillRef.current
    const glyph = glyphRef.current
    if (!root || !pill || !glyph) return
    setSnapshot(from)
    root.dataset.running = ''
    let swapped = false
    let prev = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const step = prev ? now - prev : 1000 / 60
      prev = now
      const s = swellOf(t, overshoot)
      glyph.setAttribute('transform', `translate(12 12) scale(${1 - (1 - dotSize) * s}) translate(-12 -12)`)
      pill.style.transform = `scale(${1 - (beat / 100) * s})`
      if (!swapped && t + step / 2 / duration >= OUT) {
        swapped = true
        setSnapshot(null)
        startRoll(from.count, nextCount)
      }
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
        return
      }
      raf.current = 0
      glyph.removeAttribute('transform')
      pill.style.transform = ''
      delete root.dataset.running
    }
    raf.current = requestAnimationFrame(tick)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    viaPointer.current = true
    if (!reducedMotion() && rootRef.current) rootRef.current.dataset.pressed = ''
  }
  const release = () => {
    if (rootRef.current) delete rootRef.current.dataset.pressed
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (raf.current) return
    const pointer = viaPointer.current && event.detail !== 0
    viaPointer.current = false
    const nextLiked = mode === 'tally' ? true : !liked
    const nextCount = mode === 'tally' ? total + 1 : total + (nextLiked ? 1 : -1)
    const from = { liked, count: total }
    setLiked(nextLiked)
    setTotal(nextCount)
    onChange?.(nextLiked, nextCount, event)
    if (pointer && !reducedMotion()) run(from, nextCount)
    else startRoll(from.count, nextCount)
  }

  const text = format(shown.count)
  const cells: Cell[] = roll
    ? roll.at === -1
      ? [{ top: roll.up ? roll.a : roll.b, bottom: roll.up ? roll.b : roll.a }]
      : [...roll.b].map((ch, i) =>
          i === roll.at ? { top: roll.up ? roll.a[i] : ch, bottom: roll.up ? ch : roll.a[i] } : { ch },
        )
    : [...text].map((ch) => ({ ch }))

  return (
    <button
      ref={rootRef}
      type="button"
      aria-pressed={mode === 'toggle' ? liked : undefined}
      data-liked={String(shown.liked)}
      data-no-count={showCount ? undefined : ''}
      className={`pulse-heart${className ? ` ${className}` : ''}`}
      style={
        {
          '--ph-size': `${size}px`,
          '--ph-pill': pillColor,
          '--ph-idle': idleColor,
          '--ph-liked': likedColor,
          '--ph-text': textColor,
          '--ph-roll': `${rollDuration}ms`,
          '--ph-stroke': `${(1.5 * size) / 24}px`,
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={() => {
        viaPointer.current = false
        release()
      }}
      onKeyDown={() => {
        viaPointer.current = false
      }}
      onClick={handleClick}
    >
      <span ref={pillRef} className="pulse-heart__pill">
        <span className="pulse-heart__heart" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g ref={glyphRef}>
              <path d={HEART} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </span>
        {showCount ? (
          <span className="pulse-heart__count" aria-hidden="true">
            {cells.map((cell, i) =>
              'ch' in cell ? (
                <span key={`c${i}`}>{cell.ch}</span>
              ) : (
                <span key={`r${i}`} className="pulse-heart__slot">
                  <span ref={rollRef} className="pulse-heart__roll">
                    <span>{cell.top}</span>
                    <span>{cell.bottom}</span>
                  </span>
                </span>
              ),
            )}
          </span>
        ) : null}
        <span className="pulse-heart__sr">{showCount ? `${label}, ${format(total)}` : label}</span>
      </span>
    </button>
  )
}
