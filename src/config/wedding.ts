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
    mapsUrl: 'https://maps.app.goo.gl/dAEP8mQojqERYopL7',
    coordinates: { lat: 13.1080462, lng: 80.2121671 },
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

  countdown: { date: '2027-02-08', time: '16:00' },

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
    subtitle: 'When Timing Meets Grace',
    cover: { src: '/photos/story/cover.jpg', alt: 'Sam and Prithiksha together', width: 1300, height: 636 },
    intro:
      "Some stories don't start with fireworks or loud declarations. They begin quietly — in ordinary moments, shared reflections, and the steady certainty that some things are simply meant to be.",
    // From the couple's storyboard; panels live in /public/photos/story.
    chapters: [
      {
        label: 'Early 2026',
        title: 'Across Quiet Prayers',
        body: "He was in the middle of a personal reset — discipline, quiet reflection, and growth. “I'm only twenty-five, why rush?” She was living with quiet patience, unwilling to settle for anything less than complete peace of mind. Two lives, two prayers, one perfect plan.",
        photo: { src: '/photos/story/01.jpg', alt: 'Each of them praying, apart', width: 992, height: 636 },
      },
      {
        label: 'A simple Sunday',
        title: 'The Unexpected Turning Point',
        body: 'Over lunch after church, a mutual friend noticed her picture on his father’s phone and said, “I’ve known her since childhood — she is exceptional. Play her songs!” Her worship videos soon filled the living room, and something in his heart quietly moved.',
        photo: { src: '/photos/story/02.jpg', alt: 'Watching her worship video at home', width: 760, height: 636 },
      },
      {
        label: 'A dream',
        title: 'A Deeper Understanding',
        body: 'In a striking dream, he saw himself standing in swirling, chaotic darkness, holding a girl’s hand beneath a single beam of clear, steady light — feeling an inexplicable, joyful stillness. Days later, a reflection on divine favour (Ratzon — a grace that surrounds life like a protective shield) anchored that dream into reality. It wasn’t coincidence. It was grace.',
        photo: { src: '/photos/story/03.jpg', alt: 'Holding hands beneath a beam of light', width: 898, height: 686 },
      },
      {
        label: 'The first meeting',
        title: 'The Green Shirt',
        body: '“I had a feeling you’d wear green today.” — her uncle. What people look for as nervous butterflies didn’t appear. Instead, there was clarity.',
        photo: { src: '/photos/story/04.jpg', alt: 'The first meeting', width: 662, height: 686 },
      },
      {
        label: 'A conversation that felt real',
        title: 'The First Hello',
        body: '“Hi! How was your day? How was your meditation?” No rehearsed lines. No pretences. Just two people who never had to pretend to be anyone else.',
        photo: { src: '/photos/story/05.jpg', alt: 'Their first conversation', width: 796, height: 686 },
      },
      {
        label: 'Standing firm',
        title: 'The Wait',
        body: 'When early questions and natural hesitations arose on her side, he didn’t panic or look elsewhere. “I didn’t go out of casual curiosity. I went because of a quiet conviction. We wait.” Patience won. Hesitation turned into mutual peace.',
        photo: { src: '/photos/story/06.jpg', alt: 'Waiting in quiet thought', width: 690, height: 686 },
      },
      {
        label: 'Small gestures, big meaning',
        title: 'A Flower in July',
        body: 'A single flower in July became a daily rhythm of exchanging thoughts, quiet encouragement, and honest values. It wasn’t about grand gestures, but consistent care.',
        photo: { src: '/photos/story/07.jpg', alt: 'A single flower', width: 746, height: 708 },
      },
      {
        label: 'September 14, 2026',
        title: 'We Said Yes',
        body: 'Surrounded by the people who loved us most, we exchanged rings — a beautiful “yes” to God’s perfect timing.',
        photo: { src: '/photos/story/08.jpg', alt: 'Exchanging rings', width: 744, height: 708 },
      },
      {
        label: 'More of us',
        title: 'The Days After',
        body: 'Ice cream dates, conversations about the future, building dreams together. Every week proving that peace isn’t the absence of questions — it’s knowing who stands beside you.',
        photo: { src: '/photos/story/09.jpg', alt: 'Ice cream together', width: 706, height: 708 },
      },
      {
        label: 'February 8, 2027',
        title: 'The Beginning of Us',
        body: 'We step across the threshold to build a warm, honest, and joyful home of our own. We aren’t stepping into this day expecting perfection, but with deep respect, unwavering loyalty, and grateful hearts for a timing far better than our own.',
        photo: { src: '/photos/story/10.jpg', alt: 'Walking toward the church together', width: 850, height: 708 },
      },
    ],
    // Couple photographs placed in /public/photos — see README.
    photos: [],
  },

  // The sideways-scrolling "Moments" strip — engagement photos in /public/photos/gallery.
  gallery: {
    heading: 'Little moments',
    intro: 'A few frames from our little universe.',
    outro: '…and so many more to come.',
    photos: [
      {
        src: '/photos/gallery/moment-04.jpg',
        alt: 'Sam and Prithiksha at their engagement, holding a bouquet',
        caption: 'The day we said yes',
        shape: 'portrait',
      },
      {
        src: '/photos/gallery/moment-01.jpg',
        alt: 'The couple standing together before the floral backdrop',
        caption: 'Side by side',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-05.jpg',
        alt: 'Sam and Prithiksha smiling in front of the monogram',
        caption: 'Just the two of us',
        shape: 'portrait',
      },
      {
        src: '/photos/gallery/moment-02.jpg',
        alt: 'Chocolate engagement cake with their initials',
        caption: 'A little sweetness',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-03.jpg',
        alt: 'The couple with their families at the engagement',
        caption: 'Surrounded by love',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-06.jpeg',
        alt: 'Sam and Prithiksha holding up their engagement rings',
        caption: 'A promise in our hands',
        shape: 'portrait',
      },
      {
        src: '/photos/gallery/moment-08.jpeg',
        alt: 'Sam and Prithiksha celebrating with their families',
        caption: 'Our families, together',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-09.jpeg',
        alt: 'Sam and Prithiksha standing with family at the engagement',
        caption: 'Family by our side',
        shape: 'landscape',
        objectPosition: 'center top',
      },
      {
        src: '/photos/gallery/moment-10.jpeg',
        alt: 'Sam and Prithiksha celebrating with loved ones',
        caption: 'A day full of joy',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-11.jpeg',
        alt: 'Sam and Prithiksha sharing a special moment at their engagement',
        caption: 'One unforgettable moment',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-12.jpeg',
        alt: 'Sam and Prithiksha with family at their engagement',
        caption: 'Love all around us',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-13.jpeg',
        alt: 'Sam celebrating with family at the engagement',
        caption: 'Celebrating together',
        shape: 'landscape',
      },
      {
        src: '/photos/gallery/moment-14.jpeg',
        alt: 'Sam and Prithiksha receiving a gift from their family',
        caption: 'A thoughtful gift',
        shape: 'landscape',
      },
    ],
  },

  events: [
    {
      id: 'marriage',
      name: 'Marriage',
      tagline: 'The vows',
      date: '2027-02-08',
      startTime: '16:00',
      endTime: '17:30',
      venueId: 'marriage-venue',
      dressCode: null,
      notes: [],
    },
    {
      id: 'reception',
      name: 'Reception',
      tagline: 'The celebration',
      date: '2027-02-08',
      startTime: '18:00',
      endTime: '22:00',
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
    // Put the licensed mp3 at /public/audio/perfect.mp3. Until it exists the
    // site falls back to the soft generated melody.
    src: '/audio/perfect.mp3',
    title: 'Perfect — Ed Sheeran',
  },

  // Set to the deployed URL (e.g. "https://sam-and-prithiksha.vercel.app")
  // so the share button and link previews use it.
  siteUrl: 'https://wedding-day-reveal.vercel.app',
}

export const venueById = (id: string) => wedding.venues.find((venue) => venue.id === id)
