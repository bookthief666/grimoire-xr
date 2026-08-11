import type { ThreeEvent } from '@react-three/fiber'

type PointerCaptureTarget = {
  setPointerCapture?: (pointerId: number) => void
  hasPointerCapture?: (pointerId: number) => boolean
  releasePointerCapture?: (pointerId: number) => void
}

function pointerCaptureTarget(target: unknown) {
  return target as PointerCaptureTarget
}

/**
 * Pointer capture is a reliability aid, not a reason to lose the ritual action.
 * Browser/XR adapters can report a stale or already-released pointer during
 * cancellation/session changes, so capture cleanup must be best-effort.
 */
export function capturePointerSafely(target: unknown, pointerId: number) {
  const captureTarget = pointerCaptureTarget(target)

  try {
    captureTarget.setPointerCapture?.(pointerId)
    return true
  } catch {
    return false
  }
}

export function releasePointerSafely(target: unknown, pointerId: number) {
  const captureTarget = pointerCaptureTarget(target)

  try {
    if (
      captureTarget.hasPointerCapture &&
      !captureTarget.hasPointerCapture(pointerId)
    ) {
      return false
    }

    captureTarget.releasePointerCapture?.(pointerId)
    return true
  } catch {
    return false
  }
}

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
 *
 * `onActivate` receives the pointer event, so a control can decide something
 * from *where* it was hit — the Forge's dials read the local x of the hit to
 * step forward or back from a single target instead of paying for two. Handlers
 * that do not care can ignore it. Deriving that by overriding `onPointerUp` on
 * top of a spread `pressable()` would drop the best-effort release above, which
 * exists because XR adapters report stale pointers during session changes.
 */
export function pressable(
  onActivate: (event: ThreeEvent<PointerEvent>) => void,
  disabled = false,
) {
  return {
    onPointerDown: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      if (disabled) return

      capturePointerSafely(event.target, event.pointerId)
    },
    onPointerUp: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()

      // Always attempt cleanup first. A control may become disabled between
      // pointer-down and pointer-up while a chamber starts transitioning.
      releasePointerSafely(event.target, event.pointerId)

      if (disabled) return
      onActivate(event)
    },
    onPointerCancel: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      releasePointerSafely(event.target, event.pointerId)
    },
  }
}
