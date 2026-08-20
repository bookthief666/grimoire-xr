import fs from 'node:fs';
import {
  RETURNING_READER_AUTHORITY,
  buildReturningReaderModel,
  buildReturningRelicSelection,
} from '../src/reliquary/returningReaderModel.js';

const pass = message => console.log(`PASS ${message}`);
const assert = (condition, message) => {
  if (!condition) throw new Error(`0.49 Phase B verifier failed: ${message}`);
  pass(message);
};

const paths = {
  app: 'src/App.jsx',
  threshold: 'src/ThresholdLanding.jsx',
  reliquary: 'src/reliquary/ReliquarySurface.jsx',
  folio: 'src/reliquary/ReturningReaderFolio.jsx',
  folioTest: 'src/reliquary/ReturningReaderFolio.test.jsx',
};
for (const [label, path] of Object.entries(paths)) assert(fs.existsSync(path), `${label} candidate file exists`);

const app = fs.readFileSync(paths.app, 'utf8');
const threshold = fs.readFileSync(paths.threshold, 'utf8');
const reliquary = fs.readFileSync(paths.reliquary, 'utf8');
const folio = fs.readFileSync(paths.folio, 'utf8');

assert(app.includes("buildReturningReaderModel(reliquaryEntries)"), 'App derives Returning Reader state from hydrated Reliquary entries');
assert(app.includes('handleRestoreReliquaryMemory(returningReader.latestMemory?.rawEntry)'), 'OPEN LAST MEMORY reuses the existing canonical memory restore path');
assert(app.includes("onViewReliquary={() => dispatch({ type: 'OPEN_ARCHIVE_PROMPT' })}"), 'VIEW RELIQUARY opens the existing full Reliquary surface');
assert(threshold.includes('<ReturningReaderFolio'), 'Threshold renders the Returning Reader folio');
assert(threshold.indexOf('<ReturningReaderFolio') > threshold.indexOf('DRAW THREE'), 'Returning Reader remains secondary to the first-reading draw path');
assert(threshold.indexOf('<ReturningReaderFolio') < threshold.indexOf('STUDIO & ARCHIVES'), 'Returning Reader remains more immediate than Studio & Archives');
assert(reliquary.includes('buildReturningRelicSelection({ entries, cardId: activeReturningRelicId })'), 'Returning Relic navigation consumes the tested history-selection model');
assert(reliquary.includes('SHOW ALL MEMORIES'), 'recurrence filtering has an explicit clear-filter action');
assert(folio.includes('OPEN LAST MEMORY') && folio.includes('VIEW RELIQUARY'), 'Returning Reader exposes both deliberate re-entry actions');
assert(folio.includes('exact ReadingRecord'), 'Returning Reader labels preserved canonical memory rather than regenerated interpretation');
for (const forbidden of ['fetch(', '/api/', 'ComfyUI', 'VITE_GRIMOIRE_API_URL', 'relationType ===', 'SOURCE_QUALIFIED_TECHNICAL_RELATION']) {
  assert(!folio.includes(forbidden), `Returning Reader remains provider/doctrine free: ${forbidden}`);
}

const entry = ({ entryId, savedAt, question, cardIds, cardTitles }) => ({
  entryId,
  savedAt,
  metadata: {
    question,
    positionCardIds: cardIds,
    positionTitles: cardTitles,
    relationTypes: ['FRIENDLY', 'FRIENDLY'],
    outerRelationType: 'INIMICAL',
  },
  state: { reading: { readingRecord: { input: { question } } } },
});
const entries = [
  entry({
    entryId: 'older',
    savedAt: '2026-08-20T01:00:00.000Z',
    question: 'Older inquiry',
    cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
    cardTitles: ['Ace of Wands', 'Ace of Swords', 'Ace of Cups'],
  }),
  entry({
    entryId: 'newest',
    savedAt: '2026-08-20T03:00:00.000Z',
    question: 'Newest inquiry',
    cardIds: ['minor.staffs.ace', 'minor.coins.two', 'major.empress'],
    cardTitles: ['Ace of Wands', 'Two of Disks', 'The Empress'],
  }),
];
const model = buildReturningReaderModel(entries);
assert(model.authority === RETURNING_READER_AUTHORITY, 'Returning Reader authority remains project-derived reading history');
assert(model.latestMemory?.entryId === 'newest', 'Returning Reader chooses the most recently sealed memory');
assert(model.latestMemory?.rawEntry === entries[1], 'latest-memory action retains the exact hydrated Reliquary entry');
const filtered = buildReturningRelicSelection({ entries, cardId: 'minor.staffs.ace' });
assert(filtered.count === 2 && filtered.memories.every(memory => memory.cardIds.includes('minor.staffs.ace')), 'recurrence selection returns only memories containing the chosen returning relic');

console.log('0.49 Phase B Returning Reader + recurrence verifier: PASS');
