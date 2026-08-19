import { describe, expect, it } from 'vitest';
import {
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  updateSemanticConfig,
  validateSemanticConfig,
} from './semanticConfig.js';

describe('0.47 semantic configuration', () => {
  it('defaults Thoth to its source-qualified correspondence profile and Crowley dignities', () => {
    const config = createSemanticConfig();
    expect(config.tarotSystem).toBe('thoth');
    expect(config.correspondenceProfile).toBe('thoth_native');
    expect(config.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(config.interpretiveLenses).toEqual([]);
    expect(validateSemanticConfig(config)).toEqual([]);
  });

  it('does not invent an RWS correspondence pack or relation method for a fresh config', () => {
    const config = createSemanticConfig({ tarotSystem: 'rws' });
    expect(config.correspondenceProfile).toBe('none');
    expect(config.relationMethod).toBe('disabled');
  });

  it('does not invent a Marseille correspondence pack or relation method', () => {
    const config = createSemanticConfig({ tarotSystem: 'marseille' });
    expect(config.correspondenceProfile).toBe('none');
    expect(config.relationMethod).toBe('disabled');
  });

  it('rejects Thoth-native correspondence authority under another Tarot system', () => {
    expect(() => createSemanticConfig({ tarotSystem: 'rws', correspondenceProfile: 'thoth_native' }))
      .toThrow(/requires tarotSystem=thoth/);
  });

  it('allows Crowley LXXVIII relations to be explicitly selected under RWS without claiming correspondences', () => {
    const config = createSemanticConfig({ tarotSystem: 'rws', relationMethod: 'crowley_lxxviii_dignities' });
    expect(config.tarotSystem).toBe('rws');
    expect(config.correspondenceProfile).toBe('none');
    expect(config.relationMethod).toBe('crowley_lxxviii_dignities');
  });

  it('adding a Jungian lens to Thoth does not alter correspondence or relation authority', () => {
    const before = createSemanticConfig({ tarotSystem: 'thoth' });
    const after = updateSemanticConfig(before, { interpretiveLenses: ['jungian_shadow'] });
    expect(after.tarotSystem).toBe('thoth');
    expect(after.correspondenceProfile).toBe('thoth_native');
    expect(after.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(after.interpretiveLenses).toEqual(['jungian_shadow']);
  });

  it('adding Bruno lens/theme to Thoth does not alter its Tarot engine', () => {
    const before = createSemanticConfig({ tarotSystem: 'thoth' });
    const after = updateSemanticConfig(before, {
      interpretiveLenses: ['bruno_mnemonic'],
      ritualTheme: 'giordano_bruno',
    });
    expect(after.tarotSystem).toBe('thoth');
    expect(after.correspondenceProfile).toBe('thoth_native');
    expect(after.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(after.ritualTheme).toBe('giordano_bruno');
  });

  it('switching Tarot system adopts conservative target-system defaults while preserving lens/theme', () => {
    const before = createSemanticConfig({
      tarotSystem: 'thoth',
      interpretiveLenses: ['jungian_shadow'],
      ritualTheme: 'astarte_venus',
    });
    const after = updateSemanticConfig(before, { tarotSystem: 'rws' });
    expect(after.tarotSystem).toBe('rws');
    expect(after.correspondenceProfile).toBe('none');
    expect(after.relationMethod).toBe('disabled');
    expect(after.interpretiveLenses).toEqual(['jungian_shadow']);
    expect(after.ritualTheme).toBe('astarte_venus');
  });

  it('legacy RWS migration preserves its former Crowley relation behavior explicitly but drops unsupported Golden Dawn authority', () => {
    const migrated = semanticConfigFromLegacyTradition({ id: 'rws', name: 'Rider-Waite-Smith' });
    expect(migrated.config.tarotSystem).toBe('rws');
    expect(migrated.config.correspondenceProfile).toBe('none');
    expect(migrated.config.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(migrated.migrationNotes).toContain('legacy_golden_dawn_profile_not_claimed_without_source_pack');
  });

  it('legacy Bruno and Astarte migrate as lenses/themes rather than Tarot systems', () => {
    const bruno = semanticConfigFromLegacyTradition({ id: 'bruno' }).config;
    const astarte = semanticConfigFromLegacyTradition({ id: 'astarte' }).config;
    expect(bruno.tarotSystem).toBe('rws');
    expect(bruno.interpretiveLenses).toEqual(['bruno_mnemonic']);
    expect(bruno.ritualTheme).toBe('giordano_bruno');
    expect(astarte.tarotSystem).toBe('rws');
    expect(astarte.interpretiveLenses).toEqual(['astarte_venus_devotional']);
    expect(astarte.ritualTheme).toBe('astarte_venus');
  });
});
