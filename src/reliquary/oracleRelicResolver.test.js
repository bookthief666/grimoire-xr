import { describe, expect, it } from 'vitest';
import { resolveOracleRelicCard } from './oracleRelicResolver.js';

const THOTH = { id: 'thoth', name: 'Book of Thoth' };

describe('resolveOracleRelicCard', () => {
  it('prefers the live deck copy so current encounter history cannot regress', () => {
    const readingCard = {
      id: 'minor.staffs.ace',
      canonicalCardId: 'minor.staffs.ace',
      name: 'ACE OF WANDS',
      patina: 1,
    };
    const liveCard = {
      ...readingCard,
      patina: 5,
      exegesis: 'Current live layer',
    };

    const resolved = resolveOracleRelicCard({
      cardId: 'minor.staffs.ace',
      deck: [liveCard],
      readingCards: [readingCard],
      tradition: THOTH,
    });

    expect(resolved).toBe(liveCard);
    expect(resolved.patina).toBe(5);
  });

  it('falls back to the reading copy when the live deck is sparse', () => {
    const readingCard = {
      id: 'minor.swords.ace',
      canonicalCardId: 'minor.swords.ace',
      name: 'ACE OF SWORDS',
      patina: 2,
    };

    const resolved = resolveOracleRelicCard({
      cardId: 'minor.swords.ace',
      deck: [],
      readingCards: [readingCard],
      tradition: THOTH,
    });

    expect(resolved).toBe(readingCard);
  });

  it('regenerates the canonical card from cardId when a restored ReadingRecord has no card payload', () => {
    const resolved = resolveOracleRelicCard({
      cardId: 'minor.cups.ace',
      deck: [],
      readingCards: [],
      tradition: THOTH,
    });

    expect(resolved).toBeTruthy();
    expect(resolved.id || resolved.canonicalCardId).toBe('minor.cups.ace');
    expect(resolved.name).toBe('ACE OF CUPS');
  });

  it('fails closed for an unknown canonical card id', () => {
    expect(resolveOracleRelicCard({
      cardId: 'minor.unknown.void',
      deck: [],
      readingCards: [],
      tradition: THOTH,
    })).toBeNull();
  });
});
