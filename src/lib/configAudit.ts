import { wedding } from '../config/wedding'

/** Development helper: lists every wedding detail that is still a placeholder. */
export function auditConfig() {
  const missing: string[] = []
  for (const event of wedding.events) {
    if (!event.date) missing.push(`events.${event.id}.date`)
    if (!event.startTime) missing.push(`events.${event.id}.startTime`)
  }
  for (const venue of wedding.venues) {
    if (!venue.name) missing.push(`venues.${venue.id}.name`)
    if (!venue.addressLines.length) missing.push(`venues.${venue.id}.addressLines`)
    if (!venue.mapsUrl && !venue.coordinates) missing.push(`venues.${venue.id}.mapsUrl / coordinates`)
    venue.transport.forEach((option) => {
      if (!option.details) missing.push(`venues.${venue.id}.transport.${option.kind}`)
    })
  }
  if (!wedding.countdown.time) missing.push('countdown.time (counting to start of day)')
  if (!wedding.story.photos.length) missing.push('story.photos')
  if (!wedding.siteUrl) missing.push('siteUrl')
  if (missing.length) {
    console.info(
      `%c✦ A Little Universe of Love — ${missing.length} details still to confirm in src/config/wedding.ts:\n• ${missing.join('\n• ')}`,
      'color:#b96a7d',
    )
  }
}
