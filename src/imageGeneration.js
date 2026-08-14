export const IMAGE_MODES = Object.freeze({
  preview: 'preview',
  final: 'final',
});

const asPositiveInteger = value => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const asFiniteNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asSeed = value => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
};

export const normalizeImageMode = value => value === IMAGE_MODES.final
  ? IMAGE_MODES.final
  : IMAGE_MODES.preview;

export const buildImageJobBody = (prompt, { mode = IMAGE_MODES.preview, seed } = {}) => {
  const normalizedPrompt = String(prompt || '').trim();
  if (!normalizedPrompt) throw new Error('Image prompt is required.');

  const body = {
    prompt: normalizedPrompt,
    mode: normalizeImageMode(mode),
  };

  const normalizedSeed = asSeed(seed);
  if (normalizedSeed !== null) body.seed = normalizedSeed;
  return body;
};

export const readImageGenerationResult = result => {
  if (!result?.imageUrl) {
    throw new Error('Image generation completed without an image.');
  }

  return {
    imageUrl: result.imageUrl,
    generation: {
      provider: typeof result.provider === 'string' && result.provider ? result.provider : null,
      mode: normalizeImageMode(result.mode),
      seed: asSeed(result.seed),
      width: asPositiveInteger(result.width),
      height: asPositiveInteger(result.height),
      steps: asPositiveInteger(result.steps),
      cfg: asFiniteNumber(result.cfg),
      sampler: typeof result.sampler === 'string' && result.sampler ? result.sampler : null,
      scheduler: typeof result.scheduler === 'string' && result.scheduler ? result.scheduler : null,
    },
  };
};

export const canFinalizeCard = card => Boolean(
  card?.promptUsed
  && card?.generation?.provider === 'comfyui'
  && card?.generation?.mode !== IMAGE_MODES.final
  && asSeed(card?.generation?.seed) !== null,
);
