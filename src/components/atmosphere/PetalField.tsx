import { useRef } from 'react'
import { useCanvasLoop } from '../../hooks/useCanvasLoop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { qualityScale } from '../../lib/device'
import { petalSprites } from '../../lib/sprites'

interface Petal {
  x: number
  y: number
  z: number
  size: number
  rotation: number
  spin: number
  flutter: number
  speed: number
  sway: number
  sprite: HTMLCanvasElement
}

interface Props {
  /** Petals per 1000×1000 CSS px at full quality. */
  density?: number
  /** Horizontal drift in px/s. */
  wind?: number
  className?: string
  opacity?: number
}

/** Rose petals drifting at several depths. Sleeps when off-screen. */
export function PetalField({ density = 14, wind = 18, className = '', opacity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const petalsRef = useRef<Petal[]>([])
  const reduced = useReducedMotion()

  const spawn = (width: number, height: number, anywhere: boolean): Petal => {
    const sprites = petalSprites()
    const z = 0.35 + Math.random() * 0.65
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -40 - Math.random() * 80,
      z,
      size: (14 + Math.random() * 18) * z * (width < 600 ? 0.9 : 1.15),
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.2,
      flutter: Math.random() * Math.PI * 2,
      speed: (22 + Math.random() * 26) * z,
      sway: 10 + Math.random() * 24,
      sprite: sprites[Math.floor(Math.random() * sprites.length)],
    }
  }

  useCanvasLoop(canvasRef, {
    animate: !reduced,
    resize: ({ width, height }) => {
      const target = Math.max(4, Math.round(((width * height) / 1_000_000) * density * qualityScale()))
      const petals = petalsRef.current.filter((p) => p.x <= width + 40)
      while (petals.length < target) petals.push(spawn(width, height, true))
      petals.length = target
      petals.sort((a, b) => a.z - b.z)
      petalsRef.current = petals
    },
    draw: ({ ctx, width, height, dt, time }) => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = opacity
      for (const p of petalsRef.current) {
        p.y += p.speed * dt
        p.x += (wind * p.z + Math.sin(time * 0.8 + p.flutter) * p.sway) * dt
        p.rotation += p.spin * dt
        if (p.y > height + 40 || p.x > width + 60 || p.x < -60) {
          Object.assign(p, spawn(width, height, false), { x: Math.random() * width * 1.1 - width * 0.1 })
        }
        const flip = Math.cos(time * 1.6 + p.flutter)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.scale(0.35 + Math.abs(flip) * 0.65, 1)
        ctx.globalAlpha = opacity * (0.45 + p.z * 0.55)
        ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }
      ctx.globalAlpha = 1
    },
  })

  return <canvas ref={canvasRef} className={`canvas-fill ${className}`} aria-hidden="true" />
}
