import { describe, expect, it } from 'vitest';
import {
  CANONICAL_CARD_MANIFEST,
  UPSTREAM_TAROT_CONTRACT,
  buildCanonicalOraclePromptPayload,
  buildCanonicalTriadConsultation,
  canonicalCardIdFromLegacyIndex,
  chooseOracleCards,
  getCanonicalCardDescriptor,
  getCanonicalCardPromptContext,
  getCanonicalInterpretationConfig,
  legacyIndexFromCanonicalCardId,
  validateCanonicalTarotBridge,
} from './canonicalTarotBridge.js';

describe('0.35 Fold canonical Tarot bridge', () => {
  it('pins the temporary mirror to the exact upstream semantic contract', () => {
    expect(UPSTREAM_TAROT_CONTRACT).toEqual({
      repository: 'bookthief666/tarot-archetype-vr',
      branch: 'feature/0.35-cross-client-semantic-contract',
      commit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
      contractId: 'grimoire.tarot.semantic.v1',
      contractVersion: '1.0.0',
    });
  });

  it('preserves the exact 78-card legacy address bijection', () => {
    expect(CANONICAL_CARD_MANIFEST).toHaveLength(78);
    expect(new Set(CANONICAL_CARD_MANIFEST.map(card => card.cardId)).size).toBe(78);
    CANONICAL_CARD_MANIFEST.forEach((card, index) => {
      expect(card.legacyIndex).toBe(index);
      expect(card.thoth.expressionCoverage).toBe('FULL');
      expect(canonicalCardIdFromLegacyIndex(index)).toBe(card.cardId);
      expect(legacyIndexFromCanonicalCardId(card.cardId)).toBe(index);
    });
    expect(validateCanonicalTarotBridge()).toEqual([]);
  });

  it('mirrors source-qualified Thoth expression/correspondence fields without importing the legacy full-major table as truth', () => {
    expect(getCanonicalCardDescriptor(1).thoth.fields.displayName).toMatchObject({
      value: 'THE MAGUS',
      sourceIds: ['src.primary.crowley-harris.thoth-deck.usgames'],
    });
    expect(getCanonicalCardDescriptor(50)).toMatchObject({ cardId: 'minor.swords.ace' });
    const futility = getCanonicalCardDescriptor('minor.swords.seven');
    expect(futility.thoth.fields.nativeTitle.value).toBe('FUTILITY');
    expect(futility.thoth.correspondences.planet.value).toBe('MOON');
    expect(futility.thoth.correspondences.zodiacSign.value).toBe('AQUARIUS');

    expect(getCanonicalCardDescriptor('major.emperor').thoth.correspondences).toMatchObject({
      hebrewLetter: { value: 'TZADDI' },
      zodiacSign: { value: 'ARIES' },
    });
    expect(getCanonicalCardDescriptor('major.empress').thoth.correspondences).toEqual({});
  });

  it('resolves Book of Thoth to the inherited sourced relation method and does not invent thoth_native relations', () => {
    expect(getCanonicalInterpretationConfig({ tradition: { id: 'thoth' } })).toMatchObject({
      tarotSystem: 'thoth',
      correspondenceProfile: 'thoth_native',
      relationMethod: 'crowley_lxxviii_dignities',
    });
    expect(JSON.stringify(getCanonicalInterpretationConfig({ tradition: { id: 'thoth' } }))).not.toContain('"relationMethod":"thoth_native"');
  });

  it('reproduces the upstream three-Ace parity fixture exactly at the relation/provenance boundary', () => {
    const record = buildCanonicalTriadConsultation({
      readingId: 'cross-client-fixture:thoth-three-aces',
      question: 'What relation is present?',
      legacyIndexes: [22, 50, 36],
      tradition: { id: 'thoth' },
    });

    expect(record.input).toMatchObject({
      cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
      spreadId: 'grimoire.triad.dialectic',
      tarotSystem: 'thoth',
      correspondenceProfile: 'thoth_native',
      relationMethod: 'crowley_lxxviii_dignities',
    });
    expect(record.relations.map(relation => relation.relationType)).toEqual(['FRIENDLY', 'FRIENDLY']);
    expect(record.relations.every(relation => relation.sourceIds.includes('src.primary.crowley.liber-lxxviii'))).toBe(true);
    const outer = record.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT');
    const center = record.spreadPatterns.find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT');
    expect(outer.relationType).toBe('INIMICAL');
    expect(center).toMatchObject({ applied: true, effectType: 'CENTER_BETWEEN_CONTRARIES' });
    expect(record.provenance).toMatchObject({
      sourceIds: ['src.primary.crowley.liber-lxxviii', 'src.primary.crowley.book-of-thoth.1944'],
      relationMethodAuthority: 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
    });
    expect(record.provenance.claimIds).toContain('claim.thoth1944.divination.method-source.equinox-i-8');
  });

  it('reproduces the Major-card source gap observed in Fold QA', () => {
    const record = buildCanonicalTriadConsultation({
      readingId: 'cross-client-fixture:thoth-major-gap',
      question: 'What remains source-qualified when a Major is present?',
      legacyIndexes: [22, 3, 36],
      tradition: { id: 'thoth' },
    });
    expect(record.relations.map(relation => [relation.relationType, relation.reasonCode])).toEqual([
      ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
      ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
    ]);
    expect(record.spreadPatterns[0].relationType).toBe('INIMICAL');
    expect(record.spreadPatterns[1].effectType).toBe('CENTER_BETWEEN_CONTRARIES');
  });

  it('uses a fully bound TRIAD cloth before any random fallback', () => {
    const deck = Array.from({ length: 78 }, (_, id) => ({ id, name: `CARD ${id}` }));
    const bound = chooseOracleCards({ deck, activeSpread: 'TRIAD', spreadSlots: [22, 50, 36], random: () => 0 });
    expect(bound.source).toBe('BOUND_TRIAD_CLOTH');
    expect(bound.cards.map(card => card.id)).toEqual([22, 50, 36]);

    const fallback = chooseOracleCards({ deck, activeSpread: 'TRIAD', spreadSlots: [22, null, 36], random: () => 0 });
    expect(fallback.source).toBe('RANDOM_TRIAD_FALLBACK');
    expect(fallback.cards).toHaveLength(3);
  });

  it('labels generated manifestation names separately from canonical card truth in prompt context', () => {
    const context = getCanonicalCardPromptContext({
      card: { id: 50, name: 'THE SWORD OF MY PRIVATE MYTH' },
      tradition: { id: 'thoth' },
    });
    expect(context).toMatchObject({
      cardId: 'minor.swords.ace',
      generatedManifestationName: 'THE SWORD OF MY PRIVATE MYTH',
      sourceQualification: 'SOURCE_QUALIFIED',
    });
    expect(context.canonicalExpression.displayName.value).toBe('ACE OF SWORDS');
  });

  it('builds an Oracle synthesis payload from facts already computed before the model is invoked', () => {
    const cards = [
      { id: 22, name: 'FIRST MANIFESTATION' },
      { id: 50, name: 'SECOND MANIFESTATION' },
      { id: 36, name: 'THIRD MANIFESTATION' },
    ];
    const record = buildCanonicalTriadConsultation({
      question: 'What relation is present?',
      legacyIndexes: cards.map(card => card.id),
      tradition: { id: 'thoth' },
    });
    const payload = buildCanonicalOraclePromptPayload({ record, cards });
    expect(payload.reading.relations.map(relation => relation.relationType)).toEqual(['FRIENDLY', 'FRIENDLY']);
    expect(payload.reading.positions[0]).toMatchObject({
      cardId: 'minor.staffs.ace',
      manifestationName: 'FIRST MANIFESTATION',
    });
    expect(JSON.stringify(payload)).toContain('src.primary.crowley.liber-lxxviii');
  });
});
