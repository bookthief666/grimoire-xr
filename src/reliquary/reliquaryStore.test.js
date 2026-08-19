import { describe, expect, it } from 'vitest';
import {
  RELIQUARY_STORAGE_KEY,
  buildReliquaryEntry,
  loadReliquary,
  saveReliquaryReading,
} from './reliquaryStore.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    dump: () => values,
  };
};

const memoryImages = () => {
  const values = new Map();
  return {
    async putMany(records = []) { records.forEach(record => values.set(record.key, record.dataUrl)); },
    async get(key) { return values.get(key) || null; },
  };
};

const readingState = ({ imageUrl = null, answer = '' } = {}) => ({
  phase: 'ORACLE',
  author: 'QA',
  selectedStyle: { id: 'pixel', name: 'Pixel' },
  selectedTradition: { id: 'thoth', name: 'Thoth' },
  deck: [],
  oracleQuestion: 'Does the Grimoire remember?',
  reading: {
    cards: [
      { id: 'minor.staffs.ace', name: 'Ace of Wands', imageUrl },
      { id: 'minor.swords.ace', name: 'Ace of Swords', imageUrl: null },
      { id: 'minor.cups.ace', name: 'Ace of Cups', imageUrl: null },
    ],
    answer,
    semanticContract: { contractId: 'grimoire.tarot.semantic.v1', contractVersion: '1.0.0', commit: 'f4534b4' },
    readingRecord: {
      spreadId: 'grimoire.triad.dialectic',
      input: { question: 'Does the Grimoire remember?', tarotSystem: 'thoth' },
      positions: [
        { positionId: 'thesis', cardId: 'minor.staffs.ace', orientation: 'upright' },
        { positionId: 'antithesis', cardId: 'minor.swords.ace', orientation: 'upright' },
        { positionId: 'synthesis', cardId: 'minor.cups.ace', orientation: 'upright' },
      ],
      relations: [
        { relationType: 'FRIENDLY' },
        { relationType: 'FRIENDLY' },
      ],
      spreadPatterns: [
        { patternKind: 'OUTER_PAIR_CONTEXT', relationType: 'INIMICAL' },
        { patternKind: 'CENTER_CONTEXT_EFFECT', applied: true },
      ],
    },
  },
  isForging: false,
  isConsulting: false,
  archiveState: 'IDLE',
  archiveProgress: { current: 0, total: 0, msg: '' },
});

describe('reliquary store', () => {
  it('builds a stable reading identity and strips embedded image payloads from the snapshot', () => {
    const image = 'data:image/png;base64,AAAA';
    const built = buildReliquaryEntry({ state: readingState({ imageUrl: image }), savedAt: '2026-08-19T00:00:00.000Z' });
    expect(built.entry.entryId).toMatch(/^reading-/);
    expect(built.entry.metadata.positionCardIds).toEqual(['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace']);
    expect(built.images).toHaveLength(1);
    expect(JSON.stringify(built.entry)).not.toContain('data:image/');
  });

  it('upserts the same reading instead of duplicating it', async () => {
    const storage = memoryStorage();
    const imageStore = memoryImages();
    await saveReliquaryReading({ state: readingState(), storage, imageStore, savedAt: '2026-08-19T00:00:00.000Z' });
    await saveReliquaryReading({ state: readingState({ answer: 'New interpretation' }), storage, imageStore, savedAt: '2026-08-19T01:00:00.000Z' });
    const raw = JSON.parse(storage.getItem(RELIQUARY_STORAGE_KEY));
    expect(raw.entries).toHaveLength(1);
    expect(raw.entries[0].savedAt).toBe('2026-08-19T01:00:00.000Z');
    expect(raw.entries[0].metadata.interpretationPresent).toBe(true);
  });

  it('hydrates artwork while preserving semantics', async () => {
    const storage = memoryStorage();
    const imageStore = memoryImages();
    const image = 'data:image/png;base64,BBBB';
    await saveReliquaryReading({ state: readingState({ imageUrl: image }), storage, imageStore });
    const restored = await loadReliquary({ storage, imageStore });
    expect(restored.status).toBe('RESTORED');
    expect(restored.entries[0].state.reading.cards[0].imageUrl).toBe(image);
    expect(restored.entries[0].state.reading.readingRecord.positions[0].cardId).toBe('minor.staffs.ace');
  });

  it('fails soft when artwork is unavailable', async () => {
    const storage = memoryStorage();
    const imageStore = memoryImages();
    await saveReliquaryReading({ state: readingState({ imageUrl: 'data:image/png;base64,CCCC' }), storage, imageStore });
    const emptyImages = { async get() { return null; }, async putMany() {} };
    const restored = await loadReliquary({ storage, imageStore: emptyImages });
    expect(restored.status).toBe('RESTORED_WITH_MISSING_IMAGES');
    expect(restored.entries[0].state.reading.cards[0].imageUrl).toBeNull();
    expect(restored.entries[0].state.reading.readingRecord.positions[0].cardId).toBe('minor.staffs.ace');
  });
});
