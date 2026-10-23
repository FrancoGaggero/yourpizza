import type { IngredientId } from './ingredients'

/** One ingredient frozen on the pizza, in the pizza's own (non-rotating) frame. */
export interface SnapItem {
  t: IngredientId
  /** Look variant, e.g. which color a pepper ring is. */
  v: number
  p: [number, number, number]
  q: [number, number, number, number]
}

/** The pizza at the moment it goes into the oven: the single source for review, bake and (later) the commercial. */
export interface PizzaSnapshot {
  items: SnapItem[]
  /** Everything thrown during the session. */
  thrown: number
  /** Thrown ingredients that did not end up on the pizza. */
  missed: number
}

/** Top surface of the dough; ingredients rest above it. */
export const PIZZA_TOP = 0.27
/** Radius inside which an ingredient counts as on the pizza. */
export const PIZZA_RADIUS = 3.05
