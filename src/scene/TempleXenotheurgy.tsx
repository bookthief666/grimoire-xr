import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BabalonStarGlyph } from './ThelemicSigils'

type Props = {
  ritualImpulseRef: MutableRefObject<number>
  loading?: boolean
  oracleLoading?: boolean
  hasActiveCard?: boolean
  hasOracleReading?: boolean
  hasDeck?: boolean
}

const noRaycast = () => null
const CARD_COUNT = 78
const NODE_COUNT = 8

function writeCardMatrices(mesh: THREE.InstancedMesh, dummy: THREE.Object3D) {
  for (let index = 0; index < CARD_COUNT; index += 1) {
    const major = index < 22
    const lane = major ? 0 : 1 + ((index - 22) % 4)
    const laneIndex = major ? index : Math.floor((index - 22) / 4)
    const laneCount = major ? 22 : 14
    const t = laneCount <= 1 ? 0 : laneIndex / (laneCount - 1)
    const arc = -Math.PI * 0.82 + t * Math.PI * 1.64
    const radius = major ? 1.15 : 1.38 + lane * 0.055

    dummy.position.set(
      Math.sin(arc) * radius,
      Math.cos(arc) * 0.34 - 0.12 + lane * 0.01,
      -0.02 - lane * 0.012,
    )
    dummy.rotation.set(0, -arc * 0.16, 0)
    dummy.scale.setScalar(major ? 1.15 : 0.8)
    dummy.updateMatrix()
    mesh.setMatrixAt(index, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}

function writeNodeMatrices(mesh: THREE.InstancedMesh, dummy: THREE.Object3D) {
  for (let index = 0; index < NODE_COUNT; index += 1) {
    const angle = (index / NODE_COUNT) * Math.PI * 2
    const radius = index % 2 === 0 ? 0.76 : 0.58
    dummy.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 2) * 0.12,
      Math.sin(angle) * radius * 0.36,
    )
    dummy.rotation.set(angle * 0.5, angle, 0)
    dummy.scale.setScalar(index % 2 === 0 ? 1 : 0.72)
    dummy.updateMatrix()
    mesh.setMatrixAt(index, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
}

/**
 * Compact astral engine for the Sanctum.
 *
 * The pre-Rotunda Xenotheurgy layer was a complete second environment. This
 * keeps its useful semantic cues — an orrery, the 78-card field and ritual
 * nodes — but collapses the backdrop into a handful of GPU draws. The Rotunda
 * now owns architecture; this component only visualizes the active magical
 * process above and behind the Forge.
 */
export function TempleXenotheurgy({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasActiveCard = false,
  hasOracleReading = false,
  hasDeck = false,
}: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const cardRootRef = useRef<THREE.Group>(null)
  const ringARef = useRef<THREE.Group>(null)
  const ringBRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)
  const veilRef = useRef<THREE.MeshBasicMaterial>(null)
  const cardsRef = useRef<THREE.InstancedMesh>(null)
  const nodesRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const active =
    loading || oracleLoading || hasActiveCard || hasOracleReading || hasDeck
  const oracleActive = oracleLoading || hasOracleReading

  useEffect(() => {
    if (cardsRef.current) writeCardMatrices(cardsRef.current, dummy)
    if (nodesRef.current) writeNodeMatrices(nodesRef.current, dummy)
  }, [dummy])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const speed = loading ? 0.22 : oracleLoading ? 0.16 : active ? 0.09 : 0.035

    if (rootRef.current) {
      rootRef.current.position.y = 2.2 + Math.sin(t * 0.42) * 0.025
      rootRef.current.rotation.z = Math.sin(t * 0.14) * 0.016
    }

    if (ringARef.current) ringARef.current.rotation.y += delta * (speed + impulse * 0.08)
    if (ringBRef.current) ringBRef.current.rotation.x -= delta * (speed * 0.72 + impulse * 0.05)
    if (cardRootRef.current) cardRootRef.current.rotation.z += delta * (active ? 0.014 : 0.004)

    if (coreRef.current) {
      coreRef.current.opacity = Math.min(
        0.72,
        0.2 +
          (active ? 0.14 : 0) +
          Math.sin(t * 1.2) * 0.05 +
          impulse * 0.22,
      )
    }

    if (veilRef.current) {
      veilRef.current.opacity =
        0.035 +
        (active ? 0.025 : 0) +
        (oracleActive ? 0.028 : 0) +
        impulse * 0.04
    }
  })

  const accent = oracleActive ? '#ff2bd6' : loading ? '#ffffff' : '#00e5ff'
  const secondary = oracleActive ? '#a855ff' : '#ffd23f'

  return (
    <group
      ref={rootRef}
      position={[0, 2.2, -2.95]}
      scale={1.05}
      raycast={noRaycast}
    >
      {/* One faint veil anchors the engine into the central Sanctum bay. */}
      <mesh position={[0, 0, -0.09]} raycast={noRaycast}>
        <circleGeometry args={[1.62, 48]} />
        <meshBasicMaterial
          ref={veilRef}
          color={accent}
          transparent
          opacity={0.035}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={ringARef} raycast={noRaycast}>
        <mesh rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <torusGeometry args={[0.78, 0.012, 6, 64]} />
          <meshBasicMaterial
            color={secondary}
            transparent
            opacity={active ? 0.58 : 0.26}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <group ref={ringBRef} raycast={noRaycast}>
        <mesh rotation={[0.78, 0.2, 0.4]} raycast={noRaycast}>
          <torusGeometry args={[0.58, 0.01, 6, 56]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={active ? 0.5 : 0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <mesh raycast={noRaycast}>
        <sphereGeometry args={[0.095, 12, 8]} />
        <meshBasicMaterial
          ref={coreRef}
          color={oracleActive ? '#ffffff' : '#d8f6ff'}
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group position={[0, 0, 0.04]} raycast={noRaycast}>
        <BabalonStarGlyph
          radius={0.48}
          color={secondary}
          opacity={active ? 0.42 : 0.18}
          lineWidth={1.8}
          withRose
        />
      </group>

      {/* All seventy-eight card loci share one geometry/material draw. */}
      <group ref={cardRootRef} position={[0, -0.08, -0.015]} raycast={noRaycast}>
        <instancedMesh
          ref={cardsRef}
          args={[undefined, undefined, CARD_COUNT]}
          raycast={noRaycast}
          frustumCulled={false}
        >
          <planeGeometry args={[0.045, 0.072]} />
          <meshBasicMaterial
            color={hasDeck ? '#ffd23f' : '#6b5518'}
            transparent
            opacity={hasDeck ? 0.34 : active ? 0.16 : 0.075}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      </group>

      {/* Ritual nodes are another single instanced draw. */}
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, NODE_COUNT]}
        raycast={noRaycast}
        frustumCulled={false}
      >
        <octahedronGeometry args={[0.055, 0]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.62 : 0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}
