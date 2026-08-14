import { describe, expect, it } from 'vitest';
import {
  ART_STYLES,
  EROS_LEVELS,
  TECH_LEVELS,
  TRADITIONS,
} from '../grimoireCatalog.js';
import { ATMOSPHERE_MODES } from './vrContent.js';
import {
  ART_STYLE_FAMILIES,
  SPATIAL_COMPOSER_STAGES,
  buildComposerSnapshot,
  buildEffigyParameters,
  getAwakenReadiness,
  getChoiceWindow,
  getStyleFamilyForIndex,
  groupArtStyles,
  hashSubject,
  normalizeComposerIndices,
  navigateComposer,
  selectComposerStage,
  wrapIndex,
} from './spatialRitualModel.js';

describe('Spatial Ritual Composer model', () => {
  it('defines a complete altar journey without duplicating canonical catalogs', () => {
    expect(SPATIAL_COMPOSER_STAGES.map(stage => stage.id)).toEqual([
      'subject', 'tradition', 'aesthetic', 'eros', 'intellect', 'atmosphere', 'review',
    ]);
    expect(TRADITIONS).toHaveLength(11);
    expect(EROS_LEVELS).toHaveLength(6);
    expect(TECH_LEVELS).toHaveLength(3);
    expect(ATMOSPHERE_MODES).toHaveLength(5);
  });

  it('groups every aesthetic exactly once into the seven existing constellations', () => {
    const groups = groupArtStyles();
    expect(groups.map(group => group.label)).toEqual([
      'CLASSICAL', 'ESOTERIC', 'ANCIENT', 'MODERN', 'SURREAL', 'EAST ASIAN', 'EXPERIMENTAL',
    ]);
    expect(groups).toHaveLength(7);
    const grouped = groups.flatMap(group => group.styles);
    expect(grouped).toHaveLength(ART_STYLES.length);
    expect(new Set(grouped.map(style => style.id)).size).toBe(ART_STYLES.length);
    grouped.forEach(style => expect(ART_STYLES[style.catalogIndex].id).toBe(style.id));
    expect(ART_STYLE_FAMILIES).toHaveLength(7);
  });

  it('wraps selection rails in both directions and reports the focused trio', () => {
    expect(wrapIndex(-1, 11)).toBe(10);
    expect(wrapIndex(11, 11)).toBe(0);
    expect(wrapIndex(4, 0)).toBe(0);
    const window = getChoiceWindow(TRADITIONS, 0);
    expect(window.previous.id).toBe(TRADITIONS.at(-1).id);
    expect(window.current.id).toBe(TRADITIONS[0].id);
    expect(window.next.id).toBe(TRADITIONS[1].id);
  });

  it('makes every court directly addressable without imposing subject presets', () => {
    expect(navigateComposer({ stageIndex: 1 }, 1)).toEqual({ stageIndex: 2, aestheticMode: 'style' });
    expect(navigateComposer({ stageIndex: 2, aestheticMode: 'style' }, 1)).toEqual({ stageIndex: 3, aestheticMode: 'family' });
    expect(navigateComposer({ stageIndex: 2, aestheticMode: 'style' }, -1)).toEqual({ stageIndex: 1, aestheticMode: 'family' });
    expect(navigateComposer({ stageIndex: 0 }, -1).stageIndex).toBe(0);
    expect(navigateComposer({ stageIndex: 99 }, 1).stageIndex).toBe(SPATIAL_COMPOSER_STAGES.length - 1);
    expect(selectComposerStage(2)).toEqual({ stageIndex: 2, aestheticMode: 'style' });
    expect(selectComposerStage(6)).toEqual({ stageIndex: 6, aestheticMode: 'family' });
    expect(selectComposerStage(-30).stageIndex).toBe(0);
  });

  it('normalizes foreign or damaged indices and resolves the selected style family', () => {
    const normalized = normalizeComposerIndices({
      traditionIndex: -1,
      styleIndex: ART_STYLES.length + 1,
      erosIndex: Number.NaN,
      techIndex: 99,
      atmosphereMode: 'veiled',
    });
    expect(normalized).toEqual({
      traditionIndex: TRADITIONS.length - 1,
      styleIndex: 1,
      erosIndex: 0,
      techIndex: 0,
      atmosphereIndex: ATMOSPHERE_MODES.findIndex(entry => entry.id === 'veiled'),
    });
    const pixelIndex = ART_STYLES.findIndex(style => style.id === 'pixel');
    expect(getStyleFamilyForIndex(pixelIndex).label).toBe('MODERN');
  });

  it('builds a deterministic, bounded effigy for Unicode and long subjects', () => {
    const subject = `Giordano Bruno ✶ ${'memory '.repeat(100)}`;
    const first = buildEffigyParameters({
      subject,
      traditionIndex: 9,
      styleIndex: 21,
      erosIndex: 5,
      techIndex: 2,
      atmosphereMode: 'balanced',
    });
    const second = buildEffigyParameters({
      subject,
      traditionIndex: 9,
      styleIndex: 21,
      erosIndex: 5,
      techIndex: 2,
      atmosphereMode: 'balanced',
    });
    expect(first).toEqual(second);
    expect(hashSubject(subject)).toBe(hashSubject(subject));
    expect(first.coreSides).toBeGreaterThanOrEqual(3);
    expect(first.coreSides).toBeLessThanOrEqual(8);
    expect(first.lineCount).toBeGreaterThanOrEqual(7);
    expect(first.lineCount).toBeLessThanOrEqual(12);
    expect(first.pulseAmplitude).toBeCloseTo(0.088);
    expect(first.inscriptionLayers).toBe(3);
  });

  it('returns specific awakening gates for subject, provider, demo, and busy states', () => {
    expect(getAwakenReadiness({ subject: '   ', demoMode: true })).toMatchObject({ ready: false, code: 'subject' });
    expect(getAwakenReadiness({ subject: 'Babalon', demoMode: false })).toMatchObject({ ready: false, code: 'checking' });
    expect(getAwakenReadiness({ subject: 'Babalon', health: { textConfigured: false } })).toMatchObject({ ready: false, code: 'text-provider' });
    expect(getAwakenReadiness({ subject: 'Babalon', demoMode: true })).toMatchObject({ ready: true, code: 'demo' });
    expect(getAwakenReadiness({ subject: 'Babalon', health: { textConfigured: true } })).toMatchObject({ ready: true, code: 'live' });
    expect(getAwakenReadiness({ subject: 'Babalon', demoMode: true, busy: true })).toMatchObject({ ready: false, code: 'busy' });
  });

  it('captures a stable review snapshot with separate text and image readiness', () => {
    const input = {
      subject: '  Giordano   Bruno ',
      traditionIndex: 9,
      styleIndex: ART_STYLES.findIndex(style => style.id === 'pixel'),
      erosIndex: 2,
      techIndex: 1,
      atmosphereMode: 'adaptive',
      demoMode: false,
      health: { textConfigured: true, imageConfigured: false },
    };
    const snapshot = buildComposerSnapshot(input);
    input.subject = 'MUTATED';
    expect(snapshot.subject).toBe('Giordano Bruno');
    expect(snapshot.tradition.id).toBe('bruno');
    expect(snapshot.aesthetic).toMatchObject({ id: 'pixel', family: 'MODERN' });
    expect(snapshot.eros.label).toBe('BOLD');
    expect(snapshot.intellect.label).toBe('ADEPT');
    expect(snapshot.textReady).toBe(true);
    expect(snapshot.imageReady).toBe(false);
    expect(snapshot.readiness.ready).toBe(true);
  });
});
