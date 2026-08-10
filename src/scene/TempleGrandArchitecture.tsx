import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { UnicursalHexagramGlyph } from './ThelemicSigils'

type Props = {
  ritualImpulseRef: MutableRefObject<number>
  loading?: boolean
  oracleLoading?: boolean
  hasDeck?: boolean
  hasActiveCard?: boolean
  hasOracleReading?: boolean
}

const noRaycast = () => null

const CIRCUIT_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1.04],
  [-0.64, 0.68],
  [0.64, 0.68],
  [-0.92, 0.08],
  [0, 0.24],
  [0.92, 0.08],
  [-0.58, -0.48],
  [0.58, -0.48],
  [0, -0.94],
]

const CIRCUIT_LINKS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
  [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [7, 8],
]

function buildCircuitGeometry() {
  const positions: number[] = [
    -1.16, -1.18, 0, 1.16, -1.18, 0,
    1.16, -1.18, 0, 1.16, 0.7, 0,
    1.16, 0.7, 0, 0.72, 1.18, 0,
    0.72, 1.18, 0, -0.72, 1.18, 0,
    -0.72, 1.18, 0, -1.16, 0.7, 0,
    -1.16, 0.7, 0, -1.16, -1.18, 0,
  ]

  for (const [a, b] of CIRCUIT_LINKS) {
    const start = CIRCUIT_POINTS[a]
    const end = CIRCUIT_POINTS[b]
    positions.push(start[0], start[1], 0, end[0], end[1], 0)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  return geometry
}

/**
 * Sanctum-specific architecture inside the shared Neon Rotunda.
 *
 * The previous component predated the Rotunda and built another environment:
 * a huge floor, distant pillars, obelisks, a rear axis and multiple ray systems.
 * That duplicated the new common shell and made Sanctum uniquely expensive.
 *
 * This replacement is deliberately local: a compact hard-light circuit crown
 * behind the Forge. One line geometry + one instanced node mesh establish a
 * dense occult-instrument identity without rebuilding the room around it.
 */
export function TempleGrandArchitecture({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasDeck = false,
  hasActiveCard = false,
  hasOracleReading = false,
}: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const nodesRef = useRef<THREE.InstancedMesh>(null)
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const circuitGeometry = useMemo(() => buildCircuitGeometry(), [])

  const active =
    loading || oracleLoading || hasDeck || hasActiveCard || hasOracleReading
  const oracleActive = oracleLoading || hasOracleReading

  useEffect(() => {
    const mesh = nodesRef.current
    if (!mesh) return

    CIRCUIT_POINTS.forEach(([x, y], index) => {
      dummy.position.set(x, y, 0.025)
      dummy.scale.setScalar(index === 0 || index === 8 ? 1.28 : 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [dummy])

  useEffect(() => () => circuitGeometry.dispose(), [circuitGeometry])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (rootRef.current) {
      rootRef.current.rotation.z = Math.sin(t * 0.16) * 0.018
      rootRef.current.position.y = 2.38 + Math.sin(t * 0.42) * 0.018
    }

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity =
        0.24 +
        (active ? 0.12 : 0) +
        Math.sin(t * 0.72) * 0.035 +
        impulse * 0.16
    }

    if (haloRef.current) {
      const target =
        0.1 +
        (active ? 0.07 : 0) +
        (oracleActive ? 0.055 : 0) +
        impulse * 0.08
      haloRef.current.opacity = THREE.MathUtils.lerp(
        haloRef.current.opacity,
        target,
        delta * 2.4,
      )
    }
  })

  const accent = oracleActive ? '#ff2bd6' : loading ? '#ffffff' : '#ffd23f'

  return (
    <group
      ref={rootRef}
      position={[0, 2.38, -3.55]}
      scale={1.18}
      raycast={noRaycast}
    >
      {/* Opaque recess: architecture supplies depth without a full-screen veil. */}
      <mesh position={[0, 0.02, -0.13]} raycast={noRaycast}>
        <boxGeometry args={[2.62, 2.78, 0.2]} />
        <meshBasicMaterial color="#02050b" />
      </mesh>

      <mesh position={[0, 0.05, -0.018]} raycast={noRaycast}>
        <ringGeometry args={[1.18, 1.27, 56]} />
        <meshBasicMaterial
          ref={haloRef}
          color={accent}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={circuitGeometry} raycast={noRaycast}>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color={accent}
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, CIRCUIT_POINTS.length]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <circleGeometry args={[0.075, 18]} />
        <meshBasicMaterial
          color={oracleActive ? '#d8f6ff' : '#ffd23f'}
          transparent
          opacity={active ? 0.82 : 0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <group position={[0, 0.18, 0.04]} raycast={noRaycast}>
        <UnicursalHexagramGlyph
          radius={0.78}
          color={oracleActive ? '#a855ff' : '#d8f6ff'}
          opacity={active ? 0.46 : 0.22}
          lineWidth={2.0}
          withRose
        />
      </group>

      <mesh position={[0, -1.22, 0.02]} raycast={noRaycast}>
        <planeGeometry args={[2.1, 0.012]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.54 : 0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
