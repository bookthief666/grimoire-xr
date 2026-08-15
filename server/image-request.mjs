const randomSeed = random => Math.floor(random() * Number.MAX_SAFE_INTEGER);

export const normalizeServerImageMode = value => {
  if (value === 'final') return 'final';
  if (value === 'refine') return 'refine';
  return 'preview';
};

export const normalizeComfyOutputRef = value => {
  if (!value || typeof value !== 'object') return null;
  const filename = typeof value.filename === 'string' ? value.filename.trim() : '';
  const subfolder = typeof value.subfolder === 'string' ? value.subfolder.trim() : '';
  const type = typeof value.type === 'string' ? value.type.trim() : 'output';

  if (
    !filename
    || filename.length > 255
    || filename.includes('/')
    || filename.includes('\\')
    || filename.includes('..')
    || subfolder.includes('..')
    || subfolder.startsWith('/')
    || subfolder.includes('\\')
    || type !== 'output'
  ) {
    return null;
  }

  return { filename, subfolder, type: 'output' };
};

export const normalizeImageJobRequest = (
  body,
  { provider = 'comfyui', random = Math.random } = {},
) => {
  const mode = normalizeServerImageMode(body?.mode);
  const hasSeed = body?.seed !== undefined && body?.seed !== null && body?.seed !== '';
  const requestedSeed = hasSeed ? Number(body.seed) : NaN;
  const seed = Number.isSafeInteger(requestedSeed) && requestedSeed >= 0
    ? requestedSeed
    : randomSeed(random);

  const request = {
    prompt: body.prompt,
    mode,
    seed,
  };

  if (mode !== 'refine') return request;
  if (provider !== 'comfyui') {
    throw Object.assign(new Error('Refine mode requires the ComfyUI image provider.'), { status: 409 });
  }

  const sourceImage = normalizeComfyOutputRef(body?.sourceImage);
  if (!sourceImage) {
    throw Object.assign(new Error('Refine mode requires a valid generated ComfyUI output reference.'), { status: 400 });
  }
  request.sourceImage = sourceImage;

  if (body?.denoise !== undefined && body?.denoise !== null && body?.denoise !== '') {
    const denoise = Number(body.denoise);
    if (!Number.isFinite(denoise) || denoise < 0.05 || denoise > 0.95) {
      throw Object.assign(new Error('Refine denoise must be between 0.05 and 0.95.'), { status: 400 });
    }
    request.denoise = denoise;
  }

  return request;
};
