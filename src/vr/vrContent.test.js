import { describe, expect, it } from 'vitest';
import {
  ATMOSPHERE_MODES,
  PLANETARY_STATIONS,
  TAROT_ARCHETYPES,
  buildSealPoints,
  buildStationPose,
  createPalaceSnapshot,
  normalizeRitual,
  placeSpreadCard,
  restorePalaceSnapshot,
  resolveAtmosphereTier,
  selectForgeTargets,
  selectSpreadCards,
  truncateForPanel,
} from './vrContent.js';

describe('Grimoire VR content model', () => {
  it('maps exactly seven unique planetary courts to seven unique capabilities', () => {
    expect(PLANETARY_STATIONS).toHaveLength(7);
    expect(new Set(PLANETARY_STATIONS.map(station => station.planet)).size).toBe(7);
    expect(new Set(PLANETARY_STATIONS.map(station => station.id)).size).toBe(7);
  });

  it('keeps every planetary portal in the forward temple apse', () => {
    const poses = PLANETARY_STATIONS.map((_, index) => buildStationPose(index));
    expect(poses.every(pose => pose.position[2] < -2)).toBe(true);
    expect(poses[3].position[2]).toBeLessThan(poses[0].position[2]);
    expect(poses[3].position[0]).toBeCloseTo(0);
    for (let index = 0; index < 3; index += 1) {
      expect(poses[index].position[0]).toBeCloseTo(-poses.at(-(index + 1)).position[0]);
    }
  });

  it('normalizes incomplete model output into the complete 78-card architecture', () => {
    const ritual = normalizeRitual({
      dossier: 'A living thesis',
      cards: [{ name: 'The First Shadow' }],
      sealWords: ['memory'],
    }, 'Giordano Bruno');
    expect(ritual.dossier).toBe('A living thesis');
    expect(ritual.cards).toHaveLength(78);
    expect(ritual.cards[0].name).toBe('The First Shadow');
    expect(ritual.cards[77].name).toBe('KING OF PENTACLES');
    expect(ritual.sealWords).toEqual(['MEMORY']);
  });

  it('defines and deterministically draws from all 78 Tarot archetypes', () => {
    expect(TAROT_ARCHETYPES).toHaveLength(78);
    expect(TAROT_ARCHETYPES.filter(card => card.arcana === 'MAJOR')).toHaveLength(22);
    expect(selectSpreadCards(TAROT_ARCHETYPES, 10, 'Bruno')).toEqual(
      selectSpreadCards(TAROT_ARCHETYPES, 10, 'Bruno'),
    );
    expect(new Set(selectSpreadCards(TAROT_ARCHETYPES, 10, 'Bruno').map(card => card.name)).size).toBe(10);
  });

  it('moves unique cards across the manual reading cloth', () => {
    expect(placeSpreadCard([1, 2, null], 2, 1)).toEqual([null, 2, 1]);
    expect(placeSpreadCard([1, 2, 3], 1, null)).toEqual([1, null, 3]);
  });

  it('selects a bounded resumable Grand Forge slice from the current card', () => {
    const cards = TAROT_ARCHETYPES.map((card, id) => ({ ...card, id }));
    const targets = selectForgeTargets(cards, [{ id: 5, imageUrl: 'ready' }], 5, 3);
    expect(targets.map(card => card.id)).toEqual([6, 7, 8]);
    expect(selectForgeTargets(cards, [], 77, 2).map(card => card.id)).toEqual([77, 0]);
  });

  it('offers explicit atmosphere modes and adapts the astral current for XR', () => {
    expect(ATMOSPHERE_MODES.map(mode => mode.id)).toEqual([
      'adaptive', 'vivid', 'balanced', 'veiled', 'off',
    ]);
    expect(resolveAtmosphereTier({ mode: 'adaptive', fps: 60, inXR: false })).toBe(3);
    expect(resolveAtmosphereTier({ mode: 'adaptive', fps: 60, inXR: false, mobile: true })).toBe(2);
    expect(resolveAtmosphereTier({ mode: 'adaptive', fps: 72, inXR: true })).toBe(2);
    expect(resolveAtmosphereTier({ mode: 'adaptive', fps: 45, inXR: true })).toBe(1);
    expect(resolveAtmosphereTier({ mode: 'off', fps: 90, inXR: false })).toBe(0);
  });

  it('builds deterministic closed mnemonic seals', () => {
    const first = buildSealPoints('Bruno');
    const second = buildSealPoints('Bruno');
    expect(first).toEqual(second);
    expect(first).toHaveLength(10);
    expect(first.at(-1)).toEqual(first[0]);
  });

  it('bounds text for a headset-readable panel', () => {
    expect(truncateForPanel('x'.repeat(100), 20)).toHaveLength(20);
  });

  it('persists text and progress without storing generated image payloads', () => {
    const snapshot = createPalaceSnapshot({
      subject: 'Giordano Bruno',
      traditionIndex: 99,
      styleIndex: 1,
      erosIndex: 1,
      ritual: { dossier: 'A palace of living shadows.' },
      awakened: true,
      forgedCard: {
        name: 'The Infinite Bond',
        exegesis: 'Memory becomes will.',
        visual: 'A seven-pointed constellation.',
        imageUrl: 'data:image/png;base64,too-large-for-local-storage',
      },
      completedCourtIds: ['scriptorium', 'forge', 'forge', 'not-a-court'],
    });

    expect(snapshot.traditionIndex).toBe(10);
    expect(snapshot.forgedCard.imageUrl).toBeNull();
    expect(snapshot.completedCourtIds).toEqual(['scriptorium', 'forge']);
  });

  it('rejects unknown palace versions and restores the current format', () => {
    expect(restorePalaceSnapshot('{"version":1}')).toBeNull();
    expect(restorePalaceSnapshot(JSON.stringify(createPalaceSnapshot({
      subject: 'Astarte',
      completedCourtIds: ['loom'],
    })))?.subject).toBe('Astarte');
  });
});
