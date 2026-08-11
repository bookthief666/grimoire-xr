import type { PracticePosition } from '../../tools/abulafia'

/**
 * The Cell's current practice position, shared between its two components.
 *
 * `CellArchitecture` and `CellInstrument` are mounted separately by the chamber
 * registry and cannot prop-drill to each other. They previously each derived
 * their own position from the raw clock, which held while both were free-running
 * but broke the moment the practitioner used the transport: pausing froze the
 * instrument's readout while the wall axis kept advancing, so the Name asked for
 * one direction and a different one stayed lit. The Cell's entire premise is
 * turning to face the axis you are sounding, so that is not a cosmetic
 * mismatch.
 *
 * The instrument owns the transport and writes here; the architecture reads.
 * Module scope is safe because only one chamber's instrument writes it, and a
 * ref rather than state because this changes every frame and must not re-render.
 */
export const cellPractice: { position: PracticePosition | null } = {
  position: null,
}
