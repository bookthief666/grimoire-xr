import assert from 'node:assert/strict';
import { buildCanonicalDeckGenesis } from '../src/tarotBridge/canonicalDeckGenesis.js';
import { buildCanonicalTriadConsultation } from '../src/tarotBridge/canonicalTarotBridge.js';
import { buildGrimoireArchiveEnvelope, buildArchiveRestoreState } from '../src/tarotBridge/archiveEnvelope.js';
import { buildReliquarySnapshot } from '../src/reliquary/reliquaryStore.js';
import { serializeGrimoireSession, parseGrimoireSession } from '../src/persistence/grimoireStore.js';
import { createSemanticConfig } from '../src/semantic/semanticConfig.js';
import { applySemanticPatchToAppState, migrateAppStateSemanticConfig } from '../src/semantic/semanticRuntimeAdapter.js';

const pass = label => console.log(`PASS ${label}`);
const traditions = [
  { id: 'thoth', name: 'Book of Thoth' },
  { id: 'rws', name: 'Rider-Waite-Smith' },
  { id: 'marseille', name: 'Tarot de Marseille' },
  { id: 'bruno', name: 'Giordano Bruno' },
];

const semanticConfig = createSemanticConfig({
  tarotSystem: 'thoth',
  interpretiveLenses: ['bataille_eroticism', 'neoplatonic_theurgy'],
  readingDepth: 'magus',
});
const deck = buildCanonicalDeckGenesis({ tradition: { id: 'thoth' } });
const cards = [deck[22], deck[50], deck[36]];
const readingRecord = buildCanonicalTriadConsultation({
  readingId: 'phase-c-runtime-fixture',
  question: 'What survives as doctrine changes?',
  legacyIndexes: [22, 50, 36],
  semanticConfig,
});
const reading = {
  cards,
  answer: '',
  readingRecord,
  selectionSource: 'BOUND_TRIAD_CLOTH',
};
const state = {
  phase: 'ORACLE',
  author: 'Phase C QA',
  selectedStyle: { id: 'pixel', name: '16-Bit Sovereign' },
  selectedTradition: traditions[0],
  semanticConfig,
  erosLevel: 0,
  techLevel: 2,
  dossier: null,
  deck,
  suggestedQuestions: [],
  portrait: null,
  focusedCard: null,
  isForging: false,
  oracleQuestion: readingRecord.input.question,
  reading,
  isConsulting: false,
  archiveState: 'IDLE',
  archiveProgress: { current: 0, total: 0, msg: '' },
  isSpiritBoxOpen: false,
  spiritChat: [],
  spiritInput: '',
  isSpiritTyping: false,
  isStatsOpen: false,
  status: '',
  error: null,
  reforgeStatus: '',
  isOffline: false,
  errorMessage: '',
  scriptoriumMode: 'DECK',
  activeSpread: 'TRIAD',
  spreadSlots: [22, 50, 36],
  placementCardId: null,
};

assert.deepEqual(readingRecord.input.lenses, ['bataille_eroticism', 'neoplatonic_theurgy']);
assert.equal(readingRecord.input.relationMethod, 'crowley_lxxviii_dignities');
pass('ReadingRecord carries philosophical lenses without changing relation method');

const lensOnly = applySemanticPatchToAppState({
  state,
  patch: { interpretiveLenses: ['bataille_eroticism', 'nietzsche_dionysian'] },
  traditions,
});
assert.equal(lensOnly.nextState.phase, 'ORACLE');
assert.equal(lensOnly.nextState.reading, state.reading);
assert.equal(lensOnly.nextState.deck, state.deck);
assert.equal(lensOnly.nextState.semanticConfig.relationMethod, 'crowley_lxxviii_dignities');
assert.equal(lensOnly.nextState.selectedTradition.id, 'thoth');
pass('lens-only app transition leaves canonical reading/deck open and compatibility mirror on Thoth');

const systemChange = applySemanticPatchToAppState({ state, patch: { tarotSystem: 'rws' }, traditions });
assert.equal(systemChange.nextState.phase, 'LANDING');
assert.equal(systemChange.nextState.reading, null);
assert.equal(systemChange.nextState.oracleQuestion, readingRecord.input.question);
assert.equal(systemChange.nextState.selectedTradition.id, 'rws');
assert.equal(systemChange.nextState.deck.find(card => card.canonicalCardId === 'major.magician').name, 'THE MAGICIAN');
pass('fact-affecting system change closes stale Oracle and rebinds canonical deck');

const archive = buildGrimoireArchiveEnvelope({ state, exportedAt: '2026-08-19T00:00:00.000Z' });
assert.equal(archive.schemaVersion, '2.1.0');
assert.deepEqual(archive.grimoire.semanticConfig, semanticConfig);
const restoredArchive = buildArchiveRestoreState({ envelope: archive, styles: [state.selectedStyle], traditions });
const migratedArchive = migrateAppStateSemanticConfig({ state: restoredArchive, traditions });
assert.deepEqual(migratedArchive.state.semanticConfig.interpretiveLenses, ['bataille_eroticism', 'neoplatonic_theurgy']);
assert.equal(migratedArchive.state.selectedTradition.id, 'thoth');
pass('2.1 archive round-trip preserves semantic config and compatibility mirror');

const reliquary = buildReliquarySnapshot(state);
assert.deepEqual(reliquary.semanticConfig, semanticConfig);
const migratedReliquary = migrateAppStateSemanticConfig({ state: reliquary, traditions });
assert.deepEqual(migratedReliquary.state.semanticConfig.interpretiveLenses, ['bataille_eroticism', 'neoplatonic_theurgy']);
pass('Reliquary snapshot preserves semantic config directly');

const session = serializeGrimoireSession({ state, savedAt: '2026-08-19T00:00:00.000Z' });
const parsedSession = parseGrimoireSession(session.text);
assert.deepEqual(parsedSession.envelope.state.semanticConfig, semanticConfig);
pass('continuity snapshot preserves semantic config without a second persistence schema');

const oldReadingRecordState = {
  selectedTradition: { id: 'bruno', name: 'Giordano Bruno' },
  techLevel: 2,
  reading: {
    readingRecord: {
      input: {
        tarotSystem: 'thoth',
        correspondenceProfile: 'thoth_native',
        relationMethod: 'crowley_lxxviii_dignities',
        lenses: ['bataille_eroticism'],
        readingDepth: 'neophyte',
      },
      presentationContext: { ritualTheme: 'none' },
    },
  },
};
const oldMigrated = migrateAppStateSemanticConfig({ state: oldReadingRecordState, traditions });
assert.equal(oldMigrated.state.semanticConfig.tarotSystem, 'thoth');
assert.deepEqual(oldMigrated.state.semanticConfig.interpretiveLenses, ['bataille_eroticism']);
assert.equal(oldMigrated.state.semanticConfig.readingDepth, 'neophyte');
assert.equal(oldMigrated.state.selectedTradition.id, 'thoth');
assert.equal(oldMigrated.state.techLevel, 0);
pass('ReadingRecord semantic fields outrank conflicting legacy Bruno/tech controls during restore');

console.log('0.47 Phase C semantic runtime QA: PASS');
