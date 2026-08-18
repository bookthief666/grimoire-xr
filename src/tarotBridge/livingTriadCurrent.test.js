import { describe, expect, it } from 'vitest';
import { buildTarotQaSnapshot } from './qaFixtures.js';
import {
  LIVING_TRIAD_CURRENT_AUTHORITY,
  LIVING_TRIAD_TRACE_KINDS,
  buildLivingTriadCurrentModel,
  nextLivingTriadRevealCount,
  nextLivingTriadStep,
  readingRecordSignature,
  visibleLivingTriadSteps,
} from './livingTriadCurrent.js';

const readingFromSnapshot = snapshot => ({
  readingRecord: snapshot.record,
  cards: snapshot.cards.map(card => ({
    canonicalCardId: card.cardId,
    name: card.thothDisplayName,
  })),
});

describe('0.41 living triad current model', () => {
  it('reads the Three Aces current directly from the canonical ReadingRecord', () => {
    const snapshot = buildTarotQaSnapshot('three-aces');
    const model = buildLivingTriadCurrentModel({ reading: readingFromSnapshot(snapshot) });

    expect(model.available).toBe(true);
    expect(model.presentationAuthority).toBe(LIVING_TRIAD_CURRENT_AUTHORITY);
    expect(model.positions.map(position => position.cardId)).toEqual([
      'minor.staffs.ace',
      'minor.swords.ace',
      'minor.cups.ace',
    ]);
    expect(model.steps.map(step => step.kind)).toEqual([
      LIVING_TRIAD_TRACE_KINDS.immediate,
      LIVING_TRIAD_TRACE_KINDS.immediate,
      LIVING_TRIAD_TRACE_KINDS.outer,
      LIVING_TRIAD_TRACE_KINDS.center,
    ]);
    expect(model.steps[0].relationType).toBe('FRIENDLY');
    expect(model.steps[1].relationType).toBe('FRIENDLY');
    expect(model.steps[2].relationType).toBe('INIMICAL');
    expect(model.steps[3]).toMatchObject({
      applied: true,
      effectType: 'CENTER_BETWEEN_CONTRARIES',
    });
    expect(model.relationMethodAuthority).toBe('SOURCE_QUALIFIED_METHOD_INHERITANCE');
  });

  it('preserves Major-gap UNSPECIFIED edges instead of inventing a suit family', () => {
    const snapshot = buildTarotQaSnapshot('major-gap');
    const model = buildLivingTriadCurrentModel({ reading: readingFromSnapshot(snapshot) });

    expect(model.available).toBe(true);
    expect(model.steps[0]).toMatchObject({
      relationType: 'UNSPECIFIED',
      reasonCode: 'CARD_WITHOUT_SUIT_FAMILY',
    });
    expect(model.steps[1]).toMatchObject({
      relationType: 'UNSPECIFIED',
      reasonCode: 'CARD_WITHOUT_SUIT_FAMILY',
    });
    expect(model.steps[2].relationType).toBe('INIMICAL');
    expect(model.steps[3].effectType).toBe('CENTER_BETWEEN_CONTRARIES');
  });

  it('reveals the current in a deterministic four-step sequence and seals after completion', () => {
    const model = buildLivingTriadCurrentModel({ reading: readingFromSnapshot(buildTarotQaSnapshot('three-aces')) });

    expect(visibleLivingTriadSteps(model, 0)).toEqual([]);
    expect(nextLivingTriadStep(model, 0)?.stepId).toBe('immediate-1');
    expect(nextLivingTriadRevealCount(model, 0)).toBe(1);
    expect(nextLivingTriadStep(model, 1)?.stepId).toBe('immediate-2');
    expect(nextLivingTriadRevealCount(model, 1)).toBe(2);
    expect(nextLivingTriadStep(model, 2)?.stepId).toBe('outer-pair');
    expect(nextLivingTriadRevealCount(model, 2)).toBe(3);
    expect(nextLivingTriadStep(model, 3)?.stepId).toBe('center-effect');
    expect(nextLivingTriadRevealCount(model, 3)).toBe(4);
    expect(nextLivingTriadStep(model, 4)).toBeNull();
    expect(nextLivingTriadRevealCount(model, 4)).toBe(0);
  });

  it('does not mutate the ReadingRecord while building or revealing presentation state', () => {
    const snapshot = buildTarotQaSnapshot('three-aces');
    const before = readingRecordSignature(snapshot.record);
    const model = buildLivingTriadCurrentModel({ reading: readingFromSnapshot(snapshot), reducedMotion: true });

    visibleLivingTriadSteps(model, 4);
    nextLivingTriadRevealCount(model, 4);

    expect(model.reducedMotion).toBe(true);
    expect(readingRecordSignature(snapshot.record)).toBe(before);
  });

  it('fails closed when no canonical ReadingRecord is attached', () => {
    const model = buildLivingTriadCurrentModel({ reading: { cards: [] } });
    expect(model.available).toBe(false);
    expect(model.reasonCode).toBe('READING_RECORD_MISSING');
    expect(model.steps).toEqual([]);
  });
});
