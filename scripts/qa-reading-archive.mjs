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
const parsed = parseGrimoireArchive(serializeGrimoireArchive(envelope));
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
if (Object.values(checks).some(pass => !pass)) process.exitCode = 1;
else console.log('0.36 ReadingRecord archive QA: PASS');
