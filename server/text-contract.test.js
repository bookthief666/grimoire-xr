import { describe, expect, it } from 'vitest';
import {
  TEXT_TASKS,
  getTextSchema,
  normalizeTextTask,
  validateStructuredTextResult,
} from './text-contract.mjs';

const ritualResult = () => ({
  dossier: 'A complete dossier.',
  cards: Array.from({ length: 78 }, (_, index) => `Card ${index + 1}`),
  questions: ['Question one?', 'Question two?', 'Question three?'],
});

describe('text task contracts', () => {
  it('normalizes only supported structured tasks', () => {
    expect(normalizeTextTask(' CARD ')).toBe(TEXT_TASKS.card);
    expect(normalizeTextTask('unknown')).toBeNull();
    expect(getTextSchema(TEXT_TASKS.ritual)?.properties?.cards?.minItems).toBe(78);
    expect(getTextSchema(TEXT_TASKS.oracle)?.additionalProperties).toBe(false);
  });

  it('accepts a complete ritual result', () => {
    expect(validateStructuredTextResult(TEXT_TASKS.ritual, ritualResult())).toEqual(ritualResult());
  });

  it('rejects ritual outputs with duplicate or missing cards', () => {
    const duplicate = ritualResult();
    duplicate.cards[77] = duplicate.cards[0];
    expect(() => validateStructuredTextResult(TEXT_TASKS.ritual, duplicate)).toThrow(/unique/i);

    const short = ritualResult();
    short.cards.pop();
    expect(() => validateStructuredTextResult(TEXT_TASKS.ritual, short)).toThrow(/exactly 78/i);
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
