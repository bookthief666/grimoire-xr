import fs from 'node:fs';

const app = fs.readFileSync('src/App.jsx', 'utf8');
const landing = fs.readFileSync('src/ThresholdLanding.jsx', 'utf8');
const threshold = fs.readFileSync('src/tarotBridge/thresholdReading.js', 'utf8');
const book = fs.readFileSync('src/tarotBridge/OracleLivingBook.jsx', 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.43 Threshold integration failed: ${message}`);
};

const between = (source, start, end) => {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert(a >= 0, `missing section start: ${start}`);
  assert(b > a, `missing section end: ${end}`);
  return source.slice(a, b);
};

assert(app.includes("import ThresholdLanding from './ThresholdLanding.jsx';"), 'Threshold landing is not imported');
assert(app.includes("import { buildThresholdReading } from './tarotBridge/thresholdReading.js';"), 'Threshold reading model is not imported');
assert(app.includes('<ThresholdLanding'), 'landing still uses the old mandatory ritual surface');
assert(app.includes("case 'THRESHOLD_READING_READY'"), 'provider-free reading transition is missing');
assert(app.includes("case 'ORACLE_INTERPRETATION_SUCCESS'"), 'optional interpretation transition is missing');
assert(app.includes("onNewReading={() => dispatch({ type: 'OPEN_THRESHOLD' })}"), 'new reading does not return to Threshold');
assert(book.includes('THE WITNESS'), 'Living Book does not expose deterministic Witness');
assert(book.includes('REQUEST INTERPRETATION'), 'optional interpretation action is missing');
assert(book.includes('No artwork will be generated.'), 'text-only interpretation boundary is not visible');
assert(landing.includes('DRAW THREE'), 'Threshold lacks primary draw action');
assert(landing.includes('STUDIO & ARCHIVES'), 'advanced legacy workflow is not progressively disclosed');

const drawHandler = between(app, 'const handleThresholdDraw', 'const handleThresholdInterpretation');
assert(!drawHandler.includes('fetchGemini'), 'first draw calls text provider');
assert(!drawHandler.includes('fetchImageGeneration'), 'first draw calls image provider');
assert(!drawHandler.includes('fetchImagen'), 'first draw calls portrait provider');
assert(!drawHandler.includes('generateCardData'), 'first draw silently forges cards');
assert(drawHandler.includes('buildThresholdReading'), 'first draw does not use provider-free Threshold model');

const interpretationHandler = between(app, 'const handleThresholdInterpretation', 'const generateCardData');
assert(interpretationHandler.includes('fetchGemini'), 'optional interpretation does not use text provider');
assert(!interpretationHandler.includes('fetchImageGeneration'), 'optional interpretation calls image provider');
assert(!interpretationHandler.includes('fetchImagen'), 'optional interpretation calls portrait provider');
assert(!interpretationHandler.includes('generateCardData'), 'optional interpretation silently forges cards');
assert(interpretationHandler.includes('buildCanonicalOracleSynthesisPrompt'), 'optional interpretation bypasses canonical synthesis prompt');

assert(!threshold.includes('/api/text'), 'Threshold model contains provider endpoint');
assert(!threshold.includes('/api/image'), 'Threshold model contains image endpoint');
assert(!threshold.includes('fetch('), 'Threshold model performs network I/O');

console.log('0.43 Threshold integration gate: PASS');
