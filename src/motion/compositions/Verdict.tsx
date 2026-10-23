import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { Band, Mood } from '../../game/critic'
import { Chef } from '../Chef'
import { C, clamp, DISPLAY, MONO } from '../theme'

export type VerdictProps = {
  name: string
  score: number
  stars: number
  band: Band
  verdict: string
  mood: Mood
  headline: string
  lines: string[]
}

export const VERDICT = { width: 800, height: 1000, fps: 30, durationInFrames: 210 } as const

const LINE_START = 108
const LINE_GAP = 26
const LINE_TYPE = 22

/** Frame at which the verdict stamp slams down (the app plays a bell then). */
export const stampFrame = (lines: number) => LINE_START + lines * LINE_GAP + 6

const STAMP_COLOR: Record<Band, string> = { masterpiece: C.gold, good: C.basil, meh: C.crust, bad: C.tomato }

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

function Star({ fill, size }: { fill: number; size: number }) {
  const id = `star-${Math.round(fill * 10)}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={id}>
          <stop offset={fill} stopColor={C.gold} />
          <stop offset={fill} stopColor="#e9dcc4" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={`url(#${id})`}
        stroke={C.ink}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The chef's review card: drumroll on the score, stars, typed remarks and a stamp. */
export function Verdict({ name, score, stars, band, verdict, mood, headline, lines }: VerdictProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 140 } })
  const chef = spring({ frame: frame - 8, fps, config: { damping: 9, stiffness: 160 } })
  const nameChars = Math.floor(interpolate(frame, [20, 42], [0, name.length], clamp))
  // Drumroll: digits flicker, then land on the real score with a punch.
  const landed = frame >= 70
  const shownScore = frame < 34 ? '–' : landed ? fmt(score) : String((frame * 7) % 10)
  const punch = spring({ frame: frame - 70, fps, config: { damping: 7, stiffness: 220 } })
  const starsShown = interpolate(frame, [76, 76 + Math.max(1, stars) * 6], [0, stars], clamp)
  const stampAt = stampFrame(lines.length)
  const stamp = spring({ frame: frame - stampAt, fps, config: { damping: 10, stiffness: 260 } })

  return (
    <AbsoluteFill style={{ padding: 24 }}>
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: C.paper,
          borderRadius: 28,
          border: `5px solid ${C.ink}`,
          boxShadow: `0 14px 0 ${C.ink}`,
          translate: `0 ${(1 - enter) * 140}px`,
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
        }}
      >
        <div
          style={{
            padding: '18px 32px',
            background: C.tomato,
            color: C.cream,
            fontFamily: DISPLAY,
            fontSize: 40,
            letterSpacing: '0.04em',
            borderBottom: `5px solid ${C.ink}`,
          }}
        >
          CRÍTICA DEL CHEF PEPINO
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '28px 36px 8px' }}>
          <div style={{ scale: chef, rotate: `${interpolate(chef, [0, 1], [-25, 0])}deg`, flexShrink: 0 }}>
            <Chef mood={mood} size={210} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 44, lineHeight: 1.05, color: C.ink, minHeight: 92 }}>{name.slice(0, nameChars)}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 132,
                  lineHeight: 1,
                  color: landed ? STAMP_COLOR[band] : C.ink,
                  WebkitTextStroke: `4px ${C.ink}`,
                  scale: landed ? interpolate(punch, [0, 1], [1.5, 1]) : 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {shownScore}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 36, color: C.muted }}>/10</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={46} fill={Math.round(Math.min(1, Math.max(0, starsShown - i)) * 2) / 2} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 40px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 46,
              color: C.tomato,
              opacity: interpolate(frame, [92, 100], [0, 1], clamp),
              translate: `0 ${interpolate(frame, [92, 100], [16, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px`,
            }}
          >
            {headline}
          </span>
          {lines.map((line, i) => {
            const start = LINE_START + i * LINE_GAP
            const chars = Math.floor(interpolate(frame, [start, start + LINE_TYPE], [0, line.length], clamp))
            return (
              <span key={i} style={{ fontFamily: MONO, fontSize: 27, lineHeight: 1.35, color: C.ink, opacity: frame >= start ? 1 : 0 }}>
                — {line.slice(0, chars)}
              </span>
            )
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            right: 36,
            bottom: 40,
            padding: '10px 26px',
            border: `8px double ${STAMP_COLOR[band]}`,
            borderRadius: 14,
            color: STAMP_COLOR[band],
            fontFamily: DISPLAY,
            fontSize: 62,
            letterSpacing: '0.04em',
            rotate: '-12deg',
            opacity: frame >= stampAt ? 0.92 : 0,
            scale: interpolate(stamp, [0, 1], [2.6, 1]),
            mixBlendMode: 'multiply',
          }}
        >
          {verdict}
        </div>
      </div>
    </AbsoluteFill>
  )
}
