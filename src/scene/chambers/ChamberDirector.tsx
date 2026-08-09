import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Chamber, ChamberId } from './types'

const DISSOLVE_SECONDS = 0.7
const FORM_SECONDS = 0.9

type Phase = 'settled' | 'dissolving' | 'forming'

/**
 * Owns which chamber is presented and animates the transition between them.
 *
 * The user cannot walk anywhere — there is no locomotion in this app — so
 * changing "room" means the space itself reconfigures: the current chamber
 * contracts to nothing, is swapped, and the next unfolds in place.
 *
 * The whole effect rides on a single `morphRef` (0 → 1) that every chamber
 * multiplies into its own opacities and scales. That keeps this cheap enough for
 * standalone VR: one ref mutated in useFrame, no per-frame React state, no
 * postprocessing, no extra render targets.
 */
export function useChamberDirector(chambers: readonly Chamber[], initial: ChamberId) {
  const [presented, setPresented] = useState<ChamberId>(initial)
  const [requested, setRequested] = useState<ChamberId>(initial)
  const [phase, setPhase] = useState<Phase>('settled')

  const morphRef = useRef(1)
  const phaseRef = useRef<Phase>('settled')
  const elapsedRef = useRef(0)

  // Keep a ref copy so useFrame reads the current phase without re-subscribing.
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    if (requested === presented) return
    if (phaseRef.current !== 'settled') return

    elapsedRef.current = 0
    setPhase('dissolving')
  }, [requested, presented])

  useFrame((_, delta) => {
    const current = phaseRef.current
    if (current === 'settled') {
      morphRef.current = 1
      return
    }

    elapsedRef.current += delta

    if (current === 'dissolving') {
      const t = Math.min(1, elapsedRef.current / DISSOLVE_SECONDS)
      // Ease in: the room lets go slowly, then drops away.
      morphRef.current = 1 - t * t

      if (t >= 1) {
        morphRef.current = 0
        elapsedRef.current = 0
        phaseRef.current = 'forming'
        setPresented(requested)
        setPhase('forming')
      }
      return
    }

    const t = Math.min(1, elapsedRef.current / FORM_SECONDS)
    // Ease out: the new room arrives fast and settles.
    morphRef.current = 1 - (1 - t) * (1 - t)

    if (t >= 1) {
      morphRef.current = 1
      phaseRef.current = 'settled'
      setPhase('settled')
    }
  })

  const chamber =
    chambers.find((c) => c.id === presented) ?? chambers[0]

  return {
    /** The chamber currently mounted. Changes at the midpoint of the morph. */
    chamber,
    /** What the user last asked for; equals `chamber.id` once settled. */
    requested,
    /** Ask for a different chamber. Ignored while a morph is already running. */
    summon: setRequested,
    morphRef: morphRef as MutableRefObject<number>,
    phase,
    inTransition: phase !== 'settled',
  }
}
