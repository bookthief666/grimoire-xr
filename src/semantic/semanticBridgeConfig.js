import {
  CORRESPONDENCE_PROFILES,
  INTERPRETIVE_LENSES,
  RELATION_METHODS,
  RITUAL_THEMES,
  SEMANTIC_CONFIG_SCHEMA_ID,
  TAROT_SYSTEMS,
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  updateSemanticConfig,
} from './semanticConfig.js';

const normalizeDepth = value => {
  const depth = String(value || '').trim().toLowerCase();
  return ['neophyte', 'adept', 'magus'].includes(depth) ? depth : null;
};

const supportedOr = (value, allowed, fallback) => {
  const normalized = String(value || '').trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
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
  const tarotSystem = supportedOr(input.tarotSystem, TAROT_SYSTEMS, 'thoth');
  const defaultCorrespondence = tarotSystem === 'thoth' ? 'thoth_native' : 'none';
  const correspondenceProfile = supportedOr(
    input.correspondenceProfile,
    CORRESPONDENCE_PROFILES,
    defaultCorrespondence,
  );
  const relationMethod = supportedOr(input.relationMethod, RELATION_METHODS, 'disabled');
  const interpretiveLenses = Array.isArray(input.lenses)
    ? input.lenses
        .map(value => String(value || '').trim().toLowerCase())
        .filter(value => INTERPRETIVE_LENSES.includes(value))
    : [];
  const ritualTheme = supportedOr(record?.presentationContext?.ritualTheme, RITUAL_THEMES, 'none');

  return createSemanticConfig({
    tarotSystem,
    correspondenceProfile: correspondenceProfile === 'thoth_native' && tarotSystem !== 'thoth'
      ? 'none'
      : correspondenceProfile,
    relationMethod,
    interpretiveLenses,
    ritualTheme,
    readingDepth: normalizeDepth(input.readingDepth) || 'adept',
  });
};

export const semanticBridgePresentationLabel = config => {
  const resolved = resolveSemanticBridgeConfig({ semanticConfig: config });
  const lensText = resolved.interpretiveLenses.length
    ? resolved.interpretiveLenses.join(' + ')
    : 'no interpretive lens';
  return `${resolved.tarotSystem} · ${resolved.relationMethod} · ${lensText}`;
};
