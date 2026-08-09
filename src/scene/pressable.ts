import type { ThreeEvent } from '@react-three/fiber'

/**
 * Pointer handlers for anything clickable in the temple.
 *
 * Two things matter here, and both were being got wrong in places:
 *
 * **Pointer capture.** In VR you aim with a controller ray from arm's length,
 * and the ray drifts between pressing and releasing. Without capture the
 * release lands on whatever the ray happens to be over, the target never sees
 * its pointerup, and the action silently does nothing. Capturing on down and
 * releasing on up binds the whole gesture to the element you actually aimed at.
 *
 * **Not using bare onClick.** R3F synthesises click from a down/up pair on the
 * same object, so it inherits the same drift problem and is unreliable against
 * XR rays.
 *
 * Spread the result onto a `<group>` or `<mesh>`:
 *
 *   <group {...pressable(() => doThing())}>
 *
 * Pair it with a generous transparent hitbox — `opacity: 0.001`,
 * `depthWrite: false`. Never `visible={false}`, which stops raycasting entirely
 * and makes the control unhittable.
 */
export function pressable(onActivate: () => void, disabled = false) {
  return {
    onPointerDown: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      if (disabled) return

      const target = event.target as unknown as {
        setPointerCapture?: (pointerId: number) => void
      }

      target.setPointerCapture?.(event.pointerId)
    },
    onPointerUp: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      if (disabled) return

      const target = event.target as unknown as {
        releasePointerCapture?: (pointerId: number) => void
      }

      target.releasePointerCapture?.(event.pointerId)
      onActivate()
    },
  }
}
