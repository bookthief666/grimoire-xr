import { Capacitor } from '@capacitor/core';

const API_BASE_URL = (import.meta.env.VITE_GRIMOIRE_API_URL || '').replace(/\/$/, '');

const callApi = async (path, body = null, method = 'POST') => {
  if (Capacitor.isNativePlatform() && !API_BASE_URL) {
    throw new Error('Native API endpoint is not configured. Set VITE_GRIMOIRE_API_URL before building.');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    ...(body === null
      ? {}
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Grimoire API failed (${response.status})`);
  }
  return payload;
};

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export const runGrimoireJob = async ({
  startPath,
  statusPath,
  body,
  onStatus = () => {},
  pollMs = 2000,
  timeoutMs = 15 * 60 * 1000,
  readResult,
}) => {
  // Never retry submission automatically. A tunnel may lose the response after
  // the Mac has already accepted the job, and a retry would duplicate GPU work.
  const started = await callApi(startPath, body);
  if (!started.jobId) throw new Error('The Grimoire API returned no job ID.');
  onStatus(started);

  const deadline = Date.now() + timeoutMs;
  let consecutivePollFailures = 0;
  while (Date.now() < deadline) {
    await wait(pollMs);
    let result;
    try {
      result = await callApi(
        `${statusPath}?jobId=${encodeURIComponent(started.jobId)}&_=${Date.now()}`,
        null,
        'GET',
      );
    } catch (error) {
      consecutivePollFailures += 1;
      if (consecutivePollFailures >= 5) throw error;
      continue;
    }

    consecutivePollFailures = 0;
    onStatus(result);
    if (result.status === 'ready') return readResult(result);
    if (result.status === 'failed') {
      throw new Error(result.error || 'Local AI generation failed.');
    }
  }
  throw new Error('Local AI generation timed out after 15 minutes.');
};

export const generateVrText = (prompt, onStatus, isJson = true) => runGrimoireJob({
  startPath: '/api/text/start',
  statusPath: '/api/text/status',
  body: { prompt, isJson },
  onStatus,
  readResult: result => result.output,
});

export const generateVrImage = (prompt, onStatus) => runGrimoireJob({
  startPath: '/api/image/start',
  statusPath: '/api/image/status',
  body: { prompt },
  onStatus,
  pollMs: 4000,
  readResult: result => {
    if (!result.imageUrl) throw new Error('Image generation completed without an image.');
    return result.imageUrl;
  },
});

export const readVrHealth = () => callApi('/health', null, 'GET');
