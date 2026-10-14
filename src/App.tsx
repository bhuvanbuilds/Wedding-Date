import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import './App.css'

const HEART_PATH =
  'M150 258C130 240 10 157 10 82C10 28 78 4 150 69C222 4 290 28 290 82C290 157 170 240 150 258Z'
const HEART_WIDTH = 300
const HEART_HEIGHT = 270
const SCRATCH_RADIUS = 8
const SCRATCH_WIDTH = SCRATCH_RADIUS * 2

type Point = { x: number; y: number }

function Rose({ className }: { className: string }) {
  const petalGradient = `rose-petal-${className}`
  const leafGradient = `rose-leaf-${className}`

  return (
    <svg className={`rose ${className}`} viewBox="0 0 150 150" aria-hidden="true">
      <defs>
        <radialGradient id={petalGradient} cx="44%" cy="34%">
          <stop offset="0" stopColor="#d87978" />
          <stop offset=".45" stopColor="#9f3039" />
          <stop offset="1" stopColor="#4a111c" />
        </radialGradient>
        <linearGradient id={leafGradient} x2="1" y2="1">
          <stop stopColor="#6d7750" />
          <stop offset="1" stopColor="#26372a" />
        </linearGradient>
      </defs>
      <path d="M78 99C46 112 38 133 19 139c6-24 18-40 46-49M82 100c26 10 36 24 53 29-5-21-17-34-46-41" fill={`url(#${leafGradient})`} />
      <path d="M75 94c-16 10-25 25-26 44 17-13 28-25 34-40M85 92c17 10 25 25 25 40-17-11-28-23-35-36" fill="#34452f" />
      <g fill={`url(#${petalGradient})`} stroke="#7c202c" strokeWidth="1.4">
        <ellipse cx="75" cy="65" rx="34" ry="39" />
        <ellipse cx="54" cy="69" rx="24" ry="35" transform="rotate(-38 54 69)" />
        <ellipse cx="96" cy="69" rx="24" ry="35" transform="rotate(38 96 69)" />
        <ellipse cx="75" cy="48" rx="22" ry="29" />
        <ellipse cx="75" cy="72" rx="24" ry="23" />
      </g>
      <path d="M75 84c-16-7-15-22-3-27-4 10 7 10 7 18 9-9 0-17 9-25 12 17 5 31-13 34Z" fill="#4c111d" />
      <path d="M75 78c-6-5-4-12 3-17 7 9 4 16-3 17Z" fill="#c05d60" />
      <circle cx="75" cy="67" r="3" fill="#e0a07e" opacity=".8" />
    </svg>
  )
}

function ScratchHeart({
  onReveal,
  revealed,
}: {
  onReveal: () => void
  revealed: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Point[][]>([])
  const currentStrokeRef = useRef<Point[] | null>(null)
  const previousPointRef = useRef<Point | null>(null)
  const baseAlphaRef = useRef(0)
  const revealedRef = useRef(false)

  useLayoutEffect(() => {
    if (!revealed) return
    revealedRef.current = true
    strokesRef.current.length = 0
    currentStrokeRef.current = null
    previousPointRef.current = null
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.restore()
  }, [revealed])

  const reveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    strokesRef.current.length = 0
    currentStrokeRef.current = null
    previousPointRef.current = null
    onReveal()
  }, [onReveal])

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const render = () => {
      const bounds = parent.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const backingWidth = Math.round(bounds.width * pixelRatio)
      const backingHeight = Math.round(bounds.height * pixelRatio)
      if (canvas.width !== backingWidth) canvas.width = backingWidth
      if (canvas.height !== backingHeight) canvas.height = backingHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return

      context.setTransform(
        canvas.width / HEART_WIDTH,
        0,
        0,
        canvas.height / HEART_HEIGHT,
        0,
        0,
      )
      context.clearRect(0, 0, HEART_WIDTH, HEART_HEIGHT)
      if (revealedRef.current) return
      const heart = new Path2D(HEART_PATH)
      context.save()
      context.clip(heart)

      context.fillStyle = '#4a101d'
      context.fillRect(0, 0, HEART_WIDTH, HEART_HEIGHT)

      const originalPixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      let originalAlpha = 0
      for (let index = 3; index < originalPixels.length; index += 4) {
        originalAlpha += originalPixels[index]
      }
      baseAlphaRef.current = originalAlpha

      context.globalCompositeOperation = 'destination-out'
      context.save()
      context.clip(heart)
      for (const stroke of strokesRef.current) {
        context.beginPath()
        context.moveTo(stroke[0].x * HEART_WIDTH, stroke[0].y * HEART_HEIGHT)
        if (stroke.length === 1) {
          context.arc(
            stroke[0].x * HEART_WIDTH,
            stroke[0].y * HEART_HEIGHT,
            SCRATCH_RADIUS,
            0,
            Math.PI * 2,
          )
          context.fill()
        } else {
          for (const point of stroke.slice(1)) {
            context.lineTo(point.x * HEART_WIDTH, point.y * HEART_HEIGHT)
          }
          context.lineWidth = SCRATCH_WIDTH
          context.lineCap = 'round'
          context.lineJoin = 'round'
          context.stroke()
        }
      }
      context.restore()
      context.globalCompositeOperation = 'source-over'
      context.restore()
    }

    const observer = new ResizeObserver(render)
    observer.observe(parent)
    window.addEventListener('resize', render)
    render()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', render)
    }
  }, [])

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * HEART_WIDTH
    const y = ((event.clientY - rect.top) / rect.height) * HEART_HEIGHT
    const heart = new Path2D(HEART_PATH)
    const context = event.currentTarget.getContext('2d')
    if (!context?.isPointInPath(heart, x, y)) return null
    return { x: x / HEART_WIDTH, y: y / HEART_HEIGHT }
  }

  const checkProgress = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let remainingAlpha = 0
    for (let index = 3; index < data.length; index += 4) {
      remainingAlpha += data[index]
    }
    if (baseAlphaRef.current === 0) return
    const cleared = 1 - remainingAlpha / baseAlphaRef.current
    if (cleared >= 0.55) reveal()
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return
    const point = getPoint(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const stroke = [point]
    strokesRef.current.push(stroke)
    currentStrokeRef.current = stroke
    previousPointRef.current = point
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.save()
    context.setTransform(
      canvas.width / HEART_WIDTH,
      0,
      0,
      canvas.height / HEART_HEIGHT,
      0,
      0,
    )
    context.globalCompositeOperation = 'destination-out'
    context.clip(new Path2D(HEART_PATH))
    context.beginPath()
    context.arc(point.x * HEART_WIDTH, point.y * HEART_HEIGHT, SCRATCH_RADIUS, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = currentStrokeRef.current
    if (!stroke || revealedRef.current) return
    const point = getPoint(event)
    if (!point) {
      previousPointRef.current = null
      return
    }
    stroke.push(point)
    const previous = previousPointRef.current
    previousPointRef.current = point
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.save()
    context.setTransform(
      canvas.width / HEART_WIDTH,
      0,
      0,
      canvas.height / HEART_HEIGHT,
      0,
      0,
    )
    context.globalCompositeOperation = 'destination-out'
    context.clip(new Path2D(HEART_PATH))
    if (previous) {
      context.beginPath()
      context.moveTo(previous.x * HEART_WIDTH, previous.y * HEART_HEIGHT)
      context.lineTo(point.x * HEART_WIDTH, point.y * HEART_HEIGHT)
      context.lineWidth = SCRATCH_WIDTH
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.stroke()
    } else {
      context.beginPath()
      context.arc(point.x * HEART_WIDTH, point.y * HEART_HEIGHT, SCRATCH_RADIUS, 0, Math.PI * 2)
      context.fill()
    }
    context.restore()
    if (stroke.length % 12 === 0) checkProgress()
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!currentStrokeRef.current) return
    currentStrokeRef.current = null
    previousPointRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    checkProgress()
  }

  return (
    <div className={`heart-scratch ${revealed ? 'is-revealed' : ''}`}>
      <svg className="heart-art" viewBox="0 0 300 270" aria-hidden="true">
        <defs>
          <linearGradient id="heart-fill" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f3e1bd" />
            <stop offset="1" stopColor="#d5b98c" />
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
      <div
        className="heart-date"
        aria-live={revealed ? 'polite' : undefined}
        aria-hidden={!revealed}
      >
        <span className="date-day">08</span>
        <span className="date-month-year">
          <span className="date-month">FEB</span>
          <span className="date-year">2027</span>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        aria-label="Scratch the burgundy heart to reveal the wedding date"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  )
}

function App() {
  const [revealed, setRevealed] = useState(false)
  const celebratedRef = useRef(false)

  const revealDate = useCallback(() => {
    if (celebratedRef.current) return
    celebratedRef.current = true
    setRevealed(true)
  }, [])

  return (
    <main className="invitation-page">
      <div className="ambient-glow" aria-hidden="true" />
      <Rose className="rose-top-left" />
      <Rose className="rose-top-right" />
      <Rose className="rose-bottom-left" />
      <Rose className="rose-bottom-right" />
      <div className="petal petal-one" aria-hidden="true" />
      <div className="petal petal-two" aria-hidden="true" />
      <div className="petal petal-three" aria-hidden="true" />
      <div className="petal petal-four" aria-hidden="true" />

      <article className="invitation-card">
        <div className="card-content">
          <p className="eyebrow">WITH LOVE, WE INVITE YOU</p>
          <div className="ornament" aria-hidden="true">
            <span />
            <svg viewBox="0 0 24 24">
              <path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11Z" />
            </svg>
            <span />
          </div>
          <h1>A Special Day Awaits...</h1>
          {/* <p className="card-note">A little secret, sealed with love</p>   */}
          <ScratchHeart onReveal={revealDate} revealed={revealed} />
          <div className="card-footer">
            <span>FOREVER BEGINS</span>
            <span className="footer-flourish" aria-hidden="true">✦</span>
            <span>WITH A LITTLE MAGIC</span>
          </div>
        </div>
      </article>

      <div className="scratch-instructions">
        <p>Scratch to Reveal Our Wedding Date</p>
        {!revealed && (
          <button type="button" onClick={revealDate}>
            Prefer not to scratch? Reveal the date
          </button>
        )}
      </div>
    </main>
  )
}

export default App
