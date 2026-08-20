import fs from 'node:fs';

const path = new URL('../src/tarotBridge/canonicalTarotBridge.js', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

const deckSourceLine = "const THOTH_DECK_SOURCE = 'src.primary.crowley-harris.thoth-deck.usgames';\n";
if (!source.includes(deckSourceLine)) {
  throw new Error('0.48 Phase C activator refused to edit: THOTH_DECK_SOURCE anchor missing.');
}
source = source.replace(deckSourceLine, '');

const startAnchor = 'const MAJOR_IDENTITIES = Object.freeze([';
const endAnchor = "const buildCanonicalCardManifest = () => {";
const start = source.indexOf(startAnchor);
const builderStart = source.indexOf(endAnchor);
if (start < 0 || builderStart < 0 || builderStart <= start) {
  throw new Error('0.48 Phase C activator refused to edit: legacy card-doctrine block anchors missing or out of order.');
}

const builderClose = source.indexOf('\n};\n\nif (\n  AUTHORITATIVE_CARD_MANIFEST_META.contractId', builderStart);
if (builderClose < 0) {
  throw new Error('0.48 Phase C activator refused to edit: legacy card builder closing anchor missing.');
}

source = `${source.slice(0, start)}${source.slice(builderClose + '\n};\n'.length)}`;

const required = [
  "import { AUTHORITATIVE_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST_META } from './authoritativeCardManifest.generated.js';",
  'export const CANONICAL_CARD_MANIFEST = deepFreeze(AUTHORITATIVE_CARD_MANIFEST);',
  "const THOTH_BOOK_SOURCE = 'src.primary.crowley.book-of-thoth.1944';",
  'const EXPLICIT_RELATIONS = new Map([',
  'export const buildCanonicalTriadConsultation = ({',
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`0.48 Phase C activator refused final write: required live marker missing: ${marker}`);
}

const forbidden = [
  'THOTH_DECK_SOURCE',
  'MAJOR_IDENTITIES',
  'const SUITS =',
  'LEGACY_RANKS',
  'RANK_LABELS',
  'COURT_CORRESPONDENCES',
  'PIP_ROWS',
  'ACE_NATIVE_TITLES',
  'MAJOR_CORRESPONDENCE_OVERRIDES',
  'makeSourceField',
  'notApplicableField',
  'buildCanonicalCardManifest',
];
for (const marker of forbidden) {
  if (source.includes(marker)) throw new Error(`0.48 Phase C activator refused final write: dead doctrine marker remains: ${marker}`);
}

fs.writeFileSync(path, source, 'utf8');
console.log('0.48 Phase C card-doctrine de-dup activation: PASS');
