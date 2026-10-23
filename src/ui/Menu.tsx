import { unlockAudio } from '../audio/sfx'
import { useGame } from '../game/gameStore'

export function Menu() {
  const phase = useGame((s) => s.phase)
  if (phase !== 'menu') return null
  return (
    <div className="menu">
      <div className="menu-card">
        <h1 className="logo">
          Pizzería
          <span>del Caos</span>
        </h1>
        <p className="menu-tagline">física, queso y malas decisiones</p>
        <div className="menu-actions">
          <button
            className="btn btn-primary btn-big"
            onClick={() => {
              unlockAudio()
              useGame.getState().startSandbox()
            }}
          >
            Modo libre
          </button>
          <button className="btn btn-big" disabled>
            Pedidos contra reloj <small>pronto</small>
          </button>
        </div>
        <p className="menu-help">
          Arrastrá ingredientes desde la bandeja y tiralos sobre la pizza. Cuando te guste (o te dé vergüenza), mandala al horno y bancate al
          Chef Pepino.
        </p>
      </div>
    </div>
  )
}
