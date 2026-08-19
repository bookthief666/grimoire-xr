import fs from 'node:fs';
import path from 'node:path';

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.jsx'), 'utf8');
const oracle = fs.readFileSync(path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx'), 'utf8');

const required = [
  ['App tested resolver import', app, "import { resolveOracleRelicCard } from './reliquary/oracleRelicResolver.js'"],
  ['App tested resolver invocation', app, 'const card = resolveOracleRelicCard({'],
  ['App live deck passed to resolver', app, 'deck: state.deck,'],
  ['App reading layers passed to resolver', app, 'readingCards: state.reading?.cards || [],'],
  ['App active tradition passed to resolver', app, 'tradition: state.selectedTradition,'],
  ['Oracle cardId trigger', oracle, 'onOpen={onOpenCard && position.cardId ? () => onOpenCard(position.cardId) : null}'],
  ['Oracle accessible button role', oracle, "role={onOpen ? 'button' : undefined}"],
  ['Oracle open relic affordance', oracle, 'oracle-open-relic-hint'],
];

const forbidden = [
  ['legacy inline live deck resolver', app, 'const liveDeckCard = state.deck.find'],
  ['legacy inline reading fallback', app, 'const readingCard = state.reading?.cards?.find'],
  ['legacy inline regeneration fallback', app, 'const regeneratedCard = (!liveDeckCard && !readingCard)'],
  ['legacy fallbackCard handler', app, '|| fallbackCard'],
  ['legacyCard opening prerequisite', oracle, 'position.legacyCard ? () => onOpenCard'],
  ['legacyCard callback payload', oracle, 'onOpenCard(position.cardId, position.legacyCard)'],
];

let failed = false;
for (const [label, source, marker] of required) {
  if (source.includes(marker)) console.log(`PASS ${label}`);
  else {
    console.error(`FAIL ${label}`);
    failed = true;
  }
}

for (const [label, source, marker] of forbidden) {
  if (source.includes(marker)) {
    console.error(`FAIL ${label} still active`);
    failed = true;
  } else {
    console.log(`PASS ${label} absent`);
  }
}

if (failed) process.exitCode = 1;
else console.log('0.46 Oracle relic chamber opening fix: PASS');
