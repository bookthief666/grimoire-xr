import { describe, expect, it } from 'vitest';
import { buildReliquaryPresentation, RELIQUARY_PRESENTATION_AUTHORITY } from './reliquaryPresentation.js';

describe('reliquary presentation', () => {
  it('derives recurrence only from kept reading history', () => {
    const model = buildReliquaryPresentation([
      {
        entryId: 'a', savedAt: '2026-08-19T00:00:00Z',
        metadata: {
          question: 'First',
          positionCardIds: ['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace'],
          positionTitles: ['Ace of Wands', 'Ace of Swords', 'Ace of Cups'],
          relationTypes: ['FRIENDLY', 'FRIENDLY'], outerRelationType: 'INIMICAL',
        },
      },
      {
        entryId: 'b', savedAt: '2026-08-19T01:00:00Z',
        metadata: {
          question: 'Second',
          positionCardIds: ['minor.staffs.ace', 'minor.disks.two', 'major.0'],
          positionTitles: ['Ace of Wands', 'Two of Disks', 'The Fool'],
          relationTypes: ['UNSPECIFIED', 'UNSPECIFIED'], outerRelationType: 'UNSPECIFIED',
        },
      },
    ]);

    expect(model.authority).toBe(RELIQUARY_PRESENTATION_AUTHORITY);
    expect(model.returningRelics).toEqual([
      expect.objectContaining({ cardId: 'minor.staffs.ace', title: 'Ace of Wands', appearances: 2 }),
    ]);
    expect(model.memories[0].relationSignature).toEqual(['FRIENDLY', 'FRIENDLY', 'OUTER CONTRARY']);
  });

  it('does not manufacture recurrence for one-off cards', () => {
    const model = buildReliquaryPresentation([
      { entryId: 'a', metadata: { positionCardIds: ['major.0'], positionTitles: ['The Fool'], relationTypes: [] } },
    ]);
    expect(model.returningRelics).toHaveLength(0);
  });
});
