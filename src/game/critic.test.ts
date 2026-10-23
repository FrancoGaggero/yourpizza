import { describe, expect, it } from 'vitest'
import { analyze, reviewPizza, scorePizza } from './critic'
import type { IngredientId } from './ingredients'
import { OBSERVATIONS } from './phrases'
import { PIZZA_TOP, type PizzaSnapshot, type SnapItem } from './snapshot'

const item = (t: IngredientId, x: number, z: number, y = PIZZA_TOP + 0.05): SnapItem => ({ t, v: 0, p: [x, y, z], q: [0, 0, 0, 1] })

/** A ring of toppings spread evenly over the sauce. */
function spread(types: IngredientId[], n: number, radius = 1.6): SnapItem[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const r = i % 2 ? radius : radius * 0.45
    return item(types[i % types.length], Math.cos(a) * r, Math.sin(a) * r)
  })
}

const snap = (items: SnapItem[], thrown = items.length, missed = 0): PizzaSnapshot => ({ items, thrown, missed })

describe('analyze', () => {
  it('measures coverage, balance and variety', () => {
    const s = analyze(snap(spread(['muzza', 'pepperoni', 'aceituna'], 30)))
    expect(s.count).toBe(30)
    expect(s.variety).toBe(3)
    expect(s.coverage).toBeGreaterThan(0.2)
    expect(s.offCenter).toBeLessThan(0.1)
  })

  it('detects towers and lopsided pizzas', () => {
    expect(analyze(snap([item('muzza', 0, 0, 2)])).height).toBeGreaterThan(1.2)
    expect(analyze(snap([item('muzza', 2, 0), item('muzza', 2.2, 0.3)])).offCenter).toBeGreaterThan(0.7)
  })
})

describe('reviewPizza', () => {
  it('is deterministic for the same snapshot and seed', () => {
    const s = snap(spread(['muzza', 'tomate', 'albahaca'], 18))
    expect(reviewPizza(s, 42)).toEqual(reviewPizza(s, 42))
  })

  it('roasts an empty pizza', () => {
    const r = reviewPizza(snap([]), 1)
    expect(r.score).toBe(0)
    expect(r.band).toBe('bad')
    expect(OBSERVATIONS.empty).toContain(r.lines[0])
  })

  it('complains about a pizza without cheese', () => {
    const r = reviewPizza(snap(spread(['pepperoni', 'aceituna'], 12)), 7)
    expect(r.lines.some((l) => OBSERVATIONS.noCheese.includes(l))).toBe(true)
  })

  it('rewards a well spread, varied pizza over a messy one', () => {
    const good = scorePizza(analyze(snap(spread(['muzza', 'pepperoni', 'champinon', 'albahaca'], 36))))
    const messy = scorePizza(analyze(snap([item('muzza', 2.3, 0), item('aceituna', 2.4, 0.2), item('aceituna', 2.2, -0.2)], 20, 17)))
    expect(good).toBeGreaterThanOrEqual(6)
    expect(messy).toBeLessThan(3)
  })

  it('names the pizza after its dominant ingredient', () => {
    const r = reviewPizza(snap(spread(['aceituna'], 12)), 3)
    expect(r.name).toMatch(/Aceitunera|Olivareña/)
  })

  it('always says at least two things about a pizza with toppings', () => {
    expect(reviewPizza(snap(spread(['muzza', 'pepperoni', 'aceituna'], 12)), 5).lines.length).toBeGreaterThanOrEqual(2)
  })

  it('never exceeds three remarks', () => {
    const chaos = snap([...spread(['aceituna'], 14), item('muzza', 0, 0, 2.5)], 60, 40)
    expect(reviewPizza(chaos, 9).lines.length).toBeLessThanOrEqual(3)
  })
})
