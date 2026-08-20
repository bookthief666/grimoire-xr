import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';
import { AUTHORITATIVE_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST_META } from './authoritativeCardManifest.generated.js';

export const UPSTREAM_TAROT_CONTRACT = Object.freeze({
  repository: 'bookthief666/tarot-archetype-vr',
  branch: 'feature/0.35-cross-client-semantic-contract',
  commit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
  contractId: 'grimoire.tarot.semantic.v1',
  contractVersion: '1.0.0',
});

export const CANONICAL_TAROT_BRIDGE_VERSION = '0.35.0';
export const CANONICAL_READING_RECORD_VERSION = '0.1.0';
export const CANONICAL_READING_ENGINE_VERSION = 'canonical-tarot-0.34.5';
export const CANONICAL_TRIAD_BINDING_VERSION = '0.2.0';
export const CANONICAL_TRIAD_RELATION_VERSION = '0.1.0';
export const CANONICAL_DIGNITY_KERNEL_VERSION = '0.1.0';
export const CANONICAL_LXXVIII_PACK_VERSION = '0.1.0';

const THOTH_BOOK_SOURCE = 'src.primary.crowley.book-of-thoth.1944';
const LXXVIII_SOURCE = 'src.primary.crowley.liber-lxxviii';
const THOTH_METHOD_CLAIM = 'claim.thoth1944.divination.method-source.equinox-i-8';
const ADJACENCY_CLAIM = 'claim.l78.dignity.adjacency';
const SAME_SUIT_CLAIM = 'claim.l78.dignity.same-suit-strengthens';
const CENTER_CONTRARIES_CLAIM = 'claim.l78.dignity.center-between-contraries';

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

const unique = values => [...new Set(values.filter(Boolean))];


if (
  AUTHORITATIVE_CARD_MANIFEST_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId
  || AUTHORITATIVE_CARD_MANIFEST_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion
  || AUTHORITATIVE_CARD_MANIFEST_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository
  || AUTHORITATIVE_CARD_MANIFEST_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit
) {
  throw new Error('Authoritative Tarot card manifest does not match the pinned upstream contract.');
}

// 0.48 Phase B: source-qualified card doctrine is generated from the exact
// authoritative VR contract snapshot. The legacy local builder remains only
// as temporary rollback material until parity is frozen and de-duplication proceeds.
export const CANONICAL_CARD_MANIFEST = deepFreeze(AUTHORITATIVE_CARD_MANIFEST);

const CARD_BY_ID = new Map(CANONICAL_CARD_MANIFEST.map(card => [card.cardId, card]));

export const canonicalCardIdFromLegacyIndex = legacyIndex => (
  Number.isInteger(legacyIndex) && legacyIndex >= 0 && legacyIndex < CANONICAL_CARD_MANIFEST.length
    ? CANONICAL_CARD_MANIFEST[legacyIndex].cardId
    : null
);

export const legacyIndexFromCanonicalCardId = cardId => CARD_BY_ID.get(String(cardId || ''))?.legacyIndex ?? null;

export const getCanonicalCardDescriptor = cardIdOrLegacyIndex => (
  Number.isInteger(cardIdOrLegacyIndex)
    ? CANONICAL_CARD_MANIFEST[cardIdOrLegacyIndex] || null
    : CARD_BY_ID.get(String(cardIdOrLegacyIndex || '')) || null
);

const TRADITION_CONFIGS = deepFreeze({
  thoth: { tarotSystem: 'thoth', correspondenceProfile: 'thoth_native', relationMethod: 'crowley_lxxviii_dignities', lenses: [], ritualTheme: 'none' },
  rws: { tarotSystem: 'rws', correspondenceProfile: 'golden_dawn', relationMethod: 'crowley_lxxviii_dignities', lenses: [], ritualTheme: 'none' },
  marseille: { tarotSystem: 'marseille', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: [], ritualTheme: 'none' },
  hermetic: { tarotSystem: 'rws', correspondenceProfile: 'golden_dawn', relationMethod: 'crowley_lxxviii_dignities', lenses: [], ritualTheme: 'none' },
  shadow: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['jungian_shadow'], ritualTheme: 'none' },
  enochian: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['enochian'], ritualTheme: 'none' },
  chaos: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['chaos_magick'], ritualTheme: 'none' },
  voudon: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['bertiaux_nightside'], ritualTheme: 'none' },
  alchemical: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['alchemical'], ritualTheme: 'none' },
  bruno: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['bruno_mnemonic'], ritualTheme: 'giordano_bruno' },
  astarte: { tarotSystem: 'rws', correspondenceProfile: 'disabled', relationMethod: 'disabled', lenses: ['astarte_venus_devotional'], ritualTheme: 'astarte_venus' },
});

const normalizeTraditionId = tradition => {
  const direct = String(tradition?.id || tradition || '').trim().toLowerCase();
  if (TRADITION_CONFIGS[direct]) return direct;
  const name = String(tradition?.name || '').trim().toLowerCase();
  if (name.includes('thoth')) return 'thoth';
  if (name.includes('rider') || name.includes('waite')) return 'rws';
  if (name.includes('marseille')) return 'marseille';
  return direct;
};

export const getCanonicalInterpretationConfig = ({ tradition, semanticConfig, readingDepth } = {}) => {
  const resolved = resolveSemanticBridgeConfig({ semanticConfig, tradition, readingDepth });
  return deepFreeze({
    legacyTraditionId: semanticConfig ? null : (normalizeTraditionId(tradition) || null),
    tarotSystem: resolved.tarotSystem,
    correspondenceProfile: resolved.correspondenceProfile,
    relationMethod: resolved.relationMethod,
    lenses: [...resolved.interpretiveLenses],
    ritualTheme: resolved.ritualTheme,
    readingDepth: resolved.readingDepth,
  });
};

export const CANONICAL_SPREAD_MAP = deepFreeze({
  TRIAD: {
    spreadId: 'grimoire.triad.dialectic',
    version: '1.0.0',
    cardCount: 3,
    semanticStatus: 'CANONICAL_PROJECT',
    positions: [
      { positionId: 'thesis', ordinal: 0, label: 'THESIS', questionFunction: 'the first articulated force or proposition in the question' },
      { positionId: 'antithesis', ordinal: 1, label: 'ANTITHESIS', questionFunction: 'the force that resists, complicates, or qualifies the first' },
      { positionId: 'synthesis', ordinal: 2, label: 'SYNTHESIS', questionFunction: 'what becomes visible when the first two are read in relation' },
    ],
    topology: {
      orderedAdjacency: [['thesis', 'antithesis'], ['antithesis', 'synthesis']],
      visualEdges: [['thesis', 'antithesis'], ['thesis', 'synthesis'], ['antithesis', 'synthesis']],
    },
  },
  HEXAGRAM: {
    spreadId: 'legacy.hexagram.v031',
    version: '0.31.0',
    cardCount: 6,
    semanticStatus: 'PROVISIONAL',
    positions: Array.from({ length: 6 }, (_, index) => ({
      positionId: `p${index + 1}`, ordinal: index, label: `POSITION ${index + 1}`, questionFunction: null,
    })),
    topology: { orderedAdjacency: [], visualEdges: [] },
  },
  CROSS: {
    spreadId: 'legacy.cross.v031',
    version: '0.31.0',
    cardCount: 10,
    semanticStatus: 'PROVISIONAL',
    positions: Array.from({ length: 10 }, (_, index) => ({
      positionId: `p${index + 1}`, ordinal: index, label: `POSITION ${index + 1}`, questionFunction: null,
    })),
    topology: { orderedAdjacency: [], visualEdges: [] },
  },
});

const relationKey = (left, right) => [left, right].sort().join('|');
const EXPLICIT_RELATIONS = new Map([
  [relationKey('staffs', 'cups'), ['INIMICAL', 'claim.l78.dignity.inimical.staffs-cups']],
  [relationKey('swords', 'coins'), ['INIMICAL', 'claim.l78.dignity.inimical.swords-coins']],
  [relationKey('swords', 'cups'), ['FRIENDLY', 'claim.l78.dignity.friendly.swords-cups']],
  [relationKey('swords', 'staffs'), ['FRIENDLY', 'claim.l78.dignity.friendly.swords-staffs']],
  [relationKey('staffs', 'coins'), ['FRIENDLY', 'claim.l78.dignity.friendly.staffs-coins']],
]);

const analyzePair = (leftCard, rightCard, context = 'IMMEDIATE_NEIGHBOR') => {
  if (!leftCard.suitFamilyId || !rightCard.suitFamilyId) {
    return deepFreeze({
      status: 'UNSPECIFIED', relationType: 'UNSPECIFIED', reasonCode: 'CARD_WITHOUT_SUIT_FAMILY',
      sourceIds: [], claimIds: [],
    });
  }
  if (leftCard.suitFamilyId === rightCard.suitFamilyId) {
    return deepFreeze({
      status: 'SUPPORTED', relationType: 'SAME_SUIT_STRONG', reasonCode: null,
      sourceIds: [LXXVIII_SOURCE],
      claimIds: context === 'IMMEDIATE_NEIGHBOR' ? [ADJACENCY_CLAIM, SAME_SUIT_CLAIM] : [SAME_SUIT_CLAIM],
    });
  }
  const explicit = EXPLICIT_RELATIONS.get(relationKey(leftCard.suitFamilyId, rightCard.suitFamilyId));
  if (explicit) {
    return deepFreeze({
      status: 'SUPPORTED', relationType: explicit[0], reasonCode: null,
      sourceIds: [LXXVIII_SOURCE],
      claimIds: context === 'IMMEDIATE_NEIGHBOR' ? [ADJACENCY_CLAIM, explicit[1]] : [explicit[1]],
    });
  }
  return deepFreeze({
    status: 'UNSPECIFIED', relationType: 'UNSPECIFIED', reasonCode: 'SOURCE_DOES_NOT_SPECIFY_PAIR',
    sourceIds: [LXXVIII_SOURCE], claimIds: [],
  });
};

const technicalRelation = ({ fact, from, to, ordinal }) => deepFreeze({
  relationId: `relation.dignity.${from.positionId}.${to.positionId}`,
  analysisKind: 'ELEMENTAL_DIGNITY',
  semanticAuthority: 'SOURCE_QUALIFIED_TECHNICAL_RELATION',
  technicalRole: 'IMMEDIATE_NEIGHBOR_DIGNITY',
  ordinal,
  fromPositionId: from.positionId,
  toPositionId: to.positionId,
  fromCardId: from.cardId,
  toCardId: to.cardId,
  fromOrientation: from.orientation,
  toOrientation: to.orientation,
  status: fact.status,
  relationType: fact.relationType,
  reasonCode: fact.reasonCode,
  sourceIds: fact.sourceIds,
  claimIds: fact.claimIds,
  kernelVersion: CANONICAL_DIGNITY_KERNEL_VERSION,
  sourcePackVersion: CANONICAL_LXXVIII_PACK_VERSION,
});

export const buildCanonicalTriadConsultation = ({
  readingId,
  question,
  legacyIndexes,
  tradition,
  semanticConfig,
  readingDepth,
  orientations = [],
} = {}) => {
  if (!Array.isArray(legacyIndexes) || legacyIndexes.length !== 3) {
    throw new Error('Canonical TRIAD consultation requires exactly three legacy card indexes.');
  }
  const cards = legacyIndexes.map(index => {
    const card = getCanonicalCardDescriptor(index);
    if (!card) throw new Error(`Unknown Tarot legacy index: ${index}`);
    return card;
  });
  const interpretation = getCanonicalInterpretationConfig({ tradition, semanticConfig, readingDepth });
  const spread = CANONICAL_SPREAD_MAP.TRIAD;
  const normalizedQuestion = String(question || '').replace(/\s+/g, ' ').trim();
  const normalizedOrientations = cards.map((_, index) => ['upright', 'reversed'].includes(orientations[index]) ? orientations[index] : 'upright');
  const positions = spread.positions.map((position, index) => deepFreeze({
    positionId: position.positionId,
    ordinal: index,
    label: position.label,
    questionFunction: position.questionFunction,
    cardId: cards[index].cardId,
    orientation: normalizedOrientations[index],
  }));

  const baseRecord = {
    recordVersion: CANONICAL_READING_RECORD_VERSION,
    readingId: String(readingId || `grimoire-2d-triad:${cards.map(card => card.cardId).join(':')}`),
    engineVersion: CANONICAL_READING_ENGINE_VERSION,
    knowledgePackVersion: 'canonical-triad-base@0.1.0',
    spreadVersion: `${spread.spreadId}@${spread.version}`,
    relationRuleVersions: [`triad-reading-binding@${CANONICAL_TRIAD_BINDING_VERSION}`],
    input: {
      question: normalizedQuestion,
      cardIds: cards.map(card => card.cardId),
      orientations: normalizedOrientations,
      spreadId: spread.spreadId,
      tarotSystem: interpretation.tarotSystem,
      correspondenceProfile: interpretation.correspondenceProfile,
      relationMethod: interpretation.relationMethod,
      lenses: [...interpretation.lenses],
      readingDepth: interpretation.readingDepth,
    },
    positions,
    cardAnalyses: [],
    relations: [],
    spreadPatterns: [],
    synthesisPlan: null,
    reading: { summary: '', body: '', reflection: '' },
    provenance: { sourceIds: [], claimIds: [], unresolvedReasonCodes: [], relationMethodAuthority: 'DISABLED' },
    generation: null,
    presentationContext: { ritualTheme: interpretation.ritualTheme },
  };

  if (interpretation.relationMethod === 'disabled') return deepFreeze(baseRecord);
  if (interpretation.relationMethod !== 'crowley_lxxviii_dignities') {
    throw new Error(`Unsupported canonical relation method: ${interpretation.relationMethod}`);
  }

  const leftCenter = analyzePair(cards[0], cards[1], 'IMMEDIATE_NEIGHBOR');
  const centerRight = analyzePair(cards[1], cards[2], 'IMMEDIATE_NEIGHBOR');
  const outer = analyzePair(cards[0], cards[2], 'OUTER_PAIR_CONTEXT');
  const relations = [
    technicalRelation({ fact: leftCenter, from: positions[0], to: positions[1], ordinal: 0 }),
    technicalRelation({ fact: centerRight, from: positions[1], to: positions[2], ordinal: 1 }),
  ];
  const outerPattern = deepFreeze({
    patternId: 'outer-context.thesis.synthesis',
    patternKind: 'OUTER_PAIR_CONTEXT',
    semanticAuthority: 'CONTEXTUAL_SUIT_RELATION_NOT_ADJACENCY',
    leftPositionId: 'thesis', rightPositionId: 'synthesis',
    leftCardId: cards[0].cardId, rightCardId: cards[2].cardId,
    status: outer.status, relationType: outer.relationType, reasonCode: outer.reasonCode,
    sourceIds: outer.sourceIds, claimIds: outer.claimIds,
  });
  const centerApplied = outer.relationType === 'INIMICAL';
  const centerPattern = deepFreeze({
    patternId: 'center-context.antithesis',
    patternKind: 'CENTER_CONTEXT_EFFECT',
    semanticAuthority: centerApplied ? 'SOURCE_QUALIFIED_CONTEXT_EFFECT' : 'NO_SUPPORTED_CONTEXT_EFFECT',
    targetPositionId: 'antithesis', targetCardId: cards[1].cardId,
    applied: centerApplied,
    status: centerApplied ? 'SUPPORTED' : 'UNSPECIFIED',
    effectType: centerApplied ? 'CENTER_BETWEEN_CONTRARIES' : null,
    effect: centerApplied ? 'CENTER_NOT_MUCH_AFFECTED_BY_EITHER_NEIGHBOR' : null,
    reasonCode: centerApplied ? null : (outer.reasonCode || 'OUTER_NEIGHBORS_NOT_SOURCE_CLASSIFIED_AS_CONTRARY'),
    sourceIds: outer.sourceIds,
    claimIds: centerApplied ? unique([...outer.claimIds, CENTER_CONTRARIES_CLAIM]) : [],
  });
  const supportingClaims = unique([
    ...relations.flatMap(relation => relation.status === 'SUPPORTED' ? relation.claimIds : []),
    ...(centerApplied ? centerPattern.claimIds : []),
  ]);
  const unresolvedReasonCodes = unique([
    ...relations.map(relation => relation.status === 'UNSPECIFIED' ? relation.reasonCode : null),
    outer.status === 'UNSPECIFIED' ? outer.reasonCode : null,
    !centerApplied ? centerPattern.reasonCode : null,
  ]);
  const thothSelection = interpretation.tarotSystem === 'thoth';

  return deepFreeze({
    ...baseRecord,
    knowledgePackVersion: `liber-lxxviii-dignity@${CANONICAL_LXXVIII_PACK_VERSION}`,
    relationRuleVersions: [
      `triad-reading-binding@${CANONICAL_TRIAD_BINDING_VERSION}`,
      `triad-relation-analysis@${CANONICAL_TRIAD_RELATION_VERSION}`,
      `dignity-kernel@${CANONICAL_DIGNITY_KERNEL_VERSION}`,
      `liber-lxxviii-dignity-pack@${CANONICAL_LXXVIII_PACK_VERSION}`,
    ],
    relations,
    spreadPatterns: [outerPattern, centerPattern],
    provenance: {
      sourceIds: thothSelection ? [LXXVIII_SOURCE, THOTH_BOOK_SOURCE] : [LXXVIII_SOURCE],
      claimIds: unique([...supportingClaims, ...(thothSelection ? [THOTH_METHOD_CLAIM] : [])]),
      unresolvedReasonCodes,
      relationMethodAuthority: thothSelection ? 'SOURCE_QUALIFIED_METHOD_INHERITANCE' : 'DIRECT_METHOD_SELECTION',
    },
  });
};

export const getCanonicalCardPromptContext = ({ card, tradition, semanticConfig } = {}) => {
  const legacyIndex = Number.isInteger(card?.id) ? card.id : legacyIndexFromCanonicalCardId(card?.canonicalCardId);
  const descriptor = getCanonicalCardDescriptor(legacyIndex);
  if (!descriptor) return null;
  const interpretation = getCanonicalInterpretationConfig({ tradition, semanticConfig });
  const thothActive = interpretation.tarotSystem === 'thoth';
  return deepFreeze({
    contractId: UPSTREAM_TAROT_CONTRACT.contractId,
    contractVersion: UPSTREAM_TAROT_CONTRACT.contractVersion,
    legacyIndex: descriptor.legacyIndex,
    cardId: descriptor.cardId,
    tarotSystem: interpretation.tarotSystem,
    generatedManifestationName: String(card?.name || ''),
    canonicalExpression: thothActive ? descriptor.thoth.fields : null,
    canonicalCorrespondences: thothActive ? descriptor.thoth.correspondences : null,
    sourceQualification: thothActive ? 'SOURCE_QUALIFIED' : 'SOURCE_PACK_PENDING',
  });
};

export const buildCanonicalOraclePromptPayload = ({ record, cards } = {}) => {
  if (!record || !Array.isArray(cards) || cards.length !== 3) throw new Error('Oracle prompt payload requires a canonical TRIAD record and three cards.');
  const recordSemanticConfig = semanticBridgeConfigFromReadingRecord(record);
  return deepFreeze({
    contract: UPSTREAM_TAROT_CONTRACT,
    reading: {
      readingId: record.readingId,
      question: record.input.question,
      spreadId: record.input.spreadId,
      tarotSystem: record.input.tarotSystem,
      correspondenceProfile: record.input.correspondenceProfile,
      relationMethod: record.input.relationMethod,
      lenses: [...(record.input.lenses || [])],
      readingDepth: record.input.readingDepth || 'adept',
      ritualTheme: record.presentationContext?.ritualTheme || 'none',
      positions: record.positions.map((position, index) => ({
        ...position,
        manifestationName: String(cards[index]?.name || ''),
        canonicalCard: getCanonicalCardPromptContext({ card: cards[index], semanticConfig: recordSemanticConfig }),
      })),
      relations: record.relations,
      spreadPatterns: record.spreadPatterns,
      provenance: record.provenance,
    },
  });
};

export const chooseOracleCards = ({ deck = [], activeSpread = 'TRIAD', spreadSlots = [], random = Math.random } = {}) => {
  if (String(activeSpread).toUpperCase() === 'TRIAD'
    && Array.isArray(spreadSlots)
    && spreadSlots.length === 3
    && spreadSlots.every(Number.isInteger)) {
    const byId = new Map(deck.map(card => [card.id, card]));
    const selected = spreadSlots.map(id => byId.get(id) || null);
    if (selected.every(Boolean)) return Object.freeze({ cards: Object.freeze([...selected]), source: 'BOUND_TRIAD_CLOTH' });
  }
  const pool = [...deck];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return Object.freeze({ cards: Object.freeze(pool.slice(0, 3)), source: 'RANDOM_TRIAD_FALLBACK' });
};

export const validateCanonicalTarotBridge = () => {
  const errors = [];
  if (CANONICAL_CARD_MANIFEST.length !== 78) errors.push('canonical card manifest must contain 78 records');
  CANONICAL_CARD_MANIFEST.forEach((card, index) => {
    if (card.legacyIndex !== index) errors.push(`legacy index drift at ${index}`);
    if (canonicalCardIdFromLegacyIndex(index) !== card.cardId) errors.push(`canonical mapping drift at ${index}`);
    if (legacyIndexFromCanonicalCardId(card.cardId) !== index) errors.push(`reverse mapping drift at ${card.cardId}`);
    if (card.thoth.expressionCoverage !== 'FULL') errors.push(`Thoth expression not FULL: ${card.cardId}`);
  });
  if (new Set(CANONICAL_CARD_MANIFEST.map(card => card.cardId)).size !== 78) errors.push('canonical card ids are not unique');
  if (Object.values(TRADITION_CONFIGS).some(config => config.relationMethod === 'thoth_native')) errors.push('thoth_native relation method must not exist');
  return errors;
};
