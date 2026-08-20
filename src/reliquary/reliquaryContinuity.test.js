import { describe, expect, it } from 'vitest';
import {
  RELIQUARY_MAX_ENTRIES,
  RELIQUARY_STORAGE_KEY,
  loadReliquary,
  removeReliquaryEntry,
  saveReliquaryReading,
} from './reliquaryStore.js';

const storageOver = backing => ({
  getItem: key => backing.get(key) || null,
  setItem: (key, value) => backing.set(key, String(value)),
  removeItem: key => backing.delete(key),
});

const imagesOver = backing => ({
  async putMany(records = []) {
    records.forEach(record => backing.set(record.key, record.dataUrl));
  },
  async get(key) {
    return backing.get(key) || null;
  },
});

const readingState = ({
  question = 'Does the Grimoire remember?',
  answer = '',
  savedLayer = {},
  deckLayer = null,
} = {}) => {
  const readingRecord = {
    recordVersion: '0.1.0',
    readingId: `qa:${question}`,
    spreadId: 'grimoire.triad.dialectic',
    input: {
      question,
      tarotSystem: 'thoth',
      correspondenceProfile: 'thoth_native',
      relationMethod: 'crowley_lxxviii_dignities',
      lenses: [],
      readingDepth: 'adept',
    },
    positions: [
      { positionId: 'thesis', cardId: 'minor.staffs.ace', orientation: 'upright' },
      { positionId: 'antithesis', cardId: 'minor.swords.ace', orientation: 'upright' },
      { positionId: 'synthesis', cardId: 'minor.cups.ace', orientation: 'upright' },
    ],
    relations: [
      { relationType: 'FRIENDLY', status: 'SUPPORTED' },
      { relationType: 'FRIENDLY', status: 'SUPPORTED' },
    ],
    spreadPatterns: [
      { patternKind: 'OUTER_PAIR_CONTEXT', relationType: 'INIMICAL', status: 'SUPPORTED' },
      { patternKind: 'CENTER_CONTEXT_EFFECT', applied: true, effectType: 'CENTER_BETWEEN_CONTRARIES' },
    ],
    provenance: {
      sourceIds: ['src.primary.crowley.liber-lxxviii', 'src.primary.crowley.book-of-thoth.1944'],
      claimIds: ['claim.qa.keep-order'],
      unresolvedReasonCodes: [],
      relationMethodAuthority: 'SOURCE_QUALIFIED_METHOD_INHERITANCE',
    },
  };
  const cards = [
    {
      id: 22,
      canonicalCardId: 'minor.staffs.ace',
      name: 'Ace of Wands',
      imageUrl: null,
      patina: 1,
      ...savedLayer,
    },
    { id: 50, canonicalCardId: 'minor.swords.ace', name: 'Ace of Swords', imageUrl: null, patina: 0 },
    { id: 36, canonicalCardId: 'minor.cups.ace', name: 'Ace of Cups', imageUrl: null, patina: 0 },
  ];

  return {
    phase: 'ORACLE',
    author: 'QA',
    selectedStyle: { id: 'pixel', name: 'Pixel' },
    selectedTradition: { id: 'thoth', name: 'Thoth' },
    semanticConfig: {
      schemaId: 'grimoire.semantic.config',
      schemaVersion: 1,
      tarotSystem: 'thoth',
      correspondenceProfile: 'thoth_native',
      relationMethod: 'crowley_lxxviii_dignities',
      interpretiveLenses: [],
      ritualTheme: 'none',
      readingDepth: 'adept',
    },
    deck: deckLayer ? [{ ...cards[0], ...deckLayer }] : [],
    oracleQuestion: question,
    reading: {
      cards,
      answer,
      semanticContract: {
        contractId: 'grimoire.tarot.semantic.v1',
        contractVersion: '1.0.0',
        commit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
      },
      readingRecord,
    },
    isForging: false,
    isConsulting: false,
    archiveState: 'IDLE',
    archiveProgress: { current: 0, total: 0, msg: '' },
  };
};

describe('0.49 Reliquary continuity', () => {
  it('survives a hard-refresh-equivalent reload with an exact historical ReadingRecord', async () => {
    const storageBacking = new Map();
    const imageBacking = new Map();
    const original = readingState({ savedLayer: { imageUrl: 'data:image/png;base64,QA49' } });
    const originalRecord = JSON.parse(JSON.stringify(original.reading.readingRecord));

    const saved = await saveReliquaryReading({
      state: original,
      storage: storageOver(storageBacking),
      imageStore: imagesOver(imageBacking),
      savedAt: '2026-08-20T00:00:00.000Z',
    });
    expect(saved.saved).toBe(true);

    // New wrapper instances simulate a page/app process re-entry while the
    // browser's persisted localStorage + IndexedDB backing data remains.
    const restored = await loadReliquary({
      storage: storageOver(storageBacking),
      imageStore: imagesOver(imageBacking),
    });

    expect(restored.status).toBe('RESTORED');
    expect(restored.entries).toHaveLength(1);
    expect(restored.entries[0].state.reading.readingRecord).toEqual(originalRecord);
    expect(restored.entries[0].state.reading.cards[0].imageUrl).toBe('data:image/png;base64,QA49');
  });

  it('reseals the same reading as one newer memory and preserves current live relic layers', async () => {
    const storageBacking = new Map();
    const imageBacking = new Map();
    const storage = storageOver(storageBacking);
    const imageStore = imagesOver(imageBacking);

    await saveReliquaryReading({
      state: readingState(),
      storage,
      imageStore,
      savedAt: '2026-08-20T00:00:00.000Z',
    });
    await saveReliquaryReading({
      state: readingState({
        answer: 'A later interpretation',
        deckLayer: { patina: 8, exegesis: 'Current live relic layer' },
      }),
      storage,
      imageStore,
      savedAt: '2026-08-20T01:00:00.000Z',
    });

    const restored = await loadReliquary({ storage, imageStore });
    expect(restored.entries).toHaveLength(1);
    expect(restored.entries[0].savedAt).toBe('2026-08-20T01:00:00.000Z');
    expect(restored.entries[0].metadata.interpretationPresent).toBe(true);
    expect(restored.entries[0].state.reading.cards[0].patina).toBe(8);
    expect(restored.entries[0].state.reading.cards[0].exegesis).toBe('Current live relic layer');
  });

  it('forgets only the targeted memory', async () => {
    const storageBacking = new Map();
    const imageBacking = new Map();
    const storage = storageOver(storageBacking);
    const imageStore = imagesOver(imageBacking);

    await saveReliquaryReading({ state: readingState({ question: 'First memory?' }), storage, imageStore, savedAt: '2026-08-20T00:00:00.000Z' });
    await saveReliquaryReading({ state: readingState({ question: 'Second memory?' }), storage, imageStore, savedAt: '2026-08-20T01:00:00.000Z' });
    const before = await loadReliquary({ storage, imageStore });
    expect(before.entries).toHaveLength(2);

    const target = before.entries.find(item => item.metadata.question === 'First memory?');
    const result = await removeReliquaryEntry({ entryId: target.entryId, storage });
    expect(result).toEqual(expect.objectContaining({ status: 'REMOVED', removed: true }));

    const after = await loadReliquary({ storage, imageStore });
    expect(after.entries).toHaveLength(1);
    expect(after.entries[0].metadata.question).toBe('Second memory?');
  });

  it('fails soft on a corrupt local Reliquary index', async () => {
    const storageBacking = new Map([[RELIQUARY_STORAGE_KEY, '{not-json']]);
    const restored = await loadReliquary({
      storage: storageOver(storageBacking),
      imageStore: imagesOver(new Map()),
    });
    expect(restored.status).toBe('CORRUPT');
    expect(restored.entries).toEqual([]);
    expect(restored.error).toContain('valid JSON');
  });

  it('keeps the newest 64 distinct memories deterministically', async () => {
    const storageBacking = new Map();
    const imageBacking = new Map();
    const storage = storageOver(storageBacking);
    const imageStore = imagesOver(imageBacking);

    for (let index = 0; index < RELIQUARY_MAX_ENTRIES + 1; index += 1) {
      await saveReliquaryReading({
        state: readingState({ question: `Memory ${index}` }),
        storage,
        imageStore,
        savedAt: new Date(Date.UTC(2026, 7, 20, 0, index)).toISOString(),
      });
    }

    const restored = await loadReliquary({ storage, imageStore });
    expect(restored.entries).toHaveLength(RELIQUARY_MAX_ENTRIES);
    expect(restored.entries[0].metadata.question).toBe(`Memory ${RELIQUARY_MAX_ENTRIES}`);
    expect(restored.entries.at(-1).metadata.question).toBe('Memory 1');
    expect(restored.entries.some(item => item.metadata.question === 'Memory 0')).toBe(false);
  });
});
