export const FORGE_COLUMN_X = 1.02
export const FORGE_COLUMN_Z = -1.62
export const FORGE_ROW_TOP = 1.72
export const FORGE_ROW_STEP = 0.2

/**
 * Poses for the Forge's configuration dials.
 *
 * Two columns flanking the forward axis rather than one arc, for a reason the
 * three previous chambers did not hit: nine dials will not fit side by side.
 * Each reads `TRADITION  Thelemic` at legible size, which is far wider than the
 * arc segment nine controls would each get, and stacking nine rows inside the
 * y 0.4–1.2 interactive band would put them 2.6 degrees apart at reading
 * distance — unhittable with a controller ray.
 *
 * Columns escape that band legitimately. `blocksForwardSightline` only guards a
 * corridor of |x| < 0.8, so anything beyond that never crosses the view of the
 * altar and the solar engine no matter its height, which frees the full
 * vertical range for rows. The columns sit at |x| ≈ 1.02, outside the corridor
 * with margin.
 *
 * Every pose still lands inside `ZONES.content` (1.5–2.5m), which `zones.ts`
 * reserves for readings and their pagination, and clear of the altar console at
 * ~1.24m. Verified in `test/forge-dial-layout.test.ts`.
 */
export function forgeDialPose(column: 'left' | 'right', row: number) {
  const side = column === 'left' ? -1 : 1
  const x = side * FORGE_COLUMN_X
  const y = FORGE_ROW_TOP - row * FORGE_ROW_STEP

  return {
    position: [x, y, FORGE_COLUMN_Z] as [number, number, number],
    // Turn each column inward so its face is square to the practitioner.
    rotationY: -side * 0.42,
  }
}
