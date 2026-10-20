import { useMemo, useRef } from 'react'
import { ease, gsap, mediaConditions, SplitText, useGSAP } from '../animations/gsap'
import { GlowField } from '../components/atmosphere/GlowField'
import { AddToCalendar } from '../components/shared/AddToCalendar'
import { GoldRule, SectionLabel, VerticalRail } from '../components/shared/Decor'
import { wedding } from '../config/wedding'
import { useCountdown } from '../hooks/useCountdown'
import { weddingEntries } from '../lib/calendar'
import {
  formatLongDate,
  formatWallTime,
  parseIsoDate,
  timeZoneLabel,
  weekdayOf,
  zonedDateTimeToEpoch,
} from '../lib/time'

function Digits({ value, min = 2 }: { value: number; min?: number }) {
  const text = String(value).padStart(min, '0')
  return (
    <span className="digits" aria-hidden="true">
      {text.split('').map((digit, index) => (
        // Keyed by value so only changed digits re-mount and roll in.
        <span className="digit" key={`${index}-${digit}`}>
          {digit}
        </span>
      ))}
    </span>
  )
}

export function DateSection() {
  const root = useRef<HTMLElement>(null)
  const { target, dayEnd } = useMemo(() => {
    const t = zonedDateTimeToEpoch(wedding.countdown.date, wedding.countdown.time, wedding.timeZone)
    const start = zonedDateTimeToEpoch(wedding.countdown.date, null, wedding.timeZone)
    return { target: t, dayEnd: start === null ? null : start + 86_400_000 }
  }, [])
  const countdown = useCountdown(target, dayEnd)
  const entries = useMemo(() => weddingEntries(), [])

  const parsed = parseIsoDate(wedding.weddingDate)
  const dd = parsed ? String(parsed.day).padStart(2, '0') : '--'
  const mm = parsed ? String(parsed.month).padStart(2, '0') : '--'
  const yyyy = parsed ? String(parsed.year) : '----'
  const weekday = weekdayOf(wedding.weddingDate)
  const tz = timeZoneLabel(wedding.timeZone)
  const targetTime = wedding.countdown.time ? formatWallTime(wedding.countdown.time) : null

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(mediaConditions, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        if (reduce) {
          gsap.from('.date__inner > *', {
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.08,
            scrollTrigger: { trigger: '.date__inner', start: 'top 80%', once: true },
          })
          return
        }
        // The giant date fills with light as it scrolls through the viewport.
        gsap.fromTo(
          '.giant-date__fill',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: '.giant-date', start: 'top 80%', end: 'bottom 40%', scrub: 0.6 },
          },
        )
        gsap.from('.giant-date__line', {
          yPercent: 40,
          autoAlpha: 0,
          duration: 1.6,
          ease: ease.enter,
          stagger: 0.15,
          scrollTrigger: { trigger: '.giant-date', start: 'top 85%', once: true },
        })
        const heading = new SplitText('.date__heading', { type: 'words', mask: 'words' })
        gsap.from(heading.words, {
          yPercent: 100,
          duration: 1.2,
          ease: ease.enter,
          stagger: 0.06,
          scrollTrigger: { trigger: '.date__heading', start: 'top 85%', once: true },
        })
        gsap.from('.countdown__unit', {
          y: 30,
          autoAlpha: 0,
          duration: 1.2,
          ease: ease.enter,
          stagger: 0.1,
          scrollTrigger: { trigger: '.countdown', start: 'top 85%', once: true },
        })
        gsap.from('.date__meta > *', {
          y: 16,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: '.date__meta', start: 'top 90%', once: true },
        })
        return () => heading.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const units = [
    { label: 'Days', value: countdown.days, min: 2 },
    { label: 'Hours', value: countdown.hours, min: 2 },
    { label: 'Minutes', value: countdown.minutes, min: 2 },
    { label: 'Seconds', value: countdown.seconds, min: 2 },
  ]

  return (
    <section id="date" ref={root} className="scene date" data-nav-theme="dark" aria-labelledby="date-title">
      <div className="date__bg" aria-hidden="true" />
      <GlowField density={30} colors={['#D8B477', '#F0C9CF']} rise={4} />
      <VerticalRail side="left">Chapter 02 — The Date</VerticalRail>

      <div className="date__inner">
        <SectionLabel index="02">One special day</SectionLabel>
        <h2 id="date-title" className="visually-hidden">
          {formatLongDate(wedding.weddingDate)}
        </h2>

        <div className="giant-date" aria-hidden="true">
          <div className="giant-date__line giant-date__line--a">
            <span className="giant-date__outline">
              {dd}.{mm}
            </span>
            <span className="giant-date__fill">
              {dd}.{mm}
            </span>
          </div>
          <div className="giant-date__line giant-date__line--b">
            <span className="giant-date__weekday">{weekday}</span>
            <span className="giant-date__year">
              <span className="giant-date__outline">{yyyy}</span>
              <span className="giant-date__fill">{yyyy}</span>
            </span>
          </div>
        </div>

        <p className="date__heading">Counting every heartbeat until forever.</p>

        {countdown.status === 'counting' && (
          <div className="countdown" role="timer" aria-live="off">
            <p className="visually-hidden">
              {countdown.days} days, {countdown.hours} hours and {countdown.minutes} minutes to go.
            </p>
            {units.map((unit) => (
              <div className="countdown__unit" key={unit.label}>
                <Digits value={unit.value} min={unit.min} />
                <span className="countdown__label">{unit.label}</span>
              </div>
            ))}
          </div>
        )}
        {countdown.status === 'today' && <p className="countdown__message">Today is the day. Our forever begins.</p>}
        {countdown.status === 'passed' && (
          <p className="countdown__message">
            We said “forever” on {formatLongDate(wedding.weddingDate)}. Thank you for loving us.
          </p>
        )}
        {countdown.status === 'invalid' && (
          <p className="countdown__message">{formatLongDate(wedding.weddingDate) ?? 'Date to be announced'}</p>
        )}

        <GoldRule />

        <div className="date__meta">
          <p className="date__note">
            {formatLongDate(wedding.weddingDate)}
            {targetTime ? ` · ${targetTime}` : ''} · {tz}
          </p>
          <AddToCalendar entries={entries} filename="sam-and-prithiksha-wedding.ics" label="Save the date" />
        </div>
      </div>
    </section>
  )
}
