import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import { prepareCanonicalOracleConsultation } from './oracleSynthesis.js';
import { resolveSemanticBridgeConfig } from '../semantic/semanticBridgeConfig.js';

export const THRESHOLD_READING_VERSION = '0.43.0';
export const THRESHOLD_READING_AUTHORITY = 'DETERMINISTIC_READING_RECORD_WITNESS';
export const THRESHOLD_ORIGIN = 'THRESHOLD_PROVIDER_FREE';

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const titleCase = value => clean(value).toLowerCase().replace(/(^|\s)\S/g, char => char.toUpperCase());

const positionLabel = (record, positionId) => {
  const position = (record?.positions || []).find(entry => entry.positionId === positionId);
  return clean(position?.label || positionId || 'position').toUpperCase();
};

const relationSentence = (record, relation) => {
  const from = titleCase(positionLabel(record, relation?.fromPositionId));
  const to = titleCase(positionLabel(record, relation?.toPositionId));
  if (relation?.relationType === 'FRIENDLY') return `${from} and ${to} strengthen one another.`;
  if (relation?.relationType === 'SAME_SUIT_STRONG') return `${from} and ${to} strongly reinforce one another through their shared suit family.`;
  if (relation?.relationType === 'INIMICAL') return `${from} and ${to} stand in a contrary relation.`;
  if (relation?.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY') {
    return `No elemental-dignity relation is asserted between ${from} and ${to}, because one or both cards have no canonical suit family.`;
  }
  if (relation?.reasonCode === 'SOURCE_DOES_NOT_SPECIFY_PAIR') {
    return `The reviewed source remains silent on an elemental-dignity relation between ${from} and ${to}.`;
  }
  return `No source-qualified technical relation is asserted between ${from} and ${to}.`;
};

const outerSentence = (record, pattern) => {
  if (!pattern) return '';
  const left = titleCase(positionLabel(record, pattern.leftPositionId));
  const right = titleCase(positionLabel(record, pattern.rightPositionId));
  if (pattern.relationType === 'FRIENDLY') return `Across the spread, ${left} and ${right} are friendly.`;
  if (pattern.relationType === 'SAME_SUIT_STRONG') return `Across the spread, ${left} and ${right} strongly reinforce one another.`;
  if (pattern.relationType === 'INIMICAL') return `Across the spread, ${left} and ${right} stand contrary.`;
  if (pattern.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY') return `Across the spread, no elemental-dignity relation is asserted between ${left} and ${right} because a canonical suit family is absent.`;
  if (pattern.reasonCode === 'SOURCE_DOES_NOT_SPECIFY_PAIR') return `Across the spread, the reviewed source does not specify a relation between ${left} and ${right}.`;
  return `Across the spread, no source-qualified outer relation is asserted between ${left} and ${right}.`;
};

const centerSentence = (record, pattern) => {
  if (!pattern) return '';
  const target = titleCase(positionLabel(record, pattern.targetPositionId));
  if (pattern.applied && pattern.effectType === 'CENTER_BETWEEN_CONTRARIES') {
    return `${target} stands between those contraries and is treated as not much affected by either neighbor.`;
  }
  return `No additional source-qualified center effect is asserted for ${target}.`;
};

export const buildReadingWitness = record => {
  if (!record || !Array.isArray(record.positions)) return '';
  const immediate = (record.relations || []).map(relation => relationSentence(record, relation));
  const outer = (record.spreadPatterns || []).find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT') || null;
  const center = (record.spreadPatterns || []).find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT') || null;
  return [...immediate, outerSentence(record, outer), centerSentence(record, center)].filter(Boolean).join(' ');
};

export const buildThresholdReading = ({
  question,
  tradition,
  semanticConfig,
  deck = null,
  random = Math.random,
} = {}) => {
  const normalizedQuestion = clean(question);
  if (!normalizedQuestion) throw new Error('The Threshold requires a question before the cards are drawn.');
  const resolvedSemanticConfig = resolveSemanticBridgeConfig({ semanticConfig, tradition });

  const canonicalDeck = Array.isArray(deck) && deck.length
    ? validateCanonicalDeckGenesis(deck)
    : validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: { id: resolvedSemanticConfig.tarotSystem } }));

  const prepared = prepareCanonicalOracleConsultation({
    deck: canonicalDeck,
    activeSpread: 'TRIAD',
    spreadSlots: [null, null, null],
    question: normalizedQuestion,
    tradition,
    semanticConfig: resolvedSemanticConfig,
    author: '',
    readingDepth: resolvedSemanticConfig.readingDepth,
    techContext: '',
    erosContext: '',
    random,
  });

  const witness = buildReadingWitness(prepared.record);
  const reading = {
    cards: [...prepared.cards],
    answer: '',
    answerAuthority: null,
    witness,
    witnessAuthority: THRESHOLD_READING_AUTHORITY,
    readingRecord: prepared.record,
    selectionSource: prepared.selectionSource,
    origin: THRESHOLD_ORIGIN,
    providerFree: true,
  };

  return {
    deck: canonicalDeck,
    reading,
    record: prepared.record,
    witness,
    selectionSource: prepared.selectionSource,
    providerMode: 'PROVIDER_FREE',
  };
};
