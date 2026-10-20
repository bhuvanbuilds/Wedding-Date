import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useCanvasLoop } from '../../hooks/useCanvasLoop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isLowPower, qualityScale } from '../../lib/device'
import { glowSprite, palette } from '../../lib/sprites'

/** Values animated by GSAP; the canvas reads them every frame. */
export interface HeartState {
  /** 0 = scattered dust, 1 = fully formed heart. */
  gather: number
  /** Heartbeat amplitude 0–1. */
  beat: number
  /** Golden light behind the heart 0–1. */
  glow: number
  /** 0 = formed, 1 = swept out of frame. */
  disperse: number
  opacity: number
}

export interface HeartApi {
  center: () => { x: number; y: number; radius: number }
  ripple: (clientX: number, clientY: number) => void
}

interface Particle {
  hx: number
  hy: number
  sx: number
  sy: number
  delay: number
  size: number
  sprite: HTMLCanvasElement
  phase: number
  dirX: number
  dirY: number
  reach: number
  ox: number
  oy: number
  vx: number
  vy: number
  edge: boolean
}

/** Classic parametric heart, y-up, roughly x∈[-16,16], y∈[-17,12]. */
const curve = (t: number) => ({
  x: 16 * Math.pow(Math.sin(t), 3),
  y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
})

/** Implicit heart test in the same (screen, y-down) units: y∈[-12,17]. */
const inside = (x: number, y: number) => {
  const u = x / 14
  const v = -(y - 4.1) / 12.9
  const a = u * u + v * v - 1
  return a * a * a - u * u * v * v * v <= 0
}

const beatCurve = (time: number) => {
  const t = time % 1.25
  return Math.exp(-Math.pow(t / 0.07, 2)) + 0.62 * Math.exp(-Math.pow((t - 0.24) / 0.08, 2))
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3))

interface Props {
  stateRef: RefObject<HeartState>
  apiRef: RefObject<HeartApi | null>
  /** Element whose box the heart should fill (keeps it clear of the text). */
  anchorRef?: RefObject<HTMLElement | null>
  /** Fallback vertical position of the heart centre, as a fraction of height. */
  centerY?: number
  className?: string
}

export function HeartCanvas({ stateRef, apiRef, anchorRef, centerY = 0.36, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const geometry = useRef({ cx: 0, cy: 0, unit: 1, width: 0, height: 0 })
  const ripples = useRef<{ x: number; y: number; start: number }[]>([])
  const pointer = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })
  const clock = useRef(0)
  const reduced = useReducedMotion()

  const updateGeometry = (width: number, height: number) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const anchor = anchorRef?.current?.getBoundingClientRect()
    if (canvasRect && anchor && anchor.width > 0 && anchor.height > 0) {
      const unit = Math.min((anchor.height * 0.86) / 29, (anchor.width * 0.74) / 32, 12.5)
      geometry.current = {
        cx: anchor.left - canvasRect.left + anchor.width / 2,
        cy: anchor.top - canvasRect.top + anchor.height / 2,
        unit,
        width,
        height,
      }
    } else {
      const unit = Math.min(width * 0.31, height * 0.2, 200) / 16
      geometry.current = { cx: width / 2, cy: height * centerY, unit, width, height }
    }
  }

  // The anchor can change size without the canvas changing (fonts, rotation).
  useEffect(() => {
    const anchor = anchorRef?.current
    if (!anchor) return
    const observer = new ResizeObserver(() => updateGeometry(geometry.current.width, geometry.current.height))
    observer.observe(anchor)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRef])

  useEffect(() => {
    apiRef.current = {
      center: () => {
        const rect = canvasRef.current?.getBoundingClientRect()
        const g = geometry.current
        return { x: (rect?.left ?? 0) + g.cx, y: (rect?.top ?? 0) + g.cy, radius: g.unit * 16 }
      },
      ripple: (clientX, clientY) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        ripples.current.push({ x: clientX - rect.left, y: clientY - rect.top, start: clock.current })
        if (ripples.current.length > 4) ripples.current.shift()
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef])

  // Gentle pointer repulsion (works with touch drags too).
  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true }
    }
    const leave = () => {
      pointer.current.active = false
    }
    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerdown', move, { passive: true })
    host.addEventListener('pointerleave', leave)
    host.addEventListener('pointerup', leave)
    host.addEventListener('pointercancel', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerdown', move)
      host.removeEventListener('pointerleave', leave)
      host.removeEventListener('pointerup', leave)
      host.removeEventListener('pointercancel', leave)
    }
  }, [])

  useCanvasLoop(canvasRef, {
    animate: !reduced,
    resize: ({ width, height }) => {
      updateGeometry(width, height)
      if (particlesRef.current.length) {
        // keep particles, just rescale scatter targets
        for (const p of particlesRef.current) {
          p.sx = (Math.random() - 0.5) * width * 1.4
          p.sy = (Math.random() - 0.5) * height * 1.4
        }
        return
      }
      const count = Math.round((isLowPower ? 520 : 820) * Math.min(1.2, Math.max(0.7, qualityScale())))
      const sprites = {
        ruby: glowSprite(palette.ruby, 48, '#ffd6de'),
        blush: glowSprite('#f58aa3', 48, '#fff'),
        gold: glowSprite(palette.gold, 48, '#fff6e0'),
      }
      const particles: Particle[] = []
      for (let i = 0; i < count; i++) {
        const edge = i < count * 0.62
        let hx: number
        let hy: number
        if (edge) {
          const pt = curve(Math.random() * Math.PI * 2)
          const k = 0.94 + Math.random() * 0.1
          hx = pt.x * k
          hy = pt.y * k
        } else {
          do {
            hx = (Math.random() - 0.5) * 32
            hy = Math.random() * 29 - 12
          } while (!inside(hx, hy))
        }
        hy -= 2.5 // centre the heart's bounding box on (cx, cy)
        const angle = Math.atan2(hy, hx) + (Math.random() - 0.5) * 0.9
        const roll = Math.random()
        particles.push({
          hx,
          hy,
          sx: (Math.random() - 0.5) * width * 1.4,
          sy: (Math.random() - 0.5) * height * 1.4,
          delay: Math.random(),
          size: edge ? 2.2 + Math.random() * 4.2 : 1.6 + Math.random() * 3.4,
          sprite: roll < 0.12 ? sprites.gold : roll < 0.3 ? sprites.blush : sprites.ruby,
          phase: Math.random() * Math.PI * 2,
          dirX: Math.cos(angle),
          dirY: Math.sin(angle),
          reach: 0.6 + Math.random() * 0.9,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          edge,
        })
      }
      particlesRef.current = particles
    },
    draw: ({ ctx, width, height, dt, time }) => {
      clock.current = time
      const state = stateRef.current
      const { cx, cy, unit } = geometry.current
      ctx.clearRect(0, 0, width, height)
      if (!state || state.opacity <= 0.001) return

      const beat = reduced ? 0 : beatCurve(time) * state.beat
      const scale = unit * (1 + beat * 0.055)
      const far = Math.max(width, height)

      // Golden light behind the heart.
      if (state.glow > 0.01) {
        ctx.globalCompositeOperation = 'lighter'
        const halo = glowSprite('#b8324f', 128, '#f07a96')
        const size = unit * 34 * (1 + beat * 0.08) * (0.7 + state.glow * 0.5)
        ctx.globalAlpha = 0.38 * state.glow * state.opacity * (1 - state.disperse)
        ctx.drawImage(halo, cx - size / 2, cy - size * 0.55, size, size)
      }

      ctx.globalCompositeOperation = 'lighter'
      const p0 = pointer.current
      const ripplesNow = ripples.current.filter((r) => time - r.start < 1.6)
      ripples.current = ripplesNow
      const stiffness = 28
      const damping = 0.86

      for (const p of particlesRef.current) {
        const g = smooth((state.gather - p.delay * 0.45) / 0.55)
        const breathe = reduced ? 0 : Math.sin(time * 1.3 + p.phase) * 0.35
        const homeX = cx + (p.hx + breathe * 0.4) * scale
        const homeY = cy + (p.hy + breathe * 0.3) * scale
        let x = cx + p.sx + (homeX - cx - p.sx) * g
        let y = cy + p.sy + (homeY - cy - p.sy) * g

        if (state.disperse > 0) {
          const d = smooth(state.disperse * (0.7 + p.reach * 0.3)) * far * p.reach
          x += p.dirX * d
          y += p.dirY * d - state.disperse * far * 0.15
        }

        // Interaction offsets with a spring back to home.
        if (!reduced && g > 0.6) {
          let fx = 0
          let fy = 0
          if (p0.active) {
            const dx = x - p0.x
            const dy = y - p0.y
            const dist2 = dx * dx + dy * dy
            const radius = 70
            if (dist2 < radius * radius && dist2 > 0.01) {
              const dist = Math.sqrt(dist2)
              const force = (1 - dist / radius) * 900
              fx += (dx / dist) * force
              fy += (dy / dist) * force
            }
          }
          for (const r of ripplesNow) {
            const age = time - r.start
            const waveR = age * 260
            const dx = x - r.x
            const dy = y - r.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const band = Math.exp(-Math.pow((dist - waveR) / 26, 2)) * (1 - age / 1.6)
            fx += (dx / dist) * band * 2600
            fy += (dy / dist) * band * 2600
          }
          p.vx = (p.vx + (fx - p.ox * stiffness) * dt) * damping
          p.vy = (p.vy + (fy - p.oy * stiffness) * dt) * damping
          p.ox += p.vx * dt
          p.oy += p.vy * dt
          x += p.ox
          y += p.oy
        }

        const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(time * 2.2 + p.phase * 3)
        const alpha = (0.25 + g * 0.75) * twinkle * state.opacity * (1 - state.disperse * 0.85)
        if (alpha <= 0.01) continue
        ctx.globalAlpha = alpha
        const size = p.size * (1 + beat * (p.edge ? 0.35 : 0.15)) * (unit / 9)
        ctx.drawImage(p.sprite, x - size, y - size, size * 2, size * 2)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  })

  return <canvas ref={canvasRef} className={`canvas-fill ${className}`} aria-hidden="true" />
}
