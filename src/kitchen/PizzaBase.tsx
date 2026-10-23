import { useMemo } from 'react'
import * as THREE from 'three'

/** Metal tray, dough, sauce and crust. The dough's top sits at y = 0.27 (PIZZA_TOP). */
export function PizzaBase({ baked = false }: { baked?: boolean }) {
  const m = useMemo(
    () => ({
      plate: new THREE.MeshStandardMaterial({ color: '#b9b6ae', metalness: 0.65, roughness: 0.35 }),
      dough: new THREE.MeshStandardMaterial({ color: baked ? '#d9974a' : '#f0c27a', roughness: 0.9 }),
      sauce: new THREE.MeshStandardMaterial({ color: baked ? '#a6291a' : '#c8321f', roughness: 0.45 }),
      crust: new THREE.MeshStandardMaterial({ color: baked ? '#c27a34' : '#efc27c', roughness: 0.85 }),
    }),
    [baked],
  )
  return (
    <group>
      <mesh material={m.plate} position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[3.4, 3.4, 0.08, 64]} />
      </mesh>
      <mesh material={m.dough} position={[0, 0.175, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3, 3, 0.19, 64]} />
      </mesh>
      <mesh material={m.sauce} position={[0, 0.272, 0]} receiveShadow>
        <cylinderGeometry args={[2.72, 2.72, 0.01, 64]} />
      </mesh>
      <mesh material={m.crust} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[2.88, 0.2, 14, 72]} />
      </mesh>
    </group>
  )
}
