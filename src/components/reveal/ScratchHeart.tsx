import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { PointerEvent } from 'react'
import { wedding } from '../../config/wedding'
import { pauseAmbient } from '../../lib/ambient'
import { burst } from '../../lib/fx'

/*
 * The original heart-shaped scratch card from the first version of this
 * project, refined: a velvet + gold-glitter cover, a finger-sized brush,
 * gold dust while scratching and a live reveal threshold.
 */

const HEART_PATH = 'M150 258C130 240 10 157 10 82C10 28 78 4 150 69C222 4 290 28 290 82C290 157 170 240 150 258Z'
const HEART_WIDTH = 300
const HEART_HEIGHT = 270
const SCRATCH_RADIUS = 15
const REVEAL_THRESHOLD = 0.6
const [REVEAL_DAY, REVEAL_MONTH, REVEAL_YEAR] = wedding.dateRevealText.split(/\s+/)

type Point = { x: number; y: number }

/*
 * Progress is tracked on a coarse grid of cells inside the heart instead of
 * reading pixels back from the canvas (getImageData stalls the GPU on phones).
 */
const CELL = 10
const GRID_COLS = Math.ceil(HEART_WIDTH / CELL)
const GRID_ROWS = Math.ceil(HEART_HEIGHT / CELL)

function createCoverage(heart: Path2D) {
  const probe = document.createElement('canvas').getContext('2d')
  const inside = new Uint8Array(GRID_COLS * GRID_ROWS)
  let total = 0
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (probe?.isPointInPath(heart, col * CELL + CELL / 2, row * CELL + CELL / 2)) {
        inside[row * GRID_COLS + col] = 1
        total++
      }
    }
  }
  const cleared = new Uint8Array(GRID_COLS * GRID_ROWS)
  let count = 0
  const reach = SCRATCH_RADIUS + CELL * 0.35
  const mark = (x: number, y: number) => {
    const c0 = Math.max(0, Math.floor((x - reach) / CELL))
    const c1 = Math.min(GRID_COLS - 1, Math.floor((x + reach) / CELL))
    const r0 = Math.max(0, Math.floor((y - reach) / CELL))
    const r1 = Math.min(GRID_ROWS - 1, Math.floor((y + reach) / CELL))
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const index = row * GRID_COLS + col
        if (!inside[index] || cleared[index]) continue
        const dx = col * CELL + CELL / 2 - x
        const dy = row * CELL + CELL / 2 - y
        if (dx * dx + dy * dy <= reach * reach) {
          cleared[index] = 1
          count++
        }
      }
    }
  }
  return {
    /** Marks a scratched segment (heart units). */
    line(a: Point, b: Point) {
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4))
      for (let i = 0; i <= steps; i++) mark(a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps)
    },
    progress: () => (total ? count / total : 0),
  }
}

/** Deterministic PRNG so the glitter pattern survives resizes. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function paintCover(context: CanvasRenderingContext2D, heart: Path2D) {
  context.save()
  context.clip(heart)

  const base = context.createLinearGradient(0, 0, HEART_WIDTH, HEART_HEIGHT)
  base.addColorStop(0, '#8d1a38')
  base.addColorStop(0.45, '#5c0d24')
  base.addColorStop(1, '#360717')
  context.fillStyle = base
  context.fillRect(0, 0, HEART_WIDTH, HEART_HEIGHT)

  // Satin sheen.
  const sheen = context.createRadialGradient(95, 70, 4, 95, 70, 150)
  sheen.addColorStop(0, 'rgba(255, 190, 205, 0.32)')
  sheen.addColorStop(1, 'rgba(255, 190, 205, 0)')
  context.fillStyle = sheen
  context.fillRect(0, 0, HEART_WIDTH, HEART_HEIGHT)

  // Gold glitter.
  const random = mulberry32(20270208)
  for (let i = 0; i < 520; i++) {
    const x = random() * HEART_WIDTH
    const y = random() * HEART_HEIGHT
    const r = random() * 1.25 + 0.25
    const a = 0.25 + random() * 0.65
    context.fillStyle = random() > 0.82 ? `rgba(255, 236, 200, ${a})` : `rgba(216, 180, 119, ${a})`
    context.beginPath()
    context.arc(x, y, r, 0, Math.PI * 2)
    context.fill()
  }

  // Inner gold hairline and an engraved hint.
  context.strokeStyle = 'rgba(232, 200, 140, 0.55)'
  context.lineWidth = 1.2
  context.setLineDash([2, 4])
  context.translate(150, 135)
  context.scale(0.86, 0.86)
  context.translate(-150, -135)
  context.stroke(heart)
  context.setLineDash([])
  context.restore()

  context.save()
  context.clip(heart)
  context.fillStyle = 'rgba(240, 214, 160, 0.85)'
  context.textAlign = 'center'
  context.font = '500 13px "DM Sans", system-ui, sans-serif'
  if ('letterSpacing' in context)
    (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '4px'
  context.fillText('SCRATCH HERE', 152, 128)
  context.font = 'italic 400 19px "Cormorant Garamond", Georgia, serif'
  if ('letterSpacing' in context)
    (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  context.fillStyle = 'rgba(240, 214, 160, 0.7)'
  context.fillText('with your fingertip', 150, 152)
  context.restore()
}

interface Props {
  onReveal: () => void
  onProgress?: (cleared: number) => void
  revealed: boolean
}

export function ScratchHeart({ onReveal, onProgress, revealed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Point[][]>([])
  const currentStrokeRef = useRef<Point[] | null>(null)
  const previousPointRef = useRef<Point | null>(null)
  const coverageRef = useRef<ReturnType<typeof createCoverage> | null>(null)
  const revealedRef = useRef(false)
  const lastCheckRef = useRef(0)
  const lastDustRef = useRef(0)
  // Canvas position cached per stroke — no layout reads on every move event.
  const rectRef = useRef<DOMRect | null>(null)
  const heartPath = useMemo(() => new Path2D(HEART_PATH), [])

  useLayoutEffect(() => {
    if (!revealed) return
    revealedRef.current = true
    currentStrokeRef.current = null
    previousPointRef.current = null
  }, [revealed])

  const reveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    currentStrokeRef.current = null
    previousPointRef.current = null
    pauseAmbient(false)
    onReveal()
  }, [onReveal])

  const withScratchContext = (draw: (context: CanvasRenderingContext2D) => void) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.save()
    context.setTransform(canvas.width / HEART_WIDTH, 0, 0, canvas.height / HEART_HEIGHT, 0, 0)
    context.globalCompositeOperation = 'destination-out'
    context.clip(heartPath)
    context.lineWidth = SCRATCH_RADIUS * 2
    context.lineCap = 'round'
    context.lineJoin = 'round'
    draw(context)
    context.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const render = () => {
      // Layout size (ignores transforms), so entrance animations can't skew the backing store.
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width === 0 || height === 0) return
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      const backingWidth = Math.round(width * pixelRatio)
      const backingHeight = Math.round(height * pixelRatio)
      if (canvas.width !== backingWidth) canvas.width = backingWidth
      if (canvas.height !== backingHeight) canvas.height = backingHeight
      const context = canvas.getContext('2d')
      if (!context) return

      context.setTransform(canvas.width / HEART_WIDTH, 0, 0, canvas.height / HEART_HEIGHT, 0, 0)
      context.clearRect(0, 0, HEART_WIDTH, HEART_HEIGHT)
      if (revealedRef.current) return
      paintCover(context, heartPath)

      // Replay strokes so a resize never "heals" the scratched area.
      withScratchContext((ctx) => {
        for (const stroke of strokesRef.current) {
          ctx.beginPath()
          ctx.moveTo(stroke[0].x * HEART_WIDTH, stroke[0].y * HEART_HEIGHT)
          if (stroke.length === 1) {
            ctx.arc(stroke[0].x * HEART_WIDTH, stroke[0].y * HEART_HEIGHT, SCRATCH_RADIUS, 0, Math.PI * 2)
            ctx.fill()
          } else {
            for (const point of stroke.slice(1)) ctx.lineTo(point.x * HEART_WIDTH, point.y * HEART_HEIGHT)
            ctx.stroke()
          }
        }
      })
    }

    const observer = new ResizeObserver(render)
    observer.observe(parent)
    // Re-paint once web fonts are ready so the engraved hint uses them.
    void document.fonts?.ready.then(render)
    render()
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heartPath])

  const getPoint = (clientX: number, clientY: number): Point | null => {
    const rect = rectRef.current ?? canvasRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height }
  }

  const coverage = () => (coverageRef.current ??= createCoverage(heartPath))

  const markScratched = (a: Point, b: Point) => {
    coverage().line({ x: a.x * HEART_WIDTH, y: a.y * HEART_HEIGHT }, { x: b.x * HEART_WIDTH, y: b.y * HEART_HEIGHT })
  }

  const checkProgress = () => {
    const cleared = coverage().progress()
    onProgress?.(cleared)
    if (cleared >= REVEAL_THRESHOLD) reveal()
  }

  const dust = (clientX: number, clientY: number) => {
    const now = performance.now()
    if (now - lastDustRef.current < 90) return
    lastDustRef.current = now
    burst(clientX, clientY, {
      count: 2,
      speed: 90,
      gravity: 260,
      life: 0.7,
      scale: 0.7,
      colors: ['#D8B477', '#ffe3b0', '#F0C9CF'],
    })
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return
    rectRef.current = event.currentTarget.getBoundingClientRect()
    const point = getPoint(event.clientX, event.clientY)
    if (!point) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    pauseAmbient(true)
    const stroke = [point]
    strokesRef.current.push(stroke)
    currentStrokeRef.current = stroke
    previousPointRef.current = point
    withScratchContext((ctx) => {
      ctx.beginPath()
      ctx.arc(point.x * HEART_WIDTH, point.y * HEART_HEIGHT, SCRATCH_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })
    markScratched(point, point)
    dust(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = currentStrokeRef.current
    if (!stroke || revealedRef.current) return
    const nativeEvents = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent]
    withScratchContext((ctx) => {
      for (const nativeEvent of nativeEvents) {
        const point = getPoint(nativeEvent.clientX, nativeEvent.clientY)
        if (!point) continue
        stroke.push(point)
        const previous = previousPointRef.current
        previousPointRef.current = point
        markScratched(previous ?? point, point)
        ctx.beginPath()
        if (previous) {
          ctx.moveTo(previous.x * HEART_WIDTH, previous.y * HEART_HEIGHT)
          ctx.lineTo(point.x * HEART_WIDTH, point.y * HEART_HEIGHT)
          ctx.stroke()
        } else {
          ctx.arc(point.x * HEART_WIDTH, point.y * HEART_HEIGHT, SCRATCH_RADIUS, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    })
    dust(event.clientX, event.clientY)
    const now = performance.now()
    if (now - lastCheckRef.current > 120) {
      lastCheckRef.current = now
      checkProgress()
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!currentStrokeRef.current) return
    currentStrokeRef.current = null
    previousPointRef.current = null
    pauseAmbient(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    checkProgress()
  }

  return (
    <div className={`heart-scratch ${revealed ? 'is-revealed' : ''}`}>
      <div className="heart-scratch__glow" aria-hidden="true" />
      <svg className="heart-art" viewBox="0 0 300 270" aria-hidden="true">
        <defs>
          <linearGradient id="heart-fill" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f6e7c8" />
            <stop offset="1" stopColor="#dcc092" />
          </linearGradient>
        </defs>
        <path d={HEART_PATH} fill="url(#heart-fill)" />
        <path
          d="M150 243C125 221 30 153 30 84c0-40 43-54 82-13m106 0c39-41 82-27 82 13 0 69-95 137-120 159"
          fill="none"
          stroke="#a47c5b"
          strokeOpacity=".45"
          strokeWidth="1.5"
        />
      </svg>
      <div className="heart-date" aria-hidden={!revealed}>
        <span className="date-day">{REVEAL_DAY}</span>
        <span className="date-month-year">
          <span className="date-month">{REVEAL_MONTH}</span>
          <span className="date-year">{REVEAL_YEAR}</span>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(event) => event.preventDefault()}
      />
    </div>
  )
}
