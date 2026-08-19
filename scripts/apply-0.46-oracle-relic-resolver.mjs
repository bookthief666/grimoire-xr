import fs from 'node:fs';
import path from 'node:path';

const appPath = path.join(process.cwd(), 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

const fail = message => { throw new Error(`0.46 resolver activator refused to edit: ${message}`); };
const replaceOnce = (source, before, after, label) => {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) fail(`${label} anchor not found`);
  if (source.indexOf(before, first + before.length) >= 0) fail(`${label} anchor ambiguous`);
  return source.replace(before, after);
};

app = replaceOnce(
  app,
  "import { loadReliquary, removeReliquaryEntry, saveReliquaryReading } from './reliquary/reliquaryStore.js';",
  "import { loadReliquary, removeReliquaryEntry, saveReliquaryReading } from './reliquary/reliquaryStore.js';\nimport { resolveOracleRelicCard } from './reliquary/oracleRelicResolver.js';",
  'Oracle relic resolver import',
);

const oldHandler = `                onOpenCard={(cardId) => {\n                  const liveDeckCard = state.deck.find(entry => entry.id === cardId || entry.canonicalCardId === cardId);\n                  const readingCard = state.reading?.cards?.find(entry => entry.id === cardId || entry.canonicalCardId === cardId);\n                  const regeneratedCard = (!liveDeckCard && !readingCard)\n                    ? validateCanonicalDeckGenesis(buildCanonicalDeckGenesis({ tradition: state.selectedTradition }))\n                      .find(entry => entry.id === cardId || entry.canonicalCardId === cardId)\n                    : null;\n                  const card = liveDeckCard || readingCard || regeneratedCard;\n                  if (card) dispatch({ type: 'OPEN_CARD', payload: card });\n                }}`;

const newHandler = `                onOpenCard={(cardId) => {\n                  const card = resolveOracleRelicCard({\n                    cardId,\n                    deck: state.deck,\n                    readingCards: state.reading?.cards || [],\n                    tradition: state.selectedTradition,\n                  });\n                  if (card) dispatch({ type: 'OPEN_CARD', payload: card });\n                }}`;

app = replaceOnce(app, oldHandler, newHandler, 'Oracle relic resolver handler');

for (const marker of [
  "import { resolveOracleRelicCard } from './reliquary/oracleRelicResolver.js';",
  'const card = resolveOracleRelicCard({',
  'readingCards: state.reading?.cards || [],',
  "dispatch({ type: 'OPEN_CARD', payload: card })",
]) {
  if (!app.includes(marker)) fail(`required resolver runtime marker missing: ${marker}`);
}

if (app.includes('const liveDeckCard = state.deck.find')) fail('legacy inline Oracle resolver is still present');

fs.writeFileSync(appPath, app);
console.log('Applied tested 0.46 Oracle relic resolver to src/App.jsx.');
