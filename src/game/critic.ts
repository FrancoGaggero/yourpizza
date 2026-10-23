import { INGREDIENT_IDS, INGREDIENTS, type IngredientId } from './ingredients'
import {
  HEADLINES,
  NAME_ADJECTIVE,
  NAME_NOUN,
  OBSERVATIONS,
  VERDICT_LABEL,
  type ObservationId,
} from './phrases'
import { hashString, mulberry32, pick } from './rng'
import { PIZZA_TOP, type PizzaSnapshot } from './snapshot'

export type Mood = 'delighted' | 'pleased' | 'skeptical' | 'furious'
export type Band = keyof typeof HEADLINES

export interface PizzaStats {
  count: number
  byType: Record<IngredientId, number>
  /** Share of the sauce area covered by something, 0..1. */
  coverage: number
  /** Distance of the toppings' center of mass from the middle, 0 (centered) .. 1 (at the crust). */
  offCenter: number
  /** Highest point above the dough. */
  height: number
  variety: number
  missedRatio: number
}

export interface Review {
  name: string
  score: number
  stars: number
  band: Band
  verdict: string
  mood: Mood
  headline: string
  lines: string[]
  stats: PizzaStats
}

const SAUCE_RADIUS = 2.7
const GRID = 24

export function analyze(snapshot: PizzaSnapshot): PizzaStats {
  const { items } = snapshot
  const byType = Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0])) as Record<IngredientId, number>
  for (const it of items) byType[it.t]++

  // Coverage: sample a grid over the sauce and check whether any topping sits over each point.
  let inside = 0
  let covered = 0
  for (let i = 0; i < GRID; i++)
    for (let j = 0; j < GRID; j++) {
      const x = ((i + 0.5) / GRID) * 2 * SAUCE_RADIUS - SAUCE_RADIUS
      const z = ((j + 0.5) / GRID) * 2 * SAUCE_RADIUS - SAUCE_RADIUS
      if (x * x + z * z > SAUCE_RADIUS * SAUCE_RADIUS) continue
      inside++
      if (items.some((it) => (it.p[0] - x) ** 2 + (it.p[2] - z) ** 2 <= (INGREDIENTS[it.t].footprint * 1.05) ** 2)) covered++
    }

  const cx = items.reduce((s, it) => s + it.p[0], 0) / (items.length || 1)
  const cz = items.reduce((s, it) => s + it.p[2], 0) / (items.length || 1)

  return {
    count: items.length,
    byType,
    coverage: inside ? covered / inside : 0,
    offCenter: Math.min(1, Math.hypot(cx, cz) / SAUCE_RADIUS),
    height: Math.max(0, ...items.map((it) => it.p[1] - PIZZA_TOP)),
    variety: INGREDIENT_IDS.filter((id) => byType[id] > 0).length,
    missedRatio: snapshot.thrown ? snapshot.missed / snapshot.thrown : 0,
  }
}

export function scorePizza(s: PizzaStats) {
  if (s.count < 3) return s.count * 0.5
  let score = 3.5
  score += 3 * Math.min(1, Math.max(0, (s.coverage - 0.1) / 0.5)) // well covered
  if (s.coverage > 0.95) score -= 0.8 // smothered
  score += Math.min(s.variety, 4) * 0.55
  score += s.byType.muzza > 0 ? 0.8 : -1.5
  if (s.offCenter > 0.3) score -= 2 * s.offCenter
  score -= 2.5 * s.missedRatio
  if (s.height > 1.2) score += 0.4 // the chef secretly enjoys a tower
  return Math.max(0, Math.min(10, Math.round(score * 2) / 2))
}

/** Which remarks apply, most important first. */
function observe(s: PizzaStats): ObservationId[] {
  const out: ObservationId[] = []
  const t = s.byType
  if (s.count === 0) return ['empty']
  if (s.count < 4) out.push('tiny')
  if (s.height > 1.2) out.push('tower')
  if (s.missedRatio > 0.4) out.push('manyMissed')
  if (s.byType.muzza === 0) out.push('noCheese')
  if (t.muzza >= 12) out.push('cheeseFlood')
  if (t.aceituna >= 10) out.push('olives')
  if (t.pepperoni >= 10) out.push('pepperoni')
  if (t.albahaca >= 8) out.push('basil')
  if (t.champinon >= 8) out.push('mushrooms')
  if (t.tomate >= 8) out.push('tomatoes')
  if (t.morron >= 8) out.push('peppers')
  if (s.offCenter > 0.35 && s.count >= 4) out.push('lopsided')
  if (s.variety === 1 && s.count >= 5) out.push('monotone')
  if (s.variety >= 7) out.push('allIn')
  if (s.coverage < 0.2 && s.count >= 4) out.push('sparse')
  if (s.coverage > 0.9) out.push('packed')
  if (s.missedRatio > 0.15 && s.missedRatio <= 0.4) out.push('someMissed')
  if (s.coverage >= 0.45 && s.coverage <= 0.9 && s.offCenter < 0.2 && s.variety >= 3) out.push('balanced')
  return out
}

function bandOf(score: number): Band {
  if (score >= 9) return 'masterpiece'
  if (score >= 6) return 'good'
  if (score >= 3.5) return 'meh'
  return 'bad'
}

function nameOf(s: PizzaStats, score: number, rand: () => number) {
  const dominant = INGREDIENT_IDS.reduce<IngredientId | 'none'>(
    (best, id) => (s.byType[id] > (best === 'none' ? 0 : s.byType[best]) ? id : best),
    'none',
  )
  const adjective =
    s.height > 1.2
      ? NAME_ADJECTIVE.tower
      : s.missedRatio > 0.4
        ? NAME_ADJECTIVE.fugitive
        : s.offCenter > 0.35 && s.count >= 4
          ? NAME_ADJECTIVE.lopsided
          : score >= 8.5
            ? NAME_ADJECTIVE.supreme
            : score < 3 && s.count > 0
              ? NAME_ADJECTIVE.tragic
              : s.variety >= 6
                ? NAME_ADJECTIVE.complete
                : NAME_ADJECTIVE.plain
  return `La ${pick(rand, NAME_NOUN[dominant])} ${pick(rand, adjective)}`
}

/** Same snapshot + seed → same review, so a shared link shows what its maker saw. */
export function reviewPizza(snapshot: PizzaSnapshot, seed: number): Review {
  const stats = analyze(snapshot)
  const rand = mulberry32(seed ^ hashString(JSON.stringify(snapshot.items.map((i) => [i.t, i.p]))))
  const score = scorePizza(stats)
  const band = bandOf(score)
  const remarks = observe(stats).slice(0, 3)
  // Always say at least two things about a real pizza, so the card never looks empty.
  if (stats.count > 0 && remarks.length < 2) remarks.push(stats.coverage < 0.35 ? 'fillerLow' : stats.coverage < 0.7 ? 'fillerMid' : 'fillerHigh')
  if (stats.count > 0 && remarks.length < 2) remarks.push('fillerAny')
  return {
    name: nameOf(stats, score, rand),
    score,
    stars: Math.round(score) / 2,
    band,
    verdict: VERDICT_LABEL[band],
    mood: band === 'masterpiece' ? 'delighted' : band === 'good' ? 'pleased' : band === 'meh' ? 'skeptical' : 'furious',
    headline: pick(rand, HEADLINES[band]),
    lines: remarks.map((id) => pick(rand, OBSERVATIONS[id])),
    stats,
  }
}
