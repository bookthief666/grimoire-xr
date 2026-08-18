import { describe, expect, it } from 'vitest';
import { chooseOracleCards } from './canonicalTarotBridge.js';

describe('0.35 Oracle selection ownership', () => {
  it('freezes the selection envelope but never freezes reducer-owned card objects', () => {
    const deck = Array.from({ length: 78 }, (_, id) => ({ id, name: `CARD ${id}` }));
    const selected = chooseOracleCards({
      deck,
      activeSpread: 'TRIAD',
      spreadSlots: [22, 50, 36],
    });

    expect(Object.isFrozen(selected)).toBe(true);
    expect(Object.isFrozen(selected.cards)).toBe(true);
    expect(selected.cards.map(card => card.id)).toEqual([22, 50, 36]);
    expect(Object.isFrozen(deck[22])).toBe(false);
    expect(Object.isFrozen(deck[50])).toBe(false);
    expect(Object.isFrozen(deck[36])).toBe(false);
  });

  it('keeps random fallback cards client-owned as well', () => {
    const deck = Array.from({ length: 78 }, (_, id) => ({ id, name: `CARD ${id}` }));
    const selected = chooseOracleCards({
      deck,
      activeSpread: 'TRIAD',
      spreadSlots: [22, null, 36],
      random: () => 0,
    });

    expect(selected.source).toBe('RANDOM_TRIAD_FALLBACK');
    expect(Object.isFrozen(selected.cards)).toBe(true);
    selected.cards.forEach(card => expect(Object.isFrozen(card)).toBe(false));
  });
});
