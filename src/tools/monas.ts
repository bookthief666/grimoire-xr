import type { SourceProvenance } from './provenance'
import { MONAS_SENTENCES, type MonasSentence } from './monasCorpus.ts'

/**
 * MONAS HIEROGLYPHICA — sourced fragment, inscribed as a construction.
 *
 * Until this port every entry here carried the literal string
 * 'OPERATIVE RECONSTRUCTION — NOT A DEE QUOTATION' in its source-language slot,
 * because the XR app had no sourced text. That was the honest thing to do at
 * the time. It is no longer the situation: the original edition
 * (bookthief666/monas-hieroglyphica) carries Dee's Latin with its own account
 * of how it was checked, a translation, a paraphrase, and commentary in up to
 * seven registers. All of it is ported in ./monasCorpus.ts.
 *
 * What remains a Grimoire XR construct is the SIX-PHASE ORDER — point, line,
 * circle, sun, moon, cross — which is the glyph's assembly grammar for VR, not
 * Dee's theorem sequence. Both sequences are now real and they are not the
 * same: theorem 1 is the `circle` phase, theorem 2 covers `line` and `point`.
 * The chamber shows both rather than collapsing them.
 */

/**
 * What this corpus does and does not cover.
 *
 * Stated as data so a test can assert the code and the documentation cannot
 * drift apart — the same discipline the Liber 333 corpus convention uses.
 */
export const MONAS_CORPUS_SCOPE = Object.freeze({
  sentences: 13,
  /** Dee's theorems represented in the sourced fragment. */
  coveredTheorems: [1, 2, 3, 4, 6] as readonly number[],
  /** Theorems in the actual work. The fragment is not the book. */
  theoremsInWork: 24,
})

export const MONAS_PROVENANCE: SourceProvenance = {
  id: 'dee-monas-sourced-fragment',
  work: 'Monas Hieroglyphica',
  author: 'John Dee',
  date: '1564',
  layer: 'primary-source',
  claim:
    "Latin is Dee's, as transcribed by the source edition, which supplies its own note on how each sentence was checked. The translation and commentary are that edition's. The six-phase construction order is a Grimoire XR interface model and is not Dee's theorem sequence.",
  reference:
    'John Dee, Monas Hieroglyphica (Antwerp, 1564), 24 theorems. This edition carries a sourced fragment: 13 sentences across theorems 1, 2, 3, 4 and 6.',
  notes:
    'The remaining nineteen theorems are absent. Do not compose Latin to fill the gap; extend only from a source-checked edition.',
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

/** Every sourced sentence for a construction phase, in the edition's order. */
export function sentencesForPhase(phase: GlyphPhase): MonasSentence[] {
  return MONAS_SENTENCES.filter((sentence) => sentence.phase === phase)
}

/** The first sourced sentence for a phase. Every phase has at least one. */
export function sentenceForPhase(phase: GlyphPhase): MonasSentence {
  return sentencesForPhase(phase)[0]
}

/** Registers this sentence actually carries, in a stable display order. */
export function registersFor(sentence: MonasSentence) {
  const order = [
    'literal',
    'geometric',
    'astronomical',
    'cabalistic',
    'alchemical',
    'philological',
    'speculative',
  ] as const

  return order.filter((register) => {
    const body = sentence.layers[register]
    return typeof body === 'string' && body.trim().length > 0
  })
}

export function phaseProgress(phase: GlyphPhase) {
  const index = GLYPH_PHASES.indexOf(phase)
  return index < 0 ? 0 : (index + 1) / GLYPH_PHASES.length
}

export function phaseReached(current: GlyphPhase, target: GlyphPhase) {
  return GLYPH_PHASES.indexOf(current) >= GLYPH_PHASES.indexOf(target)
}
