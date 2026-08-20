export const SEMANTIC_CONFIG_SCHEMA_ID = 'grimoire.semantic.config';
export const SEMANTIC_CONFIG_SCHEMA_VERSION = 1;

export const TAROT_SYSTEMS = Object.freeze(['thoth', 'rws', 'marseille']);
export const CORRESPONDENCE_PROFILES = Object.freeze(['thoth_native', 'none']);
export const RELATION_METHODS = Object.freeze(['crowley_lxxviii_dignities', 'disabled']);
export const RELATION_METHOD_COMPATIBILITY = Object.freeze({
  disabled: Object.freeze(['thoth', 'rws', 'marseille']),
  crowley_lxxviii_dignities: Object.freeze(['thoth', 'rws']),
});
export const READING_DEPTHS = Object.freeze(['neophyte', 'adept', 'magus']);
export const RITUAL_THEMES = Object.freeze(['none', 'giordano_bruno', 'astarte_venus']);
export const INTERPRETIVE_LENSES = Object.freeze([
  'hermetic_qabalah',
  'jungian_shadow',
  'enochian',
  'chaos_magick',
  'bertiaux_nightside',
  'alchemical',
  'bruno_mnemonic',
  'astarte_venus_devotional',
  'bataille_eroticism',
  'nietzsche_dionysian',
  'neoplatonic_theurgy',
  'thelemic_hga',
]);

const asId = value => String(value || '').trim().toLowerCase();
export const relationMethodSupportsTarotSystem = (relationMethod, tarotSystem) => (
  RELATION_METHOD_COMPATIBILITY[asId(relationMethod)]?.includes(asId(tarotSystem)) === true
);
const unique = values => [...new Set(values)];
const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

const SYSTEM_DEFAULTS = Object.freeze({
  thoth: Object.freeze({
    tarotSystem: 'thoth',
    correspondenceProfile: 'thoth_native',
    relationMethod: 'crowley_lxxviii_dignities',
  }),
  rws: Object.freeze({
    tarotSystem: 'rws',
    correspondenceProfile: 'none',
    relationMethod: 'disabled',
  }),
  marseille: Object.freeze({
    tarotSystem: 'marseille',
    correspondenceProfile: 'none',
    relationMethod: 'disabled',
  }),
});

const LEGACY_PRESETS = Object.freeze({
  thoth: Object.freeze({ tarotSystem: 'thoth', correspondenceProfile: 'thoth_native', relationMethod: 'crowley_lxxviii_dignities', interpretiveLenses: [], ritualTheme: 'none' }),
  rws: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'crowley_lxxviii_dignities', interpretiveLenses: [], ritualTheme: 'none' }),
  marseille: Object.freeze({ tarotSystem: 'marseille', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: [], ritualTheme: 'none' }),
  hermetic: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'crowley_lxxviii_dignities', interpretiveLenses: ['hermetic_qabalah'], ritualTheme: 'none' }),
  shadow: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['jungian_shadow'], ritualTheme: 'none' }),
  enochian: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['enochian'], ritualTheme: 'none' }),
  chaos: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['chaos_magick'], ritualTheme: 'none' }),
  voudon: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['bertiaux_nightside'], ritualTheme: 'none' }),
  alchemical: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['alchemical'], ritualTheme: 'none' }),
  bruno: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['bruno_mnemonic'], ritualTheme: 'giordano_bruno' }),
  astarte: Object.freeze({ tarotSystem: 'rws', correspondenceProfile: 'none', relationMethod: 'disabled', interpretiveLenses: ['astarte_venus_devotional'], ritualTheme: 'astarte_venus' }),
});

export const normalizeLegacyTraditionId = tradition => {
  const direct = asId(typeof tradition === 'string' ? tradition : tradition?.id);
  if (LEGACY_PRESETS[direct]) return direct;
  const name = asId(tradition?.name);
  if (name.includes('thoth')) return 'thoth';
  if (name.includes('rider') || name.includes('waite')) return 'rws';
  if (name.includes('marseille')) return 'marseille';
  if (name.includes('jung')) return 'shadow';
  if (name.includes('bruno')) return 'bruno';
  if (name.includes('astarte') || name.includes('venus')) return 'astarte';
  return direct || 'thoth';
};

export const validateSemanticConfig = config => {
  const errors = [];
  if (!config || typeof config !== 'object') return ['semantic config must be an object'];
  if (config.schemaId !== SEMANTIC_CONFIG_SCHEMA_ID) errors.push(`schemaId must be ${SEMANTIC_CONFIG_SCHEMA_ID}`);
  if (config.schemaVersion !== SEMANTIC_CONFIG_SCHEMA_VERSION) errors.push(`schemaVersion must be ${SEMANTIC_CONFIG_SCHEMA_VERSION}`);
  if (!TAROT_SYSTEMS.includes(config.tarotSystem)) errors.push(`unsupported tarotSystem: ${String(config.tarotSystem)}`);
  if (!CORRESPONDENCE_PROFILES.includes(config.correspondenceProfile)) errors.push(`unsupported correspondenceProfile: ${String(config.correspondenceProfile)}`);
  if (!RELATION_METHODS.includes(config.relationMethod)) errors.push(`unsupported relationMethod: ${String(config.relationMethod)}`);
  if (RELATION_METHODS.includes(config.relationMethod) && TAROT_SYSTEMS.includes(config.tarotSystem)
    && !relationMethodSupportsTarotSystem(config.relationMethod, config.tarotSystem)) {
    errors.push(`relationMethod ${config.relationMethod} is not compatible with tarotSystem=${config.tarotSystem}`);
  }
  if (!READING_DEPTHS.includes(config.readingDepth)) errors.push(`unsupported readingDepth: ${String(config.readingDepth)}`);
  if (!RITUAL_THEMES.includes(config.ritualTheme)) errors.push(`unsupported ritualTheme: ${String(config.ritualTheme)}`);
  if (!Array.isArray(config.interpretiveLenses)) errors.push('interpretiveLenses must be an array');
  else {
    const invalid = config.interpretiveLenses.filter(lens => !INTERPRETIVE_LENSES.includes(lens));
    if (invalid.length) errors.push(`unsupported interpretiveLenses: ${invalid.join(', ')}`);
    if (new Set(config.interpretiveLenses).size !== config.interpretiveLenses.length) errors.push('interpretiveLenses must be unique');
  }
  if (config.correspondenceProfile === 'thoth_native' && config.tarotSystem !== 'thoth') {
    errors.push('thoth_native correspondenceProfile requires tarotSystem=thoth');
  }
  return errors;
};

const freezeValid = config => {
  const normalized = {
    schemaId: SEMANTIC_CONFIG_SCHEMA_ID,
    schemaVersion: SEMANTIC_CONFIG_SCHEMA_VERSION,
    tarotSystem: asId(config.tarotSystem),
    correspondenceProfile: asId(config.correspondenceProfile),
    relationMethod: asId(config.relationMethod),
    interpretiveLenses: unique((config.interpretiveLenses || []).map(asId).filter(Boolean)),
    ritualTheme: asId(config.ritualTheme || 'none'),
    readingDepth: asId(config.readingDepth || 'adept'),
  };
  const errors = validateSemanticConfig(normalized);
  if (errors.length) throw new Error(`Invalid semantic configuration: ${errors.join('; ')}`);
  return deepFreeze(normalized);
};

export const createSemanticConfig = ({
  tarotSystem = 'thoth',
  correspondenceProfile,
  relationMethod,
  interpretiveLenses = [],
  ritualTheme = 'none',
  readingDepth = 'adept',
} = {}) => {
  const system = asId(tarotSystem) || 'thoth';
  const defaults = SYSTEM_DEFAULTS[system];
  if (!defaults) throw new Error(`Unsupported Tarot system: ${String(tarotSystem)}`);
  return freezeValid({
    ...defaults,
    correspondenceProfile: correspondenceProfile === undefined ? defaults.correspondenceProfile : correspondenceProfile,
    relationMethod: relationMethod === undefined ? defaults.relationMethod : relationMethod,
    interpretiveLenses,
    ritualTheme,
    readingDepth,
  });
};

export const semanticConfigFromLegacyTradition = (tradition, { readingDepth = 'adept' } = {}) => {
  const legacyTraditionId = normalizeLegacyTraditionId(tradition);
  const preset = LEGACY_PRESETS[legacyTraditionId] || LEGACY_PRESETS.thoth;
  const config = createSemanticConfig({ ...preset, readingDepth });
  const notes = [];
  if (legacyTraditionId === 'rws' || legacyTraditionId === 'hermetic') {
    notes.push('legacy_golden_dawn_profile_not_claimed_without_source_pack');
    notes.push('legacy_crowley_relation_method_preserved_explicitly');
  }
  return deepFreeze({ legacyTraditionId, config, migrationNotes: notes });
};

export const updateSemanticConfig = (currentInput, patch = {}) => {
  const current = currentInput?.schemaId === SEMANTIC_CONFIG_SCHEMA_ID
    ? freezeValid(currentInput)
    : semanticConfigFromLegacyTradition(currentInput).config;
  const systemChanged = patch.tarotSystem !== undefined && asId(patch.tarotSystem) !== current.tarotSystem;
  const targetSystem = systemChanged ? asId(patch.tarotSystem) : current.tarotSystem;
  const defaults = SYSTEM_DEFAULTS[targetSystem];
  if (!defaults) throw new Error(`Unsupported Tarot system: ${String(patch.tarotSystem)}`);

  return createSemanticConfig({
    tarotSystem: targetSystem,
    correspondenceProfile: patch.correspondenceProfile !== undefined
      ? patch.correspondenceProfile
      : (systemChanged ? defaults.correspondenceProfile : current.correspondenceProfile),
    relationMethod: patch.relationMethod !== undefined
      ? patch.relationMethod
      : (systemChanged ? defaults.relationMethod : current.relationMethod),
    interpretiveLenses: patch.interpretiveLenses !== undefined ? patch.interpretiveLenses : current.interpretiveLenses,
    ritualTheme: patch.ritualTheme !== undefined ? patch.ritualTheme : current.ritualTheme,
    readingDepth: patch.readingDepth !== undefined ? patch.readingDepth : current.readingDepth,
  });
};

export const getTarotSystemDefaults = tarotSystem => createSemanticConfig({ tarotSystem });
export const LEGACY_SEMANTIC_PRESETS = LEGACY_PRESETS;
