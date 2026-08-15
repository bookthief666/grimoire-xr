import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = (process.env.GRIMOIRE_QA_API_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
const timeoutMs = Number(process.env.GRIMOIRE_QA_TIMEOUT_MS || 30 * 60 * 1000);
const pollMs = Number(process.env.GRIMOIRE_QA_POLL_MS || 2_000);
const denoiseValues = String(process.env.GRIMOIRE_REFINE_SWEEP || '0.18,0.24,0.28,0.34')
  .split(',')
  .map(value => Number(value.trim()))
  .filter(value => Number.isFinite(value) && value >= 0.05 && value <= 0.95);
const outputRoot = path.resolve('qa-output');

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
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { error: text || `HTTP ${response.status}` }; }
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload;
};

const pollImageJob = async jobId => {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const result = await requestJson(`/api/image/status?jobId=${encodeURIComponent(jobId)}`);
    if (result.status !== last) {
      console.log(`  ${jobId.slice(0, 8)}: ${result.status}`);
      last = result.status;
    }
    if (result.status === 'ready') return result;
    if (result.status === 'failed') throw new Error(result.error || 'Image job failed.');
    await wait(pollMs);
  }
  throw new Error(`Image job ${jobId} exceeded timeout.`);
};

const render = async body => {
  const started = await requestJson('/api/image/start', { method: 'POST', body: JSON.stringify(body) });
  return pollImageJob(started.jobId);
};

const writeDataUrl = async (destination, dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(String(dataUrl || ''));
  assert(match, `expected image data for ${destination}`);
  await writeFile(destination, Buffer.from(match[2], 'base64'));
};

const latestCompletedBaseline = async () => {
  const entries = await readdir(outputRoot, { withFileTypes: true });
  const candidates = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('local-ai-'))
    .map(entry => path.join(outputRoot, entry.name))
    .sort()
    .reverse();
  for (const directory of candidates) {
    try {
      const manifest = JSON.parse(await readFile(path.join(directory, 'run.json'), 'utf8'));
      if (manifest.complete === true && manifest.stages?.preview?.complete && manifest.stages.preview.result?.providerImage?.filename) {
        return { directory, manifest };
      }
    } catch {
      // Ignore older/incomplete harness directories.
    }
  }
  return null;
};

const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const main = async () => {
  assert(denoiseValues.length >= 2, 'refine sweep needs at least two denoise values');
  const health = await requestJson('/health');
  assert(health.imageProvider === 'comfyui', 'refine sweep requires ComfyUI');
  assert(health.api?.imageModes?.includes('refine'), 'API must support refine mode');

  const baseline = await latestCompletedBaseline();
  assert(baseline, 'no completed baseline QA run with a retained Preview source was found');
  const { manifest } = baseline;
  const preview = manifest.stages.preview.result;
  const expected = health.comfyui?.refine || {};
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = path.join(outputRoot, `refine-sweep-${stamp}`);
  await mkdir(directory, { recursive: true });
  await copyFile(path.join(baseline.directory, 'preview.png'), path.join(directory, 'preview.png'));

  console.log(`Refine sweep source: ${baseline.directory}`);
  console.log(`Seed: ${manifest.seed}`);
  console.log(`Denoise values: ${denoiseValues.join(', ')}`);

  const variants = [];
  for (const denoise of denoiseValues) {
    console.log(`Rendering refine denoise ${denoise.toFixed(2)}...`);
    const result = await render({
      prompt: manifest.prompt,
      mode: 'refine',
      seed: manifest.seed,
      sourceImage: preview.providerImage,
      denoise,
    });
    assert(result.mode === 'refine', 'result must report refine mode');
    assert(result.seed === manifest.seed, 'result must preserve baseline seed');
    assert(result.width === expected.width && result.height === expected.height, 'result must use current refine dimensions');
    assert(result.steps === expected.steps, 'result must use current refine steps');
    assert(Math.abs(Number(result.denoise) - denoise) < 0.0001, 'result must report requested denoise');
    const file = `refine-${denoise.toFixed(2).replace('.', '-')}.png`;
    await writeDataUrl(path.join(directory, file), result.imageUrl);
    const { imageUrl, ...metadata } = result;
    variants.push({ denoise, file, metadata });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baselineDirectory: baseline.directory,
    seed: manifest.seed,
    prompt: manifest.prompt,
    preview,
    refinePreset: expected,
    variants,
  };
  await writeFile(path.join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

  const figures = variants.map(variant => {
    const ms = Number(variant.metadata?.timing?.elapsedMs || 0);
    return `<figure><img src="${variant.file}"><figcaption>Denoise ${variant.denoise.toFixed(2)}<small>${Math.round(ms / 1000)}s</small></figcaption></figure>`;
  }).join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grimoire Refine Sweep</title><style>body{font-family:system-ui;background:#111;color:#eee;margin:24px}main{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}figure{margin:0}img{width:100%;height:auto;border:1px solid #666}figcaption{font-weight:700;padding:8px 0}small{display:block;font-weight:400;opacity:.7}@media(max-width:1000px){main{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){main{grid-template-columns:1fr}}pre{white-space:pre-wrap;background:#1b1b1b;padding:12px}</style></head><body><h1>Refine Denoise Sweep</h1><p>One fixed Preview source, prompt, and seed. Lower denoise should preserve more source structure.</p><main><figure><img src="preview.png"><figcaption>Source Preview</figcaption></figure>${figures}</main><h2>Prompt</h2><pre>${escapeHtml(manifest.prompt)}</pre></body></html>`;
  await writeFile(path.join(directory, 'index.html'), html);
  console.log(`Refine sweep passed. Report: ${path.join(directory, 'index.html')}`);
};

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
