import { describe, expect, it } from 'vitest';
import {
  normalizeComfyOutputRef,
  normalizeImageJobRequest,
} from './image-request.mjs';

describe('image job request normalization', () => {
  it('defaults unknown modes to preview and creates a seed', () => {
    expect(normalizeImageJobRequest(
      { prompt: 'occult tarot', mode: 'unknown' },
      { random: () => 0.5 },
    )).toEqual({
      prompt: 'occult tarot',
      mode: 'preview',
      seed: Math.floor(0.5 * Number.MAX_SAFE_INTEGER),
    });
  });

  it('preserves an explicit zero seed instead of treating it as missing', () => {
    expect(normalizeImageJobRequest({
      prompt: 'occult tarot',
      mode: 'final',
      seed: 0,
    })).toMatchObject({ mode: 'final', seed: 0 });
  });

  it('accepts a generated Grimoire Comfy output for refine mode', () => {
    expect(normalizeImageJobRequest({
      prompt: 'occult tarot',
      mode: 'refine',
      seed: 7,
      denoise: 0.28,
      sourceImage: {
        filename: 'Grimoire_00001_.png',
        subfolder: '',
        type: 'output',
      },
    })).toEqual({
      prompt: 'occult tarot',
      mode: 'refine',
      seed: 7,
      denoise: 0.28,
      sourceImage: {
        filename: 'Grimoire_00001_.png',
        subfolder: '',
        type: 'output',
      },
    });
  });

  it('rejects traversal, arbitrary output names, and non-output references', () => {
    expect(normalizeComfyOutputRef({ filename: '../Grimoire.png', type: 'output' })).toBeNull();
    expect(normalizeComfyOutputRef({ filename: 'OtherTool_00001_.png', type: 'output' })).toBeNull();
    expect(normalizeComfyOutputRef({ filename: 'Grimoire_00001_.png', type: 'input' })).toBeNull();
  });

  it('rejects refine when ComfyUI is not the image provider', () => {
    expect(() => normalizeImageJobRequest({
      prompt: 'occult tarot',
      mode: 'refine',
      sourceImage: { filename: 'Grimoire_00001_.png', type: 'output' },
    }, { provider: 'gemini' })).toThrow('Refine mode requires the ComfyUI image provider.');
  });

  it('rejects unsafe denoise values', () => {
    expect(() => normalizeImageJobRequest({
      prompt: 'occult tarot',
      mode: 'refine',
      denoise: 1.2,
      sourceImage: { filename: 'Grimoire_00001_.png', type: 'output' },
    })).toThrow('Refine denoise must be between 0.05 and 0.95.');
  });
});
