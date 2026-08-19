import {
  SEMANTIC_CONFIG_SCHEMA_ID,
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  validateSemanticConfig,
} from './semanticConfig.js';

const depthFromTechLevel = techLevel => ['neophyte', 'adept', 'magus'][Number(techLevel)] || 'adept';

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
