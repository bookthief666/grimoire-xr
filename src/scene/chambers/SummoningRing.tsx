import { useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Chamber, ChamberId } from './types'

/**
 * The one control that is always present in every chamber: four seals that
 * summon the rooms.
 *
 * Sits in the CONTROL zone (see scene/zones.ts) — hand-reach distance, below and
 * in front of the altar so it never crosses the forward sightline at eye height.
 * Input uses the pointer-down/up + pointer-capture pattern established by
 * FloatingSigilButton; bare onClick is unreliable against XR controller rays.
 */

/**
 * Below and in front of the workbench's own sigil dock, not level with it.
 *
 * At y 1.02 / z -0.46 the two overlapped by 14cm vertically across 77cm of
 * width, with the dock 7cm nearer the user — so the dock silently intercepted
 * every ray aimed at a chamber seal. Dropping the ring to its own band leaves a
 * clear 2cm gap above it and puts the seals at 0.80m, inside CONTROL.
 */
const RING_Y = 0.86
const RING_Z = -0.3
const RING_TILT = -0.42

function Seal({
  chamber,
  x,
  active,
  disabled,
  onSummon,
}: {
  chamber: Chamber
  x: number
  active: boolean
  disabled: boolean
  onSummon: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Staggered breathing so the ring reads as living seals rather than a
    // static toolbar. Phase-offset by x so they never pulse in unison.
    const breath = 0.5 + Math.sin(t * 0.9 + x * 5.0) * 0.5

    if (haloRef.current) {
      const base = active ? 0.34 : hovered ? 0.26 : 0.09
      haloRef.current.opacity = base + breath * (active ? 0.16 : 0.05)
    }

    if (groupRef.current) {
      const target = hovered && !disabled ? 1.12 : 1
      groupRef.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        0.18,
      )
    }
  })

  return (
    <group
      ref={groupRef}
      position={[x, RING_Y, RING_Z]}
      rotation={[RING_TILT, 0, 0]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          setPointerCapture?: (pointerId: number) => void
        }

        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)
        if (!disabled) onSummon()
      }}
    >
      <mesh>
        <circleGeometry args={[0.062, 28]} />
        <meshBasicMaterial
          color="#05060a"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.064, 0.072, 36]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 0.95 : hovered ? 0.7 : 0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Fake glow: a low-opacity additive disc, no postprocessing. */}
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[0.15, 28]} />
        <meshBasicMaterial
          ref={haloRef}
          color={chamber.accent}
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {active ? (
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.086, 0.09, 36]} />
          <meshBasicMaterial
            color={chamber.accent}
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      <Text
        position={[0, 0.001, 0.02]}
        fontSize={0.05}
        color={disabled ? '#4a4a52' : active ? '#ffffff' : chamber.accent}
        anchorX="center"
        anchorY="middle"
      >
        {chamber.seal}
      </Text>

      {hovered ? (
        <>
          <Text
            position={[0, -0.105, 0.02]}
            fontSize={0.026}
            color="#f2f2f5"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.6}
          >
            {chamber.name}
          </Text>
          <Text
            position={[0, -0.142, 0.02]}
            fontSize={0.017}
            color="#8b8b96"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.66}
          >
            {chamber.purpose}
          </Text>
        </>
      ) : null}

      {/* Generous transparent hitbox. Never visible={false} - that would stop
          raycasting entirely and make the seal unselectable. */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function SummoningRing({
  chambers,
  activeId,
  disabled,
  onSummon,
}: {
  chambers: readonly Chamber[]
  activeId: ChamberId
  disabled: boolean
  onSummon: (id: ChamberId) => void
}) {
  const spacing = 0.19
  const start = -((chambers.length - 1) * spacing) / 2

  return (
    <group>
      {/* A thin rail tying the seals together, so they read as one instrument. */}
      <mesh position={[0, RING_Y, RING_Z - 0.004]} rotation={[RING_TILT, 0, 0]}>
        <planeGeometry args={[chambers.length * spacing + 0.06, 0.004]} />
        <meshBasicMaterial
          color="#6b7684"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {chambers.map((chamber, index) => (
        <Seal
          key={chamber.id}
          chamber={chamber}
          x={start + index * spacing}
          active={chamber.id === activeId}
          disabled={disabled}
          onSummon={() => onSummon(chamber.id)}
        />
      ))}
    </group>
  )
}
