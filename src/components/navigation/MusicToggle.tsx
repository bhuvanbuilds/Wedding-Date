import { useSyncExternalStore } from 'react'
import { musicStore, toggleMusic } from '../../lib/music'
import { Icon } from '../shared/Icon'

export function MusicToggle({ className = '' }: { className?: string }) {
  const status = useSyncExternalStore(musicStore.subscribe, musicStore.get, musicStore.get)
  const playing = status === 'playing' || status === 'starting'
  const label =
    status === 'unavailable' ? 'Music unavailable on this device' : playing ? 'Pause music' : 'Play soft music'

  return (
    <button
      type="button"
      className={`icon-button music-toggle ${playing ? 'is-playing' : ''} ${className}`}
      aria-pressed={playing}
      aria-label={label}
      title={label}
      disabled={status === 'unavailable'}
      onClick={() => void toggleMusic()}
    >
      {!playing && <Icon name="music" className="music-toggle__icon" />}
      <span className="music-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="music-toggle__text" aria-hidden="true">
        {status === 'unavailable' ? 'No sound' : playing ? 'Sound on' : 'Sound off'}
      </span>
    </button>
  )
}
