import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server', 'index.mjs'), 'utf8');
const textContract = fs.readFileSync(path.join(root, 'server', 'text-contract.mjs'), 'utf8');

const appMust = [
  "from './tarotBridge/canonicalDeckGenesis.js';",
  'validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: state.selectedTradition }))',
  'body: { prompt, isJson, task: task || undefined }',
  "true, 'ritual'",
  "true, 'card'",
  "fetchGemini(canonicalPrompt, true, 'oracle')",
];
for (const marker of appMust) {
  if (!app.includes(marker)) throw new Error(`0.37 static gate failed: missing App marker: ${marker}`);
}

const appForbidden = [
  'action.payload.cards.map((name, i) => ({',
  'List 78 Card Names fusing the subject',
  'cards: initRes.cards',
  '"cards": ["Name 1", ...]',
];
for (const marker of appForbidden) {
  if (app.includes(marker)) throw new Error(`0.37 static gate failed: model-authored deck path remains: ${marker}`);
}

const serverMust = [
  "from './text-request.mjs';",
  'const input = normalizeTextRequest(body);',
  'const generateGeminiText = async ({ prompt, isJson, task = null }) => {',
  'validateProviderTextResult({ task, isJson }, parsed)',
];
for (const marker of serverMust) {
  if (!server.includes(marker)) throw new Error(`0.37 static gate failed: missing server marker: ${marker}`);
}
if (server.includes('const validateTextRequest = ({ prompt, isJson = true } = {}) => {')) {
  throw new Error('0.37 static gate failed: server still strips explicit text task identity.');
}
if (textContract.includes('minItems: 78') || textContract.includes('ritual output must contain exactly 78 card names')) {
  throw new Error('0.37 static gate failed: ritual structured contract still asks the model to author deck identity.');
}

console.log('0.37 canonical deck genesis static gate: PASS');
