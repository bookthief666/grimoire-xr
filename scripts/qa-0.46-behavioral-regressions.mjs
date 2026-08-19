import { resolveOracleRelicCard } from '../src/reliquary/oracleRelicResolver.js';
import { buildCanonicalDeckGenesis, validateCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';

const tradition = { id: 'thoth', name: 'Book of Thoth' };
const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition }));
const ace = canonicalDeck.find(card => (card.id || card.canonicalCardId) === 'minor.staffs.ace');

if (!ace) throw new Error('0.46 behavioral gate fixture could not find Ace of Wands.');

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
console.log('PASS Oracle relic resolves live deck history');

const regenerated = resolveOracleRelicCard({
  cardId: 'minor.cups.ace',
  deck: [],
  readingCards: [],
  tradition,
});
if (!regenerated || (regenerated.id || regenerated.canonicalCardId) !== 'minor.cups.ace') {
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
