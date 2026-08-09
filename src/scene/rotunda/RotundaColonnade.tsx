import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'

const noRaycast = () => null

/**
 * The colonnade: the wall of the rotunda.
 *
 * The floor alone left the temple half-built — past the horizon ring there was
 * nothing but black, so the space read as a lit disc suspended in void. Columns
 * and arches give the floor something to belong to and, more importantly, give
 * the eye vertical scale. A room is only as tall as its walls tell you it is.
 *
 * Everything here is neon line-work rather than lit stone: a dark opaque shaft
 * so the column reads as solid and occludes what is behind it, with bright
 * additive strips down its edges. That is the reference image's language, and it
 * is far cheaper than trying to light real geometry.
 */

const COLUMN_COUNT = 12
const RING_RADIUS = 6.4
const COLUMN_HEIGHT = 4.6
const CENTRE_Z = -1.0

/** One column: dark shaft, lit edges, base and capital. */
function Column({
  angle,
  accent,
}: {
  angle: number
  accent: string
}) {
  const x = Math.sin(angle) * RING_RADIUS
  const z = Math.cos(angle) * RING_RADIUS + CENTRE_Z

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]} raycast={noRaycast}>
      {/* Opaque shaft. Depth-writing, so the additive glow of anything beyond
          the colonnade is correctly occluded and the room gains a real inside
          and outside. */}
      <mesh position={[0, COLUMN_HEIGHT / 2, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.17, 0.21, COLUMN_HEIGHT, 8]} />
        <meshBasicMaterial color={NEON.void} />
      </mesh>

      {/* Vertical neon strips down the visible face. Two, offset, so the column
          reads as round rather than as a flat card. */}
      {[-0.11, 0.11].map((ox) => (
        <mesh
          key={ox}
          position={[ox, COLUMN_HEIGHT / 2, 0.175]}
          raycast={noRaycast}
        >
          <planeGeometry args={[0.014, COLUMN_HEIGHT * 0.92]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.75}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Capital and base: bright horizontal bands that terminate the shaft. */}
      {[0.12, COLUMN_HEIGHT - 0.16].map((y) => (
        <mesh
          key={y}
          position={[0, y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <ringGeometry args={[0.2, 0.26, 24]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The arcade ring: a bright band running around the tops of the columns, plus
 * the arch curves between them. This is what closes the colonnade into a single
 * piece of architecture rather than twelve separate posts.
 */
function Arcade({ accent }: { accent: string }) {
  const arches = useMemo(() => {
    // One arch per gap between neighbouring columns. Built as a flattened torus
    // arc sitting in the plane tangent to the ring.
    return Array.from({ length: COLUMN_COUNT }, (_, i) => {
      const a = ((i + 0.5) / COLUMN_COUNT) * Math.PI * 2
      return {
        key: i,
        x: Math.sin(a) * RING_RADIUS,
        z: Math.cos(a) * RING_RADIUS + CENTRE_Z,
        rotY: a,
      }
    })
  }, [])

  const span = (Math.PI * 2 * RING_RADIUS) / COLUMN_COUNT

  return (
    <group raycast={noRaycast}>
      {/* Entablature: the ring that ties every capital together. */}
      {[COLUMN_HEIGHT - 0.05, COLUMN_HEIGHT + 0.12].map((y, i) => (
        <mesh
          key={y}
          position={[0, y, CENTRE_Z]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <ringGeometry args={[RING_RADIUS - 0.1, RING_RADIUS + 0.1, 96]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={i === 0 ? 0.7 : 0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Arch curves. A half-ellipse of short segments spanning each gap. */}
      {arches.map((arch) => (
        <group
          key={arch.key}
          position={[arch.x, COLUMN_HEIGHT - 0.16, arch.z]}
          rotation={[0, arch.rotY, 0]}
          raycast={noRaycast}
        >
          {Array.from({ length: 9 }, (_, s) => {
            const t0 = (s / 9) * Math.PI
            const t1 = ((s + 1) / 9) * Math.PI
            const rx = span * 0.42
            const ry = 0.62
            const p0: [number, number] = [Math.cos(t0) * rx, Math.sin(t0) * ry]
            const p1: [number, number] = [Math.cos(t1) * rx, Math.sin(t1) * ry]
            const dx = p1[0] - p0[0]
            const dy = p1[1] - p0[1]

            return (
              <mesh
                key={s}
                position={[(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 0]}
                rotation={[0, 0, Math.atan2(dy, dx)]}
                raycast={noRaycast}
              >
                <planeGeometry args={[Math.hypot(dx, dy) * 1.06, 0.02]} />
                <meshBasicMaterial
                  color={accent}
                  transparent
                  opacity={0.55}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export function RotundaColonnade({ accent = NEON.cyan }: { accent?: string }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Almost imperceptible drift. The architecture should feel alive without
    // ever reading as spinning scenery.
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.012
  })

  const columns = useMemo(
    () =>
      Array.from({ length: COLUMN_COUNT }, (_, i) => (i / COLUMN_COUNT) * Math.PI * 2),
    [],
  )

  return (
    <group ref={groupRef} raycast={noRaycast}>
      {columns.map((a) => (
        <Column key={a} angle={a} accent={accent} />
      ))}
      <Arcade accent={accent} />
    </group>
  )
}
