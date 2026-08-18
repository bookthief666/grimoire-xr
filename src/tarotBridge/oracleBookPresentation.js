import { getCanonicalCardDescriptor, UPSTREAM_TAROT_CONTRACT } from './canonicalTarotBridge.js';
import { summarizeReadingProvenance } from './archiveEnvelope.js';

const SOURCE_LABELS = Object.freeze({
  'src.primary.crowley.liber-lxxviii': 'Aleister Crowley · Liber LXXVIII',
  'src.primary.crowley.book-of-thoth.1944': 'Aleister Crowley · The Book of Thoth (1944)',
  'src.primary.crowley-harris.thoth-deck.usgames': 'Crowley–Harris · Thoth Tarot deck',
});

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const sentence = value => {
  const text = clean(value);
  if (!text) return '';
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}${/[.!?]$/.test(text) ? '' : '.'}`;
};

export const sourceLabel = sourceId => SOURCE_LABELS[sourceId] || clean(sourceId).replace(/^src\./, '').replace(/[._-]+/g, ' ');

export const relationLanguage = relation => {
  const type = relation?.relationType || 'UNSPECIFIED';
  const reason = relation?.reasonCode || null;
  if (type === 'FRIENDLY') return {
    heading: 'Mutual strengthening',
    body: 'These positions are classified as friendly under the active elemental-dignity method.',
    tone: 'supportive',
  };
  if (type === 'SAME_SUIT_STRONG') return {
    heading: 'Strong reinforcement',
    body: 'These positions share a suit family and strongly reinforce one another under the active method.',
    tone: 'supportive',
  };
  if (type === 'INIMICAL') return {
    heading: 'Contrary relation',
    body: 'These positions are classified as inimical under the active elemental-dignity method.',
    tone: 'contrary',
  };
  if (reason === 'CARD_WITHOUT_SUIT_FAMILY') return {
    heading: 'No relation asserted',
    body: 'No elemental-dignity relation is asserted here because one or both cards have no canonical suit family.',
    tone: 'unresolved',
  };
  if (reason === 'SOURCE_DOES_NOT_SPECIFY_PAIR') return {
    heading: 'Source remains silent',
    body: 'The active source pack does not specify an elemental-dignity relation for this pair.',
    tone: 'unresolved',
  };
  return {
    heading: 'No relation asserted',
    body: 'No source-qualified technical relation is asserted for these positions.',
    tone: 'unresolved',
  };
};

const relationMethodLabel = method => {
  if (method === 'crowley_lxxviii_dignities') return 'Crowley’s elemental dignities · Liber LXXVIII';
  if (!method || method === 'disabled') return 'No technical relation method active';
  return clean(method).replace(/_/g, ' ');
};

const selectionLabel = selection => {
  if (selection === 'BOUND_TRIAD_CLOTH') return 'Cards placed deliberately on the TRIAD cloth';
  if (selection === 'RANDOM_TRIAD_FALLBACK') return 'Cards drawn from the canonical deck';
  return clean(selection).replace(/_/g, ' ') || 'Selection source not recorded';
};

const contractLanguage = status => {
  if (status === 'CURRENT_CONTRACT_MATCH') return 'Verified against the current canonical Tarot contract.';
  if (status === 'ARCHIVED_CONTRACT_MISMATCH') return 'Historical reading preserved under a different semantic-contract version.';
  if (status === 'LEGACY_NO_CONTRACT_PIN') return 'Legacy reading: no semantic-contract pin was recorded.';
  return 'Semantic-contract status is preserved in the technical record.';
};

const cardTitle = ({ position, card, tarotSystem }) => {
  const descriptor = getCanonicalCardDescriptor(position?.cardId);
  const thothTitle = descriptor?.thoth?.fields?.displayName?.value || '';
  const manifested = clean(card?.name);
  if (tarotSystem === 'thoth' && thothTitle) return thothTitle;
  return manifested || thothTitle || clean(position?.cardId) || 'Unnamed card';
};

const nativeTitle = ({ position, tarotSystem }) => {
  if (tarotSystem !== 'thoth') return '';
  const descriptor = getCanonicalCardDescriptor(position?.cardId);
  return clean(descriptor?.thoth?.fields?.nativeTitle?.value);
};

const positionById = (positions, id) => positions.find(position => position.positionId === id) || null;

export const buildOracleBookPresentation = reading => {
  const record = reading?.readingRecord || null;
  const cards = Array.isArray(reading?.cards) ? reading.cards : [];
  const answer = clean(reading?.answer);
  if (!record) {
    return Object.freeze({
      hasCanonicalRecord: false,
      question: '', positions: [], relations: [], outerContext: null, centerContext: null,
      answer,
      provenance: { contractText: 'Legacy/generated reading. No canonical ReadingRecord is attached.', sources: [], technical: null },
      copyText: answer,
    });
  }

  const summary = summarizeReadingProvenance(reading);
  const positions = (record.positions || []).map((position, index) => Object.freeze({
    positionId: position.positionId,
    label: clean(position.label || position.positionId).toUpperCase(),
    functionText: sentence(position.questionFunction),
    cardId: position.cardId,
    orientation: position.orientation || 'upright',
    title: cardTitle({ position, card: cards[index], tarotSystem: record.input?.tarotSystem }),
    nativeTitle: nativeTitle({ position, tarotSystem: record.input?.tarotSystem }),
    imageUrl: cards[index]?.imageUrl || null,
    legacyCard: cards[index] || null,
  }));

  const relations = (record.relations || []).map(relation => {
    const from = positionById(positions, relation.fromPositionId);
    const to = positionById(positions, relation.toPositionId);
    const language = relationLanguage(relation);
    return Object.freeze({
      relationId: relation.relationId,
      fromLabel: from?.label || clean(relation.fromPositionId).toUpperCase(),
      toLabel: to?.label || clean(relation.toPositionId).toUpperCase(),
      fromTitle: from?.title || relation.fromCardId,
      toTitle: to?.title || relation.toCardId,
      ...language,
      raw: relation,
    });
  });

  const outerRaw = (record.spreadPatterns || []).find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT') || null;
  const centerRaw = (record.spreadPatterns || []).find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT') || null;
  const outerContext = outerRaw ? Object.freeze({ ...relationLanguage(outerRaw), raw: outerRaw }) : null;
  const centerContext = centerRaw ? Object.freeze({
    applied: Boolean(centerRaw.applied),
    heading: centerRaw.applied ? 'The center between contraries' : 'No additional center effect',
    body: centerRaw.applied
      ? 'Because the outer positions are source-classified as contrary, the center is treated as not much affected by either neighbor.'
      : 'The source-qualified conditions for a special center effect are not present in this reading.',
    raw: centerRaw,
  }) : null;

  const sources = summary.sourceIds.map(id => Object.freeze({ id, label: sourceLabel(id) }));
  const contract = reading?.semanticContract || UPSTREAM_TAROT_CONTRACT;
  const provenance = Object.freeze({
    contractText: contractLanguage(summary.contractStatus),
    methodText: relationMethodLabel(summary.relationMethod),
    selectionText: selectionLabel(summary.selectionSource),
    sources,
    unresolvedCount: summary.unresolvedReasonCodes.length,
    technical: Object.freeze({
      contractStatus: summary.contractStatus,
      spreadId: summary.spreadId,
      selectionSource: summary.selectionSource,
      relationMethod: summary.relationMethod,
      relationMethodAuthority: summary.relationMethodAuthority,
      sourceIds: [...summary.sourceIds],
      unresolvedReasonCodes: [...summary.unresolvedReasonCodes],
      contract: { ...contract },
    }),
  });

  const question = clean(record.input?.question);
  const copyText = [
    question ? `QUESTION\n${question}` : '',
    ...positions.map(position => `${position.label}\n${position.title}${position.nativeTitle && position.nativeTitle !== position.title ? ` · ${position.nativeTitle}` : ''}\n${position.functionText}`),
    answer ? `READING\n${answer}` : '',
    relations.length ? `RELATIONS\n${relations.map(relation => `${relation.fromLabel} → ${relation.toLabel}: ${relation.heading}. ${relation.body}`).join('\n')}` : '',
    sources.length ? `SOURCES\n${sources.map(source => source.label).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');

  return Object.freeze({
    hasCanonicalRecord: true,
    question,
    positions: Object.freeze(positions),
    relations: Object.freeze(relations),
    outerContext,
    centerContext,
    answer,
    provenance,
    copyText,
  });
};
