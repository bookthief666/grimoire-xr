import {
  buildCanonicalOraclePromptPayload,
  buildCanonicalTriadConsultation,
  chooseOracleCards,
} from './canonicalTarotBridge.js';
import { buildInterpretiveLensPromptContext } from '../semantic/interpretiveLensCatalog.js';

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

const relationDisclosure = relation => {
  const source = relation.sourceIds?.length ? relation.sourceIds.join(', ') : 'NO_SOURCE_RELATION';
  return `${relation.fromPositionId} -> ${relation.toPositionId}: ${relation.relationType} [${relation.status}] source=${source}${relation.reasonCode ? ` reason=${relation.reasonCode}` : ''}`;
};

const patternDisclosure = pattern => {
  if (pattern.patternKind === 'OUTER_PAIR_CONTEXT') {
    return `outer context ${pattern.leftPositionId} <-> ${pattern.rightPositionId}: ${pattern.relationType} [${pattern.status}]`;
  }
  if (pattern.patternKind === 'CENTER_CONTEXT_EFFECT') {
    return `center context ${pattern.targetPositionId}: ${pattern.applied ? pattern.effectType : 'NO_SUPPORTED_EFFECT'}${pattern.reasonCode ? ` reason=${pattern.reasonCode}` : ''}`;
  }
  return `${pattern.patternKind}: UNSPECIFIED`;
};

export const buildCanonicalOracleSynthesisPrompt = ({
  author,
  traditionName,
  techContext,
  erosContext,
  record,
  cards,
} = {}) => {
  const payload = buildCanonicalOraclePromptPayload({ record, cards });
  const lensContext = buildInterpretiveLensPromptContext(payload.reading.lenses || []);
  const positionLines = payload.reading.positions.map(position => {
    const expression = position.canonicalCard?.canonicalExpression?.displayName?.value || position.cardId;
    const nativeTitle = position.canonicalCard?.canonicalExpression?.nativeTitle?.value;
    return `${position.positionId}: ${position.cardId}; canonical expression=${expression}${nativeTitle ? `; native title=${nativeTitle}` : ''}; generated manifestation=${position.manifestationName || 'NONE'}`;
  });
  const relationLines = payload.reading.relations.length
    ? payload.reading.relations.map(relationDisclosure)
    : ['No source-qualified technical inter-card relation method is active for this consultation.'];
  const patternLines = payload.reading.spreadPatterns.map(patternDisclosure);

  return [
    `Role: Oracle of ${clean(author) || 'the Grimoire'}.`,
    clean(traditionName) ? `Selected tradition: ${clean(traditionName)}.` : '',
    `Query: "${clean(payload.reading.question)}"`,
    'Task: Synthesize a 300-word divinatory answer using Elemental Dignities only where the canonical record below marks them SUPPORTED.',
    'EPISTEMIC FIREWALL: The canonical record was computed before you were invoked. Do not recalculate, replace, complete, or contradict card identity, correspondence facts, relation types, reason codes, or provenance. UNSPECIFIED means the reviewed source does not authorize a relation; do not convert it into neutral, friendly, inimical, or a numeric score.',
    'GENERATIVE ROLE: You may synthesize prose, imagery, reflection, and question-sensitive interpretation from the supplied facts. Generated manifestation names are presentation/creative material and never replace canonical card identity.',
    `CANONICAL CONTRACT: ${payload.contract.contractId}@${payload.contract.contractVersion}; pinned upstream ${payload.contract.commit}.`,
    `SEMANTIC CONFIG: tarotSystem=${payload.reading.tarotSystem}; correspondenceProfile=${payload.reading.correspondenceProfile}; relationMethod=${payload.reading.relationMethod}; lenses=${(payload.reading.lenses || []).join('+') || 'none'}; ritualTheme=${payload.reading.ritualTheme || 'none'}; readingDepth=${payload.reading.readingDepth || 'adept'}; spread=${payload.reading.spreadId}.`,
    lensContext,
    'POSITIONS:',
    ...positionLines,
    'SOURCE-QUALIFIED RELATIONS:',
    ...relationLines,
    ...(patternLines.length ? ['SPREAD CONTEXT:', ...patternLines] : []),
    `PROVENANCE: ${JSON.stringify(payload.reading.provenance)}.`,
    clean(techContext) ? `TONE / EXPLANATION DEPTH: ${clean(techContext)}` : '',
    clean(erosContext) ? `EROS REGISTER: ${clean(erosContext)}` : '',
    'Return JSON: {"answer":"string"}',
  ].filter(Boolean).join('\n');
};

export const prepareCanonicalOracleConsultation = ({
  deck,
  activeSpread,
  spreadSlots,
  question,
  tradition,
  semanticConfig,
  author,
  readingDepth,
  techContext = '',
  erosContext = '',
  random = Math.random,
} = {}) => {
  const selection = chooseOracleCards({ deck, activeSpread, spreadSlots, random });
  if (selection.cards.length !== 3) throw new Error('Oracle consultation requires at least three cards in the deck.');
  const record = buildCanonicalTriadConsultation({
    readingId: `grimoire-2d-triad:${selection.cards.map(card => card.id).join(':')}`,
    question,
    legacyIndexes: selection.cards.map(card => card.id),
    tradition,
    semanticConfig,
    readingDepth,
  });
  const prompt = buildCanonicalOracleSynthesisPrompt({
    author,
    traditionName: semanticConfig?.tarotSystem || tradition?.name || tradition?.id || tradition,
    techContext,
    erosContext,
    record,
    cards: selection.cards,
  });
  return Object.freeze({
    cards: selection.cards,
    selectionSource: selection.source,
    record,
    prompt,
  });
};
