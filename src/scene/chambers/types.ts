import type { ComponentType, MutableRefObject } from 'react'

/**
 * A chamber owns the *entire* temple space, not a widget inside it.
 *
 * There is no locomotion in this app — no XROrigin, no teleport — so the user
 * cannot walk to a room. "Different rooms" therefore means the space
 * reconfigures around a stationary user: one chamber dissolves and the next
 * unfolds in place. See ChamberDirector for the transition.
 */
export type ChamberId = 'sanctum' | 'cell' | 'monad' | 'chapel'

export type ChamberProps = {
  /**
   * Materialisation, 0 → 1. Chambers multiply this into their own opacities and
   * scales so the room contracts to nothing and reforms. Read it inside
   * useFrame; never store it in React state (it changes every frame).
   */
  morphRef: MutableRefObject<number>
  /** Existing reactive-pulse channel, spikes to 1 on ritual events. */
  ritualImpulseRef: MutableRefObject<number>
  /** True only for the chamber currently being presented. */
  active: boolean
}

export type Chamber = {
  id: ChamberId
  /** Shown on hover in the summoning ring. */
  name: string
  /** One-line statement of what this chamber is for. */
  purpose: string
  /** Glyph rendered on the chamber's seal. */
  seal: string
  /** Drives the whole room palette — this is what makes a morph read as relocation. */
  accent: string
  /**
   * The room shell: architecture, lighting, atmosphere.
   *
   * Omitted by the Sanctum, whose architecture is the existing temple rendered
   * directly by RitualChamberScene — it is wired to the live grimoire engine
   * (deck, oracle, card drag) and threading all of that through this contract
   * would buy nothing.
   */
  Architecture?: ComponentType<ChamberProps>
  /** The interactive instrument at the work zone. */
  Instrument?: ComponentType<ChamberProps>
}
