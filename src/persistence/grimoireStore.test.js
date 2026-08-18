import { describe, expect, it } from 'vitest';
import {
  GRIMOIRE_IMAGE_REFERENCE_PREFIX,
  GRIMOIRE_SESSION_SCHEMA_ID,
  GRIMOIRE_SESSION_SCHEMA_VERSION,
  GRIMOIRE_SESSION_STORAGE_KEY,
  buildGrimoireSessionEnvelope,
  extractEmbeddedImages,
  hasMeaningfulGrimoireSession,
  normalizePersistedState,
  parseGrimoireSession,
  persistGrimoireSession,
  rebindSessionCatalogState,
  restoreGrimoireSession,
  serializeGrimoireSession,
  shouldPersistGrimoireSession,
} from './grimoireStore.js';

const IMAGE = 'data:image/png;base64,QUJDREVGRw==';

const makeState = () => ({
  phase: 'ORACLE',
  author: 'Continuity Adept',
  selectedStyle: { id: 'pixel', name: '16-Bit Sovereign' },
  selectedTradition: { id: 'thoth', name: 'Book of Thoth' },
  dossier: 'The session should survive.',
  deck: [{
    id: 22,
    canonicalCardId: 'minor.staffs.ace',
    name: 'ACE OF WANDS',
    imageUrl: IMAGE,
    exegesis: 'Generated interpretation.',
    meta: { planet: 'Generated reflection.' },
    patina: 4,
    promptUsed: 'A deterministic prompt.',
    generation: { provider: 'comfyui', mode: 'preview', seed: 424242 },
  }],
  focusedCard: {
    id: 22,
    canonicalCardId: 'minor.staffs.ace',
    name: 'ACE OF WANDS',
    imageUrl: IMAGE,
    patina: 4,
  },
  portrait: IMAGE,
  reading: {
    answer: 'Generated synthesis.',
    cards: [{ id: 22, canonicalCardId: 'minor.staffs.ace', imageUrl: IMAGE }],
    selectionSource: 'BOUND_TRIAD_CLOTH',
    readingRecord: {
      readingId: 'continuity-reading',
      input: { cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'] },
      relations: [{ relationType: 'FRIENDLY' }, { relationType: 'FRIENDLY' }],
      spreadPatterns: [{ relationType: 'INIMICAL' }],
    },
  },
  spiritChat: [{ role: 'ai', text: 'I am present.' }, { role: 'user', text: 'Remember this.' }],
  activeSpread: 'TRIAD',
  spreadSlots: [22, 50, 36],
  isForging: false,
  isConsulting: false,
  isSpiritTyping: false,
  isStatsOpen: true,
  isSpiritBoxOpen: true,
  archiveState: 'PROMPT',
  archiveProgress: { current: 7, total: 10, msg: 'busy' },
  reforgeStatus: 'old status',
  error: 'old error',
  errorMessage: 'old message',
  placementCardId: 22,
});

const createStorage = ({ throwOnSet = false, initial = {} } = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => {
      if (throwOnSet) throw new Error('quota exceeded');
      values.set(key, String(value));
    },
    removeItem: key => values.delete(key),
    dump: () => Object.fromEntries(values),
  };
};

const createImageStore = ({ failWrites = false, initial = {} } = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    async putMany(records) {
      if (failWrites) throw new Error('indexeddb unavailable');
      records.forEach(record => values.set(record.key, record.dataUrl));
    },
    async get(key) {
      return values.get(key) || null;
    },
    async clear() {
      values.clear();
    },
    dump: () => Object.fromEntries(values),
  };
};

describe('0.40.1 Continuity Foundation session store', () => {
  it('extracts duplicate embedded images once and leaves lightweight references in the semantic graph', () => {
    const extracted = extractEmbeddedImages(makeState());
    expect(extracted.images).toHaveLength(1);
    expect(extracted.images[0].dataUrl).toBe(IMAGE);
    expect(extracted.value.deck[0].imageUrl).toMatch(new RegExp(`^${GRIMOIRE_IMAGE_REFERENCE_PREFIX}`));
    expect(extracted.value.focusedCard.imageUrl).toBe(extracted.value.deck[0].imageUrl);
    expect(extracted.value.portrait).toBe(extracted.value.deck[0].imageUrl);
  });

  it('serializes a versioned semantic snapshot containing no image payloads', () => {
    const serialized = serializeGrimoireSession({ state: makeState(), savedAt: '2026-08-18T12:00:00.000Z' });
    expect(serialized.envelope.schemaId).toBe(GRIMOIRE_SESSION_SCHEMA_ID);
    expect(serialized.envelope.schemaVersion).toBe(GRIMOIRE_SESSION_SCHEMA_VERSION);
    expect(serialized.text).not.toContain('data:image/');
    expect(serialized.images).toHaveLength(1);
  });

  it('resets transient/busy UI state without altering the semantic reading', () => {
    const normalized = normalizePersistedState(makeState());
    expect(normalized).toMatchObject({
      phase: 'ORACLE',
      isForging: false,
      isConsulting: false,
      isSpiritTyping: false,
      isStatsOpen: false,
      isSpiritBoxOpen: false,
      archiveState: 'IDLE',
      reforgeStatus: '',
      error: null,
      errorMessage: '',
      placementCardId: null,
    });
    expect(normalized.reading.readingRecord).toEqual(makeState().reading.readingRecord);
    expect(normalized.deck[0].patina).toBe(4);
  });

  it('persists only meaningful stable sessions, preserving the previous checkpoint during expensive work', () => {
    const stable = makeState();
    expect(hasMeaningfulGrimoireSession(stable)).toBe(true);
    expect(shouldPersistGrimoireSession(stable)).toBe(true);
    expect(shouldPersistGrimoireSession({ ...stable, isForging: true })).toBe(false);
    expect(shouldPersistGrimoireSession({ ...stable, isConsulting: true })).toBe(false);
    expect(shouldPersistGrimoireSession({ ...stable, phase: 'RITUAL' })).toBe(false);
    expect(shouldPersistGrimoireSession({ phase: 'LANDING', deck: [], spiritChat: [] })).toBe(false);
  });

  it('round-trips generated art through the image store and preserves ReadingRecord semantics', async () => {
    const storage = createStorage();
    const imageStore = createImageStore();
    const state = makeState();
    const result = await persistGrimoireSession({ state, storage, imageStore, savedAt: '2026-08-18T12:00:00.000Z' });
    expect(result.status).toBe('SAVED');
    expect(result.imageCount).toBe(1);
    expect(storage.dump()[GRIMOIRE_SESSION_STORAGE_KEY]).not.toContain('data:image/');

    const restored = await restoreGrimoireSession({ storage, imageStore });
    expect(restored.status).toBe('RESTORED');
    expect(restored.state.deck[0].imageUrl).toBe(IMAGE);
    expect(restored.state.portrait).toBe(IMAGE);
    expect(restored.state.deck[0].exegesis).toBe('Generated interpretation.');
    expect(restored.state.deck[0].generation.seed).toBe(424242);
    expect(restored.state.deck[0].patina).toBe(4);
    expect(restored.state.reading.readingRecord).toEqual(state.reading.readingRecord);
    expect(restored.state.reading.selectionSource).toBe('BOUND_TRIAD_CLOTH');
  });

  it('restores semantic truth when artwork is missing instead of invalidating the session', async () => {
    const serialized = serializeGrimoireSession({ state: makeState() });
    const storage = createStorage({ initial: { [GRIMOIRE_SESSION_STORAGE_KEY]: serialized.text } });
    const restored = await restoreGrimoireSession({ storage, imageStore: createImageStore() });
    expect(restored.status).toBe('RESTORED_WITH_MISSING_IMAGES');
    expect(restored.missingImages.length).toBeGreaterThan(0);
    expect(restored.state.deck[0].imageUrl).toBeNull();
    expect(restored.state.reading.readingRecord.readingId).toBe('continuity-reading');
    expect(restored.state.deck[0].canonicalCardId).toBe('minor.staffs.ace');
  });

  it('still saves the semantic snapshot when IndexedDB is unavailable and reports the degraded image state', async () => {
    const storage = createStorage();
    const result = await persistGrimoireSession({ state: makeState(), storage, imageStore: createImageStore({ failWrites: true }) });
    expect(result.saved).toBe(true);
    expect(result.status).toBe('SAVED_WITH_WARNINGS');
    expect(result.warnings[0]).toContain('IMAGE_STORE_UNAVAILABLE');
    expect(storage.dump()[GRIMOIRE_SESSION_STORAGE_KEY]).not.toContain('data:image/');
  });

  it('does not destroy the prior stored checkpoint when localStorage rejects a new write', async () => {
    const previous = JSON.stringify(buildGrimoireSessionEnvelope({ state: makeState() }).envelope);
    const storage = createStorage({ throwOnSet: true, initial: { [GRIMOIRE_SESSION_STORAGE_KEY]: previous } });
    const result = await persistGrimoireSession({ state: makeState(), storage, imageStore: createImageStore() });
    expect(result.status).toBe('FAILED');
    expect(result.error).toContain('SESSION_STORAGE_FAILED');
    expect(storage.getItem(GRIMOIRE_SESSION_STORAGE_KEY)).toBe(previous);
  });

  it('fails corrupt storage closed without crashing startup', async () => {
    const storage = createStorage({ initial: { [GRIMOIRE_SESSION_STORAGE_KEY]: '{broken' } });
    const restored = await restoreGrimoireSession({ storage, imageStore: createImageStore() });
    expect(restored.status).toBe('CORRUPT');
    expect(restored.state).toBeNull();
    expect(restored.error).toContain('not valid JSON');
  });

  it('provides a narrow schema-v0 migration path and rejects foreign schemas', () => {
    const migrated = parseGrimoireSession({
      schemaId: GRIMOIRE_SESSION_SCHEMA_ID,
      schemaVersion: 0,
      savedAt: '2026-08-17T00:00:00.000Z',
      session: makeState(),
    });
    expect(migrated.migrated).toBe(true);
    expect(migrated.envelope.schemaVersion).toBe(GRIMOIRE_SESSION_SCHEMA_VERSION);
    expect(migrated.envelope.state.reading.readingRecord.readingId).toBe('continuity-reading');
    expect(() => parseGrimoireSession({ schemaId: 'foreign.app', schemaVersion: 99, state: {} }))
      .toThrow('Unsupported Grimoire session schema');
  });

  it('rebinds restored catalog values to the live catalog objects without changing semantic choices', () => {
    const style = { id: 'pixel', name: '16-Bit Sovereign', prompt: 'live style' };
    const tradition = { id: 'thoth', name: 'Book of Thoth', desc: 'live tradition' };
    const rebound = rebindSessionCatalogState(makeState(), { styles: [style], traditions: [tradition] });
    expect(rebound.selectedStyle).toBe(style);
    expect(rebound.selectedTradition).toBe(tradition);
  });
});
