import fs from 'node:fs';
import {
  CANONICAL_CARD_MANIFEST,
  UPSTREAM_TAROT_CONTRACT,
  buildCanonicalTriadConsultation,
} from '../src/tarotBridge/canonicalTarotBridge.js';
import {
  AUTHORITATIVE_CARD_MANIFEST,
  AUTHORITATIVE_CARD_MANIFEST_META,
} from '../src/tarotBridge/authoritativeCardManifest.generated.js';

const path = new URL('../src/tarotBridge/canonicalTarotBridge.js', import.meta.url);
const source = fs.readFileSync(path, 'utf8');
const failures = [];
const pass = message => console.log(`PASS ${message}`);
const fail = message => failures.push(message);

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
const presentForbidden = forbidden.filter(marker => source.includes(marker));
if (presentForbidden.length) fail(`dead local card doctrine remains: ${presentForbidden.join(', ')}`);
else pass('dead local card doctrine builder removed');

if (!source.includes("const THOTH_BOOK_SOURCE = 'src.primary.crowley.book-of-thoth.1944';")) {
  fail('live THOTH_BOOK_SOURCE relation provenance constant was removed');
} else pass('live relation provenance source constant preserved');

if (!source.includes('const EXPLICIT_RELATIONS = new Map([') || !source.includes('const analyzePair =')) {
  fail('relation kernel was altered or removed during card-doctrine de-dup');
} else pass('relation kernel remains present and separate');

if (CANONICAL_CARD_MANIFEST !== AUTHORITATIVE_CARD_MANIFEST) {
  fail('production card manifest is not the authoritative generated artifact');
} else pass('production card manifest is exactly the authoritative generated artifact');

if (CANONICAL_CARD_MANIFEST.length !== 78 || AUTHORITATIVE_CARD_MANIFEST_META.cardCount !== 78) {
  fail('authoritative card manifest is not exactly 78 cards');
} else pass('authoritative 78-card manifest preserved');

if (
  AUTHORITATIVE_CARD_MANIFEST_META.contractId !== UPSTREAM_TAROT_CONTRACT.contractId
  || AUTHORITATIVE_CARD_MANIFEST_META.contractVersion !== UPSTREAM_TAROT_CONTRACT.contractVersion
  || AUTHORITATIVE_CARD_MANIFEST_META.authorityRepository !== UPSTREAM_TAROT_CONTRACT.repository
  || AUTHORITATIVE_CARD_MANIFEST_META.authorityCommit !== UPSTREAM_TAROT_CONTRACT.commit
) {
  fail('authoritative card artifact no longer matches the pinned upstream contract');
} else pass('exact upstream contract pin preserved');

const aces = buildCanonicalTriadConsultation({
  readingId: 'phase-c-three-aces',
  question: 'Phase C relation regression',
  legacyIndexes: [22, 50, 36],
  tradition: { id: 'thoth' },
  readingDepth: 'adept',
});
if (JSON.stringify(aces.relations.map(relation => relation.relationType)) !== JSON.stringify(['FRIENDLY', 'FRIENDLY'])) {
  fail('Three-Aces immediate relation truth changed');
} else pass('Three-Aces immediate relation truth preserved');
const outer = aces.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT');
const center = aces.spreadPatterns.find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT');
if (outer?.relationType !== 'INIMICAL' || center?.effectType !== 'CENTER_BETWEEN_CONTRARIES') {
  fail('Three-Aces contextual relation truth changed');
} else pass('Three-Aces contextual relation truth preserved');

const gap = buildCanonicalTriadConsultation({
  readingId: 'phase-c-major-gap',
  question: 'Phase C major gap regression',
  legacyIndexes: [22, 3, 36],
  tradition: { id: 'thoth' },
  readingDepth: 'adept',
});
const gapPairs = gap.relations.map(relation => [relation.relationType, relation.reasonCode]);
if (JSON.stringify(gapPairs) !== JSON.stringify([
  ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
  ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
])) {
  fail('Major-gap UNSPECIFIED behavior changed');
} else pass('Major-gap UNSPECIFIED behavior preserved');

if (failures.length) {
  failures.forEach(message => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('0.48 Phase C card-doctrine de-dup: PASS');
