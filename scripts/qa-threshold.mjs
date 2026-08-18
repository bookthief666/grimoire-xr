import { buildTarotQaSnapshot } from '../src/tarotBridge/qaFixtures.js';
import { buildReadingWitness, buildThresholdReading } from '../src/tarotBridge/thresholdReading.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(`0.43 Threshold QA failed: ${message}`);
};

const threshold = buildThresholdReading({
  question: 'What do I bring before the Grimoire?',
  tradition: { id: 'thoth', name: 'Book of Thoth' },
  random: () => 0.271828,
});

assert(threshold.providerMode === 'PROVIDER_FREE', 'Threshold is not provider-free');
assert(threshold.deck.length === 78, 'canonical deck genesis did not produce 78 cards');
assert(threshold.reading.cards.length === 3, 'Threshold did not draw exactly three cards');
assert(threshold.reading.cards.every(card => !card.imageUrl && !card.exegesis), 'Threshold silently manifested card content');
assert(threshold.reading.answer === '', 'Threshold silently generated interpretation prose');
assert(threshold.record.input.question === 'What do I bring before the Grimoire?', 'question did not enter ReadingRecord');
assert(threshold.witness.length > 20, 'deterministic Witness is missing');

const threeAces = buildTarotQaSnapshot('three-aces');
const threeAcesSignature = JSON.stringify(threeAces.record);
const threeAcesWitness = buildReadingWitness(threeAces.record);
assert(threeAcesWitness.includes('Thesis and Antithesis strengthen one another.'), 'Three Aces first relation changed');
assert(threeAcesWitness.includes('Antithesis and Synthesis strengthen one another.'), 'Three Aces second relation changed');
assert(threeAcesWitness.includes('Thesis and Synthesis stand contrary.'), 'Three Aces outer relation changed');
assert(threeAcesWitness.includes('Antithesis stands between those contraries'), 'Three Aces center effect changed');
assert(JSON.stringify(threeAces.record) === threeAcesSignature, 'Witness mutated Three Aces ReadingRecord');

const majorGap = buildTarotQaSnapshot('major-gap');
const majorWitness = buildReadingWitness(majorGap.record);
assert(majorGap.record.relations.every(relation => relation.relationType === 'UNSPECIFIED'), 'Major gap was reclassified');
assert(majorGap.record.relations.every(relation => relation.reasonCode === 'CARD_WITHOUT_SUIT_FAMILY'), 'Major gap reason changed');
assert(majorWitness.includes('No elemental-dignity relation is asserted'), 'Major gap Witness hides unsupported relation boundary');

console.log('0.43 Threshold provider-free QA: PASS');
