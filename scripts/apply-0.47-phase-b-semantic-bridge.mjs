import fs from 'node:fs';

const fail = message => { throw new Error(`0.47 Phase B activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label} expected exactly one anchor, found ${count}`);
  return source.replace(before, after);
};

const bridgePath = 'src/tarotBridge/canonicalTarotBridge.js';
const oraclePath = 'src/tarotBridge/oracleSynthesis.js';
const thresholdPath = 'src/tarotBridge/thresholdReading.js';

let bridge = fs.readFileSync(bridgePath, 'utf8');
if (!bridge.includes("from '../semantic/semanticBridgeConfig.js'")) {
  bridge = replaceOnce(
    bridge,
    "export const UPSTREAM_TAROT_CONTRACT = Object.freeze({",
    "import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';\n\nexport const UPSTREAM_TAROT_CONTRACT = Object.freeze({",
    'canonical bridge semantic-config import',
  );
}

const oldInterpretation = `export const getCanonicalInterpretationConfig = ({ tradition, readingDepth = 'adept' } = {}) => {
  const traditionId = normalizeTraditionId(tradition);
  const base = TRADITION_CONFIGS[traditionId] || TRADITION_CONFIGS.rws;
  const depth = ['neophyte', 'adept', 'magus'].includes(String(readingDepth).toLowerCase())
    ? String(readingDepth).toLowerCase()
    : 'adept';
  return deepFreeze({
    legacyTraditionId: traditionId || 'rws',
    ...base,
    lenses: [...base.lenses],
    readingDepth: depth,
  });
};`;
const newInterpretation = `export const getCanonicalInterpretationConfig = ({ tradition, semanticConfig, readingDepth } = {}) => {
  const resolved = resolveSemanticBridgeConfig({ semanticConfig, tradition, readingDepth });
  return deepFreeze({
    legacyTraditionId: semanticConfig ? null : (normalizeTraditionId(tradition) || null),
    tarotSystem: resolved.tarotSystem,
    correspondenceProfile: resolved.correspondenceProfile,
    relationMethod: resolved.relationMethod,
    lenses: [...resolved.interpretiveLenses],
    ritualTheme: resolved.ritualTheme,
    readingDepth: resolved.readingDepth,
  });
};`;
if (!bridge.includes(newInterpretation)) {
  bridge = replaceOnce(bridge, oldInterpretation, newInterpretation, 'getCanonicalInterpretationConfig');
}

if (!bridge.includes('  semanticConfig,\n  readingDepth,')) {
  bridge = replaceOnce(
    bridge,
    "  tradition,\n  readingDepth = 'adept',",
    '  tradition,\n  semanticConfig,\n  readingDepth,',
    'TRIAD semanticConfig parameter without implicit depth override',
  );
}
bridge = bridge.includes('getCanonicalInterpretationConfig({ tradition, semanticConfig, readingDepth })')
  ? bridge
  : replaceOnce(
      bridge,
      'const interpretation = getCanonicalInterpretationConfig({ tradition, readingDepth });',
      'const interpretation = getCanonicalInterpretationConfig({ tradition, semanticConfig, readingDepth });',
      'TRIAD semanticConfig resolution',
    );

if (!bridge.includes('export const getCanonicalCardPromptContext = ({ card, tradition, semanticConfig } = {}) => {')) {
  bridge = replaceOnce(
    bridge,
    'export const getCanonicalCardPromptContext = ({ card, tradition } = {}) => {',
    'export const getCanonicalCardPromptContext = ({ card, tradition, semanticConfig } = {}) => {',
    'card prompt semanticConfig parameter',
  );
}
bridge = bridge.includes('const interpretation = getCanonicalInterpretationConfig({ tradition, semanticConfig });')
  ? bridge
  : replaceOnce(
      bridge,
      'const interpretation = getCanonicalInterpretationConfig({ tradition });',
      'const interpretation = getCanonicalInterpretationConfig({ tradition, semanticConfig });',
      'card prompt semanticConfig resolution',
    );

if (!bridge.includes('const recordSemanticConfig = semanticBridgeConfigFromReadingRecord(record);')) {
  bridge = replaceOnce(
    bridge,
    "export const buildCanonicalOraclePromptPayload = ({ record, cards } = {}) => {\n  if (!record || !Array.isArray(cards) || cards.length !== 3) throw new Error('Oracle prompt payload requires a canonical TRIAD record and three cards.');",
    "export const buildCanonicalOraclePromptPayload = ({ record, cards } = {}) => {\n  if (!record || !Array.isArray(cards) || cards.length !== 3) throw new Error('Oracle prompt payload requires a canonical TRIAD record and three cards.');\n  const recordSemanticConfig = semanticBridgeConfigFromReadingRecord(record);",
    'ReadingRecord semantic config reconstruction',
  );
}
if (!bridge.includes('      lenses: [...(record.input.lenses || [])],')) {
  bridge = replaceOnce(
    bridge,
    '      relationMethod: record.input.relationMethod,\n      positions:',
    "      relationMethod: record.input.relationMethod,\n      lenses: [...(record.input.lenses || [])],\n      readingDepth: record.input.readingDepth || 'adept',\n      ritualTheme: record.presentationContext?.ritualTheme || 'none',\n      positions:",
    'Oracle payload semantic axes',
  );
}
bridge = bridge.includes('getCanonicalCardPromptContext({ card: cards[index], semanticConfig: recordSemanticConfig })')
  ? bridge
  : replaceOnce(
      bridge,
      "getCanonicalCardPromptContext({ card: cards[index], tradition: { id: record.input.tarotSystem } })",
      'getCanonicalCardPromptContext({ card: cards[index], semanticConfig: recordSemanticConfig })',
      'prompt payload card-context semantic config',
    );

fs.writeFileSync(bridgePath, bridge);

let oracle = fs.readFileSync(oraclePath, 'utf8');
if (!oracle.includes('  semanticConfig,\n  author,')) {
  oracle = replaceOnce(
    oracle,
    '  tradition,\n  author,',
    '  tradition,\n  semanticConfig,\n  author,',
    'Oracle preparation semanticConfig parameter',
  );
}
if (oracle.includes("  readingDepth = 'adept',")) {
  oracle = replaceOnce(
    oracle,
    "  readingDepth = 'adept',",
    '  readingDepth,',
    'Oracle preparation removes implicit depth override',
  );
}
if (!oracle.includes('    semanticConfig,\n    readingDepth,')) {
  oracle = replaceOnce(
    oracle,
    '    tradition,\n    readingDepth,',
    '    tradition,\n    semanticConfig,\n    readingDepth,',
    'Oracle TRIAD semanticConfig propagation',
  );
}
if (!oracle.includes("traditionName: semanticConfig?.tarotSystem || tradition?.name || tradition?.id || tradition")) {
  oracle = replaceOnce(
    oracle,
    'traditionName: tradition?.name || tradition?.id || tradition,',
    "traditionName: semanticConfig?.tarotSystem || tradition?.name || tradition?.id || tradition,",
    'Oracle semantic presentation precedence',
  );
}
if (!oracle.includes('lenses=${(payload.reading.lenses || []).join')) {
  oracle = replaceOnce(
    oracle,
    '`SEMANTIC CONFIG: tarotSystem=${payload.reading.tarotSystem}; correspondenceProfile=${payload.reading.correspondenceProfile}; relationMethod=${payload.reading.relationMethod}; spread=${payload.reading.spreadId}.`,',
    "`SEMANTIC CONFIG: tarotSystem=${payload.reading.tarotSystem}; correspondenceProfile=${payload.reading.correspondenceProfile}; relationMethod=${payload.reading.relationMethod}; lenses=${(payload.reading.lenses || []).join('+') || 'none'}; ritualTheme=${payload.reading.ritualTheme || 'none'}; readingDepth=${payload.reading.readingDepth || 'adept'}; spread=${payload.reading.spreadId}.`,",
    'Oracle prompt explicit semantic axes',
  );
}
fs.writeFileSync(oraclePath, oracle);

let threshold = fs.readFileSync(thresholdPath, 'utf8');
if (!threshold.includes("from '../semantic/semanticBridgeConfig.js'")) {
  threshold = replaceOnce(
    threshold,
    "import { prepareCanonicalOracleConsultation } from './oracleSynthesis.js';",
    "import { prepareCanonicalOracleConsultation } from './oracleSynthesis.js';\nimport { resolveSemanticBridgeConfig } from '../semantic/semanticBridgeConfig.js';",
    'Threshold semantic config import',
  );
}
if (!threshold.includes('  semanticConfig,\n  deck = null,')) {
  threshold = replaceOnce(
    threshold,
    '  tradition,\n  deck = null,',
    '  tradition,\n  semanticConfig,\n  deck = null,',
    'Threshold semanticConfig parameter',
  );
}
if (!threshold.includes('const resolvedSemanticConfig = resolveSemanticBridgeConfig({ semanticConfig, tradition });')) {
  threshold = replaceOnce(
    threshold,
    "  if (!normalizedQuestion) throw new Error('The Threshold requires a question before the cards are drawn.');\n\n  const canonicalDeck =",
    "  if (!normalizedQuestion) throw new Error('The Threshold requires a question before the cards are drawn.');\n  const resolvedSemanticConfig = resolveSemanticBridgeConfig({ semanticConfig, tradition });\n\n  const canonicalDeck =",
    'Threshold semantic config resolution',
  );
}
threshold = threshold.includes("buildCanonicalDeckGenesis({ tradition: { id: resolvedSemanticConfig.tarotSystem } })")
  ? threshold
  : replaceOnce(
      threshold,
      'buildCanonicalDeckGenesis({ tradition })',
      "buildCanonicalDeckGenesis({ tradition: { id: resolvedSemanticConfig.tarotSystem } })",
      'Threshold deck system binding',
    );
if (!threshold.includes('    semanticConfig: resolvedSemanticConfig,')) {
  threshold = replaceOnce(
    threshold,
    '    tradition,\n    author:',
    '    tradition,\n    semanticConfig: resolvedSemanticConfig,\n    author:',
    'Threshold Oracle semanticConfig propagation',
  );
}
threshold = threshold.includes('readingDepth: resolvedSemanticConfig.readingDepth,')
  ? threshold
  : replaceOnce(
      threshold,
      "    readingDepth: 'adept',",
      '    readingDepth: resolvedSemanticConfig.readingDepth,',
      'Threshold reading depth binding',
    );
fs.writeFileSync(thresholdPath, threshold);

console.log('Applied 0.47 Phase B semantic-config bridge integration.');
