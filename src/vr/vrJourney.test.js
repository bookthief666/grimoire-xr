import { describe, expect, it } from 'vitest';
import { buildCourtJourney, COURT_JOURNEY_IDS } from './vrJourney.js';

describe('seven-court guided circuit', () => {
  it('keeps a complete planetary journey in ritual order', () => {
    expect(COURT_JOURNEY_IDS).toEqual([
      'scriptorium',
      'loom',
      'genius',
      'forge',
      'oracle',
      'spirit',
      'archive',
    ]);
    const journey = buildCourtJourney();
    expect(journey.courts).toHaveLength(7);
    expect(new Set(journey.courts.map(court => court.planet)).size).toBe(7);
  });

  it('points to the first unfinished court while accepting progress out of order', () => {
    const journey = buildCourtJourney(['oracle', 'scriptorium', 'oracle', 'not-a-court']);
    expect(journey.completedCount).toBe(2);
    expect(journey.nextCourt.id).toBe('loom');
    expect(journey.sealed).toBe(false);
  });

  it('seals only when every court has a deliberate completion', () => {
    const journey = buildCourtJourney(COURT_JOURNEY_IDS);
    expect(journey.completedCount).toBe(7);
    expect(journey.nextCourt).toBeNull();
    expect(journey.sealed).toBe(true);
  });
});
