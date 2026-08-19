import { describe, expect, it } from 'vitest';
import { createSemanticConfig } from './semanticConfig.js';
import {
  resolveSemanticBridgeConfig,
  semanticBridgeConfigFromReadingRecord,
} from './semanticBridgeConfig.js';

describe('0.47 semantic bridge config resolver', () => {
  it('prefers explicit semanticConfig over legacy tradition bundles', () => {
    const explicit = createSemanticConfig({
      tarotSystem: 'thoth',
      interpretiveLenses: ['jungian_shadow'],
      ritualTheme: 'giordano_bruno',
    });
    const resolved = resolveSemanticBridgeConfig({
      semanticConfig: explicit,
      tradition: { id: 'shadow' },
    });
    expect(resolved.tarotSystem).toBe('thoth');
    expect(resolved.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(resolved.interpretiveLenses).toEqual(['jungian_shadow']);
    expect(resolved.ritualTheme).toBe('giordano_bruno');
  });

  it('keeps legacy compatibility through the deterministic migration layer', () => {
    const resolved = resolveSemanticBridgeConfig({ tradition: { id: 'bruno' }, readingDepth: 'magus' });
    expect(resolved.tarotSystem).toBe('rws');
    expect(resolved.correspondenceProfile).toBe('none');
    expect(resolved.relationMethod).toBe('disabled');
    expect(resolved.interpretiveLenses).toEqual(['bruno_mnemonic']);
    expect(resolved.ritualTheme).toBe('giordano_bruno');
    expect(resolved.readingDepth).toBe('magus');
  });

  it('can reconstruct the semantic config recorded by an immutable ReadingRecord', () => {
    const config = semanticBridgeConfigFromReadingRecord({
      input: {
        tarotSystem: 'rws',
        correspondenceProfile: 'none',
        relationMethod: 'crowley_lxxviii_dignities',
        lenses: ['jungian_shadow'],
        readingDepth: 'magus',
      },
      presentationContext: { ritualTheme: 'giordano_bruno' },
    });
    expect(config).toMatchObject({
      tarotSystem: 'rws',
      correspondenceProfile: 'none',
      relationMethod: 'crowley_lxxviii_dignities',
      interpretiveLenses: ['jungian_shadow'],
      ritualTheme: 'giordano_bruno',
      readingDepth: 'magus',
    });
  });
});
