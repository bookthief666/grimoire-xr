import {
  SEMANTIC_CONFIG_SCHEMA_ID,
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  updateSemanticConfig,
} from './semanticConfig.js';

const normalizeDepth = value => {
  const depth = String(value || '').trim().toLowerCase();
  return ['neophyte', 'adept', 'magus'].includes(depth) ? depth : null;
};

export const resolveSemanticBridgeConfig = ({
  semanticConfig = null,
  tradition = null,
  readingDepth,
} = {}) => {
  const requestedDepth = normalizeDepth(readingDepth);
  if (semanticConfig?.schemaId === SEMANTIC_CONFIG_SCHEMA_ID) {
    const normalized = createSemanticConfig(semanticConfig);
    return requestedDepth && requestedDepth !== normalized.readingDepth
      ? updateSemanticConfig(normalized, { readingDepth: requestedDepth })
      : normalized;
  }
  return semanticConfigFromLegacyTradition(tradition, {
    readingDepth: requestedDepth || 'adept',
  }).config;
};

export const semanticBridgeConfigFromReadingRecord = record => {
  const input = record?.input || {};
  return createSemanticConfig({
    tarotSystem: input.tarotSystem || 'thoth',
    correspondenceProfile: input.correspondenceProfile,
    relationMethod: input.relationMethod,
    interpretiveLenses: Array.isArray(input.lenses) ? input.lenses : [],
    ritualTheme: record?.presentationContext?.ritualTheme || 'none',
    readingDepth: input.readingDepth || 'adept',
  });
};

export const semanticBridgePresentationLabel = config => {
  const resolved = resolveSemanticBridgeConfig({ semanticConfig: config });
  const lensText = resolved.interpretiveLenses.length
    ? resolved.interpretiveLenses.join(' + ')
    : 'no interpretive lens';
  return `${resolved.tarotSystem} · ${resolved.relationMethod} · ${lensText}`;
};
