import fs from 'node:fs';

const fail = message => { throw new Error(`0.47 Phase C activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};
const replaceCount = (source, before, after, expected, label) => {
  const count = source.split(before).length - 1;
  if (count !== expected) fail(`${label} expected ${expected} anchors, found ${count}`);
  return source.split(before).join(after);
};

const appPath = 'src/App.jsx';
const reliquaryPath = 'src/reliquary/reliquaryStore.js';
const archivePath = 'src/tarotBridge/archiveEnvelope.js';
const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';

const phaseB = fs.readFileSync(bridgePath, 'utf8');
if (!phaseB.includes('getCanonicalInterpretationConfig = ({ tradition, semanticConfig, readingDepth }')) {
  fail('Phase B semantic bridge is not active; run apply-0.47-phase-b-semantic-bridge.mjs first');
}

let app = fs.readFileSync(appPath, 'utf8');
if (!app.includes("from './semantic/semanticRuntimeAdapter.js'")) {
  app = replaceOnce(
    app,
    "import ThresholdLanding from './ThresholdLanding.jsx';",
    "import ThresholdLanding from './ThresholdLanding.jsx';\nimport SemanticConfigurationPanel from './semantic/SemanticConfigurationPanel.jsx';\nimport { buildInterpretiveLensPromptContext } from './semantic/interpretiveLensCatalog.js';\nimport {\n  applySemanticPatchToAppState,\n  createInitialSemanticConfig,\n  migrateAppStateSemanticConfig,\n  readingDepthFromTechLevel,\n  semanticSystemPresentationName,\n} from './semantic/semanticRuntimeAdapter.js';",
    'semantic runtime imports',
  );
}

if (!app.includes('semanticConfig: createInitialSemanticConfig')) {
  app = replaceOnce(
    app,
    '  selectedTradition: TRADITIONS[0], \n  erosLevel: 0,',
    '  selectedTradition: TRADITIONS[0], \n  semanticConfig: createInitialSemanticConfig({ selectedTradition: TRADITIONS[0], techLevel: 1 }),\n  erosLevel: 0,',
    'initial semanticConfig authority',
  );
}

app = app.includes("buildCanonicalDeckGenesis({ tradition: { id: state.semanticConfig.tarotSystem } })")
  ? app
  : replaceOnce(
      app,
      'buildCanonicalDeckGenesis({ tradition: state.selectedTradition })',
      "buildCanonicalDeckGenesis({ tradition: { id: state.semanticConfig.tarotSystem } })",
      'ritual-success deck genesis semantic system',
    );

const oldReducerControls = `    case 'SET_STYLE': return { ...state, selectedStyle: action.payload };
    case 'SET_TRADITION': return { ...state, selectedTradition: action.payload };
    case 'SET_EROS_LEVEL': return { ...state, erosLevel: action.payload };
    case 'SET_TECH_LEVEL': return { ...state, techLevel: action.payload };`;
const newReducerControls = `    case 'SET_STYLE': return { ...state, selectedStyle: action.payload };
    case 'SET_TRADITION':
      return applySemanticPatchToAppState({ state, patch: { tarotSystem: action.payload?.id }, traditions: TRADITIONS }).nextState;
    case 'PATCH_SEMANTIC_CONFIG':
      return applySemanticPatchToAppState({ state, patch: action.payload || {}, traditions: TRADITIONS }).nextState;
    case 'SET_EROS_LEVEL': return { ...state, erosLevel: action.payload };
    case 'SET_TECH_LEVEL':
      return applySemanticPatchToAppState({ state, patch: { readingDepth: readingDepthFromTechLevel(action.payload) }, traditions: TRADITIONS }).nextState;`;
if (!app.includes(newReducerControls)) {
  app = replaceOnce(app, oldReducerControls, newReducerControls, 'reducer semantic authority actions');
}

if (!app.includes("case 'RETURN_TO_LANDING': return { ...initialState, selectedStyle: state.selectedStyle, selectedTradition: state.selectedTradition, semanticConfig: state.semanticConfig, techLevel: state.techLevel };")) {
  app = replaceOnce(
    app,
    "    case 'RETURN_TO_LANDING': return { ...initialState, selectedStyle: state.selectedStyle, selectedTradition: state.selectedTradition };",
    "    case 'RETURN_TO_LANDING': return { ...initialState, selectedStyle: state.selectedStyle, selectedTradition: state.selectedTradition, semanticConfig: state.semanticConfig, techLevel: state.techLevel };",
    'return-to-landing semantic preservation',
  );
}

if (!app.includes("case 'RESTORE_ARCHIVE': {")) {
  app = replaceOnce(
    app,
    "    case 'RESTORE_ARCHIVE': return { ...initialState, ...action.payload };",
    `    case 'RESTORE_ARCHIVE': {
      const restored = migrateAppStateSemanticConfig({
        state: { ...initialState, ...action.payload },
        traditions: TRADITIONS,
      });
      return restored.state;
    }`,
    'restore semantic migration',
  );
}

const oldReliquaryRestore = `    const rebound = rebindSessionCatalogState(entry.state, { styles: ART_STYLES, traditions: TRADITIONS });
    const savedReadingCards = Array.isArray(rebound.reading?.cards) ? rebound.reading.cards : [];
    const savedByCanonicalId = new Map(savedReadingCards.map(card => [card.canonicalCardId || card.id, card]));
    const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: rebound.selectedTradition }));`;
const newReliquaryRestore = `    const rebound = rebindSessionCatalogState(entry.state, { styles: ART_STYLES, traditions: TRADITIONS });
    const migrated = migrateAppStateSemanticConfig({ state: rebound, traditions: TRADITIONS }).state;
    const savedReadingCards = Array.isArray(migrated.reading?.cards) ? migrated.reading.cards : [];
    const savedByCanonicalId = new Map(savedReadingCards.map(card => [card.canonicalCardId || card.id, card]));
    const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: { id: migrated.semanticConfig.tarotSystem } }));`;
if (!app.includes(newReliquaryRestore)) {
  app = replaceOnce(app, oldReliquaryRestore, newReliquaryRestore, 'Reliquary semantic migration before deck reconstruction');
}
if (app.includes('        ...rebound,\n        phase: \'ORACLE\',')) {
  app = replaceOnce(
    app,
    "        ...rebound,\n        phase: 'ORACLE',",
    "        ...migrated,\n        phase: 'ORACLE',",
    'Reliquary restored semantic state payload',
  );
}

if (!app.includes('semanticConfig: state.semanticConfig,\n      });')) {
  app = replaceOnce(
    app,
    `      const prepared = buildThresholdReading({
        question,
        tradition: state.selectedTradition,
      });`,
    `      const prepared = buildThresholdReading({
        question,
        tradition: state.selectedTradition,
        semanticConfig: state.semanticConfig,
      });`,
    'Threshold semanticConfig propagation',
  );
}
if (app.includes('[state.oracleQuestion, state.selectedTradition, oracleBuzz]')) {
  app = replaceOnce(
    app,
    '[state.oracleQuestion, state.selectedTradition, oracleBuzz]',
    '[state.oracleQuestion, state.selectedTradition, state.semanticConfig, oracleBuzz]',
    'Threshold callback semantic dependency',
  );
}

if (!app.includes('      semanticConfig: state.semanticConfig,\n    });\n    const canonicalFacts')) {
  app = replaceOnce(
    app,
    `    const canonicalContext = getCanonicalCardPromptContext({
      card,
      tradition: state.selectedTradition,
    });`,
    `    const canonicalContext = getCanonicalCardPromptContext({
      card,
      tradition: state.selectedTradition,
      semanticConfig: state.semanticConfig,
    });`,
    'card prompt semantic authority',
  );
}

if (!app.includes('        semanticConfig: state.semanticConfig,\n        author: state.author,')) {
  app = replaceOnce(
    app,
    `        question: state.oracleQuestion,
        tradition: state.selectedTradition,
        author: state.author,
        readingDepth: 'adept',`,
    `        question: state.oracleQuestion,
        tradition: state.selectedTradition,
        semanticConfig: state.semanticConfig,
        author: state.author,`,
    'Oracle semanticConfig propagation',
  );
}

app = replaceCount(
  app,
  'traditionName: state.selectedTradition.name,',
  'traditionName: semanticSystemPresentationName(state.semanticConfig),',
  2,
  'canonical synthesis semantic system labels',
);

const oracleDepsAnchor = `    state.author,
    state.selectedTradition,
    state.erosLevel,
    state.techLevel,
    state.activeSpread,`;
if (app.includes(oracleDepsAnchor)) {
  app = replaceOnce(
    app,
    oracleDepsAnchor,
    `    state.author,
    state.selectedTradition,
    state.semanticConfig,
    state.erosLevel,
    state.techLevel,
    state.activeSpread,`,
    'Oracle callback semantic dependency',
  );
}

if (!app.includes('const activeLensContext = buildInterpretiveLensPromptContext(state.semanticConfig.interpretiveLenses);')) {
  app = replaceOnce(
    app,
    '  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {\n    const erosContext = getErosContext(state.erosLevel);',
    '  const generateCardData = async (card, setStatusCb = null, imageOptions = {}) => {\n    const erosContext = getErosContext(state.erosLevel);\n    const activeLensContext = buildInterpretiveLensPromptContext(state.semanticConfig.interpretiveLenses);',
    'card-generation lens context',
  );
}
if (!app.includes('CANONICAL SOURCE CONTEXT: ${canonicalFacts}. ${activeLensContext}')) {
  app = replaceOnce(
    app,
    '- CANONICAL SOURCE CONTEXT: ${canonicalFacts}. Preserve these facts exactly.',
    '- CANONICAL SOURCE CONTEXT: ${canonicalFacts}. Preserve these facts exactly. ${activeLensContext}',
    'card interpretation lens firewall',
  );
}

const intellectBlock = `            <div className="p-4 border border-[#b8860b]/50 bg-[#b8860b]/10 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-header text-[#b8860b] flex items-center gap-2"><Brain size={12}/> INTELLECT</span>
                <span className="text-xs font-header text-white">{TECH_LEVELS[state.techLevel].label}</span>
              </div>
              <input type="range" min="0" max="2" step="1" value={state.techLevel} onChange={(e) => dispatch({ type: 'SET_TECH_LEVEL', payload: parseInt(e.target.value) })} className="w-full accent-[#b8860b]" />
              <p className="text-[10px] mt-2 text-[#b8860b]/60 font-body">{TECH_LEVELS[state.techLevel].desc}</p>
            </div>`;
const doctrinePanel = `            <div className="mb-8">
              <SemanticConfigurationPanel
                config={state.semanticConfig}
                hasActiveReading={Boolean(state.reading)}
                disabled={state.isConsulting || state.isForging}
                onPatch={(patch) => dispatch({ type: 'PATCH_SEMANTIC_CONFIG', payload: patch })}
              />
            </div>`;
if (!app.includes('<SemanticConfigurationPanel')) {
  app = replaceOnce(app, intellectBlock, doctrinePanel, 'replace overloaded Intellect with Reading Doctrine panel');
}

const traditionBlock = `            <div className="mb-6">
              <h3 className="font-header text-xs mb-2 opacity-50 text-[#b8860b]">TRADITION</h3>
              {TRADITIONS.map(t => (
                <button key={t.id} onClick={() => dispatch({ type: 'SET_TRADITION', payload: t })} className={\`block w-full text-left p-2 mb-2 border \${state.selectedTradition.id === t.id ? 'bg-[#b8860b] text-black border-[#b8860b]' : 'border-[#b8860b]/30 text-[#b8860b] hover:border-[#b8860b]'}\`}>{t.name}</button>
              ))}
            </div>`;
if (app.includes(traditionBlock)) {
  app = replaceOnce(app, traditionBlock, '', 'remove overloaded Tradition selector');
}

app = replaceCount(
  app,
  'traditionName={state.selectedTradition.name}',
  'traditionName={semanticSystemPresentationName(state.semanticConfig)}',
  1,
  'Threshold semantic system presentation',
);

const resolverOld = `                    readingCards: state.reading?.cards || [],
                    tradition: state.selectedTradition,`;
const resolverNew = `                    readingCards: state.reading?.cards || [],
                    tradition: { id: state.semanticConfig.tarotSystem },`;
if (!app.includes(resolverNew)) {
  app = replaceOnce(app, resolverOld, resolverNew, 'Oracle relic resolver semantic system');
}

app = replaceCount(
  app,
  'tradition={state.selectedTradition}',
  'tradition={{ id: state.semanticConfig.tarotSystem }}',
  3,
  'Relic authority surfaces semantic system binding',
);

fs.writeFileSync(appPath, app);

let reliquary = fs.readFileSync(reliquaryPath, 'utf8');
if (!reliquary.includes('    semanticConfig: normalized.semanticConfig || null,')) {
  reliquary = replaceOnce(
    reliquary,
    '    selectedTradition: normalized.selectedTradition || null,\n    erosLevel:',
    '    selectedTradition: normalized.selectedTradition || null,\n    semanticConfig: normalized.semanticConfig || null,\n    erosLevel:',
    'Reliquary semanticConfig persistence',
  );
}
fs.writeFileSync(reliquaryPath, reliquary);

let archive = fs.readFileSync(archivePath, 'utf8');
if (archive.includes("export const GRIMOIRE_ARCHIVE_SCHEMA_VERSION = '2.0.0';")) {
  archive = replaceOnce(
    archive,
    "export const GRIMOIRE_ARCHIVE_SCHEMA_VERSION = '2.0.0';",
    "export const GRIMOIRE_ARCHIVE_SCHEMA_VERSION = '2.1.0';",
    'archive schema semantic-config version',
  );
}
if (!archive.includes('      semanticConfig: cloneJson(state.semanticConfig || null),')) {
  archive = replaceOnce(
    archive,
    '      selectedTraditionId: state.selectedTradition?.id || null,\n      erosLevel:',
    '      selectedTraditionId: state.selectedTradition?.id || null,\n      semanticConfig: cloneJson(state.semanticConfig || null),\n      erosLevel:',
    'archive semanticConfig export',
  );
}
if (!archive.includes('      semanticConfig: cloneJson(legacyState?.semanticConfig || null),')) {
  archive = replaceOnce(
    archive,
    '      selectedTraditionId: legacyState?.selectedTradition?.id || legacyState?.selectedTraditionId || null,\n      erosLevel:',
    '      selectedTraditionId: legacyState?.selectedTradition?.id || legacyState?.selectedTraditionId || null,\n      semanticConfig: cloneJson(legacyState?.semanticConfig || null),\n      erosLevel:',
    'legacy archive semanticConfig preservation',
  );
}
if (!archive.includes('    semanticConfig: cloneJson(archived.semanticConfig || null),')) {
  archive = replaceOnce(
    archive,
    '    selectedTradition,\n    erosLevel:',
    '    selectedTradition,\n    semanticConfig: cloneJson(archived.semanticConfig || null),\n    erosLevel:',
    'archive semanticConfig restore',
  );
}
fs.writeFileSync(archivePath, archive);

console.log('Applied 0.47 Phase C semantic runtime + persistence integration.');
