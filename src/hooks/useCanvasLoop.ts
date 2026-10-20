import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { ambient } from '../lib/ambient'
import { maxCanvasDpr } from '../lib/device'

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D
  /** CSS pixel size of the canvas. */
  width: number
  height: number
  dpr: number
  /** Seconds since the loop started. */
  time: number
  /** Seconds since the previous frame (clamped). */
  dt: number
}

interface Options {
  draw: (frame: CanvasFrame) => void
  /** Called after every resize, before the next draw. */
  resize?: (frame: CanvasFrame) => void
  /** When false only a single static frame is drawn per resize. */
  animate?: boolean
  maxDpr?: number
  /** Decorative loop that may freeze while the guest interacts (see lib/ambient). */
  ambient?: boolean
}

/**
 * Drives a 2D canvas: DPR-aware sizing, ResizeObserver, and a RAF loop that
 * sleeps while the canvas is off-screen or the tab is hidden.
 */
export function useCanvasLoop(canvasRef: RefObject<HTMLCanvasElement | null>, options: Options) {
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })
  const animate = options.animate ?? true
  const maxDpr = options.maxDpr

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let visible = false
    let last = performance.now()
    const start = last

    const frame = (now: number): CanvasFrame => ({
      ctx,
      width,
      height,
      dpr,
      time: (now - start) / 1000,
      dt: Math.min(0.05, Math.max(0, (now - last) / 1000)),
    })

    const tick = (now: number) => {
      raf = 0
      const f = frame(now)
      last = now
      if (!(optionsRef.current.ambient && ambient.paused)) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        optionsRef.current.draw(f)
      }
      if (animate && visible && !document.hidden) raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (raf || !visible || document.hidden || width === 0) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    const resize = () => {
      const rect = { width: canvas.clientWidth, height: canvas.clientHeight }
      if (rect.width === 0 || rect.height === 0) return
      dpr = Math.min(maxDpr ?? Infinity, maxCanvasDpr())
      width = rect.width
      height = rect.height
      const backingWidth = Math.round(width * dpr)
      const backingHeight = Math.round(height * dpr)
      if (canvas.width !== backingWidth) canvas.width = backingWidth
      if (canvas.height !== backingHeight) canvas.height = backingHeight
      const f = frame(performance.now())
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      optionsRef.current.resize?.(f)
      if (!animate || !raf) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        optionsRef.current.draw({ ...f, dt: 0 })
      }
      startLoop()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) startLoop()
        else stopLoop()
      },
      // No margin: a canvas just above or below the viewport must really sleep.
      { rootMargin: '0px' },
    )
    intersection.observe(canvas)

    const onVisibility = () => (document.hidden ? stopLoop() : startLoop())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stopLoop()
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef, animate, maxDpr])
}
