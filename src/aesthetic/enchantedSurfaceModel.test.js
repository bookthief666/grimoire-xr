import { describe, expect, it } from 'vitest';
import {
  ENCHANTED_SURFACE_AUTHORITY,
  buildOracleSurfaceModel,
  buildThresholdSurfaceModel,
} from './enchantedSurfaceModel.js';

describe('enchanted surface presentation model', () => {
  it('keeps threshold state presentation-only', () => {
    expect(buildThresholdSurfaceModel()).toEqual({
      authority: ENCHANTED_SURFACE_AUTHORITY,
      state: 'dormant',
      cardCount: 3,
      sigils: ['△', '◇', '○'],
    });
    expect(buildThresholdSurfaceModel({ hasQuestion: true }).state).toBe('inscribed');
    expect(buildThresholdSurfaceModel({ hasQuestion: true, opening: true }).state).toBe('opening');
  });

  it('translates already-presented relation tones without computing Tarot doctrine', () => {
    const presentation = {
      positions: [
        { positionId: 'thesis' },
        { positionId: 'antithesis' },
        { positionId: 'synthesis' },
      ],
      relations: [
        { relationId: 'r1', tone: 'supportive', raw: { fromPositionId: 'thesis', toPositionId: 'antithesis' } },
        { relationId: 'r2', tone: 'contrary', raw: { fromPositionId: 'antithesis', toPositionId: 'synthesis' } },
      ],
      outerContext: { tone: 'contrary' },
      centerContext: { applied: true },
    };

    const before = JSON.stringify(presentation);
    const surface = buildOracleSurfaceModel(presentation);
    expect(surface.relations).toEqual([
      { relationId: 'r1', tone: 'supportive', fromIndex: 0, toIndex: 1 },
      { relationId: 'r2', tone: 'contrary', fromIndex: 1, toIndex: 2 },
    ]);
    expect(surface.outerTone).toBe('contrary');
    expect(surface.centerApplied).toBe(true);
    expect(JSON.stringify(presentation)).toBe(before);
  });

  it('treats unknown presentation tones as unresolved rather than inventing meaning', () => {
    const surface = buildOracleSurfaceModel({
      positions: [{ positionId: 'thesis' }, { positionId: 'antithesis' }],
      relations: [{ relationId: 'gap', tone: 'mystery', raw: { fromPositionId: 'thesis', toPositionId: 'antithesis' } }],
    });
    expect(surface.relations[0].tone).toBe('unresolved');
  });
});
