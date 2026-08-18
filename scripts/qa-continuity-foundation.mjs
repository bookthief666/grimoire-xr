import assert from 'node:assert/strict';
import {
  GRIMOIRE_SESSION_STORAGE_KEY,
  persistGrimoireSession,
  restoreGrimoireSession,
  serializeGrimoireSession,
  shouldPersistGrimoireSession,
} from '../src/persistence/grimoireStore.js';

const IMAGE = 'data:image/png;base64,Q09OVElOVUlUWQ==';
const readingRecord = Object.freeze({
  readingId: 'qa-continuity-reading',
  input: Object.freeze({
    cardIds: Object.freeze(['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace']),
  }),
  relations: Object.freeze([
    Object.freeze({ relationType: 'FRIENDLY' }),
    Object.freeze({ relationType: 'FRIENDLY' }),
  ]),
  spreadPatterns: Object.freeze([Object.freeze({ relationType: 'INIMICAL' })]),
});

const state = {
  phase: 'ORACLE',
  author: 'Continuity QA',
  deck: [{
    id: 22,
    canonicalCardId: 'minor.staffs.ace',
    name: 'ACE OF WANDS',
    imageUrl: IMAGE,
    exegesis: 'QA interpretation.',
    patina: 7,
    generation: { provider: 'comfyui', mode: 'preview', seed: 424242 },
  }],
  reading: {
    answer: 'QA synthesis.',
    readingRecord,
    selectionSource: 'BOUND_TRIAD_CLOTH',
  },
  spiritChat: [],
  isForging: false,
  isConsulting: false,
  archiveState: 'IDLE',
};

const values = new Map();
const storage = {
  getItem: key => values.get(key) || null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
const imageValues = new Map();
const imageStore = {
  async putMany(records) { records.forEach(record => imageValues.set(record.key, record.dataUrl)); },
  async get(key) { return imageValues.get(key) || null; },
  async clear() { imageValues.clear(); },
};

assert.equal(shouldPersistGrimoireSession(state), true);
assert.equal(shouldPersistGrimoireSession({ ...state, isForging: true }), false);

const serialized = serializeGrimoireSession({ state, savedAt: '2026-08-18T12:00:00.000Z' });
assert.equal(serialized.text.includes('data:image/'), false);
assert.equal(serialized.images.length, 1);
console.log('PASS lightweightSemanticSnapshot');

const saved = await persistGrimoireSession({ state, storage, imageStore, savedAt: '2026-08-18T12:00:00.000Z' });
assert.equal(saved.status, 'SAVED');
assert.equal(values.get(GRIMOIRE_SESSION_STORAGE_KEY).includes('data:image/'), false);
console.log('PASS indexedImageSeparation');

const restored = await restoreGrimoireSession({ storage, imageStore });
assert.equal(restored.status, 'RESTORED');
assert.equal(restored.state.deck[0].imageUrl, IMAGE);
assert.equal(restored.state.deck[0].patina, 7);
assert.deepEqual(restored.state.reading.readingRecord, readingRecord);
assert.equal(restored.state.reading.selectionSource, 'BOUND_TRIAD_CLOTH');
console.log('PASS semanticRoundTrip');

const missing = await restoreGrimoireSession({
  storage,
  imageStore: { async get() { return null; } },
});
assert.equal(missing.status, 'RESTORED_WITH_MISSING_IMAGES');
assert.equal(missing.state.deck[0].imageUrl, null);
assert.equal(missing.state.deck[0].canonicalCardId, 'minor.staffs.ace');
assert.equal(missing.state.reading.readingRecord.readingId, 'qa-continuity-reading');
console.log('PASS missingArtworkFailsSoft');

console.log('0.40.1 continuity foundation QA: PASS');
