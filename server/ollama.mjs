const asNumber = (value, fallback, minimum, maximum) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
};

const normalizeBaseUrl = value => (value || 'http://127.0.0.1:11434').replace(/\/$/, '');

const parseKeepAlive = value => {
  if (value === undefined || value === null || value === '') return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : String(value);
};

const readError = (data, status) => {
  if (typeof data?.error === 'string') return data.error;
  if (typeof data === 'string' && data.trim()) return data.slice(0, 500);
  return `Ollama returned HTTP ${status}.`;
};

const requestJson = async (fetchImpl, url, options = {}, timeoutMs = 900_000) => {
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
    const status = response.status >= 500 ? 502 : 400;
    throw Object.assign(new Error(readError(data, response.status)), {
      status,
      upstreamStatus: response.status,
    });
  }
  return data;
};

export const parseOllamaJson = text => {
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('Ollama returned no text.');

  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  if (fenced) candidates.push(fenced.trim());
  const firstObject = trimmed.search(/[\[{]/);
  const lastObject = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'));
  if (firstObject >= 0 && lastObject > firstObject) {
    candidates.push(trimmed.slice(firstObject, lastObject + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next conservative extraction. Never evaluate model output.
    }
  }
  throw new Error('Ollama returned malformed JSON.');
};

export const createOllamaConfig = (environment = process.env) => ({
  baseUrl: normalizeBaseUrl(environment.OLLAMA_BASE_URL),
  model: environment.OLLAMA_MODEL || 'qwen3:8b',
  contextLength: Math.round(asNumber(environment.OLLAMA_CONTEXT_LENGTH, 8192, 1024, 40960)),
  keepAlive: parseKeepAlive(environment.OLLAMA_KEEP_ALIVE),
  requestTimeoutMs: Math.round(asNumber(
    environment.OLLAMA_REQUEST_TIMEOUT_MS,
    15 * 60 * 1000,
    10_000,
    60 * 60 * 1000,
  )),
});

const withSchemaGrounding = (prompt, schema) => {
  if (!schema) return prompt;
  return `${prompt}\n\nReturn only JSON matching this JSON Schema exactly:\n${JSON.stringify(schema)}`;
};

export const createOllamaClient = ({
  config = createOllamaConfig(),
  fetchImpl = fetch,
} = {}) => {
  const health = async () => {
    const data = await requestJson(fetchImpl, `${config.baseUrl}/api/tags`, {}, 15_000);
    const models = (data?.models || []).map(entry => entry?.name || entry?.model).filter(Boolean);
    return {
      ready: models.includes(config.model),
      model: config.model,
      installed: models.includes(config.model),
    };
  };

  const generate = async ({ prompt, isJson = true, schema = null }) => {
    const structured = Boolean(isJson && schema);
    const data = await requestJson(fetchImpl, `${config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: withSchemaGrounding(prompt, structured ? schema : null),
        stream: false,
        think: false,
        keep_alive: config.keepAlive,
        ...(isJson ? { format: schema || 'json' } : {}),
        options: {
          num_ctx: config.contextLength,
          temperature: structured ? 0 : (isJson ? 0.2 : 0.7),
        },
      }),
    }, config.requestTimeoutMs);

    const text = String(data?.response || '').trim();
    if (!text) throw Object.assign(new Error('Ollama returned no text.'), { status: 502 });
    if (!isJson) return text;
    try {
      return parseOllamaJson(text);
    } catch (error) {
      throw Object.assign(error, { status: 502 });
    }
  };

  const unload = async () => {
    await requestJson(fetchImpl, `${config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, stream: false, keep_alive: 0 }),
    }, 120_000);
  };

  return { config, generate, health, unload };
};
