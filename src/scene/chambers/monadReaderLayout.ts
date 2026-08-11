export const MONAD_CONTROL_Y = 1.1
export const MONAD_CONTROL_RADIUS = 1.85
export const MONAD_REGISTER_Y = 0.86
export const MONAD_REGISTER_RADIUS = 2.15

/**
 * Poses for the Monad's reading controls.
 *
 * Both rows sit inside `ZONES.content` (1.5–2.5m), which `zones.ts` reserves
 * for "Readings and tablets. Interactive only for pagination."
 *
 * This is the third time this collision class has come up. The Monad's own
 * lectern controls once sat in the same screen band as the altar selector row
 * and lost the raycast to it, so ADVANCE silently switched chambers; the
 * Chapel's reader controls later sat at 1.32m, inside `ZONES.work` alongside
 * the altar's CONSULT at ~1.24m. Reading controls belong further out than the
 * altar console, always — so the geometry lives here as a pure function and is
 * asserted in `test/monad-reader-controls.test.ts` rather than trusted to a
 * comment.
 *
 * Both rows also sit BELOW the eye band that `blocksForwardSightline` guards
 * (|y - 1.6| >= 0.4). The glyph is the chamber and the reading bands hang under
 * it; a row of buttons across the forward view at eye height would put controls
 * in front of the things they exist to operate. An earlier register row at 1.24
 * did exactly that.
 *
 * These poses are absolute. Do not nest them inside an offset group — a
 * wrapper at y 0.66 once lifted the sentence row to 1.56, back into the eye
 * band, which silently invalidated every assertion in the layout test while
 * the test itself kept passing.
 *
 * The usable height band for anything interactive here is roughly
 * y 0.4 to 1.2. Below 0.4 `zoneOf` reports `ambient` because `isUnderfoot`
 * treats the floor as a bounding surface rather than workspace; above 1.2 the
 * control enters the forward sightline. Both rows sit inside that band.
 *
 * They also sit high within it, because the altar plinth crowns at about
 * y 0.75 and stands between the practitioner and this chamber's controls. In
 * VR, sightlines from the head clear it easily; from the flat survey camera
 * three metres back they do not, and a row at 0.46 disappeared behind the
 * plinth in exactly the fallback view the owner tests on.
 */
function arcPose(index: number, count: number, radius: number, y: number, step: number) {
  const angle = (index - (count - 1) / 2) * step

  return {
    position: [Math.sin(angle) * radius, y, -Math.cos(angle) * radius] as [
      number,
      number,
      number,
    ],
    rotationY: -angle,
  }
}

/** Phase and sentence navigation, at the lower of the two rows. */
export function monadControlPose(index: number, count: number) {
  return arcPose(index, count, MONAD_CONTROL_RADIUS, MONAD_CONTROL_Y, 0.19)
}

/**
 * The commentary-register selector, above the navigation row.
 *
 * The step tightens as registers are added so a sentence carrying all seven
 * still spans a comfortable head-turn rather than wrapping behind the
 * practitioner.
 */
export function monadRegisterPose(index: number, count: number) {
  const step = count > 5 ? 0.155 : 0.185
  return arcPose(index, count, MONAD_REGISTER_RADIUS, MONAD_REGISTER_Y, step)
}
