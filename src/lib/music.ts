import { wedding } from '../config/wedding'

/**
 * Optional ambient music. Muted by default and only ever started by an
 * explicit tap on the music toggle.
 *
 * If `wedding.audio.src` is set, that file loops softly. Otherwise a gentle
 * music-box melody is generated live with the Web Audio API (no download).
 */

export type MusicStatus = 'off' | 'starting' | 'playing' | 'unavailable'

type Listener = () => void
const listeners = new Set<Listener>()
let status: MusicStatus = 'off'

function setStatus(next: MusicStatus) {
  status = next
  listeners.forEach((listener) => listener())
}

export const musicStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  get: () => status,
}

/* ───────────────────────── Generated music box ───────────────────────── */

const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

const progression: { root: number; tones: number[] }[] = [
  { root: 53, tones: [0, 4, 7, 11] }, // Fmaj7
  { root: 57, tones: [0, 3, 7, 10] }, // Am7
  { root: 50, tones: [0, 3, 7, 10] }, // Dm7
  { root: 46, tones: [0, 4, 7, 11] }, // B♭maj7
  { root: 53, tones: [0, 4, 7, 11] }, // Fmaj7
  { root: 57, tones: [0, 3, 7, 10] }, // Am7
  { root: 55, tones: [0, 3, 7, 10] }, // Gm7
  { root: 48, tones: [0, 5, 7, 10] }, // C7sus4
]

const BEAT = 60 / 64
const STEP = BEAT / 2
const STEPS_PER_CHORD = 8

class MusicBox {
  private ctx: AudioContext
  private master: GainNode
  private bus: GainNode
  private timer = 0
  private step = 0
  private nextTime = 0

  constructor() {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctor()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(this.ctx.destination)

    this.bus = this.ctx.createGain()
    this.bus.gain.value = 0.9
    this.bus.connect(this.master)

    // Soft room: generated impulse response.
    const reverb = this.ctx.createConvolver()
    reverb.buffer = this.impulse(2.8, 2.6)
    const wet = this.ctx.createGain()
    wet.gain.value = 0.55
    this.bus.connect(reverb)
    reverb.connect(wet)
    wet.connect(this.master)

    // Echo for sparkle.
    const delay = this.ctx.createDelay(1)
    delay.delayTime.value = STEP * 3
    const feedback = this.ctx.createGain()
    feedback.gain.value = 0.28
    const tone = this.ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2400
    const echo = this.ctx.createGain()
    echo.gain.value = 0.22
    this.bus.connect(delay)
    delay.connect(tone)
    tone.connect(feedback)
    feedback.connect(delay)
    tone.connect(echo)
    echo.connect(this.master)
  }

  private impulse(seconds: number, decay: number) {
    const rate = this.ctx.sampleRate
    const length = Math.floor(rate * seconds)
    const buffer = this.ctx.createBuffer(2, length, rate)
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
    return buffer
  }

  private bell(midi: number, time: number, velocity: number) {
    const freq = midiToHz(midi)
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(velocity, time + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.6)
    gain.connect(this.bus)
    const partials: [number, number][] = [
      [1, 1],
      [2, 0.22],
      [4.01, 0.06],
    ]
    for (const [ratio, level] of partials) {
      const osc = this.ctx.createOscillator()
      const partialGain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq * ratio
      partialGain.gain.value = level
      osc.connect(partialGain)
      partialGain.connect(gain)
      osc.start(time)
      osc.stop(time + 2.7)
    }
  }

  private pad(root: number, time: number, length: number) {
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 700
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.linearRampToValueAtTime(0.035, time + 1.4)
    gain.gain.linearRampToValueAtTime(0.0001, time + length + 0.8)
    filter.connect(gain)
    gain.connect(this.master)
    for (const [interval, detune] of [
      [0, -5],
      [7, 4],
      [12, 0],
    ]) {
      const osc = this.ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = midiToHz(root - 12 + interval)
      osc.detune.value = detune
      osc.connect(filter)
      osc.start(time)
      osc.stop(time + length + 1)
    }
  }

  private schedule = () => {
    while (this.nextTime < this.ctx.currentTime + 0.5) {
      const chordIndex = Math.floor(this.step / STEPS_PER_CHORD) % progression.length
      const chord = progression[chordIndex]
      const inChord = this.step % STEPS_PER_CHORD
      if (inChord === 0) this.pad(chord.root, this.nextTime, STEP * STEPS_PER_CHORD)

      const pattern = [0, 2, 1, 3, 2, 1, 3, 2]
      const restChance = inChord % 2 === 1 ? 0.35 : 0.08
      if (Math.random() > restChance) {
        const tone = chord.tones[pattern[inChord] % chord.tones.length]
        const octave = inChord === 0 || Math.random() < 0.2 ? 24 : 12
        const velocity = (inChord === 0 ? 0.16 : 0.1) * (0.8 + Math.random() * 0.4)
        const swing = inChord % 2 === 1 ? STEP * 0.08 : 0
        this.bell(chord.root + tone + octave, this.nextTime + swing, velocity)
      }
      this.nextTime += STEP
      this.step++
    }
  }

  async start() {
    await this.ctx.resume()
    const now = this.ctx.currentTime
    if (this.nextTime < now) this.nextTime = now + 0.1
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0.55, now + 2.5)
    window.clearInterval(this.timer)
    this.timer = window.setInterval(this.schedule, 120)
    this.schedule()
  }

  stop() {
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0, now + 0.6)
    window.clearInterval(this.timer)
    window.setTimeout(() => {
      if (status !== 'playing' && status !== 'starting') void this.ctx.suspend()
    }, 700)
  }
}

/* ───────────────────────────── Audio file ───────────────────────────── */

class FilePlayer {
  private audio: HTMLAudioElement
  private fade = 0

  constructor(src: string) {
    this.audio = new Audio(src)
    this.audio.loop = true
    this.audio.preload = 'none'
    this.audio.volume = 0
  }

  private rampTo(target: number, ms: number, done?: () => void) {
    window.clearInterval(this.fade)
    const from = this.audio.volume
    const started = performance.now()
    this.fade = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - started) / ms)
      this.audio.volume = from + (target - from) * t
      if (t >= 1) {
        window.clearInterval(this.fade)
        done?.()
      }
    }, 40)
  }

  async start() {
    await this.audio.play()
    this.rampTo(0.6, 1800)
  }

  stop() {
    this.rampTo(0, 600, () => this.audio.pause())
  }
}

/* ───────────────────────────── Controller ───────────────────────────── */

interface Player {
  start(): Promise<void>
  stop(): void
}

let player: Player | null = null
let usingFallback = false
let resumeOnVisible = false

function createPlayer(): Player | null {
  try {
    if (wedding.audio.src && !usingFallback) return new FilePlayer(wedding.audio.src)
    return new MusicBox()
  } catch {
    return null
  }
}

export async function toggleMusic() {
  if (status === 'playing' || status === 'starting') {
    player?.stop()
    setStatus('off')
    return
  }
  player ??= createPlayer()
  if (!player) {
    setStatus('unavailable')
    return
  }
  setStatus('starting')
  try {
    await player.start()
    setStatus('playing')
  } catch {
    // The audio file failed — fall back to the generated melody once.
    if (wedding.audio.src && !usingFallback) {
      usingFallback = true
      player = createPlayer()
      try {
        await player?.start()
        setStatus(player ? 'playing' : 'unavailable')
        return
      } catch {
        /* fall through */
      }
    }
    setStatus('unavailable')
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && status === 'playing') {
      resumeOnVisible = true
      player?.stop()
    } else if (!document.hidden && resumeOnVisible) {
      resumeOnVisible = false
      void player?.start().catch(() => setStatus('off'))
    }
  })
}
