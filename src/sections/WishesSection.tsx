import { useCallback, useEffect, useRef, useState } from 'react'
import { ease, gsap, mediaConditions, SplitText, useGSAP } from '../animations/gsap'
import { GlowField } from '../components/atmosphere/GlowField'
import { SectionLabel, VerticalRail } from '../components/shared/Decor'
import { WishDialog } from '../components/wishes/WishDialog'
import { WishForm } from '../components/wishes/WishForm'
import { WishGarden } from '../components/wishes/WishGarden'
import { wedding } from '../config/wedding'
import { ScrollTrigger } from '../animations/gsap'
import { fetchWishes, wishesMode } from '../lib/wishes'
import type { Wish } from '../types/wedding'

export function WishesSection() {
  const root = useRef<HTMLElement>(null)
  const [wishes, setWishes] = useState<Wish[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [openWish, setOpenWish] = useState<Wish | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchWishes(0, controller.signal)
      .then((result) => {
        setWishes((current) => [...current.filter((wish) => wish.local && wishesMode === 'supabase'), ...result.wishes])
        setHasMore(result.hasMore)
        setPage(0)
        setStatus('ready')
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setStatus('error')
      })
    return () => controller.abort()
  }, [reloadKey])

  // Garden height changes shift everything below — keep ScrollTriggers honest.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [wishes.length, status])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const result = await fetchWishes(page + 1)
      setWishes((current) => {
        const ids = new Set(current.map((wish) => wish.id))
        return [...current, ...result.wishes.filter((wish) => !ids.has(wish.id))]
      })
      setHasMore(result.hasMore)
      setPage((value) => value + 1)
    } catch {
      setHasMore(true)
    } finally {
      setLoadingMore(false)
    }
  }

  const onSent = useCallback((wish: Wish) => {
    setWishes((current) => [{ ...wish, local: true }, ...current])
    setStatus('ready')
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.from('.wishes__head > *, .wish-form', {
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.08,
            scrollTrigger: { trigger: '.wishes__head', start: 'top 85%', once: true },
          })
          return
        }
        const title = new SplitText('.wishes__title', { type: 'words,chars', mask: 'words' })
        const tl = gsap.timeline({
          defaults: { ease: ease.enter },
          scrollTrigger: { trigger: '.wishes__head', start: 'top 82%', once: true },
        })
        tl.from('.wishes__head .section-label', { autoAlpha: 0, y: 12, duration: 1 })
          .from(title.chars, { yPercent: 110, duration: 1.2, stagger: 0.03 }, 0.1)
          .from('.wishes__lede', { autoAlpha: 0, y: 16, duration: 1 }, 0.5)
          .from('.wish-form', { autoAlpha: 0, y: 40, rotate: -1.5, duration: 1.4 }, 0.6)
        return () => title.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="wishes" ref={root} className="scene wishes" data-nav-theme="dark" aria-labelledby="wishes-title">
      <div className="wishes__bg" aria-hidden="true" />
      <GlowField density={48} heartRatio={0.16} colors={['#D8B477', '#F0C9CF', '#C61E45']} rise={8} />
      <VerticalRail side="left">Chapter 06 — Connection</VerticalRail>

      <header className="wishes__head">
        <SectionLabel index="06">The wishes garden</SectionLabel>
        <h2 id="wishes-title" className="wishes__title">
          {wedding.wishes.heading}
        </h2>
        <p className="wishes__lede">{wedding.wishes.intro}</p>
        {wishesMode === 'preview' && (
          <p className="wishes__mode">
            Preview mode — wishes are kept on this device only until the guestbook is connected.
          </p>
        )}
      </header>

      <div className="wishes__layout">
        <WishForm onSent={onSent} />
        <div className="wishes__garden">
          <h3 className="wishes__garden-title">
            <span>Notes from our people</span>
            {wishes.length > 0 && (
              <small>
                {wishes.length}
                {hasMore ? '+' : ''}
              </small>
            )}
          </h3>
          <WishGarden
            wishes={wishes}
            status={status}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onRetry={() => {
              setStatus('loading')
              setReloadKey((key) => key + 1)
            }}
            onMore={() => void loadMore()}
            onOpen={setOpenWish}
          />
        </div>
      </div>

      <WishDialog wish={openWish} onClose={() => setOpenWish(null)} />
    </section>
  )
}
