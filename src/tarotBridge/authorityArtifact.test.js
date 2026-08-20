import { describe, expect, it } from 'vitest';
import {
  PINNED_TAROT_AUTHORITY,
  renderAuthorityCardManifestModule,
  renderAuthoritySpreadManifestModule,
  summarizeAuthorityParityCore,
  validateAuthorityParityCore,
  validateAuthoritySpreadManifest,
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
  spreads: {
    TRIAD: {
      spreadId: 'qa.triad',
      version: '1.0.0',
      cardCount: 3,
      semanticStatus: 'CANONICAL_PROJECT',
      positions: ['left', 'center', 'right'].map((positionId, ordinal) => ({ positionId, ordinal, label: positionId.toUpperCase(), questionFunction: null })),
      topology: {
        orderedAdjacency: [['left', 'center'], ['center', 'right']],
        visualEdges: [['left', 'center'], ['left', 'right'], ['center', 'right']],
      },
    },
    HEXAGRAM: {
      spreadId: 'qa.hexagram',
      version: '1.0.0',
      cardCount: 6,
      semanticStatus: 'PROVISIONAL',
      positions: Array.from({ length: 6 }, (_, ordinal) => ({ positionId: `h${ordinal + 1}`, ordinal, label: `H${ordinal + 1}`, questionFunction: null })),
      topology: { orderedAdjacency: [], visualEdges: [] },
    },
    CROSS: {
      spreadId: 'qa.cross',
      version: '1.0.0',
      cardCount: 10,
      semanticStatus: 'PROVISIONAL',
      positions: Array.from({ length: 10 }, (_, ordinal) => ({ positionId: `c${ordinal + 1}`, ordinal, label: `C${ordinal + 1}`, questionFunction: null })),
      topology: { orderedAdjacency: [], visualEdges: [] },
    },
  },
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

describe('0.48 authoritative spread-manifest artifact', () => {
  it('accepts only the exact pinned contract and TRIAD/HEXAGRAM/CROSS structural manifest', () => {
    const core = buildCore();
    expect(validateAuthoritySpreadManifest(core)).toEqual([]);
    delete core.spreads.HEXAGRAM;
    expect(validateAuthoritySpreadManifest(core).join(' ')).toContain('HEXAGRAM');
  });

  it('rejects invalid topology and presentation contamination', () => {
    const topologyDrift = buildCore();
    topologyDrift.spreads.TRIAD.topology.visualEdges.push(['left', 'missing']);
    expect(validateAuthoritySpreadManifest(topologyDrift).join(' ')).toContain('invalid positions');

    const presentationDrift = buildCore();
    presentationDrift.spreads.TRIAD.imageUrl = 'data:image/png;base64,qa';
    expect(validateAuthoritySpreadManifest(presentationDrift).join(' ')).toContain('imageUrl');
  });

  it('renders deterministic pinned spread JS in stable legacy key order', () => {
    const core = buildCore();
    const first = renderAuthoritySpreadManifestModule(core);
    const second = renderAuthoritySpreadManifestModule(core);
    expect(first).toBe(second);
    expect(first).toContain(PINNED_TAROT_AUTHORITY.authorityCommit);
    expect(first).toContain('AUTHORITATIVE_SPREAD_MANIFEST');
    expect(first.indexOf('"TRIAD"')).toBeLessThan(first.indexOf('"HEXAGRAM"'));
    expect(first.indexOf('"HEXAGRAM"')).toBeLessThan(first.indexOf('"CROSS"'));
  });
});
