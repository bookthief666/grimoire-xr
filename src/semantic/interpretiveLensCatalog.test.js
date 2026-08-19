import { describe, expect, it } from 'vitest';
import { INTERPRETIVE_LENSES, createSemanticConfig, updateSemanticConfig } from './semanticConfig.js';
import {
  INTERPRETIVE_LENS_AUTHORITY,
  INTERPRETIVE_LENS_CATALOG,
  buildInterpretiveLensPromptContext,
  getInterpretiveLens,
} from './interpretiveLensCatalog.js';

describe('0.47 interpretive lens catalog', () => {
  it('keeps catalog IDs in exact parity with semantic configuration vocabulary', () => {
    expect(INTERPRETIVE_LENS_CATALOG.map(entry => entry.id)).toEqual(INTERPRETIVE_LENSES);
    expect(new Set(INTERPRETIVE_LENSES).size).toBe(INTERPRETIVE_LENSES.length);
  });

  it('includes Bataille, Nietzsche, Neoplatonic theurgy and Thelemic HGA as project-authored lenses', () => {
    ['bataille_eroticism', 'nietzsche_dionysian', 'neoplatonic_theurgy', 'thelemic_hga'].forEach(id => {
      const entry = getInterpretiveLens(id);
      expect(entry).toBeTruthy();
      expect(entry.authority).toBe(INTERPRETIVE_LENS_AUTHORITY);
      expect(entry.directive.length).toBeGreaterThan(60);
    });
  });

  it('Bataille can coexist with Thoth + Crowley dignities without changing Tarot authority', () => {
    const before = createSemanticConfig({ tarotSystem: 'thoth' });
    const after = updateSemanticConfig(before, {
      interpretiveLenses: ['bataille_eroticism', 'nietzsche_dionysian'],
    });
    expect(after.tarotSystem).toBe('thoth');
    expect(after.correspondenceProfile).toBe('thoth_native');
    expect(after.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(after.interpretiveLenses).toEqual(['bataille_eroticism', 'nietzsche_dionysian']);
  });

  it('prompt context carries an explicit epistemic firewall', () => {
    const text = buildInterpretiveLensPromptContext(['bataille_eroticism', 'thelemic_hga']);
    expect(text).toContain(INTERPRETIVE_LENS_AUTHORITY);
    expect(text).toContain('Georges Bataille');
    expect(text).toContain('Thelemic Will & HGA');
    expect(text).toContain('MUST NOT recalculate, replace, contradict or invent canonical Tarot');
  });

  it('unknown lenses fail closed rather than becoming prompt instructions', () => {
    const text = buildInterpretiveLensPromptContext(['not-a-real-lens']);
    expect(text).toBe('INTERPRETIVE LENSES: none selected.');
  });
});
