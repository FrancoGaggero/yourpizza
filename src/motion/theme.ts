import { loadFont as loadMono } from '@remotion/google-fonts/DMMono'
import { loadFont as loadDisplay } from '@remotion/google-fonts/LilitaOne'

/** Compositions load their own fonts so they look the same in the app, Studio and renders. */
export const DISPLAY = loadDisplay('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily
export const MONO = loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily

export const C = {
  tomato: '#d9412b',
  tomatoDark: '#a8301f',
  cream: '#fff4dc',
  paper: '#fffaf0',
  crust: '#e3a857',
  basil: '#3f9b4a',
  gold: '#f2b632',
  ink: '#2a1810',
  muted: '#8a6f5c',
}

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
