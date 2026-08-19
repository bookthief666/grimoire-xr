import fs from 'node:fs';
import path from 'node:path';

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.jsx'), 'utf8');
const oracle = fs.readFileSync(path.join(process.cwd(), 'src/tarotBridge/OracleLivingBook.jsx'), 'utf8');
const fail = message => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = message => console.log(`PASS ${message}`);

const appRequired = [
  "import ReliquarySurface from './reliquary/ReliquarySurface.jsx'",
  "import RelicChamberField from './reliquary/RelicChamberField.jsx'",
  'const [reliquaryEntries, setReliquaryEntries]',
  'void loadReliquary().then',
  'saveReliquaryReading({ state })',
  'removeReliquaryEntry({ entryId })',
  'const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis',
  'onArchive={() => void handleSealCurrentReading()}',
  'const card = state.deck.find(entry => entry.id === cardId || entry.canonicalCardId === cardId) || fallbackCard;',
  '<span className="hidden md:inline">RELIQUARY</span>',
  '<RelicChamberField card={state.focusedCard}',
  'RELIC HISTORY · {state.focusedCard.patina || 0} ENCOUNTER',
  '<ReliquarySurface',
  'onRestoreMemory={handleRestoreReliquaryMemory}',
];

for (const marker of appRequired) {
  if (app.includes(marker)) pass(marker);
  else fail(`missing App runtime marker: ${marker}`);
}

const oracleRequired = [
  'onOpenCard = null',
  "className={`oracle-position-card ${onOpen ? 'is-openable' : ''} min-w-0`}",
  'role={onOpen ? \'button\' : undefined}',
  'aria-label={onOpen ? `Open relic chamber for ${position.title}` : undefined}',
  'oracle-open-relic-hint',
  'onOpen={onOpenCard && position.legacyCard ? () => onOpenCard(position.cardId, position.legacyCard) : null}',
];

for (const marker of oracleRequired) {
  if (oracle.includes(marker)) pass(marker);
  else fail(`missing Oracle runtime marker: ${marker}`);
}

for (const forbidden of [
  '>ARCHIVE OPTIONS</h3>',
  'PATINA FACTOR: {state.focusedCard.patina || 0}',
]) {
  if (app.includes(forbidden)) fail(`legacy surface still active: ${forbidden}`);
}

if (!process.exitCode) console.log('0.46 relic chamber + reliquary integration gate: PASS');
