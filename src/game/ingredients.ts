export const INGREDIENT_IDS = ['muzza', 'pepperoni', 'aceituna', 'champinon', 'albahaca', 'tomate', 'morron'] as const

export type IngredientId = (typeof INGREDIENT_IDS)[number]

export type ColliderShape =
  | { kind: 'cylinder'; halfHeight: number; radius: number }
  | { kind: 'ball'; radius: number }
  | { kind: 'cuboid'; half: [number, number, number] }

export type SoundKind = 'splat' | 'boing' | 'tick'

export interface IngredientDef {
  id: IngredientId
  name: string
  plural: string
  /** Main color, used for UI swatches. */
  color: string
  collider: ColliderShape
  density: number
  restitution: number
  friction: number
  linearDamping: number
  angularDamping: number
  /** Footprint radius on the pizza, used to measure coverage. */
  footprint: number
  sound: SoundKind
}

/** Physics are tuned per ingredient: olives roll, basil flutters, pepper rings bounce. */
export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  muzza: {
    id: 'muzza',
    name: 'muzzarella',
    plural: 'muzzarella',
    color: '#fff1cf',
    collider: { kind: 'cylinder', halfHeight: 0.07, radius: 0.42 },
    density: 1,
    restitution: 0.05,
    friction: 1.3,
    linearDamping: 0.4,
    angularDamping: 0.8,
    footprint: 0.45,
    sound: 'splat',
  },
  pepperoni: {
    id: 'pepperoni',
    name: 'pepperoni',
    plural: 'pepperonis',
    color: '#c0392b',
    collider: { kind: 'cylinder', halfHeight: 0.04, radius: 0.32 },
    density: 1.2,
    restitution: 0.15,
    friction: 0.9,
    linearDamping: 0.2,
    angularDamping: 0.4,
    footprint: 0.32,
    sound: 'splat',
  },
  aceituna: {
    id: 'aceituna',
    name: 'aceituna',
    plural: 'aceitunas',
    color: '#3a2a3d',
    collider: { kind: 'ball', radius: 0.17 },
    density: 1.4,
    restitution: 0.45,
    friction: 0.4,
    linearDamping: 0.1,
    angularDamping: 0.15,
    footprint: 0.17,
    sound: 'tick',
  },
  champinon: {
    id: 'champinon',
    name: 'champiñón',
    plural: 'champiñones',
    color: '#d8c1a0',
    collider: { kind: 'cylinder', halfHeight: 0.12, radius: 0.26 },
    density: 0.8,
    restitution: 0.25,
    friction: 0.8,
    linearDamping: 0.2,
    angularDamping: 0.5,
    footprint: 0.26,
    sound: 'tick',
  },
  albahaca: {
    id: 'albahaca',
    name: 'albahaca',
    plural: 'hojas de albahaca',
    color: '#3f9b4a',
    collider: { kind: 'cuboid', half: [0.31, 0.015, 0.18] },
    density: 0.3,
    restitution: 0.05,
    friction: 1,
    linearDamping: 2.6,
    angularDamping: 2,
    footprint: 0.28,
    sound: 'tick',
  },
  tomate: {
    id: 'tomate',
    name: 'rodaja de tomate',
    plural: 'rodajas de tomate',
    color: '#e5463a',
    collider: { kind: 'cylinder', halfHeight: 0.05, radius: 0.3 },
    density: 1.1,
    restitution: 0.2,
    friction: 0.7,
    linearDamping: 0.2,
    angularDamping: 0.4,
    footprint: 0.3,
    sound: 'splat',
  },
  morron: {
    id: 'morron',
    name: 'aro de morrón',
    plural: 'aros de morrón',
    color: '#3c9a3a',
    collider: { kind: 'cylinder', halfHeight: 0.05, radius: 0.26 },
    density: 0.7,
    restitution: 0.6,
    friction: 0.5,
    linearDamping: 0.15,
    angularDamping: 0.3,
    footprint: 0.26,
    sound: 'boing',
  },
}
