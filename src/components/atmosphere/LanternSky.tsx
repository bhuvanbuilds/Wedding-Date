import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useCanvasLoop } from '../../hooks/useCanvasLoop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { qualityScale } from '../../lib/device'
import { glowSprite, heartPath } from '../../lib/sprites'

interface Lantern {
  x: number
  y: number
  z: number
  size: number
  speed: number
  sway: number
  phase: number
  sprite: HTMLCanvasElement
}

interface Star {
  x: number
  y: number
  r: number
  phase: number
}

const spriteCache = new Map<string, HTMLCanvasElement>()

function lanternSprite(inner: string, outer: string) {
  const key = `${inner}${outer}`
  const cached = spriteCache.get(key)
  if (cached) return cached
  const size = 96
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.shadowColor = outer
  ctx.shadowBlur = 22
  const gradient = ctx.createRadialGradient(size / 2, size * 0.5, 2, size / 2, size * 0.5, size * 0.38)
  gradient.addColorStop(0, '#fff6e2')
  gradient.addColorStop(0.35, inner)
  gradient.addColorStop(1, outer)
  ctx.fillStyle = gradient
  heartPath(ctx, size / 2, size / 2 + 4, size * 0.5)
  ctx.fill()
  spriteCache.set(key, canvas)
  return canvas
}

export interface LanternSkyApi {
  release: (clientX: number, clientY: number) => void
}

export function LanternSky({ apiRef }: { apiRef?: RefObject<LanternSkyApi | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lanterns = useRef<Lantern[]>([])
  const stars = useRef<Star[]>([])
  const reduced = useReducedMotion()

  const make = (width: number, height: number, y?: number, x?: number): Lantern => {
    const z = 0.25 + Math.random() * 0.75
    const warm = Math.random() < 0.55
    return {
      x: x ?? Math.random() * width,
      y: y ?? height + 30 + Math.random() * height * 0.4,
      z,
      size: (14 + 34 * z) * (width < 600 ? 1 : 1.25),
      speed: 10 + 26 * z,
      sway: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      sprite: warm ? lanternSprite('#f6c98d', '#c61e45') : lanternSprite('#ffd7de', '#b0284c'),
    }
  }

  // Lanterns released by a tap wait here until the next frame picks them up.
  const pending = useRef<{ x: number; y: number }[]>([])

  useEffect(() => {
    if (!apiRef) return
    apiRef.current = {
      release: (clientX, clientY) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) pending.current = [...pending.current, { x: clientX - rect.left, y: clientY - rect.top }]
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef])

  useCanvasLoop(canvasRef, {
    animate: !reduced,
    resize: ({ width, height }) => {
      const count = Math.round(Math.max(18, ((width * height) / 1_000_000) * 64 * qualityScale()))
      lanterns.current = Array.from({ length: count }, () => make(width, height, Math.random() * height))
      lanterns.current.sort((a, b) => a.z - b.z)
      stars.current = Array.from({ length: Math.round(count * 4) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        r: Math.random() * 1.1 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }))
    },
    draw: ({ ctx, width, height, dt, time }) => {
      if (pending.current.length) {
        for (const point of pending.current) {
          const lantern = make(width, height, point.y, point.x)
          lantern.z = 0.95
          lantern.size *= 1.25
          lanterns.current.push(lantern)
        }
        pending.current = []
        if (lanterns.current.length > 80) lanterns.current.splice(0, lanterns.current.length - 80)
      }
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#fff3e0'
      for (const star of stars.current) {
        ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * 1.3 + star.phase))
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }

      const halo = glowSprite('#c61e45', 64, '#f6c98d')
      ctx.globalCompositeOperation = 'lighter'
      for (const l of lanterns.current) {
        l.y -= l.speed * dt
        const x = l.x + Math.sin(time * 0.6 + l.phase) * l.sway
        if (l.y < -60) Object.assign(l, make(width, height))
        const fade = Math.min(1, Math.max(0, l.y / (height * 0.35)))
        const flicker = 0.85 + 0.15 * Math.sin(time * 6 + l.phase * 5)
        ctx.globalAlpha = (0.3 + l.z * 0.6) * fade * flicker * 0.75
        const glowSize = l.size * 3.4
        ctx.drawImage(halo, x - glowSize / 2, l.y - glowSize / 2, glowSize, glowSize)
        ctx.globalAlpha = Math.min(1, (0.45 + l.z * 0.7) * fade * flicker)
        ctx.drawImage(l.sprite, x - l.size / 2, l.y - l.size / 2, l.size, l.size)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  })

  return <canvas ref={canvasRef} className="canvas-fill" aria-hidden="true" />
}
