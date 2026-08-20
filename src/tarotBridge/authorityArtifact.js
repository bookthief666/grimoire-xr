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

const validatePinnedContract = core => {
  const errors = [];
  const contract = core?.contract || {};
  Object.entries(PINNED_TAROT_AUTHORITY).forEach(([key, expected]) => {
    if (contract[key] !== expected) errors.push(`${key} must equal ${expected}; found ${String(contract[key])}`);
  });
  return errors;
};

export const validateAuthorityParityCore = snapshot => {
  const core = extractParityCore(snapshot);
  const errors = [];
  if (!core || typeof core !== 'object') return ['authority snapshot must be an object'];
  errors.push(...validatePinnedContract(core));
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

export const validateAuthoritySpreadManifest = snapshot => {
  const core = extractParityCore(snapshot);
  const errors = [];
  if (!core || typeof core !== 'object') return ['authority snapshot must be an object'];
  errors.push(...validatePinnedContract(core));
  const spreads = core.spreads;
  const expectedKeys = ['TRIAD', 'HEXAGRAM', 'CROSS'];
  if (!spreads || typeof spreads !== 'object' || Array.isArray(spreads)) {
    errors.push('authority snapshot spreads must be an object');
    return errors;
  }
  for (const key of expectedKeys) {
    const spread = spreads[key];
    if (!spread || typeof spread !== 'object') {
      errors.push(`authority snapshot missing spread ${key}`);
      continue;
    }
    if (!spread.spreadId || !spread.version || !spread.semanticStatus) errors.push(`${key} spread identity/version/status incomplete`);
    if (!Number.isInteger(spread.cardCount) || spread.cardCount <= 0) errors.push(`${key} spread cardCount invalid`);
    if (!Array.isArray(spread.positions) || spread.positions.length !== spread.cardCount) {
      errors.push(`${key} spread position count does not match cardCount`);
      continue;
    }
    const positionIds = new Set();
    spread.positions.forEach((position, index) => {
      if (!position?.positionId) errors.push(`${key} position ${index} has no positionId`);
      if (positionIds.has(position?.positionId)) errors.push(`${key} duplicate positionId ${String(position?.positionId)}`);
      positionIds.add(position?.positionId);
      if (position?.ordinal !== index) errors.push(`${key} position ordinal drift at ${index}`);
    });
    for (const topologyKey of ['orderedAdjacency', 'visualEdges']) {
      if (!Array.isArray(spread.topology?.[topologyKey])) errors.push(`${key} topology ${topologyKey} must be an array`);
      else spread.topology[topologyKey].forEach((edge, edgeIndex) => {
        if (!Array.isArray(edge) || edge.length !== 2 || edge.some(positionId => !positionIds.has(positionId))) {
          errors.push(`${key} topology ${topologyKey}[${edgeIndex}] references invalid positions`);
        }
      });
    }
  }
  const extraKeys = Object.keys(spreads).filter(key => !expectedKeys.includes(key));
  if (extraKeys.length) errors.push(`unexpected authority spread keys: ${extraKeys.join(', ')}`);
  const serializedSpreads = JSON.stringify(spreads);
  ['imageUrl', 'promptUsed', 'ComfyUI', 'camera', 'enchantment'].forEach(forbidden => {
    if (serializedSpreads.includes(forbidden)) errors.push(`authority spread artifact contains forbidden presentation field: ${forbidden}`);
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

export const renderAuthoritySpreadManifestModule = snapshot => {
  const core = extractParityCore(snapshot);
  const errors = validateAuthoritySpreadManifest(core);
  if (errors.length) throw new Error(`Refusing spread authority artifact generation: ${errors.join('; ')}`);
  const meta = {
    ...PINNED_TAROT_AUTHORITY,
    spreadKeys: ['TRIAD', 'HEXAGRAM', 'CROSS'],
    generatedFrom: '0.48 validated VR conformance parity core',
  };
  const spreads = Object.fromEntries(['TRIAD', 'HEXAGRAM', 'CROSS'].map(key => [key, canonicalize(core.spreads[key])]));
  return `// GENERATED FILE — DO NOT HAND EDIT.\n// Source: ${PINNED_TAROT_AUTHORITY.authorityRepository}@${PINNED_TAROT_AUTHORITY.authorityCommit}\n\nconst deepFreeze = value => {\n  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;\n  Object.values(value).forEach(deepFreeze);\n  return Object.freeze(value);\n};\n\nexport const AUTHORITATIVE_SPREAD_MANIFEST_META = deepFreeze(${JSON.stringify(meta, null, 2)});\n\nexport const AUTHORITATIVE_SPREAD_MANIFEST = deepFreeze(${JSON.stringify(spreads, null, 2)});\n`;
};
