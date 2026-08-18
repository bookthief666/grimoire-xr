import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import {
  RELIC_WORKSPACE_TAB_IDS,
  RELIC_WORKSPACE_TABS,
  buildRelicWorkspaceModel,
  normalizeRelicWorkspaceTab,
} from './relicWorkspace.js';

describe('0.39 relic workspace', () => {
  const makeCard = () => ({
    ...buildCanonicalDeckGenesis({ tradition: 'thoth' })[23],
    exegesis: 'Generated interpretation.',
    exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
    meta: { hebrew: 'QA reflection', planet: 'QA reflection', gematria: 42 },
    interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
    visual: 'Generated visual direction.',
    visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
    promptUsed: 'A deterministic visual prompt.',
    promptSchema: 'tarot-structured-v1',
    imageUrl: 'data:image/png;base64,qa',
    generation: { provider: 'comfyui', mode: 'preview', width: 640, height: 960, steps: 18, seed: 424242 },
    patina: 3,
  });

  it('defines exactly four stable workspace modes', () => {
    expect(RELIC_WORKSPACE_TABS.map(tab => tab.id)).toEqual([
      'relic', 'correspondences', 'interpretation', 'generation',
    ]);
    expect(RELIC_WORKSPACE_TAB_IDS.generation).toBe('generation');
    expect(normalizeRelicWorkspaceTab('CORRESPONDENCES')).toBe('correspondences');
    expect(normalizeRelicWorkspaceTab('unknown')).toBe('relic');
  });

  it('keeps canonical correspondence facts out of generated interpretation layers', () => {
    const model = buildRelicWorkspaceModel({ card: makeCard(), tradition: 'thoth' });
    expect(model.relic).toMatchObject({
      cardId: 'minor.staffs.two',
      displayName: 'TWO OF WANDS',
      sourceQualification: 'SOURCE_QUALIFIED',
      patina: 3,
    });
    expect(model.correspondences.expressionById.nativeTitle.value).toBe('DOMINION');
    expect(model.correspondences.correspondenceById.planet.value).toBe('MARS');
    expect(model.correspondences.correspondenceById.zodiacSign.value).toBe('ARIES');
    expect(model.interpretation).toMatchObject({
      exegesis: 'Generated interpretation.',
      exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
      reflectiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
      isSourceFact: false,
    });
    expect(model.generation).toMatchObject({
      visualAuthority: 'MODEL_GENERATED_IMAGE_DIRECTION',
      promptUsed: 'A deterministic visual prompt.',
      isSourceFact: false,
    });
  });

  it('preserves compatibility-label boundaries for traditions without reviewed expression packs', () => {
    const card = buildCanonicalDeckGenesis({ tradition: 'rws' })[23];
    const model = buildRelicWorkspaceModel({ card, tradition: 'rws' });
    expect(model.relic.sourceQualification).toBe('SOURCE_PACK_PENDING');
    expect(model.correspondences.expressionFields).toHaveLength(0);
    expect(model.correspondences.correspondenceFields).toHaveLength(0);
    expect(model.correspondences.sourceIds).toHaveLength(0);
  });
});
