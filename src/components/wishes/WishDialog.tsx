import { useEffect, useRef } from 'react'
import type { Wish } from '../../types/wedding'
import { Icon } from '../shared/Icon'
import { formatWishDate } from '../../lib/wishes'

/** Native <dialog>: focus trapping, Escape and screen-reader semantics for free. */
export function WishDialog({ wish, onClose }: { wish: Wish | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (wish && !dialog.open) {
      dialog.showModal()
      document.documentElement.classList.add('is-locked')
    }
    if (!wish && dialog.open) dialog.close()
    return () => document.documentElement.classList.remove('is-locked')
  }, [wish])

  return (
    <dialog
      ref={ref}
      className="wish-dialog"
      aria-labelledby="wish-dialog-name"
      onClose={onClose}
      onClick={(event) => {
        // Tap on the backdrop closes the letter.
        if (event.target === ref.current) ref.current?.close()
      }}
    >
      {wish && (
        <article className="wish-dialog__paper">
          <button
            type="button"
            className="wish-dialog__close icon-button"
            onClick={() => ref.current?.close()}
            aria-label="Close wish"
          >
            <Icon name="close" />
          </button>
          <p className="wish-dialog__eyebrow">(A wish for Sam &amp; Prithiksha)</p>
          <p className="wish-dialog__message">{wish.message}</p>
          <p className="wish-dialog__name" id="wish-dialog-name">
            — {wish.guestName}
          </p>
          {formatWishDate(wish.createdAt) && <p className="wish-dialog__date">{formatWishDate(wish.createdAt)}</p>}
        </article>
      )}
    </dialog>
  )
}
