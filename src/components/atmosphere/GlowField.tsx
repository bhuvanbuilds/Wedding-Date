import { useRef } from 'react'
import { useCanvasLoop } from '../../hooks/useCanvasLoop'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { qualityScale } from '../../lib/device'
import { glowSprite, heartSprite } from '../../lib/sprites'

interface Mote {
  x: number
  y: number
  size: number
  phase: number
  speed: number
  drift: number
  sprite: HTMLCanvasElement
  base: number
}

interface Props {
  density?: number
  colors?: string[]
  /** Upward drift speed in px/s. */
  rise?: number
  /** Share of motes drawn as tiny glowing hearts (0–1). */
  heartRatio?: number
  className?: string
}

/** Warm points of light that breathe and drift — the site's "air". */
export function GlowField({
  density = 60,
  colors = ['#D8B477', '#F0C9CF', '#C61E45'],
  rise = 6,
  heartRatio = 0,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const motesRef = useRef<Mote[]>([])
  const reduced = useReducedMotion()

  useCanvasLoop(canvasRef, {
    animate: !reduced,
    // Soft glows look identical at 1x and cost a fraction to fill.
    maxDpr: 1,
    ambient: true,
    resize: ({ width, height }) => {
      const target = Math.max(8, Math.round(((width * height) / 1_000_000) * density * qualityScale()))
      const motes: Mote[] = []
      for (let i = 0; i < target; i++) {
        const heart = Math.random() < heartRatio
        const tiny = !heart && Math.random() < 0.78
        const color = colors[Math.floor(Math.random() * colors.length)]
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: heart ? 9 + Math.random() * 10 : tiny ? 3 + Math.random() * 5 : 10 + Math.random() * 16,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
          drift: (Math.random() - 0.5) * 6,
          sprite: heart ? heartSprite(color, 40) : glowSprite(color, 64),
          base: heart ? 0.3 + Math.random() * 0.3 : tiny ? 0.5 + Math.random() * 0.5 : 0.18 + Math.random() * 0.2,
        })
      }
      motesRef.current = motes
    },
    draw: ({ ctx, width, height, dt, time }) => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      for (const m of motesRef.current) {
        m.y -= rise * m.speed * dt
        m.x += m.drift * dt
        if (m.y < -20) m.y = height + 20
        if (m.x < -20) m.x = width + 20
        if (m.x > width + 20) m.x = -20
        const twinkle = 0.55 + 0.45 * Math.sin(time * m.speed * 1.4 + m.phase)
        // Fade out near the top/bottom so motes never end at a hard section seam.
        const edge = Math.min(1, m.y / 90, (height - m.y) / 90)
        if (edge <= 0) continue
        ctx.globalAlpha = m.base * twinkle * edge
        ctx.drawImage(m.sprite, m.x - m.size / 2, m.y - m.size / 2, m.size, m.size)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },
  })

  return <canvas ref={canvasRef} className={`canvas-fill ${className}`} aria-hidden="true" />
}
