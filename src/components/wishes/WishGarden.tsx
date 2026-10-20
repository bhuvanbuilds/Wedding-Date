import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { burstFrom } from '../../lib/fx'
import { wishesMode } from '../../lib/wishes'
import type { Wish } from '../../types/wedding'
import { Icon } from '../shared/Icon'

const tilt = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ((Math.abs(hash) % 50) - 25) / 10 // -2.5° … 2.5°
}

interface Props {
  wishes: Wish[]
  status: 'loading' | 'ready' | 'error'
  hasMore: boolean
  loadingMore: boolean
  onRetry: () => void
  onMore: () => void
  onOpen: (wish: Wish) => void
}

export function WishGarden({ wishes, status, hasMore, loadingMore, onRetry, onMore, onOpen }: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const seen = useRef(new Set<string>())

  // Newly arrived notes bloom in.
  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-wish-id]')
    items?.forEach((item, index) => {
      const wishId = item.dataset.wishId!
      if (seen.current.has(wishId)) return
      seen.current.add(wishId)
      item.style.setProperty('--delay', `${Math.min(index, 8) * 70}ms`)
      item.classList.add('is-blooming')
    })
  }, [wishes])

  if (status === 'loading') {
    return (
      <ul className="garden garden--loading" aria-label="Loading wishes">
        {[0, 1, 2, 3].map((n) => (
          <li key={n} className="wish-note wish-note--skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </li>
        ))}
      </ul>
    )
  }

  if (status === 'error') {
    return (
      <div className="garden-state" role="alert">
        <p>The garden couldn’t be reached just now.</p>
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  if (!wishes.length) {
    return (
      <div className="garden-state garden-state--empty">
        <svg viewBox="0 0 80 80" aria-hidden="true" className="garden-state__sprout">
          <path d="M40 72V38" />
          <path d="M40 46c-12 0-20-8-20-20 12 0 20 8 20 20zM40 38c0-12 8-20 20-20 0 12-8 20-20 20z" />
          <circle cx="40" cy="74" r="3" />
        </svg>
        <p>The garden is waiting for its first bloom.</p>
        <p className="garden-state__hint">Be the first to leave a little love.</p>
      </div>
    )
  }

  return (
    <>
      <ul className="garden" ref={listRef}>
        {wishes.map((wish, index) => (
          <li
            key={wish.id}
            data-wish-id={wish.id}
            className={`wish-note ${index % 3 === 1 ? 'wish-note--float' : ''} ${wish.local ? 'wish-note--local' : ''}`}
            style={{ '--tilt': `${tilt(wish.id)}deg`, '--float-delay': `${(index % 5) * -1.3}s` } as CSSProperties}
          >
            <button
              type="button"
              className="wish-note__button"
              onClick={(event) => {
                burstFrom(event.currentTarget, {
                  kinds: { heart: 6, spark: 10 },
                  speed: 180,
                  gravity: -40,
                  life: 1.1,
                  scale: 0.8,
                })
                onOpen(wish)
              }}
              aria-label={`Read the wish from ${wish.guestName}`}
            >
              <span className="wish-note__pin" aria-hidden="true" />
              <span className="wish-note__message">{wish.message}</span>
              <span className="wish-note__name">— {wish.guestName}</span>
              {wish.local && (
                <span className="wish-note__badge">
                  {wishesMode === 'supabase' ? 'Awaiting approval · only you can see this' : 'Saved on this device'}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="garden-more">
          <button type="button" className="btn btn--ghost" onClick={onMore} disabled={loadingMore}>
            <Icon name="sparkle" /> {loadingMore ? 'Gathering more wishes…' : 'Read more wishes'}
          </button>
        </div>
      )}
    </>
  )
}
