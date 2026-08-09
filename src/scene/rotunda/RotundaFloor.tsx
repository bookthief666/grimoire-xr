import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { BabalonStarGlyph, UnicursalHexagramGlyph } from '../ThelemicSigils'

const noRaycast = () => null

/**
 * The rotunda floor.
 *
 * The single most important element in the overhaul. Every chamber previously
 * rendered its objects against pure black, which is why they read as widgets
 * suspended in a void rather than rooms you are standing inside — with no
 * surface and no horizon there are no depth cues at all.
 *
 * Three layers do the work:
 *   1. an opaque disc, so there is a ground
 *   2. a bright horizon ring where the disc ends, so the eye finds the edge
 *   3. concentric guide rings receding outward, which give parallax as you turn
 *
 * The floor sigils are the glowing medallions from the reference image. They
 * reuse the existing parametric glyph components rather than new geometry.
 */

const FLOOR_RADIUS = 7.5

function FloorSigil({
  x,
  z,
  radius,
  color,
  variant,
  phase,
}: {
  x: number
  z: number
  radius: number
  color: string
  variant: 'star' | 'hexagram'
  phase: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Very slow counter-rotation. Enough that the floor is never quite static,
    // slow enough that it never pulls attention from the working surface.
    groupRef.current.rotation.z = phase + clock.getElapsedTime() * 0.035
  })

  return (
    <group
      position={[x, 0.006, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={noRaycast}
    >
      {/* Inlay disc, so the sigil sits on polished stone rather than on nothing. */}
      <mesh raycast={noRaycast}>
        <circleGeometry args={[radius * 1.16, 40]} />
        <meshBasicMaterial color={NEON.floorSheen} transparent opacity={0.85} />
      </mesh>

      <mesh position={[0, 0, 0.001]} raycast={noRaycast}>
        <ringGeometry args={[radius * 1.13, radius * 1.16, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={groupRef} position={[0, 0, 0.002]} raycast={noRaycast}>
        {variant === 'star' ? (
          <BabalonStarGlyph radius={radius} color={color} opacity={0.9} lineWidth={2.6} />
        ) : (
          <UnicursalHexagramGlyph radius={radius} color={color} opacity={0.9} lineWidth={2.6} />
        )}
      </group>
    </group>
  )
}

export function RotundaFloor({
  accent = NEON.cyan,
}: {
  /** The summoned chamber's hue, so the room re-tints around the active tool. */
  accent?: string
}) {
  const horizonRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!horizonRef.current) return
    horizonRef.current.opacity =
      0.8 + Math.sin(clock.getElapsedTime() * 0.4) * 0.1
  })

  // Medallions ringed around the centre, matching the reference's arrangement of
  // large glowing sigils set into the floor at intervals.
  const medallions = useMemo(
    () =>
      [
        { angle: 0.0, color: NEON.magenta, variant: 'star' as const },
        { angle: Math.PI * 0.5, color: NEON.cyan, variant: 'hexagram' as const },
        { angle: Math.PI, color: NEON.gold, variant: 'star' as const },
        { angle: Math.PI * 1.5, color: NEON.violet, variant: 'hexagram' as const },
      ].map((m, i) => ({
        ...m,
        x: Math.sin(m.angle) * 2.65,
        z: Math.cos(m.angle) * 2.65 - 1.0,
        phase: i * 1.3,
      })),
    [],
  )

  return (
    <group raycast={noRaycast}>
      {/* 1. The ground itself. Opaque and depth-writing, so it occludes the
             additive glow of anything behind it and gives the scene a real
             back-to-front order. */}
      <mesh
        position={[0, 0, -1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={noRaycast}
      >
        <circleGeometry args={[FLOOR_RADIUS, 72]} />
        <meshBasicMaterial color={NEON.floor} />
      </mesh>

      {/* 2. The horizon. Where the floor stops, a bright rim tells the eye how
             far away the edge of the room is. */}
      <mesh
        position={[0, 0.004, -1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={noRaycast}
      >
        <ringGeometry args={[FLOOR_RADIUS - 0.12, FLOOR_RADIUS, 96]} />
        <meshBasicMaterial
          ref={horizonRef}
          color={accent}
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Guide rings. Concentric circles receding toward the horizon are the
             cheapest possible parallax cue - when the head turns, these move
             against each other and the floor reads as a real surface. */}
      {[1.9, 3.1, 4.6, 6.2].map((r, i) => (
        <mesh
          key={r}
          position={[0, 0.003, -1.0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <ringGeometry args={[r, r + 0.012, 88]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.36 - i * 0.055}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Radial spokes, quartering the floor like a ritual circle. */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 4.0, 0.0035, Math.cos(a) * 4.0 - 1.0]}
            rotation={[-Math.PI / 2, 0, -a]}
            raycast={noRaycast}
          >
            <planeGeometry args={[0.006, 4.6]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.24}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}

      {medallions.map((m) => (
        <FloorSigil
          key={m.angle}
          x={m.x}
          z={m.z}
          radius={0.62}
          color={m.color}
          variant={m.variant}
          phase={m.phase}
        />
      ))}
    </group>
  )
}
