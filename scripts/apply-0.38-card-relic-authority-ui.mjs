import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'src', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const alreadyApplied = app.includes("from './tarotBridge/CardRelicAuthorityPanel.jsx';")
  && app.includes('<CardRelicAuthorityPanel card={state.focusedCard} tradition={state.selectedTradition} />')
  && app.includes("exegesisAuthority: card.exegesisAuthority")
  && app.includes('AI-GENERATED REFLECTION METADATA')
  && app.includes('AI-GENERATED EXEGESIS');

if (alreadyApplied) {
  console.log('0.38 card relic authority UI activation already applied.');
  process.exit(0);
}

const importNeedle = `import ReadingProvenancePanel from './tarotBridge/ReadingProvenancePanel.jsx';`;
const importReplacement = `${importNeedle}\nimport CardRelicAuthorityPanel from './tarotBridge/CardRelicAuthorityPanel.jsx';`;

const dataNeedle = `    if (setStatusCb) setStatusCb(card.exegesis && card.meta ? "PREPARING IMAGE..." : "SCRIBING EXEGESIS...");
    let data;
    if (card.exegesis && card.meta) {
        data = { exegesis: card.exegesis, meta: card.meta, visual: card.visual }; `;
const dataReplacement = `    if (setStatusCb) setStatusCb(card.exegesis && card.meta ? "PREPARING IMAGE..." : "SCRIBING EXEGESIS...");
    const reusingStoredInterpretation = Boolean(card.exegesis && card.meta);
    const inheritedModelAuthority = card.interpretiveMetaAuthority === 'MODEL_GENERATED_REFLECTION';
    let data;
    if (reusingStoredInterpretation) {
        data = { exegesis: card.exegesis, meta: card.meta, visual: card.visual }; `;

const authorityNeedle = `      canonicalCardId: canonicalContext?.cardId || card.canonicalCardId || null,
      interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
      imageUrl: rendered.imageUrl,`;
const authorityReplacement = `      canonicalCardId: canonicalContext?.cardId || card.canonicalCardId || null,
      exegesisAuthority: card.exegesisAuthority || ((!reusingStoredInterpretation || inheritedModelAuthority) ? 'MODEL_GENERATED_INTERPRETATION' : 'LEGACY_UNCLASSIFIED_INTERPRETATION'),
      interpretiveMetaAuthority: card.interpretiveMetaAuthority || (reusingStoredInterpretation ? 'LEGACY_UNCLASSIFIED_REFLECTION' : 'MODEL_GENERATED_REFLECTION'),
      visualAuthority: card.visualAuthority || ((!reusingStoredInterpretation || inheritedModelAuthority) ? 'MODEL_GENERATED_IMAGE_DIRECTION' : 'LEGACY_UNCLASSIFIED_IMAGE_DIRECTION'),
      imageUrl: rendered.imageUrl,`;

const panelNeedle = `                  {state.isForging && !state.focusedCard.exegesis ? <div className="text-center font-header text-red-600 text-xs animate-pulse mt-10">INSCRIBING TRUTH...</div> : state.focusedCard.exegesis && (`;
const panelReplacement = `                  <CardRelicAuthorityPanel card={state.focusedCard} tradition={state.selectedTradition} />

                  {state.isForging && !state.focusedCard.exegesis ? <div className="text-center font-header text-red-600 text-xs animate-pulse mt-10">INSCRIBING TRUTH...</div> : state.focusedCard.exegesis && (`;

const exegesisNeedle = `                      <p className="break-words">{state.focusedCard.exegesis}</p>`;
const exegesisReplacement = `                      <div className="p-4 border border-red-600/30 bg-red-950/10">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="font-header text-[8px] sm:text-[9px] text-red-400">AI-GENERATED EXEGESIS</span>
                          <span className="px-2 py-1 border border-red-600/50 font-header text-[7px] text-red-400">{state.focusedCard.exegesisAuthority || 'LEGACY_UNCLASSIFIED_INTERPRETATION'}</span>
                          <span className="px-2 py-1 border border-red-600/30 font-header text-[7px] text-red-500/70">NOT SOURCE FACT</span>
                        </div>
                        <p className="break-words">{state.focusedCard.exegesis}</p>
                      </div>`;

const metaBlockNeedle = `                      <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-6 sm:pt-8 border-t border-red-600/30">
                        {Object.entries(state.focusedCard.meta || {}).map(([k, v]) => (
                          <div key={k} className="p-3 sm:p-4 bg-red-900/10 border border-red-600/30 min-w-0">
                            <span className="text-[8px] uppercase text-red-600 block mb-1 font-header opacity-50">{k}</span>
                            <span className="text-xs sm:text-base font-bold text-[#e5c158] break-words leading-tight block">
                               {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>`;
const metaBlockReplacement = `                      <div className="pt-6 sm:pt-8 border-t border-red-600/30">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="font-header text-[8px] sm:text-[9px] text-red-400">AI-GENERATED REFLECTION METADATA</span>
                          <span className="px-2 py-1 border border-red-600/50 font-header text-[7px] text-red-400">{state.focusedCard.interpretiveMetaAuthority || 'LEGACY_UNCLASSIFIED_REFLECTION'}</span>
                          <span className="px-2 py-1 border border-red-600/30 font-header text-[7px] text-red-500/70">NOT SOURCE FACT</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          {Object.entries(state.focusedCard.meta || {}).map(([k, v]) => (
                            <div key={k} className="p-3 sm:p-4 bg-red-900/10 border border-red-600/30 min-w-0">
                              <span className="text-[8px] uppercase text-red-600 block mb-1 font-header opacity-50">{k}</span>
                              <span className="text-xs sm:text-base font-bold text-[#e5c158] break-words leading-tight block">
                                 {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>`;

for (const [label, needle] of [
  ['authority panel import', importNeedle],
  ['generation data branch', dataNeedle],
  ['generation authority return', authorityNeedle],
  ['focused-card authority insertion', panelNeedle],
  ['focused-card exegesis block', exegesisNeedle],
  ['focused-card meta block', metaBlockNeedle],
]) {
  if (!app.includes(needle)) throw new Error(`0.38 activation refused: ${label} parent shape changed.`);
}

app = app
  .replace(importNeedle, importReplacement)
  .replace(dataNeedle, dataReplacement)
  .replace(authorityNeedle, authorityReplacement)
  .replace(panelNeedle, panelReplacement)
  .replace(exegesisNeedle, exegesisReplacement)
  .replace(metaBlockNeedle, metaBlockReplacement);

fs.writeFileSync(appPath, app);
console.log('Applied 0.38 card relic authority UI to src/App.jsx.');
