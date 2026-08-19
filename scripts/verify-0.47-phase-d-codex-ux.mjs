import fs from 'node:fs';

const checks = [];
const expect = (condition, label) => {
  checks.push([Boolean(condition), label]);
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
};

const app = fs.readFileSync('src/App.jsx', 'utf8');
const doctrine = fs.readFileSync('src/semantic/SemanticConfigurationPanel.jsx', 'utf8');
const styleLibrary = fs.readFileSync('src/codex/CodexStyleLibrary.jsx', 'utf8');

expect(app.includes("import CodexStyleLibrary from './codex/CodexStyleLibrary.jsx';"), 'App imports compact Codex Style Library');
expect(app.includes('{!isMenuOpen && <AudioController />}'), 'floating audio control is absent while Codex is open');
expect(app.includes('w-[min(94vw,30rem)] sm:w-[min(72vw,34rem)]'), 'Codex drawer uses Fold-aware responsive width');
expect(app.includes('sticky top-0 z-20'), 'Codex header remains available while drawer scrolls');
expect(app.includes('<CodexStyleLibrary'), 'App mounts compact Style Library');
expect(!app.includes('STYLE ({ART_STYLES.length})</h3>'), 'legacy 51-style always-expanded wall is absent');
expect(!app.includes('{ART_STYLES.map(s => ('), 'legacy inline style map is absent from Codex');

expect(doctrine.includes('DisclosureSection'), 'Reading Doctrine uses disclosure sections');
expect(doctrine.includes("new Set(['system', 'lenses'])"), 'Tarot system and interpretive lenses open by default');
expect(doctrine.includes('RECASTS CURRENT READING'), 'fact-affecting controls show explicit recast warning');
expect(doctrine.includes('INTERPRETATION ONLY · NEVER REWRITES CARD IDENTITY, CORRESPONDENCES OR RELATIONS'), 'lens epistemic firewall remains visible in UI');
expect(doctrine.includes('text-[#c8aa62]/80'), 'doctrine authority summary uses strengthened contrast');

expect(styleLibrary.includes('SEARCH THE ATELIER'), 'Style Library exposes search affordance');
expect(styleLibrary.includes('max-h-[19rem] overflow-y-auto'), 'Style Library results use bounded internal scroll');
expect(styleLibrary.includes('IMAGE DIRECTION · PRESENTATION ONLY'), 'Style Library states presentation-only authority');
expect(styleLibrary.includes('aria-expanded={open}'), 'Style Library is explicitly collapsible');

if (checks.some(([ok]) => !ok)) process.exit(1);
console.log('0.47 Phase D Codex UX integration gate: PASS');
