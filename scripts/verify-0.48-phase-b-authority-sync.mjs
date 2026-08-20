import assert from 'node:assert/strict';
import {
  AUTHORITATIVE_CARD_MANIFEST,
  AUTHORITATIVE_CARD_MANIFEST_META,
} from '../src/tarotBridge/authoritativeCardManifest.generated.js';
import {
  CANONICAL_CARD_MANIFEST,
  UPSTREAM_TAROT_CONTRACT,
} from '../src/tarotBridge/canonicalTarotBridge.js';
import {
  buildFoldConformanceParityCore,
  countFoldSourceClaimCoverage,
  validateFoldConformanceSnapshot,
} from '../src/tarotBridge/conformanceSnapshot.js';

const pass = label => console.log(`PASS ${label}`);

assert.equal(AUTHORITATIVE_CARD_MANIFEST_META.contractId, UPSTREAM_TAROT_CONTRACT.contractId);
assert.equal(AUTHORITATIVE_CARD_MANIFEST_META.contractVersion, UPSTREAM_TAROT_CONTRACT.contractVersion);
assert.equal(AUTHORITATIVE_CARD_MANIFEST_META.authorityRepository, UPSTREAM_TAROT_CONTRACT.repository);
assert.equal(AUTHORITATIVE_CARD_MANIFEST_META.authorityCommit, UPSTREAM_TAROT_CONTRACT.commit);
pass('generated card authority matches exact upstream contract pin');

assert.equal(AUTHORITATIVE_CARD_MANIFEST.length, 78);
assert.deepEqual(CANONICAL_CARD_MANIFEST, AUTHORITATIVE_CARD_MANIFEST);
pass('production Fold card manifest is the generated authoritative manifest');

const coverage = countFoldSourceClaimCoverage();
assert.equal(coverage.totalFields, 650);
assert.equal(coverage.fieldsWithClaims, 512);
assert.equal(coverage.fieldsWithoutClaims, 138);
pass('Fold source-field and claim coverage matches authoritative VR snapshot 512/650');

const core = buildFoldConformanceParityCore();
const fool = core.cards.find(card => card.cardId === 'major.fool');
assert.ok(fool.thoth.fields.bookNomenclature);
assert.equal(fool.thoth.fields.nativeTitle.authority, 'NOT_APPLICABLE');
assert.equal(fool.thoth.fields.rankName.authority, 'NOT_APPLICABLE');
assert.equal(fool.thoth.fields.suitName.authority, 'NOT_APPLICABLE');
assert.ok(fool.thoth.fields.displayName.claimIds.length > 0);
pass('Major source shape includes explicit not-applicable fields, nomenclature and claim provenance');

const magus = core.cards.find(card => card.cardId === 'major.magician');
assert.ok(magus.thoth.fields.displayName.claimIds.includes('claim.thoth-deck-face.magician.expression'));
pass('deck-artifact claim provenance survives the Fold authority boundary');

assert.deepEqual(validateFoldConformanceSnapshot(), []);
pass('Fold conformance validator remains green after authority sync');

const serialized = JSON.stringify(core);
['imageUrl', 'ComfyUI', 'camera', 'enchantment'].forEach(forbidden => assert.equal(serialized.includes(forbidden), false));
pass('authority artifact remains presentation-free');

console.log('0.48 Phase B Fold authority sync: PASS');
