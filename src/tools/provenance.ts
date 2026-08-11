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
 * Per-field provenance for the Monas Hieroglyphica corpus.
 *
 * Four tiers in one record, which is why the chamber renders them at four
 * different distances rather than stacking them on one panel: `latin` is Dee,
 * `english` is that edition translating Dee, `paraphrase` and `layers` are that
 * edition interpreting him.
 *
 * `sourceNote` is deliberately absent from this map. It is not a tier of the
 * text — it is the edition's own account of how it checked the Latin, and it is
 * displayed as an attributed claim rather than as content.
 */
export const MONAS_FIELD_PROVENANCE = Object.freeze({
  latin: 'primary-source',
  english: 'translation',
  paraphrase: 'scholarly-commentary',
  layers: 'scholarly-commentary',
} as const satisfies Record<string, ProvenanceLayer>)

export const MONAS_PROVENANCE_LABELS = Object.freeze({
  latin: 'SOURCE TEXT · DEE, 1564',
  english: 'TRANSLATION',
  paraphrase: 'EDITORIAL PARAPHRASE',
  layers: 'EDITORIAL COMMENTARY',
  sourceNote: 'SOURCE NOTE',
})

export const MONAS_PROVENANCE_NOTES = Object.freeze({
  latin:
    "The Latin is Dee's, transcribed by the source edition. Grimoire XR has not independently checked it against a facsimile; the edition's own account of its checking is shown beside it.",
  english:
    'The English is the source edition’s translation of the Latin above, not a separate historical translation.',
  commentary:
    'Paraphrase and the register commentaries are the source edition’s interpretation. They are not Dee’s and are not presented as his.',
  scope:
    'This edition carries a sourced fragment: 13 sentences across Dee’s theorems 1, 2, 3, 4 and 6. The Monas Hieroglyphica has 24 theorems. The remainder is absent, not summarised.',
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
