import type { SVGProps } from 'react'

const paths = {
  car: (
    <>
      <path d="M4 15.5V12l1.8-4.6A2 2 0 0 1 7.7 6h8.6a2 2 0 0 1 1.9 1.4L20 12v3.5" />
      <path d="M3 15.5h18v2.2a.8.8 0 0 1-.8.8H18.5a.8.8 0 0 1-.8-.8V17H6.3v.7a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8z" />
      <path d="M4.5 12h15M7 14.2h1.4M15.6 14.2H17" />
    </>
  ),
  taxi: (
    <>
      <path d="M9.5 4.5h5l.6 1.5" />
      <path d="M4 15.5V12l1.8-4.6A2 2 0 0 1 7.7 6h8.6a2 2 0 0 1 1.9 1.4L20 12v3.5" />
      <path d="M3 15.5h18v2.2a.8.8 0 0 1-.8.8H18.5a.8.8 0 0 1-.8-.8V17H6.3v.7a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8z" />
    </>
  ),
  bus: (
    <>
      <rect x="5" y="3.5" width="14" height="14" rx="2.2" />
      <path d="M5 11h14M8.5 14.5h.5M15 14.5h.5M7 17.5v2M17 17.5v2M9 6.5h6" />
    </>
  ),
  train: (
    <>
      <rect x="6" y="3" width="12" height="13" rx="3" />
      <path d="M6 10h12M9.5 13.2h.2M14.3 13.2h.2M8.5 16 6.5 20.5M15.5 16l2 4.5M7.7 18.5h8.6" />
    </>
  ),
  metro: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 15.5V8.5l4 4.5 4-4.5v7" />
    </>
  ),
  airport: (
    <path d="M21 15.5 13.5 11V5.2a1.5 1.5 0 0 0-3 0V11L3 15.5v1.8l7.5-2.3v3.8l-2 1.5V21l3.5-1 3.5 1v-.7l-2-1.5V15l7.5 2.3z" />
  ),
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M10 16.5v-9h3a2.6 2.6 0 0 1 0 5.2h-3" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4.5" r="1.6" />
      <path d="m9 21 2.5-6.5L14 17v4M8 11.5l2.4-3.2a1.5 1.5 0 0 1 1.6-.5l2 .6 1.6 3.2 2.4 1M11.5 14.5 12.8 9" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.3" />
    </>
  ),
  directions: (
    <>
      <path d="m12 2.8 9.2 9.2-9.2 9.2L2.8 12z" />
      <path d="M9 14v-2.2a1.3 1.3 0 0 1 1.3-1.3H15m-2-2 2 2-2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.8" y="5" width="16.4" height="15" rx="2" />
      <path d="M3.8 9.5h16.4M8 3v4M16 3v4M12 13.2c-.7-.9-2.4-.7-2.4.8 0 1.3 2.4 2.7 2.4 2.7s2.4-1.4 2.4-2.7c0-1.5-1.7-1.7-2.4-.8z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  dress: <path d="M9 3h6l-1 4 4 13H6l4-13zM10 7h4" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8v.2" />
    </>
  ),
  music: (
    <>
      <path d="M9 17.5V6l10-2v11.5" />
      <circle cx="6.8" cy="17.5" r="2.2" />
      <circle cx="16.8" cy="15.5" r="2.2" />
    </>
  ),
  menu: <path d="M4 8h16M4 12h11M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowDown: <path d="M12 4v16m0 0-5-5m5 5 5-5" />,
  arrowUp: <path d="M12 20V4m0 0-5 5m5-5 5 5" />,
  arrowRight: <path d="M4 12h16m0 0-5-5m5 5-5 5" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />,
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="18.5" r="2.3" />
      <path d="m8.1 10.9 7.8-4.2M8.1 13.1l7.8 4.2" />
    </>
  ),
  google: (
    <>
      <path d="M20 12.2c0-.6 0-1.1-.2-1.7H12v3.2h4.5a3.9 3.9 0 0 1-1.7 2.5" />
      <path d="M12 20a7.9 7.9 0 0 0 5.5-2l-2.7-2a4.9 4.9 0 0 1-7.3-2.6" />
      <path d="M7.5 13.4a4.8 4.8 0 0 1 0-2.9M7.5 10.5A4.9 4.9 0 0 1 15.2 8l2.3-2.3A8 8 0 0 0 4.7 8.5" />
    </>
  ),
  download: <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />,
  sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />,
  copy: (
    <>
      <rect x="8" y="8" width="11.5" height="11.5" rx="2" />
      <path d="M15.5 8V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2" />
    </>
  ),
} as const

export type IconName = keyof typeof paths

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width="1em"
      height="1em"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
