export const ROTUNDA_NAV = {
  centreZ: -1.0,
  stationRadius: 6.05,
  stationY: 1.62,
  stationStepRadians: Math.PI / 6,
  selectorY: 0.9,
  selectorZ: -0.28,
  selectorSpacing: 0.2,
} as const

export type StationPose = {
  position: [number, number, number]
  rotationY: number
}

/**
 * Place tool bays in colonnade openings that flank the forward axis.
 *
 * The colonnade has 12 openings, so PI / 6 keeps signage aligned between
 * columns rather than floating across the architecture.
 *
 * Stations deliberately straddle the axis rather than sitting on it. They used
 * to be laid out symmetrically about the forward direction, which put the inner
 * pair only 15 degrees off-centre — directly behind whatever the active chamber
 * builds in the middle of the room. In the Sanctum that is the solar engine,
 * and it hid two of the four bays completely: half the tool identity in the
 * room was invisible from the one place the practitioner actually stands.
 *
 * Reserving the central openings for the active chamber's own work costs
 * nothing and is truer to the architecture — the axis belongs to the rite, the
 * flanks belong to the instruments.
 */
export function stationPose(index: number, count: number): StationPose {
  const half = Math.ceil(count / 2)
  const leftOfAxis = index < half
  const side = leftOfAxis ? -1 : 1
  // Rank 1 is the opening nearest the axis on each side; the axis itself (rank
  // 0) is never used.
  const rank = leftOfAxis ? half - index : index - half + 1
  const angle = Math.PI + side * rank * ROTUNDA_NAV.stationStepRadians

  return {
    position: [
      Math.sin(angle) * ROTUNDA_NAV.stationRadius,
      ROTUNDA_NAV.stationY,
      Math.cos(angle) * ROTUNDA_NAV.stationRadius + ROTUNDA_NAV.centreZ,
    ],
    // Plane/text geometry faces +Z in local space. Rotate that normal back
    // toward the practitioner at the centre of the rotunda.
    rotationY: angle + Math.PI,
  }
}

/** Hand-reach selector positions on the altar console. */
export function selectorX(index: number, count: number) {
  const midpoint = (count - 1) / 2
  return (index - midpoint) * ROTUNDA_NAV.selectorSpacing
}
