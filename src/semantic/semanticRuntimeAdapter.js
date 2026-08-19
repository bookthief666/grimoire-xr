import { semanticConfigFromLegacyTradition } from './semanticConfig.js';
import { buildSemanticStateTransition } from './semanticTransition.js';
import { migrateSessionSemanticConfig } from './sessionSemanticMigration.js';

export const READING_DEPTH_TO_TECH_LEVEL = Object.freeze({
  neophyte: 0,
  adept: 1,
  magus: 2,
});

export const TECH_LEVEL_TO_READING_DEPTH = Object.freeze(['neophyte', 'adept', 'magus']);

export const readingDepthFromTechLevel = techLevel => (
  TECH_LEVEL_TO_READING_DEPTH[Number(techLevel)] || 'adept'
);

export const techLevelFromReadingDepth = readingDepth => (
  READING_DEPTH_TO_TECH_LEVEL[String(readingDepth || '').toLowerCase()] ?? 1
);

export const legacySystemTradition = ({ tarotSystem, traditions = [], fallback = null } = {}) => (
  traditions.find(entry => entry?.id === tarotSystem)
  || traditions.find(entry => String(entry?.name || '').toLowerCase().includes(
    tarotSystem === 'rws' ? 'rider' : tarotSystem,
  ))
  || fallback
);

export const createInitialSemanticConfig = ({ selectedTradition, techLevel = 1 } = {}) => (
  semanticConfigFromLegacyTradition(selectedTradition, {
    readingDepth: readingDepthFromTechLevel(techLevel),
  }).config
);

export const applySemanticPatchToAppState = ({ state, patch, traditions = [] } = {}) => {
  const transition = buildSemanticStateTransition({ state, patch });
  const semanticConfig = transition.nextState.semanticConfig;
  return Object.freeze({
    ...transition,
    nextState: {
      ...transition.nextState,
      // Compatibility mirrors only. They are no longer semantic authorities.
      selectedTradition: legacySystemTradition({
        tarotSystem: semanticConfig.tarotSystem,
        traditions,
        fallback: state.selectedTradition,
      }),
      techLevel: techLevelFromReadingDepth(semanticConfig.readingDepth),
    },
  });
};

export const migrateAppStateSemanticConfig = ({ state, traditions = [] } = {}) => {
  const migrated = migrateSessionSemanticConfig(state);
  const semanticConfig = migrated.state.semanticConfig;
  return Object.freeze({
    ...migrated,
    state: {
      ...migrated.state,
      selectedTradition: legacySystemTradition({
        tarotSystem: semanticConfig.tarotSystem,
        traditions,
        fallback: migrated.state.selectedTradition,
      }),
      techLevel: techLevelFromReadingDepth(semanticConfig.readingDepth),
    },
  });
};

export const semanticSystemPresentationName = config => ({
  thoth: 'BOOK OF THOTH',
  rws: 'RIDER–WAITE–SMITH',
  marseille: 'TAROT DE MARSEILLE',
}[config?.tarotSystem] || String(config?.tarotSystem || 'TAROT').toUpperCase());
