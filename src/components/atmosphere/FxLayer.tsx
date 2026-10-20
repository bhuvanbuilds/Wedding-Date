import { useEffect, useRef } from 'react'
import { attachFxCanvas } from '../../lib/fx'

/** Fixed, click-through canvas for celebratory bursts. */
export function FxLayer() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => (ref.current ? attachFxCanvas(ref.current) : undefined), [])
  return <canvas ref={ref} className="fx-layer" aria-hidden="true" />
}
