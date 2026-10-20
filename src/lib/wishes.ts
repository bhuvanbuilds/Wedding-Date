import { wedding } from '../config/wedding'
import type { Wish } from '../types/wedding'

/**
 * Wishes repository.
 *
 * - With VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set, wishes are stored in
 *   the `wedding_wishes` table through Supabase's REST API. Row Level
 *   Security (see supabase/migrations) only lets visitors insert *pending*
 *   wishes and read *approved* ones.
 * - Without them, the site runs in an honest preview mode: wishes are kept in
 *   this browser only, and the UI says so.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '')
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as
  string | undefined

export const wishesMode: 'supabase' | 'preview' = SUPABASE_URL && SUPABASE_KEY ? 'supabase' : 'preview'

const LOCAL_KEY = 'aluol:wishes:v1'
const COOLDOWN_KEY = 'aluol:wishes:last'
const COOLDOWN_MS = 45_000

export class WishError extends Error {
  readonly kind: 'validation' | 'rate-limit' | 'network' | 'server'
  constructor(kind: WishError['kind'], message: string) {
    super(message)
    this.kind = kind
  }
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function normaliseWish(name: string, message: string) {
  const guestName = name.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim()
  const cleanMessage = message
    .replace(CONTROL_CHARS, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { guestName, message: cleanMessage }
}

export function validateWish(name: string, message: string) {
  const { guestName, message: cleanMessage } = normaliseWish(name, message)
  const errors: { name?: string; message?: string } = {}
  if (guestName.length < 1) errors.name = 'Please tell us your name.'
  else if (guestName.length > wedding.wishes.nameMaxLength)
    errors.name = `Please keep your name under ${wedding.wishes.nameMaxLength} characters.`
  if (cleanMessage.length < 2) errors.message = 'Please write a little wish.'
  else if (cleanMessage.length > wedding.wishes.messageMaxLength)
    errors.message = `Please keep your wish under ${wedding.wishes.messageMaxLength} characters.`
  if (/(https?:\/\/|www\.)\S+/i.test(cleanMessage) || /(https?:\/\/|www\.)/i.test(guestName))
    errors.message = 'Links aren’t allowed in wishes — just love.'
  return { guestName, message: cleanMessage, errors }
}

function headers(extra: Record<string, string> = {}) {
  const base: Record<string, string> = { apikey: SUPABASE_KEY ?? '', ...extra }
  // Legacy anon keys are JWTs and may also be sent as a bearer token.
  if (SUPABASE_KEY?.startsWith('eyJ')) base.Authorization = `Bearer ${SUPABASE_KEY}`
  return base
}

interface WishRow {
  id: string
  guest_name: string
  message: string
  created_at: string
}

function readLocal(): Wish[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is Wish =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Wish).id === 'string' &&
          typeof (item as Wish).guestName === 'string' &&
          typeof (item as Wish).message === 'string',
      )
      .map((item) => ({ ...item, local: true }))
  } catch {
    return []
  }
}

function writeLocal(wishes: Wish[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(wishes.slice(0, 50)))
  } catch {
    /* storage unavailable — the wish still shows for this visit */
  }
}

export async function fetchWishes(page: number, signal?: AbortSignal): Promise<{ wishes: Wish[]; hasMore: boolean }> {
  const size = wedding.wishes.pageSize
  if (wishesMode === 'preview') {
    const all = readLocal()
    const slice = all.slice(page * size, page * size + size)
    return { wishes: slice, hasMore: all.length > (page + 1) * size }
  }

  const params = new URLSearchParams({
    select: 'id,guest_name,message,created_at',
    order: 'created_at.desc',
    limit: String(size + 1),
    offset: String(page * size),
  })
  let response: Response
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/wedding_wishes?${params}`, { headers: headers(), signal })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    throw new WishError('network', 'We couldn’t reach the wishes garden. Please check your connection.')
  }
  if (!response.ok) throw new WishError('server', 'The wishes garden is resting. Please try again shortly.')
  const rows = (await response.json()) as WishRow[]
  return {
    wishes: rows.slice(0, size).map((row) => ({
      id: row.id,
      guestName: row.guest_name,
      message: row.message,
      createdAt: row.created_at,
    })),
    hasMore: rows.length > size,
  }
}

export function cooldownRemaining() {
  try {
    const last = Number(window.localStorage.getItem(COOLDOWN_KEY) ?? 0)
    return Math.max(0, last + COOLDOWN_MS - Date.now())
  } catch {
    return 0
  }
}

/**
 * Submits a wish. Resolves with the wish as the guest should see it.
 * In Supabase mode the wish is stored as `pending` until approved.
 */
export async function submitWish(name: string, message: string): Promise<Wish> {
  const validated = validateWish(name, message)
  if (validated.errors.name || validated.errors.message) {
    throw new WishError('validation', validated.errors.name ?? validated.errors.message ?? 'Invalid wish')
  }
  if (cooldownRemaining() > 0) {
    throw new WishError('rate-limit', 'Your last wish is still blooming — please wait a moment before sending another.')
  }

  const wish: Wish = {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    guestName: validated.guestName,
    message: validated.message,
    createdAt: new Date().toISOString(),
  }

  if (wishesMode === 'preview') {
    writeLocal([wish, ...readLocal()])
  } else {
    let response: Response
    try {
      response = await fetch(`${SUPABASE_URL}/rest/v1/wedding_wishes`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({ guest_name: wish.guestName, message: wish.message }),
      })
    } catch {
      throw new WishError('network', 'We couldn’t send your wish. Please check your connection and try again.')
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      if (response.status === 429 || /too many/i.test(detail)) {
        throw new WishError(
          'rate-limit',
          'So much love at once! Please wait a few minutes before sending another wish.',
        )
      }
      throw new WishError('server', 'Your wish couldn’t be planted just now. Please try again in a moment.')
    }
  }

  try {
    window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
  return { ...wish, local: wishesMode === 'preview' }
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatWishDate(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)
}
