import { describe, expect, it } from 'vitest';
import {
  IMAGE_MODES,
  buildImageJobBody,
  canFinalizeCard,
  canRefineCard,
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

  it('builds a refine request from a provider image without resending base64 pixels', () => {
    expect(buildImageJobBody('occult tarot', {
      mode: 'refine',
      seed: 424242,
      denoise: 0.28,
      sourceImage: {
        filename: 'Grimoire_00001_.png',
        subfolder: '',
        type: 'output',
      },
    })).toEqual({
      prompt: 'occult tarot',
      mode: IMAGE_MODES.refine,
      seed: 424242,
      denoise: 0.28,
      sourceImage: {
        filename: 'Grimoire_00001_.png',
        subfolder: '',
        type: 'output',
      },
    });
  });

  it('normalizes provider metadata beside the returned image', () => {
    expect(readImageGenerationResult({
      imageUrl: 'data:image/png;base64,AQID',
      provider: 'comfyui',
      mode: 'refine',
      seed: 424242,
      width: 832,
      height: 1216,
      steps: 28,
      cfg: 4,
      sampler: 'dpmpp_2m',
      scheduler: 'karras',
      denoise: 0.28,
      providerImage: {
        filename: 'GrimoireRefined_00001_.png',
        subfolder: '',
        type: 'output',
      },
    })).toEqual({
      imageUrl: 'data:image/png;base64,AQID',
      generation: {
        provider: 'comfyui',
        mode: IMAGE_MODES.refine,
        seed: 424242,
        width: 832,
        height: 1216,
        steps: 28,
        cfg: 4,
        sampler: 'dpmpp_2m',
        scheduler: 'karras',
        denoise: 0.28,
        providerImage: {
          filename: 'GrimoireRefined_00001_.png',
          subfolder: '',
          type: 'output',
        },
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
      generation: { provider: 'comfyui', mode: 'refine', seed: 7 },
    })).toBe(false);
    expect(canFinalizeCard({
      promptUsed: 'occult tarot',
      generation: { provider: 'gemini', mode: 'preview', seed: 7 },
    })).toBe(false);
    expect(canFinalizeCard({ promptUsed: 'occult tarot' })).toBe(false);
  });

  it('only allows refine when the Comfy output reference is retained', () => {
    const refinable = {
      promptUsed: 'occult tarot',
      generation: {
        provider: 'comfyui',
        mode: 'preview',
        seed: 7,
        providerImage: { filename: 'Grimoire_00001_.png', subfolder: '', type: 'output' },
      },
    };
    expect(canRefineCard(refinable)).toBe(true);
    expect(canRefineCard({ ...refinable, generation: { ...refinable.generation, providerImage: null } })).toBe(false);
    expect(canRefineCard({ ...refinable, generation: { ...refinable.generation, provider: 'gemini' } })).toBe(false);
  });
});
