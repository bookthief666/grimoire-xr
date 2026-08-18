import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
const serverPath = path.join(root, 'server', 'index.mjs');
let app = fs.readFileSync(appPath, 'utf8');
let server = fs.readFileSync(serverPath, 'utf8');

const appDone = app.includes("from './tarotBridge/canonicalDeckGenesis.js';")
  && app.includes("task: task || undefined")
  && !app.includes('action.payload.cards.map((name, i) => ({')
  && !app.includes('List 78 Card Names fusing the subject');
const serverDone = server.includes("from './text-request.mjs';")
  && server.includes('const input = normalizeTextRequest(body);')
  && server.includes('validateProviderTextResult({ task, isJson }, parsed)');
if (appDone && serverDone) {
  console.log('0.37 canonical deck genesis activation already applied.');
  process.exit(0);
}

const oldCanonicalImport = `import {
  canonicalCardIdFromLegacyIndex,
  getCanonicalCardPromptContext,
} from './tarotBridge/canonicalTarotBridge.js';`;
const newCanonicalImport = `import {
  getCanonicalCardPromptContext,
} from './tarotBridge/canonicalTarotBridge.js';
import {
  buildCanonicalDeckGenesis,
  validateCanonicalDeckGenesis,
} from './tarotBridge/canonicalDeckGenesis.js';`;

const oldDeckGenesis = `        deck: action.payload.cards.map((name, i) => ({
          id: i,
          canonicalCardId: canonicalCardIdFromLegacyIndex(i),
          name,
          imageUrl: null,
          exegesis: null,
          meta: null,
          interpretiveMetaAuthority: null,
          promptUsed: null,
          patina: 0,
        })),`;
const newDeckGenesis = `        deck: validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: state.selectedTradition })),`;

const oldFetchGemini = `const fetchGemini = async (prompt, isJson = true) => {
  return runGrimoireJob({
    startPath: '/api/text/start',
    statusPath: '/api/text/status',
    body: { prompt, isJson },
    readResult: result => result.output,
  });
};`;
const newFetchGemini = `const fetchGemini = async (prompt, isJson = true, task = null) => {
  return runGrimoireJob({
    startPath: '/api/text/start',
    statusPath: '/api/text/status',
    body: { prompt, isJson, task: task || undefined },
    readResult: result => result.output,
  });
};`;

const oldRitualPrompt = `      const geminiPromise = fetchGemini(\`Role: Supreme Adept of the \${state.selectedTradition.name}. Task: Synthesize "\${state.author}" into a Tarot system. Creative frame: generated manifestation names are presentation labels bound by position to the canonical 0..77 Tarot identity map; do not present generated names or correspondences as historical source facts. Style: \${state.selectedStyle.prompt}. Instructions: 1. Write a 200-word Thesis (Dossier) analyzing the subject's weight. 2. List 78 Card Names fusing the subject with traditional archetypes. 3. Generate 3 profound questions to ask this deck (Oracle Suggestions). 4. TONE: \${techContext} \${erosContext} Return JSON: {"dossier": "string", "cards": ["Name 1", ...], "questions": ["Question 1", "Question 2", "Question 3"]}\`);`;
const newRitualPrompt = `      const geminiPromise = fetchGemini(\`Role: Supreme Adept of the \${state.selectedTradition.name}. Task: Synthesize "\${state.author}" into a consultation dossier for a fixed canonical 78-card Tarot deck. The deck identities and display labels are constructed locally from the canonical semantic contract; you MUST NOT generate, rename, reorder, or return card identities. Style: \${state.selectedStyle.prompt}. Instructions: 1. Write a 200-word Thesis (Dossier) analyzing the subject's weight. 2. Generate 3 profound questions to ask this deck (Oracle Suggestions). 3. TONE: \${techContext} \${erosContext} Return JSON: {"dossier": "string", "questions": ["Question 1", "Question 2", "Question 3"]}\`, true, 'ritual');`;

const oldRitualDispatch = `        dispatch({ type: 'RITUAL_SUCCESS', payload: { dossier: initRes.dossier, cards: initRes.cards, portrait: portUrl, questions: initRes.questions } });`;
const newRitualDispatch = `        dispatch({ type: 'RITUAL_SUCCESS', payload: { dossier: initRes.dossier, portrait: portUrl, questions: initRes.questions } });`;

if (!app.includes(oldCanonicalImport)) throw new Error('0.37 activation refused: canonical import parent shape changed.');
if (!app.includes(oldDeckGenesis)) throw new Error('0.37 activation refused: RITUAL_SUCCESS deck parent shape changed.');
if (!app.includes(oldFetchGemini)) throw new Error('0.37 activation refused: fetchGemini parent shape changed.');
if (!app.includes(oldRitualPrompt)) throw new Error('0.37 activation refused: ritual prompt parent shape changed.');
if (!app.includes(oldRitualDispatch)) throw new Error('0.37 activation refused: ritual dispatch parent shape changed.');

app = app
  .replace(oldCanonicalImport, newCanonicalImport)
  .replace(oldDeckGenesis, newDeckGenesis)
  .replace(oldFetchGemini, newFetchGemini)
  .replace(oldRitualPrompt, newRitualPrompt)
  .replace(oldRitualDispatch, newRitualDispatch);

const cardCallNeedle = 'Return JSON: {"exegesis": "string", "meta": { "hebrew": "string", "planet": "string", "alchemical": "string", "daimon": "string", "gematria": number }, "visual": "string"}`);';
const cardCallReplacement = 'Return JSON: {"exegesis": "string", "meta": { "hebrew": "string", "planet": "string", "alchemical": "string", "daimon": "string", "gematria": number }, "visual": "string"}`, true, \'card\');';
if (!app.includes(cardCallNeedle)) throw new Error('0.37 activation refused: card task call shape changed.');
app = app.replace(cardCallNeedle, cardCallReplacement);

if (!app.includes('const res = await fetchGemini(canonicalPrompt);')) throw new Error('0.37 activation refused: Oracle task call shape changed.');
app = app.replace('const res = await fetchGemini(canonicalPrompt);', "const res = await fetchGemini(canonicalPrompt, true, 'oracle');");

const serverImportNeedle = `import { createResourceScheduler } from './resource-scheduler.mjs';`;
const serverImportReplacement = `${serverImportNeedle}\nimport { normalizeTextRequest, validateProviderTextResult } from './text-request.mjs';`;
const oldValidateTextRequest = `const validateTextRequest = ({ prompt, isJson = true } = {}) => {
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 50_000) {
    throw Object.assign(new Error('A prompt between 1 and 50,000 characters is required.'), { status: 400 });
  }
  return { prompt: prompt.trim(), isJson: Boolean(isJson) };
};

`;
const oldGeminiHeader = `const generateGeminiText = async ({ prompt, isJson }) => {`;
const newGeminiHeader = `const generateGeminiText = async ({ prompt, isJson, task = null }) => {`;
const oldGeminiParse = `  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('The model returned malformed JSON.'), { status: 502 });
  }`;
const newGeminiParse = `  try {
    const parsed = JSON.parse(text);
    return validateProviderTextResult({ task, isJson }, parsed);
  } catch (error) {
    if (error?.code === 'TEXT_SCHEMA_INVALID') throw error;
    throw Object.assign(new Error('The model returned malformed JSON.'), { status: 502 });
  }`;
if (!server.includes(serverImportNeedle)) throw new Error('0.37 activation refused: server import parent shape changed.');
if (!server.includes(oldValidateTextRequest)) throw new Error('0.37 activation refused: server request validator parent shape changed.');
if (!server.includes(oldGeminiHeader)) throw new Error('0.37 activation refused: Gemini text parent shape changed.');
if (!server.includes(oldGeminiParse)) throw new Error('0.37 activation refused: Gemini parse parent shape changed.');
if (!server.includes('const input = validateTextRequest(body);')) throw new Error('0.37 activation refused: generateText parent shape changed.');

server = server
  .replace(serverImportNeedle, serverImportReplacement)
  .replace(oldValidateTextRequest, '')
  .replace(oldGeminiHeader, newGeminiHeader)
  .replace(oldGeminiParse, newGeminiParse)
  .replace('const input = validateTextRequest(body);', 'const input = normalizeTextRequest(body);');

fs.writeFileSync(appPath, app);
fs.writeFileSync(serverPath, server);
console.log('Applied 0.37 canonical deck genesis + explicit text task activation.');
