import { useMemo, useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Props = {
  ritualImpulseRef?: MutableRefObject<number>
  loading?: boolean
  oracleLoading?: boolean
  hasDeck?: boolean
  hasActiveCard?: boolean
  hasOracleReading?: boolean
}

const noRaycast = () => null

function Ring({
  position,
  rotation = [0, 0, 0],
  radius,
  tube = 0.01,
  color,
  opacity,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  radius: number
  tube?: number
  color: string
  opacity: number
}) {
  return (
    <mesh position={position} rotation={rotation} raycast={noRaycast}>
      <torusGeometry args={[radius, tube, 8, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function Beam({
  position,
  rotation,
  size,
  color,
  opacity,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  color: string
  opacity: number
}) {
  return (
    <mesh position={position} rotation={rotation} raycast={noRaycast}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function GrandAstralDome({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasDeck = false,
  hasOracleReading = false,
}: Props) {
  const domeRef = useRef<THREE.MeshBasicMaterial>(null)
  const ringRootRef = useRef<THREE.Group>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const boost =
      (loading ? 0.25 : 0) +
      (oracleLoading ? 0.35 : 0) +
      (hasDeck ? 0.18 : 0) +
      (hasOracleReading ? 0.28 : 0)

    if (domeRef.current) {
      domeRef.current.opacity = Math.min(0.34, 0.075 + Math.sin(t * 0.55) * 0.018 + boost * 0.08 + impulse * 0.04)
    }

    if (ringRootRef.current) {
      ringRootRef.current.rotation.y += delta * (0.018 + boost * 0.016 + impulse * 0.015)
      ringRootRef.current.rotation.z = Math.sin(t * 0.14) * 0.035
    }
  })

  return (
    <group position={[0, 0, -1.15]} raycast={noRaycast}>
      <mesh position={[0, 0.02, 0]} raycast={noRaycast}>
        <sphereGeometry args={[3.55, 48, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshBasicMaterial
          ref={domeRef}
          color="#5f1dff"
          transparent
          opacity={0.09}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      <group ref={ringRootRef} position={[0, 2.72, 0]}>
        <Ring position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={2.6} tube={0.012} color="#8a35ff" opacity={0.24} />
        <Ring position={[0, 0, 0]} rotation={[Math.PI / 2, 0, Math.PI / 5]} radius={2.08} tube={0.01} color="#b8860b" opacity={0.22} />
        <Ring position={[0, 0, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 7]} radius={1.36} tube={0.009} color="#ff3d5a" opacity={0.18} />
        <Ring position={[0, 0, 0]} rotation={[0.9, 0, 0]} radius={1.72} tube={0.007} color="#d9b5ff" opacity={0.16} />
      </group>
    </group>
  )
}

function CeilingOrrery({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasOracleReading = false,
}: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const oracleBoost = oracleLoading || hasOracleReading ? 1 : 0

    if (rootRef.current) {
      rootRef.current.rotation.y += delta * (0.06 + impulse * 0.08 + oracleBoost * 0.05)
      rootRef.current.rotation.x = Math.sin(t * 0.21) * 0.08
    }

    if (coreRef.current) {
      coreRef.current.opacity = Math.min(0.86, 0.28 + Math.sin(t * 1.3) * 0.08 + impulse * 0.2 + oracleBoost * 0.2)
    }
  })

  return (
    <group ref={rootRef} position={[0, 3.05, -1.1]} raycast={noRaycast}>
      <Ring position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.92} tube={0.012} color="#ffcf7c" opacity={0.46} />
      <Ring position={[0, 0, 0]} rotation={[0.9, 0, 0]} radius={0.72} tube={0.01} color="#8a35ff" opacity={0.36} />
      <Ring position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} radius={0.55} tube={0.008} color="#ff3d5a" opacity={0.25} />

      <mesh raycast={noRaycast}>
        <sphereGeometry args={[0.115, 18, 12]} />
        <meshBasicMaterial
          ref={coreRef}
          color={loading ? '#ff5d3d' : oracleLoading || hasOracleReading ? '#d9b5ff' : '#ffd18a'}
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {['☉', '☽', '♀', '☿', '♃', '♄', '♁'].map((glyph, i) => {
        const angle = (i / 7) * Math.PI * 2
        return (
          <Text
            key={glyph}
            position={[Math.cos(angle) * 1.14, Math.sin(angle) * 0.16, Math.sin(angle) * 1.14]}
            fontSize={0.11}
            color={i % 2 === 0 ? '#ffd18a' : '#9a6bff'}
            anchorX="center"
            anchorY="middle"
            raycast={noRaycast}
          >
            {glyph}
          </Text>
        )
      })}
    </group>
  )
}

function TreeOfLifeMachineWall({
  oracleLoading = false,
  hasOracleReading = false,
  hasDeck = false,
}: Props) {
  const nodes = useMemo(
    () =>
      [
        [0, 1.18],
        [-0.48, 0.82],
        [0.48, 0.82],
        [-0.72, 0.32],
        [0, 0.32],
        [0.72, 0.32],
        [-0.48, -0.18],
        [0.48, -0.18],
        [0, -0.62],
        [0, -1.02],
      ] as [number, number][],
    [],
  )

  const paths = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
    [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [7, 8], [8, 9],
  ]

  const active = oracleLoading || hasOracleReading || hasDeck

  return (
    <group position={[0, 1.78, -3.25]} scale={1.38} raycast={noRaycast}>
      <mesh position={[0, 0.05, -0.03]} raycast={noRaycast}>
        <planeGeometry args={[2.25, 2.8]} />
        <meshBasicMaterial
          color="#090205"
          transparent
          opacity={0.44}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {paths.map(([a, b], i) => {
        const start = nodes[a]
        const end = nodes[b]
        const dx = end[0] - start[0]
        const dy = end[1] - start[1]
        const length = Math.hypot(dx, dy)
        const angle = Math.atan2(dy, dx)

        return (
          <mesh
            key={i}
            position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, 0.04]}
            rotation={[0, 0, angle]}
            raycast={noRaycast}
          >
            <planeGeometry args={[length, i % 3 === 0 ? 0.018 : 0.011]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? '#9a6bff' : '#b8860b'}
              transparent
              opacity={active ? 0.48 : 0.22}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}

      {nodes.map(([x, y], i) => (
        <group key={i} position={[x, y, 0.07]} raycast={noRaycast}>
          <mesh raycast={noRaycast}>
            <circleGeometry args={[i === 0 || i === 9 ? 0.065 : 0.048, 24]} />
            <meshBasicMaterial
              color={active ? (i % 2 === 0 ? '#ffd18a' : '#d9b5ff') : '#8a6a3a'}
              transparent
              opacity={active ? 0.76 : 0.34}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      <Text
        position={[0, -1.38, 0.1]}
        fontSize={0.066}
        color={active ? '#d9b5ff' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.0}
        raycast={noRaycast}
      >
        TREE OF LIGHT // PATH ENGINE
      </Text>
    </group>
  )
}

function ChamberRaySystem({
  loading = false,
  oracleLoading = false,
  hasDeck = false,
  hasActiveCard = false,
  hasOracleReading = false,
}: Props) {
  const active = loading || oracleLoading || hasDeck || hasActiveCard || hasOracleReading
  const oracleColor = oracleLoading || hasOracleReading ? '#9a6bff' : '#b8860b'
  const forgeColor = loading ? '#ff3d5a' : '#ffcf7c'

  return (
    <group raycast={noRaycast}>
      <Beam
        position={[0, 1.55, -0.92]}
        rotation={[0, 0, 0]}
        size={[0.42, 2.65]}
        color={oracleColor}
        opacity={active ? 0.16 : 0.055}
      />

      <Beam
        position={[-1.18, 1.32, -1.4]}
        rotation={[0, 0, -0.22]}
        size={[0.18, 2.45]}
        color="#8a1034"
        opacity={active ? 0.12 : 0.045}
      />

      <Beam
        position={[1.18, 1.32, -1.4]}
        rotation={[0, 0, 0.22]}
        size={[0.18, 2.45]}
        color="#6b35ff"
        opacity={active ? 0.12 : 0.045}
      />

      <Beam
        position={[0, 0.12, -0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[2.2, 0.06]}
        color={forgeColor}
        opacity={loading ? 0.38 : 0.14}
      />
    </group>
  )
}

function HumanScaleMarkerText({ hasDeck = false, oracleLoading = false, hasOracleReading = false }: Props) {
  const text = oracleLoading
    ? 'THE ORACLE IS SPEAKING THROUGH THE MACHINE'
    : hasOracleReading
      ? 'THE READING HAS BEEN INSCRIBED INTO THE TEMPLE'
      : hasDeck
        ? 'THE DECK IS ALIVE IN THE MATRIX'
        : 'APPROACH THE ALTAR AND CONFIGURE THE FORGE'

  return (
    <Text
      position={[0, 1.2, -0.18]}
      fontSize={0.052}
      color={oracleLoading || hasOracleReading ? '#d9b5ff' : '#b8860b'}
      anchorX="center"
      anchorY="middle"
      maxWidth={2.25}
      raycast={noRaycast}
    >
      {text}
    </Text>
  )
}

export function TempleGrandArchitecture({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasDeck = false,
  hasActiveCard = false,
  hasOracleReading = false,
}: Props) {
  return (
    <group>
      <GrandAstralDome
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasDeck={hasDeck}
        hasOracleReading={hasOracleReading}
      />
      <CeilingOrrery
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
      />
      <TreeOfLifeMachineWall
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
        hasDeck={hasDeck}
      />
      <ChamberRaySystem
        loading={loading}
        oracleLoading={oracleLoading}
        hasDeck={hasDeck}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
      <HumanScaleMarkerText
        hasDeck={hasDeck}
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
      />
    </group>
  )
}
