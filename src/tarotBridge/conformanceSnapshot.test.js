import { describe, expect, it } from 'vitest';
import {
  CONFORMANCE_SNAPSHOT_SCHEMA_ID,
  FOLD_047_FREEZE_COMMIT,
  buildFoldConformanceFixture,
  buildFoldConformanceParityCore,
  buildFoldConformanceSnapshot,
  countFoldSourceClaimCoverage,
  stringifyFoldConformanceSnapshot,
  validateFoldConformanceSnapshot,
} from './conformanceSnapshot.js';

describe('0.48 Fold conformance snapshot', () => {
  it('is pinned to the exact accepted 0.47 freeze and authoritative VR contract', () => {
    const snapshot = buildFoldConformanceSnapshot();
    expect(snapshot.snapshotSchemaId).toBe(CONFORMANCE_SNAPSHOT_SCHEMA_ID);
    expect(snapshot.producer.baselineCommit).toBe(FOLD_047_FREEZE_COMMIT);
    expect(snapshot.producer.baselineCommit).toBe('d6a57e68d08a7c9592d9f299b93eae9192667b28');
    expect(snapshot.parityCore.contract).toEqual({
      authorityCommit: 'f4534b4f92d88f3950ec0c9c211bfa4648cd08ea',
      authorityRepository: 'bookthief666/tarot-archetype-vr',
      contractId: 'grimoire.tarot.semantic.v1',
      contractVersion: '1.0.0',
    });
  });

  it('emits exactly 78 deterministic canonical identities in legacy order', () => {
    const core = buildFoldConformanceParityCore();
    expect(core.cards).toHaveLength(78);
    expect(new Set(core.cards.map(card => card.cardId)).size).toBe(78);
    core.cards.forEach((card, index) => expect(card.legacyIndex).toBe(index));
    expect(core.cards[1].cardId).toBe('major.magician');
    expect(core.cards[22].cardId).toBe('minor.staffs.ace');
    expect(core.cards[77].cardId).toBe('minor.coins.king');
  });

  it('makes source-claim omission observable rather than silently normalizing it away', () => {
    const core = buildFoldConformanceParityCore();
    const magus = core.cards.find(card => card.cardId === 'major.magician');
    expect(magus.thoth.fields.displayName.sourceIds).toContain('src.primary.crowley-harris.thoth-deck.usgames');
    expect(Array.isArray(magus.thoth.fields.displayName.claimIds)).toBe(true);
    const coverage = countFoldSourceClaimCoverage();
    expect(coverage.totalFields).toBeGreaterThan(0);
    expect(coverage.fieldsWithClaims + coverage.fieldsWithoutClaims).toBe(coverage.totalFields);
  });

  it('locks Three Aces and Major-gap semantics without presentation state', () => {
    const aces = buildFoldConformanceFixture('thoth-three-aces');
    expect(aces.cardIds).toEqual(['minor.staffs.ace', 'minor.swords.ace', 'minor.cups.ace']);
    expect(aces.relations.map(relation => relation.relationType)).toEqual(['FRIENDLY', 'FRIENDLY']);
    expect(aces.spreadPatterns.find(pattern => pattern.patternKind === 'OUTER_PAIR_CONTEXT')?.relationType).toBe('INIMICAL');
    expect(aces.spreadPatterns.find(pattern => pattern.patternKind === 'CENTER_CONTEXT_EFFECT')?.effectType).toBe('CENTER_BETWEEN_CONTRARIES');

    const gap = buildFoldConformanceFixture('thoth-major-gap');
    expect(gap.relations.map(relation => [relation.relationType, relation.reasonCode])).toEqual([
      ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
      ['UNSPECIFIED', 'CARD_WITHOUT_SUIT_FAMILY'],
    ]);

    const serialized = stringifyFoldConformanceSnapshot();
    expect(serialized).not.toContain('imageUrl');
    expect(serialized).not.toContain('ComfyUI');
    expect(serialized).not.toContain('camera');
    expect(serialized).not.toContain('enchantment');
  });

  it('is canonically serialized and repeatable', () => {
    expect(stringifyFoldConformanceSnapshot({ coreOnly: true })).toBe(
      stringifyFoldConformanceSnapshot({ coreOnly: true }),
    );
  });

  it('passes its internal contract validator without pretending cross-repo equality is already proven', () => {
    expect(validateFoldConformanceSnapshot()).toEqual([]);
  });
});
