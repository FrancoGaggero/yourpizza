import { useEffect, useRef, useState, type PointerEvent } from 'react'
import * as THREE from 'three'
import { isMuted, setMuted, unlockAudio } from '../audio/sfx'
import { MAX_PIECES, SPIN_LABELS, useGame, type SpinLevel } from '../game/gameStore'
import { INGREDIENT_IDS, INGREDIENTS, type IngredientId } from '../game/ingredients'
import { beginDrag, bodies, countOnPizza, isOnPizza, pointToPlane, takeSnapshot } from '../kitchen/drag'
import { IngredientIcon } from './IngredientIcon'

const spawnPoint = new THREE.Vector3()

/** Controls over the kitchen: ingredient tray, turntable speed, counters and the oven button. */
export function KitchenHud() {
  const phase = useGame((s) => s.phase)
  const spin = useGame((s) => s.spin)
  const thrown = useGame((s) => s.thrown)
  const [onPizza, setOnPizza] = useState(0)
  const [muted, setMutedState] = useState(isMuted)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)

  useEffect(() => {
    if (phase !== 'kitchen') return
    const timer = setInterval(() => setOnPizza(countOnPizza()), 400)
    return () => clearInterval(timer)
  }, [phase])

  if (phase !== 'kitchen') return null

  const say = (text: string) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }

  const grab = (type: IngredientId) => (e: PointerEvent) => {
    e.preventDefault()
    unlockAudio()
    const { pieces, spawn, removePiece } = useGame.getState()
    if (pieces.length >= MAX_PIECES) {
      // Recycle the oldest ingredient lying around off the pizza.
      const stray = pieces.find((p) => {
        const body = bodies.get(p.id)
        return body && !isOnPizza(body)
      })
      if (!stray) return say('¡La pizza no aguanta más!')
      removePiece(stray.id, true)
    }
    if (!pointToPlane(e.clientX, e.clientY, spawnPoint)) return
    const id = spawn(type, [spawnPoint.x, spawnPoint.y, spawnPoint.z])
    beginDrag(id, e.clientX, e.clientY, true)
  }

  const bake = () => {
    const { pieces, thrown, bake } = useGame.getState()
    bake(takeSnapshot(pieces, thrown))
  }

  return (
    <>
      <header className="hud-top">
        <button className="brand" onClick={() => useGame.getState().setPhase('menu')} title="Volver al menú">
          Pizzería <span>del Caos</span>
        </button>
        <p className="stats">
          <b>{onPizza}</b> en la pizza · <b>{Math.max(0, thrown - onPizza)}</b> afuera
        </p>
        <div className="hud-controls">
          <div className="spin" role="radiogroup" aria-label="Velocidad de la bandeja">
            {SPIN_LABELS.map((label, i) => (
              <button
                key={label}
                role="radio"
                aria-checked={spin === i}
                className={spin === i ? 'is-on' : ''}
                onClick={() => useGame.getState().setSpin(i as SpinLevel)}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="btn btn-small" onClick={() => useGame.getState().clearKitchen()}>
            Limpiar
          </button>
          <button
            className="btn btn-small btn-icon"
            aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            onClick={() => {
              setMuted(!muted)
              setMutedState(!muted)
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {toast && <div className="toast">{toast}</div>}

      <footer className="hud-bottom">
        <div className="tray-wrap">
          <p className="tray-hint">arrastrá y tirá · tocá para soltar</p>
          <div className="tray" aria-label="Ingredientes">
          {INGREDIENT_IDS.map((id) => (
            <button key={id} className="tray-item" onPointerDown={grab(id)} aria-label={`Agarrar ${INGREDIENTS[id].name}`}>
              <IngredientIcon type={id} />
              <span>{INGREDIENTS[id].name.split(' ').at(-1)}</span>
            </button>
          ))}
          </div>
        </div>
        <button className="bake" onClick={bake}>
          ¡Al horno!
        </button>
      </footer>
    </>
  )
}
