import fs from 'node:fs';

const app = fs.readFileSync('src/App.jsx', 'utf8');
const surface = fs.readFileSync('src/tarotBridge/OracleLivingBook.jsx', 'utf8');
const model = fs.readFileSync('src/tarotBridge/oracleBookPresentation.js', 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.42 Living Book integration failed: ${message}`);
};

assert(app.includes("import OracleLivingBook from './tarotBridge/OracleLivingBook.jsx';"), 'Oracle does not import Living Book surface');
assert(app.includes('<OracleLivingBook'), 'completed reading does not mount Living Book surface');
assert(!app.includes('<ReadingProvenancePanel reading={state.reading} />'), 'legacy raw provenance panel remains mounted');
assert(surface.includes('TECHNICAL RECORD'), 'raw provenance is no longer available through progressive disclosure');
assert(surface.includes('Generated synthesis · not a source fact'), 'generated authority boundary is not visible');
assert(model.includes("reason === 'CARD_WITHOUT_SUIT_FAMILY'"), 'Major-gap fail-closed presentation is missing');
assert(model.includes('unresolvedReasonCodes'), 'unresolved source gaps are not preserved');

console.log('0.42 Living Book Oracle integration gate: PASS');
