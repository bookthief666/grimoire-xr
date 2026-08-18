import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const app = read('src/App.jsx');
const workspace = read('src/tarotBridge/RelicWorkspace.jsx');
const model = read('src/tarotBridge/relicWorkspace.js');
const route = read('src/appRoute.js');
const main = read('src/main.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.39 static gate failed: ${message}`);
};

assert(app.includes("import RelicWorkspace from './tarotBridge/RelicWorkspace.jsx';"), 'App must import RelicWorkspace');
assert(app.includes('<RelicWorkspace'), 'focused-card modal must render RelicWorkspace');
assert(app.includes('onRemanifest={() => handleRetryCard(state.focusedCard)}'), 'existing preview regeneration handler must be preserved');
assert(app.includes('onFinalize={() => handleFinalizeCard(state.focusedCard)}'), 'existing finalize handler must be preserved');
assert(app.includes('onRefine={() => handleRefineCard(state.focusedCard)}'), 'existing refine handler must be preserved');
assert(!app.includes('<CardRelicAuthorityPanel card={state.focusedCard} tradition={state.selectedTradition} />'), 'old long authority column must be removed from the real modal');
assert(!app.includes('INSCRIBING TRUTH...'), 'generated interpretation must not be labeled as truth');
assert(app.includes("reforgeStatus: 'INSCRIBING INTERPRETATION...'"), 'forge start must use interpretation-safe wording');

for (const label of ['RELIC', 'CORRESPONDENCES', 'INTERPRETATION', 'GENERATION']) {
  assert(workspace.includes(label), `workspace must expose ${label} mode`);
}
assert(workspace.includes('data-relic-workspace-panel="relic"'), 'workspace must expose a deterministic Relic panel marker');
assert(workspace.includes('data-relic-workspace-panel="correspondences"'), 'workspace must expose a deterministic Correspondences panel marker');
assert(workspace.includes('data-relic-workspace-panel="interpretation"'), 'workspace must expose a deterministic Interpretation panel marker');
assert(workspace.includes('data-relic-workspace-panel="generation"'), 'workspace must expose a deterministic Generation panel marker');
assert(workspace.includes('NOT SOURCE FACT'), 'interpretation and generation layers must retain authority warning');
assert(model.includes("sourceQualification: authority.sourceQualification"), 'workspace model must preserve canonical source qualification');
assert(model.includes('isSourceFact: false'), 'workspace model must explicitly classify generated layers as non-source');

assert(route.includes("relicWorkspaceQa: 'relic-workspace-qa'"), 'route registry must include relic workspace QA');
assert(route.includes("normalizedPath.startsWith('/qa/relic-workspace')"), 'relic workspace QA route must be explicit');
assert(main.includes("import('./tarotBridge/RelicWorkspaceQaApp.jsx')"), 'entrypoint must lazy-load relic workspace QA');

console.log('0.39 relic workspace static gate: PASS');
