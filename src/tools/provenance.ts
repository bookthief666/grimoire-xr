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
