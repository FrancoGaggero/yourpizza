import { create } from 'zustand'
import { reviewPizza, type Review } from './critic'
import type { IngredientId } from './ingredients'
import type { PizzaSnapshot } from './snapshot'

export type Phase = 'intro' | 'menu' | 'kitchen' | 'oven' | 'verdict'

/** Turntable speeds in rad/s: still, slow, fast, chaos. */
export const SPIN_SPEEDS = [0, 0.45, 1.3, 4.2] as const
export const SPIN_LABELS = ['quieta', 'lenta', 'rápida', 'CAOS'] as const
export type SpinLevel = 0 | 1 | 2 | 3

export interface Piece {
  id: number
  type: IngredientId
  variant: number
  position: [number, number, number]
}

export const MAX_PIECES = 160

interface GameStore {
  phase: Phase
  pieces: Piece[]
  /** Ingredients thrown this round. */
  thrown: number
  /** Ingredients that fell off the counter and were cleared. */
  lost: number
  spin: SpinLevel
  snapshot: PizzaSnapshot | null
  review: Review | null
  /** When the current phase started (performance.now()), for scripted animations. */
  phaseStartedAt: number
  setPhase(phase: Phase): void
  startSandbox(): void
  spawn(type: IngredientId, position: [number, number, number]): number
  removePiece(id: number, lost: boolean): void
  setSpin(spin: SpinLevel): void
  clearKitchen(): void
  bake(snapshot: PizzaSnapshot): void
}

let nextId = 1

export const useGame = create<GameStore>((set, get) => ({
  phase: 'intro',
  pieces: [],
  thrown: 0,
  lost: 0,
  spin: 1,
  snapshot: null,
  review: null,
  phaseStartedAt: 0,

  setPhase: (phase) => set({ phase, phaseStartedAt: performance.now() }),

  startSandbox() {
    get().clearKitchen()
    get().setPhase('kitchen')
  },

  spawn(type, position) {
    const id = nextId++
    const piece = { id, type, variant: id % 3, position }
    set({ pieces: [...get().pieces, piece], thrown: get().thrown + 1 })
    return id
  },

  removePiece(id, lost) {
    if (!get().pieces.some((p) => p.id === id)) return
    set({ pieces: get().pieces.filter((p) => p.id !== id), lost: get().lost + (lost ? 1 : 0) })
  },

  setSpin: (spin) => set({ spin }),

  clearKitchen: () => set({ pieces: [], thrown: 0, lost: 0, snapshot: null, review: null }),

  bake(snapshot) {
    set({ snapshot, review: reviewPizza(snapshot, Math.floor(Math.random() * 2 ** 31)), pieces: [] })
    get().setPhase('oven')
  },
}))
