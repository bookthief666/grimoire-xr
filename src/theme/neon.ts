/**
 * The neon rotunda palette.
 *
 * Saturated line-light against near-black. Everything in the temple is drawn as
 * thin additively-blended geometry, so these colours are treated as *emitted
 * light* rather than surface paint — a value near 1.0 in one or two channels
 * reads as neon, while anything desaturated reads as dead plastic.
 *
 * This supersedes `palette.ts`, which held the older warm-amber set. That one
 * had already drifted out of use: the scene hardcodes `#d8e8ff` 50 times and
 * `#f8f3df` 39 times without going through it. Adding a third parallel system
 * would make that worse, so new work uses this and `palette.ts` is retired as
 * its callers are converted.
 */

export const NEON = {
  /** Ground. Not pure black — a hint of blue keeps it from looking like a hole. */
  void: '#04060c',
  floor: '#0a1020',
  floorSheen: '#141e36',

  cyan: '#00e5ff',
  magenta: '#ff2bd6',
  violet: '#a855ff',
  gold: '#ffd23f',
  ice: '#d8f6ff',
  ember: '#ff5a3c',

  /** Dimmed variants for unlit / resting states. */
  cyanDim: '#0a5866',
  magentaDim: '#6b1259',
  violetDim: '#452070',
  goldDim: '#6b5518',
  iceDim: '#4a5a66',

  text: '#eaf6ff',
  textDim: '#7d8f9e',
} as const

export type NeonKey = keyof typeof NEON

/** Each chamber claims a hue, so the whole rotunda re-tints when one is summoned. */
export const CHAMBER_HUE = {
  sanctum: NEON.gold,
  cell: NEON.cyan,
  monad: NEON.ice,
  chapel: NEON.violet,
} as const

/**
 * Fake-bloom halo opacities.
 *
 * The reference image's glow is postprocessing, which is too expensive for
 * standalone VR. Layering two or three additive discs at these opacities
 * approximates it: the result reads as neon, just crisper at the edge than a
 * true bloom pass would be.
 */
export const HALO = {
  core: 0.85,
  inner: 0.22,
  outer: 0.07,
} as const
