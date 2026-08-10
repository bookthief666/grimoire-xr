import {
  CellArchitecture,
  CellInstrument,
  CELL_ACCENT,
} from './CellChamber'
import {
  MonadArchitecture,
  MonadInstrument,
  MONAD_ACCENT,
} from './MonadChamber'
import {
  ChapelArchitecture,
  ChapelInstrument,
  CHAPEL_ACCENT,
} from './ChapelChamber'
import { ABULAFIA_PROVENANCE } from '../../tools/abulafia'
import { MONAS_PROVENANCE } from '../../tools/monas'
import { LIBER333_PROVENANCE } from '../../tools/liber333'
import type { Chamber } from './types'

export const SANCTUM_ACCENT = '#ffb000'

/**
 * Instrument registry: one source of truth for the temple hub.
 *
 * The Sanctum is intentionally different from the authored chambers. It is the
 * network-capable generative workstation bound to the live grimoire engine.
 * Specialized chambers are deterministic/offline instruments with an explicit
 * provenance record; future AI interpretation must sit on top of, never replace,
 * that authored source layer.
 */
export const CHAMBERS: readonly Chamber[] = [
  {
    id: 'sanctum',
    name: 'The Sanctum',
    purpose: 'Forge a deck. Lay a spread. Consult the oracle.',
    seal: '✶',
    accent: SANCTUM_ACCENT,
    previewArtifact: 'solar-forge',
    kind: 'generative-sanctum',
    capabilities: ['gemini', 'comfyui', 'archive'],
    offline: 'partial',
    performanceClass: 'moderate',
  },
  {
    id: 'cell',
    name: 'The Cell',
    purpose: 'Permute the Name. Breathe along the axis.',
    seal: 'א',
    accent: CELL_ACCENT,
    previewArtifact: 'permutation-axis',
    kind: 'authored-instrument',
    capabilities: ['offline-tool', 'breath-pacing', 'spatial-axis'],
    offline: 'full',
    performanceClass: 'light',
    source: ABULAFIA_PROVENANCE,
    Architecture: CellArchitecture,
    Instrument: CellInstrument,
  },
  {
    id: 'monad',
    name: 'The Monad',
    purpose: "Construct Dee's glyph as an explicitly reconstructed spatial sequence.",
    seal: '☿',
    accent: MONAD_ACCENT,
    previewArtifact: 'monas-construction',
    kind: 'authored-instrument',
    capabilities: ['offline-tool', 'source-reading'],
    offline: 'full',
    performanceClass: 'light',
    source: MONAS_PROVENANCE,
    Architecture: MonadArchitecture,
    Instrument: MonadInstrument,
  },
  {
    id: 'chapel',
    name: 'The Chapel of Lies',
    purpose: 'Draw deterministic chapters through an explicitly experimental Tree map.',
    seal: '☽',
    accent: CHAPEL_ACCENT,
    previewArtifact: 'chapter-tree',
    kind: 'authored-instrument',
    capabilities: ['offline-tool', 'deterministic-oracle', 'source-reading'],
    offline: 'full',
    performanceClass: 'light',
    source: LIBER333_PROVENANCE,
    Architecture: ChapelArchitecture,
    Instrument: ChapelInstrument,
  },
]

export function chamberById(id: string) {
  return CHAMBERS.find((chamber) => chamber.id === id) ?? CHAMBERS[0]
}
