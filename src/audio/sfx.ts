import type { SoundKind } from '../game/ingredients'

/**
 * All sounds are synthesized with Web Audio, so the project ships no audio files.
 * The context starts on the first user gesture (browsers block audio before that).
 */

const MUTE_KEY = 'pizzeria:muted'
let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = readMuted()
let lastPlay = 0
let recent = 0

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function isMuted() {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  if (master) master.gain.value = value ? 0 : 0.6
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // Not persisted; fine.
  }
}

export function unlockAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume()
    return
  }
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 0.6
  master.connect(ctx.destination)
}

/** Lets through at most a dozen sounds a second, so a pile of collisions doesn't turn into noise. */
function allow() {
  if (!ctx || !master || muted) return false
  const now = performance.now()
  recent = now - lastPlay > 1000 ? 0 : recent
  if (recent > 12) return false
  if (recent === 0) lastPlay = now
  recent++
  return true
}

function noiseBuffer(seconds: number) {
  const buffer = ctx!.createBuffer(1, Math.ceil(ctx!.sampleRate * seconds), ctx!.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function envelope(gain: GainNode, t: number, peak: number, attack: number, decay: number) {
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

/** Wet hit: a burst of filtered noise. */
function splat(volume: number) {
  const t = ctx!.currentTime
  const src = ctx!.createBufferSource()
  src.buffer = noiseBuffer(0.25)
  const filter = ctx!.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1800 + Math.random() * 600, t)
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.18)
  const gain = ctx!.createGain()
  envelope(gain, t, 0.5 * volume, 0.005, 0.18)
  src.connect(filter).connect(gain).connect(master!)
  src.start(t)
  src.stop(t + 0.25)
}

/** Cartoon spring: a sine that drops in pitch. */
function boing(volume: number) {
  const t = ctx!.currentTime
  const osc = ctx!.createOscillator()
  osc.type = 'sine'
  const base = 380 + Math.random() * 120
  osc.frequency.setValueAtTime(base, t)
  osc.frequency.exponentialRampToValueAtTime(base * 0.45, t + 0.25)
  const gain = ctx!.createGain()
  envelope(gain, t, 0.35 * volume, 0.01, 0.25)
  osc.connect(gain).connect(master!)
  osc.start(t)
  osc.stop(t + 0.3)
}

function tick(volume: number) {
  const t = ctx!.currentTime
  const osc = ctx!.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(900 + Math.random() * 500, t)
  const gain = ctx!.createGain()
  envelope(gain, t, 0.25 * volume, 0.002, 0.06)
  osc.connect(gain).connect(master!)
  osc.start(t)
  osc.stop(t + 0.08)
}

export function playHit(kind: SoundKind, speed: number) {
  if (!allow()) return
  const volume = Math.min(1, speed / 9)
  if (kind === 'splat') splat(volume)
  else if (kind === 'boing') boing(volume)
  else tick(volume)
}

/** Rising filtered noise for the pizza sliding into the oven. */
export function playWhoosh() {
  if (!ctx || !master || muted) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(1.2)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(300, t)
  filter.frequency.exponentialRampToValueAtTime(2400, t + 0.9)
  const gain = ctx.createGain()
  envelope(gain, t, 0.5, 0.25, 0.9)
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
  src.stop(t + 1.2)
}

/** Oven crackle: a handful of tiny clicks spread over a couple of seconds. */
export function playCrackle(seconds: number) {
  if (!ctx || !master || muted) return
  const t0 = ctx.currentTime
  for (let i = 0; i < seconds * 14; i++) {
    const t = t0 + Math.random() * seconds
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(0.03)
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2000
    const gain = ctx.createGain()
    envelope(gain, t, 0.08 + Math.random() * 0.12, 0.001, 0.02)
    src.connect(filter).connect(gain).connect(master)
    src.start(t)
    src.stop(t + 0.04)
  }
}

/** Two-note bell when the review lands. */
export function playDing() {
  if (!ctx || !master || muted) return
  const t = ctx.currentTime
  for (const [freq, delay] of [
    [1046, 0],
    [1568, 0.12],
  ] as const) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    envelope(gain, t + delay, 0.3, 0.005, 0.8)
    osc.connect(gain).connect(master)
    osc.start(t + delay)
    osc.stop(t + delay + 0.9)
  }
}
