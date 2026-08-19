import fs from 'node:fs';
import path from 'node:path';

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.jsx'), 'utf8');
const oracle = fs.readFileSync(path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx'), 'utf8');

const checks = [
  ['tested resolver import', app.includes("import { resolveOracleRelicCard } from './reliquary/oracleRelicResolver.js';")],
  ['tested resolver invocation', app.includes('const card = resolveOracleRelicCard({')],
  ['live deck passed into resolver', app.includes('deck: state.deck,')],
  ['reading layers passed into resolver', app.includes('readingCards: state.reading?.cards || [],')],
  ['active tradition passed into resolver', app.includes('tradition: state.selectedTradition,')],
  ['OPEN_CARD dispatch remains downstream', app.includes("dispatch({ type: 'OPEN_CARD', payload: card })")],
  ['canonical cardId enables Oracle opening', oracle.includes('onOpen={onOpenCard && position.cardId ? () => onOpenCard(position.cardId) : null}')],
  ['legacyCard no longer gates opening', !oracle.includes('position.legacyCard ? () => onOpenCard')],
  ['legacy inline resolver removed', !app.includes('const liveDeckCard = state.deck.find')],
];

let failed = false;
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
  if (!pass) failed = true;
}

if (failed) process.exitCode = 1;
else console.log('0.46 tested Oracle relic resolver integration: PASS');
