/**
 * Spatial zones for the temple.
 *
 * ## Two different user positions
 *
 * There is no `XROrigin` in the app and `createXRStore()` is called bare, so in
 * immersive VR the XR reference space maps straight onto the scene origin: the
 * user's head sits at about [0, 1.6, 0]. The scene is laid out for exactly that
 * — the workbench at z -0.84 is a natural arm's-length away from the origin.
 *
 * The `Canvas` camera at [0, 1.6, 3] (App.tsx) is the *flat-mode survey view*,
 * pulled 3m back so a desktop/phone browser can see the whole chamber. Distances
 * measured from it are ~3m larger and are not what the layout is designed around.
 *
 * **VR is the design target, so these zones are measured from `USER_EYE_VR`.**
 * Anything that looks correct only in the flat view is a trap.
 *
 * ## Why zones exist
 *
 * The user cannot move — no locomotion, no teleport — so everything must be
 * summoned to them, and the forward view at eye height must stay clear. The
 * failure mode this prevents is ambient decoration, interactive controls and
 * readable content all drifting into the same depth, which is what made the
 * chamber read as an instrument cluster rather than a temple.
 *
 * Distances are metres from the user's head, not world Z. Convert with
 * `worldZForDistance()`.
 */

/** Head position in immersive VR. Reference frame for every zone below. */
export const USER_EYE_VR: readonly [number, number, number] = [0, 1.6, 0]

/** Flat-mode survey camera (App.tsx). Not the layout reference. */
export const USER_EYE_FLAT: readonly [number, number, number] = [0, 1.6, 3]

export const ZONES = {
  /** Nothing, ever. Too close to converge on comfortably. */
  reserved: { near: 0.0, far: 0.35 },
  /**
   * Tool seals and quick actions — hand-reach distance. The far bound is 0.85
   * rather than a rounder 0.75 because comfortable seated reach genuinely
   * extends that far, and two control clusters (the workbench sigil dock at
   * 0.67 and the summoning ring at 0.80) have to coexist without stacking.
   */
  control: { near: 0.35, far: 0.85 },
  /** The altar surface: cards, dials, the working instrument. (Altar ≈ 0.84m.) */
  work: { near: 0.85, far: 1.5 },
  /** Readings and tablets. Interactive only for pagination. */
  content: { near: 1.5, far: 2.5 },
  /** Architecture and atmosphere. Never interactive, never occluding. */
  ambient: { near: 2.5, far: Infinity },
} as const

export type ZoneName = keyof typeof ZONES

/** World Z for a distance in front of the VR user. Forward is -Z. */
export function worldZForDistance(distance: number) {
  return USER_EYE_VR[2] - distance
}

/** Straight-line distance from the VR user's head to a world point. */
export function distanceFromUser(x: number, y: number, z: number) {
  return Math.hypot(x - USER_EYE_VR[0], y - USER_EYE_VR[1], z - USER_EYE_VR[2])
}

/**
 * How far above eye height something has to be before it stops competing with
 * the working volume and reads as overhead atmosphere instead.
 */
export const OVERHEAD_CLEARANCE = 0.7

/** True when a point is high enough to be read as ceiling/canopy, not workspace. */
export function isOverhead(y: number) {
  return y - USER_EYE_VR[1] > OVERHEAD_CLEARANCE
}

/**
 * True when a point sits at floor level. The floor is a bounding surface of the
 * room, not workspace — a sigil underfoot is no more "in the way" than the
 * ceiling is, so it gets the same exemption as canopy.
 */
export function isUnderfoot(y: number) {
  return y < 0.4
}

/**
 * Which zone a world point falls in, measured in the VR frame.
 *
 * Radial distance alone mis-classifies anything above or below the user: the
 * ceiling crown at [0, 3.4, 0] is only 1.8m away and would otherwise land in
 * `content`, which is nonsense for a ceiling. Ceiling and floor are the room's
 * bounding surfaces, so both are always `ambient` — they cannot be in the way.
 */
export function zoneOf(x: number, y: number, z: number): ZoneName {
  if (isOverhead(y) || isUnderfoot(y)) return 'ambient'

  const d = distanceFromUser(x, y, z)

  for (const name of Object.keys(ZONES) as ZoneName[]) {
    const { near, far } = ZONES[name]
    if (d >= near && d < far) return name
  }

  return 'ambient'
}

/**
 * True when a point sits in the band the user looks through to reach the altar:
 * in front, near eye height, and roughly centred. Ambient decoration must never
 * satisfy this — the orbiting sigils in TempleAtmosphere are the case that
 * prompted it. Lifting decoration above `eyeBand` is the usual fix, since
 * overhead presence reads as atmosphere rather than obstruction.
 */
export function blocksForwardSightline(
  x: number,
  y: number,
  z: number,
  halfWidth = 0.8,
  eyeBand = 0.4,
) {
  const inFront = z < USER_EYE_VR[2]
  const nearEyeHeight = Math.abs(y - USER_EYE_VR[1]) < eyeBand
  const centred = Math.abs(x - USER_EYE_VR[0]) < halfWidth

  return inFront && nearEyeHeight && centred
}
