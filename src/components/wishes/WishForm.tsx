import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { wedding } from '../../config/wedding'
import { burstFrom } from '../../lib/fx'
import { submitWish, validateWish, WishError, wishesMode } from '../../lib/wishes'
import type { Wish } from '../../types/wedding'
import { Icon } from '../shared/Icon'

type Status =
  { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; name: string } | { kind: 'error'; message: string }

export function WishForm({ onSent }: { onSent: (wish: Wish) => void }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const firstFocus = useRef<number | null>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const { nameMaxLength, messageMaxLength } = wedding.wishes
  const remaining = messageMaxLength - message.length

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (status.kind === 'sending') return
    const result = validateWish(name, message)
    setErrors(result.errors)
    if (result.errors.name || result.errors.message) {
      document.getElementById(result.errors.name ? `${id}-name` : `${id}-message`)?.focus()
      return
    }

    // Quiet spam guards: a hidden field and an impossibly fast submission.
    const tooFast = firstFocus.current !== null && performance.now() - firstFocus.current < 2500
    if (honeypot.current?.value || tooFast) {
      setStatus({ kind: 'sent', name: result.guestName })
      return
    }

    setStatus({ kind: 'sending' })
    try {
      const wish = await submitWish(name, message)
      setStatus({ kind: 'sent', name: wish.guestName })
      setName('')
      setMessage('')
      onSent(wish)
      if (submitRef.current)
        burstFrom(submitRef.current, { kinds: { heart: 16, spark: 30, petal: 6 }, speed: 360, gravity: -10, life: 1.8 })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof WishError ? error.message : 'Something went wrong. Please try again.',
      })
    }
  }

  const markFocus = () => {
    if (firstFocus.current === null) firstFocus.current = performance.now()
  }

  return (
    <form className="wish-form" onSubmit={(event) => void onSubmit(event)} noValidate>
      <div className="wish-form__field">
        <label htmlFor={`${id}-name`}>Your name</label>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          maxLength={nameMaxLength}
          value={name}
          onFocus={markFocus}
          onChange={(event) => {
            setName(event.target.value)
            if (errors.name) setErrors((current) => ({ ...current, name: undefined }))
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          placeholder="e.g. Aunty Mary"
        />
        {errors.name && (
          <p className="wish-form__error" id={`${id}-name-error`}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="wish-form__field">
        <label htmlFor={`${id}-message`}>Your wish</label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          maxLength={messageMaxLength}
          value={message}
          onFocus={markFocus}
          onChange={(event) => {
            setMessage(event.target.value)
            if (errors.message) setErrors((current) => ({ ...current, message: undefined }))
          }}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={`${id}-count${errors.message ? ` ${id}-message-error` : ''}`}
          placeholder="A blessing, a memory, a hope for the years ahead…"
        />
        <div className="wish-form__meta">
          {errors.message ? (
            <p className="wish-form__error" id={`${id}-message-error`}>
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span id={`${id}-count`} className={`wish-form__count ${remaining < 40 ? 'is-low' : ''}`} aria-live="polite">
            {remaining} characters left
          </span>
        </div>
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="wish-form__trap" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        ref={submitRef}
        type="submit"
        className="btn btn--glow wish-form__submit"
        disabled={status.kind === 'sending'}
      >
        {status.kind === 'sending' ? (
          <span>Planting your wish…</span>
        ) : (
          <>
            <span>Send with love</span>
            <Icon name="heart" />
          </>
        )}
      </button>

      <div className="wish-form__status" role="status" aria-live="polite">
        {status.kind === 'sent' && (
          <p className="wish-form__success">
            <Icon name="sparkle" /> Thank you, {status.name}!{' '}
            {wishesMode === 'supabase'
              ? 'Your wish will bloom in the garden once Sam & Prithiksha have read it.'
              : 'Your wish now glows in the garden below.'}
          </p>
        )}
        {status.kind === 'error' && (
          <p className="wish-form__error wish-form__error--global" role="alert">
            {status.message}
          </p>
        )}
      </div>
    </form>
  )
}
