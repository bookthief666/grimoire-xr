import type { ChamberId, ChamberPreviewArtifact } from './types'

/**
 * Verified visual identity for every registered chamber bay.
 *
 * Keeping this contract in a dependency-light module lets deterministic tests
 * cover the complete mapping without importing React/Three chamber components.
 */
export const CHAMBER_PREVIEW_ARTIFACTS = {
  sanctum: 'solar-forge',
  cell: 'permutation-axis',
  monad: 'monas-construction',
  chapel: 'chapter-tree',
} as const satisfies Readonly<Record<ChamberId, ChamberPreviewArtifact>>
