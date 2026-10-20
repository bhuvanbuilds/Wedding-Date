# A Little Universe of Love

The wedding website of **Sam Speryan & Prithiksha** — 08 February 2027.

A mobile-first, cinematic invitation built for guests opening a WhatsApp link on their phones:

1. **Opening** — a particle heart that gathers, beats and answers your touch; the couple's names; *Enter Our Story*, *Skip intro* and a direct link to event details.
2. **The invitation** — the original heart-shaped scratch card, refined: velvet-and-gold cover, gold dust while scratching, reveal at ~60 %, or one tap on *Reveal the date*.
3. **The date** — editorial giant date that fills with light on scroll, a drift-free countdown (Asia/Kolkata) and *Save the date* (.ics + Google Calendar).
4. **Verse & story** — Song of Solomon 3:4 (KJV) and two arched portraits that take your photos.
5. **Two celebrations** — Marriage (parchment & gold) and Reception (evening burgundy & ruby).
6. **Find your way** — per-venue tabs, tap-to-load map, Google Maps view/directions, transport rows.
7. **Wishes garden** — guestbook with validation, spam guards, pagination and a letter-style reader.
8. **Thank you** — a night sky of rising heart lanterns (tap the sky to release one), share button, and a hidden message for the curious.

Stack: React 19 · TypeScript · Vite · GSAP 3.15 (ScrollTrigger, SplitText, ScrollTo) · Canvas 2D · optional Supabase.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run lint
```

Node 20+ is recommended.

## Edit the wedding details — one file

Everything guests read lives in **`src/config/wedding.ts`**. Values set to `null` are *not confirmed yet*; the site shows an elegant “to be announced” state for them and never invents details. In development the browser console lists every value still missing.

| What | Where in `wedding.ts` |
| --- | --- |
| Names, monogram | `couple` |
| Wedding date / revealed text | `weddingDate`, `dateRevealText` |
| Countdown target | `countdown.time` — set the ceremony time (e.g. `"10:30"`) once final; until then it counts to the start of the day |
| Time zone | `timeZone` (default `Asia/Kolkata`) |
| Marriage & Reception | `events[0]`, `events[1]` — `date`, `startTime`, `endTime`, `dressCode`, `notes` |
| Venues | `venues[]` — `name`, `addressLines`, `mapsUrl` (paste a Google Maps share link), `coordinates`, `landmark` |
| Transport | `venues[].transport[]` — `details` per row; add or remove rows (`car`, `taxi`, `bus`, `train`, `metro`, `airport`, `parking`, `walk`) |
| Story | `story.intro`, `story.chapters`, `story.photos` |
| Music | `audio.src` |
| Public URL | `siteUrl` |

If the Marriage and Reception share a venue, point both events at the same `venueId` — the travel section then shows a single venue instead of tabs.

### Add your photographs

1. Put optimised images in `public/photos/` (JPEG/WebP, ~1600 px on the long edge, < 400 KB each).
2. Add them to `story.photos` in `wedding.ts`:

```ts
photos: [
  { src: '/photos/sam.jpg', alt: 'Sam smiling by the sea', width: 1200, height: 1600 },
  { src: '/photos/prithiksha.jpg', alt: 'Prithiksha in the garden', width: 1200, height: 1600 },
  { src: '/photos/together.jpg', alt: 'Sam and Prithiksha at sunset', caption: 'Our favourite evening', width: 1600, height: 1067 },
],
```

The first two fill the arched portraits; any others form an editorial gallery below. Width/height prevent layout shift.

### Music

The music toggle is off by default and only starts after a guest taps it. With `audio.src: null` a soft music-box melody is generated live in the browser. To use your own song, add `public/audio/our-song.mp3` and set `audio.src: '/audio/our-song.mp3'` (if the file fails to load, the site falls back to the generated melody).

### Calendar invites

*Save the date* and each event's *Add to calendar* offer an `.ics` file (Apple Calendar, Outlook, most Android calendars) and a Google Calendar link. Events without a confirmed time become all-day entries; events without a confirmed date show “Calendar invite once the date is confirmed”.

## Wishes garden (Supabase)

Without configuration the guestbook runs in **preview mode** — it says so on the page and keeps wishes only on the guest's device.

To store wishes for real:

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/migrations/20261020000000_wedding_wishes.sql`](supabase/migrations/20261020000000_wedding_wishes.sql) (or `supabase db push` with the CLI).
3. In **Project Settings → API**, copy the **Project URL** and the **anon / publishable** key (never the service-role key).
4. Create `.env.local` from `.env.example` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Add the same variables to your host (e.g. Vercel → Settings → Environment Variables) and redeploy.

What the migration enforces:

- Row Level Security on `wedding_wishes`; anonymous visitors may **insert** only, and every new wish is forced to `pending`.
- Visitors can **read only approved** wishes, and only `id`, `guest_name`, `message`, `created_at` (column-level grants). Pending and rejected wishes are never exposed.
- No update/delete for visitors.
- A trigger strips control characters, rejects links, enforces 60/500-character limits and rate-limits by a SHA-256 hash of the client IP (3 per 10 minutes per device, 40 per minute overall). Raw IPs are not stored.
- The client adds a honeypot field, a minimum-time check and a 45-second cooldown.

**Moderating:** open **Table Editor → wedding_wishes** and change `moderation_status` to `approved` (or `rejected`). Approved wishes appear in the garden immediately. Guests see their own just-sent wish marked “Awaiting approval · only you can see this”.

## Deploy (Vercel)

1. Push this repository to GitHub and import it in Vercel (framework preset: **Vite**; build `npm run build`; output `dist`).
2. Add environment variables: `VITE_SITE_URL` (your final URL) and, if using the guestbook, the two Supabase variables.
3. Set `siteUrl` in `wedding.ts` to the same URL.
4. Optional: replace `public/og-image.jpg` (1200×630) — it's the picture WhatsApp shows when the link is shared.

Any static host (Netlify, Cloudflare Pages, GitHub Pages) works the same way: build, upload `dist/`.

## Project structure

```
src/
  config/        wedding.ts (all content), sections.ts (chapter list)
  types/         typed shapes for events, venues, wishes
  sections/      one component per scene, in story order
  components/
    atmosphere/  canvas layers: petals, glowing motes, lantern sky, burst FX
    intro/       the particle heart
    reveal/      the scratch heart
    events/ travel/ wishes/ navigation/ shared/
  animations/    GSAP registration + shared motion language (eases, durations)
  hooks/         canvas loop, countdown, reduced motion
  lib/           time zones, calendar (.ics), maps links, wishes API, music, FX
  styles/        design tokens + per-chapter styles
supabase/        SQL migration for the guestbook
```

## Design & engineering notes

- **Mobile first.** Tested at 320–430 px widths; no horizontal overflow; 44 px+ touch targets; 16 px+ form text (no iOS zoom).
- **Performance.** All particles are Canvas 2D with pre-rendered sprites; budgets scale with screen size and device capability; every canvas sleeps when off-screen or when the tab is hidden; the map only loads on tap. No WebGL needed.
- **Motion.** One GSAP motion language (`src/animations/gsap.ts`), scoped with `useGSAP` + `gsap.matchMedia` so every ScrollTrigger and SplitText is reverted on unmount. No scroll hijacking or pinning.
- **Reduced motion.** With `prefers-reduced-motion`, cinematic timelines become simple fades, canvases render a still frame, and all features keep working.
- **Accessibility.** Scratching is never required (*Reveal the date*), keyboard-reachable controls, native `<dialog>` for wishes, live regions for form feedback, skip link.
- **Honesty.** Nothing about the couple, venues, times or transport is invented — unconfirmed details are clearly marked as such until filled in.

### Credits & references

Visual research: the Tonami & Ayano wedding site (editorial typography, grainy atmosphere, hairline ornaments), the “shy curtain reveal” invitation (scratch interaction), GSAP docs, React Bits (text-split and click-spark patterns, re-implemented locally). Fonts: Cormorant Garamond, DM Sans, Great Vibes (Google Fonts, OFL). No third-party component code or imagery is bundled.
