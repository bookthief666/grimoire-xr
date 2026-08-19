import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join(process.cwd(), 'src/App.jsx');
const oraclePath = path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx');

const fail = message => { throw new Error(`0.46 Oracle chamber fix refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

let app = fs.readFileSync(appPath, 'utf8');
app = replaceOnce(
  app,
  "                onOpenCard={(cardId, fallbackCard) => {\n                  const card = state.deck.find(entry => entry.id === cardId || entry.canonicalCardId === cardId) || fallbackCard;\n                  if (card) dispatch({ type: 'OPEN_CARD', payload: card });\n                }}",
  "                onOpenCard={(cardId) => {\n                  const liveDeckCard = state.deck.find(entry => entry.id === cardId || entry.canonicalCardId === cardId);\n                  const readingCard = state.reading?.cards?.find(entry => entry?.id === cardId || entry?.canonicalCardId === cardId) || null;\n                  const regeneratedCard = (!liveDeckCard && !readingCard)\n                    ? validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: state.selectedTradition }))\n                        .find(entry => entry.id === cardId || entry.canonicalCardId === cardId)\n                    : null;\n                  const card = liveDeckCard || readingCard || regeneratedCard;\n                  if (card) dispatch({ type: 'OPEN_CARD', payload: card });\n                  else dispatch({ type: 'SET_ERROR_MESSAGE', payload: `Relic Chamber could not resolve canonical card ${cardId}.` });\n                }}",
  'live canonical Oracle card resolver',
);

let oracle = fs.readFileSync(oraclePath, 'utf8');
oracle = replaceOnce(
  oracle,
  "              onOpen={onOpenCard && position.legacyCard ? () => onOpenCard(position.cardId, position.legacyCard) : null}",
  "              onOpen={onOpenCard && position.cardId ? () => onOpenCard(position.cardId) : null}",
  'canonical-id chamber trigger',
);

for (const marker of [
  'const liveDeckCard = state.deck.find',
  'const readingCard = state.reading?.cards?.find',
  'const regeneratedCard = (!liveDeckCard && !readingCard)',
  'onOpen={onOpenCard && position.cardId ? () => onOpenCard(position.cardId) : null}',
]) {
  if (!(app.includes(marker) || oracle.includes(marker))) fail(`required fixed marker missing: ${marker}`);
}

if (oracle.includes('position.legacyCard ? () => onOpenCard')) {
  fail('legacyCard still gates Oracle relic opening');
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(oraclePath, oracle);
console.log('Applied 0.46 Oracle relic chamber canonical-id opening fix.');
