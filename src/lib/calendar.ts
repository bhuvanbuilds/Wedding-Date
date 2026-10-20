import { venueById, wedding } from '../config/wedding'
import type { WeddingEvent } from '../types/wedding'
import { parseIsoDate, zonedDateTimeToEpoch } from './time'

export interface CalendarEntry {
  uid: string
  title: string
  description: string
  location: string
  date: string
  startTime: string | null
  endTime: string | null
  timeZone: string
}

const pad = (value: number) => String(value).padStart(2, '0')

function compactDate(date: string, offsetDays = 0) {
  const parsed = parseIsoDate(date)
  if (!parsed) return null
  const d = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + offsetDays))
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}

function compactUtc(epoch: number) {
  const d = new Date(epoch)
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** RFC 5545 line folding (75 octets, approximated per UTF-16 unit). */
function fold(line: string) {
  if (line.length <= 74) return line
  const chunks: string[] = []
  for (let i = 0; i < line.length; i += 73) chunks.push((i === 0 ? '' : ' ') + line.slice(i, i + 73))
  return chunks.join('\r\n')
}

export function buildIcs(entries: CalendarEntry[]) {
  const stamp = compactUtc(Date.now())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A Little Universe of Love//Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const entry of entries) {
    const body: string[] = ['BEGIN:VEVENT', `UID:${entry.uid}`, `DTSTAMP:${stamp}`]
    if (entry.startTime) {
      const start = zonedDateTimeToEpoch(entry.date, entry.startTime, entry.timeZone)
      if (start === null) continue
      body.push(`DTSTART:${compactUtc(start)}`)
      if (entry.endTime) {
        let end = zonedDateTimeToEpoch(entry.date, entry.endTime, entry.timeZone)
        if (end !== null && end <= start) end += 24 * 60 * 60 * 1000 // ends after midnight
        if (end !== null) body.push(`DTEND:${compactUtc(end)}`)
      }
    } else {
      const day = compactDate(entry.date)
      const next = compactDate(entry.date, 1)
      if (!day || !next) continue
      body.push(`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${next}`)
    }
    body.push(`SUMMARY:${escapeIcs(entry.title)}`)
    if (entry.description) body.push(`DESCRIPTION:${escapeIcs(entry.description)}`)
    if (entry.location) body.push(`LOCATION:${escapeIcs(entry.location)}`)
    body.push('END:VEVENT')
    lines.push(...body)
  }

  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function googleCalendarUrl(entry: CalendarEntry) {
  let dates: string | null
  if (entry.startTime) {
    const start = zonedDateTimeToEpoch(entry.date, entry.startTime, entry.timeZone)
    if (start === null) return null
    let end = entry.endTime ? zonedDateTimeToEpoch(entry.date, entry.endTime, entry.timeZone) : null
    if (end !== null && end <= start) end += 24 * 60 * 60 * 1000
    dates = `${compactUtc(start)}/${compactUtc(end ?? start)}`
  } else {
    const day = compactDate(entry.date)
    const next = compactDate(entry.date, 1)
    dates = day && next ? `${day}/${next}` : null
  }
  if (!dates) return null
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: entry.title,
    dates,
    details: entry.description,
    location: entry.location,
    ctz: entry.timeZone,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcs(filename: string, entries: CalendarEntry[]) {
  const blob = new Blob([buildIcs(entries)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

const coupleTitle = `${wedding.couple.partnerOne.shortName} & ${wedding.couple.partnerTwo.shortName}`

/** Calendar entry for a configured event, or null if its date is not confirmed. */
export function entryForEvent(event: WeddingEvent): CalendarEntry | null {
  if (!event.date) return null
  const venue = venueById(event.venueId)
  const location = venue ? [venue.name, ...venue.addressLines].filter(Boolean).join(', ') : ''
  const siteLine = wedding.siteUrl ? `\n${wedding.siteUrl}` : ''
  return {
    uid: `${event.id}-${event.date}@a-little-universe-of-love`,
    title: `${coupleTitle} — ${event.name}`,
    description: `${event.name} of ${wedding.couple.partnerOne.fullName} & ${wedding.couple.partnerTwo.fullName}.${siteLine}`,
    location,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    timeZone: wedding.timeZone,
  }
}

/** All confirmed events — used by the countdown's "Add to calendar". */
export function weddingEntries() {
  const entries = wedding.events.map(entryForEvent).filter((entry): entry is CalendarEntry => entry !== null)
  if (entries.length) return entries
  return [
    {
      uid: `wedding-${wedding.weddingDate}@a-little-universe-of-love`,
      title: `${coupleTitle} — Wedding`,
      description: `The wedding of ${wedding.couple.partnerOne.fullName} & ${wedding.couple.partnerTwo.fullName}.`,
      location: '',
      date: wedding.weddingDate,
      startTime: null,
      endTime: null,
      timeZone: wedding.timeZone,
    },
  ]
}
