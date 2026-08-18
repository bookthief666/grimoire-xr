import { describe, expect, it } from 'vitest';
import {
  CANONICAL_DECK_GENESIS_VERSION,
  DECK_GENESIS_AUTHORITIES,
  buildCanonicalDeckGenesis,
  validateCanonicalDeckGenesis,
} from './canonicalDeckGenesis.js';

describe('0.37 canonical deck genesis', () => {
  it('builds exactly one deterministic relic for each canonical identity', () => {
    const deck = buildCanonicalDeckGenesis({ tradition: { id: 'thoth', name: 'Book of Thoth' } });
    expect(CANONICAL_DECK_GENESIS_VERSION).toBe('0.1.0');
    expect(deck).toHaveLength(78);
    expect(validateCanonicalDeckGenesis(deck)).toBe(deck);
    expect(new Set(deck.map(card => card.canonicalCardId)).size).toBe(78);
    expect(deck.map(card => card.id)).toEqual(Array.from({ length: 78 }, (_, index) => index));
  });

  it('uses reviewed Thoth display expressions instead of model-authored ritual names', () => {
    const deck = buildCanonicalDeckGenesis({ tradition: 'thoth' });
    expect(deck[0]).toMatchObject({ canonicalCardId: 'major.fool', name: 'THE FOOL' });
    expect(deck[1]).toMatchObject({ canonicalCardId: 'major.magician', name: 'THE MAGUS' });
    expect(deck[2]).toMatchObject({ canonicalCardId: 'major.priestess', name: 'THE PRIESTESS' });
    expect(deck[8]).toMatchObject({ canonicalCardId: 'major.fortitude', name: 'LUST' });
    expect(deck[11]).toMatchObject({ canonicalCardId: 'major.justice', name: 'ADJUSTMENT' });
    expect(deck[14]).toMatchObject({ canonicalCardId: 'major.temperance', name: 'ART' });
    expect(deck[20]).toMatchObject({ canonicalCardId: 'major.judgement', name: 'THE AEON' });
    expect(deck[21]).toMatchObject({ canonicalCardId: 'major.world', name: 'THE UNIVERSE' });
    expect(deck[22]).toMatchObject({ canonicalCardId: 'minor.staffs.ace', name: 'ACE OF WANDS' });
    expect(deck[32]).toMatchObject({ canonicalCardId: 'minor.staffs.page', name: 'PRINCESS OF WANDS' });
    expect(deck[33]).toMatchObject({ canonicalCardId: 'minor.staffs.knight', name: 'PRINCE OF WANDS' });
    expect(deck[35]).toMatchObject({ canonicalCardId: 'minor.staffs.king', name: 'KNIGHT OF WANDS' });
    expect(deck.every(card => card.nameAuthority === DECK_GENESIS_AUTHORITIES.sourceQualifiedExpression)).toBe(true);
  });

  it('keeps unsourced traditions deterministic without pretending their labels are source-qualified', () => {
    const deck = buildCanonicalDeckGenesis({ tradition: { id: 'rws', name: 'Rider-Waite-Smith' } });
    expect(deck[1]).toMatchObject({ canonicalCardId: 'major.magician', name: 'THE MAGICIAN' });
    expect(deck[8]).toMatchObject({ canonicalCardId: 'major.fortitude', name: 'STRENGTH' });
    expect(deck[11]).toMatchObject({ canonicalCardId: 'major.justice', name: 'JUSTICE' });
    expect(deck[22]).toMatchObject({ canonicalCardId: 'minor.staffs.ace', name: 'ACE OF WANDS' });
    expect(deck[32]).toMatchObject({ canonicalCardId: 'minor.staffs.page', name: 'PAGE OF WANDS' });
    expect(deck[77]).toMatchObject({ canonicalCardId: 'minor.coins.king', name: 'KING OF COINS' });
    expect(deck.every(card => card.nameAuthority === DECK_GENESIS_AUTHORITIES.projectCompatibilityLabel)).toBe(true);
    expect(deck.every(card => card.nameSourceIds.length === 0)).toBe(true);
  });
});
