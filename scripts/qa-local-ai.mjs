import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const contractsOnly = args.has('--contracts-only');
const baseUrl = (process.env.GRIMOIRE_QA_API_URL || 'http://127.0.0.1:8787').replace(/\/$/, '');
const pollMs = Number(process.env.GRIMOIRE_QA_POLL_MS || 2_000);
const timeoutMs = Number(process.env.GRIMOIRE_QA_TIMEOUT_MS || 20 * 60 * 1000);
const fixedSeed = Number(process.env.GRIMOIRE_QA_SEED || 424242);

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const assert = (condition, message) => {
  if (!condition) throw new Error(`QA assertion failed: ${message}`);
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
    const error = Object.assign(
      new Error(payload.error || `HTTP ${response.status}`),
      { status: response.status, payload },
    );
    throw error;
  }
  return payload;
};

const postJson = (pathname, body) => requestJson(pathname, {
  method: 'POST',
  body: JSON.stringify(body),
});

const pollImageJob = async jobId => {
  const deadline = Date.now() + timeoutMs;
  let lastLabel = '';
  while (Date.now() < deadline) {
    const result = await requestJson(`/api/image/status?jobId=${encodeURIComponent(jobId)}`);
    const label = `${result.status}${result.queuePosition ? `#${result.queuePosition}` : ''}`;
    if (label !== lastLabel) {
      console.log(`  image job ${jobId.slice(0, 8)}: ${label}`);
      lastLabel = label;
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

const main = async () => {
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

  if (contractsOnly) {
    console.log('Contract-only QA passed.');
    return;
  }

  assert(health.imageProvider === 'comfyui', 'full render QA currently requires IMAGE_PROVIDER=comfyui');
  for (const mode of ['preview', 'final', 'refine']) {
    assert(health.api.imageModes.includes(mode), `API must support ${mode}`);
  }

  const prompt = [
    'SUBJECT: Tarot card "The High Priestess".',
    'TAROT SYSTEM: Hermetic lunar mystery.',
    'COMPOSITION AND ICONOGRAPHY: a veiled priestess seated between two monumental pillars, crescent moon, still dark water, silver-blue ritual light, strong central symmetry.',
    'FRAMING: premium vertical tarot-card illustration, clear focal hierarchy, edge-safe composition.',
    'CONSTRAINTS: no readable text, no logo, no watermark, no duplicate figure, no extra limbs.',
  ].join('\n');

  console.log('Rendering preview...');
  const preview = await render({ prompt, mode: 'preview', seed: fixedSeed });
  assertRender(preview, 'preview', readExpectedPreset(health, 'preview'), fixedSeed);
  assert(preview.providerImage?.filename, 'preview must retain a ComfyUI provider image reference');

  console.log('Rendering seed-matched final...');
  const final = await render({ prompt, mode: 'final', seed: fixedSeed });
  assertRender(final, 'final', readExpectedPreset(health, 'final'), fixedSeed);

  console.log('Rendering composition-preserving refine...');
  const refineDenoise = Number(health.comfyui?.refine?.denoise ?? 0.28);
  const refine = await render({
    prompt,
    mode: 'refine',
    seed: fixedSeed,
    sourceImage: preview.providerImage,
    denoise: refineDenoise,
  });
  assertRender(refine, 'refine', readExpectedPreset(health, 'refine'), fixedSeed);
  assert(Math.abs(Number(refine.denoise) - refineDenoise) < 0.0001, 'refine must report the requested denoise');

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.resolve('qa-output', `local-ai-${stamp}`);
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeDataUrl(path.join(outputDir, 'preview.png'), preview.imageUrl),
    writeDataUrl(path.join(outputDir, 'final.png'), final.imageUrl),
    writeDataUrl(path.join(outputDir, 'refine.png'), refine.imageUrl),
  ]);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    seed: fixedSeed,
    prompt,
    health: {
      api: health.api,
      textProvider: health.textProvider,
      imageProvider: health.imageProvider,
      comfyui: health.comfyui,
    },
    preview: withoutImageBytes(preview),
    final: withoutImageBytes(final),
    refine: withoutImageBytes(refine),
  };
  await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grimoire AI QA</title>
<style>body{font-family:system-ui;background:#111;color:#eee;margin:24px}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}figure{margin:0}img{width:100%;height:auto;border:1px solid #666}figcaption{padding:8px 0;font-weight:700}pre{white-space:pre-wrap;background:#1b1b1b;padding:12px;overflow:auto}@media(max-width:800px){main{grid-template-columns:1fr}}</style></head>
<body><h1>Grimoire Local AI QA</h1><p>Seed ${fixedSeed}; refine denoise ${refineDenoise}.</p><main>
<figure><img src="preview.png"><figcaption>Preview ${preview.width}×${preview.height} · ${preview.steps} steps</figcaption></figure>
<figure><img src="final.png"><figcaption>Final ${final.width}×${final.height} · ${final.steps} steps</figcaption></figure>
<figure><img src="refine.png"><figcaption>Refine ${refine.width}×${refine.height} · ${refine.steps} steps · denoise ${refine.denoise}</figcaption></figure>
</main><h2>Prompt</h2><pre>${prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
  await writeFile(path.join(outputDir, 'index.html'), html);

  console.log(`Full local-AI QA passed. Visual comparison report: ${path.join(outputDir, 'index.html')}`);
};

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
