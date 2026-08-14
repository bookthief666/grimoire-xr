import { randomUUID } from 'node:crypto';

const DEFAULT_NEGATIVE_PROMPT = 'text, watermark, logo, low quality, blurry, malformed hands, extra fingers, duplicate limbs';

const asNumber = (value, fallback, minimum, maximum) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
};

const normalizeBaseUrl = value => (value || 'http://127.0.0.1:8188').replace(/\/$/, '');

const readErrorDetail = data => {
  if (typeof data === 'string') return data.slice(0, 500);
  const error = data?.error;
  if (typeof error === 'string') return error;
  if (error?.message || error?.details) {
    return [error.message, error.details].filter(Boolean).join(': ');
  }
  const nodeErrors = Object.values(data?.node_errors || {});
  return nodeErrors
    .flatMap(entry => entry?.errors || [])
    .map(entry => entry?.message || entry?.details)
    .filter(Boolean)
    .join('; ');
};

const requestJson = async (fetchImpl, url, options = {}, timeoutMs = 15_000) => {
  const response = await fetchImpl(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }
  if (!response.ok) {
    const detail = readErrorDetail(data) || `ComfyUI returned HTTP ${response.status}.`;
    throw Object.assign(new Error(detail), { status: 502, upstreamStatus: response.status });
  }
  return data;
};

export const createComfyUiConfig = (environment = process.env) => {
  const width = Math.round(asNumber(environment.COMFYUI_WIDTH, 640, 512, 2048) / 8) * 8;
  const height = Math.round(asNumber(environment.COMFYUI_HEIGHT, 960, 512, 2048) / 8) * 8;
  const steps = Math.round(asNumber(environment.COMFYUI_STEPS, 18, 1, 100));

  return {
    baseUrl: normalizeBaseUrl(environment.COMFYUI_BASE_URL),
    checkpoint: environment.COMFYUI_CHECKPOINT || '',
    width,
    height,
    steps,
    cfg: asNumber(environment.COMFYUI_CFG, 4, 0, 30),
    sampler: environment.COMFYUI_SAMPLER || 'dpmpp_2m',
    scheduler: environment.COMFYUI_SCHEDULER || 'karras',
    negativePrompt: environment.COMFYUI_NEGATIVE_PROMPT || DEFAULT_NEGATIVE_PROMPT,
    requestTimeoutMs: Math.round(asNumber(environment.COMFYUI_REQUEST_TIMEOUT_MS, 15_000, 1_000, 120_000)),

    // Higher-quality txt2img preset. Preview remains the measured M2 baseline.
    finalWidth: Math.round(asNumber(environment.COMFYUI_FINAL_WIDTH, 832, 512, 2048) / 8) * 8,
    finalHeight: Math.round(asNumber(environment.COMFYUI_FINAL_HEIGHT, 1216, 512, 2048) / 8) * 8,
    finalSteps: Math.round(asNumber(environment.COMFYUI_FINAL_STEPS, 28, 1, 100)),
  };
};

export const resolveComfyUiRenderConfig = (config, mode = 'preview') => {
  if (mode !== 'final') return { ...config };

  return {
    ...config,
    width: config.finalWidth,
    height: config.finalHeight,
    steps: config.finalSteps,
  };
};

const resolveSeed = value => {
  const parsed = Number(value);
  if (Number.isSafeInteger(parsed) && parsed >= 0) return parsed;
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

export const buildSdxlWorkflow = ({ prompt, seed, config }) => ({
  '3': {
    class_type: 'KSampler',
    inputs: {
      cfg: config.cfg,
      denoise: 1,
      latent_image: ['5', 0],
      model: ['4', 0],
      negative: ['7', 0],
      positive: ['6', 0],
      sampler_name: config.sampler,
      scheduler: config.scheduler,
      seed,
      steps: config.steps,
    },
  },
  '4': {
    class_type: 'CheckpointLoaderSimple',
    inputs: { ckpt_name: config.checkpoint },
  },
  '5': {
    class_type: 'EmptyLatentImage',
    inputs: { batch_size: 1, height: config.height, width: config.width },
  },
  '6': {
    class_type: 'CLIPTextEncode',
    inputs: { clip: ['4', 1], text: prompt },
  },
  '7': {
    class_type: 'CLIPTextEncode',
    inputs: { clip: ['4', 1], text: config.negativePrompt },
  },
  '8': {
    class_type: 'VAEDecode',
    inputs: { samples: ['3', 0], vae: ['4', 2] },
  },
  '9': {
    class_type: 'SaveImage',
    inputs: { filename_prefix: 'Grimoire', images: ['8', 0] },
  },
});

const findHistoryError = history => {
  for (const message of history?.status?.messages || []) {
    if (!Array.isArray(message) || message[0] !== 'execution_error') continue;
    const detail = message[1] || {};
    return detail.exception_message || detail.exception_type || 'ComfyUI execution failed.';
  }
  return '';
};

const findOutputImage = history => {
  for (const output of Object.values(history?.outputs || {})) {
    const image = output?.images?.[0];
    if (image?.filename) return image;
  }
  return null;
};

export const createComfyUiClient = ({
  config = createComfyUiConfig(),
  fetchImpl = fetch,
  clientId = randomUUID(),
} = {}) => {
  const ensureConfigured = () => {
    if (!config.checkpoint) {
      throw Object.assign(
        new Error('COMFYUI_CHECKPOINT is not configured on the Grimoire API server.'),
        { status: 503 },
      );
    }
  };

  const health = async () => {
    const data = await requestJson(fetchImpl, `${config.baseUrl}/system_stats`, {}, config.requestTimeoutMs);
    return {
      ready: true,
      version: data?.system?.comfyui_version || null,
      device: data?.devices?.[0]?.type || data?.devices?.[0]?.name || null,
      checkpoint: config.checkpoint || null,
      width: config.width,
      height: config.height,
      steps: config.steps,
    };
  };

  const start = async input => {
    ensureConfigured();

    // Preserve compatibility with existing callers that pass only a prompt string.
    const request = typeof input === 'string'
      ? { prompt: input }
      : (input || {});

    const prompt = String(request.prompt || '').trim();
    if (!prompt) {
      throw Object.assign(new Error('Image prompt is required.'), { status: 400 });
    }

    const mode = request.mode === 'final' ? 'final' : 'preview';
    const seed = resolveSeed(request.seed);
    const renderConfig = resolveComfyUiRenderConfig(config, mode);
    const workflow = buildSdxlWorkflow({ prompt, seed, config: renderConfig });

    const data = await requestJson(fetchImpl, `${config.baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    }, config.requestTimeoutMs);

    const providerJobId = data?.prompt_id;
    if (!providerJobId) {
      const detail = readErrorDetail(data) || 'ComfyUI accepted no prompt ID.';
      throw Object.assign(new Error(detail), { status: 502 });
    }

    return {
      providerJobId,
      seed,
      mode,
      width: renderConfig.width,
      height: renderConfig.height,
      steps: renderConfig.steps,
      cfg: renderConfig.cfg,
      sampler: renderConfig.sampler,
      scheduler: renderConfig.scheduler,
    };
  };

  const status = async providerJobId => {
    ensureConfigured();
    const data = await requestJson(
      fetchImpl,
      `${config.baseUrl}/history/${encodeURIComponent(providerJobId)}`,
      {},
      config.requestTimeoutMs,
    );
    const history = data?.[providerJobId];
    if (!history) return { status: 'running' };

    const historyError = findHistoryError(history);
    if (historyError) return { status: 'failed', error: historyError };

    const output = findOutputImage(history);
    if (!output) {
      return history?.status?.completed
        ? { status: 'failed', error: 'ComfyUI completed without returning an image.' }
        : { status: 'running' };
    }

    const query = new URLSearchParams({
      filename: output.filename,
      subfolder: output.subfolder || '',
      type: output.type || 'output',
    });
    const response = await fetchImpl(`${config.baseUrl}/view?${query}`, {
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
    if (!response.ok) {
      throw Object.assign(new Error(`ComfyUI image retrieval failed (${response.status}).`), { status: 502 });
    }
    const mimeType = response.headers.get('content-type') || 'image/png';
    const bytes = Buffer.from(await response.arrayBuffer());
    return { status: 'ready', imageUrl: `data:${mimeType};base64,${bytes.toString('base64')}` };
  };

  return { config, health, start, status };
};
