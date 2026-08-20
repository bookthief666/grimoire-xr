export const PINNED_TAROT_AUTHORITY = Object.freeze({
  contractId: 'grimoire.tarot.semantic.v1',
  contractVersion: '1.0.0',
  authorityRepository: 'bookthief666/tarot-archetype-vr',
  authorityCommit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
});

const canonicalize = value => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, canonicalize(value[key])]),
  );
};

export const extractParityCore = snapshot => snapshot?.parityCore || snapshot;

export const validateAuthorityParityCore = snapshot => {
  const core = extractParityCore(snapshot);
  const errors = [];
  if (!core || typeof core !== 'object') return ['authority snapshot must be an object'];
  const contract = core.contract || {};
  Object.entries(PINNED_TAROT_AUTHORITY).forEach(([key, expected]) => {
    if (contract[key] !== expected) errors.push(`${key} must equal ${expected}; found ${String(contract[key])}`);
  });
  if (!Array.isArray(core.cards)) errors.push('authority snapshot cards must be an array');
  else {
    if (core.cards.length !== 78) errors.push(`authority snapshot must contain 78 cards; found ${core.cards.length}`);
    const ids = new Set();
    core.cards.forEach((card, index) => {
      if (card?.legacyIndex !== index) errors.push(`legacy index drift at ${index}:${String(card?.cardId)}`);
      if (!card?.cardId) errors.push(`card ${index} has no cardId`);
      if (ids.has(card?.cardId)) errors.push(`duplicate cardId ${String(card?.cardId)}`);
      ids.add(card?.cardId);
      if (card?.thoth?.expressionCoverage !== 'FULL') errors.push(`Thoth expression coverage not FULL: ${String(card?.cardId)}`);
    });
  }
  const serializedCards = JSON.stringify(core.cards || []);
  ['imageUrl', 'ComfyUI', 'camera', 'enchantment'].forEach(forbidden => {
    if (serializedCards.includes(forbidden)) errors.push(`authority card artifact contains forbidden presentation field: ${forbidden}`);
  });
  return errors;
};

export const summarizeAuthorityParityCore = snapshot => {
  const core = extractParityCore(snapshot);
  const fields = (core?.cards || []).flatMap(card => [
    ...Object.values(card?.thoth?.fields || {}),
    ...Object.values(card?.thoth?.correspondences || {}),
  ]);
  const fieldsWithClaims = fields.filter(field => Array.isArray(field?.claimIds) && field.claimIds.length).length;
  return Object.freeze({
    cards: core?.cards?.length || 0,
    totalSourceFields: fields.length,
    fieldsWithClaims,
    fieldsWithoutClaims: fields.length - fieldsWithClaims,
  });
};

export const renderAuthorityCardManifestModule = snapshot => {
  const core = extractParityCore(snapshot);
  const errors = validateAuthorityParityCore(core);
  if (errors.length) throw new Error(`Refusing authority artifact generation: ${errors.join('; ')}`);
  const meta = {
    ...PINNED_TAROT_AUTHORITY,
    cardCount: core.cards.length,
    generatedFrom: '0.48 validated VR conformance parity core',
  };
  const cards = canonicalize(core.cards);
  return `// GENERATED FILE — DO NOT HAND EDIT.\n// Source: ${PINNED_TAROT_AUTHORITY.authorityRepository}@${PINNED_TAROT_AUTHORITY.authorityCommit}\n\nconst deepFreeze = value => {\n  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n  Object.values(value).forEach(deepFreeze);\n  return Object.freeze(value);\n};\n\nexport const AUTHORITATIVE_CARD_MANIFEST_META = deepFreeze(${JSON.stringify(meta, null, 2)});\n\nexport const AUTHORITATIVE_CARD_MANIFEST = deepFreeze(${JSON.stringify(cards, null, 2)});\n`;
};
