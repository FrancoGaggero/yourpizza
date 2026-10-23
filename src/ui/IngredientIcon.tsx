import type { IngredientId } from '../game/ingredients'

const INK = '#3a2216'

/** Flat icons for the tray, drawn to match the 3D models' colors. */
export function IngredientIcon({ type, size = 44 }: { type: IngredientId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
        {type === 'muzza' && <path d="M8 26c-2-7 4-13 11-12 3-4 11-4 14 1 6 1 7 9 2 12-2 4-9 6-14 4-6 2-12 0-13-5z" fill="#fff1cf" />}
        {type === 'pepperoni' && (
          <>
            <circle cx={22} cy={22} r={15} fill="#c0392b" />
            <g stroke="none" fill="#f6b8a6">
              <circle cx={16} cy={18} r={2.4} />
              <circle cx={26} cy={15} r={1.8} />
              <circle cx={27} cy={27} r={2.6} />
              <circle cx={17} cy={28} r={1.6} />
            </g>
          </>
        )}
        {type === 'aceituna' && (
          <>
            <ellipse cx={22} cy={22} rx={13} ry={11} fill="#3a2a3d" />
            <ellipse cx={22} cy={22} rx={5} ry={4} fill="#d9c7a8" />
          </>
        )}
        {type === 'champinon' && (
          <>
            <path d="M8 22c0-8 7-13 14-13s14 5 14 13z" fill="#d8c1a0" />
            <path d="M17 22h10l-1 12h-8z" fill="#efe3cf" />
          </>
        )}
        {type === 'albahaca' && (
          <>
            <path d="M7 30C10 14 24 7 37 9 35 23 23 34 7 30z" fill="#3f9b4a" />
            <path d="M9 29L33 12" fill="none" strokeWidth={1.8} />
          </>
        )}
        {type === 'tomate' && (
          <>
            <circle cx={22} cy={22} r={15} fill="#e5463a" />
            <circle cx={22} cy={22} r={10} fill="#f0705e" strokeWidth={0} />
            <g stroke="none" fill="#f3e3a2">
              <circle cx={17} cy={20} r={1.8} />
              <circle cx={26} cy={18} r={1.8} />
              <circle cx={24} cy={27} r={1.8} />
            </g>
          </>
        )}
        {type === 'morron' && (
          <>
            <circle cx={22} cy={22} r={12} fill="none" strokeWidth={11} />
            <circle cx={22} cy={22} r={12} fill="none" stroke="#3c9a3a" strokeWidth={6} />
          </>
        )}
      </g>
    </svg>
  )
}
