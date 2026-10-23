import { useMemo } from 'react'
import * as THREE from 'three'
import type { IngredientId } from '../game/ingredients'
import { mulberry32 } from '../game/rng'
import { pepperoniTexture, tomatoTexture } from './textures'

/**
 * Procedural toy-like meshes, centered on their physics collider.
 * `baked` switches to the out-of-the-oven look: melted cheese, browned edges.
 */

const geometries = new Map<string, THREE.BufferGeometry>()
const materials = new Map<string, THREE.Material | THREE.Material[]>()

function geo(key: string, build: () => THREE.BufferGeometry) {
  let g = geometries.get(key)
  if (!g) geometries.set(key, (g = build()))
  return g
}

function mat<T extends THREE.Material | THREE.Material[]>(key: string, build: () => T): T {
  let m = materials.get(key)
  if (!m) materials.set(key, (m = build()))
  return m as T
}

const std = (color: string, roughness = 0.65, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, ...extra })

/** A squashed, lumpy sphere: a blob of cheese. */
function cheeseGeometry() {
  const g = new THREE.SphereGeometry(0.42, 22, 12)
  const pos = g.attributes.position
  const rand = mulberry32(7)
  const bumps = Array.from({ length: 6 }, () => [rand() * Math.PI * 2, 0.04 + rand() * 0.06] as const)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const a = Math.atan2(z, x)
    const wobble = 1 + bumps.reduce((s, [phase, amp]) => s + Math.sin(a * 3 + phase) * amp, 0) / 2
    pos.setXYZ(i, x * wobble, pos.getY(i) * 0.36, z * wobble)
  }
  g.computeVertexNormals()
  return g
}

function leafGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.23, 0)
  shape.quadraticCurveTo(-0.05, 0.17, 0.23, 0)
  shape.quadraticCurveTo(-0.05, -0.17, -0.23, 0)
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false })
  g.rotateX(-Math.PI / 2)
  g.scale(1.38, 1, 1.38)
  g.center()
  return g
}

const PEPPER_COLORS = ['#3c9a3a', '#d63a2c', '#f2c12e']
const BASIL_COLORS = ['#3f9b4a', '#347f3c', '#4caf55']

export function IngredientMesh({ type, variant = 0, baked = false }: { type: IngredientId; variant?: number; baked?: boolean }) {
  const b = baked ? 'b' : 'r'
  const mesh = useMemo(() => {
    switch (type) {
      case 'muzza':
        return (
          <mesh
            geometry={geo('muzza', cheeseGeometry)}
            material={mat(`muzza:${b}`, () => std(baked ? '#f6cf6e' : '#fff1cf', baked ? 0.35 : 0.5))}
            scale={baked ? [1.18, 0.6, 1.18] : 1}
            castShadow
            receiveShadow
          />
        )
      case 'pepperoni': {
        const top = mat(`pep-top:${b}`, () => std(baked ? '#8f1e15' : '#ffffff', 0.55, { map: pepperoniTexture() }))
        const side = mat(`pep-side:${b}`, () => std(baked ? '#6e150f' : '#9c2016'))
        return (
          <mesh geometry={geo('pepperoni', () => new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24))} material={[side, top, top]} castShadow receiveShadow />
        )
      }
      case 'aceituna':
        return (
          <mesh
            geometry={geo('olive', () => new THREE.TorusGeometry(0.11, 0.065, 10, 20).rotateX(Math.PI / 2))}
            material={mat('olive', () => std('#2e2231', 0.25))}
            castShadow
          />
        )
      case 'champinon':
        return (
          <group>
            <mesh
              geometry={geo('mush-cap', () => new THREE.SphereGeometry(0.26, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1))}
              material={mat(`mush-cap:${b}`, () => std(baked ? '#a77a52' : '#d8c1a0', 0.8))}
              position={[0, -0.03, 0]}
              castShadow
            />
            <mesh
              geometry={geo('mush-gill', () => new THREE.CircleGeometry(0.25, 18).rotateX(Math.PI / 2))}
              material={mat('mush-gill', () => std('#8c6d55', 0.9, { side: THREE.DoubleSide }))}
              position={[0, -0.031, 0]}
            />
            <mesh
              geometry={geo('mush-stem', () => new THREE.CylinderGeometry(0.075, 0.095, 0.15, 12))}
              material={mat('mush-stem', () => std('#efe3cf', 0.8))}
              position={[0, -0.1, 0]}
              castShadow
            />
          </group>
        )
      case 'albahaca':
        return (
          <mesh
            geometry={geo('leaf', leafGeometry)}
            material={mat(`leaf:${variant}:${b}`, () => std(baked ? '#2c5e2a' : BASIL_COLORS[variant % 3], 0.5, { side: THREE.DoubleSide }))}
            castShadow
          />
        )
      case 'tomate': {
        const top = mat(`tom-top:${b}`, () => std(baked ? '#c76a5b' : '#ffffff', 0.4, { map: tomatoTexture() }))
        const side = mat('tom-side', () => std('#c42a1e', 0.4))
        return <mesh geometry={geo('tomato', () => new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24))} material={[side, top, top]} castShadow receiveShadow />
      }
      case 'morron':
        return (
          <mesh
            geometry={geo('pepper', () => new THREE.TorusGeometry(0.21, 0.05, 10, 26).rotateX(Math.PI / 2))}
            material={mat(`pepper:${variant}:${b}`, () => std(PEPPER_COLORS[variant % 3], baked ? 0.6 : 0.35))}
            castShadow
          />
        )
    }
  }, [type, variant, baked, b])
  return mesh
}
