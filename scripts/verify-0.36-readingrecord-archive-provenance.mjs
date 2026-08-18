import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8');

const must = [
  "from './tarotBridge/archiveEnvelope.js';",
  "from './tarotBridge/archiveHtml.js';",
  "from './tarotBridge/ReadingProvenancePanel.jsx';",
  "case 'RESTORE_ARCHIVE'",
  'generateGrimoireHtmlDocument(state, state.deck)',
  'serializeGrimoireArchive({ state, deck: state.deck })',
  'parseGrimoireArchive(await file.text())',
  '<ReadingProvenancePanel reading={state.reading} />',
  'EXPORT RESTORABLE JSON',
  'RESTORE JSON ARCHIVE',
  'RESTORE ARCHIVE FROM JSON',
  'document.body.appendChild(picker);',
  "picker.addEventListener('cancel', cleanup, { once: true });",
  "currentView === 'oracle' && state.reading",
];
for (const marker of must) {
  if (!app.includes(marker)) throw new Error(`0.36 static gate failed: missing ${marker}`);
}
for (const forbidden of [
  'const generateHtmlDocument = (state, deck) =>',
  'triggerDownload(generateHtmlDocument',
]) {
  if (app.includes(forbidden)) throw new Error(`0.36 static gate failed: legacy path remains: ${forbidden}`);
}
console.log('0.36 ReadingRecord archive/provenance static gate: PASS');
