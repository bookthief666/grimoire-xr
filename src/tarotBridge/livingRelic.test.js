import { describe, expect, it } from 'vitest';
import { buildCanonicalDeckGenesis } from './canonicalDeckGenesis.js';
import {
  LIVING_RELIC_PHASES,
  LIVING_RELIC_PRESENTATION_AUTHORITY,
  RELIC_ATTUNE_HOLD_MS,
  RELIC_MOVE_CANCEL_PX,
  buildLivingRelicModel,
  livingRelicIdentitySignature,
  livingRelicRevealSummary,
  shouldCancelRelicAttunement,
} from './livingRelic.js';

const thothTwoOfWands = () => ({
  ...buildCanonicalDeckGenesis({ tradition: 'thoth' })[23],
  patina: 7,
});

describe('0.40 living relic interaction contract', () => {
  it('keeps attunement ephemeral around a stable canonical card identity', () => {
    const card = thothTwoOfWands();
    const before = structuredClone(card);
    const model = buildLivingRelicModel({ card, tradition: 'thoth' });

    expect(model.cardId).toBe('minor.staffs.two');
    expect(model.displayName).toBe('TWO OF WANDS');
    expect(model.sourceQualification).toBe('SOURCE_QUALIFIED');
    expect(livingRelicIdentitySignature(model)).toContain(':minor.staffs.two');
    expect(card).toEqual(before);
  });

  it('reveals only already-canonical Thoth context for the Two of Wands fixture', () => {
    const model = buildLivingRelicModel({ card: thothTwoOfWands(), tradition: 'thoth' });
    expect(model.reveal).toMatchObject({
      nativeTitle: 'DOMINION',
      suitElement: 'FIRE',
      planet: 'MARS',
      zodiacSign: 'ARIES',
    });
    expect(model.revealEligible).toBe(true);
    expect(livingRelicRevealSummary(model)).toEqual(expect.arrayContaining([
      ['TITLE', 'DOMINION'],
      ['ELEMENT', 'FIRE'],
      ['PLANET', 'MARS'],
      ['SIGN', 'ARIES'],
    ]));
  });

  it('marks interaction effects as project-authored presentation rather than source facts', () => {
    const model = buildLivingRelicModel({ card: thothTwoOfWands(), tradition: 'thoth' });
    expect(model.presentationAuthority).toBe(LIVING_RELIC_PRESENTATION_AUTHORITY);
    expect(model.presentationAuthority).toContain('NOT_SOURCE_FACT');
  });

  it('uses a deterministic hold threshold and cancels when movement becomes a swipe', () => {
    expect(RELIC_ATTUNE_HOLD_MS).toBe(700);
    expect(RELIC_MOVE_CANCEL_PX).toBe(18);
    expect(shouldCancelRelicAttunement({ startX: 100, startY: 100, currentX: 110, currentY: 105 })).toBe(false);
    expect(shouldCancelRelicAttunement({ startX: 100, startY: 100, currentX: 140, currentY: 100 })).toBe(true);
  });

  it('preserves reveal semantics under reduced motion while switching to a static presentation profile', () => {
    const animated = buildLivingRelicModel({ card: thothTwoOfWands(), tradition: 'thoth', reducedMotion: false });
    const reduced = buildLivingRelicModel({ card: thothTwoOfWands(), tradition: 'thoth', reducedMotion: true });
    expect(animated.motionProfile).toBe('RITUAL_PULSE');
    expect(reduced.motionProfile).toBe('REDUCED_STATIC');
    expect(reduced.reveal).toEqual(animated.reveal);
    expect(livingRelicIdentitySignature(reduced)).toBe(livingRelicIdentitySignature(animated));
  });

  it('retains explicit interaction phase names for UI and QA surfaces', () => {
    expect(LIVING_RELIC_PHASES).toEqual({ idle: 'IDLE', attuning: 'ATTUNING', revealed: 'REVEALED' });
  });

  it('does not invent correspondence facts for traditions without a reviewed source pack', () => {
    const card = buildCanonicalDeckGenesis({ tradition: 'rws' })[23];
    const model = buildLivingRelicModel({ card, tradition: 'rws' });
    expect(model.sourceQualification).toBe('SOURCE_PACK_PENDING');
    expect(model.reveal.suitElement).toBeNull();
    expect(model.reveal.planet).toBeNull();
    expect(model.reveal.zodiacSign).toBeNull();
    expect(model.revealEligible).toBe(false);
  });
});
