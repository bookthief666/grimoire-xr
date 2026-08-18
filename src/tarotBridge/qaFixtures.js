import {
  UPSTREAM_TAROT_CONTRACT,
  buildCanonicalTriadConsultation,
  getCanonicalCardDescriptor,
} from './canonicalTarotBridge.js';

const deepFreeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const TAROT_QA_FIXTURE_VERSION = '0.35.1';

export const TAROT_QA_FIXTURES = deepFreeze({
  'three-aces': {
    fixtureId: 'three-aces',
    label: 'Three Aces · sourced dignity current',
    description: 'Wands Ace → Swords Ace → Cups Ace. Exercises two friendly immediate relations, inimical outer context, and the center-between-contraries effect.',
    legacyIndexes: [22, 50, 36],
    question: 'QA: verify sourced Crowley/Liber LXXVIII dignity relations across the canonical Thoth bridge.',
    expected: {
      cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
      immediate: [
        { relationType: 'FRIENDLY', reasonCode: null },
        { relationType: 'FRIENDLY', reasonCode: null },
      ],
      outer: { relationType: 'INIMICAL', reasonCode: null },
      center: { applied: true, effectType: 'CENTER_BETWEEN_CONTRARIES' },
      relationMethodAuthority: 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
    },
  },
  'major-gap': {
    fixtureId: 'major-gap',
    label: 'Major Gap · no invented suit family',
    description: 'Wands Ace → Empress → Cups Ace. The Major has no canonical suit family, so both immediate dignity relations must remain explicitly UNSPECIFIED.',
    legacyIndexes: [22, 3, 36],
    question: 'QA: verify that a Major Arcana card does not receive an invented elemental dignity suit family.',
    expected: {
      cardIds: ['minor.staffs.ace', 'major.empress', 'minor.cups.ace'],
      immediate: [
        { relationType: 'UNSPECIFIED', reasonCode: 'CARD_WITHOUT_SUIT_FAMILY' },
        { relationType: 'UNSPECIFIED', reasonCode: 'CARD_WITHOUT_SUIT_FAMILY' },
      ],
      outer: { relationType: 'INIMICAL', reasonCode: null },
      center: { applied: true, effectType: 'CENTER_BETWEEN_CONTRARIES' },
      relationMethodAuthority: 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
    },
  },
});

export const TAROT_QA_FIXTURE_IDS = Object.freeze(Object.keys(TAROT_QA_FIXTURES));

const getOuterPattern = record => record.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT') || null;
const getCenterPattern = record => record.spreadPatterns.find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT') || null;

const compactCard = legacyIndex => {
  const descriptor = getCanonicalCardDescriptor(legacyIndex);
  if (!descriptor) throw new Error(`QA fixture references unknown Tarot legacy index: ${legacyIndex}`);
  return deepFreeze({
    legacyIndex,
    cardId: descriptor.cardId,
    arcana: descriptor.arcana,
    familyId: descriptor.familyId,
    suitFamilyId: descriptor.suitFamilyId,
    rankId: descriptor.rankId,
    thothDisplayName: descriptor.thoth?.fields?.displayName?.value || descriptor.cardId,
    nativeTitle: descriptor.thoth?.fields?.nativeTitle?.value || null,
  });
};

const buildSignature = ({ fixtureId, record }) => JSON.stringify({
  fixtureId,
  contract: `${UPSTREAM_TAROT_CONTRACT.contractId}@${UPSTREAM_TAROT_CONTRACT.contractVersion}`,
  upstreamCommit: UPSTREAM_TAROT_CONTRACT.commit,
  cardIds: record.input.cardIds,
  relationMethod: record.input.relationMethod,
  immediate: record.relations.map(relation => [relation.relationType, relation.reasonCode]),
  outer: getOuterPattern(record) ? [getOuterPattern(record).relationType, getOuterPattern(record).reasonCode] : null,
  center: getCenterPattern(record) ? [getCenterPattern(record).applied, getCenterPattern(record).effectType] : null,
  authority: record.provenance.relationMethodAuthority,
  sourceIds: record.provenance.sourceIds,
});

export const buildTarotQaSnapshot = fixtureId => {
  const normalizedId = String(fixtureId || '').trim().toLowerCase() || TAROT_QA_FIXTURE_IDS[0];
  const fixture = TAROT_QA_FIXTURES[normalizedId];
  if (!fixture) throw new Error(`Unknown Tarot QA fixture: ${normalizedId}`);

  const record = buildCanonicalTriadConsultation({
    readingId: `qa:${TAROT_QA_FIXTURE_VERSION}:${fixture.fixtureId}`,
    question: fixture.question,
    legacyIndexes: fixture.legacyIndexes,
    tradition: { id: 'thoth', name: 'Book of Thoth' },
    readingDepth: 'adept',
  });

  const cards = fixture.legacyIndexes.map(compactCard);
  const outer = getOuterPattern(record);
  const center = getCenterPattern(record);

  const checks = deepFreeze({
    cardIds: JSON.stringify(record.input.cardIds) === JSON.stringify(fixture.expected.cardIds),
    immediate: JSON.stringify(record.relations.map(relation => ({
      relationType: relation.relationType,
      reasonCode: relation.reasonCode,
    }))) === JSON.stringify(fixture.expected.immediate),
    outer: Boolean(outer)
      && outer.relationType === fixture.expected.outer.relationType
      && outer.reasonCode === fixture.expected.outer.reasonCode,
    center: Boolean(center)
      && center.applied === fixture.expected.center.applied
      && center.effectType === fixture.expected.center.effectType,
    methodAuthority: record.provenance.relationMethodAuthority === fixture.expected.relationMethodAuthority,
    sourceQualified: record.provenance.sourceIds.includes('src.primary.crowley.liber-lxxviii')
      && record.provenance.sourceIds.includes('src.primary.crowley.book-of-thoth.1944'),
    contractPin: UPSTREAM_TAROT_CONTRACT.commit === 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
  });

  return deepFreeze({
    fixture,
    cards,
    record,
    outer,
    center,
    checks,
    pass: Object.values(checks).every(Boolean),
    semanticSignature: buildSignature({ fixtureId: fixture.fixtureId, record }),
    providerMode: 'PROVIDER_FREE',
  });
};
