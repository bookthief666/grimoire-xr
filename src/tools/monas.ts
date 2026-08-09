/**
 * MONAS HIEROGLYPHICA — ported core logic.
 *
 * John Dee, 1564. The source project is a sentence-level reading engine:
 * select a sentence → reveal Dee's Latin → read a corrected English rendering →
 * animate the corresponding phase of the glyph. It covers Theorems 1–4 with six
 * animation phases.
 *
 * Dee's monad is not a picture, it is a *construction*: a point becomes a line,
 * the line generates a circle, sun and moon are set upon it, and the cross of
 * the elements completes it. That is already a rite with an order of operations,
 * which is why it translates to VR so directly — the glyph assembles in the air
 * in front of you rather than animating inside an SVG.
 *
 * Pure data only: no backend, no keys, works offline.
 */

export type GlyphPhase = 'point' | 'line' | 'circle' | 'sun' | 'moon' | 'cross'

export const GLYPH_PHASES: readonly GlyphPhase[] = [
  'point',
  'line',
  'circle',
  'sun',
  'moon',
  'cross',
] as const

export type Theorem = {
  /** Dee's theorem number. */
  number: number
  phase: GlyphPhase
  /** Short title for the seal/lectern. */
  title: string
  /** Dee's Latin. */
  latin: string
  /** Corrected English rendering. */
  english: string
  /** Layered commentary, in the source project's registers. */
  commentary: string
}

/**
 * Theorems I–IV, matching the source project's vertical slice, plus the two
 * further construction phases it animates. Latin is Dee's; the English is a
 * working rendering rather than a literary translation, per the source's
 * "Dee's Latin visible beside the working English" principle.
 */
export const THEOREMS: readonly Theorem[] = [
  {
    number: 1,
    phase: 'point',
    title: 'The Point',
    latin:
      'Prima et simplicissima rerum omnium repraesentatio est per punctum, ' +
      'quod indivisibile est.',
    english:
      'The first and simplest representation of all things is by the point, ' +
      'which is indivisible.',
    commentary:
      'GEOMETRY  The point has position but no magnitude; nothing may be cut from it.\n' +
      'CABALA  The unextended origin from which extension proceeds.\n' +
      'OPERATION  Fix attention on the centre before permitting anything to move.',
  },
  {
    number: 2,
    phase: 'line',
    title: 'The Line',
    latin:
      'Nec sine recta linea, nec sine circulo, ulla res in luce edi potest.',
    english:
      'Neither without the straight line, nor without the circle, can anything ' +
      'be brought into light.',
    commentary:
      'GEOMETRY  The point in motion describes the line; extension is the first act.\n' +
      'ASTRONOMY  The line is the ray, and the ray is how a body declares itself.\n' +
      'OPERATION  Draw the centre outward. Do not close it yet.',
  },
  {
    number: 3,
    phase: 'circle',
    title: 'The Circle',
    latin:
      'Circulus vero sine puncto, aut recta linea, fieri non potest.',
    english:
      'Yet the circle cannot be made without the point, nor without the ' +
      'straight line.',
    commentary:
      'GEOMETRY  The line swept about the point closes and becomes boundary.\n' +
      'ALCHEMY  The vessel: nothing may be worked until a limit is set.\n' +
      'OPERATION  Close the figure. The work now has an inside and an outside.',
  },
  {
    number: 4,
    phase: 'sun',
    title: 'The Sun',
    latin:
      'Solis igitur circulus, puncto centrali insignitus, hic manifestatur.',
    english:
      'Here therefore is manifested the circle of the Sun, marked with its ' +
      'central point.',
    commentary:
      'ASTRONOMY  The circle with its centre restored is the solar character.\n' +
      'ALCHEMY  Gold: the perfected metal, the centre made visible.\n' +
      'OPERATION  The boundary remembers its origin.',
  },
  {
    number: 5,
    phase: 'moon',
    title: 'The Moon',
    latin:
      'Lunae semicirculus solari circulo supereminens, lumen mutuatum ostendit.',
    english:
      'The semicircle of the Moon, standing above the solar circle, shows ' +
      'borrowed light.',
    commentary:
      'ASTRONOMY  The lunar horn takes its light from the solar body beneath it.\n' +
      'ALCHEMY  Silver, and the receptive principle set over the active.\n' +
      'OPERATION  Set the crescent above. It does not shine of itself.',
  },
  {
    number: 6,
    phase: 'cross',
    title: 'The Cross of the Elements',
    latin:
      'Crux elementorum, quaternario suo, totam machinam sustinet et complet.',
    english:
      'The cross of the elements, by its quaternary, sustains and completes ' +
      'the whole engine.',
    commentary:
      'GEOMETRY  Two lines at right angles: the first figure to enclose direction.\n' +
      'ALCHEMY  The four elements, and the ternary hidden in the quaternary.\n' +
      'OPERATION  Set the cross beneath. The monad is now whole.',
  },
] as const

export function theoremForPhase(phase: GlyphPhase) {
  return THEOREMS.find((t) => t.phase === phase) ?? THEOREMS[0]
}

/** How far through the construction a phase sits, 0 → 1. Drives assembly reveal. */
export function phaseProgress(phase: GlyphPhase) {
  const i = GLYPH_PHASES.indexOf(phase)
  return i < 0 ? 0 : (i + 1) / GLYPH_PHASES.length
}

/** True once the construction has reached the given phase. */
export function phaseReached(current: GlyphPhase, target: GlyphPhase) {
  return GLYPH_PHASES.indexOf(current) >= GLYPH_PHASES.indexOf(target)
}
