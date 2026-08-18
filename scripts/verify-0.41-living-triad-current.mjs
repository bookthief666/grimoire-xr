import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const app = read('src/App.jsx');
const model = read('src/tarotBridge/livingTriadCurrent.js');
const component = read('src/tarotBridge/LivingTriadCurrent.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.41 static gate failed: ${message}`);
};

assert(app.includes("import LivingTriadCurrent from './tarotBridge/LivingTriadCurrent.jsx';"), 'LivingTriadCurrent import missing');
assert(app.includes('<LivingTriadCurrent'), 'Oracle current surface missing');
assert(app.includes('reading={state.reading}'), 'current must consume the existing reading');
assert(app.includes('cards={state.reading.cards}'), 'current must preserve the existing card order');
assert(app.includes('onTrace={currentTraceBuzz}'), 'trace haptic callback missing');
assert(app.includes('currentTraceBuzz: () => safely(() => Haptics.impact({ style: ImpactStyle.Light }))'), 'trace haptic must remain uniform and presentation-only');
assert(app.includes('<LivingRelicSurface'), '0.40 living relic interaction must remain intact');
assert(app.includes('<RelicWorkspace'), '0.39 Relic Workspace must remain intact');

const currentIndex = app.indexOf('<LivingTriadCurrent');
const answerIndex = app.indexOf('<div className="p-10 border-2 border-red-600 bg-black/80 text-xl leading-relaxed text-red-600 font-body', currentIndex);
const provenanceIndex = app.indexOf('<ReadingProvenancePanel reading={state.reading} />', currentIndex);
assert(currentIndex >= 0 && answerIndex > currentIndex && provenanceIndex > answerIndex, 'current must remain between cards and generated prose/provenance');

assert(!model.includes('canonicalTarotBridge'), 'current model must not recompute canonical Tarot facts');
assert(!model.includes('buildCanonicalTriadConsultation'), 'current model must consume ReadingRecord rather than rebuild it');
assert(model.includes("PROJECT_AUTHORED_RELATION_TRACE_NOT_SOURCE_FACT"), 'presentation authority boundary missing');
assert(component.includes('Trace the ReadingRecord; no relation is recomputed here.'), 'UI must state ReadingRecord consumption boundary');
assert(component.includes('PRESENTATION CUE · NOT SOURCE FACT'), 'UI must label project-authored trace cues');
assert(!component.includes('dispatch('), 'living current component must not mutate application/reducer state');
assert(!component.includes('setReading'), 'living current component must not rewrite the reading');

console.log('0.41 living triad current static gate: PASS');
