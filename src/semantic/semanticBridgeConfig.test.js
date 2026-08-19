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

  it('preserves the reading depth carried by explicit semanticConfig when no override is requested', () => {
    const explicit = createSemanticConfig({ tarotSystem: 'thoth', readingDepth: 'magus' });
    expect(resolveSemanticBridgeConfig({ semanticConfig: explicit }).readingDepth).toBe('magus');
  });

  it('allows a deliberate readingDepth override without mutating the original config', () => {
    const explicit = createSemanticConfig({ tarotSystem: 'thoth', readingDepth: 'magus' });
    const resolved = resolveSemanticBridgeConfig({ semanticConfig: explicit, readingDepth: 'neophyte' });
    expect(resolved.readingDepth).toBe('neophyte');
    expect(explicit.readingDepth).toBe('magus');
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

  it('projects obsolete historical record vocabulary conservatively without rewriting the record', () => {
    const record = {
      input: {
        tarotSystem: 'rws',
        correspondenceProfile: 'golden_dawn',
        relationMethod: 'crowley_lxxviii_dignities',
        lenses: ['jungian_shadow', 'obsolete_private_lens'],
        readingDepth: 'adept',
      },
      presentationContext: { ritualTheme: 'none' },
    };
    const snapshot = JSON.stringify(record);
    const config = semanticBridgeConfigFromReadingRecord(record);
    expect(config.correspondenceProfile).toBe('none');
    expect(config.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(config.interpretiveLenses).toEqual(['jungian_shadow']);
    expect(JSON.stringify(record)).toBe(snapshot);
  });

  it('fails conservative when a historical relation method is no longer supported', () => {
    const config = semanticBridgeConfigFromReadingRecord({
      input: {
        tarotSystem: 'thoth',
        correspondenceProfile: 'thoth_native',
        relationMethod: 'thoth_native',
      },
    });
    expect(config.tarotSystem).toBe('thoth');
    expect(config.correspondenceProfile).toBe('thoth_native');
    expect(config.relationMethod).toBe('disabled');
  });
});
