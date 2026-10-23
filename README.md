# Pizzería del Caos

Armá pizzas tirando ingredientes con física sobre una masa que gira, mandala al horno y bancate la crítica del Chef Pepino.

## Correr

```bash
npm install
npm run dev
```

`npm test` corre los tests de la crítica, `npm run build` arma el build de producción y `npm run studio` abre Remotion Studio con las composiciones.

## Cómo se juega

- Arrastrá un ingrediente desde la bandeja y soltalo con un movimiento rápido para tirarlo. Un toque lo deja caer sobre la pizza.
- Los ingredientes que ya están en la mesa también se pueden agarrar y volver a tirar.
- La bandeja gira: **quieta**, **lenta**, **rápida** o **CAOS**. Lo que está arriba viaja por fricción y sale volando si acelera.
- **¡Al horno!** congela lo que quedó sobre la masa, lo hornea y el chef le pone nota.

## Arquitectura

```
src/
  game/      catálogo de ingredientes, store (zustand), snapshot de la pizza y la crítica (critic.ts + phrases.ts)
  kitchen/   escena R3F: física con @react-three/rapier, bandeja cinemática, arrastre y lanzamiento, horno
  motion/    Remotion: Intro y Verdict, el Chef Pepino en SVG y los Players de la app
  audio/     efectos de sonido sintetizados con Web Audio
  ui/        menú, HUD de la cocina y bandeja de ingredientes
```

- **El snapshot es la única fuente.** Al entrar al horno se guarda qué hay sobre la pizza, en el marco de la pizza (sin la rotación de la bandeja). De ahí salen la pizza horneada, la crítica y, más adelante, la publicidad y el link para compartir.
- **La crítica es determinista.** El mismo snapshot con la misma seed da siempre el mismo nombre, nota y frases, así que se puede testear y un link compartido muestra lo mismo que vio quien la hizo.
- **El lanzamiento usa velocidad, no posición.** El ingrediente agarrado persigue al puntero con velocidad, así que al soltarlo conserva el impulso del gesto.
- **Sin assets de terceros.** Los modelos se arman con primitivas de three.js, las texturas se pintan en canvas y los sonidos se sintetizan. Personajes y frases son originales.

## Roadmap

- [x] Fases 1–3: cocina con física, horno y veredicto (modo libre jugable)
- [ ] Publicidad de TV de tu pizza con Remotion: MP4 en el navegador y link para compartir
- [ ] Modo pedidos contra reloj con eventos de caos
- [ ] Ingredientes secretos desbloqueables
- [ ] Pulido mobile, deploy y alta en el portfolio
