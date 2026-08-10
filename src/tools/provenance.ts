export type ProvenanceLayer =
  | 'primary-source'
  | 'translation'
  | 'scholarly-commentary'
  | 'operative-reconstruction'
  | 'experimental-correspondence'

export type SourceProvenance = {
  id: string
  work: string
  author: string
  date: string
  layer: ProvenanceLayer
  claim: string
  reference: string
  notes?: string
}

export const PROVENANCE_LABELS: Record<ProvenanceLayer, string> = {
  'primary-source': 'PRIMARY SOURCE',
  translation: 'TRANSLATION',
  'scholarly-commentary': 'SCHOLARLY COMMENTARY',
  'operative-reconstruction': 'OPERATIVE RECONSTRUCTION',
  'experimental-correspondence': 'EXPERIMENTAL CORRESPONDENCE',
}

export function provenanceLabel(source: SourceProvenance) {
  return PROVENANCE_LABELS[source.layer]
}

/**
 * Content rule for every authored Grimoire XR instrument:
 *
 * 1. Primary-source wording is never silently paraphrased.
 * 2. A translation is never displayed as though it were the source language.
 * 3. App-authored ritual mechanics are labelled operative reconstructions.
 * 4. Deterministic mappings invented for the application are labelled
 *    experimental correspondences rather than historical attributions.
 * 5. Generative AI interpretation may sit on top of these layers, but it must
 *    never overwrite or impersonate them.
 */
export const SCHOLARLY_CONTENT_RULES = Object.freeze({
  preservePrimaryWording: true,
  distinguishTranslation: true,
  labelReconstruction: true,
  labelExperimentalMappings: true,
  generatedInterpretationIsSeparate: true,
})

/**
 * Per-field provenance for the Liber CCCXXXIII corpus.
 *
 * A chapter record is not one provenance tier. Crowley wrote the verse; this
 * edition wrote the commentary; the four correspondence fields are the
 * edition's assignments rather than attributions attested in the source work.
 * Rendering a record therefore has to label its parts separately, or the
 * commentary reads as though Crowley wrote it.
 *
 * Ported from the original application's own `src/data/provenance.js` rather
 * than reinvented here — the original already drew these distinctions, and
 * diverging from its wording would create two competing claims about the same
 * text.
 */
export const LIBER333_FIELD_PROVENANCE = Object.freeze({
  title: 'primary-source',
  text: 'primary-source',
  commentary: 'scholarly-commentary',
  sephira: 'experimental-correspondence',
  path: 'experimental-correspondence',
  element: 'experimental-correspondence',
  tarot: 'experimental-correspondence',
} as const satisfies Record<string, ProvenanceLayer>)

/** Display labels, verbatim from the original edition. */
export const LIBER333_PROVENANCE_LABELS = Object.freeze({
  sourceText: 'SOURCE TEXT',
  editorialCommentary: 'MODERN EDITORIAL COMMENTARY',
  oracleInterpretation: 'ORACLE INTERPRETATION',
})

/** Explanatory notes, verbatim from the original edition. */
export const LIBER333_PROVENANCE_NOTES = Object.freeze({
  sourceText:
    "The displayed chapter verse is Crowley's published Liber CCCXXXIII source text.",
  editorialCommentary:
    'The commentary is modern editorial interpretation supplied by this digital edition; it is not presented as Crowley’s own commentary unless explicitly identified.',
  oracleInterpretation:
    'The Oracle section is an optional interpretive response shaped from the question, selected chapter data, and available reading context. It remains distinct from both source text and editorial commentary.',
  corpus:
    'This edition stores 94 records because it includes two preliminary veil entries before Chapters 0 through 91. Traditional descriptions may count the work differently depending on whether preliminary material and Chapter 0 are included.',
})

/**
 * The corpus shape, stated as data so a test can assert the code and the
 * documentation cannot drift apart again. This repository previously described
 * the work as "chapters 0-93", which is wrong in both directions: it invented
 * chapters 92 and 93, and it hid the two veils.
 */
export const LIBER333_CORPUS_CONVENTION = Object.freeze({
  preliminaryRecords: 2,
  numberedStart: 0,
  numberedEnd: 91,
  totalRecords: 94,
})
