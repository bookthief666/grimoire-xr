import { describe, expect, it } from 'vitest';
import { createSemanticConfig } from './semanticConfig.js';
import { migrateSessionSemanticConfig, readingRecordWasPreserved } from './sessionSemanticMigration.js';

describe('0.47 persisted-session semantic migration', () => {
  it('uses old ReadingRecord canonical axes while preserving a legacy Jungian lens when the record predates lens fields', () => {
    const readingRecord = {
      readingId: 'legacy-shadow-reading',
      input: { tarotSystem: 'rws', relationMethod: 'disabled' },
      relations: [],
    };
    const before = {
      selectedTradition: { id: 'shadow', name: 'Jungian Shadow' },
      techLevel: 2,
      reading: { readingRecord },
    };
    const result = migrateSessionSemanticConfig(before);
    expect(result.migrated).toBe(true);
    expect(result.source).toBe('READING_RECORD_SEMANTIC_PROJECTION');
    expect(result.state.semanticConfig.tarotSystem).toBe('rws');
    expect(result.state.semanticConfig.correspondenceProfile).toBe('none');
    expect(result.state.semanticConfig.relationMethod).toBe('disabled');
    expect(result.state.semanticConfig.interpretiveLenses).toEqual(['jungian_shadow']);
    expect(result.state.semanticConfig.readingDepth).toBe('magus');
    expect(result.state.reading.readingRecord).toBe(readingRecord);
    expect(readingRecordWasPreserved(before, result.state)).toBe(true);
  });

  it('prefers explicit ReadingRecord lenses/theme/depth over conflicting legacy session controls', () => {
    const readingRecord = {
      readingId: 'bataille-reading',
      input: {
        tarotSystem: 'thoth',
        correspondenceProfile: 'thoth_native',
        relationMethod: 'crowley_lxxviii_dignities',
        lenses: ['bataille_eroticism', 'nietzsche_dionysian'],
        readingDepth: 'neophyte',
      },
      presentationContext: { ritualTheme: 'none' },
    };
    const before = {
      selectedTradition: { id: 'bruno', name: 'Giordano Bruno' },
      techLevel: 2,
      reading: { readingRecord },
    };
    const result = migrateSessionSemanticConfig(before);
    expect(result.state.semanticConfig.tarotSystem).toBe('thoth');
    expect(result.state.semanticConfig.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(result.state.semanticConfig.interpretiveLenses).toEqual(['bataille_eroticism', 'nietzsche_dionysian']);
    expect(result.state.semanticConfig.ritualTheme).toBe('none');
    expect(result.state.semanticConfig.readingDepth).toBe('neophyte');
    expect(result.state.reading.readingRecord).toBe(readingRecord);
  });

  it('does not remigrate a valid v1 semantic configuration', () => {
    const config = createSemanticConfig({
      tarotSystem: 'thoth',
      interpretiveLenses: ['bruno_mnemonic'],
      ritualTheme: 'giordano_bruno',
    });
    const before = { semanticConfig: config, reading: null };
    const result = migrateSessionSemanticConfig(before);
    expect(result.migrated).toBe(false);
    expect(result.source).toBe('SEMANTIC_CONFIG_V1');
    expect(result.state.semanticConfig).toEqual(config);
  });

  it('legacy RWS sessions make prior relation behavior explicit without claiming a Golden Dawn source pack', () => {
    const result = migrateSessionSemanticConfig({
      selectedTradition: { id: 'rws', name: 'Rider-Waite-Smith' },
      techLevel: 1,
    });
    expect(result.state.semanticConfig.tarotSystem).toBe('rws');
    expect(result.state.semanticConfig.correspondenceProfile).toBe('none');
    expect(result.state.semanticConfig.relationMethod).toBe('crowley_lxxviii_dignities');
    expect(result.migrationNotes).toContain('legacy_golden_dawn_profile_not_claimed_without_source_pack');
  });

  it('legacy Bruno remains an interpretive/ritual choice rather than becoming a Tarot system', () => {
    const result = migrateSessionSemanticConfig({ selectedTradition: { id: 'bruno' }, techLevel: 1 });
    expect(result.state.semanticConfig.tarotSystem).toBe('rws');
    expect(result.state.semanticConfig.interpretiveLenses).toEqual(['bruno_mnemonic']);
    expect(result.state.semanticConfig.ritualTheme).toBe('giordano_bruno');
  });
});
