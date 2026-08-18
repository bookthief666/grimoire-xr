import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { serializeGrimoireArchive } from '../src/tarotBridge/archiveEnvelope.js';
import { buildCanonicalTriadConsultation } from '../src/tarotBridge/canonicalTarotBridge.js';

const destination = process.argv[2];
if (!destination) throw new Error('Usage: node scripts/write-continuity-fixture.mjs <destination.json>');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="960" viewBox="0 0 640 960">
  <rect width="640" height="960" fill="#090704"/>
  <rect x="28" y="28" width="584" height="904" fill="none" stroke="#d7b95d" stroke-width="8"/>
  <circle cx="320" cy="380" r="150" fill="none" stroke="#b51f2e" stroke-width="10"/>
  <path d="M320 210 L365 350 L512 350 L393 436 L438 576 L320 490 L202 576 L247 436 L128 350 L275 350 Z" fill="none" stroke="#d7b95d" stroke-width="7"/>
  <text x="320" y="690" text-anchor="middle" fill="#eadfbd" font-size="44" font-family="serif">CONTINUITY</text>
  <text x="320" y="748" text-anchor="middle" fill="#b51f2e" font-size="32" font-family="monospace">THREE ACES QA</text>
  <text x="320" y="820" text-anchor="middle" fill="#d7b95d" font-size="24" font-family="monospace">INDEXEDDB IMAGE</text>
</svg>`;
const testImage = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

const cardSpecs = [
  [22, 'minor.staffs.ace', 'ACE OF WANDS'],
  [50, 'minor.swords.ace', 'ACE OF SWORDS'],
  [36, 'minor.cups.ace', 'ACE OF CUPS'],
];
const cards = cardSpecs.map(([id, canonicalCardId, name]) => ({
  id,
  canonicalCardId,
  name,
  imageUrl: testImage,
  exegesis: `Continuity QA interpretation for ${name}.`,
  exegesisAuthority: 'MODEL_GENERATED_INTERPRETATION',
  meta: { planet: 'QA reflection', daimon: 'QA reflection' },
  interpretiveMetaAuthority: 'MODEL_GENERATED_REFLECTION',
  promptUsed: 'Continuity QA deterministic image fixture.',
  generation: {
    provider: 'qa-fixture', mode: 'preview', seed: 424242,
    width: 640, height: 960, steps: 18,
  },
  patina: id === 22 ? 9 : id === 50 ? 5 : 3,
}));

const state = {
  author: 'Continuity Adept',
  selectedStyle: { id: 'pixel' },
  selectedTradition: { id: 'thoth' },
  erosLevel: 0,
  techLevel: 1,
  dossier: 'A deterministic session used to prove that the Grimoire survives refresh and that artwork returns from IndexedDB.',
  suggestedQuestions: ['What persists when the interface closes?'],
  portrait: testImage,
  deck: cards,
  spiritChat: [{ role: 'ai', text: 'Continuity is present.' }],
  activeSpread: 'TRIAD',
  spreadSlots: [22, 50, 36],
  reading: {
    cards,
    answer: 'The test succeeds only if this reading and its canonical semantic basis return after a hard refresh without importing the archive again.',
    selectionSource: 'BOUND_TRIAD_CLOTH',
    readingRecord: buildCanonicalTriadConsultation({
      readingId: 'qa-continuity-three-aces',
      question: 'Does the Grimoire survive?',
      legacyIndexes: [22, 50, 36],
      tradition: { id: 'thoth' },
    }),
  },
};

const serialized = serializeGrimoireArchive({ state, exportedAt: '2026-08-18T12:00:00.000Z' });
const path = resolve(destination);
writeFileSync(path, serialized, 'utf8');
console.log(`CONTINUITY_FIXTURE_WRITTEN ${path}`);
console.log(`bytes ${Buffer.byteLength(serialized, 'utf8')}`);
console.log('fixture reading qa-continuity-three-aces');
