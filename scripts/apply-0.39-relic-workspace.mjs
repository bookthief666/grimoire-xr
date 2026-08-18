import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');
let wordingRepaired = false;

const truthStatus = `reforgeStatus: 'INSCRIBING TRUTH...'`;
const interpretationStatus = `reforgeStatus: 'INSCRIBING INTERPRETATION...'`;
if (app.includes(truthStatus)) {
  app = app.replace(truthStatus, interpretationStatus);
  wordingRepaired = true;
}

const done = app.includes("import RelicWorkspace from './tarotBridge/RelicWorkspace.jsx';")
  && app.includes('<RelicWorkspace')
  && app.includes('onRemanifest={() => handleRetryCard(state.focusedCard)}')
  && !app.includes('<CardRelicAuthorityPanel card={state.focusedCard} tradition={state.selectedTradition} />');
if (done) {
  if (app.includes('<d                <div className="flex-1 min-w-0">')) {
    throw new Error('0.39 activation detected a corrupted prior modal boundary. Restore src/App.jsx from the branch HEAD and rerun the activator.');
  }
  if (wordingRepaired) fs.writeFileSync(appPath, app);
  console.log(wordingRepaired
    ? '0.39 relic workspace already applied; repaired forge wording to INSCRIBING INTERPRETATION.'
    : '0.39 relic workspace activation already applied.');
  process.exit(0);
}

const oldImport = `import CardRelicAuthorityPanel from './tarotBridge/CardRelicAuthorityPanel.jsx';`;
const newImport = `import RelicWorkspace from './tarotBridge/RelicWorkspace.jsx';`;
if (!app.includes(oldImport)) throw new Error('0.39 activation refused: accepted 0.38 authority-panel import not found.');

const workspaceStart = `                <div className="flex-1 min-w-0">\n                  <div className="mb-8 space-y-3">`;
const modalEndAnchor = `              </div>\n            </motion.div>\n          </motion.div>\n        )}\n      </AnimatePresence>`;
const start = app.indexOf(workspaceStart);
if (start < 0) throw new Error('0.39 activation refused: focused-card right-column parent shape changed.');
const end = app.indexOf(modalEndAnchor, start);
if (end < 0) throw new Error('0.39 activation refused: focused-card modal closing shape changed.');
const existingColumn = app.slice(start, end);
for (const required of [
  '<CardRelicAuthorityPanel card={state.focusedCard} tradition={state.selectedTradition} />',
  'INTERPRETIVE EXEGESIS',
  'REFLECTION METADATA',
  'RE-MANIFEST PREVIEW',
  'REFINE FINAL',
  'Visual Prompt',
]) {
  if (!existingColumn.includes(required)) throw new Error(`0.39 activation refused: expected 0.38 modal content missing: ${required}`);
}

const replacement = `                <div className="flex-1 min-w-0">\n                  <RelicWorkspace\n                    card={state.focusedCard}\n                    tradition={state.selectedTradition}\n                    isForging={state.isForging}\n                    forgeStatus={state.reforgeStatus}\n                    canFinalize={canFinalizeCard(state.focusedCard)}\n                    canRefine={canRefineCard(state.focusedCard)}\n                    onRemanifest={() => handleRetryCard(state.focusedCard)}\n                    onFinalize={() => handleFinalizeCard(state.focusedCard)}\n                    onRefine={() => handleRefineCard(state.focusedCard)}\n                    onCopyPrompt={copyToClipboard}\n                    copied={copied}\n                  />\n                </div>\n`;

// Important: replace the indexed modal slice before changing any earlier text.
// Swapping the import first changes the file length and invalidates start/end,
// which can leave a partial JSX token at the replacement boundary.
app = `${app.slice(0, start)}${replacement}${app.slice(end)}`;
app = app.replace(oldImport, newImport);

if (app.includes('<d                <div className="flex-1 min-w-0">')) {
  throw new Error('0.39 activation produced an invalid partial JSX boundary; refusing to write src/App.jsx.');
}
if (!app.includes("reforgeStatus: 'INSCRIBING INTERPRETATION...'")) {
  throw new Error('0.39 activation failed to preserve the interpretation-safe forge status.');
}

fs.writeFileSync(appPath, app);
console.log('Applied 0.39 Relic Workspace to src/App.jsx.');
