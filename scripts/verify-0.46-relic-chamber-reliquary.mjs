import fs from 'node:fs';
import path from 'node:path';

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.jsx'), 'utf8');
const fail = message => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = message => console.log(`PASS ${message}`);

const required = [
  "import ReliquarySurface from './reliquary/ReliquarySurface.jsx'",
  "import RelicChamberField from './reliquary/RelicChamberField.jsx'",
  'const [reliquaryEntries, setReliquaryEntries]',
  'void loadReliquary().then',
  'saveReliquaryReading({ state })',
  'removeReliquaryEntry({ entryId })',
  'const canonicalDeck = validateCanonicalDeckGenesis(buildCanonicalDeckGenesis',
  'onArchive={() => void handleSealCurrentReading()}',
  '<RelicChamberField card={state.focusedCard}',
  'RELIC HISTORY · {state.focusedCard.patina || 0} ENCOUNTER',
  '<ReliquarySurface',
  'onRestoreMemory={handleRestoreReliquaryMemory}',
];

for (const marker of required) {
  if (app.includes(marker)) pass(marker);
  else fail(`missing runtime marker: ${marker}`);
}

for (const forbidden of [
  '>ARCHIVE OPTIONS</h3>',
  'PATINA FACTOR: {state.focusedCard.patina || 0}',
]) {
  if (app.includes(forbidden)) fail(`legacy surface still active: ${forbidden}`);
}

if (!process.exitCode) console.log('0.46 relic chamber + reliquary integration gate: PASS');
