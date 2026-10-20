import type { Venue } from '../types/wedding'

function venueQuery(venue: Venue) {
  if (venue.coordinates) return `${venue.coordinates.lat},${venue.coordinates.lng}`
  const parts = [venue.name, ...venue.addressLines].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

export function hasLocation(venue: Venue | undefined): venue is Venue {
  return Boolean(venue && (venue.mapsUrl || venue.coordinates || venue.addressLines.length || venue.name))
}

/** Opens the venue in Google Maps (app on phones, web elsewhere). */
export function mapsViewUrl(venue: Venue) {
  if (venue.mapsUrl) return venue.mapsUrl
  const query = venueQuery(venue)
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null
}

/** Turn-by-turn directions from the guest's current location. */
export function mapsDirectionsUrl(venue: Venue) {
  const query = venueQuery(venue)
  if (!query) return venue.mapsUrl
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

/** Key-less embeddable map, loaded only when the guest asks for it. */
export function mapsEmbedUrl(venue: Venue) {
  const query = venueQuery(venue)
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed` : null
}
