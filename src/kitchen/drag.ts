import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import type { Piece } from '../game/gameStore'
import { PIZZA_RADIUS, type PizzaSnapshot, type SnapItem } from '../game/snapshot'
import { COUNTER } from './KitchenSet'

/** Height of the invisible plane a grabbed ingredient slides along. */
export const DRAG_HEIGHT = 2.4

/** Live physics bodies by piece id; the source of truth for where ingredients really are. */
export const bodies = new Map<number, RapierRigidBody>()

/** Current turntable angle, so snapshots can be taken in the pizza's own frame. */
export const turntable = { angle: 0 }

const view = { camera: null as THREE.Camera | null, dom: null as HTMLElement | null }

export function setView(camera: THREE.Camera, dom: HTMLElement) {
  view.camera = camera
  view.dom = dom
}

const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_HEIGHT)

/** Where a screen point lands on the drag plane, clamped over the counter. */
export function pointToPlane(clientX: number, clientY: number, out: THREE.Vector3) {
  if (!view.camera || !view.dom) return false
  const r = view.dom.getBoundingClientRect()
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
  raycaster.setFromCamera(ndc, view.camera)
  if (!raycaster.ray.intersectPlane(dragPlane, out)) return false
  out.x = THREE.MathUtils.clamp(out.x, -COUNTER.halfX + 0.5, COUNTER.halfX - 0.5)
  out.z = THREE.MathUtils.clamp(out.z, -COUNTER.halfZ + 0.5, COUNTER.halfZ - 0.5)
  return true
}

export const drag = {
  id: null as number | null,
  target: new THREE.Vector3(),
  startX: 0,
  startY: 0,
  startT: 0,
  moved: false,
  /** Grabbed straight from the tray: a quick tap drops it onto the pizza instead. */
  fromTray: false,
}

export function beginDrag(id: number, clientX: number, clientY: number, fromTray: boolean) {
  Object.assign(drag, { id, startX: clientX, startY: clientY, startT: performance.now(), moved: false, fromTray })
  pointToPlane(clientX, clientY, drag.target)
}

/**
 * Tray taps waiting to be dropped, with the frames their body has existed. A body that was just
 * created still gets its spawn transform re-applied by Rapier, so the drop waits a couple of frames.
 */
export const pendingDrops = new Map<number, number>()

/** Drops an ingredient from above onto a random spot of the pizza. */
export function dropOnPizza(body: RapierRigidBody) {
  const a = Math.random() * Math.PI * 2
  const r = Math.sqrt(Math.random()) * 2.2
  body.setTranslation({ x: Math.cos(a) * r, y: 3.2, z: Math.sin(a) * r }, true)
  body.setLinvel({ x: 0, y: -1, z: 0 }, true)
}

export function isOnPizza(body: RapierRigidBody) {
  const p = body.translation()
  return Math.hypot(p.x, p.z) <= PIZZA_RADIUS && p.y > 0.2 && p.y < 8
}

export function countOnPizza() {
  let n = 0
  for (const [id, body] of bodies) if (id !== drag.id && isOnPizza(body)) n++
  return n
}

const up = new THREE.Vector3(0, 1, 0)
const v = new THREE.Vector3()
const q = new THREE.Quaternion()
const undo = new THREE.Quaternion()
const r3 = (n: number) => Math.round(n * 1000) / 1000

/** Freezes what is on the pizza, rotated back into the pizza's own frame. */
export function takeSnapshot(pieces: Piece[], thrown: number): PizzaSnapshot {
  undo.setFromAxisAngle(up, -turntable.angle)
  const items: SnapItem[] = []
  for (const piece of pieces) {
    const body = bodies.get(piece.id)
    if (!body || piece.id === drag.id || !isOnPizza(body)) continue
    const t = body.translation()
    const r = body.rotation()
    v.set(t.x, t.y, t.z).applyQuaternion(undo)
    q.set(r.x, r.y, r.z, r.w).premultiply(undo)
    items.push({ t: piece.type, v: piece.variant, p: [r3(v.x), r3(v.y), r3(v.z)], q: [r3(q.x), r3(q.y), r3(q.z), r3(q.w)] })
  }
  return { items, thrown, missed: Math.max(0, thrown - items.length) }
}
