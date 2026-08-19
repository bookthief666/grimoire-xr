import fs from 'node:fs';
import path from 'node:path';

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.jsx'), 'utf8');
const oracle = fs.readFileSync(path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx'), 'utf8');

const required = [
  ['App live deck resolver', app, 'const liveDeckCard = state.deck.find'],
  ['App reading fallback', app, 'const readingCard = state.reading?.cards?.find'],
  ['App canonical regeneration fallback', app, 'const regeneratedCard = (!liveDeckCard && !readingCard)'],
  ['Oracle cardId trigger', oracle, 'onOpen={onOpenCard && position.cardId ? () => onOpenCard(position.cardId) : null}'],
  ['Oracle accessible button role', oracle, "role={onOpen ? 'button' : undefined}"],
  ['Oracle open relic affordance', oracle, 'oracle-open-relic-hint'],
];

let failed = false;
for (const [label, source, marker] of required) {
  if (source.includes(marker)) console.log(`PASS ${label}`);
  else {
    console.error(`FAIL ${label}`);
    failed = true;
  }
}

if (oracle.includes('position.legacyCard ? () => onOpenCard')) {
  console.error('FAIL legacyCard still gates Oracle relic opening');
  failed = true;
} else {
  console.log('PASS legacyCard is not an opening prerequisite');
}

if (failed) process.exitCode = 1;
else console.log('0.46 Oracle relic chamber opening fix: PASS');
