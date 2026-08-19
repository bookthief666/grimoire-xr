import { describe, expect, it } from 'vitest';
import { buildReliquarySnapshot } from './reliquaryStore.js';

describe('reliquary live relic layers', () => {
  it('uses the current deck copy for a kept reading without storing the whole deck', () => {
    const readingCard = {
      id: 'minor.staffs.ace',
      canonicalCardId: 'minor.staffs.ace',
      name: 'ACE OF WANDS',
      patina: 0,
      imageUrl: null,
    };
    const currentDeckCard = {
      ...readingCard,
      patina: 4,
      imageUrl: 'data:image/png;base64,TElWRVJFTE= ',
      exegesis: 'A later manifested layer.',
    };
    const snapshot = buildReliquarySnapshot({
      phase: 'ORACLE',
      author: 'QA',
      selectedStyle: { id: 'qa', name: 'QA' },
      selectedTradition: { id: 'thoth', name: 'Thoth' },
      deck: [currentDeckCard],
      reading: {
        cards: [readingCard],
        readingRecord: {
          spreadId: 'grimoire.triad.dialectic',
          input: { question: 'What changed?', tarotSystem: 'thoth' },
          positions: [{ positionId: 'thesis', cardId: 'minor.staffs.ace', orientation: 'upright' }],
          relations: [],
          spreadPatterns: [],
        },
      },
    });

    expect(snapshot).not.toHaveProperty('deck');
    expect(snapshot.reading.cards[0]).toMatchObject({
      id: 'minor.staffs.ace',
      patina: 4,
      exegesis: 'A later manifested layer.',
    });
  });
});
