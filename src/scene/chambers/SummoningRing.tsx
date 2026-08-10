import type { Chamber, ChamberId } from './types'
import { RotundaAltarPlinth } from '../rotunda/RotundaAltarPlinth'
import { RotundaStationBays } from '../rotunda/RotundaStationBays'

/**
 * Compatibility facade for the original shared chamber navigator.
 *
 * The old implementation was a four-seal rail floating in the control volume.
 * The Neon Rotunda now separates presentation from interaction:
 *
 * - ambient, registry-driven wall bays identify each tool in the architecture;
 * - hand-reach summon keys live on the shared altar plinth;
 * - the existing ChamberDirector contract remains unchanged.
 *
 * Keeping this facade avoids broad churn in RitualChamberScene and makes this
 * visual-navigation phase easy to revert independently from chamber logic.
 */
export function SummoningRing({
  chambers,
  activeId,
  disabled,
  onSummon,
}: {
  chambers: readonly Chamber[]
  activeId: ChamberId
  disabled: boolean
  onSummon: (id: ChamberId) => void
}) {
  return (
    <>
      <RotundaStationBays chambers={chambers} activeId={activeId} />
      <RotundaAltarPlinth
        chambers={chambers}
        activeId={activeId}
        disabled={disabled}
        onSummon={onSummon}
      />
    </>
  )
}
