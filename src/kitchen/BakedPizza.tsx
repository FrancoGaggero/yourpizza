import type { PizzaSnapshot } from '../game/snapshot'
import { IngredientMesh } from './IngredientMesh'
import { PizzaBase } from './PizzaBase'

/** A frozen pizza rebuilt from its snapshot: no physics, just meshes in their saved poses. */
export function BakedPizza({ snapshot, baked }: { snapshot: PizzaSnapshot; baked: boolean }) {
  return (
    <group>
      <PizzaBase baked={baked} />
      {snapshot.items.map((it, i) => (
        <group key={i} position={it.p} quaternion={it.q}>
          <IngredientMesh type={it.t} variant={it.v} baked={baked} />
        </group>
      ))}
    </group>
  )
}
