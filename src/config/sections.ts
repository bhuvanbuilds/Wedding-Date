/** Chapters of the experience, in story order. Used by the menu. */
export const chapters = [
  { id: 'invitation', label: 'The Invitation', mood: 'Mystery' },
  { id: 'date', label: 'The Date', mood: 'Discovery' },
  { id: 'story', label: 'Our Story', mood: 'Romance' },
  { id: 'moments', label: 'Little Moments', mood: 'Memories' },
  { id: 'celebrations', label: 'Celebrations', mood: 'Celebration' },
  { id: 'travel', label: 'Find Your Way', mood: 'Practical' },
  { id: 'wishes', label: 'Leave a Little Love', mood: 'Connection' },
  { id: 'finale', label: 'Thank You', mood: 'Gratitude' },
] as const

export type ChapterId = (typeof chapters)[number]['id']
