import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';
import { relationMethodSupportsTarotSystem } from '../semantic/semanticConfig.js';
import { AUTHORITATIVE_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST_META } from './authoritativeCardManifest.generated.js';
import { AUTHORITATIVE_RELATION_AUTHORITY, AUTHORITATIVE_RELATION_AUTHORITY_META } from './authoritativeRelationAuthority.generated.js';
import { AUTHORITATIVE_SPREAD_MANIFEST, AUTHORITATIVE_SPREAD_MANIFEST_META } from './authoritativeSpreadManifest.generated.js';

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
export const CANONICAL_DIGNITY_KERNEL_VERSION = AUTHORITATIVE_RELATION_AUTHORITY_META.kernelVersion;
export const CANONICAL_LXXVIII_PACK_VERSION = AUTHORITATIVE_RELATION_AUTHORITY_META.sourcePackVersion;


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

if (
  AUTHORITATIVE_RELATION_AUTHORITY_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId
  || AUTHORITATIVE_RELATION_AUTHORITY_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion
  || AUTHORITATIVE_RELATION_AUTHORITY_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository
  || AUTHORITATIVE_RELATION_AUTHORITY_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit
) {
  throw new Error('Authoritative Tarot relation authority does not match the pinned upstream contract.');
}

if (
  AUTHORITATIVE_SPREAD_MANIFEST_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId
  || AUTHORITATIVE_SPREAD_MANIFEST_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion
  || AUTHORITATIVE_SPREAD_MANIFEST_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository
  || AUTHORITATIVE_SPREAD_MANIFEST_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit
) {
  throw new Error('Authoritative Tarot spread manifest does not match the pinned upstream contract.');
}

// 0.48: source-qualified card doctrine is generated from the exact pinned VR contract.
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

const normalizeTraditionId = tradition => {
  const direct = String(tradition?.id || tradition || '').trim().toLowerCase();
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

export const CANONICAL_SPREAD_MAP = deepFreeze(AUTHORITATIVE_SPREAD_MANIFEST);

const relationFamilyOf = card => card?.suitFamilyId || 'major';
const relationPairAuthority = (leftCard, rightCard, context = 'IMMEDIATE_NEIGHBOR') => {
  const key = `${context}:${relationFamilyOf(leftCard)}>${relationFamilyOf(rightCard)}`;
  const fact = AUTHORITATIVE_RELATION_AUTHORITY.pairFacts[key];
  if (!fact) throw new Error(`Missing authoritative relation pair fact: ${key}`);
  return deepFreeze({ ...fact, sourceIds: [...fact.sourceIds], claimIds: [...fact.claimIds] });
};
const centerContextAuthority = (leftCard, rightCard) => {
  const key = `${relationFamilyOf(leftCard)}>${relationFamilyOf(rightCard)}`;
  const rule = AUTHORITATIVE_RELATION_AUTHORITY.centerRules[key];
  if (!rule) throw new Error(`Missing authoritative center-context rule: ${key}`);
  return deepFreeze({ ...rule, sourceIds: [...rule.sourceIds], claimIds: [...rule.claimIds] });
};
const relationMethodSelectionAuthority = tarotSystem => {
  const selection = AUTHORITATIVE_RELATION_AUTHORITY.relationMethod.selection[String(tarotSystem || '')];
  if (!selection?.supported) throw new Error(`No authoritative relation-method selection for Tarot system ${tarotSystem}`);
  return deepFreeze({ ...selection, sourceIds: [...selection.sourceIds], claimIds: [...selection.claimIds] });
};

const analyzePair = (leftCard, rightCard, context = 'IMMEDIATE_NEIGHBOR') => relationPairAuthority(leftCard, rightCard, context);

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
  kernelVersion: fact.kernelVersion,
  sourcePackVersion: fact.sourcePackVersion,
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
  if (!relationMethodSupportsTarotSystem(interpretation.relationMethod, interpretation.tarotSystem)) {
    throw new Error(`Relation method ${interpretation.relationMethod} is not authorized for Tarot system ${interpretation.tarotSystem}`);
  }
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
  const centerAuthority = centerContextAuthority(cards[0], cards[2]);
  const centerPattern = deepFreeze({
    patternId: 'center-context.antithesis',
    patternKind: 'CENTER_CONTEXT_EFFECT',
    semanticAuthority: centerAuthority.applied ? 'SOURCE_QUALIFIED_CONTEXT_EFFECT' : 'NO_SUPPORTED_CONTEXT_EFFECT',
    targetPositionId: 'antithesis', targetCardId: cards[1].cardId,
    applied: centerAuthority.applied,
    status: centerAuthority.status,
    effectType: centerAuthority.effectType,
    effect: centerAuthority.effect,
    reasonCode: centerAuthority.reasonCode,
    sourceIds: centerAuthority.sourceIds,
    claimIds: centerAuthority.claimIds,
  });
  const centerApplied = centerPattern.applied;
  const supportingClaims = unique([
    ...relations.flatMap(relation => relation.status === 'SUPPORTED' ? relation.claimIds : []),
    ...(centerApplied ? centerPattern.claimIds : []),
  ]);
  const unresolvedReasonCodes = unique([
    ...relations.map(relation => relation.status === 'UNSPECIFIED' ? relation.reasonCode : null),
    outer.status === 'UNSPECIFIED' ? outer.reasonCode : null,
    !centerApplied ? centerPattern.reasonCode : null,
  ]);
  const methodSelection = relationMethodSelectionAuthority(interpretation.tarotSystem);

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
      sourceIds: unique([
        ...AUTHORITATIVE_RELATION_AUTHORITY.relationMethod.doctrineSourceIds,
        ...relations.flatMap(relation => relation.sourceIds),
        ...outerPattern.sourceIds,
        ...centerPattern.sourceIds,
        ...methodSelection.sourceIds,
      ]),
      claimIds: unique([...supportingClaims, ...methodSelection.claimIds]),
      unresolvedReasonCodes,
      relationMethodAuthority: methodSelection.authority,
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
  if (JSON.stringify(Object.keys(CANONICAL_SPREAD_MAP)) !== JSON.stringify(AUTHORITATIVE_SPREAD_MANIFEST_META.spreadKeys)) errors.push('canonical spread legacy-key order drifted');
  Object.entries(CANONICAL_SPREAD_MAP).forEach(([legacyId, spread]) => {
    if (!spread?.spreadId || !Number.isInteger(spread?.cardCount) || spread.cardCount <= 0) errors.push(`invalid canonical spread ${legacyId}`);
    if (!Array.isArray(spread?.positions) || spread.positions.length !== spread.cardCount) errors.push(`canonical spread position drift: ${legacyId}`);
  });
  return errors;
};
