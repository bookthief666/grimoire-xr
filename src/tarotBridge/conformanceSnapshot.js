import {
  CANONICAL_CARD_MANIFEST,
  CANONICAL_READING_ENGINE_VERSION,
  CANONICAL_READING_RECORD_VERSION,
  CANONICAL_SPREAD_MAP,
  CANONICAL_TAROT_BRIDGE_VERSION,
  UPSTREAM_TAROT_CONTRACT,
  buildCanonicalTriadConsultation,
} from './canonicalTarotBridge.js';
import { RELATION_METHODS } from '../semantic/semanticConfig.js';

export const CONFORMANCE_SNAPSHOT_SCHEMA_ID = 'grimoire.tarot.conformance.snapshot';
export const CONFORMANCE_SNAPSHOT_SCHEMA_VERSION = '1.0.0';
export const FOLD_047_FREEZE_COMMIT = 'd6a57e68d08a7c9592d9f299b93eae9192667b28';

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

const sortedUnique = values => [...new Set((values || []).filter(Boolean))].sort();

const canonicalize = value => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .filter(key => value[key] !== undefined)
      .sort()
      .map(key => [key, canonicalize(value[key])]),
  );
};

const normalizeSourceField = field => ({
  value: field?.value ?? null,
  semanticStatus: field?.semanticStatus || 'SOURCE_PACK_PENDING',
  authority: field?.authority || 'NONE',
  sourceIds: sortedUnique(field?.sourceIds),
  claimIds: sortedUnique(field?.claimIds),
});

const normalizeSourceFieldMap = fields => Object.fromEntries(
  Object.keys(fields || {}).sort().map(key => [key, normalizeSourceField(fields[key])]),
);

const normalizeCard = card => ({
  legacyIndex: card.legacyIndex,
  cardId: card.cardId,
  arcana: card.arcana,
  familyId: card.familyId,
  suitFamilyId: card.suitFamilyId || null,
  rankId: card.rankId || null,
  rankClass: card.rankClass || null,
  thoth: {
    expressionCoverage: card.thoth?.expressionCoverage || 'PENDING',
    fallbackUsed: Boolean(card.thoth?.fallbackUsed),
    fields: normalizeSourceFieldMap(card.thoth?.fields),
    correspondences: normalizeSourceFieldMap(card.thoth?.correspondences),
  },
});

const normalizeSpread = spread => ({
  spreadId: spread.spreadId,
  version: spread.version,
  cardCount: spread.cardCount,
  semanticStatus: spread.semanticStatus,
  positions: (spread.positions || []).map(position => ({
    positionId: position.positionId,
    ordinal: position.ordinal,
    label: position.label,
    questionFunction: position.questionFunction ?? null,
  })),
  topology: {
    orderedAdjacency: (spread.topology?.orderedAdjacency || []).map(edge => [...edge]),
    visualEdges: (spread.topology?.visualEdges || []).map(edge => [...edge]),
  },
});

const normalizeRelation = relation => ({
  analysisKind: relation.analysisKind || null,
  semanticAuthority: relation.semanticAuthority || null,
  technicalRole: relation.technicalRole || null,
  fromPositionId: relation.fromPositionId || null,
  toPositionId: relation.toPositionId || null,
  fromCardId: relation.fromCardId || null,
  toCardId: relation.toCardId || null,
  status: relation.status || null,
  relationType: relation.relationType || null,
  reasonCode: relation.reasonCode || null,
  sourceIds: sortedUnique(relation.sourceIds),
  claimIds: sortedUnique(relation.claimIds),
});

const normalizePattern = pattern => ({
  patternKind: pattern.patternKind || null,
  semanticAuthority: pattern.semanticAuthority || null,
  leftPositionId: pattern.leftPositionId || null,
  rightPositionId: pattern.rightPositionId || null,
  targetPositionId: pattern.targetPositionId || null,
  leftCardId: pattern.leftCardId || null,
  rightCardId: pattern.rightCardId || null,
  targetCardId: pattern.targetCardId || null,
  applied: pattern.applied ?? null,
  status: pattern.status || null,
  relationType: pattern.relationType || null,
  reasonCode: pattern.reasonCode || null,
  effectType: pattern.effectType || null,
  effect: pattern.effect || null,
  sourceIds: sortedUnique(pattern.sourceIds),
  claimIds: sortedUnique(pattern.claimIds),
});

const normalizeProvenance = provenance => ({
  sourceIds: sortedUnique(provenance?.sourceIds),
  claimIds: sortedUnique(provenance?.claimIds),
  unresolvedReasonCodes: sortedUnique(provenance?.unresolvedReasonCodes),
  relationMethodAuthority: provenance?.relationMethodAuthority || null,
});

export const CONFORMANCE_FIXTURE_DEFINITIONS = deepFreeze({
  'thoth-three-aces': {
    question: 'What relation is present?',
    legacyIndexes: [22, 50, 36],
    expectedCardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
    expectedImmediateRelations: ['FRIENDLY', 'FRIENDLY'],
    expectedImmediateReasonCodes: [null, null],
    expectedOuterRelation: 'INIMICAL',
    expectedCenterContextEffect: 'CENTER_BETWEEN_CONTRARIES',
  },
  'thoth-major-gap': {
    question: 'What remains source-qualified when a Major is present?',
    legacyIndexes: [22, 3, 36],
    expectedCardIds: ['minor.staffs.ace', 'major.empress', 'minor.cups.ace'],
    expectedImmediateRelations: ['UNSPECIFIED', 'UNSPECIFIED'],
    expectedImmediateReasonCodes: ['CARD_WITHOUT_SUIT_FAMILY', 'CARD_WITHOUT_SUIT_FAMILY'],
    expectedOuterRelation: 'INIMICAL',
    expectedCenterContextEffect: 'CENTER_BETWEEN_CONTRARIES',
  },
});

export const buildFoldConformanceFixture = fixtureId => {
  const fixture = CONFORMANCE_FIXTURE_DEFINITIONS[fixtureId];
  if (!fixture) throw new Error(`Unknown 0.48 conformance fixture: ${fixtureId}`);
  const record = buildCanonicalTriadConsultation({
    readingId: `conformance:${fixtureId}`,
    question: fixture.question,
    legacyIndexes: [...fixture.legacyIndexes],
    tradition: { id: 'thoth' },
    readingDepth: 'adept',
  });
  return deepFreeze(canonicalize({
    fixtureId,
    legacyIndexes: [...fixture.legacyIndexes],
    cardIds: [...record.input.cardIds],
    input: {
      spreadId: record.input.spreadId,
      tarotSystem: record.input.tarotSystem,
      correspondenceProfile: record.input.correspondenceProfile,
      relationMethod: record.input.relationMethod,
    },
    relations: record.relations.map(normalizeRelation),
    spreadPatterns: record.spreadPatterns.map(normalizePattern),
    provenance: normalizeProvenance(record.provenance),
  }));
};

export const buildFoldConformanceParityCore = () => deepFreeze(canonicalize({
  contract: {
    contractId: UPSTREAM_TAROT_CONTRACT.contractId,
    contractVersion: UPSTREAM_TAROT_CONTRACT.contractVersion,
    authorityRepository: UPSTREAM_TAROT_CONTRACT.repository,
    authorityCommit: UPSTREAM_TAROT_CONTRACT.commit,
  },
  relationMethodIds: sortedUnique(RELATION_METHODS),
  cards: CANONICAL_CARD_MANIFEST.map(normalizeCard),
  spreads: Object.fromEntries(['TRIAD', 'HEXAGRAM', 'CROSS'].map(legacyId => (
    [legacyId, normalizeSpread(CANONICAL_SPREAD_MAP[legacyId])]
  ))),
  fixtures: Object.fromEntries(Object.keys(CONFORMANCE_FIXTURE_DEFINITIONS).sort().map(fixtureId => (
    [fixtureId, buildFoldConformanceFixture(fixtureId)]
  ))),
}));

export const buildFoldConformanceSnapshot = () => deepFreeze(canonicalize({
  snapshotSchemaId: CONFORMANCE_SNAPSHOT_SCHEMA_ID,
  snapshotSchemaVersion: CONFORMANCE_SNAPSHOT_SCHEMA_VERSION,
  producer: {
    clientId: 'grimoire-fold-2d',
    repository: 'bookthief666/grimoire-xr',
    baselineCommit: FOLD_047_FREEZE_COMMIT,
    componentVersions: {
      canonicalTarotBridge: CANONICAL_TAROT_BRIDGE_VERSION,
      readingRecord: CANONICAL_READING_RECORD_VERSION,
      readingEngine: CANONICAL_READING_ENGINE_VERSION,
    },
  },
  parityCore: buildFoldConformanceParityCore(),
}));

export const stringifyConformanceValue = value => JSON.stringify(canonicalize(value), null, 2);
export const stringifyFoldConformanceSnapshot = ({ coreOnly = false } = {}) => (
  stringifyConformanceValue(coreOnly ? buildFoldConformanceParityCore() : buildFoldConformanceSnapshot())
);

export const countFoldSourceClaimCoverage = () => {
  let totalFields = 0;
  let fieldsWithClaims = 0;
  CANONICAL_CARD_MANIFEST.forEach(card => {
    [...Object.values(card.thoth?.fields || {}), ...Object.values(card.thoth?.correspondences || {})].forEach(field => {
      totalFields += 1;
      if ((field?.claimIds || []).length) fieldsWithClaims += 1;
    });
  });
  return deepFreeze({ totalFields, fieldsWithClaims, fieldsWithoutClaims: totalFields - fieldsWithClaims });
};

export const validateFoldConformanceSnapshot = () => {
  const errors = [];
  const core = buildFoldConformanceParityCore();
  if (core.contract.authorityCommit !== 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea') {
    errors.push(`authoritative VR contract pin drifted: ${core.contract.authorityCommit}`);
  }
  if (core.cards.length !== 78) errors.push(`expected 78 cards, found ${core.cards.length}`);
  if (new Set(core.cards.map(card => card.cardId)).size !== 78) errors.push('canonical card IDs are not unique');
  core.cards.forEach((card, index) => {
    if (card.legacyIndex !== index) errors.push(`legacy index drift at ${index}:${card.cardId}`);
    if (card.thoth.expressionCoverage !== 'FULL') errors.push(`Thoth expression coverage not FULL: ${card.cardId}`);
  });
  if (core.relationMethodIds.includes('thoth_native')) errors.push('thoth_native relation algorithm must not exist');

  Object.entries(CONFORMANCE_FIXTURE_DEFINITIONS).forEach(([fixtureId, expected]) => {
    const actual = core.fixtures[fixtureId];
    if (JSON.stringify(actual.cardIds) !== JSON.stringify(expected.expectedCardIds)) errors.push(`${fixtureId}: card IDs drifted`);
    if (JSON.stringify(actual.relations.map(relation => relation.relationType)) !== JSON.stringify(expected.expectedImmediateRelations)) {
      errors.push(`${fixtureId}: immediate relation types drifted`);
    }
    if (JSON.stringify(actual.relations.map(relation => relation.reasonCode)) !== JSON.stringify(expected.expectedImmediateReasonCodes)) {
      errors.push(`${fixtureId}: immediate reason codes drifted`);
    }
    const outer = actual.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT');
    const center = actual.spreadPatterns.find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT');
    if (outer?.relationType !== expected.expectedOuterRelation) errors.push(`${fixtureId}: outer relation drifted`);
    if (center?.effectType !== expected.expectedCenterContextEffect) errors.push(`${fixtureId}: center context drifted`);
  });

  return errors;
};
