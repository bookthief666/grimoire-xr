import fs from 'node:fs';
import path from 'node:path';
import { buildCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';
import {
  RELIQUARY_STORAGE_KEY,
  buildReliquaryEntry,
  loadReliquary,
  saveReliquaryReading,
} from '../src/reliquary/reliquaryStore.js';
import { buildReliquaryPresentation } from '../src/reliquary/reliquaryPresentation.js';
import { buildRelicChamberModel } from '../src/reliquary/relicChamberModel.js';

const fail = message => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = message => console.log(`PASS ${message}`);

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
  };
};
const memoryImages = () => {
  const values = new Map();
  return {
    async putMany(records = []) { records.forEach(record => values.set(record.key, record.dataUrl)); },
    async get(key) { return values.get(key) || null; },
  };
};

const deck = buildCanonicalDeckGenesis({ tradition: 'thoth' });
const cards = [deck[22], deck[36], deck[50]].map((card, index) => ({
  ...card,
  imageUrl: index === 0 ? 'data:image/png;base64,UkVMSVFVQVJZ' : null,
  patina: index + 1,
}));
const readingRecord = {
  spreadId: 'grimoire.triad.dialectic',
  input: { question: 'Will the Reliquary remember?', tarotSystem: 'thoth' },
  positions: [
    { positionId: 'thesis', cardId: cards[0].id, orientation: 'upright' },
    { positionId: 'antithesis', cardId: cards[1].id, orientation: 'upright' },
    { positionId: 'synthesis', cardId: cards[2].id, orientation: 'upright' },
  ],
  relations: [{ relationType: 'FRIENDLY' }, { relationType: 'INIMICAL' }],
  spreadPatterns: [
    { patternKind: 'OUTER_PAIR_CONTEXT', relationType: 'UNSPECIFIED' },
    { patternKind: 'CENTER_CONTEXT_EFFECT', applied: false },
  ],
};
const state = {
  phase: 'ORACLE',
  author: 'QA',
  selectedStyle: { id: 'pixel', name: 'Pixel' },
  selectedTradition: { id: 'thoth', name: 'Thoth' },
  erosLevel: 0,
  techLevel: 1,
  deck,
  reading: {
    cards,
    readingRecord,
    answer: '',
    semanticContract: { contractId: 'grimoire.tarot.semantic.v1', contractVersion: '1.0.0', commit: 'f4534b4' },
  },
  oracleQuestion: readingRecord.input.question,
  activeSpread: 'TRIAD',
  archiveState: 'IDLE',
};

const built = buildReliquaryEntry({ state, savedAt: '2026-08-19T00:00:00.000Z' });
if (!JSON.stringify(built.entry).includes('readingRecord') && !JSON.stringify(built.entry).includes('readingRecord'.toLowerCase())) fail('readingRecordPreserved');
else pass('readingRecordPreserved');
if (Object.prototype.hasOwnProperty.call(built.entry.state, 'deck')) fail('fullDeckDuplicated');
else pass('lightweightReadingSnapshot');
if (/data:image\//i.test(JSON.stringify(built.entry))) fail('embeddedArtworkInIndex');
else pass('indexedDbArtworkSeparation');

const storage = memoryStorage();
const imageStore = memoryImages();
await saveReliquaryReading({ state, storage, imageStore, savedAt: '2026-08-19T00:00:00.000Z' });
const raw = storage.getItem(RELIQUARY_STORAGE_KEY) || '';
if (/data:image\//i.test(raw)) fail('localStorageArtworkInvariant');
else pass('localStorageArtworkInvariant');
const restored = await loadReliquary({ storage, imageStore });
if (restored.entries[0]?.state?.reading?.readingRecord?.positions?.[0]?.cardId === cards[0].id) pass('semanticRoundTrip');
else fail('semanticRoundTrip');
if (restored.entries[0]?.state?.reading?.cards?.[0]?.imageUrl?.startsWith('data:image/')) pass('artworkRoundTrip');
else fail('artworkRoundTrip');

const recurrence = buildReliquaryPresentation([
  restored.entries[0],
  {
    ...restored.entries[0],
    entryId: 'second-memory',
    metadata: {
      ...restored.entries[0].metadata,
      entryId: 'second-memory',
      question: 'A second kept reading',
      positionCardIds: [cards[0].id, 'minor.disks.two', 'major.0'],
      positionTitles: [cards[0].name, 'Two of Disks', 'The Fool'],
    },
  },
]);
if (recurrence.returningRelics[0]?.cardId === cards[0].id && recurrence.returningRelics[0]?.appearances === 2) pass('historyOnlyRecurrence');
else fail('historyOnlyRecurrence');

const twoWands = { ...buildCanonicalDeckGenesis({ tradition: 'thoth' })[23], patina: 12 };
const chamber = buildRelicChamberModel({ card: twoWands, tradition: 'thoth' });
if (chamber?.historyStage === 'WEATHERED' && chamber.inscriptions.some(item => item.label === 'PLANET' && item.value === 'MARS')) pass('sourceQualifiedRelicChamber');
else fail('sourceQualifiedRelicChamber');
const pending = buildRelicChamberModel({ card: { ...buildCanonicalDeckGenesis({ tradition: 'rws' })[23], patina: 3 }, tradition: 'rws' });
if (pending && pending.inscriptions.length === 0) pass('pendingSourcePackNoInventedInscriptions');
else fail('pendingSourcePackNoInventedInscriptions');

for (const file of [
  'src/reliquary/ReliquarySurface.jsx',
  'src/reliquary/RelicChamberField.jsx',
  'src/reliquary/reliquaryPresentation.js',
  'src/reliquary/relicChamberModel.js',
]) {
  const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  for (const forbidden of ['fetch(', 'callGrimoireApi', 'prepareCanonicalOracleConsultation', 'buildReadingRecord']) {
    if (source.includes(forbidden)) fail(`presentationFirewall:${file}:${forbidden}`);
  }
}
if (!process.exitCode) pass('providerAndSemanticFirewall');

if (!process.exitCode) console.log('0.46 relic chamber + reliquary QA: PASS');
