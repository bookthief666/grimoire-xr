import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  assertStageArtifacts,
  createRunDirectory,
  createRunManifest,
  findLatestIncompleteRun,
  markRunComplete,
  markStageComplete,
  saveRunManifest,
} from './qaRunState.mjs';

const args = new Set(process.argv.slice(2));
const contractsOnly = args.has('--contracts-only');
const resumeLatest = args.has('--resume-latest');
const baseUrl = (process.env.GRIMOIRE_QA_API_URL || 'http://127.0.0.1:8787').replace(/\/$/, '');
const pollMs = Number(process.env.GRIMOIRE_QA_POLL_MS || 2_000);
const heartbeatMs = Number(process.env.GRIMOIRE_QA_HEARTBEAT_MS || 30_000);
const timeoutMs = Number(process.env.GRIMOIRE_QA_TIMEOUT_MS || 20 * 60 * 1000);
const configuredSeed = Number(process.env.GRIMOIRE_QA_SEED || 424242);
const outputRoot = path.resolve('qa-output');
let activeRunDir = null;

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const assert = (condition, message) => {
  if (!condition) throw new Error(`QA assertion failed: ${message}`);
};

const formatDuration = milliseconds => {
  const totalSeconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
};

const requestJson = async (pathname, options = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(Math.min(timeoutMs, 120_000)),
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: text || `HTTP ${response.status}` };
  }
  if (!response.ok) {
    throw Object.assign(
      new Error(payload.error || `HTTP ${response.status}`),
      { status: response.status, code: payload.code || null, payload },
    );
  }
  return payload;
};

const postJson = (pathname, body) => requestJson(pathname, {
  method: 'POST',
  body: JSON.stringify(body),
});

const pollImageJob = async jobId => {
  const startedAt = Date.now();
  const deadline = startedAt + timeoutMs;
  let lastLabel = '';
  let lastPrintedAt = 0;

  while (Date.now() < deadline) {
    const result = await requestJson(`/api/image/status?jobId=${encodeURIComponent(jobId)}`);
    const label = `${result.status}${result.queuePosition ? `#${result.queuePosition}` : ''}`;
    const now = Date.now();
    if (label !== lastLabel || now - lastPrintedAt >= heartbeatMs) {
      console.log(`  image job ${jobId.slice(0, 8)}: ${label} · ${formatDuration(now - startedAt)}`);
      lastLabel = label;
      lastPrintedAt = now;
    }
    if (result.status === 'ready') return result;
    if (result.status === 'failed') throw new Error(result.error || 'Image job failed.');
    await wait(pollMs);
  }
  throw new Error(`Image job ${jobId} exceeded QA timeout.`);
};

const render = async body => {
  const started = await postJson('/api/image/start', body);
  assert(typeof started.jobId === 'string' && started.jobId, 'image start must return a jobId');
  return pollImageJob(started.jobId);
};

const withoutImageBytes = result => {
  const { imageUrl, ...rest } = result || {};
  return rest;
};

const writeDataUrl = async (destination, dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(String(dataUrl || ''));
  assert(match, `expected a base64 data URL for ${destination}`);
  await writeFile(destination, Buffer.from(match[2], 'base64'));
};

const healthSnapshot = health => ({
  api: health.api,
  textProvider: health.textProvider,
  imageProvider: health.imageProvider,
  comfyui: health.comfyui,
});

const qaConfigFingerprint = health => JSON.stringify({
  protocolVersion: health.api?.protocolVersion,
  promptSchema: health.api?.promptSchema,
  imageProvider: health.imageProvider,
  imageModes: health.api?.imageModes,
  checkpoint: health.comfyui?.checkpoint,
  preview: {
    width: health.comfyui?.width,
    height: health.comfyui?.height,
    steps: health.comfyui?.steps,
  },
  final: health.comfyui?.final,
  refine: health.comfyui?.refine,
});

const readExpectedPreset = (health, mode) => {
  const comfy = health.comfyui || {};
  if (mode === 'preview') {
    return { width: comfy.width, height: comfy.height, steps: comfy.steps };
  }
  return comfy[mode] || {};
};

const assertRender = (result, mode, expected, seed) => {
  assert(result.mode === mode, `${mode} result must report mode=${mode}`);
  assert(result.seed === seed, `${mode} must preserve seed ${seed}`);
  assert(result.width === expected.width, `${mode} width must be ${expected.width}`);
  assert(result.height === expected.height, `${mode} height must be ${expected.height}`);
  assert(result.steps === expected.steps, `${mode} steps must be ${expected.steps}`);
  assert(typeof result.imageUrl === 'string' && result.imageUrl.startsWith('data:image/'), `${mode} must return an image`);
  assert(result.timing && Number.isFinite(result.timing.elapsedMs), `${mode} must expose timing telemetry`);
};

const verifyContracts = async () => {
  console.log(`Grimoire local-AI QA against ${baseUrl}`);
  const health = await requestJson('/health');
  assert(health.ok === true, '/health must report ok=true');
  assert(health.configured === true, '/health must report configured=true');
  assert(health.api?.protocolVersion >= 1, '/health must expose AI protocolVersion >= 1');
  assert(health.api?.jobMissingCode === 'JOB_MISSING', 'API must advertise JOB_MISSING');
  assert(Array.isArray(health.api?.imageModes), 'API must advertise imageModes');
  console.log(`  protocol: ${health.api.protocolVersion}`);
  console.log(`  image modes: ${health.api.imageModes.join(', ')}`);
  console.log(`  prompt schema: ${health.api.promptSchema}`);

  let missingError = null;
  try {
    await requestJson('/api/image/status?jobId=qa-deliberately-missing', { method: 'GET' });
  } catch (error) {
    missingError = error;
  }
  assert(missingError?.status === 404, 'missing image job must return HTTP 404');
  assert(missingError?.payload?.code === 'JOB_MISSING', 'missing image job must return code=JOB_MISSING');
  console.log('  missing-job contract: PASS');
  return health;
};

const defaultPrompt = [
  'SUBJECT: Tarot card "The High Priestess".',
  'TAROT SYSTEM: Hermetic lunar mystery.',
  'COMPOSITION AND ICONOGRAPHY: a veiled priestess seated between two monumental pillars, crescent moon, still dark water, silver-blue ritual light, strong central symmetry.',
  'FRAMING: premium vertical tarot-card illustration, clear focal hierarchy, edge-safe composition.',
  'CONSTRAINTS: no readable text, no logo, no watermark, no duplicate figure, no extra limbs.',
].join('\n');

const createOrResumeRun = async health => {
  if (resumeLatest) {
    const found = await findLatestIncompleteRun(outputRoot);
    assert(found, 'no incomplete checkpointed QA run was found');
    activeRunDir = found.directory;
    assert(found.manifest.baseUrl === baseUrl, `checkpoint targets ${found.manifest.baseUrl}, not ${baseUrl}`);
    assert(
      qaConfigFingerprint(found.manifest.health) === qaConfigFingerprint(healthSnapshot(health)),
      'current API/render configuration differs from the checkpoint; start a fresh QA run instead of mixing configurations',
    );
    await assertStageArtifacts(activeRunDir, found.manifest);
    console.log(`Resuming checkpoint: ${activeRunDir}`);
    return { directory: activeRunDir, manifest: found.manifest };
  }

  activeRunDir = await createRunDirectory(outputRoot);
  const manifest = createRunManifest({
    baseUrl,
    seed: configuredSeed,
    prompt: defaultPrompt,
    health: healthSnapshot(health),
  });
  await saveRunManifest(activeRunDir, manifest);
  console.log(`QA checkpoint directory: ${activeRunDir}`);
  return { directory: activeRunDir, manifest };
};

const saveStage = async ({ directory, manifest, stage, result }) => {
  await writeDataUrl(path.join(directory, `${stage}.png`), result.imageUrl);
  const stored = withoutImageBytes(result);
  const updated = markStageComplete(manifest, stage, stored);
  await saveRunManifest(directory, updated);
  console.log(`  checkpointed ${stage}: ${formatDuration(stored.timing?.elapsedMs)}`);
  return { manifest: updated, result: stored };
};

const writeFinalReport = async ({ directory, manifest }) => {
  const preview = manifest.stages.preview.result;
  const final = manifest.stages.final.result;
  const refine = manifest.stages.refine.result;
  const refineDenoise = Number(manifest.health.comfyui?.refine?.denoise ?? refine.denoise ?? 0.28);
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: manifest.baseUrl,
    seed: manifest.seed,
    prompt: manifest.prompt,
    health: manifest.health,
    preview,
    final,
    refine,
  };
  await writeFile(path.join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grimoire AI QA</title>
<style>body{font-family:system-ui;background:#111;color:#eee;margin:24px}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}figure{margin:0}img{width:100%;height:auto;border:1px solid #666}figcaption{padding:8px 0;font-weight:700}small{display:block;font-weight:400;opacity:.75;padding-top:4px}pre{white-space:pre-wrap;background:#1b1b1b;padding:12px;overflow:auto}@media(max-width:800px){main{grid-template-columns:1fr}}</style></head>
<body><h1>Grimoire Local AI QA</h1><p>Seed ${manifest.seed}; refine denoise ${refineDenoise}.</p><main>
<figure><img src="preview.png"><figcaption>Preview ${preview.width}×${preview.height} · ${preview.steps} steps<small>${formatDuration(preview.timing?.elapsedMs)}</small></figcaption></figure>
<figure><img src="final.png"><figcaption>Final ${final.width}×${final.height} · ${final.steps} steps<small>${formatDuration(final.timing?.elapsedMs)}</small></figcaption></figure>
<figure><img src="refine.png"><figcaption>Refine ${refine.width}×${refine.height} · ${refine.steps} steps · denoise ${refine.denoise}<small>${formatDuration(refine.timing?.elapsedMs)}</small></figcaption></figure>
</main><h2>Prompt</h2><pre>${escapeHtml(manifest.prompt)}</pre></body></html>`;
  await writeFile(path.join(directory, 'index.html'), html);

  const completed = markRunComplete(manifest);
  await saveRunManifest(directory, completed);
  return completed;
};

const main = async () => {
  const health = await verifyContracts();
  if (contractsOnly) {
    console.log('Contract-only QA passed.');
    return;
  }

  assert(health.imageProvider === 'comfyui', 'full render QA currently requires IMAGE_PROVIDER=comfyui');
  for (const mode of ['preview', 'final', 'refine']) {
    assert(health.api.imageModes.includes(mode), `API must support ${mode}`);
  }

  let { directory, manifest } = await createOrResumeRun(health);
  const expectedHealth = manifest.health;
  const seed = manifest.seed;
  const prompt = manifest.prompt;

  if (!manifest.stages.preview?.complete) {
    console.log('Rendering preview...');
    const live = await render({ prompt, mode: 'preview', seed });
    assertRender(live, 'preview', readExpectedPreset(expectedHealth, 'preview'), seed);
    assert(live.providerImage?.filename, 'preview must retain a ComfyUI provider image reference');
    ({ manifest } = await saveStage({ directory, manifest, stage: 'preview', result: live }));
  } else {
    console.log('Preview checkpoint found; skipping completed Preview render.');
  }

  if (!manifest.stages.final?.complete) {
    console.log('Rendering seed-matched final...');
    const live = await render({ prompt, mode: 'final', seed });
    assertRender(live, 'final', readExpectedPreset(expectedHealth, 'final'), seed);
    ({ manifest } = await saveStage({ directory, manifest, stage: 'final', result: live }));
  } else {
    console.log('Final checkpoint found; skipping completed Final render.');
  }

  if (!manifest.stages.refine?.complete) {
    const preview = manifest.stages.preview?.result;
    assert(preview?.providerImage?.filename, 'checkpointed Preview must retain a ComfyUI provider image reference');
    console.log('Rendering composition-preserving refine...');
    const refineDenoise = Number(expectedHealth.comfyui?.refine?.denoise ?? 0.28);
    const live = await render({
      prompt,
      mode: 'refine',
      seed,
      sourceImage: preview.providerImage,
      denoise: refineDenoise,
    });
    assertRender(live, 'refine', readExpectedPreset(expectedHealth, 'refine'), seed);
    assert(Math.abs(Number(live.denoise) - refineDenoise) < 0.0001, 'refine must report the requested denoise');
    ({ manifest } = await saveStage({ directory, manifest, stage: 'refine', result: live }));
  } else {
    console.log('Refine checkpoint found; skipping completed Refine render.');
  }

  manifest = await writeFinalReport({ directory, manifest });
  assert(manifest.complete === true, 'completed QA manifest must be marked complete');
  console.log(`Full local-AI QA passed. Visual comparison report: ${path.join(directory, 'index.html')}`);
};

main().catch(error => {
  console.error(error.stack || error.message || error);
  if (activeRunDir) {
    console.error(`Checkpoint preserved at: ${activeRunDir}`);
    console.error('After correcting the interruption, resume deliberately with: npm run qa:ai:resume');
  }
  process.exitCode = 1;
});
