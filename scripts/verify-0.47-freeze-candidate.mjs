import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const EXPECTED_RUNTIME_FILES = Object.freeze([
  'src/App.jsx',
  'src/reliquary/reliquaryStore.js',
  'src/tarotBridge/archiveEnvelope.js',
  'src/tarotBridge/canonicalTarotBridge.js',
  'src/tarotBridge/oracleSynthesis.js',
  'src/tarotBridge/thresholdReading.js',
]);

const runGit = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const pass = label => console.log(`PASS ${label}`);
const fail = label => {
  console.error(`FAIL ${label}`);
  process.exitCode = 1;
};
const expect = (condition, label) => (condition ? pass(label) : fail(label));

const branch = runGit(['branch', '--show-current']);
expect(branch === 'agent/0.47-semantic-ontology-integrity', 'freeze occurs on the 0.47 semantic branch');

const modifiedTracked = runGit(['diff', '--name-only'])
  .split('\n')
  .map(value => value.trim())
  .filter(Boolean)
  .sort();
const expected = [...EXPECTED_RUNTIME_FILES].sort();
expect(JSON.stringify(modifiedTracked) === JSON.stringify(expected), 'exactly the six Fold-accepted runtime files are modified');

const staged = runGit(['diff', '--cached', '--name-only']);
expect(staged === '', 'candidate is unstaged before controlled freeze commit');

const status = runGit(['status', '--short']);
const unexpectedUntracked = status
  .split('\n')
  .filter(Boolean)
  .filter(line => line.startsWith('?? '))
  .map(line => line.slice(3))
  .filter(path => path !== '.vercel/' && !path.startsWith('.vercel/'));
expect(unexpectedUntracked.length === 0, 'no unexpected untracked files are present');

const app = fs.readFileSync('src/App.jsx', 'utf8');
const bridge = fs.readFileSync('src/tarotBridge/canonicalTarotBridge.js', 'utf8');
const oracle = fs.readFileSync('src/tarotBridge/oracleSynthesis.js', 'utf8');
const threshold = fs.readFileSync('src/tarotBridge/thresholdReading.js', 'utf8');
const reliquary = fs.readFileSync('src/reliquary/reliquaryStore.js', 'utf8');
const archive = fs.readFileSync('src/tarotBridge/archiveEnvelope.js', 'utf8');

expect(app.includes("import SemanticConfigurationPanel from './semantic/SemanticConfigurationPanel.jsx';"), 'Reading Doctrine runtime is mounted');
expect(app.includes("import CodexStyleLibrary from './codex/CodexStyleLibrary.jsx';"), 'Codex Style Library runtime is mounted');
expect(app.includes("case 'PATCH_SEMANTIC_CONFIG':"), 'semantic patch reducer authority is active');
expect(!app.includes('>TRADITION</h3>') && !app.includes('<Brain size={12}/> INTELLECT'), 'deprecated overloaded Tradition/Intellect controls are absent');
expect(app.includes('{!isMenuOpen && <AudioController />}'), 'floating audio control is suppressed only while Codex is open');
expect(app.includes('w-[min(94vw,30rem)] sm:w-[min(72vw,34rem)]'), 'Fold-aware Codex width is active');
expect(app.includes('sticky top-0 z-20'), 'Codex header remains reachable while scrolling');
expect(app.includes('<CodexStyleLibrary'), '51-style always-expanded wall is replaced');
expect(!app.includes('STYLE ({ART_STYLES.length})'), 'legacy always-expanded Style heading is absent');
expect(app.includes('semanticConfig: state.semanticConfig'), 'App passes semantic authority into canonical runtime calls');

expect(bridge.includes('resolveSemanticBridgeConfig({ semanticConfig, tradition, readingDepth })'), 'canonical bridge resolves explicit semantic configuration');
expect(oracle.includes('buildInterpretiveLensPromptContext(payload.reading.lenses || [])'), 'Oracle lens firewall is downstream of ReadingRecord payload');
expect(threshold.includes('const resolvedSemanticConfig = resolveSemanticBridgeConfig({ semanticConfig, tradition });'), 'Threshold binds deck genesis to semantic configuration');
expect(reliquary.includes('semanticConfig: normalized.semanticConfig || null'), 'Reliquary persists semantic configuration');
expect(archive.includes("GRIMOIRE_ARCHIVE_SCHEMA_VERSION = '2.1.0'"), 'archive schema 2.1 semantic persistence is active');

if (process.exitCode) process.exit(process.exitCode);
console.log('0.47 exact Fold freeze candidate: PASS');
