import { Canvas } from '@react-three/fiber'
import { lazy, Suspense } from 'react'
import { useGame } from '../game/gameStore'
import { CameraFit, KitchenSet } from './KitchenSet'
import { OvenStage } from './OvenStage'

// Rapier ships its physics engine as inlined WASM (~2 MB), so it loads in its own chunk while the intro plays.
const KitchenScene = lazy(() => import('./KitchenScene').then((m) => ({ default: m.KitchenScene })))

/** One canvas for the whole game: the physics kitchen, or the oven once the pizza is baking. */
export function Stage() {
  const phase = useGame((s) => s.phase)
  const baking = phase === 'oven' || phase === 'verdict'
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 10.5, 9], fov: 38, near: 0.1, far: 80 }} style={{ touchAction: 'none' }}>
      <CameraFit />
      <KitchenSet />
      {baking ? (
        <OvenStage />
      ) : (
        <Suspense fallback={null}>
          <KitchenScene />
        </Suspense>
      )}
    </Canvas>
  )
}
