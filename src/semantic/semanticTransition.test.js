import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis, DECK_GENESIS_AUTHORITIES } from '../tarotBridge/canonicalDeckGenesis.js';
import { createSemanticConfig } from './semanticConfig.js';
import {
  buildSemanticStateTransition,
  planSemanticTransition,
  rebuildDeckForSemanticConfig,
} from './semanticTransition.js';

const magusId = 'major.magician';

const buildState = () => {
  const deck = buildCanonicalDeckGenesis({ tradition: { id: 'thoth' } });
  const index = deck.findIndex(card => card.canonicalCardId === magusId);
  deck[index] = {
    ...deck[index],
    imageUrl: 'data:image/png;base64,manifested',
    exegesis: 'Generated reflection that should survive a system transition.',
    meta: { alchemical: 'SOLVE' },
    interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
    patina: 7,
    canonicalExpression: { stale: true },
    canonicalCorrespondences: { stale: true },
    sourceQualification: 'SOURCE_QUALIFIED',
    sourceIds: ['src.primary.crowley.book-of-thoth.1944'],
  };
  return {
    semanticConfig: createSemanticConfig({ tarotSystem: 'thoth' }),
    deck,
    reading: { readingRecord: { readingId: 'historical-reading' } },
    focusedCard: deck[index],
    isConsulting: true,
  };
};

describe('0.47 semantic transitions', () => {
  it('Thoth -> RWS preserves card identity and creative history while removing Thoth-only authority', () => {
    const state = buildState();
    const result = buildSemanticStateTransition({ state, patch: { tarotSystem: 'rws' } });
    const card = result.nextState.deck.find(entry => entry.canonicalCardId === magusId);

    expect(result.plan.rebuildDeck).toBe(true);
    expect(result.plan.invalidateReading).toBe(true);
    expect(result.plan.clearFocusedCard).toBe(true);
    expect(card.canonicalCardId).toBe(magusId);
    expect(card.name).toBe('THE MAGICIAN');
    expect(card.nameAuthority).toBe(DECK_GENESIS_AUTHORITIES.projectCompatibilityLabel);
    expect(card.nameSourceIds).toEqual([]);
    expect(card.imageUrl).toBe('data:image/png;base64,manifested');
    expect(card.exegesis).toMatch(/survive/);
    expect(card.patina).toBe(7);
    expect(card).not.toHaveProperty('canonicalExpression');
    expect(card).not.toHaveProperty('canonicalCorrespondences');
    expect(card).not.toHaveProperty('sourceQualification');
    expect(card).not.toHaveProperty('sourceIds');
    expect(result.nextState.reading).toBeNull();
    expect(result.nextState.focusedCard).toBeNull();
  });

  it('preserves creative layers from a truly old numeric-only deck record', () => {
    const oldDeck = [{
      id: 1,
      name: 'THE MAGUS',
      imageUrl: 'data:image/png;base64,legacy',
      exegesis: 'legacy numeric-only reflection',
      patina: 9,
    }];
    const rws = rebuildDeckForSemanticConfig({
      deck: oldDeck,
      semanticConfig: createSemanticConfig({ tarotSystem: 'rws' }),
    });
    const magician = rws.find(card => card.canonicalCardId === magusId);
    expect(magician.name).toBe('THE MAGICIAN');
    expect(magician.imageUrl).toBe('data:image/png;base64,legacy');
    expect(magician.exegesis).toBe('legacy numeric-only reflection');
    expect(magician.patina).toBe(9);
  });

  it('the same canonical IDs survive a full Thoth -> RWS deck rebuild', () => {
    const thoth = buildCanonicalDeckGenesis({ tradition: { id: 'thoth' } });
    const rws = rebuildDeckForSemanticConfig({
      deck: thoth,
      semanticConfig: createSemanticConfig({ tarotSystem: 'rws' }),
    });
    expect(rws.map(card => card.canonicalCardId)).toEqual(thoth.map(card => card.canonicalCardId));
    expect(rws).toHaveLength(78);
  });

  it('a lens-only change does not rebuild the deck, invalidate the reading, or clear the focused card', () => {
    const state = buildState();
    const result = buildSemanticStateTransition({
      state,
      patch: { interpretiveLenses: ['jungian_shadow'] },
    });
    expect(result.nextState.deck).toBe(state.deck);
    expect(result.nextState.reading).toBe(state.reading);
    expect(result.nextState.focusedCard).toBe(state.focusedCard);
    expect(result.nextState.semanticConfig.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(result.plan.interpretationOnly).toBe(true);
  });

  it('a ritual-theme-only change leaves Tarot facts untouched', () => {
    const state = buildState();
    const result = buildSemanticStateTransition({ state, patch: { ritualTheme: 'giordano_bruno' } });
    expect(result.plan.canonicalFactsChanged).toBe(false);
    expect(result.nextState.deck).toBe(state.deck);
    expect(result.nextState.reading).toBe(state.reading);
  });

  it('relation-method changes invalidate an open reading but do not rebuild identity or clear the focused card', () => {
    const state = buildState();
    const result = buildSemanticStateTransition({ state, patch: { relationMethod: 'disabled' } });
    expect(result.plan.rebuildDeck).toBe(false);
    expect(result.plan.invalidateReading).toBe(true);
    expect(result.plan.clearFocusedCard).toBe(false);
    expect(result.nextState.deck).toBe(state.deck);
    expect(result.nextState.reading).toBeNull();
    expect(result.nextState.focusedCard).toBe(state.focusedCard);
  });

  it('correspondence-profile changes invalidate reading/card authority surfaces without rewriting deck identity', () => {
    const state = buildState();
    const result = buildSemanticStateTransition({ state, patch: { correspondenceProfile: 'none' } });
    expect(result.plan.rebuildDeck).toBe(false);
    expect(result.plan.invalidateReading).toBe(true);
    expect(result.plan.clearFocusedCard).toBe(true);
    expect(result.nextState.deck).toBe(state.deck);
    expect(result.nextState.focusedCard).toBeNull();
  });

  it('the transition planner recognizes pure interpretation changes separately from semantic-authority changes', () => {
    const current = createSemanticConfig({ tarotSystem: 'thoth' });
    const lensOnly = createSemanticConfig({ tarotSystem: 'thoth', interpretiveLenses: ['jungian_shadow'] });
    const plan = planSemanticTransition({ current, next: lensOnly });
    expect(plan.interpretationOnly).toBe(true);
    expect(plan.canonicalFactsChanged).toBe(false);
  });
});
