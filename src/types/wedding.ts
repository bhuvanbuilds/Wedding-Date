/**
 * Typed shapes for everything the site renders.
 * All real content lives in `src/config/wedding.ts`.
 *
 * Convention: `null` means "not confirmed yet". The UI renders an elegant
 * "to be announced" state for null values instead of inventing details.
 */

/** ISO calendar date, e.g. "2027-02-08". */
export type IsoDate = `${number}-${number}-${number}`

/** 24h wall-clock time at the venue, e.g. "18:30". */
export type WallTime = `${number}:${number}`

export interface Person {
  /** Full name as it should appear on the invitation. */
  fullName: string
  /** Short / first name used in casual copy. */
  shortName: string
}

export interface Venue {
  id: string
  /** Venue name, e.g. "St. Mary's Church". */
  name: string | null
  /** Full postal address, one line per array item. */
  addressLines: string[]
  /**
   * Direct Google Maps link (share link from the Maps app works well).
   * If omitted but an address or coordinates exist, a search link is generated.
   */
  mapsUrl: string | null
  /** Optional precise coordinates — enables exact directions and the map preview. */
  coordinates: { lat: number; lng: number } | null
  /** Nearby landmark that helps guests orient themselves. */
  landmark: string | null
  transport: TransportOption[]
  /** Free-form arrival tips (gate to use, drop-off point, etc.). */
  arrivalNotes: string[]
}

export type TransportKind = 'car' | 'taxi' | 'bus' | 'train' | 'metro' | 'airport' | 'parking' | 'walk'

export interface TransportOption {
  kind: TransportKind
  title: string
  /** Concise instructions. `null` renders a "details to follow" state. */
  details: string | null
  /** Optional action, e.g. a bus timetable or a ride-hailing link. */
  link?: { label: string; url: string } | null
}

export type EventId = 'marriage' | 'reception'

export interface WeddingEvent {
  id: EventId
  name: string
  /** One evocative line shown under the title. Keep it factual. */
  tagline: string | null
  date: IsoDate | null
  startTime: WallTime | null
  endTime: WallTime | null
  venueId: string
  dressCode: string | null
  notes: string[]
}

export interface StoryPhoto {
  /** Path inside /public, e.g. "/photos/together-01.jpg". */
  src: string
  alt: string
  caption?: string
  /** Intrinsic size — prevents layout shift. */
  width: number
  height: number
}

export interface GalleryPhoto {
  /** Path in /public (e.g. "/photos/01.jpg") or a full image URL. */
  src: string
  alt: string
  /** Short line shown beside the photo. Optional. */
  caption?: string
  /** "portrait" or "landscape" framing in the strip. */
  shape: 'portrait' | 'landscape'
  /** Marks a stand-in image — shows a small "Sample photo" tag. Remove once real. */
  sample?: boolean
}

export interface StoryChapter {
  /** e.g. "2019" or "The first hello". Use only real milestones. */
  label: string
  title: string
  body: string
  photo?: StoryPhoto
}

export interface WeddingConfig {
  projectName: string
  couple: { partnerOne: Person; partnerTwo: Person; monogram: string }
  /** The confirmed wedding date. */
  weddingDate: IsoDate
  /** Text revealed under the scratch card. */
  dateRevealText: string
  /** IANA time zone of the venues. */
  timeZone: string
  /**
   * What the countdown counts down to. When `time` is null the countdown
   * targets the start of the wedding day in `timeZone`.
   */
  countdown: { date: IsoDate; time: WallTime | null }
  verse: { reference: string; text: string; translation: string }
  intro: { eyebrow: string; tagline: string }
  invitation: { teaser: string; instruction: string; promise: string }
  story: {
    heading: string
    intro: string | null
    chapters: StoryChapter[]
    photos: StoryPhoto[]
  }
  /** The sideways-scrolling photo strip ("Moments"). Leave photos empty to hide it. */
  gallery: { heading: string; intro: string; outro: string; photos: GalleryPhoto[] }
  events: [WeddingEvent, WeddingEvent]
  venues: Venue[]
  wishes: {
    heading: string
    intro: string
    nameMaxLength: number
    messageMaxLength: number
    pageSize: number
  }
  closing: { heading: string; signature: string }
  audio: {
    /** Path to an mp3 in /public. When null, a soft generated music-box melody plays instead. */
    src: string | null
    title: string
  }
  /** Public URL of the deployed site, used for sharing. */
  siteUrl: string | null
}

export interface Wish {
  id: string
  guestName: string
  message: string
  createdAt: string
  /** True for wishes stored only in this browser (preview mode). */
  local?: boolean
}
