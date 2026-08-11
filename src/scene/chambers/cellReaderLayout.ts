export const CELL_CONTROL_Y = 1.08
export const CELL_CONTROL_RADIUS = 1.8
export const CELL_CONTROL_STEP_RADIANS = 0.2

/**
 * Poses for the Cell's transport and study controls.
 *
 * Constraints inherited from the Chapel and Monad passes, where each was
 * learned by breaking it:
 *
 * - Inside `ZONES.content` (1.5–2.5m), which `zones.ts` reserves for "Readings
 *   and tablets. Interactive only for pagination." Reading controls belong
 *   further out than the altar console, whose own keys sit at ~1.24m.
 * - Within y 0.4 to 1.2. Below 0.4 `zoneOf` reports `ambient`, because
 *   `isUnderfoot` treats the floor as a bounding surface rather than workspace;
 *   above 1.2 the control enters the forward sightline.
 * - High in that band, because the altar plinth crowns near y 0.75. VR
 *   sightlines from the head clear it; the flat survey camera three metres back
 *   does not, and a low row vanishes in exactly the fallback view the owner
 *   tests on.
 *
 * These poses are absolute. Do not nest them in an offset group — doing so once
 * lifted the Monad's sentence row back into the eye band while its layout test
 * kept passing against the un-offset pose.
 */
export function cellControlPose(index: number, count: number) {
  const angle = (index - (count - 1) / 2) * CELL_CONTROL_STEP_RADIANS

  return {
    position: [
      Math.sin(angle) * CELL_CONTROL_RADIUS,
      CELL_CONTROL_Y,
      -Math.cos(angle) * CELL_CONTROL_RADIUS,
    ] as [number, number, number],
    rotationY: -angle,
  }
}
