import { describe, expect, it } from 'vitest';
import {
  TAROT_QA_FIXTURE_IDS,
  TAROT_QA_FIXTURES,
  buildTarotQaSnapshot,
} from './qaFixtures.js';

describe('0.35.1 deterministic Tarot QA fixtures', () => {
  it('exposes exactly the bounded semantic regression fixtures', () => {
    expect(TAROT_QA_FIXTURE_IDS).toEqual(['three-aces', 'major-gap']);
    expect(Object.keys(TAROT_QA_FIXTURES)).toEqual(TAROT_QA_FIXTURE_IDS);
  });

  it('self-grades the three-Aces sourced dignity fixture as PASS', () => {
    const snapshot = buildTarotQaSnapshot('three-aces');
    expect(snapshot.pass).toBe(true);
    expect(snapshot.providerMode).toBe('PROVIDER_FREE');
    expect(snapshot.cards.map(card => card.cardId)).toEqual([
      'minor.staffs.ace',
      'minor.swords.ace',
      'minor.cups.ace',
    ]);
    expect(snapshot.record.relations.map(relation => relation.relationType)).toEqual([
      'FRIENDLY',
      'FRIENDLY',
    ]);
    expect(snapshot.outer.relationType).toBe('INIMICAL');
    expect(snapshot.center).toMatchObject({
      applied: true,
      effectType: 'CENTER_BETWEEN_CONTRARIES',
    });
    expect(snapshot.record.provenance.relationMethodAuthority).toBe('SOURCE_QUALIFIED_METHOD_INHERITANCE');
  });

  it('self-grades the Major-gap fixture as PASS without inventing a suit family', () => {
    const snapshot = buildTarotQaSnapshot('major-gap');
    expect(snapshot.pass).toBe(true);
    expect(snapshot.cards[1]).toMatchObject({
      cardId: 'major.empress',
      suitFamilyId: null,
    });
    expect(snapshot.record.relations.map(relation => [relation.relationType, relation.reasonCode])).toEqual([
      ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
      ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
    ]);
    expect(snapshot.outer.relationType).toBe('INIMICAL');
  });

  it('produces deterministic signatures for repeatable Fold and VR comparison', () => {
    expect(buildTarotQaSnapshot('three-aces').semanticSignature)
      .toBe(buildTarotQaSnapshot('three-aces').semanticSignature);
    expect(buildTarotQaSnapshot('three-aces').semanticSignature)
      .not.toBe(buildTarotQaSnapshot('major-gap').semanticSignature);
  });

  it('rejects typoed fixture ids rather than silently changing the test', () => {
    expect(() => buildTarotQaSnapshot('three-ace')).toThrow('Unknown Tarot QA fixture');
  });
});
