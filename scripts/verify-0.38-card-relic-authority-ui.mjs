import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const app = read('src/App.jsx');
const panel = read('src/tarotBridge/CardRelicAuthorityPanel.jsx');
const authority = read('src/tarotBridge/cardAuthority.js');
const route = read('src/appRoute.js');
const main = read('src/main.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.38 static gate failed: ${message}`);
};

assert(app.includes("import CardRelicAuthorityPanel from './tarotBridge/CardRelicAuthorityPanel.jsx';"), 'App must import the authority panel');
assert(app.includes('<CardRelicAuthorityPanel card={state.focusedCard} tradition={state.selectedTradition} />'), 'focused card must render the authority panel');
assert(app.includes("exegesisAuthority: card.exegesisAuthority"), 'card generation must persist exegesis authority');
assert(app.includes("visualAuthority: card.visualAuthority"), 'card generation must persist visual authority');
assert(app.includes('AI-GENERATED EXEGESIS'), 'focused-card exegesis must be visibly labeled generated');
assert(app.includes('AI-GENERATED REFLECTION METADATA'), 'focused-card metadata must be visibly labeled generated');
assert(app.includes('NOT SOURCE FACT'), 'generated layers must visibly deny source-fact authority');
assert(!app.includes("canonicalCardId: canonicalContext?.cardId || card.canonicalCardId || null,\n      interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',"), 'old unconditional generated-meta-only authority shape must be gone');

assert(panel.includes('RELIC AUTHORITY'), 'authority panel heading must exist');
assert(panel.includes('SOURCE-QUALIFIED EXPRESSION'), 'authority panel must expose canonical expression');
assert(panel.includes('CANONICAL CORRESPONDENCES'), 'authority panel must expose canonical correspondences');
assert(panel.includes('GENERATED INTERPRETATION LAYERS'), 'authority panel must expose generated layers separately');
assert(panel.includes('IMAGE GENERATION PROVENANCE'), 'authority panel must expose image provenance');
assert(authority.includes("sourceQualification: canonical.sourceQualification"), 'view model must preserve source qualification');
assert(authority.includes('canonicalSourceIds'), 'view model must preserve canonical source IDs');

assert(route.includes("cardAuthorityQa: 'card-authority-qa'"), 'route registry must include card-authority QA');
assert(route.includes("normalizedPath.startsWith('/qa/card-authority')"), 'card-authority QA path must be explicit');
assert(main.includes("import('./tarotBridge/CardAuthorityQaApp.jsx')"), 'entrypoint must lazy-load the QA page');

console.log('0.38 card relic authority static gate: PASS');
