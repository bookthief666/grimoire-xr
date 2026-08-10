import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type TempleAtmosphereProps = {
  ritualImpulseRef: MutableRefObject<number>
  hasActiveCard: boolean
  hasOracleReading: boolean
}

/**
 * Sanctum-only reactive lighting for the shared Neon Rotunda.
 *
 * The old TempleAtmosphere predated the Rotunda and therefore duplicated the
 * room itself: a second cosmic void, floor aura, distant Tree trace, orbiting
 * seals and a shadow-casting key light. RotundaFloor + RotundaDome + station
 * bays now own those spatial cues. Keeping them here made Sanctum uniquely
 * expensive and visually double-exposed compared with the authored chambers.
 *
 * This component deliberately emits no geometry and no shadow pass. It keeps
 * the ritual-state lighting response required by the Forge while letting the
 * shared Rotunda be the single architectural environment.
 */
export function TempleAtmosphere({
  ritualImpulseRef,
  hasActiveCard,
  hasOracleReading,
}: TempleAtmosphereProps) {
  const altarLightRef = useRef<THREE.PointLight>(null)
  const rearLightRef = useRef<THREE.PointLight>(null)
  const keyLightRef = useRef<THREE.DirectionalLight>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const activeBoost = hasActiveCard ? 1.8 : 0
    const oracleBoost = hasOracleReading ? 2.6 : 0

    if (altarLightRef.current) {
      const target =
        3.2 +
        activeBoost +
        oracleBoost +
        impulse * 4.8 +
        Math.sin(t * 0.9) * 0.34
      altarLightRef.current.intensity = THREE.MathUtils.lerp(
        altarLightRef.current.intensity,
        target,
        delta * 3,
      )
    }

    if (rearLightRef.current) {
      const target =
        0.9 +
        oracleBoost * 0.34 +
        impulse * 1.8 +
        Math.sin(t * 0.5) * 0.16
      rearLightRef.current.intensity = THREE.MathUtils.lerp(
        rearLightRef.current.intensity,
        target,
        delta * 2.2,
      )
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(
        keyLightRef.current.intensity,
        1.15 + impulse * 0.55,
        delta * 1.7,
      )
    }
  })

  return (
    <group>
      <ambientLight color="#08101c" intensity={0.11} />

      {/* No castShadow: neon architecture is emissive/faked-light geometry and
          a shadow-map pass only duplicates draw work on standalone XR. */}
      <directionalLight
        ref={keyLightRef}
        position={[-4.5, 3.4, 2.2]}
        color="#d8f6ff"
        intensity={1.15}
      />

      <pointLight
        ref={altarLightRef}
        position={[0, 1.1, -0.72]}
        color={hasOracleReading ? '#a855ff' : '#ffd23f'}
        intensity={3.2}
        distance={4.2}
        decay={2}
      />

      <pointLight
        ref={rearLightRef}
        position={[0, 3.4, -4.4]}
        color={hasOracleReading ? '#ff2bd6' : '#00e5ff'}
        intensity={0.9}
        distance={7.5}
        decay={2}
      />
    </group>
  )
}
