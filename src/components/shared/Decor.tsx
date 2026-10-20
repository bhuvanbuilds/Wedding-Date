import { useId } from 'react'
import type { ReactNode } from 'react'
import { wedding } from '../../config/wedding'

/** Burgundy wax seal with the couple's monogram. */
export function WaxSeal({ className = '', size = 84 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, '')
  const [first, second] = wedding.couple.monogram.split('&').map((part) => part.trim())
  return (
    <svg className={`wax-seal ${className}`} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={`wax-${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#c23a55" />
          <stop offset=".45" stopColor="#8a1532" />
          <stop offset="1" stopColor="#4a0819" />
        </radialGradient>
        <radialGradient id={`press-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset=".7" stopColor="#5d0c22" stopOpacity="0" />
          <stop offset="1" stopColor="#3a0612" stopOpacity=".55" />
        </radialGradient>
        <filter id={`emboss-${id}`}>
          <feDropShadow dx="0" dy="1" stdDeviation=".4" floodColor="#ff9fb1" floodOpacity=".45" />
        </filter>
      </defs>
      <path
        d="M60 4c9 0 12 6 20 8s15 1 19 8 0 13 4 20 10 10 9 20-7 11-9 19 2 15-5 21-14 2-21 6-11 11-19 11-11-8-19-11-14 1-20-6-1-13-5-21-9-9-9-19 7-12 9-20-2-14 4-20 13-1 20-6 11-9 18-9z"
        fill={`url(#wax-${id})`}
      />
      <circle cx="60" cy="61" r="37" fill={`url(#press-${id})`} />
      <circle cx="60" cy="61" r="34" fill="none" stroke="#e7a3b2" strokeOpacity=".35" strokeWidth="1" />
      <circle
        cx="60"
        cy="61"
        r="30"
        fill="none"
        stroke="#3e0714"
        strokeOpacity=".5"
        strokeWidth="1.2"
        strokeDasharray="1 3.2"
      />
      <g filter={`url(#emboss-${id})`} fill="#5a0b20" fontFamily="'Cormorant Garamond', serif" textAnchor="middle">
        <text x="43" y="70" fontSize="30" fontWeight="600">
          {first}
        </text>
        <text x="60" y="73" fontSize="22" fontStyle="italic" fill="#6e1029">
          &amp;
        </text>
        <text x="77" y="70" fontSize="30" fontWeight="600">
          {second}
        </text>
      </g>
      <ellipse cx="44" cy="30" rx="16" ry="7" fill="#fff" opacity=".12" transform="rotate(-25 44 30)" />
    </svg>
  )
}

/** Painted rose â€” carried over from the original scratch card. */
export function Rose({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`rose ${className}`} viewBox="0 0 150 150" aria-hidden="true">
      <defs>
        <radialGradient id={`petal-${id}`} cx="44%" cy="34%">
          <stop offset="0" stopColor="#d87978" />
          <stop offset=".45" stopColor="#9f3039" />
          <stop offset="1" stopColor="#4a111c" />
        </radialGradient>
        <linearGradient id={`leaf-${id}`} x2="1" y2="1">
          <stop stopColor="#6d7750" />
          <stop offset="1" stopColor="#26372a" />
        </linearGradient>
      </defs>
      <path
        d="M78 99C46 112 38 133 19 139c6-24 18-40 46-49M82 100c26 10 36 24 53 29-5-21-17-34-46-41"
        fill={`url(#leaf-${id})`}
      />
      <path d="M75 94c-16 10-25 25-26 44 17-13 28-25 34-40M85 92c17 10 25 25 25 40-17-11-28-23-35-36" fill="#34452f" />
      <g fill={`url(#petal-${id})`} stroke="#7c202c" strokeWidth="1.4">
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

/** Fine-line rose sprig for parchment sections. */
export function RoseSprig({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`rose-sprig ${className}`}
      viewBox="0 0 200 120"
      fill="none"
      stroke="currentColor"
      strokeWidth=".9"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 104c40-10 72-30 98-62" />
      <path d="M40 92c-6-12-2-22 10-26-1 12-4 20-10 26zM62 80c2-13 10-19 22-17-5 10-12 16-22 17zM83 62c-7-11-4-21 7-26 1 11-2 19-7 26z" />
      <path d="M106 42c-9-3-14-11-11-19 5-8 15-8 20-2 6-6 16-3 17 6 1 9-8 15-16 14" />
      <path d="M110 30c-3 6 1 11 6 11 6 0 8-7 4-11-3-3-8-2-10 0" />
      <path d="M117 34c4-2 6 1 4 4" />
      <path d="M132 22c10-8 22-8 30-2M140 34c12 0 22 6 26 14" opacity=".6" />
      <circle cx="176" cy="26" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="186" cy="40" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Gold hairline with a central heart. */
export function GoldRule({ className = '' }: { className?: string }) {
  return (
    <div className={`gold-rule ${className}`} aria-hidden="true">
      <span />
      <svg viewBox="0 0 24 24">
        <path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11Z" />
      </svg>
      <span />
    </div>
  )
}

/** Small "(label)" in the editorial style, with an optional chapter number. */
export function SectionLabel({
  index,
  children,
  className = '',
}: {
  index?: string
  children: ReactNode
  className?: string
}) {
  return (
    <p className={`section-label ${className}`}>
      {index && <span className="section-label__index">{index}</span>}
      <span>({children})</span>
    </p>
  )
}

/** Vertical rail text â€” a nod to Japanese vertical typesetting. */
export function VerticalRail({
  children,
  side = 'left',
  className = '',
}: {
  children: ReactNode
  side?: 'left' | 'right'
  className?: string
}) {
  return (
    <div className={`vertical-rail vertical-rail--${side} ${className}`} aria-hidden="true">
      {children}
    </div>
  )
}
