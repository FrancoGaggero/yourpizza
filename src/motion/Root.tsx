import { Composition } from 'remotion'
import { INTRO, Intro } from './compositions/Intro'
import { Verdict, VERDICT } from './compositions/Verdict'

/** Studio entry: the same compositions the game plays, previewable and renderable on their own. */
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={INTRO.durationInFrames}
        fps={INTRO.fps}
        width={INTRO.width}
        height={INTRO.height}
        defaultProps={{ tagline: 'física, queso y malas decisiones' }}
      />
      <Composition
        id="Verdict"
        component={Verdict}
        durationInFrames={VERDICT.durationInFrames}
        fps={VERDICT.fps}
        width={VERDICT.width}
        height={VERDICT.height}
        defaultProps={{
          name: 'La Aceitunera Fugitiva',
          score: 4.5,
          stars: 2.5,
          band: 'meh' as const,
          verdict: 'PASABLE',
          mood: 'skeptical' as const,
          headline: 'Tiene potencial. Escondido. Muy escondido.',
          lines: [
            '¿Es una pizza o un estacionamiento de aceitunas?',
            'Algunos ingredientes eligieron la libertad.',
            'Está todo de un lado. ¿La armaste en un barco?',
          ],
        }}
      />
    </>
  )
}
