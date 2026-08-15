import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { TEXT_TASKS, validateStructuredTextResult } from '../server/text-contract.mjs';

const baseUrl = (process.env.GRIMOIRE_QA_API_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
const timeoutMs = Number(process.env.GRIMOIRE_TEXT_QA_TIMEOUT_MS || 20 * 60 * 1000);
const pollMs = Number(process.env.GRIMOIRE_QA_POLL_MS || 2_000);
const outputRoot = path.resolve('qa-output');
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const assert = (condition, message) => { if (!condition) throw new Error(`QA assertion failed: ${message}`); };

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

const pollTextJob = async jobId => {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const result = await requestJson(`/api/text/status?jobId=${encodeURIComponent(jobId)}`);
    if (result.status !== last) {
      console.log(`  ${jobId.slice(0, 8)}: ${result.status}`);
      last = result.status;
    }
    if (result.status === 'ready') return result;
    if (result.status === 'failed') throw new Error(result.error || 'Text job failed.');
    await wait(pollMs);
  }
  throw new Error(`Text job ${jobId} exceeded timeout.`);
};

const runTask = async (task, prompt) => {
  const startedAt = Date.now();
  const started = await requestJson('/api/text/start', {
    method: 'POST',
    body: JSON.stringify({ prompt, isJson: true }),
  });
  const result = await pollTextJob(started.jobId);
  const output = validateStructuredTextResult(task, result.output);
  return {
    task,
    provider: result.provider,
    elapsedMs: Number(result.timing?.elapsedMs || Date.now() - startedAt),
    output,
  };
};

const prompts = {
  [TEXT_TASKS.ritual]: 'Role: Supreme Adept of the Thoth Tarot. Task: Synthesize "Giordano Bruno" into a Tarot system. Source: Secrets of the Thoth Tarot. Style: illuminated hermetic engraving. Instructions: 1. Write a 200-word Thesis (Dossier) analyzing the subject\'s weight. 2. List 78 Card Names fusing the subject with traditional archetypes. 3. Generate 3 profound questions to ask this deck (Oracle Suggestions). Return JSON: {"dossier":"string","cards":["Name 1"],"questions":["Question 1","Question 2","Question 3"]}',
  [TEXT_TASKS.card]: 'Role: Grand Master of Thoth Tarot. Task: Card interpretation for "The Infinite Memory" linked to "Giordano Bruno". Instructions: - Exegesis: 200-word analysis. - Meta: Hebrew Letter, Astrological Ruler, Alchemical Stage, Grimoire Spirit. - Visual: Description for art generation (Hermetic engraving). Return JSON: {"exegesis":"string","meta":{"hebrew":"string","planet":"string","alchemical":"string","daimon":"string","gematria":73},"visual":"string"}',
  [TEXT_TASKS.oracle]: 'Role: Oracle of Giordano Bruno. Tradition: Thoth Tarot. Query: "How should memory become practice?" Cards: The Infinite Memory, The Burning Intellect, The World Soul. Task: Synthesize a 300-word divinatory answer using Elemental Dignities. Return JSON: {"answer":"string"}',
};

const main = async () => {
  const health = await requestJson('/health');
  assert(health.textProvider === 'ollama', 'local text qualification expects Ollama');
  const advertised = new Set(health.api?.structuredTextTasks || []);
  for (const task of Object.values(TEXT_TASKS)) assert(advertised.has(task), `API must advertise ${task}`);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = path.join(outputRoot, `text-qa-${stamp}`);
  await mkdir(directory, { recursive: true });

  const results = [];
  for (const task of Object.values(TEXT_TASKS)) {
    console.log(`Running structured text task: ${task}`);
    results.push(await runTask(task, prompts[task]));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    model: health.ollama?.model,
    results,
  };
  await writeFile(path.join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log('Structured local text QA passed.');
  for (const result of results) console.log(`  ${result.task}: ${Math.round(result.elapsedMs / 1000)}s`);
  console.log(`Report: ${path.join(directory, 'report.json')}`);
};

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
