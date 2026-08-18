import { describe, expect, it } from 'vitest';
import { buildTarotQaSnapshot } from './qaFixtures.js';
import { buildOracleBookPresentation, relationLanguage, sourceLabel } from './oracleBookPresentation.js';
import { THRESHOLD_READING_AUTHORITY } from './thresholdReading.js';

const readingFromFixture = (fixtureId, { answer = 'Generated QA synthesis.' } = {}) => {
  const snapshot = buildTarotQaSnapshot(fixtureId);
  return {
    cards: snapshot.cards.map(card => ({
      id: card.legacyIndex,
      canonicalCardId: card.cardId,
      name: card.thothDisplayName,
      imageUrl: null,
    })),
    answer,
    readingRecord: snapshot.record,
    selectionSource: 'BOUND_TRIAD_CLOTH',
  };
};

describe('Living Book Oracle presentation', () => {
  it('turns Three Aces into reader-facing positions without mutating semantic truth', () => {
    const reading = readingFromFixture('three-aces');
    const before = JSON.stringify(reading.readingRecord);
    const model = buildOracleBookPresentation(reading);
    const after = JSON.stringify(reading.readingRecord);

    expect(after).toBe(before);
    expect(model.hasCanonicalRecord).toBe(true);
    expect(model.positions.map(position => position.label)).toEqual(['THESIS', 'ANTITHESIS', 'SYNTHESIS']);
    expect(model.positions[0].functionText).toContain('first articulated force');
    expect(model.relations.map(relation => relation.heading)).toEqual(['Mutual strengthening', 'Mutual strengthening']);
    expect(model.outerContext.heading).toBe('Contrary relation');
    expect(model.centerContext.heading).toBe('The center between contraries');
    expect(model.witness).toContain('Thesis and Antithesis strengthen one another');
    expect(model.witnessAuthority).toBe(THRESHOLD_READING_AUTHORITY);
    expect(model.provenance.methodText).toContain('Liber LXXVIII');
    expect(model.provenance.selectionText).toContain('TRIAD cloth');
    expect(model.provenance.contractText).toContain('current canonical Tarot contract');
    expect(model.copyText).toContain('QUESTION');
    expect(model.copyText).toContain('WITNESS');
    expect(model.copyText).toContain('INTERPRETATION');
    expect(model.copyText).toContain('SOURCES');
  });

  it('supports a complete provider-free reading with no generated interpretation', () => {
    const reading = readingFromFixture('three-aces', { answer: '' });
    reading.origin = 'THRESHOLD_PROVIDER_FREE';
    reading.providerFree = true;
    const model = buildOracleBookPresentation(reading);

    expect(model.answer).toBe('');
    expect(model.answerAuthority).toBe(null);
    expect(model.witness).toContain('Thesis and Antithesis strengthen one another');
    expect(model.copyText).toContain('WITNESS');
    expect(model.copyText).not.toContain('INTERPRETATION\n');
  });

  it('translates the Major gap without inventing a relation', () => {
    const reading = readingFromFixture('major-gap');
    const model = buildOracleBookPresentation(reading);
    expect(model.relations).toHaveLength(2);
    for (const relation of model.relations) {
      expect(relation.heading).toBe('No relation asserted');
      expect(relation.body).toContain('no canonical suit family');
      expect(relation.raw.relationType).toBe('UNSPECIFIED');
      expect(relation.raw.reasonCode).toBe('CARD_WITHOUT_SUIT_FAMILY');
    }
    expect(model.provenance.unresolvedCount).toBeGreaterThan(0);
    expect(model.witness).toContain('No elemental-dignity relation is asserted');
  });

  it('keeps raw technical provenance available behind the reader-facing model', () => {
    const model = buildOracleBookPresentation(readingFromFixture('three-aces'));
    expect(model.provenance.technical.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(model.provenance.technical.relationMethodAuthority).toBe('SOURCE_QUALIFIED_METHOD_INHERITANCE');
    expect(model.provenance.technical.contract.commit).toBe('f4534b4f92d88f3950ec0c9c211bfa4648cd08ea');
  });

  it('provides human source labels and preserves unknown source identity', () => {
    expect(sourceLabel('src.primary.crowley.liber-lxxviii')).toContain('Liber LXXVIII');
    expect(sourceLabel('src.unknown.future-pack')).toContain('unknown future pack');
  });

  it('never upgrades an unspecified relation through presentation wording', () => {
    const language = relationLanguage({ relationType: 'UNSPECIFIED', reasonCode: 'SOURCE_DOES_NOT_SPECIFY_PAIR' });
    expect(language.heading).toBe('Source remains silent');
    expect(language.body).toContain('does not specify');
  });
});
