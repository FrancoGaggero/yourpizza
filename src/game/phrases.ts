import type { IngredientId } from './ingredients'

/** Everything the chef can say. Variants are picked with the review's seeded RNG. */

export const HEADLINES = {
  masterpiece: ['¡Bellissima! Lloro.', 'Esto va directo al cuadro de honor.', '¡Madonna santa, qué pizza!'],
  good: ['Está bien. Se come.', 'Aprobada, con dignidad.', 'Mirá vos. No está nada mal.'],
  meh: ['Mmm. Comestible, técnicamente.', 'Tiene potencial. Escondido. Muy escondido.', 'La voy a probar con los ojos cerrados.'],
  bad: ['¿QUÉ ES ESTO?', 'Llamen a los bomberos.', 'Me jubilo. Hoy mismo.'],
}

/** Main noun of the pizza's name, by its dominant ingredient. */
export const NAME_NOUN: Record<IngredientId | 'none', string[]> = {
  none: ['Desnuda', 'Invisible'],
  muzza: ['Quesera', 'Muzzarellosa'],
  pepperoni: ['Picante', 'Pepperonera'],
  aceituna: ['Aceitunera', 'Olivareña'],
  champinon: ['Silvestre', 'Hongueada'],
  albahaca: ['Verde', 'Botánica'],
  tomate: ['Tomatina', 'Colorada'],
  morron: ['Arcoíris', 'Morronera'],
}

export const NAME_ADJECTIVE = {
  tower: ['Rascacielos', 'Torre Inclinada'],
  fugitive: ['Fugitiva', 'Desbandada'],
  lopsided: ['Ladeada', 'Rengueante'],
  supreme: ['Suprema', 'Imperial'],
  tragic: ['Trágica', 'del Desastre'],
  complete: ['Completa', 'de la Heladera'],
  plain: ['Clásica', 'del Barrio', 'de la Casa'],
}

export type ObservationId =
  | 'empty'
  | 'tiny'
  | 'noCheese'
  | 'cheeseFlood'
  | 'olives'
  | 'pepperoni'
  | 'basil'
  | 'mushrooms'
  | 'tomatoes'
  | 'peppers'
  | 'tower'
  | 'lopsided'
  | 'manyMissed'
  | 'someMissed'
  | 'allIn'
  | 'monotone'
  | 'balanced'
  | 'sparse'
  | 'packed'
  | 'fillerLow'
  | 'fillerMid'
  | 'fillerHigh'
  | 'fillerAny'

export const OBSERVATIONS: Record<ObservationId, string[]> = {
  empty: ['¿Me servís un plato? Esto es masa, salsa y esperanza.', 'Pediste una pizza y trajiste una idea.'],
  tiny: ['Veo más salsa que decisiones.', 'Le pusiste ingredientes como quien deja propina: lo mínimo.'],
  noCheese: ['¿Una pizza sin muzzarella? Mi nonna se acaba de levantar de la tumba.', 'Sin queso. Valiente. Equivocado, pero valiente.'],
  cheeseFlood: ['Esto no es una pizza, es una fondue con complejo de inferioridad.', 'Tanto queso que se puede ver desde el espacio.'],
  olives: ['¿Es una pizza o un estacionamiento de aceitunas?', 'Las aceitunas están organizando un sindicato.'],
  pepperoni: ['Tanto pepperoni que la pizza tiene colesterol.', 'Pepperoni sobre pepperoni. Una pizza con armadura.'],
  basil: ['Le pusiste tanta albahaca que ahora es un cantero.', 'Hay más verde que en una plaza.'],
  mushrooms: ['Con tantos champiñones ya es un ecosistema.', 'Esto tiene más hongos que un baño de pensión.'],
  tomatoes: ['Tomate, tomate y más tomate. ¿Esto es una ensalada disfrazada?'],
  peppers: ['Los aros de morrón rebotaron hasta acá. Y se quedaron. Como vos.'],
  tower: ['Pedí una pizza, no una maqueta del Obelisco.', 'Esto tiene pisos. ¿Hay ascensor?'],
  lopsided: ['Está todo de un lado. ¿La armaste en un barco?', 'Media pizza fiesta, media pizza velorio.'],
  manyMissed: ['El piso comió mejor que la pizza.', 'Tiraste más ingredientes al suelo que sobre la masa.'],
  someMissed: ['Algunos ingredientes eligieron la libertad.', 'Hubo bajas en combate. Las lloraremos.'],
  allIn: ['Usaste todo lo que había en la heladera. Respeto.', 'Siete ingredientes. Ambición pura.'],
  monotone: ['Un solo ingrediente. Minimalismo puro, o pereza pura.', 'Monotemática. Como mi tío en Navidad.'],
  balanced: ['Bien repartida, pareja, digna. Casi me emociono.', 'Esa distribución… eso es amor por el oficio.'],
  sparse: ['Hay más espacio libre que en un colectivo a las tres de la mañana.', 'Los ingredientes se ven solitos. Pobres.'],
  fillerLow: ['Le falta un poco de todo. Sobre todo, de todo.', 'Se ve tímida. Una pizza introvertida.'],
  fillerMid: ['Correcta. Como un trámite bien hecho.', 'Ni fu ni fa. Pero con olor rico.'],
  fillerHigh: ['Generosa. Se nota que los ingredientes no los pagás vos.', 'Abundante, como debe ser un domingo.'],
  fillerAny: ['El horno hizo lo que pudo. Vos también, supongo.', 'Huele a pizza. Ya es algo.', 'La masa está bien. La masa siempre está bien.'],
  packed: ['No se ve la masa. ¿Hay masa? Confío en que hay masa.', 'Cubierta de punta a punta. Ni un hueco. Obsesivo. Me gusta.'],
}

export const VERDICT_LABEL = {
  masterpiece: 'OBRA MAESTRA',
  good: 'APROBADA',
  meh: 'PASABLE',
  bad: 'RECHAZADA',
}
