export const NEON_SIGN_WIDTH = 1.62

/**
 * The three stacked plates that make a sign read as lit glass: a wide soft
 * spill, a tighter bright border, and an opaque face for the label to sit on.
 *
 * This is data rather than JSX because every station bay draws the same three
 * plates at a different angle. Describing them once lets the bays submit all
 * twelve as three instanced draws while `NeonSign` still composes them normally
 * for any caller that only needs one.
 *
 * `idle` is an opacity rather than a ratio because that is how it reads to a
 * designer; the instanced path converts to a colour scale where it needs to.
 */
export const NEON_SIGN_PLATES = [
  { z: -0.012, pad: 0.16, height: 0.4, active: 0.14, idle: 0.065, additive: true },
  { z: -0.004, pad: 0.06, height: 0.31, active: 0.82, idle: 0.48, additive: true },
  { z: 0, pad: 0, height: 0.245, active: 0.96, idle: 0.96, additive: false },
] as const
