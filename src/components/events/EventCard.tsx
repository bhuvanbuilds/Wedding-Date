import type { ReactNode } from 'react'
import { venueById } from '../../config/wedding'
import { entryForEvent } from '../../lib/calendar'
import { hasLocation, mapsDirectionsUrl, mapsViewUrl } from '../../lib/maps'
import { formatLongDate, formatTimeRange } from '../../lib/time'
import type { WeddingEvent } from '../../types/wedding'
import { AddToCalendar } from '../shared/AddToCalendar'
import { RoseSprig } from '../shared/Decor'
import { Icon } from '../shared/Icon'
import type { IconName } from '../shared/Icon'

function Row({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="event-row">
      <dt>
        <Icon name={icon} />
        <span>{label}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  )
}

const Tba = ({ children }: { children: ReactNode }) => <span className="tba">{children}</span>

export function EventCard({
  event,
  variant,
  numeral,
}: {
  event: WeddingEvent
  variant: 'light' | 'dark'
  numeral: string
}) {
  const venue = venueById(event.venueId)
  const located = hasLocation(venue)
  const viewUrl = located ? mapsViewUrl(venue) : null
  const directionsUrl = located ? mapsDirectionsUrl(venue) : null
  const entry = entryForEvent(event)
  const date = event.date ? formatLongDate(event.date) : null
  const time = formatTimeRange(event.startTime, event.endTime)

  return (
    <article className={`event-card event-card--${variant}`} aria-labelledby={`event-${event.id}`}>
      <div className="event-card__light" aria-hidden="true" />
      <RoseSprig className="event-card__sprig" />
      <header className="event-card__head">
        <span className="event-card__numeral" aria-hidden="true">
          {numeral}
        </span>
        <div>
          {event.tagline && <p className="event-card__tagline">({event.tagline})</p>}
          <h3 id={`event-${event.id}`} className="event-card__title">
            {event.name}
          </h3>
        </div>
      </header>

      <dl className="event-card__details">
        <Row icon="calendar" label="Date">
          {date ?? <Tba>Date to be announced</Tba>}
        </Row>
        <Row icon="clock" label="Time">
          {time ?? <Tba>Time to be announced</Tba>}
        </Row>
        <Row icon="pin" label="Venue">
          {venue?.name ? <strong className="event-card__venue">{venue.name}</strong> : <Tba>Venue to be announced</Tba>}
          {venue && venue.addressLines.length > 0 && (
            <address>
              {venue.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          )}
        </Row>
        {event.dressCode && (
          <Row icon="dress" label="Dress code">
            {event.dressCode}
          </Row>
        )}
        {event.notes.length > 0 && (
          <Row icon="info" label="Good to know">
            <ul className="event-card__notes">
              {event.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Row>
        )}
      </dl>

      <div className="event-card__actions">
        {viewUrl && directionsUrl ? (
          <>
            <a
              className={`btn ${variant === 'light' ? 'btn--ink' : 'btn--ghost'}`}
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="pin" /> View location
            </a>
            <a
              className={`btn ${variant === 'light' ? 'btn--ink' : 'btn--ghost'}`}
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="directions" /> Get directions
            </a>
          </>
        ) : (
          <span className="calendar-pending">
            <Icon name="pin" /> Map &amp; directions will appear here soon
          </span>
        )}
        <AddToCalendar
          entries={entry ? [entry] : []}
          filename={`sam-and-prithiksha-${event.id}.ics`}
          variant={variant}
        />
      </div>
    </article>
  )
}
