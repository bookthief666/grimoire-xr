import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const comfyBase = (process.env.COMFYUI_BASE_URL || 'http://127.0.0.1:8188').replace(/\/$/, '');
const checkpoint = process.env.COMFYUI_CHECKPOINT || 'juggernautXL_ragnarokBy.safetensors';
const loraName = process.env.GRIMOIRE_LCM_LORA_NAME || 'lcm_lora_sdxl.safetensors';
const seed = Number(process.env.GRIMOIRE_QA_SEED || 424242);
const stepValues = String(process.env.GRIMOIRE_LCM_STEPS || '4,6,8')
  .split(',').map(value => Number(value.trim())).filter(value => Number.isInteger(value) && value >= 2 && value <= 12);
const width = 640;
const height = 960;
const cfg = 1.0;
const sampler = 'lcm';
const scheduler = 'sgm_uniform';
const negativePrompt = 'text, watermark, logo, low quality, blurry, malformed hands, extra fingers, duplicate limbs';
const outputRoot = path.resolve('qa-output');
const clientId = randomUUID();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(`QA assertion failed: ${message}`); };

const requestJson = async (pathname, options = {}, timeoutMs = 120_000) => {
  const response = await fetch(`${comfyBase}${pathname}`, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
  if (!response.ok) throw new Error(typeof data === 'string' ? data.slice(0, 500) : (data?.error?.message || data?.error || `HTTP ${response.status}`));
  return data;
};

const latestCompletedBaseline = async () => {
  const entries = await readdir(outputRoot, { withFileTypes: true });
  const candidates = entries.filter(entry => entry.isDirectory() && entry.name.startsWith('local-ai-'))
    .map(entry => path.join(outputRoot, entry.name)).sort().reverse();
  for (const directory of candidates) {
    try {
      const manifest = JSON.parse(await readFile(path.join(directory, 'run.json'), 'utf8'));
      if (manifest.complete === true && manifest.stages?.preview?.complete) return { directory, manifest };
    } catch {
      // Ignore pre-checkpoint harness directories.
    }
  }
  return null;
};

const buildWorkflow = ({ prompt, steps }) => ({
  '3': {
    class_type: 'KSampler',
    inputs: {
      cfg,
      denoise: 1,
      latent_image: ['5', 0],
      model: ['10', 0],
      negative: ['7', 0],
      positive: ['6', 0],
      sampler_name: sampler,
      scheduler,
      seed,
      steps,
    },
  },
  '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: checkpoint } },
  '5': { class_type: 'EmptyLatentImage', inputs: { batch_size: 1, height, width } },
  '6': { class_type: 'CLIPTextEncode', inputs: { clip: ['10', 1], text: prompt } },
  '7': { class_type: 'CLIPTextEncode', inputs: { clip: ['10', 1], text: negativePrompt } },
  '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
  '9': { class_type: 'SaveImage', inputs: { filename_prefix: `GrimoireLCM${steps}`, images: ['8', 0] } },
  '10': {
    class_type: 'LoraLoader',
    inputs: {
      lora_name: loraName,
      model: ['4', 0],
      clip: ['4', 1],
      strength_model: 1,
      strength_clip: 1,
    },
  },
});

const findImage = history => {
  for (const output of Object.values(history?.outputs || {})) {
    const image = output?.images?.[0];
    if (image?.filename) return image;
  }
  return null;
};

const render = async ({ prompt, steps }) => {
  const workflow = buildWorkflow({ prompt, steps });
  const startedAt = Date.now();
  const queued = await requestJson('/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow, client_id: clientId }),
  });
  const promptId = queued?.prompt_id;
  assert(promptId, `ComfyUI must return a prompt id for ${steps}-step LCM`);
  const deadline = Date.now() + 20 * 60 * 1000;
  while (Date.now() < deadline) {
    const data = await requestJson(`/history/${encodeURIComponent(promptId)}`);
    const history = data?.[promptId];
    if (history) {
      const image = findImage(history);
      if (image) {
        const query = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder || '', type: image.type || 'output' });
        const response = await fetch(`${comfyBase}/view?${query}`, { signal: AbortSignal.timeout(120_000) });
        if (!response.ok) throw new Error(`ComfyUI image fetch failed (${response.status}).`);
        return { bytes: Buffer.from(await response.arrayBuffer()), image, elapsedMs: Date.now() - startedAt };
      }
      const executionError = history?.status?.messages?.find(message => Array.isArray(message) && message[0] === 'execution_error');
      if (executionError) throw new Error(executionError?.[1]?.exception_message || 'LCM ComfyUI execution failed.');
    }
    await wait(2_000);
  }
  throw new Error(`${steps}-step LCM render exceeded timeout.`);
};

const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const main = async () => {
  assert(stepValues.length >= 2, 'LCM benchmark needs at least two step counts');
  const objectInfo = await requestJson('/object_info');
  const samplers = objectInfo?.KSampler?.input?.required?.sampler_name?.[0] || [];
  const schedulers = objectInfo?.KSampler?.input?.required?.scheduler?.[0] || [];
  const loras = objectInfo?.LoraLoader?.input?.required?.lora_name?.[0] || [];
  assert(samplers.includes(sampler), `ComfyUI does not advertise sampler ${sampler}`);
  assert(schedulers.includes(scheduler), `ComfyUI does not advertise scheduler ${scheduler}`);
  assert(loras.includes(loraName), `ComfyUI does not advertise LoRA ${loraName}`);

  const baseline = await latestCompletedBaseline();
  assert(baseline, 'no completed standard Preview baseline was found');
  const prompt = baseline.manifest.prompt;
  const standard = baseline.manifest.stages.preview.result;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = path.join(outputRoot, `lcm-preview-${stamp}`);
  await mkdir(directory, { recursive: true });
  await copyFile(path.join(baseline.directory, 'preview.png'), path.join(directory, 'standard-preview.png'));

  console.log(`Standard Preview baseline: ${Math.round(Number(standard.timing?.elapsedMs || 0) / 1000)}s`);
  const variants = [];
  for (const steps of stepValues) {
    console.log(`Rendering LCM Preview at ${steps} steps...`);
    const result = await render({ prompt, steps });
    const file = `lcm-${steps}-steps.png`;
    await writeFile(path.join(directory, file), result.bytes);
    variants.push({ steps, file, elapsedMs: result.elapsedMs, providerImage: result.image });
    console.log(`  ${steps} steps: ${Math.round(result.elapsedMs / 1000)}s`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baselineDirectory: baseline.directory,
    seed,
    prompt,
    standardPreview: standard,
    lcm: { loraName, cfg, sampler, scheduler, width, height, variants },
  };
  await writeFile(path.join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  const standardSeconds = Math.max(0.001, Number(standard.timing?.elapsedMs || 0) / 1000);
  const figures = variants.map(variant => {
    const seconds = variant.elapsedMs / 1000;
    const speedup = standardSeconds / Math.max(0.001, seconds);
    return `<figure><img src="${variant.file}"><figcaption>LCM ${variant.steps} steps<small>${seconds.toFixed(1)}s · ${speedup.toFixed(2)}× vs baseline</small></figcaption></figure>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grimoire LCM Preview Benchmark</title><style>body{font-family:system-ui;background:#111;color:#eee;margin:24px}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}figure{margin:0}img{width:100%;height:auto;border:1px solid #666}figcaption{font-weight:700;padding:8px 0}small{display:block;font-weight:400;opacity:.75}@media(max-width:900px){main{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){main{grid-template-columns:1fr}}pre{white-space:pre-wrap;background:#1b1b1b;padding:12px}</style></head><body><h1>Fast Preview LCM-LoRA Benchmark</h1><p>Same prompt, seed, 640×960 resolution. Production Preview is unchanged by this benchmark.</p><main><figure><img src="standard-preview.png"><figcaption>Standard 18-step Preview<small>${standardSeconds.toFixed(1)}s</small></figcaption></figure>${figures}</main><h2>Prompt</h2><pre>${escapeHtml(prompt)}</pre></body></html>`;
  await writeFile(path.join(directory, 'index.html'), html);
  console.log(`LCM Preview benchmark passed. Report: ${path.join(directory, 'index.html')}`);
};

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
