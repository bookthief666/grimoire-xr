import { describe, expect, it } from 'vitest';
import {
  RETURNING_READER_AUTHORITY,
  buildReturningReaderModel,
  buildReturningRelicSelection,
} from './returningReaderModel.js';

const entry = ({
  entryId,
  savedAt,
  question,
  cardIds,
  cardTitles,
} = {}) => ({
  entryId,
  savedAt,
  metadata: {
    question,
    positionCardIds: cardIds,
    positionTitles: cardTitles,
    relationTypes: ['FRIENDLY', 'FRIENDLY'],
    outerRelationType: 'INIMICAL',
  },
});

describe('0.49 returning reader model', () => {
  it('keeps a fresh reader surface empty when no memories exist', () => {
    const model = buildReturningReaderModel([]);
    expect(model.authority).toBe(RETURNING_READER_AUTHORITY);
    expect(model.hasMemories).toBe(false);
    expect(model.count).toBe(0);
    expect(model.latestMemory).toBeNull();
  });

  it('selects the newest kept reading without relying on incoming array order', () => {
    const older = entry({
      entryId: 'older',
      savedAt: '2026-08-19T20:00:00.000Z',
      question: 'Older question',
      cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
      cardTitles: ['Ace of Wands', 'Ace of Swords', 'Ace of Cups'],
    });
    const newer = entry({
      entryId: 'newer',
      savedAt: '2026-08-19T22:00:00.000Z',
      question: 'Newer question',
      cardIds: ['major.empress', 'minor.coins.two', 'minor.staffs.ace'],
      cardTitles: ['The Empress', 'Two of Disks', 'Ace of Wands'],
    });

    const model = buildReturningReaderModel([older, newer]);
    expect(model.hasMemories).toBe(true);
    expect(model.count).toBe(2);
    expect(model.latestMemory.entryId).toBe('newer');
    expect(model.latestMemory.question).toBe('Newer question');
  });

  it('derives recurring-card navigation only from kept-reading history', () => {
    const entries = [
      entry({
        entryId: 'a',
        savedAt: '2026-08-19T20:00:00.000Z',
        question: 'First',
        cardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
        cardTitles: ['Ace of Wands', 'Ace of Swords', 'Ace of Cups'],
      }),
      entry({
        entryId: 'b',
        savedAt: '2026-08-19T21:00:00.000Z',
        question: 'Second',
        cardIds: ['minor.staffs.ace', 'minor.coins.two', 'major.empress'],
        cardTitles: ['Ace of Wands', 'Two of Disks', 'The Empress'],
      }),
      entry({
        entryId: 'c',
        savedAt: '2026-08-19T22:00:00.000Z',
        question: 'Third',
        cardIds: ['minor.cups.two', 'minor.swords.two', 'minor.coins.three'],
        cardTitles: ['Two of Cups', 'Two of Swords', 'Three of Disks'],
      }),
    ];

    const model = buildReturningReaderModel(entries);
    expect(model.returningRelics).toEqual([
      expect.objectContaining({ cardId: 'minor.staffs.ace', appearances: 2 }),
    ]);

    const selected = buildReturningRelicSelection({ entries, cardId: 'minor.staffs.ace' });
    expect(selected.authority).toBe(RETURNING_READER_AUTHORITY);
    expect(selected.count).toBe(2);
    expect(selected.memories.map(memory => memory.entryId)).toEqual(['b', 'a']);
    expect(selected.memories.every(memory => memory.cardIds.includes('minor.staffs.ace'))).toBe(true);
  });

  it('clears recurrence filtering without changing memory order', () => {
    const entries = [
      entry({ entryId: 'a', savedAt: '2026-08-19T20:00:00.000Z', question: 'A', cardIds: ['major.empress'], cardTitles: ['The Empress'] }),
      entry({ entryId: 'b', savedAt: '2026-08-19T22:00:00.000Z', question: 'B', cardIds: ['minor.staffs.ace'], cardTitles: ['Ace of Wands'] }),
    ];
    const selected = buildReturningRelicSelection({ entries, cardId: null });
    expect(selected.selectedCardId).toBeNull();
    expect(selected.memories.map(memory => memory.entryId)).toEqual(['b', 'a']);
  });
});
