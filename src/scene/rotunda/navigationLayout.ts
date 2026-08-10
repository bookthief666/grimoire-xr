export const ROTUNDA_NAV = {
  centreZ: -1.0,
  stationRadius: 6.05,
  stationY: 1.62,
  stationStepRadians: Math.PI / 6,
  selectorY: 0.86,
  selectorZ: -0.28,
  selectorSpacing: 0.24,
} as const

export type StationPose = {
  position: [number, number, number]
  rotationY: number
}

/**
 * Place current tool bays in consecutive colonnade openings centred on the
 * forward view. The colonnade has 12 bays, so PI / 6 keeps signage aligned
 * between columns instead of floating across the architecture.
 */
export function stationPose(index: number, count: number): StationPose {
  const midpoint = (count - 1) / 2
  const angle = Math.PI + (index - midpoint) * ROTUNDA_NAV.stationStepRadians

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
