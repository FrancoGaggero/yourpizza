import type { Mood } from '../game/critic'
import { C } from './theme'

const SKIN: Record<Mood, string> = { delighted: '#f4c49c', pleased: '#f4c49c', skeptical: '#f1bd94', furious: '#ef8a6c' }

/** Chef Pepino, an original character. His face follows the review's mood. */
export function Chef({ mood, size }: { mood: Mood; size: number }) {
  const ink = '#3a2216'
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 200 220" style={{ display: 'block', overflow: 'visible' }}>
      {/* Toque */}
      <g fill="#fffdf7" stroke={ink} strokeWidth={4}>
        <circle cx={62} cy={48} r={26} />
        <circle cx={100} cy={32} r={32} />
        <circle cx={138} cy={48} r={26} />
        <rect x={58} y={50} width={84} height={34} rx={6} />
      </g>
      <rect x={58} y={70} width={84} height={14} fill="#f1e6d2" stroke={ink} strokeWidth={4} />
      {/* Face */}
      <circle cx={46} cy={138} r={11} fill={SKIN[mood]} stroke={ink} strokeWidth={4} />
      <circle cx={154} cy={138} r={11} fill={SKIN[mood]} stroke={ink} strokeWidth={4} />
      <circle cx={100} cy={136} r={54} fill={SKIN[mood]} stroke={ink} strokeWidth={4} />
      <circle cx={70} cy={150} r={10} fill="#f08a8a" opacity={mood === 'furious' ? 0.9 : 0.45} />
      <circle cx={130} cy={150} r={10} fill="#f08a8a" opacity={mood === 'furious' ? 0.9 : 0.45} />
      {/* Eyes */}
      {mood === 'delighted' ? (
        <g fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round">
          <path d="M70 124 Q80 114 90 124" />
          <path d="M110 124 Q120 114 130 124" />
        </g>
      ) : (
        <g fill={ink}>
          <circle cx={80} cy={124} r={mood === 'furious' ? 5 : 6.5} />
          <circle cx={120} cy={124} r={mood === 'furious' ? 5 : 6.5} />
        </g>
      )}
      {/* Eyebrows */}
      <g stroke={ink} strokeWidth={6} strokeLinecap="round">
        {mood === 'furious' && (
          <>
            <path d="M66 104 L92 114" />
            <path d="M134 104 L108 114" />
          </>
        )}
        {mood === 'skeptical' && (
          <>
            <path d="M68 108 L92 108" />
            <path d="M108 102 Q120 94 132 100" />
          </>
        )}
        {(mood === 'pleased' || mood === 'delighted') && (
          <>
            <path d="M68 106 Q80 98 92 104" />
            <path d="M108 104 Q120 98 132 106" />
          </>
        )}
      </g>
      {/* Nose */}
      <ellipse cx={100} cy={142} rx={11} ry={9} fill="#e9a07c" stroke={ink} strokeWidth={3} />
      {/* Mouth, under the mustache */}
      {mood === 'delighted' && <path d="M78 164 Q100 196 122 164 Z" fill={C.tomatoDark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />}
      {mood === 'pleased' && <path d="M82 168 Q100 182 118 168" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />}
      {mood === 'skeptical' && <path d="M84 172 Q92 168 100 172 T116 170" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />}
      {mood === 'furious' && <path d="M80 182 Q100 160 120 182 Z" fill={C.tomatoDark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />}
      {/* Mustache */}
      <path
        d="M100 152 C88 146 74 148 66 158 C60 166 50 164 48 156 C52 172 72 174 84 164 C92 158 98 158 100 160 C102 158 108 158 116 164 C128 174 148 172 152 156 C150 164 140 166 134 158 C126 148 112 146 100 152 Z"
        fill="#4a2a18"
      />
    </svg>
  )
}
