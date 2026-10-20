import { useEffect, useId, useRef, useState } from 'react'
import { downloadIcs, googleCalendarUrl } from '../../lib/calendar'
import type { CalendarEntry } from '../../lib/calendar'
import { Icon } from './Icon'

interface Props {
  entries: CalendarEntry[]
  filename: string
  label?: string
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * "Add to calendar" with two honest options: an .ics file (Apple Calendar,
 * Outlook, most Android calendars) and a Google Calendar link.
 */
export function AddToCalendar({
  entries,
  filename,
  label = 'Add to calendar',
  variant = 'dark',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const google = entries.length === 1 ? googleCalendarUrl(entries[0]) : null
  const googleMany = entries.map((entry) => ({ entry, url: googleCalendarUrl(entry) }))

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!entries.length) {
    return (
      <span className={`calendar-pending ${className}`}>
        <Icon name="calendar" /> Calendar invite once the date is confirmed
      </span>
    )
  }

  return (
    <div className={`calendar-menu calendar-menu--${variant} ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`btn ${variant === 'light' ? 'btn--ink' : 'btn--ghost'}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="calendar" /> {label}
      </button>
      <div id={panelId} className={`calendar-menu__panel ${open ? 'is-open' : ''}`} hidden={!open}>
        <button
          type="button"
          onClick={() => {
            downloadIcs(filename, entries)
            setOpen(false)
          }}
        >
          <Icon name="download" />
          <span>
            Apple · Outlook · Android
            <small>Download calendar file (.ics)</small>
          </span>
        </button>
        {google && (
          <a href={google} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <Icon name="google" />
            <span>
              Google Calendar
              <small>Opens in a new tab</small>
            </span>
          </a>
        )}
        {!google &&
          googleMany.map(({ entry, url }) =>
            url ? (
              <a key={entry.uid} href={url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <Icon name="google" />
                <span>
                  Google Calendar
                  <small>{entry.title.split('—').pop()?.trim()}</small>
                </span>
              </a>
            ) : null,
          )}
      </div>
    </div>
  )
}
