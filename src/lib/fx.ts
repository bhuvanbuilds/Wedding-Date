import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { isLowPower, maxCanvasDpr } from './device'
import { glowSprite, heartSprite, palette, petalSprites } from './sprites'

/**
 * One fixed, full-screen effects canvas shared by the whole site for
 * celebratory bursts (heart taps, the date reveal, sent wishes).
 * It only runs a RAF loop while particles are alive.
 */

type Kind = 'spark' | 'heart' | 'petal'

interface Particle {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  rotation: number
  spin: number
  sprite: HTMLCanvasElement
  gravity: number
  drag: number
  flutter: number
}

export interface BurstOptions {
  count?: number
  kinds?: Partial<Record<Kind, number>>
  /** Initial speed in px/s. */
  speed?: number
  /** Direction bias in radians; undefined = all directions. */
  angle?: number
  spread?: number
  gravity?: number
  colors?: string[]
  life?: number
  /** Scale applied to particle sizes. */
  scale?: number
}

const MAX_PARTICLES = isLowPower ? 160 : 320

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let raf = 0
let last = 0
let dpr = 1

function resize() {
  if (!canvas) return
  dpr = maxCanvasDpr()
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
}

export function attachFxCanvas(element: HTMLCanvasElement) {
  canvas = element
  ctx = element.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  return () => {
    window.removeEventListener('resize', resize)
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    particles = []
    canvas = null
    ctx = null
  }
}

function frame(now: number) {
  raf = 0
  if (!ctx || !canvas) return
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const alive: Particle[] = []
  for (const p of particles) {
    p.life += dt
    if (p.life >= p.maxLife) continue
    const dragFactor = Math.pow(p.drag, dt * 60)
    p.vx *= dragFactor
    p.vy = p.vy * dragFactor + p.gravity * dt
    if (p.kind === 'petal') p.vx += Math.sin(p.life * 3 + p.flutter) * 18 * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.rotation += p.spin * dt
    alive.push(p)

    const t = p.life / p.maxLife
    const alpha = t < 0.12 ? t / 0.12 : 1 - Math.pow((t - 0.12) / 0.88, 1.6)
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.globalCompositeOperation = p.kind === 'spark' ? 'lighter' : 'source-over'
    const size = p.kind === 'spark' ? p.size * (1 - t * 0.5) : p.size
    if (p.rotation !== 0 || p.kind === 'petal') {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      if (p.kind === 'petal') ctx.scale(Math.cos(p.life * 4 + p.flutter) * 0.5 + 0.6, 1)
      ctx.drawImage(p.sprite, -size / 2, -size / 2, size, size)
      ctx.restore()
    } else {
      ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size)
    }
  }
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  particles = alive
  if (particles.length) raf = requestAnimationFrame(frame)
}

function ensureRunning() {
  if (raf || !ctx) return
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

const defaultColors = [palette.gold, palette.blush, palette.ruby, '#ffe3b0', palette.rose]

/** Emits a burst of particles at viewport coordinates (clientX / clientY). */
export function burst(x: number, y: number, options: BurstOptions = {}) {
  if (!ctx) return
  const reduce = prefersReducedMotion()
  const scale = options.scale ?? 1
  const kinds = options.kinds ?? { spark: options.count ?? 24 }
  const colors = options.colors ?? defaultColors
  const petals = petalSprites()
  const baseSpeed = options.speed ?? 320

  for (const [kind, rawCount] of Object.entries(kinds) as [Kind, number][]) {
    const count = Math.min(
      Math.round(rawCount * (isLowPower ? 0.6 : 1) * (reduce ? 0.3 : 1)),
      MAX_PARTICLES - particles.length,
    )
    for (let i = 0; i < count; i++) {
      const angle =
        options.angle === undefined
          ? Math.random() * Math.PI * 2
          : options.angle + (Math.random() - 0.5) * (options.spread ?? Math.PI / 2)
      const speed = baseSpeed * (0.35 + Math.random() * 0.8) * (reduce ? 0.3 : 1)
      const color = colors[Math.floor(Math.random() * colors.length)]
      let sprite: HTMLCanvasElement
      let size: number
      if (kind === 'heart') {
        sprite = heartSprite(Math.random() > 0.4 ? palette.ruby : '#e8577a')
        size = (12 + Math.random() * 14) * scale
      } else if (kind === 'petal') {
        sprite = petals[Math.floor(Math.random() * petals.length)]
        size = (16 + Math.random() * 16) * scale
      } else {
        sprite = glowSprite(color, 48)
        size = (5 + Math.random() * 12) * scale
      }
      particles.push({
        kind,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: (options.life ?? 1.6) * (0.6 + Math.random() * 0.7) * (kind === 'petal' ? 2 : 1),
        size,
        rotation: kind === 'spark' ? 0 : Math.random() * Math.PI * 2,
        spin: kind === 'spark' ? 0 : (Math.random() - 0.5) * (kind === 'petal' ? 3 : 1.4),
        sprite,
        gravity: options.gravity ?? (kind === 'heart' ? -40 : kind === 'petal' ? 60 : 140),
        drag: kind === 'spark' ? 0.94 : kind === 'petal' ? 0.96 : 0.95,
        flutter: Math.random() * Math.PI * 2,
      })
    }
  }
  ensureRunning()
}

/** Burst centred on an element. */
export function burstFrom(element: Element, options?: BurstOptions) {
  const rect = element.getBoundingClientRect()
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, options)
}
