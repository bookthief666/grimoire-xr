import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createComfyUiClient, createComfyUiConfig } from './comfyui.mjs';
import { normalizeImageJobRequest } from './image-request.mjs';
import { createMissingJobError, serializeApiError } from './job-errors.mjs';
import { createOllamaClient, createOllamaConfig } from './ollama.mjs';
import { createResourceScheduler } from './resource-scheduler.mjs';

try {
  process.loadEnvFile?.('.env.local');
} catch {
  // .env.local is optional; production hosts normally inject environment variables.
}

const asPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const TEXT_PROVIDER = (process.env.TEXT_PROVIDER || 'ollama').toLowerCase();
const IMAGE_PROVIDER = (process.env.IMAGE_PROVIDER || 'comfyui').toLowerCase();
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.6-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const BODY_LIMIT = 256 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 120);
const TEXT_JOB_TTL_MS = asPositiveNumber(process.env.TEXT_JOB_TTL_MS, 30 * 60 * 1000);
const IMAGE_JOB_TTL_MS = asPositiveNumber(process.env.IMAGE_JOB_TTL_MS, 30 * 60 * 1000);
const JOB_RESULT_TTL_MS = asPositiveNumber(process.env.JOB_RESULT_TTL_MS, 2 * 60 * 1000);
const PROVIDER_POLL_MS = asPositiveNumber(process.env.AI_PROVIDER_POLL_MS, 2_000);
const AI_QUEUE_MAX = Math.round(asPositiveNumber(process.env.AI_QUEUE_MAX, 24));

const defaultOrigins = [
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || defaultOrigins.join(','))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
);

const requestBuckets = new Map();
const textJobs = new Map();
const imageJobs = new Map();
const resourceScheduler = createResourceScheduler({ maximumQueued: AI_QUEUE_MAX });
const ollama = createOllamaClient({ config: createOllamaConfig(process.env) });
const comfyUi = createComfyUiClient({ config: createComfyUiConfig(process.env) });
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const sendJson = (response, status, payload, origin = '') => {
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
};

const readJson = request => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  request.on('data', chunk => {
    size += chunk.length;
    if (size > BODY_LIMIT) {
      reject(Object.assign(new Error('Request body is too large.'), { status: 413 }));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on('end', () => {
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
    } catch {
      reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }));
    }
  });
  request.on('error', reject);
});

const checkRateLimit = request => {
  const forwarded = request.headers['x-forwarded-for'];
  const address = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim()
    || request.socket.remoteAddress
    || 'unknown';
  const now = Date.now();
  const bucket = requestBuckets.get(address);
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    requestBuckets.set(address, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT;
};

const callGoogle = async (url, body) => {
  if (!GEMINI_API_KEY) {
    throw Object.assign(new Error('The server is missing GEMINI_API_KEY.'), { status: 503 });
  }
  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const detail = data?.error?.message || `Google AI returned ${upstream.status}.`;
    throw Object.assign(new Error(detail), { status: upstream.status >= 500 ? 502 : 400 });
  }
  return data;
};

const validateTextRequest = ({ prompt, isJson = true } = {}) => {
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 50_000) {
    throw Object.assign(new Error('A prompt between 1 and 50,000 characters is required.'), { status: 400 });
  }
  return { prompt: prompt.trim(), isJson: Boolean(isJson) };
};

const generateGeminiText = async ({ prompt, isJson }) => {
  const generationConfig = isJson ? { responseMimeType: 'application/json' } : undefined;
  const data = await callGoogle(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(TEXT_MODEL)}:generateContent`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      ...(generationConfig ? { generationConfig } : {}),
    },
  );
  const text = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim();
  if (!text) throw Object.assign(new Error('The model returned no text.'), { status: 502 });
  if (!isJson) return text;
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('The model returned malformed JSON.'), { status: 502 });
  }
};

const generateTextWithProvider = async input => {
  if (TEXT_PROVIDER === 'ollama') return ollama.generate(input);
  if (TEXT_PROVIDER === 'gemini') return generateGeminiText(input);
  throw Object.assign(new Error(`Unsupported TEXT_PROVIDER: ${TEXT_PROVIDER}`), { status: 503 });
};

const generateText = async body => {
  const input = validateTextRequest(body);
  if (TEXT_PROVIDER !== 'ollama') return generateTextWithProvider(input);
  return resourceScheduler.run('text', () => generateTextWithProvider(input));
};

const findImage = data => {
  if (data.output_image?.data) return data.output_image;
  if (data.outputImage?.data) return data.outputImage;
  for (const step of data.steps || []) {
    if (step.type !== 'model_output') continue;
    const image = step.content?.find(block => block.type === 'image' && block.data);
    if (image) return image;
  }
  return null;
};

const validateImagePrompt = prompt => {
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 20_000) {
    throw Object.assign(new Error('An image prompt between 1 and 20,000 characters is required.'), { status: 400 });
  }
  return prompt.trim();
};

const generateGeminiImage = async ({ prompt }) => {
  const validPrompt = validateImagePrompt(prompt);
  const data = await callGoogle('https://generativelanguage.googleapis.com/v1beta/interactions', {
    model: IMAGE_MODEL,
    input: validPrompt,
    response_format: {
      type: 'image',
      mime_type: 'image/jpeg',
      aspect_ratio: '2:3',
      image_size: '1K',
    },
  });
  const image = findImage(data);
  if (!image) throw Object.assign(new Error('The model returned no image.'), { status: 502 });
  const mimeType = image.mime_type || image.mimeType || 'image/jpeg';
  return `data:${mimeType};base64,${image.data}`;
};

const pruneJobs = jobs => {
  const now = Date.now();
  for (const [jobId, job] of jobs) {
    if (job.expiresAt <= now) jobs.delete(jobId);
  }
};

const markReady = (job, payload) => {
  Object.assign(job, payload, {
    status: 'ready',
    completedAt: Date.now(),
    expiresAt: Date.now() + JOB_RESULT_TTL_MS,
  });
};

const markFailed = (job, error) => {
  Object.assign(job, {
    status: 'failed',
    error: error?.message || 'Local AI generation failed.',
    completedAt: Date.now(),
    expiresAt: Date.now() + JOB_RESULT_TTL_MS,
  });
};

const queuePosition = job => {
  const position = resourceScheduler.position(job.id);
  return position && position > 0 ? position : null;
};

const ensureQueueCapacity = () => {
  const state = resourceScheduler.snapshot();
  if (state.queueDepth < state.maximumQueued) return;
  throw Object.assign(
    new Error(`The local AI queue is full (${state.maximumQueued} waiting jobs). Try again after a job completes.`),
    { status: 503, code: 'AI_QUEUE_FULL' },
  );
};

const serializeTextJob = job => ({
  status: job.status,
  provider: job.provider,
  ...(job.status === 'queued' && queuePosition(job) ? { queuePosition: queuePosition(job) } : {}),
  ...(job.status === 'ready' ? { output: job.output } : {}),
  ...(job.status === 'failed' ? { error: job.error } : {}),
});

const serializeImageJob = job => ({
  status: job.status,
  provider: job.provider,
  ...(job.mode ? { mode: job.mode } : {}),
  ...(Number.isSafeInteger(job.seed) ? { seed: job.seed } : {}),
  ...(job.width ? { width: job.width } : {}),
  ...(job.height ? { height: job.height } : {}),
  ...(job.steps ? { steps: job.steps } : {}),
  ...(Number.isFinite(job.cfg) ? { cfg: job.cfg } : {}),
  ...(job.sampler ? { sampler: job.sampler } : {}),
  ...(job.scheduler ? { scheduler: job.scheduler } : {}),
  ...(Number.isFinite(job.denoise) ? { denoise: job.denoise } : {}),
  ...(job.providerImage ? { providerImage: job.providerImage } : {}),
  ...(job.status === 'queued' && queuePosition(job) ? { queuePosition: queuePosition(job) } : {}),
  ...(job.status === 'ready' ? { imageUrl: job.imageUrl } : {}),
  ...(job.status === 'failed' ? { error: job.error } : {}),
});

const startTextJob = body => {
  const input = validateTextRequest(body);
  if (TEXT_PROVIDER === 'ollama') ensureQueueCapacity();
  pruneJobs(textJobs);
  const id = randomUUID();
  const job = {
    id,
    provider: TEXT_PROVIDER,
    status: 'queued',
    createdAt: Date.now(),
    expiresAt: Date.now() + TEXT_JOB_TTL_MS,
  };
  textJobs.set(id, job);

  const work = async () => {
    job.status = 'running';
    job.startedAt = Date.now();
    const output = await generateTextWithProvider(input);
    markReady(job, { output });
  };
  const task = TEXT_PROVIDER === 'ollama'
    ? resourceScheduler.run('text', work, { id })
    : work();
  void task.catch(error => markFailed(job, error));
  return { jobId: id, ...serializeTextJob(job) };
};

const getTextJob = id => {
  pruneJobs(textJobs);
  const job = textJobs.get(id);
  if (!job) throw createMissingJobError('Text');
  return serializeTextJob(job);
};

const tryUnloadOllama = async () => {
  if (TEXT_PROVIDER !== 'ollama') return;
  try {
    await ollama.unload();
  } catch (error) {
    console.warn(`Ollama pre-image unload warning: ${error.message || 'unavailable'}`);
  }
};

const runComfyUiImage = async (job, request) => {
  job.status = 'preparing';
  job.startedAt = Date.now();
  await tryUnloadOllama();

  const started = await comfyUi.start(request);
  job.providerJobId = started.providerJobId;
  job.seed = started.seed;
  job.mode = started.mode;
  job.width = started.width;
  job.height = started.height;
  job.steps = started.steps;
  job.cfg = started.cfg;
  job.sampler = started.sampler;
  job.scheduler = started.scheduler;
  job.denoise = started.denoise;
  job.status = 'running';

  while (Date.now() < job.expiresAt) {
    const result = await comfyUi.status(job.providerJobId);
    if (result.status === 'ready') {
      markReady(job, { imageUrl: result.imageUrl, providerImage: result.providerImage });
      return;
    }
    if (result.status === 'failed') {
      throw new Error(result.error || 'ComfyUI image generation failed.');
    }
    await sleep(PROVIDER_POLL_MS);
  }
  throw new Error('ComfyUI image generation timed out.');
};

const startImageJob = body => {
  const prompt = validateImagePrompt(body?.prompt);
  if (!['comfyui', 'gemini'].includes(IMAGE_PROVIDER)) {
    throw Object.assign(new Error(`Unsupported IMAGE_PROVIDER: ${IMAGE_PROVIDER}`), { status: 503 });
  }

  const imageRequest = normalizeImageJobRequest(
    { ...body, prompt },
    { provider: IMAGE_PROVIDER },
  );
  if (IMAGE_PROVIDER === 'comfyui') ensureQueueCapacity();
  pruneJobs(imageJobs);
  const id = randomUUID();
  const job = {
    id,
    provider: IMAGE_PROVIDER,
    mode: imageRequest.mode,
    seed: imageRequest.seed,
    ...(Number.isFinite(imageRequest.denoise) ? { denoise: imageRequest.denoise } : {}),
    status: 'queued',
    createdAt: Date.now(),
    expiresAt: Date.now() + IMAGE_JOB_TTL_MS,
  };
  imageJobs.set(id, job);

  const work = async () => {
    if (IMAGE_PROVIDER === 'comfyui') {
      return runComfyUiImage(job, imageRequest);
    }
    job.status = 'running';
    job.startedAt = Date.now();
    const imageUrl = await generateGeminiImage({ prompt: imageRequest.prompt });
    markReady(job, { imageUrl });
  };
  const task = IMAGE_PROVIDER === 'comfyui'
    ? resourceScheduler.run('image', work, { id })
    : work();
  void task.catch(error => markFailed(job, error));
  return { jobId: id, ...serializeImageJob(job) };
};

const getImageJob = id => {
  pruneJobs(imageJobs);
  const job = imageJobs.get(id);
  if (!job) throw createMissingJobError('Image');
  return serializeImageJob(job);
};

const getHealth = async () => {
  let ollamaHealth = null;
  let comfyHealth = null;
  const checks = [];

  if (TEXT_PROVIDER === 'ollama') {
    checks.push(ollama.health()
      .then(result => { ollamaHealth = result; })
      .catch(error => { ollamaHealth = { ready: false, model: ollama.config.model, error: error.message }; }));
  }
  if (IMAGE_PROVIDER === 'comfyui') {
    checks.push(comfyUi.health()
      .then(result => { comfyHealth = result; })
      .catch(error => { comfyHealth = { ready: false, error: error.message }; }));
  }
  await Promise.all(checks);

  const textConfigured = TEXT_PROVIDER === 'ollama'
    ? Boolean(ollamaHealth?.ready)
    : TEXT_PROVIDER === 'gemini' && Boolean(GEMINI_API_KEY);
  const imageConfigured = IMAGE_PROVIDER === 'comfyui'
    ? Boolean(comfyUi.config.checkpoint && comfyHealth?.ready)
    : IMAGE_PROVIDER === 'gemini' && Boolean(GEMINI_API_KEY);

  return {
    ok: true,
    configured: textConfigured && imageConfigured,
    textProvider: TEXT_PROVIDER,
    textConfigured,
    imageProvider: IMAGE_PROVIDER,
    imageConfigured,
    ...(ollamaHealth ? { ollama: ollamaHealth } : {}),
    ...(comfyHealth ? { comfyui: comfyHealth } : {}),
    resourceScheduler: resourceScheduler.snapshot(),
  };
};

const server = createServer(async (request, response) => {
  const origin = request.headers.origin || '';
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const pathname = requestUrl.pathname;

  if (request.method === 'OPTIONS') {
    if (origin && !allowedOrigins.has(origin)) return sendJson(response, 403, { error: 'Origin not allowed.' });
    response.setHeader('Access-Control-Allow-Origin', origin || '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.writeHead(204);
    return response.end();
  }

  if (request.method === 'GET' && pathname === '/health') {
    return sendJson(response, 200, await getHealth(), origin);
  }
  if (origin && !allowedOrigins.has(origin)) {
    return sendJson(response, 403, { error: 'Origin not allowed.' });
  }

  const isStatusRoute = request.method === 'GET'
    && ['/api/text/status', '/api/image/status'].includes(pathname);
  if (!isStatusRoute && !checkRateLimit(request)) {
    return sendJson(response, 429, { error: 'Too many requests. Try again shortly.' }, origin);
  }
  const isPostRoute = request.method === 'POST'
    && ['/api/text', '/api/text/start', '/api/image', '/api/image/start'].includes(pathname);
  if (!isStatusRoute && !isPostRoute) {
    return sendJson(response, 404, { error: 'Not found.' }, origin);
  }

  try {
    if (isStatusRoute) {
      const jobId = requestUrl.searchParams.get('jobId') || '';
      if (!jobId) throw Object.assign(new Error('jobId is required.'), { status: 400 });
      const result = pathname === '/api/text/status' ? getTextJob(jobId) : getImageJob(jobId);
      return sendJson(response, 200, result, origin);
    }

    const body = await readJson(request);
    if (pathname === '/api/text/start') {
      return sendJson(response, 202, startTextJob(body), origin);
    }
    if (pathname === '/api/image/start') {
      return sendJson(response, 202, startImageJob(body), origin);
    }
    if (pathname === '/api/text') {
      return sendJson(response, 200, { output: await generateText(body) }, origin);
    }
    if (IMAGE_PROVIDER !== 'gemini') {
      throw Object.assign(
        new Error('Use /api/image/start for asynchronous ComfyUI image generation.'),
        { status: 409 },
      );
    }
    return sendJson(response, 200, { imageUrl: await generateGeminiImage(body) }, origin);
  } catch (error) {
    const { status, payload } = serializeApiError(error);
    console.error(`${request.method} ${request.url} failed (${status}): ${payload.error}`);
    return sendJson(response, status, payload, origin);
  }
});

server.listen(PORT, () => {
  console.log(`Grimoire API listening on http://localhost:${PORT}`);
  console.log(`Local AI: text=${TEXT_PROVIDER}, image=${IMAGE_PROVIDER}, queue=${AI_QUEUE_MAX}`);
});
