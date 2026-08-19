import fs from 'node:fs';

const checks = [];
const expect = (condition, label) => {
  checks.push([Boolean(condition), label]);
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
};

const app = fs.readFileSync('src/App.jsx', 'utf8');
const reliquary = fs.readFileSync('src/reliquary/reliquaryStore.js', 'utf8');
const archive = fs.readFileSync('src/tarotBridge/archiveEnvelope.js', 'utf8');
const oracle = fs.readFileSync('src/tarotBridge/oracleSynthesis.js', 'utf8');

expect(app.includes("import SemanticConfigurationPanel from './semantic/SemanticConfigurationPanel.jsx';"), 'App imports Reading Doctrine control surface');
expect(app.includes("from './semantic/semanticRuntimeAdapter.js'"), 'App imports semantic runtime adapter');
expect(app.includes("import { buildInterpretiveLensPromptContext } from './semantic/interpretiveLensCatalog.js';"), 'App imports interpretation-only lens context');
expect(app.includes('semanticConfig: createInitialSemanticConfig({ selectedTradition: TRADITIONS[0], techLevel: 1 })'), 'semanticConfig exists in initial reducer state');
expect(app.includes("case 'PATCH_SEMANTIC_CONFIG':"), 'reducer exposes semantic patch action');
expect(app.includes('applySemanticPatchToAppState({ state, patch: action.payload || {}, traditions: TRADITIONS }).nextState'), 'semantic patches use tested transition planner');
expect(app.includes("buildCanonicalDeckGenesis({ tradition: { id: state.semanticConfig.tarotSystem } })"), 'ritual deck genesis uses semantic Tarot system');
expect(app.includes('migrateAppStateSemanticConfig({'), 'restore paths use semantic migration');
expect(app.includes('semanticConfig: state.semanticConfig,'), 'canonical runtime calls receive semanticConfig');
expect(app.includes('traditionName: semanticSystemPresentationName(state.semanticConfig),'), 'canonical synthesis labels use semantic system');
expect(app.includes('const activeLensContext = buildInterpretiveLensPromptContext(state.semanticConfig.interpretiveLenses);'), 'card generation receives interpretation-only lens context');
expect(app.includes('${activeLensContext}'), 'card-generation prompt includes lens firewall context');
expect(app.includes('<SemanticConfigurationPanel'), 'Reading Doctrine panel is mounted');
expect(app.includes("onPatch={(patch) => dispatch({ type: 'PATCH_SEMANTIC_CONFIG', payload: patch })}"), 'Reading Doctrine panel drives semantic patch action');
expect(!app.includes('>TRADITION</h3>'), 'overloaded Tradition selector removed from runtime UI');
expect(!app.includes('<Brain size={12}/> INTELLECT'), 'overloaded Intellect slider removed from runtime UI');
expect(app.includes('tradition={{ id: state.semanticConfig.tarotSystem }}'), 'Relic authority surfaces bind to semantic Tarot system');
expect(app.includes('tradition: { id: state.semanticConfig.tarotSystem },'), 'Oracle relic resolver binds to semantic Tarot system');
expect(app.includes('const migrated = migrateAppStateSemanticConfig({ state: rebound, traditions: TRADITIONS }).state;'), 'Reliquary restore migrates semantics before deck reconstruction');

expect(reliquary.includes('semanticConfig: normalized.semanticConfig || null'), 'new Reliquary memories persist semantic config');
expect(archive.includes("GRIMOIRE_ARCHIVE_SCHEMA_VERSION = '2.1.0'"), 'archive schema advances for semantic configuration');
expect(archive.includes('semanticConfig: cloneJson(state.semanticConfig || null)'), 'archive export preserves semantic config');
expect(archive.includes('semanticConfig: cloneJson(archived.semanticConfig || null)'), 'archive restore exposes semantic config');
expect(oracle.includes("import { buildInterpretiveLensPromptContext } from '../semantic/interpretiveLensCatalog.js';"), 'Oracle synthesis imports lens firewall');
expect(oracle.includes('const lensContext = buildInterpretiveLensPromptContext(payload.reading.lenses || []);'), 'Oracle lens context derives only from ReadingRecord payload');
expect(oracle.includes('    lensContext,'), 'Oracle synthesis inserts lens directives downstream of semantic config');

expect(!app.includes("case 'SET_TRADITION': return { ...state, selectedTradition: action.payload };"), 'legacy direct tradition mutation is absent');
expect(!app.includes("case 'SET_TECH_LEVEL': return { ...state, techLevel: action.payload };"), 'legacy direct tech-level mutation is absent');
expect(!app.includes("readingDepth: 'adept',"), 'Oracle runtime no longer hardcodes Adept depth');

if (checks.some(([ok]) => !ok)) process.exit(1);
console.log('0.47 Phase C semantic runtime integration gate: PASS');
