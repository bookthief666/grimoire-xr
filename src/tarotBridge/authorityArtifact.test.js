import { describe, expect, it } from 'vitest';
import {
  PINNED_TAROT_AUTHORITY,
  renderAuthorityCardManifestModule,
  summarizeAuthorityParityCore,
  validateAuthorityParityCore,
} from './authorityArtifact.js';

const buildCore = () => ({
  contract: { ...PINNED_TAROT_AUTHORITY },
  cards: Array.from({ length: 78 }, (_, legacyIndex) => ({
    legacyIndex,
    cardId: `qa.card.${legacyIndex}`,
    arcana: legacyIndex < 22 ? 'major' : 'minor',
    familyId: `family-${legacyIndex}`,
    suitFamilyId: legacyIndex < 22 ? null : 'staffs',
    rankId: legacyIndex < 22 ? null : 'ace',
    rankClass: legacyIndex < 22 ? null : 'pip',
    thoth: {
      expressionCoverage: 'FULL',
      fallbackUsed: false,
      fields: {
        displayName: {
          value: `CARD ${legacyIndex}`,
          semanticStatus: 'CANONICAL',
          authority: 'SOURCE_PACK_VERIFIED',
          sourceIds: ['src.qa'],
          claimIds: [`claim.qa.${legacyIndex}`],
        },
      },
      correspondences: {},
    },
  })),
});

describe('0.48 authoritative card-manifest artifact', () => {
  it('accepts only the exact pinned contract and 78-card bijection', () => {
    const core = buildCore();
    expect(validateAuthorityParityCore(core)).toEqual([]);
    core.contract.authorityCommit = 'wrong';
    expect(validateAuthorityParityCore(core).join(' ')).toContain('authorityCommit');
  });

  it('rejects presentation contamination', () => {
    const core = buildCore();
    core.cards[0].imageUrl = 'data:image/png;base64,qa';
    expect(validateAuthorityParityCore(core).join(' ')).toContain('imageUrl');
  });

  it('summarizes claim coverage without requiring every field to have claims', () => {
    const summary = summarizeAuthorityParityCore(buildCore());
    expect(summary.cards).toBe(78);
    expect(summary.totalSourceFields).toBe(78);
    expect(summary.fieldsWithClaims).toBe(78);
  });

  it('renders deterministic JS rather than hand-authored doctrine', () => {
    const core = buildCore();
    const first = renderAuthorityCardManifestModule(core);
    const second = renderAuthorityCardManifestModule(core);
    expect(first).toBe(second);
    expect(first).toContain('GENERATED FILE — DO NOT HAND EDIT');
    expect(first).toContain(PINNED_TAROT_AUTHORITY.authorityCommit);
    expect(first).toContain('AUTHORITATIVE_CARD_MANIFEST');
  });
});
