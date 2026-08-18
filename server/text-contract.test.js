import { describe, expect, it } from 'vitest';
import {
  TEXT_TASKS,
  getTextSchema,
  inferTextTask,
  normalizeTextTask,
  validateStructuredTextResult,
} from './text-contract.mjs';

const ritualResult = () => ({
  dossier: 'A complete dossier.',
  questions: ['Question one?', 'Question two?', 'Question three?'],
});

describe('text task contracts', () => {
  it('normalizes only supported structured tasks', () => {
    expect(normalizeTextTask(' CARD ')).toBe(TEXT_TASKS.card);
    expect(normalizeTextTask('unknown')).toBeNull();
    expect(getTextSchema(TEXT_TASKS.ritual)?.properties?.cards).toBeUndefined();
    expect(getTextSchema(TEXT_TASKS.ritual)?.required).toEqual(['dossier', 'questions']);
    expect(getTextSchema(TEXT_TASKS.oracle)?.additionalProperties).toBe(false);
  });

  it('infers the new ritual prompt without depending on the removed card-name request', () => {
    expect(inferTextTask('Write a 200-word Thesis. Generate 3 profound questions.')).toBe(TEXT_TASKS.ritual);
  });

  it('accepts a complete ritual result with dossier and questions only', () => {
    expect(validateStructuredTextResult(TEXT_TASKS.ritual, ritualResult())).toEqual(ritualResult());
  });

  it('rejects ritual output that attempts to author Tarot card identities', () => {
    expect(() => validateStructuredTextResult(TEXT_TASKS.ritual, {
      ...ritualResult(),
      cards: Array.from({ length: 78 }, (_, index) => `Card ${index + 1}`),
    })).toThrow(/must not author Tarot card identities/i);
  });

  it('rejects incomplete ritual questions', () => {
    expect(() => validateStructuredTextResult(TEXT_TASKS.ritual, {
      dossier: 'A complete dossier.',
      questions: ['Only one?'],
    })).toThrow(/exactly 3/i);
  });

  it('validates card and oracle semantics', () => {
    const card = {
      exegesis: 'Interpretation',
      meta: {
        hebrew: 'Gimel',
        planet: 'Moon',
        alchemical: 'Albedo',
        daimon: 'Lunar intelligence',
        gematria: 73,
      },
      visual: 'A silver lunar temple.',
    };
    expect(validateStructuredTextResult(TEXT_TASKS.card, card)).toBe(card);
    expect(validateStructuredTextResult(TEXT_TASKS.oracle, { answer: 'Proceed carefully.' })).toEqual({ answer: 'Proceed carefully.' });
    expect(() => validateStructuredTextResult(TEXT_TASKS.card, { ...card, meta: { ...card.meta, gematria: 'not-a-number' } })).toThrow(/gematria/i);
    expect(() => validateStructuredTextResult(TEXT_TASKS.oracle, { answer: '' })).toThrow(/answer/i);
  });
});
