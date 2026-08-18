import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';
import { normalizeTextRequest, validateProviderTextResult } from '../server/text-request.mjs';

const thoth = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: { id: 'thoth', name: 'Book of Thoth' } }));
const rws = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: { id: 'rws', name: 'Rider-Waite-Smith' } }));

const ritualRequest = normalizeTextRequest({
  prompt: 'Write a 200-word Thesis. Generate 3 profound questions.',
  isJson: true,
  task: 'ritual',
});
const ritualResult = validateProviderTextResult(ritualRequest, {
  dossier: 'QA dossier.',
  questions: ['One?', 'Two?', 'Three?'],
});

const checks = {
  thothCount: thoth.length === 78,
  thothUnique: new Set(thoth.map(card => card.canonicalCardId)).size === 78,
  thothMagus: thoth[1]?.canonicalCardId === 'major.magician' && thoth[1]?.name === 'THE MAGUS',
  thothLust: thoth[8]?.canonicalCardId === 'major.fortitude' && thoth[8]?.name === 'LUST',
  thothAdjustment: thoth[11]?.canonicalCardId === 'major.justice' && thoth[11]?.name === 'ADJUSTMENT',
  thothArt: thoth[14]?.name === 'ART',
  thothAeon: thoth[20]?.name === 'THE AEON',
  thothUniverse: thoth[21]?.name === 'THE UNIVERSE',
  thothCourt: thoth[32]?.name === 'PRINCESS OF WANDS' && thoth[35]?.name === 'KNIGHT OF WANDS',
  rwsCompatibility: rws[1]?.name === 'THE MAGICIAN' && rws[8]?.name === 'STRENGTH' && rws[11]?.name === 'JUSTICE',
  explicitRitualTask: ritualRequest.task === 'ritual',
  ritualNoCards: !Object.prototype.hasOwnProperty.call(ritualResult, 'cards'),
};

for (const [name, pass] of Object.entries(checks)) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);

let injectionRejected = false;
try {
  validateProviderTextResult(ritualRequest, {
    dossier: 'QA dossier.',
    cards: Array.from({ length: 78 }, (_, index) => `Injected ${index}`),
    questions: ['One?', 'Two?', 'Three?'],
  });
} catch (error) {
  injectionRejected = /must not author Tarot card identities/i.test(String(error?.message || error));
}
console.log(`${injectionRejected ? 'PASS' : 'FAIL'} modelIdentityInjectionRejected`);

if (Object.values(checks).some(pass => !pass) || !injectionRejected) process.exitCode = 1;
else console.log('0.37 canonical deck genesis QA: PASS');
