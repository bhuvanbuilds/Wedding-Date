import type { TransportOption, Venue, WeddingConfig } from '../types/wedding'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  A LITTLE UNIVERSE OF LOVE — single source of truth for the wedding site
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Edit this file to change anything guests see. Every value marked
 *  `null` is NOT confirmed yet — the site shows a graceful
 *  "to be announced" state until you fill it in. Nothing here is invented.
 *
 *  In development, the browser console lists every value still missing.
 */

/** Default travel rows shown for each venue until real details are added. */
const transportPlaceholders = (): TransportOption[] => [
  { kind: 'car', title: 'By car or taxi', details: null },
  { kind: 'bus', title: 'By bus', details: null },
  { kind: 'train', title: 'By train', details: null },
  { kind: 'parking', title: 'Parking', details: null },
]

const venues: Venue[] = [
  {
    id: 'marriage-venue',
    name: null, // e.g. "St. Thomas Cathedral"
    addressLines: [], // e.g. ["12 Church Road", "Chennai, Tamil Nadu 600001"]
    mapsUrl: null, // paste a Google Maps share link here
    coordinates: null, // e.g. { lat: 13.0418, lng: 80.2341 }
    landmark: null,
    transport: transportPlaceholders(),
    arrivalNotes: [],
  },
  {
    id: 'reception-venue',
    name: null,
    addressLines: [],
    mapsUrl: null,
    coordinates: null,
    landmark: null,
    transport: transportPlaceholders(),
    arrivalNotes: [],
  },
]

export const wedding: WeddingConfig = {
  projectName: 'A Little Universe of Love',

  couple: {
    partnerOne: { fullName: 'Sam Speryan', shortName: 'Sam' },
    partnerTwo: { fullName: 'Prithiksha', shortName: 'Prithiksha' },
    monogram: 'S & P',
  },

  weddingDate: '2027-02-08',
  dateRevealText: '08 FEB 2027',
  timeZone: 'Asia/Kolkata',

  // Counts down to the start of the wedding day until the marriage time is
  // confirmed. Set `time` (e.g. "10:30") once the ceremony time is final.
  countdown: { date: '2027-02-08', time: null },

  verse: {
    reference: 'Song of Solomon 3:4',
    translation: 'KJV',
    // Verified against the King James Version (excerpt of the verse).
    text: 'I found him whom my soul loveth: I held him, and would not let him go.',
  },

  intro: {
    eyebrow: 'A Little Universe of Love',
    tagline: 'Two hearts. One beautiful journey.',
  },

  invitation: {
    teaser: 'A little secret awaits…',
    instruction: 'Scratch to discover our special day',
    promise: 'Forever begins with a little magic',
  },

  story: {
    heading: 'Our Story',
    // Add a short paragraph in your own words. Leave null to keep the
    // minimal typographic composition.
    intro: null,
    // Real milestones only, e.g.
    // { label: '2019', title: 'The first hello', body: '…', photo: { src: '/photos/first.jpg', alt: '…', width: 1200, height: 1500 } }
    chapters: [],
    // Couple photographs placed in /public/photos — see README.
    photos: [],
  },

  events: [
    {
      id: 'marriage',
      name: 'Marriage',
      tagline: 'The vows',
      date: '2027-02-08',
      startTime: null, // e.g. "10:30"
      endTime: null,
      venueId: 'marriage-venue',
      dressCode: null,
      notes: [],
    },
    {
      id: 'reception',
      name: 'Reception',
      tagline: 'The celebration',
      date: null, // confirm the reception date, e.g. "2027-02-08"
      startTime: null, // e.g. "18:30"
      endTime: null,
      venueId: 'reception-venue',
      dressCode: null,
      notes: [],
    },
  ],

  venues,

  wishes: {
    heading: 'Leave a Little Love',
    intro:
      'Write a few words for Sam & Prithiksha — a blessing, a memory, a wish for the years ahead. Every note becomes a light in this garden.',
    nameMaxLength: 60,
    messageMaxLength: 500,
    pageSize: 12,
  },

  closing: {
    heading: 'Thank you for being part of our story.',
    signature: 'With love, Sam & Prithiksha',
  },

  audio: {
    // Drop an mp3 into /public/audio and set e.g. '/audio/our-song.mp3'.
    src: null,
    title: 'A soft music box',
  },

  // Set to the deployed URL (e.g. "https://sam-and-prithiksha.vercel.app")
  // so the share button and link previews use it.
  siteUrl: null,
}

export const venueById = (id: string) => wedding.venues.find((venue) => venue.id === id)
