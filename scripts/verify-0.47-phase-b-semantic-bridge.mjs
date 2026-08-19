import fs from 'node:fs';

const checks = [];
const expect = (condition, label) => {
  checks.push([Boolean(condition), label]);
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
};

const bridge = fs.readFileSync('src/tarotBridge/canonicalTarotBridge.js', 'utf8');
const oracle = fs.readFileSync('src/tarotBridge/oracleSynthesis.js', 'utf8');
const threshold = fs.readFileSync('src/tarotBridge/thresholdReading.js', 'utf8');

expect(bridge.includes("import { resolveSemanticBridgeConfig, semanticBridgeConfigFromReadingRecord } from '../semantic/semanticBridgeConfig.js';"), 'canonical bridge imports semantic config resolver');
expect(bridge.includes('getCanonicalInterpretationConfig = ({ tradition, semanticConfig, readingDepth }'), 'interpretation config accepts semanticConfig');
expect(bridge.includes('resolveSemanticBridgeConfig({ semanticConfig, tradition, readingDepth })'), 'explicit semantic config resolution occurs inside bridge');
expect(bridge.includes('  semanticConfig,\n  readingDepth,'), 'TRIAD consultation accepts semanticConfig without implicit depth override');
expect(!bridge.includes("  semanticConfig,\n  readingDepth = 'adept',"), 'TRIAD does not overwrite explicit semantic reading depth');
expect(bridge.includes('getCanonicalInterpretationConfig({ tradition, semanticConfig, readingDepth })'), 'TRIAD consultation propagates semanticConfig');
expect(bridge.includes('getCanonicalCardPromptContext = ({ card, tradition, semanticConfig }'), 'card prompt context accepts semanticConfig');
expect(bridge.includes('semanticBridgeConfigFromReadingRecord(record)'), 'Oracle payload reconstructs semantic config from ReadingRecord');
expect(bridge.includes('      lenses: [...(record.input.lenses || [])],'), 'Oracle payload carries interpretive lenses');
expect(bridge.includes("      ritualTheme: record.presentationContext?.ritualTheme || 'none',"), 'Oracle payload carries ritual theme');
expect(bridge.includes('getCanonicalCardPromptContext({ card: cards[index], semanticConfig: recordSemanticConfig })'), 'Oracle payload uses ReadingRecord semantic authority');
expect(!bridge.includes("getCanonicalCardPromptContext({ card: cards[index], tradition: { id: record.input.tarotSystem } })"), 'legacy tarotSystem-to-tradition reconstruction removed from payload');

expect(oracle.includes('  semanticConfig,\n  author,'), 'Oracle preparation accepts semanticConfig');
expect(oracle.includes('  readingDepth,'), 'Oracle preparation leaves depth optional for explicit config');
expect(!oracle.includes("  readingDepth = 'adept',"), 'Oracle preparation does not overwrite explicit semantic reading depth');
expect(oracle.includes('    semanticConfig,\n    readingDepth,'), 'Oracle preparation propagates semanticConfig into ReadingRecord build');
expect(oracle.includes("traditionName: semanticConfig?.tarotSystem || tradition?.name || tradition?.id || tradition"), 'semantic config outranks legacy tradition in Oracle presentation label');
expect(oracle.includes('lenses=${(payload.reading.lenses || []).join'), 'Oracle synthesis prompt discloses semantic lenses');
expect(oracle.includes('ritualTheme=${payload.reading.ritualTheme'), 'Oracle synthesis prompt discloses ritual theme');
expect(oracle.includes('readingDepth=${payload.reading.readingDepth'), 'Oracle synthesis prompt discloses reading depth');

expect(threshold.includes("import { resolveSemanticBridgeConfig } from '../semantic/semanticBridgeConfig.js';"), 'Threshold imports semantic config resolver');
expect(threshold.includes('  semanticConfig,\n  deck = null,'), 'Threshold accepts semanticConfig');
expect(threshold.includes('const resolvedSemanticConfig = resolveSemanticBridgeConfig({ semanticConfig, tradition });'), 'Threshold resolves explicit config before deck genesis');
expect(threshold.includes("buildCanonicalDeckGenesis({ tradition: { id: resolvedSemanticConfig.tarotSystem } })"), 'Threshold binds deck genesis to explicit Tarot system');
expect(threshold.includes('    semanticConfig: resolvedSemanticConfig,'), 'Threshold propagates semanticConfig to Oracle preparation');
expect(threshold.includes('readingDepth: resolvedSemanticConfig.readingDepth,'), 'Threshold reads depth from semantic config');

if (checks.some(([ok]) => !ok)) process.exit(1);
console.log('0.47 Phase B semantic bridge integration gate: PASS');
