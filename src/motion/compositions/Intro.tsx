import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, clamp, DISPLAY, MONO } from '../theme'

export type IntroProps = { tagline: string }

export const INTRO = { width: 1920, height: 1080, fps: 30, durationInFrames: 96 } as const

/** A cartoon pizza seen from above. */
function PizzaArt({ size }: { size: number }) {
  const toppings = [
    [70, 72, 13, '#b8231a'],
    [128, 64, 12, '#b8231a'],
    [104, 112, 14, '#b8231a'],
    [64, 128, 12, '#b8231a'],
    [138, 126, 13, '#b8231a'],
    [96, 150, 6, '#2e2231'],
    [150, 96, 6, '#2e2231'],
    [52, 100, 6, '#2e2231'],
    [116, 88, 7, C.basil],
    [84, 98, 7, C.basil],
  ] as const
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx={100} cy={100} r={96} fill={C.crust} stroke={C.ink} strokeWidth={5} />
      <circle cx={100} cy={100} r={80} fill={C.tomatoDark} />
      <path d="M100 26 C140 24 176 60 172 102 C170 140 136 174 98 172 C58 170 26 136 30 96 C34 58 64 28 100 26 Z" fill="#fff1cf" />
      {toppings.map(([x, y, r, color], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={color} />
      ))}
    </svg>
  )
}

/** Opening: a pizza spins in, the title drops like dough and squashes, then everything lifts away. */
export function Intro({ tagline }: IntroProps) {
  const frame = useCurrentFrame()
  const { fps, width, height, durationInFrames } = useVideoConfig()
  const unit = Math.min(width / 1920, height / 1080)
  const exitStart = durationInFrames - 22
  const pizza = spring({ frame, fps, config: { damping: 13, stiffness: 90 } })

  const word = (text: string, startFrame: number, color: string, fontSize: number) => (
    <div style={{ display: 'flex', gap: fontSize * 0.02 }}>
      {[...text].map((ch, i) => {
        const delay = startFrame + i * 2.2
        const s = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 170, mass: 0.7 } })
        // Squash on landing, like a ball of dough hitting the counter.
        const squash = interpolate(frame - delay, [6, 9, 14], [1, 0.7, 1], clamp)
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: DISPLAY,
              fontSize,
              lineHeight: 1,
              color,
              WebkitTextStroke: `${fontSize * 0.035}px ${C.ink}`,
              textShadow: `0 ${fontSize * 0.07}px 0 ${C.ink}`,
              translate: `0 ${(1 - s) * -height * 0.7}px`,
              scale: `${2 - squash} ${squash}`,
              transformOrigin: 'bottom center',
              opacity: frame >= delay ? 1 : 0,
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        )
      })}
    </div>
  )

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 35%, #e85a40 0%, ${C.tomato} 45%, ${C.tomatoDark} 100%)`,
          opacity: interpolate(frame, [exitStart, durationInFrames - 2], [1, 0], clamp),
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18 * unit,
          scale: interpolate(frame, [exitStart, durationInFrames], [1, 1.25], { ...clamp, easing: Easing.in(Easing.cubic) }),
          opacity: interpolate(frame, [exitStart, durationInFrames - 4], [1, 0], clamp),
        }}
      >
        <div
          style={{
            scale: pizza,
            rotate: `${interpolate(pizza, [0, 1], [-540, 0])}deg`,
            marginBottom: 10 * unit,
          }}
        >
          <PizzaArt size={300 * unit} />
        </div>
        {word('PIZZERÍA', 8, C.cream, 190 * unit)}
        <div style={{ rotate: `${Math.sin(frame / 5) * 3 * interpolate(frame, [30, 60], [1, 0.3], clamp)}deg` }}>
          {word('DEL CAOS', 22, C.gold, 150 * unit)}
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 40 * unit,
            color: C.cream,
            opacity: interpolate(frame, [50, 60], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [50, 60], [20, 0], clamp)}px`,
          }}
        >
          {tagline}
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
