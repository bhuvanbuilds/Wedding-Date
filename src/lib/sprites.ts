/**
 * Pre-rendered sprites. Drawing a cached bitmap is far cheaper than building
 * gradients per particle per frame — essential on mid-range phones.
 */

export const palette = {
  midnight: '#18050D',
  crimson: '#350817',
  wine: '#4C0B20',
  burgundy: '#6E1029',
  ruby: '#C61E45',
  rose: '#B96A7D',
  blush: '#F0C9CF',
  parchment: '#F3E6D0',
  ivory: '#FFF7EC',
  gold: '#D8B477',
  ink: '#29151A',
} as const

const cache = new Map<string, HTMLCanvasElement>()

function makeCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

/** Soft radial glow dot. `core` is the bright centre colour. */
export function glowSprite(color: string, size = 64, core = '#fff') {
  const key = `glow:${color}:${size}:${core}`
  const cached = cache.get(key)
  if (cached) return cached
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  const r = size / 2
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r)
  gradient.addColorStop(0, core)
  gradient.addColorStop(0.12, color)
  gradient.addColorStop(0.38, hexToRgba(color, 0.35))
  gradient.addColorStop(1, hexToRgba(color, 0))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  cache.set(key, canvas)
  return canvas
}

export function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 32
  ctx.beginPath()
  ctx.moveTo(cx, cy + 10 * s)
  ctx.bezierCurveTo(cx - 2 * s, cy + 8 * s, cx - 14 * s, cy + 1 * s, cx - 14 * s, cy - 6 * s)
  ctx.bezierCurveTo(cx - 14 * s, cy - 12 * s, cx - 9 * s, cy - 15 * s, cx - 5.5 * s, cy - 15 * s)
  ctx.bezierCurveTo(cx - 2.5 * s, cy - 15 * s, cx - 0.8 * s, cy - 13 * s, cx, cy - 11 * s)
  ctx.bezierCurveTo(cx + 0.8 * s, cy - 13 * s, cx + 2.5 * s, cy - 15 * s, cx + 5.5 * s, cy - 15 * s)
  ctx.bezierCurveTo(cx + 9 * s, cy - 15 * s, cx + 14 * s, cy - 12 * s, cx + 14 * s, cy - 6 * s)
  ctx.bezierCurveTo(cx + 14 * s, cy + 1 * s, cx + 2 * s, cy + 8 * s, cx, cy + 10 * s)
  ctx.closePath()
}

/** Small glowing heart. */
export function heartSprite(color: string, size = 48) {
  const key = `heart:${color}:${size}`
  const cached = cache.get(key)
  if (cached) return cached
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.22
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#fff2f4')
  gradient.addColorStop(0.35, color)
  gradient.addColorStop(1, hexToRgba(color, 0.85))
  ctx.fillStyle = gradient
  heartPath(ctx, size / 2, size / 2 + size * 0.06, size * 0.62)
  ctx.fill()
  cache.set(key, canvas)
  return canvas
}

const petalTones: [string, string, string][] = [
  ['#f3b8c2', '#c61e45', '#5a0b21'],
  ['#e9a2ae', '#a8173a', '#4c0b20'],
  ['#f6d3d8', '#b96a7d', '#6e1029'],
  ['#ffd9de', '#d23a5c', '#6e1029'],
]

/** Rose petals in a few tones. Returns an array of sprites (taller than wide). */
export function petalSprites(size = 56) {
  return petalTones.map(([light, mid, dark], index) => {
    const key = `petal:${index}:${size}`
    const cached = cache.get(key)
    if (cached) return cached
    const canvas = makeCanvas(size)
    const ctx = canvas.getContext('2d')!
    const w = size * 0.62
    const h = size * 0.86
    ctx.translate(size / 2, size / 2)
    ctx.beginPath()
    ctx.moveTo(0, h * 0.5)
    ctx.bezierCurveTo(-w * 0.62, h * 0.18, -w * 0.6, -h * 0.42, -w * 0.12, -h * 0.5)
    ctx.quadraticCurveTo(0, -h * 0.4, w * 0.12, -h * 0.5)
    ctx.bezierCurveTo(w * 0.6, -h * 0.42, w * 0.62, h * 0.18, 0, h * 0.5)
    ctx.closePath()
    const gradient = ctx.createRadialGradient(-w * 0.1, -h * 0.15, 1, 0, 0, h * 0.62)
    gradient.addColorStop(0, light)
    gradient.addColorStop(0.55, mid)
    gradient.addColorStop(1, dark)
    ctx.fillStyle = gradient
    ctx.fill()
    // a whisper of a vein and a sheen
    ctx.strokeStyle = 'rgba(255, 230, 235, 0.22)'
    ctx.lineWidth = size * 0.012
    ctx.beginPath()
    ctx.moveTo(0, h * 0.42)
    ctx.quadraticCurveTo(-w * 0.06, 0, 0, -h * 0.3)
    ctx.stroke()
    cache.set(key, canvas)
    return canvas
  })
}

export function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
