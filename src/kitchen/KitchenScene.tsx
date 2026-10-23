import { useFrame, useThree } from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { playHit, unlockAudio } from '../audio/sfx'
import { SPIN_SPEEDS, useGame, type Piece } from '../game/gameStore'
import { INGREDIENTS, type IngredientDef } from '../game/ingredients'
import { beginDrag, bodies, drag, pointToPlane, setView, turntable } from './drag'
import { IngredientMesh } from './IngredientMesh'
import { COUNTER } from './KitchenSet'
import { PizzaBase } from './PizzaBase'

const RIM_SEGMENTS = 28
const MAX_THROW_SPEED = 22

function ShapeCollider({ def }: { def: IngredientDef }) {
  const material = { density: def.density, restitution: def.restitution, friction: def.friction }
  const c = def.collider
  if (c.kind === 'ball') return <BallCollider args={[c.radius]} {...material} />
  if (c.kind === 'cuboid') return <CuboidCollider args={c.half} {...material} />
  return <CylinderCollider args={[c.halfHeight, c.radius]} {...material} />
}

function Ingredient({ piece }: { piece: Piece }) {
  const def = INGREDIENTS[piece.type]
  const ref = useRef<RapierRigidBody>(null)
  // A little random tilt so piles don't look stamped.
  const rotation = useMemo<[number, number, number]>(() => [(Math.random() - 0.5) * 0.6, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.6], [])

  useEffect(() => {
    const body = ref.current
    if (body) bodies.set(piece.id, body)
    return () => void bodies.delete(piece.id)
  }, [piece.id])

  return (
    <RigidBody
      ref={ref}
      position={piece.position}
      rotation={rotation}
      colliders={false}
      ccd
      linearDamping={def.linearDamping}
      angularDamping={def.angularDamping}
      onCollisionEnter={() => {
        const lv = ref.current?.linvel()
        if (!lv) return
        const speed = Math.hypot(lv.x, lv.y, lv.z)
        if (speed > 2) playHit(def.sound, speed)
      }}
    >
      <ShapeCollider def={def} />
      <group
        onPointerDown={(e) => {
          e.stopPropagation()
          unlockAudio()
          beginDrag(piece.id, e.nativeEvent.clientX, e.nativeEvent.clientY, false)
        }}
      >
        <IngredientMesh type={piece.type} variant={piece.variant} />
      </group>
    </RigidBody>
  )
}

/** The pizza on a kinematic turntable: ingredients ride along by friction and fly off when it speeds up. */
function Turntable() {
  const ref = useRef<RapierRigidBody>(null)
  const q = useMemo(() => new THREE.Quaternion(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useFrame((_, dt) => {
    turntable.angle += SPIN_SPEEDS[useGame.getState().spin] * Math.min(dt, 0.05)
    ref.current?.setNextKinematicRotation(q.setFromAxisAngle(up, turntable.angle))
  })

  const rim = useMemo(
    () =>
      Array.from({ length: RIM_SEGMENTS }, (_, i) => {
        const a = (i / RIM_SEGMENTS) * Math.PI * 2
        return { position: [Math.cos(a) * 2.92, 0.36, Math.sin(a) * 2.92] as [number, number, number], rotation: [0, -a, 0] as [number, number, number] }
      }),
    [],
  )

  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders={false} rotation={[0, turntable.angle, 0]}>
      <CylinderCollider args={[0.04, 3.4]} position={[0, 0.04, 0]} friction={0.9} />
      <CylinderCollider args={[0.135, 3]} position={[0, 0.135, 0]} friction={1.4} />
      {rim.map((r, i) => (
        <CuboidCollider key={i} args={[0.1, 0.1, 0.34]} position={r.position} rotation={r.rotation} friction={1} />
      ))}
      <PizzaBase />
    </RigidBody>
  )
}

/** Pulls the grabbed ingredient toward the pointer by velocity, so letting go throws it naturally. */
function DragController() {
  const camera = useThree((s) => s.camera)
  const dom = useThree((s) => s.gl.domElement)
  const frame = useRef(0)

  useEffect(() => setView(camera, dom), [camera, dom])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (drag.id === null) return
      pointToPlane(e.clientX, e.clientY, drag.target)
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) drag.moved = true
    }
    const up = () => {
      if (drag.id === null) return
      const body = bodies.get(drag.id)
      const quickTap = drag.fromTray && !drag.moved && performance.now() - drag.startT < 300
      if (body && quickTap) {
        // A tap on the tray drops the ingredient onto a random spot of the pizza.
        const a = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * 2.2
        body.setTranslation({ x: Math.cos(a) * r, y: 3.2, z: Math.sin(a) * r }, true)
        body.setLinvel({ x: 0, y: -1, z: 0 }, true)
      } else if (body) {
        const lv = body.linvel()
        const speed = Math.hypot(lv.x, lv.y, lv.z)
        if (speed > MAX_THROW_SPEED) {
          const k = MAX_THROW_SPEED / speed
          body.setLinvel({ x: lv.x * k, y: lv.y * k, z: lv.z * k }, true)
        }
      }
      drag.id = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    if (drag.id !== null) {
      const body = bodies.get(drag.id)
      if (body) {
        const p = body.translation()
        v.set(drag.target.x - p.x, drag.target.y - p.y, drag.target.z - p.z).multiplyScalar(16)
        if (v.length() > 28) v.setLength(28)
        body.setLinvel(v, true)
        const av = body.angvel()
        body.setAngvel({ x: av.x * 0.85, y: av.y * 0.85, z: av.z * 0.85 }, true)
      }
    }
    // Every few frames, clear ingredients that fell off the counter.
    if (++frame.current % 15) return
    for (const [id, body] of bodies) if (body.translation().y < -5) useGame.getState().removePiece(id, true)
  })

  return null
}

export function KitchenScene() {
  const pieces = useGame((s) => s.pieces)
  return (
    <Physics gravity={[0, -15, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[COUNTER.halfX, 0.5, COUNTER.halfZ]} position={[0, -0.5, 0]} friction={0.9} />
        <CuboidCollider args={[COUNTER.halfX, 5, 0.2]} position={[0, 4, -COUNTER.halfZ - 0.2]} />
      </RigidBody>
      <Turntable />
      {pieces.map((p) => (
        <Ingredient key={p.id} piece={p} />
      ))}
      <DragController />
    </Physics>
  )
}
