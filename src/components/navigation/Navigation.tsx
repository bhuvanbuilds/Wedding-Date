import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { chapters } from '../../config/sections'
import { wedding } from '../../config/wedding'
import { scrollToSection } from '../../lib/scroll'
import { Icon } from '../shared/Icon'
import { MusicToggle } from './MusicToggle'

/**
 * Discreet fixed navigation: monogram (back to top), music, and a full-screen
 * chapter menu. Colours adapt to light/dark sections underneath.
 */
export function Navigation() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const progressRef = useRef<HTMLSpanElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Theme follows the section under the header.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme]'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setTheme(entry.target.getAttribute('data-nav-theme') === 'light' ? 'light' : 'dark')
        }
      },
      { rootMargin: '0px 0px -94% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Hairline reading progress — written directly to the DOM, no re-renders.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Menu: focus, Escape, inert background, scroll lock.
  useEffect(() => {
    const main = document.getElementById('main')
    if (!open) return
    main?.setAttribute('inert', '')
    document.documentElement.classList.add('is-locked')
    sheetRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const button = menuButtonRef.current
    return () => {
      main?.removeAttribute('inert')
      document.documentElement.classList.remove('is-locked')
      window.removeEventListener('keydown', onKey)
      button?.focus()
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // Wait one frame so the scroll lock is released first.
    requestAnimationFrame(() => scrollToSection(id))
  }

  return (
    <>
      <header className={`site-nav site-nav--${theme} ${open ? 'is-open' : ''}`}>
        <span className="site-nav__progress" ref={progressRef} aria-hidden="true" />
        <a
          className="site-nav__monogram"
          href="#top"
          onClick={(event) => {
            event.preventDefault()
            go('top')
          }}
          aria-label="Back to the beginning"
        >
          {wedding.couple.monogram}
        </a>
        <div className="site-nav__actions">
          <MusicToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button menu-button"
            aria-expanded={open}
            aria-controls="chapter-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
            <span className="menu-button__text">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </header>

      <div
        id="chapter-menu"
        ref={sheetRef}
        className={`chapter-menu ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Chapters"
        hidden={!open}
      >
        <div className="chapter-menu__glow" aria-hidden="true" />
        <p className="chapter-menu__eyebrow">(Chapters of our little universe)</p>
        <nav>
          <ol className="chapter-menu__list">
            {chapters.map((chapter, index) => (
              <li key={chapter.id} style={{ '--i': index } as CSSProperties}>
                <a
                  href={`#${chapter.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    go(chapter.id)
                  }}
                >
                  <span className="chapter-menu__num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="chapter-menu__label">{chapter.label}</span>
                  <span className="chapter-menu__mood">{chapter.mood}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="chapter-menu__foot">
          {wedding.couple.partnerOne.fullName} &amp; {wedding.couple.partnerTwo.fullName}
        </p>
      </div>
    </>
  )
}
