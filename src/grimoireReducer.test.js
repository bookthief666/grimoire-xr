import { describe, expect, it } from 'vitest';
import { grimoireReducer, initialState } from './App.jsx';

describe('grimoireReducer mobile regression coverage', () => {
  it('returns from the Oracle without discarding forged card data', () => {
    const forgedCard = { id: 0, name: 'The First Gate', imageUrl: 'data:image/png;base64,abc', exegesis: 'Kept' };
    const state = { ...initialState, phase: 'ORACLE', deck: [forgedCard], reading: { answer: 'Answer' } };

    const next = grimoireReducer(state, { type: 'RETURN_TO_SCRIPTORIUM' });

    expect(next.phase).toBe('SCRIPTORIUM');
    expect(next.deck).toEqual([forgedCard]);
    expect(next.reading).toBeNull();
  });

  it('clears the Oracle loading state after an API failure', () => {
    const state = { ...initialState, isConsulting: true };
    expect(grimoireReducer(state, { type: 'CONSULT_ORACLE_FAILURE' }).isConsulting).toBe(false);
  });

  it('places card ID zero into a spread slot', () => {
    const state = { ...initialState, placementCardId: 0 };
    const next = grimoireReducer(state, { type: 'PLACE_CARD_IN_SLOT', payload: 1 });

    expect(next.spreadSlots).toEqual([null, 0, null]);
    expect(next.placementCardId).toBeNull();
  });

  it('constructs ritual deck identity canonically and ignores injected model card names', () => {
    const injected = Array.from({ length: 78 }, (_, index) => `MODEL INVENTED ${77 - index}`);
    const state = {
      ...initialState,
      selectedTradition: { id: 'thoth', name: 'Book of Thoth' },
      author: 'QA',
    };
    const next = grimoireReducer(state, {
      type: 'RITUAL_SUCCESS',
      payload: {
        dossier: 'Dossier',
        cards: injected,
        questions: ['One?', 'Two?', 'Three?'],
        portrait: null,
      },
    });

    expect(next.deck).toHaveLength(78);
    expect(next.deck[0]).toMatchObject({ id: 0, canonicalCardId: 'major.fool', name: 'THE FOOL' });
    expect(next.deck[1]).toMatchObject({ id: 1, canonicalCardId: 'major.magician', name: 'THE MAGUS' });
    expect(next.deck[8]).toMatchObject({ id: 8, canonicalCardId: 'major.fortitude', name: 'LUST' });
    expect(next.deck.some(card => injected.includes(card.name))).toBe(false);
  });
});
