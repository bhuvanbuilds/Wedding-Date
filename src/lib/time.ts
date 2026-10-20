/**
 * Time-zone aware helpers built on Intl — no date library needed.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const WALL_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseIsoDate(date: string) {
  const match = ISO_DATE.exec(date)
  if (!match) return null
  const [, y, m, d] = match
  const year = Number(y)
  const month = Number(m)
  const day = Number(d)
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null
  return { year, month, day }
}

export function parseWallTime(time: string) {
  const match = WALL_TIME.exec(time)
  if (!match) return null
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

/** Offset (ms) between UTC and the given zone at a specific instant. */
function zoneOffsetMs(epochMs: number, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts: Record<string, string> = {}
  for (const part of formatter.formatToParts(new Date(epochMs))) parts[part.type] = part.value
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - Math.floor(epochMs / 1000) * 1000
}

/**
 * Converts a wall-clock date/time in `timeZone` to a UTC epoch.
 * Returns null for invalid input or an unknown time zone.
 */
export function zonedDateTimeToEpoch(date: string, time: string | null, timeZone: string) {
  const parsedDate = parseIsoDate(date)
  const parsedTime = time ? parseWallTime(time) : { hour: 0, minute: 0 }
  if (!parsedDate || !parsedTime) return null
  try {
    const guess = Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day, parsedTime.hour, parsedTime.minute)
    const firstOffset = zoneOffsetMs(guess, timeZone)
    let epoch = guess - firstOffset
    const secondOffset = zoneOffsetMs(epoch, timeZone)
    if (secondOffset !== firstOffset) epoch = guess - secondOffset
    return epoch
  } catch {
    return null
  }
}

/** "Monday, 8 February 2027" — formatted without any zone shift. */
export function formatLongDate(date: string, locale = 'en-GB') {
  const parsed = parseIsoDate(date)
  if (!parsed) return null
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)))
}

export function weekdayOf(date: string, locale = 'en-GB') {
  const parsed = parseIsoDate(date)
  if (!parsed) return null
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)),
  )
}

/** "18:30" → "6:30 PM" */
export function formatWallTime(time: string) {
  const parsed = parseWallTime(time)
  if (!parsed) return null
  const suffix = parsed.hour >= 12 ? 'PM' : 'AM'
  const hour12 = parsed.hour % 12 === 0 ? 12 : parsed.hour % 12
  return `${hour12}:${String(parsed.minute).padStart(2, '0')} ${suffix}`
}

export function formatTimeRange(start: string | null, end: string | null) {
  if (!start) return null
  const from = formatWallTime(start)
  const to = end ? formatWallTime(end) : null
  if (!from) return null
  return to ? `${from} – ${to}` : `From ${from}`
}

export function timeZoneLabel(timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'long' }).formatToParts(new Date())
    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone
  } catch {
    return timeZone
  }
}
