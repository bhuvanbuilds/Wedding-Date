import { useEffect, useState } from 'react'

export type CountdownStatus = 'invalid' | 'counting' | 'today' | 'passed'

export interface Countdown {
  status: CountdownStatus
  days: number
  hours: number
  minutes: number
  seconds: number
}

const DAY = 86_400_000

/**
 * Ticks on real second boundaries (no setInterval drift) and re-syncs when the
 * tab becomes visible again. `dayEnd` marks when "today" becomes "passed".
 */
export function useCountdown(target: number | null, dayEnd: number | null): Countdown {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (target === null) return
    let timer = 0
    const schedule = () => {
      const current = Date.now()
      if (current > (dayEnd ?? target) + 1000) return
      timer = window.setTimeout(tick, 1000 - (current % 1000) + 8)
    }
    const tick = () => {
      setNow(Date.now())
      schedule()
    }
    const onVisibility = () => {
      window.clearTimeout(timer)
      if (!document.hidden) timer = window.setTimeout(tick, 0)
    }
    schedule()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [target, dayEnd])

  if (target === null || !Number.isFinite(target)) {
    return { status: 'invalid', days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const remaining = target - now
  if (remaining <= 0) {
    const status = now < (dayEnd ?? target + DAY) ? 'today' : 'passed'
    return { status, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSeconds = Math.floor(remaining / 1000)
  return {
    status: 'counting',
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
