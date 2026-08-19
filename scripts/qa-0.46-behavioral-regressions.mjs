import { resolveOracleRelicCard } from '../src/reliquary/oracleRelicResolver.js';
import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';

const tradition = { id: 'thoth', name: 'Book of Thoth' };
const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition }));
const ace = canonicalDeck.find(card => card.canonicalCardId === 'minor.staffs.ace');

if (!ace) throw new Error('0.46 behavioral gate fixture could not find canonical minor.staffs.ace.');
if (!Number.isInteger(ace.id)) throw new Error('0.46 behavioral gate fixture expected a numeric legacy card index.');
if (ace.canonicalCardId !== 'minor.staffs.ace') throw new Error('0.46 behavioral gate fixture lost canonical card identity.');
console.log('PASS canonical card identity remains distinct from numeric legacy index');

const live = { ...ace, patina: 7 };
const stale = { ...ace, patina: 1 };
const resolvedLive = resolveOracleRelicCard({
  cardId: 'minor.staffs.ace',
  deck: [live],
  readingCards: [stale],
  tradition,
});
if (resolvedLive !== live || resolvedLive.patina !== 7) {
  throw new Error('0.46 behavioral gate failed: live deck copy did not win over stale reading copy.');
}
console.log('PASS Oracle relic resolves live deck history by canonicalCardId');

const legacyStringReading = { ...stale, id: 'minor.staffs.ace', canonicalCardId: undefined, patina: 3 };
const resolvedLegacyString = resolveOracleRelicCard({
  cardId: 'minor.staffs.ace',
  deck: [],
  readingCards: [legacyStringReading],
  tradition,
});
if (resolvedLegacyString !== legacyStringReading) {
  throw new Error('0.46 behavioral gate failed: canonical-looking legacy string id compatibility was lost.');
}
console.log('PASS legacy string card identity remains compatible');

const regenerated = resolveOracleRelicCard({
  cardId: 'minor.cups.ace',
  deck: [],
  readingCards: [],
  tradition,
});
if (!regenerated || regenerated.canonicalCardId !== 'minor.cups.ace') {
  throw new Error('0.46 behavioral gate failed: canonical cardId could not regenerate an openable relic.');
}
console.log('PASS sparse/restored ReadingRecord remains openable by canonical cardId');

const unknown = resolveOracleRelicCard({
  cardId: 'minor.void.unknown',
  deck: [],
  readingCards: [],
  tradition,
});
if (unknown !== null) throw new Error('0.46 behavioral gate failed: unknown cardId did not fail closed.');
console.log('PASS unknown relic id fails closed');

console.log('0.46 behavioral regression gate: PASS');
