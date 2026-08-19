import assert from 'node:assert/strict';
import { buildCanonicalDeckGenesis, DECK_GENESIS_AUTHORITIES } from '../src/tarotBridge/canonicalDeckGenesis.js';
import {
  createSemanticConfig,
  semanticConfigFromLegacyTradition,
  updateSemanticConfig,
} from '../src/semantic/semanticConfig.js';
import { buildInterpretiveLensPromptContext } from '../src/semantic/interpretiveLensCatalog.js';
import {
  buildSemanticStateTransition,
  rebuildDeckForSemanticConfig,
} from '../src/semantic/semanticTransition.js';
import { migrateSessionSemanticConfig, readingRecordWasPreserved } from '../src/semantic/sessionSemanticMigration.js';

const pass = label => console.log(`PASS ${label}`);

const thoth = createSemanticConfig({ tarotSystem: 'thoth' });
assert.equal(thoth.correspondenceProfile, 'thoth_native');
assert.equal(thoth.relationMethod, 'crowley_lxxviii_dignities');
pass('fresh Thoth retains source-qualified profile and Crowley dignity method');

const rws = createSemanticConfig({ tarotSystem: 'rws' });
assert.equal(rws.correspondenceProfile, 'none');
assert.equal(rws.relationMethod, 'disabled');
pass('fresh RWS claims no unimplemented correspondence pack or implicit relation method');

const shadowThoth = updateSemanticConfig(thoth, { interpretiveLenses: ['jungian_shadow'] });
assert.equal(shadowThoth.tarotSystem, 'thoth');
assert.equal(shadowThoth.relationMethod, 'crowley_lxxviii_dignities');
pass('Jungian lens does not disable Thoth relation authority');

const brunoThoth = updateSemanticConfig(thoth, {
  interpretiveLenses: ['bruno_mnemonic'],
  ritualTheme: 'giordano_bruno',
});
assert.equal(brunoThoth.tarotSystem, 'thoth');
assert.equal(brunoThoth.relationMethod, 'crowley_lxxviii_dignities');
pass('Bruno lens/theme remains orthogonal to Tarot system and relation method');

const philosophicalThoth = updateSemanticConfig(thoth, {
  interpretiveLenses: ['bataille_eroticism', 'nietzsche_dionysian', 'neoplatonic_theurgy', 'thelemic_hga'],
});
assert.equal(philosophicalThoth.tarotSystem, 'thoth');
assert.equal(philosophicalThoth.correspondenceProfile, 'thoth_native');
assert.equal(philosophicalThoth.relationMethod, 'crowley_lxxviii_dignities');
const lensPrompt = buildInterpretiveLensPromptContext(philosophicalThoth.interpretiveLenses);
assert.match(lensPrompt, /Georges Bataille/);
assert.match(lensPrompt, /Nietzsche/);
assert.match(lensPrompt, /Neoplatonic Theurgy/);
assert.match(lensPrompt, /Thelemic Will & HGA/);
assert.match(lensPrompt, /MUST NOT recalculate, replace, contradict or invent canonical Tarot/);
pass('Bataille/Nietzsche/Theurgy/Thelema lenses remain interpretation-only with an explicit authority firewall');

const thothDeck = buildCanonicalDeckGenesis({ tradition: { id: 'thoth' } });
const magus = thothDeck.find(card => card.canonicalCardId === 'major.magician');
const aceDisks = thothDeck.find(card => card.canonicalCardId === 'minor.coins.ace');
assert.equal(magus.name, 'THE MAGUS');
assert.equal(aceDisks.name, 'ACE OF DISKS');

const decoratedDeck = thothDeck.map(card => card.canonicalCardId === 'major.magician'
  ? {
      ...card,
      imageUrl: 'data:image/png;base64,qa',
      exegesis: 'persistent creative layer',
      patina: 4,
      sourceQualification: 'SOURCE_QUALIFIED',
      canonicalCorrespondences: { stale: true },
      sourceIds: ['src.primary.crowley.book-of-thoth.1944'],
    }
  : card);
const transitioned = rebuildDeckForSemanticConfig({ deck: decoratedDeck, semanticConfig: rws });
const magician = transitioned.find(card => card.canonicalCardId === 'major.magician');
const aceCoins = transitioned.find(card => card.canonicalCardId === 'minor.coins.ace');
assert.equal(magician.name, 'THE MAGICIAN');
assert.equal(magician.nameAuthority, DECK_GENESIS_AUTHORITIES.projectCompatibilityLabel);
assert.deepEqual(magician.nameSourceIds, []);
assert.equal(magician.imageUrl, 'data:image/png;base64,qa');
assert.equal(magician.exegesis, 'persistent creative layer');
assert.equal(magician.patina, 4);
assert.equal('sourceQualification' in magician, false);
assert.equal('canonicalCorrespondences' in magician, false);
assert.equal('sourceIds' in magician, false);
assert.equal(aceCoins.name, 'ACE OF COINS');
assert.deepEqual(transitioned.map(card => card.canonicalCardId), thothDeck.map(card => card.canonicalCardId));
pass('Thoth -> RWS rebuild preserves canonical IDs/creative history and strips Thoth-only active authority');

const historicalRecord = Object.freeze({ readingId: 'history-stays-history', input: Object.freeze({ tarotSystem: 'thoth' }) });
const state = {
  semanticConfig: thoth,
  deck: decoratedDeck,
  reading: { readingRecord: historicalRecord },
  focusedCard: magus,
  isConsulting: true,
};
const systemTransition = buildSemanticStateTransition({ state, patch: { tarotSystem: 'rws' } });
assert.equal(systemTransition.nextState.reading, null);
assert.equal(systemTransition.nextState.focusedCard, null);
assert.equal(systemTransition.nextState.isConsulting, false);
assert.equal(historicalRecord.input.tarotSystem, 'thoth');
pass('Tarot-system transition invalidates active reading/card without mutating historical ReadingRecord');

const lensTransition = buildSemanticStateTransition({ state, patch: { interpretiveLenses: ['jungian_shadow'] } });
assert.equal(lensTransition.nextState.reading, state.reading);
assert.equal(lensTransition.nextState.deck, state.deck);
assert.equal(lensTransition.nextState.semanticConfig.relationMethod, 'crowley_lxxviii_dignities');
pass('interpretive-lens transition leaves canonical reading engine untouched');

const legacyRws = semanticConfigFromLegacyTradition({ id: 'rws' });
assert.equal(legacyRws.config.correspondenceProfile, 'none');
assert.equal(legacyRws.config.relationMethod, 'crowley_lxxviii_dignities');
assert.ok(legacyRws.migrationNotes.includes('legacy_golden_dawn_profile_not_claimed_without_source_pack'));
pass('legacy RWS migration is deterministic and source-honest');

const legacyState = {
  selectedTradition: { id: 'bruno' },
  techLevel: 2,
  reading: { readingRecord: historicalRecord },
};
const migrated = migrateSessionSemanticConfig(legacyState);
assert.equal(migrated.source, 'READING_RECORD_SEMANTIC_PROJECTION');
assert.equal(migrated.state.semanticConfig.tarotSystem, 'thoth');
assert.deepEqual(migrated.state.semanticConfig.interpretiveLenses, ['bruno_mnemonic']);
assert.equal(migrated.state.semanticConfig.ritualTheme, 'giordano_bruno');
assert.equal(migrated.state.semanticConfig.readingDepth, 'magus');
assert.equal(readingRecordWasPreserved(legacyState, migrated.state), true);
pass('ReadingRecord Tarot truth outranks legacy Bruno label while missing lens/theme/depth fields fall back safely');

console.log('0.47 semantic ontology QA: PASS');
