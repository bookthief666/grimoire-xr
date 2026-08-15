export const IMAGE_MODES = Object.freeze({
  preview: 'preview',
  final: 'final',
  refine: 'refine',
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

const asDenoise = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0.05 && parsed <= 0.95 ? parsed : null;
};

export const normalizeImageMode = value => {
  if (value === IMAGE_MODES.final) return IMAGE_MODES.final;
  if (value === IMAGE_MODES.refine) return IMAGE_MODES.refine;
  return IMAGE_MODES.preview;
};

export const normalizeProviderImage = value => {
  if (!value || typeof value !== 'object') return null;
  const filename = typeof value.filename === 'string' ? value.filename.trim() : '';
  if (!filename) return null;
  return {
    filename,
    subfolder: typeof value.subfolder === 'string' ? value.subfolder : '',
    type: typeof value.type === 'string' && value.type ? value.type : 'output',
  };
};

export const buildImageJobBody = (prompt, {
  mode = IMAGE_MODES.preview,
  seed,
  sourceImage,
  denoise,
} = {}) => {
  const normalizedPrompt = String(prompt || '').trim();
  if (!normalizedPrompt) throw new Error('Image prompt is required.');

  const normalizedMode = normalizeImageMode(mode);
  const body = {
    prompt: normalizedPrompt,
    mode: normalizedMode,
  };

  const normalizedSeed = asSeed(seed);
  if (normalizedSeed !== null) body.seed = normalizedSeed;

  if (normalizedMode === IMAGE_MODES.refine) {
    const normalizedSource = normalizeProviderImage(sourceImage);
    if (!normalizedSource) throw new Error('A generated source image is required for refine mode.');
    body.sourceImage = normalizedSource;
    const normalizedDenoise = asDenoise(denoise);
    if (normalizedDenoise !== null) body.denoise = normalizedDenoise;
  }

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
      denoise: asDenoise(result.denoise),
      providerImage: normalizeProviderImage(result.providerImage),
    },
  };
};

export const canFinalizeCard = card => Boolean(
  card?.promptUsed
  && card?.generation?.provider === 'comfyui'
  && card?.generation?.mode === IMAGE_MODES.preview
  && asSeed(card?.generation?.seed) !== null,
);

export const canRefineCard = card => Boolean(
  card?.promptUsed
  && card?.generation?.provider === 'comfyui'
  && asSeed(card?.generation?.seed) !== null
  && normalizeProviderImage(card?.generation?.providerImage),
);
