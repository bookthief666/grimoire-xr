import { describe, expect, it } from 'vitest';
import { TAROT_QA_FIXTURES, buildTarotQaSnapshot } from './qaFixtures.js';
import { buildReadingWitness, buildThresholdReading, THRESHOLD_ORIGIN, THRESHOLD_READING_AUTHORITY } from './thresholdReading.js';

const signature = record => JSON.stringify(record);

describe('0.43 Threshold provider-free reading', () => {
  it('constructs a complete canonical deck and reading without manifested content', () => {
    const result = buildThresholdReading({
      question: 'What is asking to be seen?',
      tradition: { id: 'thoth', name: 'Book of Thoth' },
      random: () => 0.314159,
    });

    expect(result.providerMode).toBe('PROVIDER_FREE');
    expect(result.deck).toHaveLength(78);
    expect(result.reading.cards).toHaveLength(3);
    expect(result.reading.origin).toBe(THRESHOLD_ORIGIN);
    expect(result.reading.witnessAuthority).toBe(THRESHOLD_READING_AUTHORITY);
    expect(result.reading.answer).toBe('');
    expect(result.reading.providerFree).toBe(true);
    expect(result.reading.cards.every(card => card.imageUrl === null && card.exegesis === null)).toBe(true);
    expect(result.record.input.question).toBe('What is asking to be seen?');
    expect(result.witness.length).toBeGreaterThan(20);
  });

  it('renders the Three Aces witness directly from the immutable ReadingRecord', () => {
    const snapshot = buildTarotQaSnapshot('three-aces');
    const before = signature(snapshot.record);
    const witness = buildReadingWitness(snapshot.record);

    expect(witness).toContain('Thesis and Antithesis strengthen one another.');
    expect(witness).toContain('Antithesis and Synthesis strengthen one another.');
    expect(witness).toContain('Thesis and Synthesis stand contrary.');
    expect(witness).toContain('Antithesis stands between those contraries');
    expect(signature(snapshot.record)).toBe(before);
  });

  it('preserves Major Arcana dignity gaps instead of manufacturing a relation', () => {
    const snapshot = buildTarotQaSnapshot('major-gap');
    const before = signature(snapshot.record);
    const witness = buildReadingWitness(snapshot.record);

    expect(witness).toContain('no elemental-dignity relation is asserted between Thesis and Antithesis'.replace(/^n/, 'N'));
    expect(witness).toContain('no elemental-dignity relation is asserted between Antithesis and Synthesis'.replace(/^n/, 'N'));
    expect(snapshot.fixture.expected.immediate[0].reasonCode).toBe('CARD_WITHOUT_SUIT_FAMILY');
    expect(snapshot.fixture.expected.immediate[1].reasonCode).toBe('CARD_WITHOUT_SUIT_FAMILY');
    expect(signature(snapshot.record)).toBe(before);
  });

  it('refuses to draw without a question', () => {
    expect(() => buildThresholdReading({ tradition: { id: 'thoth' } })).toThrow(/requires a question/i);
  });
});
