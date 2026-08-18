import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildGrimoireArchiveEnvelope, parseGrimoireArchive, serializeGrimoireArchive } from '../src/tarotBridge/archiveEnvelope.js';
import { buildCanonicalTriadConsultation } from '../src/tarotBridge/canonicalTarotBridge.js';

const cards = [22, 50, 36].map(id => ({ id, name: `CARD ${id}` }));
const state = {
  author: 'QA', selectedStyle: { id: 'pixel' }, selectedTradition: { id: 'thoth' },
  erosLevel: 0, techLevel: 1, dossier: 'QA', suggestedQuestions: [], portrait: null,
  deck: cards, spiritChat: [], activeSpread: 'TRIAD', spreadSlots: [22, 50, 36],
  reading: {
    cards,
    answer: 'Generated QA synthesis.',
    selectionSource: 'BOUND_TRIAD_CLOTH',
    readingRecord: buildCanonicalTriadConsultation({
      readingId: 'qa-archive-three-aces', question: 'QA?', legacyIndexes: [22, 50, 36], tradition: { id: 'thoth' },
    }),
  },
};

const envelope = buildGrimoireArchiveEnvelope({ state, exportedAt: 'QA' });
const serialized = serializeGrimoireArchive(envelope);
const parsed = parseGrimoireArchive(serialized);
const record = parsed.envelope.grimoire.reading.readingRecord;
const checks = {
  contract: parsed.contractStatus === 'CURRENT_CONTRACT_MATCH',
  cards: record.input.cardIds.join('|') === 'minor.staffs.ace|minor.swords.ace|minor.cups.ace',
  immediate: record.relations.map(r => r.relationType).join('|') === 'FRIENDLY|FRIENDLY',
  outer: record.spreadPatterns[0]?.relationType === 'INIMICAL',
  selection: parsed.envelope.grimoire.reading.selectionSource === 'BOUND_TRIAD_CLOTH',
  generatedAuthority: parsed.envelope.grimoire.reading.answerAuthority === 'MODEL_GENERATED_SYNTHESIS',
};
for (const [name, pass] of Object.entries(checks)) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
if (Object.values(checks).some(pass => !pass)) {
  process.exitCode = 1;
} else {
  console.log('0.36 ReadingRecord archive QA: PASS');
  const writeIndex = process.argv.indexOf('--write');
  if (writeIndex >= 0) {
    const requested = process.argv[writeIndex + 1];
    if (!requested) throw new Error('--write requires a destination path.');
    const destination = resolve(requested);
    writeFileSync(destination, serialized, 'utf8');
    console.log(`ARCHIVE_FIXTURE_WRITTEN ${destination}`);
  }
}
