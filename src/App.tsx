import { useGame } from './game/gameStore'
import { Stage } from './kitchen/Stage'
import { IntroOverlay, VerdictPanel } from './motion/Overlay'
import { KitchenHud } from './ui/KitchenHud'
import { Menu } from './ui/Menu'

export default function App() {
  const phase = useGame((s) => s.phase)
  return (
    <div className="app">
      <Stage />
      <Menu />
      <KitchenHud />
      {phase === 'oven' && <div className="oven-banner">Horneando…</div>}
      <VerdictPanel />
      <IntroOverlay />
    </div>
  )
}
