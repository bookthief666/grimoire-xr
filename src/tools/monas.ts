import type { SourceProvenance } from './provenance'

/**
 * MONAS HIEROGLYPHICA — six-phase VR construction model.
 *
 * IMPORTANT: this module is an operative reconstruction for Grimoire XR. It is
 * not a transcription of Dee's twenty-four theorems and the six phases below
 * must not be represented as verbatim Dee Latin or as Dee's theorem sequence.
 *
 * The phase model exists because point, extension, enclosure, solar/lunar
 * relation and elemental cross make a useful spatial construction grammar in
 * VR. Source-critical text should be added separately and tagged as primary
 * source or translation through the provenance contract.
 */

export const MONAS_PROVENANCE: SourceProvenance = {
  id: 'dee-monas-operative-model',
  work: 'Monas Hieroglyphica',
  author: 'John Dee',
  date: '1564',
  layer: 'operative-reconstruction',
  claim:
    'The six-stage point/line/circle/sun/moon/cross sequence is a Grimoire XR interface model, not a verbatim transcription or historical theorem numbering.',
  reference: 'John Dee, Monas Hieroglyphica (Antwerp, 1564), 24 theorems.',
  notes:
    'Replace reconstruction copy only with source-checked transcription/translation stored as a separate provenance layer.',
}

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
  /** Internal phase number. This is NOT Dee's theorem number. */
  number: number
  phase: GlyphPhase
  title: string
  /** Provenance notice shown in the source-language slot of the current lectern. */
  latin: string
  /** Grimoire XR operative description, not a historical translation. */
  english: string
  commentary: string
}

const RECONSTRUCTION_NOTICE = 'OPERATIVE RECONSTRUCTION — NOT A DEE QUOTATION'

/**
 * Six internal construction phases for the VR instrument.
 *
 * The existing chamber UI still calls these "THEOREMA" for visual continuity;
 * the displayed source slot now makes their status explicit. A later source-
 * edition slice should rename that UI label and add the complete 24-theorem
 * source corpus beside this operative model.
 */
export const THEOREMS: readonly Theorem[] = [
  {
    number: 1,
    phase: 'point',
    title: 'The Point',
    latin: RECONSTRUCTION_NOTICE,
    english:
      'Begin from a single unextended centre. Hold attention there before permitting the figure to acquire direction or magnitude.',
    commentary:
      'GEOMETRY  The point functions here as the operational origin.\n' +
      'INTERPRETATION  This is a VR construction cue, not a claim that Dee begins his first theorem with this wording.\n' +
      'OPERATION  Fix the centre and let no second figure appear yet.',
  },
  {
    number: 2,
    phase: 'line',
    title: 'Extension',
    latin: RECONSTRUCTION_NOTICE,
    english:
      'Extend the centre into direction. The line is treated here as the first visible motion of the operation.',
    commentary:
      'GEOMETRY  Extension introduces direction and relation.\n' +
      'INTERPRETATION  Grimoire XR uses this as the second construction phase; it is not Dee theorem II in source order.\n' +
      'OPERATION  Draw the centre outward without yet closing a boundary.',
  },
  {
    number: 3,
    phase: 'circle',
    title: 'Enclosure',
    latin: RECONSTRUCTION_NOTICE,
    english:
      'Sweep extension around the centre until a boundary appears. The operation now has an inside, an outside and a retained origin.',
    commentary:
      'GEOMETRY  Rotation of a radius produces enclosure.\n' +
      'INTERPRETATION  The circle is used as a spatial vessel in this application model.\n' +
      'OPERATION  Close the figure and hold the distinction between centre and circumference.',
  },
  {
    number: 4,
    phase: 'sun',
    title: 'Solar Mark',
    latin: RECONSTRUCTION_NOTICE,
    english:
      'Restore the centre within the circle and read the combined figure as a solar sign: boundary made intelligible by its origin.',
    commentary:
      'SYMBOLISM  Circle plus central point forms the familiar solar character.\n' +
      'INTERPRETATION  This phase visualizes a relation used by the Monas; it is not a standalone quotation from Dee.\n' +
      'OPERATION  Let circumference and centre be apprehended simultaneously.',
  },
  {
    number: 5,
    phase: 'moon',
    title: 'Lunar Relation',
    latin: RECONSTRUCTION_NOTICE,
    english:
      'Set the lunar crescent in relation to the solar body. The figure now expresses distinction through conjunction rather than isolated symbols.',
    commentary:
      'SYMBOLISM  Solar and lunar characters are brought into one composite engine.\n' +
      'INTERPRETATION  This is an app-authored staging of the composite glyph.\n' +
      'OPERATION  Hold the two luminaries as a single articulated relation.',
  },
  {
    number: 6,
    phase: 'cross',
    title: 'Elemental Cross',
    latin: RECONSTRUCTION_NOTICE,
    english:
      'Complete the operative construction by adding the cross beneath the luminary structure, grounding the composite sign in extension and differentiation.',
    commentary:
      'GEOMETRY  Orthogonal lines introduce a fourfold directional frame.\n' +
      'INTERPRETATION  The completed figure is a pedagogical reconstruction of the Monas as a spatial sequence.\n' +
      'OPERATION  Read the finished glyph from centre, through luminaries, into the cross below.',
  },
] as const

export function theoremForPhase(phase: GlyphPhase) {
  return THEOREMS.find((entry) => entry.phase === phase) ?? THEOREMS[0]
}

export function phaseProgress(phase: GlyphPhase) {
  const index = GLYPH_PHASES.indexOf(phase)
  return index < 0 ? 0 : (index + 1) / GLYPH_PHASES.length
}

export function phaseReached(current: GlyphPhase, target: GlyphPhase) {
  return GLYPH_PHASES.indexOf(current) >= GLYPH_PHASES.indexOf(target)
}
