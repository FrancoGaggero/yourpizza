import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { playCrackle, playWhoosh } from '../audio/sfx'
import { useGame } from '../game/gameStore'
import { BakedPizza } from './BakedPizza'
import { brickTexture } from './textures'

/** Timeline of the bake, in seconds since the oven phase started. */
const T = { slideIn: 1.2, inside: 1.6, bakeEnd: 3.4, out: 4.5, verdict: 4.8 }
const OVEN_Z = -4.6
const MOUTH = new THREE.Vector3(0, 0.25, -1.9)
const INSIDE = new THREE.Vector3(0, 0.25, -4.4)
const SERVED = new THREE.Vector3(0, 0, 0.3)
const VERDICT_SPOT = new THREE.Vector3()

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function Oven({ glow }: { glow: React.RefObject<number> }) {
  const bricks = useMemo(() => {
    const t = brickTexture().clone()
    t.repeat.set(6, 3)
    t.needsUpdate = true
    return t
  }, [])
  const fire = useRef<THREE.MeshBasicMaterial>(null)
  const light = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const flicker = 0.85 + Math.sin(clock.elapsedTime * 13) * 0.08 + Math.sin(clock.elapsedTime * 31) * 0.05
    const g = glow.current ?? 0
    if (fire.current) fire.current.color.setRGB(0.35 + g * 0.65, 0.12 + g * 0.35, 0.02).multiplyScalar(flicker)
    if (light.current) light.current.intensity = (6 + g * 40) * flicker
  })

  return (
    <group position={[0, 0, OVEN_Z]}>
      {/* Brick dome with an arched mouth facing the camera. */}
      <mesh castShadow receiveShadow scale={[1, 0.82, 1]}>
        <sphereGeometry args={[3.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial map={bricks} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 3.22]}>
        <circleGeometry args={[1.55, 32, 0, Math.PI]} />
        <meshBasicMaterial ref={fire} color="#5a1c06" />
      </mesh>
      <mesh position={[0, 0.02, 3.23]}>
        <ringGeometry args={[1.55, 1.85, 32, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#3a2018" roughness={0.9} />
      </mesh>
      <pointLight ref={light} position={[0, 0.8, 3.4]} color="#ff8a3d" distance={12} intensity={6} />
    </group>
  )
}

/** Steam puffs rising from the fresh pizza. */
function Steam({ visible }: { visible: boolean }) {
  const group = useRef<THREE.Group>(null)
  const puffs = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: (Math.random() - 0.5) * 4, z: (Math.random() - 0.5) * 4, offset: i / 14 })), [])
  useFrame(({ clock }) => {
    group.current?.children.forEach((child, i) => {
      const p = puffs[i]
      const t = (clock.elapsedTime * 0.35 + p.offset) % 1
      child.position.set(p.x + Math.sin(t * 6 + i) * 0.25, 1.4 + t * 3.5, p.z)
      child.scale.setScalar(0.15 + t * 0.55)
      ;((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.16
    })
  })
  return (
    <group ref={group} visible={visible}>
      {puffs.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/** The bake: slide into the oven, glow and crackle, come back out golden, then hand off to the verdict. */
export function OvenStage() {
  const snapshot = useGame((s) => s.snapshot)
  const pizza = useRef<THREE.Group>(null)
  const glow = useRef(0)
  const [baked, setBaked] = useState(false)
  const cues = useRef({ whoosh: false, crackle: false, verdict: false })
  // On wide screens the review card sits on the right, so the served pizza slides left.
  const wide = useThree((s) => s.size.width / s.size.height > 1.1)

  useFrame(({ clock }, dt) => {
    const g = pizza.current
    const { phase, phaseStartedAt, setPhase } = useGame.getState()
    if (!g) return
    if (phase === 'verdict') {
      g.position.lerp(VERDICT_SPOT.set(wide ? -2.6 : 0, 0, wide ? 0.6 : -0.6), 1 - Math.exp(-dt * 3))
      g.scale.setScalar(1)
      g.rotation.y = clock.elapsedTime * 0.25
      return
    }
    const t = (performance.now() - phaseStartedAt) / 1000
    const c = cues.current
    if (!c.whoosh) {
      c.whoosh = true
      playWhoosh()
    }
    if (t < T.slideIn) {
      const k = ease(clamp01(t / T.slideIn))
      g.position.lerpVectors(SERVED, MOUTH, k)
      g.scale.setScalar(THREE.MathUtils.lerp(1, 0.42, k))
    } else if (t < T.inside) {
      g.position.lerpVectors(MOUTH, INSIDE, ease(clamp01((t - T.slideIn) / (T.inside - T.slideIn))))
    } else if (t < T.bakeEnd) {
      if (!c.crackle) {
        c.crackle = true
        playCrackle(T.bakeEnd - T.inside)
      }
      glow.current = Math.sin(clamp01((t - T.inside) / (T.bakeEnd - T.inside)) * Math.PI)
    } else if (t < T.out) {
      if (!baked) setBaked(true)
      glow.current = 0
      const k = ease(clamp01((t - T.bakeEnd) / (T.out - T.bakeEnd)))
      g.position.lerpVectors(INSIDE, SERVED, k)
      g.scale.setScalar(THREE.MathUtils.lerp(0.42, 1, k))
    } else if (t > T.verdict && !c.verdict) {
      c.verdict = true
      setPhase('verdict')
    }
  })

  if (!snapshot) return null
  return (
    <>
      <Oven glow={glow} />
      <group ref={pizza}>
        <BakedPizza snapshot={snapshot} baked={baked} />
        <Steam visible={baked} />
      </group>
    </>
  )
}
