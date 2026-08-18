import { getCanonicalCardPromptContext } from './canonicalTarotBridge.js';

export const CARD_RELIC_AUTHORITY_VERSION = '0.1.0';

const unique = values => [...new Set(values.filter(Boolean))];

const normalizeFieldEntries = fields => Object.entries(fields || {})
  .filter(([, field]) => field && field.value !== null && field.value !== undefined)
  .map(([fieldId, field]) => ({
    fieldId,
    value: field.value,
    semanticStatus: field.semanticStatus || 'UNSPECIFIED',
    authority: field.authority || 'UNSPECIFIED',
    sourceIds: [...(field.sourceIds || [])],
  }));

const finiteNumberOrNull = value => (
  value === null || value === undefined || value === '' || !Number.isFinite(Number(value))
    ? null
    : Number(value)
);

const generationSummary = generation => {
  if (!generation) return null;
  return {
    provider: generation.provider || null,
    mode: generation.mode || null,
    width: finiteNumberOrNull(generation.width),
    height: finiteNumberOrNull(generation.height),
    steps: finiteNumberOrNull(generation.steps),
    seed: Number.isSafeInteger(generation.seed) ? generation.seed : null,
    denoise: finiteNumberOrNull(generation.denoise),
    timing: generation.timing || null,
  };
};

export const buildCardRelicAuthority = ({ card, tradition } = {}) => {
  if (!card) return null;
  const canonical = getCanonicalCardPromptContext({ card, tradition });
  if (!canonical) return null;

  const expressionFields = normalizeFieldEntries(canonical.canonicalExpression);
  const correspondenceFields = normalizeFieldEntries(canonical.canonicalCorrespondences);
  const canonicalSourceIds = unique([
    ...expressionFields.flatMap(field => field.sourceIds),
    ...correspondenceFields.flatMap(field => field.sourceIds),
    ...(card.nameSourceIds || []),
  ]);

  return {
    version: CARD_RELIC_AUTHORITY_VERSION,
    contract: {
      contractId: canonical.contractId,
      contractVersion: canonical.contractVersion,
    },
    identity: {
      cardId: canonical.cardId,
      legacyIndex: canonical.legacyIndex,
      displayName: String(card.name || ''),
      authority: card.nameAuthority || (
        canonical.sourceQualification === 'SOURCE_QUALIFIED'
          ? 'SOURCE_QUALIFIED_CANONICAL_EXPRESSION'
          : 'LEGACY_OR_PROJECT_COMPATIBILITY_LABEL'
      ),
      sourceIds: [...(card.nameSourceIds || [])],
    },
    sourceQualification: canonical.sourceQualification,
    tarotSystem: canonical.tarotSystem,
    expressionFields,
    correspondenceFields,
    canonicalSourceIds,
    generatedLayers: {
      exegesis: card.exegesis
        ? (card.exegesisAuthority || 'LEGACY_UNCLASSIFIED_INTERPRETATION')
        : 'NOT_GENERATED',
      reflectiveMeta: card.meta
        ? (card.interpretiveMetaAuthority || 'LEGACY_UNCLASSIFIED_REFLECTION')
        : 'NOT_GENERATED',
      visualDirection: card.visual
        ? (card.visualAuthority || 'LEGACY_UNCLASSIFIED_IMAGE_DIRECTION')
        : 'NOT_GENERATED',
    },
    imageGeneration: generationSummary(card.generation),
  };
};

export const formatAuthorityValue = value => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
