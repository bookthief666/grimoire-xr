import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from '../tarotBridge/canonicalDeckGenesis.js';
import { resolveOracleRelicCard } from './oracleRelicResolver.js';

const THOTH = { id: 'thoth', name: 'Book of Thoth' };
const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: THOTH }));
const byCanonicalId = cardId => canonicalDeck.find(card => card.canonicalCardId === cardId);

describe('resolveOracleRelicCard', () => {
  it('prefers canonicalCardId over the numeric legacy id and returns the live deck copy', () => {
    const ace = byCanonicalId('minor.staffs.ace');
    expect(ace).toBeTruthy();
    expect(Number.isInteger(ace.id)).toBe(true);

    const readingCard = { ...ace, patina: 1 };
    const liveCard = { ...ace, patina: 5, exegesis: 'Current live layer' };

    const resolved = resolveOracleRelicCard({
      cardId: 'minor.staffs.ace',
      deck: [liveCard],
      readingCards: [readingCard],
      tradition: THOTH,
    });

    expect(resolved).toBe(liveCard);
    expect(resolved.canonicalCardId).toBe('minor.staffs.ace');
    expect(resolved.patina).toBe(5);
  });

  it('falls back to the reading copy when the live deck is sparse', () => {
    const ace = byCanonicalId('minor.swords.ace');
    const readingCard = { ...ace, patina: 2 };

    const resolved = resolveOracleRelicCard({
      cardId: 'minor.swords.ace',
      deck: [],
      readingCards: [readingCard],
      tradition: THOTH,
    });

    expect(resolved).toBe(readingCard);
  });

  it('keeps compatibility with older reading cards whose canonical identity lived in string id', () => {
    const legacyReadingCard = {
      id: 'minor.swords.ace',
      name: 'ACE OF SWORDS',
      patina: 2,
    };

    const resolved = resolveOracleRelicCard({
      cardId: 'minor.swords.ace',
      deck: [],
      readingCards: [legacyReadingCard],
      tradition: THOTH,
    });

    expect(resolved).toBe(legacyReadingCard);
  });

  it('regenerates the canonical card from cardId when a restored ReadingRecord has no card payload', () => {
    const resolved = resolveOracleRelicCard({
      cardId: 'minor.cups.ace',
      deck: [],
      readingCards: [],
      tradition: THOTH,
    });

    expect(resolved).toBeTruthy();
    expect(Number.isInteger(resolved.id)).toBe(true);
    expect(resolved.canonicalCardId).toBe('minor.cups.ace');
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
