import { useState } from 'react'
import { hasLocation, mapsDirectionsUrl, mapsEmbedUrl, mapsViewUrl } from '../../lib/maps'
import type { Venue } from '../../types/wedding'
import { Icon } from '../shared/Icon'

function MapIllustration() {
  return (
    <svg className="map-art" viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill="currentColor" opacity=".04" />
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M-10 150C60 120 90 160 150 132s110-70 190-48" strokeWidth="14" opacity=".08" />
        <path d="M-10 60h340M-10 118h340M40-10v220M118-10v220M206-10v220M268-10v220" strokeWidth="1" opacity=".22" />
        <path d="M-10 18 330 182M-10 190 160-10" strokeWidth=".8" opacity=".16" strokeDasharray="3 5" />
      </g>
      <g className="map-art__pin" transform="translate(160 96)">
        <circle r="26" fill="#C61E45" opacity=".12" className="map-art__pulse" />
        <path d="M0 18s-15-13.5-15-25.5a15 15 0 0 1 30 0C15 4.5 0 18 0 18z" fill="#6E1029" />
        <path
          d="M0 2.5s-6.2-3.8-6.2-8.4a3.6 3.6 0 0 1 6.2-2.3 3.6 3.6 0 0 1 6.2 2.3C6.2-1.3 0 2.5 0 2.5z"
          fill="#F0C9CF"
        />
      </g>
    </svg>
  )
}

export function VenuePanel({ venue, eventNames }: { venue: Venue; eventNames: string[] }) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const located = hasLocation(venue)
  const viewUrl = located ? mapsViewUrl(venue) : null
  const directionsUrl = located ? mapsDirectionsUrl(venue) : null
  const embedUrl = located ? mapsEmbedUrl(venue) : null
  const address = [venue.name, ...venue.addressLines].filter(Boolean).join(', ')

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="venue">
      <div className="venue__map">
        {mapLoaded && embedUrl ? (
          <iframe
            title={`Map of ${venue.name ?? 'the venue'}`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <>
            <MapIllustration />
            {embedUrl ? (
              <button type="button" className="venue__map-load" onClick={() => setMapLoaded(true)}>
                <Icon name="pin" /> Show the map
              </button>
            ) : (
              <p className="venue__map-note">The map will appear once the venue is confirmed</p>
            )}
          </>
        )}
      </div>

      <div className="venue__info">
        <p className="venue__for">For the {eventNames.join(' & ')}</p>
        <h3 className="venue__name">{venue.name ?? <span className="tba">Venue to be announced</span>}</h3>
        {venue.addressLines.length > 0 ? (
          <address className="venue__address">
            {venue.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        ) : (
          <p className="venue__address tba">Full address to follow</p>
        )}
        {venue.landmark && (
          <p className="venue__landmark">
            <Icon name="sparkle" /> Landmark: {venue.landmark}
          </p>
        )}

        <div className="venue__actions">
          {viewUrl && (
            <a className="btn btn--ink" href={viewUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" /> Open in Google Maps
            </a>
          )}
          {directionsUrl && (
            <a className="btn btn--ink" href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="directions" /> Directions
            </a>
          )}
          {venue.addressLines.length > 0 && (
            <button type="button" className="btn btn--quiet" onClick={() => void copyAddress()}>
              <Icon name="copy" /> {copied ? 'Address copied' : 'Copy address'}
            </button>
          )}
          {!located && (
            <span className="calendar-pending">
              <Icon name="directions" /> Directions will be added here
            </span>
          )}
        </div>
      </div>

      <ul className="transport">
        {venue.transport.map((option) => (
          <li className="transport__item" key={`${option.kind}-${option.title}`}>
            <span className="transport__icon">
              <Icon name={option.kind} />
            </span>
            <div className="transport__text">
              <h4>{option.title}</h4>
              {option.details ? <p>{option.details}</p> : <p className="tba">Details to follow</p>}
              {option.link && (
                <a href={option.link.url} target="_blank" rel="noopener noreferrer" className="text-link">
                  {option.link.label} <Icon name="arrowRight" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {venue.arrivalNotes.length > 0 && (
        <div className="arrival">
          <h4>Arrival notes</h4>
          <ul>
            {venue.arrivalNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
