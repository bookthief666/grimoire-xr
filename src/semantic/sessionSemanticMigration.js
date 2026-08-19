import {
  SEMANTIC_CONFIG_SCHEMA_ID,
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  validateSemanticConfig,
} from './semanticConfig.js';
import { semanticBridgeConfigFromReadingRecord } from './semanticBridgeConfig.js';

const depthFromTechLevel = techLevel => ['neophyte', 'adept', 'magus'][Number(techLevel)] || 'adept';
const hasOwn = (value, key) => Boolean(value && Object.prototype.hasOwnProperty.call(value, key));
const readingRecordFromState = state => state?.reading?.readingRecord || null;

const mergeReadingRecordWithLegacyInterpretiveFallback = ({ state, readingRecord }) => {
  const projected = semanticBridgeConfigFromReadingRecord(readingRecord);
  const legacy = semanticConfigFromLegacyTradition(state.selectedTradition, {
    readingDepth: depthFromTechLevel(state.techLevel),
  }).config;
  const input = readingRecord?.input || {};
  const presentation = readingRecord?.presentationContext || {};

  return createSemanticConfig({
    // Canonical-reading axes come from the immutable ReadingRecord whenever present.
    tarotSystem: projected.tarotSystem,
    correspondenceProfile: projected.correspondenceProfile,
    relationMethod: projected.relationMethod,
    // Older records predate these interpretive fields; only those missing fields may
    // fall back to legacy session controls.
    interpretiveLenses: hasOwn(input, 'lenses') ? projected.interpretiveLenses : legacy.interpretiveLenses,
    ritualTheme: hasOwn(presentation, 'ritualTheme') ? projected.ritualTheme : legacy.ritualTheme,
    readingDepth: hasOwn(input, 'readingDepth') ? projected.readingDepth : legacy.readingDepth,
  });
};

export const migrateSessionSemanticConfig = state => {
  if (!state || typeof state !== 'object') {
    return Object.freeze({ state, migrated: false, source: 'NO_STATE', migrationNotes: [] });
  }

  const existing = state.semanticConfig;
  if (existing?.schemaId === SEMANTIC_CONFIG_SCHEMA_ID) {
    const errors = validateSemanticConfig(existing);
    if (errors.length) throw new Error(`Saved semantic configuration is invalid: ${errors.join('; ')}`);
    const normalized = createSemanticConfig(existing);
    return Object.freeze({
      state: { ...state, semanticConfig: normalized },
      migrated: false,
      source: 'SEMANTIC_CONFIG_V1',
      migrationNotes: [],
    });
  }

  const readingRecord = readingRecordFromState(state);
  if (readingRecord?.input?.tarotSystem) {
    const config = mergeReadingRecordWithLegacyInterpretiveFallback({ state, readingRecord });
    return Object.freeze({
      state: {
        ...state,
        semanticConfig: config,
      },
      migrated: true,
      source: 'READING_RECORD_SEMANTIC_PROJECTION',
      migrationNotes: ['active_semantic_config_recovered_from_immutable_reading_record_with_field_aware_legacy_fallback'],
    });
  }

  const migrated = semanticConfigFromLegacyTradition(state.selectedTradition, {
    readingDepth: depthFromTechLevel(state.techLevel),
  });

  return Object.freeze({
    state: {
      ...state,
      semanticConfig: migrated.config,
    },
    migrated: true,
    source: `LEGACY_TRADITION:${migrated.legacyTraditionId}`,
    migrationNotes: [...migrated.migrationNotes],
  });
};

export const readingRecordWasPreserved = (before, after) => (
  before?.reading?.readingRecord === after?.reading?.readingRecord
  || JSON.stringify(before?.reading?.readingRecord ?? null) === JSON.stringify(after?.reading?.readingRecord ?? null)
);
