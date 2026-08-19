import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis } from '../tarotBridge/canonicalDeckGenesis.js';
import { createSemanticConfig } from './semanticConfig.js';
import {
  applySemanticPatchToAppState,
  createInitialSemanticConfig,
  migrateAppStateSemanticConfig,
} from './semanticRuntimeAdapter.js';

const traditions = [
  { id: 'thoth', name: 'Book of Thoth' },
  { id: 'rws', name: 'Rider-Waite-Smith' },
  { id: 'marseille', name: 'Tarot de Marseille' },
  { id: 'shadow', name: 'Jungian Shadow' },
  { id: 'bruno', name: 'Giordano Bruno' },
];

const state = () => ({
  selectedTradition: traditions[0],
  techLevel: 1,
  semanticConfig: createSemanticConfig({ tarotSystem: 'thoth' }),
  deck: buildCanonicalDeckGenesis({ tradition: { id: 'thoth' } }),
  reading: { readingRecord: { readingId: 'current', input: { tarotSystem: 'thoth' } } },
  focusedCard: null,
  isConsulting: false,
});

describe('0.47 app semantic runtime adapter', () => {
  it('creates initial semantic authority from old persisted controls', () => {
    const config = createInitialSemanticConfig({ selectedTradition: traditions[0], techLevel: 2 });
    expect(config.tarotSystem).toBe('thoth');
    expect(config.readingDepth).toBe('magus');
  });

  it('Bataille lens changes interpretation only and never turns selectedTradition into a philosophy preset', () => {
    const before = state();
    const result = applySemanticPatchToAppState({
      state: before,
      patch: { interpretiveLenses: ['bataille_eroticism'] },
      traditions,
    });
    expect(result.nextState.semanticConfig.interpretiveLenses).toEqual(['bataille_eroticism']);
    expect(result.nextState.semanticConfig.tarotSystem).toBe('thoth');
    expect(result.nextState.semanticConfig.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(result.nextState.selectedTradition.id).toBe('thoth');
    expect(result.nextState.deck).toBe(before.deck);
    expect(result.nextState.reading).toBe(before.reading);
  });

  it('Thoth -> RWS updates the legacy mirror only after authority-safe transition', () => {
    const before = state();
    const result = applySemanticPatchToAppState({
      state: before,
      patch: { tarotSystem: 'rws' },
      traditions,
    });
    expect(result.nextState.semanticConfig.tarotSystem).toBe('rws');
    expect(result.nextState.selectedTradition.id).toBe('rws');
    expect(result.nextState.reading).toBeNull();
    expect(result.nextState.deck).toHaveLength(78);
    expect(result.nextState.deck.find(card => card.canonicalCardId === 'major.magician').name).toBe('THE MAGICIAN');
  });

  it('reading depth owns the old numeric tech-level mirror', () => {
    const before = state();
    const result = applySemanticPatchToAppState({
      state: before,
      patch: { readingDepth: 'neophyte' },
      traditions,
    });
    expect(result.nextState.semanticConfig.readingDepth).toBe('neophyte');
    expect(result.nextState.techLevel).toBe(0);
    expect(result.nextState.reading).toBe(before.reading);
  });

  it('legacy Bruno sessions migrate to RWS + Bruno lens rather than Bruno-as-Tarot-system', () => {
    const historical = { readingRecord: { readingId: 'historical', input: { tarotSystem: 'rws' } } };
    const migrated = migrateAppStateSemanticConfig({
      state: {
        selectedTradition: traditions[4],
        techLevel: 2,
        deck: [],
        reading: historical,
      },
      traditions,
    });
    expect(migrated.state.semanticConfig.tarotSystem).toBe('rws');
    expect(migrated.state.semanticConfig.interpretiveLenses).toEqual(['bruno_mnemonic']);
    expect(migrated.state.selectedTradition.id).toBe('rws');
    expect(migrated.state.techLevel).toBe(2);
    expect(migrated.state.reading).toBe(historical);
  });
});
