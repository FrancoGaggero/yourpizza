import { useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { tileTexture, woodTexture } from './textures'

export const COUNTER = { halfX: 10, halfZ: 6.5 }

/** Counter, tiled wall and warm lights: the room both the kitchen and the oven scenes live in. */
export function KitchenSet() {
  const wood = useMemo(() => {
    const t = woodTexture().clone()
    t.repeat.set(3, 2)
    t.needsUpdate = true
    return t
  }, [])
  const tiles = useMemo(() => {
    const t = tileTexture().clone()
    t.repeat.set(10, 5)
    t.needsUpdate = true
    return t
  }, [])

  return (
    <>
      <color attach="background" args={['#2a1a12']} />
      <fog attach="fog" args={['#2a1a12', 22, 40]} />
      <hemisphereLight args={['#ffe6c4', '#5a3320', 1.5]} />
      <directionalLight
        position={[5, 13, 7]}
        intensity={2.2}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 7, 1]} intensity={40} distance={18} color="#ffc98a" />

      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[COUNTER.halfX * 2, 1, COUNTER.halfZ * 2]} />
        <meshStandardMaterial map={wood} roughness={0.75} />
      </mesh>
      <mesh position={[0, 4, -COUNTER.halfZ]} receiveShadow>
        <planeGeometry args={[COUNTER.halfX * 2, 10]} />
        <meshStandardMaterial map={tiles} roughness={0.5} />
      </mesh>
    </>
  )
}

/** Keeps the whole pizza in frame on narrow (portrait) screens by widening the field of view. */
export function CameraFit() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)
  useLayoutEffect(() => {
    const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0.8))
    const halfWidth = 4.6
    const needed = THREE.MathUtils.radToDeg(2 * Math.atan(halfWidth / distance / aspect))
    camera.fov = THREE.MathUtils.clamp(Math.max(38, needed), 38, 78)
    camera.lookAt(0, 0, 0.8)
    camera.updateProjectionMatrix()
  }, [camera, aspect])
  return null
}
