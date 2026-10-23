import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { playDing } from '../audio/sfx'
import { useGame } from '../game/gameStore'
import { INTRO, Intro } from './compositions/Intro'
import { stampFrame, Verdict, VERDICT } from './compositions/Verdict'

interface Timing {
  width: number
  height: number
  fps: number
  durationInFrames: number
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A Player that plays once on mount, holds its last frame and reports when it ends. */
function OneShot<P extends Record<string, unknown>>({
  component,
  inputProps,
  timing,
  onEnded,
  className,
}: {
  component: ComponentType<P>
  inputProps: P
  timing: Timing
  onEnded?: () => void
  className?: string
}) {
  const ref = useRef<PlayerRef>(null)
  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  })
  useEffect(() => {
    const player = ref.current
    if (!player) return
    const handle = () => onEndedRef.current?.()
    player.addEventListener('ended', handle)
    return () => player.removeEventListener('ended', handle)
  }, [])

  return (
    <Player
      ref={ref}
      component={component as ComponentType<Record<string, unknown>>}
      inputProps={inputProps}
      compositionWidth={timing.width}
      compositionHeight={timing.height}
      fps={timing.fps}
      durationInFrames={timing.durationInFrames}
      initialFrame={prefersReducedMotion() ? timing.durationInFrames - 1 : 0}
      autoPlay={!prefersReducedMotion()}
      moveToBeginningWhenEnded={false}
      controls={false}
      clickToPlay={false}
      spaceKeyToPlayOrPause={false}
      className={className}
      style={{ width: '100%', height: '100%' }}
      acknowledgeRemotionLicense
    />
  )
}

/** Full-screen opening. The composition takes the window's aspect ratio so it never letterboxes. */
export function IntroOverlay() {
  const phase = useGame((s) => s.phase)
  const [height] = useState(() =>
    Math.round(Math.min(3400, Math.max(600, (INTRO.width * window.innerHeight) / Math.max(1, window.innerWidth)))),
  )

  useEffect(() => {
    if (phase !== 'intro') return
    if (prefersReducedMotion()) return useGame.getState().setPhase('menu')
    const skip = () => useGame.getState().phase === 'intro' && useGame.getState().setPhase('menu')
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [phase])

  if (phase !== 'intro') return null
  const finish = () => useGame.getState().setPhase('menu')
  return (
    <div className="intro" onClick={finish}>
      <OneShot component={Intro} inputProps={{ tagline: 'física, queso y malas decisiones' }} timing={{ ...INTRO, height }} onEnded={finish} />
      <button className="intro-skip">saltar ↵</button>
    </div>
  )
}

/** The chef's review, shown once the pizza comes out of the oven. */
export function VerdictPanel() {
  const phase = useGame((s) => s.phase)
  const review = useGame((s) => s.review)

  useEffect(() => {
    if (phase !== 'verdict' || !review) return
    const timer = setTimeout(playDing, (stampFrame(review.lines.length) / VERDICT.fps) * 1000)
    return () => clearTimeout(timer)
  }, [phase, review])

  if (phase !== 'verdict' || !review) return null
  const { name, score, stars, band, verdict, mood, headline, lines } = review
  return (
    <aside className="verdict" aria-live="polite">
      <div className="verdict-card">
        <OneShot component={Verdict} inputProps={{ name, score, stars, band, verdict, mood, headline, lines }} timing={VERDICT} />
      </div>
      {/* Screen readers get the review as text; the card itself is an animation. */}
      <p className="sr-only">
        {name}: {score} de 10, {verdict}. {headline} {lines.join(' ')}
      </p>
      <div className="verdict-actions">
        <button className="btn btn-primary" onClick={() => useGame.getState().startSandbox()}>
          Otra pizza
        </button>
        <button className="btn" disabled title="Próximamente">
          Ver la publicidad · pronto
        </button>
        <button className="btn btn-ghost" onClick={() => useGame.getState().setPhase('menu')}>
          Menú
        </button>
      </div>
    </aside>
  )
}
