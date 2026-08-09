import { CellArchitecture, CellInstrument, CELL_ACCENT } from './CellChamber'
import { MonadArchitecture, MonadInstrument, MONAD_ACCENT } from './MonadChamber'
import { ChapelArchitecture, ChapelInstrument, CHAPEL_ACCENT } from './ChapelChamber'
import type { Chamber } from './types'

export const SANCTUM_ACCENT = '#ffb000'

/**
 * The four chambers. Single source of truth: the summoning ring and the scene
 * both read this, so adding a tool means adding one entry here.
 *
 * The Sanctum declares no Architecture or Instrument — it *is* the existing
 * temple, rendered directly by RitualChamberScene because it is bound to the
 * live grimoire engine. Every other chamber owns the whole space.
 */
export const CHAMBERS: readonly Chamber[] = [
  {
    id: 'sanctum',
    name: 'The Sanctum',
    purpose: 'Forge a deck. Lay a spread. Consult the oracle.',
    seal: '✶',
    accent: SANCTUM_ACCENT,
  },
  {
    id: 'cell',
    name: 'The Cell',
    purpose: 'Permute the Name. Breathe along the axis.',
    seal: 'א',
    accent: CELL_ACCENT,
    Architecture: CellArchitecture,
    Instrument: CellInstrument,
  },
  {
    id: 'monad',
    name: 'The Monad',
    purpose: "Construct Dee's glyph, theorem by theorem.",
    seal: '☿',
    accent: MONAD_ACCENT,
    Architecture: MonadArchitecture,
    Instrument: MonadInstrument,
  },
  {
    id: 'chapel',
    name: 'The Chapel of Lies',
    purpose: 'Draw chapters from the Tree by gematria.',
    seal: '☽',
    accent: CHAPEL_ACCENT,
    Architecture: ChapelArchitecture,
    Instrument: ChapelInstrument,
  },
]

export function chamberById(id: string) {
  return CHAMBERS.find((c) => c.id === id) ?? CHAMBERS[0]
}
