import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'

const noRaycast = () => null

/**
 * The colonnade: the wall of the rotunda.
 *
 * The floor alone left the temple half-built — past the horizon ring there was
 * nothing but black, so the space read as a lit disc suspended in void. Columns
 * and arches give the floor something to belong to and give the eye vertical
 * scale. A room is only as tall as its walls say it is.
 *
 * Everything is neon line-work rather than lit stone: dark opaque shafts that
 * depth-write so the room gains a real inside and outside, with bright additive
 * strips down the visible faces.
 *
 * ## Why this is instanced and merged rather than composed
 *
 * A readable version of this — one `<mesh>` per shaft, strip, band and arch
 * segment — costs about 170 draw calls. That is unaffordable here: the scene is
 * already several times over the standalone-Quest budget, and WebXR renders
 * once per eye. Since every column is the same object at a different angle, and
 * every arch segment shares one material, the whole colonnade collapses to six
 * draws: four instanced meshes and one merged arch geometry, plus the
 * entablature.
 */

const COLUMN_COUNT = 12
const RING_RADIUS = 6.4
const COLUMN_HEIGHT = 4.6
const CENTRE_Z = -1.0
const ARCH_SEGMENTS = 9
const STRIP_OFFSET = 0.11
const SPAN = (Math.PI * 2 * RING_RADIUS) / COLUMN_COUNT

/** World transform of column `i`: on the ring, turned to face the centre. */
function columnMatrix(i: number, out: THREE.Matrix4) {
  const a = (i / COLUMN_COUNT) * Math.PI * 2
  return out.compose(
    new THREE.Vector3(
      Math.sin(a) * RING_RADIUS,
      0,
      Math.cos(a) * RING_RADIUS + CENTRE_Z,
    ),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0)),
    new THREE.Vector3(1, 1, 1),
  )
}

/**
 * All arch curves as one geometry.
 *
 * Each arch spans the gap between two columns as a half-ellipse of short quads.
 * Rather than emitting 12 x 9 meshes, every quad is written directly into a
 * single buffer in world space.
 */
function buildArchGeometry() {
  const positions: number[] = []
  const half = 0.01 // half the 0.02 ribbon width

  const p = new THREE.Vector3()
  const m = new THREE.Matrix4()

  for (let arch = 0; arch < COLUMN_COUNT; arch += 1) {
    // Arches sit half a bay round from the columns, at capital height.
    const a = ((arch + 0.5) / COLUMN_COUNT) * Math.PI * 2
    m.compose(
      new THREE.Vector3(
        Math.sin(a) * RING_RADIUS,
        COLUMN_HEIGHT - 0.16,
        Math.cos(a) * RING_RADIUS + CENTRE_Z,
      ),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0)),
      new THREE.Vector3(1, 1, 1),
    )

    for (let s = 0; s < ARCH_SEGMENTS; s += 1) {
      const t0 = (s / ARCH_SEGMENTS) * Math.PI
      const t1 = ((s + 1) / ARCH_SEGMENTS) * Math.PI
      const rx = SPAN * 0.42
      const ry = 0.62

      const x0 = Math.cos(t0) * rx
      const y0 = Math.sin(t0) * ry
      const x1 = Math.cos(t1) * rx
      const y1 = Math.sin(t1) * ry

      // Perpendicular in the arch plane, so the ribbon keeps a constant width.
      const dx = x1 - x0
      const dy = y1 - y0
      const len = Math.hypot(dx, dy) || 1
      const nx = (-dy / len) * half
      const ny = (dx / len) * half

      const corners: Array<[number, number]> = [
        [x0 + nx, y0 + ny],
        [x0 - nx, y0 - ny],
        [x1 - nx, y1 - ny],
        [x1 + nx, y1 + ny],
      ]

      // Two triangles per quad, transformed into world space as we go.
      for (const [ci0, ci1, ci2] of [
        [0, 1, 2],
        [0, 2, 3],
      ]) {
        for (const ci of [ci0, ci1, ci2]) {
          p.set(corners[ci][0], corners[ci][1], 0).applyMatrix4(m)
          positions.push(p.x, p.y, p.z)
        }
      }
    }
  }

  const geom = new THREE.BufferGeometry()
  geom.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  return geom
}

export function RotundaColonnade({ accent = NEON.cyan }: { accent?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const shaftRef = useRef<THREE.InstancedMesh>(null)
  const stripRef = useRef<THREE.InstancedMesh>(null)
  const bandRef = useRef<THREE.InstancedMesh>(null)

  const archGeometry = useMemo(() => buildArchGeometry(), [])

  // Dispose the merged buffer on unmount; it is built imperatively, so React
  // will not clean it up for us.
  useEffect(() => () => archGeometry.dispose(), [archGeometry])

  useEffect(() => {
    const base = new THREE.Matrix4()
    const local = new THREE.Matrix4()
    const world = new THREE.Matrix4()

    for (let i = 0; i < COLUMN_COUNT; i += 1) {
      columnMatrix(i, base)

      // Shaft, centred on the column's half-height.
      shaftRef.current?.setMatrixAt(
        i,
        world.multiplyMatrices(
          base,
          local.makeTranslation(0, COLUMN_HEIGHT / 2, 0),
        ),
      )

      // Two lit strips per column, offset either side of the facing edge, so
      // the shaft reads as round rather than as a flat card.
      ;[-STRIP_OFFSET, STRIP_OFFSET].forEach((ox, k) => {
        stripRef.current?.setMatrixAt(
          i * 2 + k,
          world.multiplyMatrices(
            base,
            local.makeTranslation(ox, COLUMN_HEIGHT / 2, 0.175),
          ),
        )
      })

      // Capital and base bands, laid flat.
      ;[0.12, COLUMN_HEIGHT - 0.16].forEach((y, k) => {
        local
          .makeRotationX(-Math.PI / 2)
          .premultiply(new THREE.Matrix4().makeTranslation(0, y, 0))
        bandRef.current?.setMatrixAt(i * 2 + k, world.multiplyMatrices(base, local))
      })
    }

    if (shaftRef.current) shaftRef.current.instanceMatrix.needsUpdate = true
    if (stripRef.current) stripRef.current.instanceMatrix.needsUpdate = true
    if (bandRef.current) bandRef.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Almost imperceptible drift. The architecture should feel alive without
    // ever reading as spinning scenery.
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.012
  })

  return (
    <group ref={groupRef} raycast={noRaycast}>
      {/* Shafts. Opaque and depth-writing, so additive glow beyond the
          colonnade is correctly occluded. */}
      <instancedMesh
        ref={shaftRef}
        args={[undefined, undefined, COLUMN_COUNT]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.17, 0.21, COLUMN_HEIGHT, 8]} />
        <meshBasicMaterial color={NEON.void} />
      </instancedMesh>

      {/* Vertical neon strips. */}
      <instancedMesh
        ref={stripRef}
        args={[undefined, undefined, COLUMN_COUNT * 2]}
        raycast={noRaycast}
        frustumCulled={false}
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
      </instancedMesh>

      {/* Capital and base bands. */}
      <instancedMesh
        ref={bandRef}
        args={[undefined, undefined, COLUMN_COUNT * 2]}
        raycast={noRaycast}
        frustumCulled={false}
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
      </instancedMesh>

      {/* Every arch curve, in one draw. */}
      <mesh geometry={archGeometry} raycast={noRaycast} frustumCulled={false}>
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Entablature: the rings that tie every capital together. */}
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
    </group>
  )
}
