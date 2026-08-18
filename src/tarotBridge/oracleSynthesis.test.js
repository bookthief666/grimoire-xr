import { describe, expect, it } from 'vitest';
import {
  buildCanonicalOracleSynthesisPrompt,
  prepareCanonicalOracleConsultation,
} from './oracleSynthesis.js';
import { buildCanonicalTriadConsultation } from './canonicalTarotBridge.js';

const deck = Array.from({ length: 78 }, (_, id) => ({
  id,
  canonicalCardId: null,
  name: `GENERATED MANIFESTATION ${id}`,
}));

describe('0.35 canonical Oracle synthesis boundary', () => {
  it('prefers the bound TRIAD cloth and computes relations before prose generation', () => {
    const consultation = prepareCanonicalOracleConsultation({
      deck,
      activeSpread: 'TRIAD',
      spreadSlots: [22, 50, 36],
      question: 'What relation is present?',
      tradition: { id: 'thoth', name: 'Book of Thoth' },
      author: 'TEST SUBJECT',
    });

    expect(consultation.selectionSource).toBe('BOUND_TRIAD_CLOTH');
    expect(consultation.cards.map(card => card.id)).toEqual([22, 50, 36]);
    expect(consultation.record.relations.map(relation => relation.relationType)).toEqual(['FRIENDLY', 'FRIENDLY']);
    expect(consultation.prompt).toContain('SOURCE-QUALIFIED RELATIONS:');
    expect(consultation.prompt).toContain('thesis -> antithesis: FRIENDLY [SUPPORTED]');
    expect(consultation.prompt).toContain('antithesis -> synthesis: FRIENDLY [SUPPORTED]');
    expect(consultation.prompt).toContain('outer context thesis <-> synthesis: INIMICAL [SUPPORTED]');
  });

  it('keeps the existing structured-oracle task inference phrase while forbidding model-side dignity invention', () => {
    const record = buildCanonicalTriadConsultation({
      question: 'What is source-qualified?',
      legacyIndexes: [22, 3, 36],
      tradition: { id: 'thoth' },
    });
    const cards = [deck[22], deck[3], deck[36]];
    const prompt = buildCanonicalOracleSynthesisPrompt({ record, cards });

    expect(prompt).toContain('Synthesize a 300-word divinatory answer using Elemental Dignities');
    expect(prompt).toContain('Do not recalculate, replace, complete, or contradict');
    expect(prompt).toContain('UNSPECIFIED means the reviewed source does not authorize a relation');
    expect(prompt).toContain('CARD_WITHOUT_SUIT_FAMILY');
    expect(prompt).toContain('Return JSON: {"answer":"string"}');
  });

  it('does not serialize an invented relation for a Major adjacency', () => {
    const consultation = prepareCanonicalOracleConsultation({
      deck,
      activeSpread: 'TRIAD',
      spreadSlots: [22, 3, 36],
      question: 'What remains unknown?',
      tradition: { id: 'thoth', name: 'Book of Thoth' },
    });
    expect(consultation.record.relations.map(relation => relation.relationType)).toEqual(['UNSPECIFIED', 'UNSPECIFIED']);
    expect(consultation.prompt).toContain('UNSPECIFIED [UNSPECIFIED]');
    expect(consultation.prompt).not.toContain('major.empress; canonical expression=THE EMPRESS; native title=');
  });

  it('preserves a random three-card fallback when the cloth is incomplete', () => {
    const consultation = prepareCanonicalOracleConsultation({
      deck,
      activeSpread: 'TRIAD',
      spreadSlots: [22, null, 36],
      question: 'Fallback?',
      tradition: { id: 'thoth' },
      random: () => 0,
    });
    expect(consultation.selectionSource).toBe('RANDOM_TRIAD_FALLBACK');
    expect(consultation.cards).toHaveLength(3);
  });
});
