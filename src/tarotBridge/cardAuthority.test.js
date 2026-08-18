import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import {
  CARD_RELIC_AUTHORITY_VERSION,
  buildCardRelicAuthority,
  formatAuthorityValue,
} from './cardAuthority.js';

describe('0.38 card relic authority presentation model', () => {
  it('exposes source-qualified Thoth identity and correspondence layers separately from generated reflection', () => {
    const deck = buildCanonicalDeckGenesis({ tradition: { id: 'thoth', name: 'Book of Thoth' } });
    const card = {
      ...deck[23], // Two of Wands / Dominion
      exegesis: 'Generated interpretation.',
      exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
      meta: { hebrew: 'Generated reflection' },
      interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
      visual: 'Generated image direction.',
      visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
      generation: { provider: 'comfyui', mode: 'preview', width: 640, height: 960, steps: 18, seed: 424242 },
    };

    const model = buildCardRelicAuthority({ card, tradition: { id: 'thoth', name: 'Book of Thoth' } });

    expect(model.version).toBe(CARD_RELIC_AUTHORITY_VERSION);
    expect(model.identity).toMatchObject({
      cardId: 'minor.staffs.two',
      displayName: 'TWO OF WANDS',
      authority: 'SOURCE_QUALIFIED_CANONICAL_EXPRESSION',
    });
    expect(model.sourceQualification).toBe('SOURCE_QUALIFIED');
    expect(model.expressionFields.find(field => field.fieldId === 'nativeTitle')?.value).toBe('DOMINION');
    expect(model.correspondenceFields.find(field => field.fieldId === 'planet')?.value).toBe('MARS');
    expect(model.correspondenceFields.find(field => field.fieldId === 'zodiacSign')?.value).toBe('ARIES');
    expect(model.canonicalSourceIds).toContain('src.primary.crowley.book-of-thoth.1944');
    expect(model.generatedLayers).toEqual({
      exegesis: 'MODEL_GENERATED_INTERPRETATION',
      reflectiveMeta: 'MODEL_GENERATED_REFLECTION',
      visualDirection: 'MODEL_GENERATED_IMAGE_DIRECTION',
    });
    expect(model.imageGeneration).toMatchObject({ provider: 'comfyui', mode: 'preview', seed: 424242 });
  });

  it('does not pretend an unsourced compatibility label is a source-qualified expression', () => {
    const deck = buildCanonicalDeckGenesis({ tradition: { id: 'rws', name: 'Rider-Waite-Smith' } });
    const model = buildCardRelicAuthority({ card: deck[1], tradition: { id: 'rws', name: 'Rider-Waite-Smith' } });

    expect(model.identity).toMatchObject({
      cardId: 'major.magician',
      displayName: 'THE MAGICIAN',
      authority: 'PROJECT_COMPATIBILITY_LABEL',
    });
    expect(model.sourceQualification).toBe('SOURCE_PACK_PENDING');
    expect(model.expressionFields).toEqual([]);
    expect(model.correspondenceFields).toEqual([]);
    expect(model.canonicalSourceIds).toEqual([]);
  });

  it('marks old card interpretation fields as unclassified rather than silently source-qualified', () => {
    const deck = buildCanonicalDeckGenesis({ tradition: 'thoth' });
    const model = buildCardRelicAuthority({
      card: { ...deck[0], exegesis: 'Old text', meta: { planet: 'Old value' }, visual: 'Old visual' },
      tradition: 'thoth',
    });
    expect(model.generatedLayers).toEqual({
      exegesis: 'LEGACY_UNCLASSIFIED_INTERPRETATION',
      reflectiveMeta: 'LEGACY_UNCLASSIFIED_REFLECTION',
      visualDirection: 'LEGACY_UNCLASSIFIED_IMAGE_DIRECTION',
    });
  });

  it('formats structured canonical values without losing their fields', () => {
    expect(formatAuthorityValue({ start: 0, end: 10, unit: 'DEGREES_OF_SIGN' }))
      .toBe('{"start":0,"end":10,"unit":"DEGREES_OF_SIGN"}');
  });
});
