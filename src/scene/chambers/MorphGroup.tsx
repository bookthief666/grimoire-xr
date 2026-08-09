import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import { USER_EYE_VR } from '../zones'

/**
 * Collapses its children toward the user's head as `morphRef` falls to 0, and
 * expands them back out as it rises to 1.
 *
 * Scaling about the user's eye rather than the world origin is what makes this
 * read as a room contracting *around* you rather than a model shrinking on a
 * table — the walls come in, the far architecture rushes past.
 *
 * Used for the Sanctum, whose many components have no morph awareness of their
 * own. The other chambers animate their own opacities and scales from the same
 * ref, so wrapping them here as well would apply the scale twice.
 */
export function MorphGroup({
  morphRef,
  children,
}: {
  morphRef: MutableRefObject<number>
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!ref.current) return

    const m = morphRef.current

    // Never scale to exactly 0 — a zero matrix is degenerate and three.js will
    // warn on the inverse. Hiding below the threshold also skips the draw calls.
    ref.current.scale.setScalar(Math.max(0.0001, m))
    ref.current.visible = m > 0.01
  })

  return (
    <group ref={ref} position={[0, USER_EYE_VR[1], 0]}>
      <group position={[0, -USER_EYE_VR[1], 0]}>{children}</group>
    </group>
  )
}
