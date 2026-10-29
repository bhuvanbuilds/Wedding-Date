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

/** Sample-image helper (Unsplash CDN, resized on the fly). */
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=900`

/** Public transport: guests are routed (Google Maps transit) to St. Joseph's University, the nearest stop. */
const transitToStJosephs =
  'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent("St. Joseph's University, Chembarambakkam") +
  '&travelmode=transit'

/** Travel rows shown for each venue. 
ull details show "details to follow". */
const transportFor = (): TransportOption[] => [
  {
    kind: 'bus',
    title: 'By public transport',
    details: "Bus or train to St. Joseph's University, Chembarambakkam — the nearest stop to the venues.",
    link: { label: 'Public transport directions', url: transitToStJosephs },
  },
  { kind: 'car', title: 'By car or taxi', details: null },
  { kind: 'parking', title: 'Parking', details: null },
]

const venues: Venue[] = [
  {
    id: 'marriage-venue',
    name: 'Body of Christ Church',
    addressLines: ['Kuthambakkam'],
    mapsUrl: null, // paste a Google Maps share link here
    coordinates: null, // e.g. { lat: 13.0418, lng: 80.2341 }
    landmark: null,
    transport: transportFor(),
    arrivalNotes: [],
  },
  {
    id: 'reception-venue',
    name: 'Loyola International School',
    addressLines: ['Palanjur', 'Opposite Queensland'],
    mapsUrl: null,
    coordinates: null,
    landmark: null,
    transport: transportFor(),
    arrivalNotes: [],
  },
]

export const wedding: WeddingConfig = {
  projectName: 'A Little Universe of Love',

  couple: {
    partnerOne: { fullName: 'Sam M Sperjan', shortName: 'Sam' },
    partnerTwo: { fullName: 'R Prithiksha', shortName: 'Prithiksha' },
    monogram: 'S & P',
  },

  weddingDate: '2027-02-08',
  dateRevealText: '08 FEB 2027',
  timeZone: 'Asia/Kolkata',

  // Counts down to the start of the wedding day until the marriage time is
  // confirmed. Set `time` (e.g. "10:30") once the ceremony time is final.
  countdown: { date: '2027-02-08', time: '04:00' },

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

  // The sideways-scrolling "Moments" strip. These are SAMPLE images from
  // Unsplash (free licence) so you can see the layout — replace each `src`
  // with your own photo (e.g. '/photos/moment-01.jpg' in /public/photos),
  // update `alt`/`caption`, and delete `sample: true`.
  gallery: {
    heading: 'Little moments',
    intro: 'A few frames from our little universe.',
    outro: '…and so many more to come.',
    photos: [
      {
        src: unsplash('photo-1613068431228-8cb6a1e92573'),
        alt: 'Candles glowing among eucalyptus',
        caption: 'Every little light',
        shape: 'portrait',
        sample: true,
      },
      {
        src: unsplash('photo-1518370265276-f22b706aeac8'),
        alt: 'A diamond ring resting on deep red roses',
        caption: 'A promise in bloom',
        shape: 'landscape',
        sample: true,
      },
      {
        src: unsplash('photo-1529634597503-139d3726fed5'),
        alt: 'Two hands with wedding rings',
        caption: 'Two hands, one forever',
        shape: 'portrait',
        sample: true,
      },
      {
        src: unsplash('photo-1515934751635-c81c6bc9a2d8'),
        alt: 'Wedding bands on a pink rose bouquet',
        caption: 'Soft as a first hello',
        shape: 'landscape',
        sample: true,
      },
      {
        src: unsplash('photo-1637616919953-5943e10bd4bf'),
        alt: 'Wedding rings on a handwritten letter',
        caption: 'Written in gold',
        shape: 'portrait',
        sample: true,
      },
      {
        src: unsplash('photo-1494972308805-463bc619d34e'),
        alt: 'A field of red roses',
        caption: 'A garden of yeses',
        shape: 'landscape',
        sample: true,
      },
      {
        src: unsplash('photo-1520854221256-17451cc331bf'),
        alt: 'A couple holding hands, their shadows on the grass',
        caption: 'Walking the same way',
        shape: 'portrait',
        sample: true,
      },
      {
        src: unsplash('photo-1578439231583-9eca0a363860'),
        alt: 'Close-up of red roses',
        caption: 'Love, in full bloom',
        shape: 'landscape',
        sample: true,
      },
    ],
  },

  events: [
    {
      id: 'marriage',
      name: 'Marriage',
      tagline: 'The vows',
      date: '2027-02-08',
      // As given in the client form (AM) — confirm.
      startTime: '04:00',
      endTime: '05:30',
      venueId: 'marriage-venue',
      dressCode: null,
      notes: [],
    },
    {
      id: 'reception',
      name: 'Reception',
      tagline: 'The celebration',
      date: '2027-02-08',
      // As given in the client form (AM) — confirm.
      startTime: '06:00',
      endTime: '10:00',
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
  siteUrl: 'https://wedding-day-reveal.vercel.app',
}

export const venueById = (id: string) => wedding.venues.find((venue) => venue.id === id)
