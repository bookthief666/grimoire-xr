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
});
