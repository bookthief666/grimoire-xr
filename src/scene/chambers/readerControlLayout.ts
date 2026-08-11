export const READER_CONTROL_Y = 0.98
export const READER_CONTROL_RADIUS = 1.9
export const READER_CONTROL_STEP_RADIANS = 0.2

/**
 * World pose for reader control `index` of `count`, arranged on a shallow arc
 * centred on the forward axis.
 *
 * The radius is deliberately inside `ZONES.content` (1.5–2.5m), which
 * `zones.ts` reserves for exactly this case: "Readings and tablets.
 * Interactive only for pagination." An earlier version placed these controls
 * at 1.32m — inside `ZONES.work`, the same distance band as the altar desk's
 * own CONSULT/QUESTION/TRIAD controls at ~1.24m — so a reach for NEXT could
 * land on CONSULT instead and silently draw a new reading, discarding the
 * open chapter. See `test/chapel-reader-controls.test.ts`.
 */
export function readerControlPose(index: number, count: number) {
  const angle = (index - (count - 1) / 2) * READER_CONTROL_STEP_RADIANS

  return {
    position: [
      Math.sin(angle) * READER_CONTROL_RADIUS,
      READER_CONTROL_Y,
      -Math.cos(angle) * READER_CONTROL_RADIUS,
    ] as [number, number, number],
    rotationY: -angle,
  }
}
