import { readFileSync, writeFileSync } from 'node:fs';

const appPath = new URL('../src/App.jsx', import.meta.url);
const serverPath = new URL('../server/index.mjs', import.meta.url);
let appSource = readFileSync(appPath, 'utf8');
let serverSource = readFileSync(serverPath, 'utf8');

const block = lines => lines.join('\n');
const replaceOnce = (label, source, before, after) => {
  const matches = source.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${matches}. No files were written.`);
  }
  return source.replace(before, after);
};

appSource = replaceOnce(
  'job progress import',
  appSource,
  block([
    "import { createGrimoireApiError, isTerminalJobPollError, jobInterruptedMessage, jobKindFromStatusPath } from './jobPolling.js';",
    "import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';",
  ]),
  block([
    "import { createGrimoireApiError, isTerminalJobPollError, jobInterruptedMessage, jobKindFromStatusPath } from './jobPolling.js';",
    "import { describeJobProgress, formatJobTiming } from './jobProgress.js';",
    "import { TAROT_PROMPT_SCHEMA, compileTarotImagePrompt } from './tarotPrompt.js';",
  ]),
);

appSource = replaceOnce(
  'job progress callback parameter',
  appSource,
  block([
    '  pollMs = 2000,',
    '  readResult,',
    '}) => {',
  ]),
  block([
    '  pollMs = 2000,',
    '  readResult,',
    '  onProgress = null,',
    '}) => {',
  ]),
);

appSource = replaceOnce(
  'initial job progress event',
  appSource,
  block([
    '  const started = await callGrimoireApi(startPath, body);',
    "  if (!started.jobId) throw new Error('The Grimoire API returned no job ID.');",
    '',
    '  const deadline = Date.now() + timeoutMs;',
  ]),
  block([
    '  const started = await callGrimoireApi(startPath, body);',
    "  if (!started.jobId) throw new Error('The Grimoire API returned no job ID.');",
    '  if (onProgress) onProgress(started);',
    '',
    '  const deadline = Date.now() + timeoutMs;',
  ]),
);

appSource = replaceOnce(
  'polled job progress event',
  appSource,
  block([
    '      );',
    '      consecutivePollFailures = 0;',
    '    } catch (error) {',
  ]),
  block([
    '      );',
    '      consecutivePollFailures = 0;',
    '      if (onProgress) onProgress(result);',
    '    } catch (error) {',
  ]),
);

appSource = replaceOnce(
  'reconnecting job progress event',
  appSource,
  block([
    '      consecutivePollFailures += 1;',
    '      if (consecutivePollFailures >= 5) throw error;',
    '      continue;',
  ]),
  block([
    '      consecutivePollFailures += 1;',
    "      if (onProgress) onProgress({ status: 'reconnecting', attempt: consecutivePollFailures });",
    '      if (consecutivePollFailures >= 5) throw error;',
    '      continue;',
  ]),
);

appSource = replaceOnce(
  'image generation progress plumbing',
  appSource,
  block([
    'const fetchImageGeneration = async (prompt, options = {}) => {',
    '  return runGrimoireJob({',
    "    startPath: '/api/image/start',",
    "    statusPath: '/api/image/status',",
    '    body: buildImageJobBody(prompt, options),',
    '    pollMs: 4000,',
    '    readResult: readImageGenerationResult,',
    '  });',
    '};',
  ]),
  block([
    'const fetchImageGeneration = async (prompt, options = {}, onProgress = null) => {',
    '  return runGrimoireJob({',
    "    startPath: '/api/image/start',",
    "    statusPath: '/api/image/status',",
    '    body: buildImageJobBody(prompt, options),',
    '    pollMs: 4000,',
    '    readResult: readImageGenerationResult,',
    '    onProgress,',
    '  });',
    '};',
  ]),
);

appSource = replaceOnce(
  'live image progress labels',
  appSource,
  block([
    "    if (setStatusCb) setStatusCb(imageOptions.mode === IMAGE_MODES.refine ? \"REFINING IMAGE...\" : imageOptions.mode === IMAGE_MODES.final ? \"FINALIZING IMAGE...\" : \"MANIFESTING PREVIEW...\");",
    '    // Do not auto-retry a local render. It may still be running after a tunnel',
    '    // interruption; the explicit retry action is the safe place to submit again.',
    '    const rendered = await fetchImageGeneration(fullPrompt, imageOptions);',
  ]),
  block([
    '    const renderMode = imageOptions.mode || IMAGE_MODES.preview;',
    "    if (setStatusCb) setStatusCb(describeJobProgress({ status: 'queued' }, { kind: 'image', mode: renderMode }));",
    '    // Do not auto-retry a local render. It may still be running after a tunnel',
    '    // interruption; the explicit retry action is the safe place to submit again.',
    '    const rendered = await fetchImageGeneration(fullPrompt, imageOptions, snapshot => {',
    "      if (setStatusCb) setStatusCb(describeJobProgress(snapshot, { kind: 'image', mode: renderMode }));",
    '    });',
  ]),
);

appSource = replaceOnce(
  'focused card render timing',
  appSource,
  "                          {Number.isFinite(state.focusedCard.generation.denoise) ? ` · DENOISE ${state.focusedCard.generation.denoise}` : ''}",
  block([
    "                          {Number.isFinite(state.focusedCard.generation.denoise) ? ` · DENOISE ${state.focusedCard.generation.denoise}` : ''}",
    "                          {formatJobTiming(state.focusedCard.generation.timing) ? ` · ${formatJobTiming(state.focusedCard.generation.timing)}` : ''}",
  ]),
);

serverSource = replaceOnce(
  'server API contract import',
  serverSource,
  block([
    "import { createComfyUiClient, createComfyUiConfig } from './comfyui.mjs';",
    "import { normalizeImageJobRequest } from './image-request.mjs';",
  ]),
  block([
    "import { createComfyUiClient, createComfyUiConfig } from './comfyui.mjs';",
    "import { buildApiContract, serializeJobTiming } from './api-contract.mjs';",
    "import { normalizeImageJobRequest } from './image-request.mjs';",
  ]),
);

serverSource = replaceOnce(
  'text job timing telemetry',
  serverSource,
  block([
    'const serializeTextJob = job => ({',
    '  status: job.status,',
    '  provider: job.provider,',
  ]),
  block([
    'const serializeTextJob = job => ({',
    '  status: job.status,',
    '  provider: job.provider,',
    '  ...serializeJobTiming(job),',
  ]),
);

serverSource = replaceOnce(
  'image job timing telemetry',
  serverSource,
  block([
    'const serializeImageJob = job => ({',
    '  status: job.status,',
    '  provider: job.provider,',
  ]),
  block([
    'const serializeImageJob = job => ({',
    '  status: job.status,',
    '  provider: job.provider,',
    '  ...serializeJobTiming(job),',
  ]),
);

serverSource = replaceOnce(
  'health API contract',
  serverSource,
  block([
    '  return {',
    '    ok: true,',
    '    configured: textConfigured && imageConfigured,',
    '    textProvider: TEXT_PROVIDER,',
  ]),
  block([
    '  return {',
    '    ok: true,',
    '    configured: textConfigured && imageConfigured,',
    '    api: buildApiContract({ textProvider: TEXT_PROVIDER, imageProvider: IMAGE_PROVIDER }),',
    '    textProvider: TEXT_PROVIDER,',
  ]),
);

writeFileSync(appPath, appSource);
writeFileSync(serverPath, serverSource);
console.log('Patched src/App.jsx and server/index.mjs with live AI progress, timing telemetry, and API capability metadata.');
