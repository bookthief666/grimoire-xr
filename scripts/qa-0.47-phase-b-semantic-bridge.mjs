import assert from 'node:assert/strict';
import { createSemanticConfig } from '../src/semantic/semanticConfig.js';
import {
  buildCanonicalOraclePromptPayload,
  buildCanonicalTriadConsultation,
  getCanonicalCardPromptContext,
  getCanonicalInterpretationConfig,
} from '../src/tarotBridge/canonicalTarotBridge.js';
import { buildThresholdReading } from '../src/tarotBridge/thresholdReading.js';

const pass = label => console.log(`PASS ${label}`);

const thothShadowBruno = createSemanticConfig({
  tarotSystem: 'thoth',
  interpretiveLenses: ['jungian_shadow', 'bruno_mnemonic'],
  ritualTheme: 'giordano_bruno',
});
const resolved = getCanonicalInterpretationConfig({
  semanticConfig: thothShadowBruno,
  tradition: { id: 'shadow' },
});
assert.equal(resolved.tarotSystem, 'thoth');
assert.equal(resolved.correspondenceProfile, 'thoth_native');
assert.equal(resolved.relationMethod, 'crowley_lxxviii_dignities');
assert.deepEqual(resolved.lenses, ['jungian_shadow', 'bruno_mnemonic']);
assert.equal(resolved.ritualTheme, 'giordano_bruno');
pass('explicit semanticConfig outranks conflicting legacy tradition');

const thothRecord = buildCanonicalTriadConsultation({
  question: 'Does the explicit semantic configuration survive the bridge?',
  legacyIndexes: [22, 50, 36],
  semanticConfig: thothShadowBruno,
});
assert.equal(thothRecord.input.tarotSystem, 'thoth');
assert.equal(thothRecord.input.relationMethod, 'crowley_lxxviii_dignities');
assert.deepEqual(thothRecord.input.lenses, ['jungian_shadow', 'bruno_mnemonic']);
assert.equal(thothRecord.presentationContext.ritualTheme, 'giordano_bruno');
assert.deepEqual(thothRecord.relations.map(relation => relation.relationType), ['FRIENDLY', 'FRIENDLY']);
pass('TRIAD ReadingRecord records orthogonal lenses without changing Thoth relation truth');

const rwsFresh = createSemanticConfig({ tarotSystem: 'rws' });
const rwsRecord = buildCanonicalTriadConsultation({
  question: 'What happens when no relation method is active?',
  legacyIndexes: [22, 50, 36],
  semanticConfig: rwsFresh,
});
assert.equal(rwsRecord.input.tarotSystem, 'rws');
assert.equal(rwsRecord.input.correspondenceProfile, 'none');
assert.equal(rwsRecord.input.relationMethod, 'disabled');
assert.deepEqual(rwsRecord.relations, []);
assert.equal(rwsRecord.provenance.relationMethodAuthority, 'DISABLED');
pass('fresh RWS bridge remains source-honest and relation-disabled');

const rwsCrowley = createSemanticConfig({
  tarotSystem: 'rws',
  correspondenceProfile: 'none',
  relationMethod: 'crowley_lxxviii_dignities',
  interpretiveLenses: ['jungian_shadow'],
});
const directMethodRecord = buildCanonicalTriadConsultation({
  question: 'Can a relation method be selected without inventing a correspondence pack?',
  legacyIndexes: [22, 50, 36],
  semanticConfig: rwsCrowley,
});
assert.equal(directMethodRecord.input.correspondenceProfile, 'none');
assert.equal(directMethodRecord.input.relationMethod, 'crowley_lxxviii_dignities');
assert.equal(directMethodRecord.provenance.relationMethodAuthority, 'DIRECT_METHOD_SELECTION');
assert.deepEqual(directMethodRecord.provenance.sourceIds, ['src.primary.crowley.liber-lxxviii']);
assert.deepEqual(directMethodRecord.input.lenses, ['jungian_shadow']);
pass('RWS may explicitly use Crowley dignities without claiming an RWS correspondence pack');

const rwsCardContext = getCanonicalCardPromptContext({
  card: { id: 1, canonicalCardId: 'major.magician', name: 'THE MAGICIAN' },
  semanticConfig: rwsCrowley,
});
assert.equal(rwsCardContext.tarotSystem, 'rws');
assert.equal(rwsCardContext.sourceQualification, 'SOURCE_PACK_PENDING');
assert.equal(rwsCardContext.canonicalExpression, null);
assert.equal(rwsCardContext.canonicalCorrespondences, null);
pass('RWS card prompt context does not leak Thoth source authority');

const payload = buildCanonicalOraclePromptPayload({
  record: directMethodRecord,
  cards: [
    { id: 22, canonicalCardId: 'minor.staffs.ace', name: 'ACE OF WANDS' },
    { id: 50, canonicalCardId: 'minor.swords.ace', name: 'ACE OF SWORDS' },
    { id: 36, canonicalCardId: 'minor.cups.ace', name: 'ACE OF CUPS' },
  ],
});
assert.equal(payload.reading.positions[0].canonicalCard.tarotSystem, 'rws');
assert.equal(payload.reading.positions[0].canonicalCard.sourceQualification, 'SOURCE_PACK_PENDING');
assert.equal(payload.reading.positions[0].canonicalCard.canonicalExpression, null);
pass('Oracle payload reconstructs card authority from immutable ReadingRecord semantic fields');

const legacyThoth = getCanonicalInterpretationConfig({ tradition: { id: 'thoth' } });
assert.equal(legacyThoth.tarotSystem, 'thoth');
assert.equal(legacyThoth.relationMethod, 'crowley_lxxviii_dignities');
pass('legacy Thoth input remains compatible through deterministic migration');

const threshold = buildThresholdReading({
  question: 'Show me the explicit RWS threshold.',
  semanticConfig: rwsFresh,
  random: () => 0.5,
});
assert.equal(threshold.deck.length, 78);
assert.equal(threshold.reading.readingRecord.input.tarotSystem, 'rws');
assert.equal(threshold.reading.readingRecord.input.correspondenceProfile, 'none');
assert.equal(threshold.reading.readingRecord.input.relationMethod, 'disabled');
assert.equal(threshold.deck.find(card => card.canonicalCardId === 'major.magician').name, 'THE MAGICIAN');
assert.equal(threshold.deck.find(card => card.canonicalCardId === 'minor.coins.ace').name, 'ACE OF COINS');
pass('Threshold deck genesis and ReadingRecord bind to explicit Tarot system');

console.log('0.47 Phase B semantic bridge QA: PASS');
