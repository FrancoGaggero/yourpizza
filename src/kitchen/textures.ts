import * as THREE from 'three'
import { mulberry32 } from '../game/rng'

/** Procedural canvas textures, generated once and cached. */

const cache = new Map<string, THREE.CanvasTexture>()

function make(id: string, size: number, paint: (ctx: CanvasRenderingContext2D, rand: () => number) => void) {
  const hit = cache.get(id)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  paint(canvas.getContext('2d')!, mulberry32(id.length * 7919 + size))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache.set(id, tex)
  return tex
}

export function woodTexture() {
  const tex = make('wood', 512, (ctx, rand) => {
    ctx.fillStyle = '#8a5530'
    ctx.fillRect(0, 0, 512, 512)
    // Planks with grain lines.
    for (let plank = 0; plank < 4; plank++) {
      const y0 = plank * 128
      ctx.fillStyle = `hsl(25, 45%, ${30 + rand() * 8}%)`
      ctx.fillRect(0, y0, 512, 126)
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = `rgba(40, 20, 8, ${0.08 + rand() * 0.15})`
        ctx.lineWidth = 1 + rand() * 2
        const y = y0 + rand() * 126
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(170, y + (rand() - 0.5) * 12, 340, y + (rand() - 0.5) * 12, 512, y)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(20, 10, 4, 0.55)'
      ctx.fillRect(0, y0 + 126, 512, 2)
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function tileTexture() {
  const tex = make('tiles', 256, (ctx, rand) => {
    ctx.fillStyle = '#d9cbb3'
    ctx.fillRect(0, 0, 256, 256)
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const light = 88 + rand() * 6
        ctx.fillStyle = (x + y) % 2 ? `hsl(40, 45%, ${light}%)` : `hsl(8, 60%, ${light - 34}%)`
        ctx.fillRect(x * 64 + 2, y * 64 + 2, 60, 60)
      }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function pepperoniTexture() {
  return make('pepperoni', 128, (ctx, rand) => {
    ctx.fillStyle = '#b8291c'
    ctx.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 210, 190, 0.55)' : 'rgba(110, 15, 10, 0.55)'
      ctx.beginPath()
      ctx.arc(rand() * 128, rand() * 128, 2 + rand() * 5, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

export function tomatoTexture() {
  return make('tomato', 128, (ctx) => {
    ctx.fillStyle = '#d93a2b'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#f0705e'
    ctx.beginPath()
    ctx.arc(64, 64, 48, 0, Math.PI * 2)
    ctx.fill()
    // Seed chambers.
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      ctx.fillStyle = '#f7b7a4'
      ctx.beginPath()
      ctx.ellipse(64 + Math.cos(a) * 26, 64 + Math.sin(a) * 26, 13, 8, a, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f3e3a2'
      for (let s = 0; s < 3; s++) {
        ctx.beginPath()
        ctx.arc(64 + Math.cos(a) * (20 + s * 6), 64 + Math.sin(a) * (20 + s * 6), 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  })
}

export function brickTexture() {
  const tex = make('brick', 256, (ctx, rand) => {
    ctx.fillStyle = '#5a3424'
    ctx.fillRect(0, 0, 256, 256)
    for (let row = 0; row < 8; row++) {
      const offset = row % 2 ? 32 : 0
      for (let col = -1; col < 4; col++) {
        ctx.fillStyle = `hsl(${12 + rand() * 10}, 55%, ${36 + rand() * 12}%)`
        ctx.fillRect(col * 64 + offset + 2, row * 32 + 2, 60, 28)
      }
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
