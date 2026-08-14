import { describe, expect, it } from 'vitest';
import {
  IMAGE_MODES,
  buildImageJobBody,
  canFinalizeCard,
  readImageGenerationResult,
} from './imageGeneration.js';

describe('image generation client contract', () => {
  it('builds a preview request by default without inventing a seed', () => {
    expect(buildImageJobBody(' occult tarot ')).toEqual({
      prompt: 'occult tarot',
      mode: IMAGE_MODES.preview,
    });
  });

  it('preserves an explicit final seed', () => {
    expect(buildImageJobBody('occult tarot', { mode: 'final', seed: 424242 })).toEqual({
      prompt: 'occult tarot',
      mode: IMAGE_MODES.final,
      seed: 424242,
    });
  });

  it('normalizes provider metadata beside the returned image', () => {
    expect(readImageGenerationResult({
      imageUrl: 'data:image/png;base64,AQID',
      provider: 'comfyui',
      mode: 'final',
      seed: 424242,
      width: 832,
      height: 1216,
      steps: 28,
      cfg: 4,
      sampler: 'dpmpp_2m',
      scheduler: 'karras',
    })).toEqual({
      imageUrl: 'data:image/png;base64,AQID',
      generation: {
        provider: 'comfyui',
        mode: IMAGE_MODES.final,
        seed: 424242,
        width: 832,
        height: 1216,
        steps: 28,
        cfg: 4,
        sampler: 'dpmpp_2m',
        scheduler: 'karras',
      },
    });
  });

  it('only allows finalization for a reproducible ComfyUI preview', () => {
    expect(canFinalizeCard({
      promptUsed: 'occult tarot',
      generation: { provider: 'comfyui', mode: 'preview', seed: 7 },
    })).toBe(true);
    expect(canFinalizeCard({
      promptUsed: 'occult tarot',
      generation: { provider: 'comfyui', mode: 'final', seed: 7 },
    })).toBe(false);
    expect(canFinalizeCard({
      promptUsed: 'occult tarot',
      generation: { provider: 'gemini', mode: 'preview', seed: 7 },
    })).toBe(false);
    expect(canFinalizeCard({ promptUsed: 'occult tarot' })).toBe(false);
  });
});
