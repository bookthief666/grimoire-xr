import { useMemo, useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Props = {
  ritualImpulseRef: MutableRefObject<number>
  loading?: boolean
  oracleLoading?: boolean
  hasDeck?: boolean
  hasActiveCard?: boolean
  hasOracleReading?: boolean
}

type Vec2 = [number, number]

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

function FloorLine({
  a,
  b,
  color = '#b8860b',
  opacity = 0.32,
  width = 0.018,
}: {
  a: Vec2
  b: Vec2
  color?: string
  opacity?: number
  width?: number
}) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, -0.018, (a[1] + b[1]) / 2]}
      rotation={[-Math.PI / 2, 0, angle]}
      raycast={noRaycast}
    >
      <planeGeometry args={[length, width]} />
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

function DaliesqueVoidFloor() {
  const convergingLines = useMemo(
    () => [
      [[-3.3, -0.95], [-44, -34]],
      [[-2.1, -1.08], [-28, -34]],
      [[-0.75, -1.18], [-8, -34]],
      [[0.75, -1.18], [8, -34]],
      [[2.1, -1.08], [28, -34]],
      [[3.3, -0.95], [44, -34]],
      [[-48, -24], [48, -24]],
      [[-40, -14], [40, -14]],
      [[-28, -7.5], [28, -7.5]],
    ] as [Vec2, Vec2][],
    [],
  )

  return (
    <group raycast={noRaycast}>
      <mesh position={[0, -0.032, -14]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial
          color="#020101"
          emissive="#080202"
          emissiveIntensity={0.06}
          roughness={0.18}
          metalness={0.62}
        />
      </mesh>

      {convergingLines.map(([a, b], index) => (
        <FloorLine
          key={`${a.join(':')}-${b.join(':')}`}
          a={a}
          b={b}
          color={index < 6 ? '#b8860b' : '#ff5a1f'}
          opacity={index < 6 ? 0.22 : 0.1}
          width={index < 6 ? 0.018 : 0.012}
        />
      ))}
    </group>
  )
}

function TwistedPillar({
  side,
  active,
  ritualImpulseRef,
}: {
  side: 'photon' | 'dark'
  active: boolean
  ritualImpulseRef: MutableRefObject<number>
}) {
  const rootRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)
  const ringRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const x = side === 'photon' ? -4.8 : 4.8
  const baseColor = side === 'photon' ? '#fff4cc' : '#08030d'
  const seamColor = side === 'photon' ? '#ffd18a' : '#6b1a8d'
  const rimColor = side === 'photon' ? '#ffffff' : '#ff5a1f'

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (rootRef.current) {
      rootRef.current.rotation.y += delta * (side === 'photon' ? 0.055 : -0.044)
      rootRef.current.position.y = 3.0 + Math.sin(t * 0.42 + x) * 0.11
    }

    if (coreRef.current) {
      coreRef.current.opacity = side === 'photon'
        ? 0.2 + Math.sin(t * 0.9) * 0.045 + impulse * 0.06
        : 0.58 + Math.sin(t * 0.55) * 0.05
    }

    ringRefs.current.forEach((mat, index) => {
      if (!mat) return
      mat.opacity = (active ? 0.34 : 0.22) + Math.sin(t * 0.78 + index) * 0.045 + impulse * 0.04
    })
  })

  return (
    <group ref={rootRef} position={[x, 3.0, -18.6]} raycast={noRaycast}>
      <mesh rotation={[0, 0, side === 'photon' ? 0.06 : -0.08]} raycast={noRaycast}>
        <cylinderGeometry args={[0.42, 0.72, 8.8, 10, 1, false]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={side === 'photon' ? '#5f3200' : '#020006'}
          emissiveIntensity={side === 'photon' ? 0.42 : 0.16}
          roughness={side === 'photon' ? 0.22 : 0.34}
          metalness={side === 'photon' ? 0.72 : 0.86}
          transparent
          opacity={side === 'photon' ? 0.24 : 0.82}
        />
      </mesh>

      <mesh raycast={noRaycast}>
        <cylinderGeometry args={[0.18, 0.28, 9.8, 8, 1, false]} />
        <meshBasicMaterial
          ref={coreRef}
          color={side === 'photon' ? '#ffffff' : '#180024'}
          transparent
          opacity={side === 'photon' ? 0.22 : 0.58}
          depthWrite={false}
          blending={side === 'photon' ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>

      {Array.from({ length: 9 }, (_, index) => {
        const y = -4 + index
        const phase = index * 0.72
        return (
          <group key={index} position={[Math.sin(phase) * 0.2, y, Math.cos(phase) * 0.2]} rotation={[0.24, phase, 0]}>
            <Ring
              position={[0, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              radius={0.62 - index * 0.018}
              tube={0.012}
              color={index % 2 === 0 ? seamColor : rimColor}
              opacity={side === 'photon' ? 0.48 : 0.32}
            />
            <mesh position={[0, 0, 0.02]} raycast={noRaycast}>
              <boxGeometry args={[1.12, 0.026, 0.026]} />
              <meshBasicMaterial
                ref={(el) => {
                  ringRefs.current[index] = el
                }}
                color={index % 2 === 0 ? seamColor : rimColor}
                transparent
                opacity={0.26}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )
      })}

      {['☉', '☽', '♀', '☿', '♃', '♄'].map((glyph, index) => (
        <Text
          key={`${side}-${glyph}`}
          position={[side === 'photon' ? -0.76 : 0.76, 3.3 - index * 1.12, 0.18]}
          rotation={[0, side === 'photon' ? 0.18 : -0.18, 0]}
          fontSize={0.16}
          color={side === 'photon' ? '#fff4cc' : '#ff7a3d'}
          anchorX="center"
          anchorY="middle"
          fillOpacity={side === 'photon' ? 0.42 : 0.32}
          raycast={noRaycast}
        >
          {glyph}
        </Text>
      ))}
    </group>
  )
}

function TwinThelemicPillars({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasOracleReading = false,
}: Props) {
  const active = loading || oracleLoading || hasOracleReading

  return (
    <group raycast={noRaycast}>
      <TwistedPillar side="photon" active={active} ritualImpulseRef={ritualImpulseRef} />
      <TwistedPillar side="dark" active={active} ritualImpulseRef={ritualImpulseRef} />
    </group>
  )
}

function FloatingObeliskField({ ritualImpulseRef }: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const stones = useMemo(
    () => [
      { p: [-7.4, 2.1, -10.4], s: [0.34, 1.65, 0.34], r: [0.38, 0.18, -0.24], c: '#090707' },
      { p: [6.6, 3.2, -12.2], s: [0.42, 2.15, 0.42], r: [-0.18, -0.34, 0.28], c: '#12100d' },
      { p: [-10.8, 4.3, -18.8], s: [0.62, 2.8, 0.62], r: [0.5, 0.9, -0.16], c: '#050305' },
      { p: [11.4, 5.0, -21.6], s: [0.72, 3.2, 0.72], r: [-0.32, -0.5, 0.22], c: '#0d0b09' },
      { p: [-4.4, 6.3, -26.5], s: [1.1, 0.44, 2.2], r: [0.42, -0.9, 0.18], c: '#15120f' },
      { p: [4.8, 7.6, -30.0], s: [1.4, 0.52, 3.0], r: [-0.24, 0.65, -0.34], c: '#080606' },
      { p: [-14.4, 6.8, -31.5], s: [0.9, 3.8, 0.9], r: [0.14, 0.42, -0.5], c: '#100e0d' },
      { p: [15.2, 3.6, -16.2], s: [0.54, 2.2, 0.54], r: [-0.52, -0.2, 0.38], c: '#050404' },
    ] as { p: [number, number, number]; s: [number, number, number]; r: [number, number, number]; c: string }[],
    [],
  )

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    if (!rootRef.current) return

    rootRef.current.children.forEach((child, index) => {
      child.position.y += Math.sin(t * 0.32 + index * 1.7) * 0.0009
      child.rotation.y += delta * (0.035 + index * 0.003 + impulse * 0.02)
    })
  })

  return (
    <group ref={rootRef} raycast={noRaycast}>
      {stones.map((stone, index) => (
        <group key={index} position={stone.p} rotation={stone.r} scale={stone.s} raycast={noRaycast}>
          <mesh raycast={noRaycast}>
            {index % 3 === 0 ? <octahedronGeometry args={[1, 0]} /> : <boxGeometry args={[1, 1, 1]} />}
            <meshStandardMaterial
              color={stone.c}
              emissive="#140501"
              emissiveIntensity={0.16}
              roughness={0.24}
              metalness={0.78}
            />
          </mesh>
          <mesh position={[0, 0.51, 0.01]} raycast={noRaycast}>
            <boxGeometry args={[0.045, 1.04, 0.045]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? '#ff5a1f' : '#b8860b'}
              transparent
              opacity={0.38}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function HolographicThelemicAxis({
  ritualImpulseRef,
  hasDeck = false,
  hasActiveCard = false,
  hasOracleReading = false,
}: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const active = hasDeck || hasActiveCard || hasOracleReading

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (rootRef.current) {
      rootRef.current.rotation.z = Math.sin(t * 0.18) * 0.018
      rootRef.current.position.y = 3.42 + Math.sin(t * 0.37) * 0.04
      rootRef.current.rotation.y += delta * (0.006 + impulse * 0.004)
    }
  })

  const unicursal = useMemo<Vec2[]>(
    () => [
      [0, 1.25],
      [0.64, -0.12],
      [-0.98, 0.5],
      [0.98, 0.5],
      [-0.64, -0.12],
      [0, 1.25],
      [0.0, -1.05],
      [0.64, -0.12],
      [-0.64, -0.12],
      [0.0, -1.05],
    ],
    [],
  )

  return (
    <group ref={rootRef} position={[0, 3.42, -23.8]} scale={3.1} raycast={noRaycast}>
      <mesh position={[0, 0, -0.04]} raycast={noRaycast}>
        <planeGeometry args={[3.25, 3.8]} />
        <meshBasicMaterial
          color="#040202"
          transparent
          opacity={0.05}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Ring position={[0, 0, 0]} rotation={[0, 0, 0]} radius={1.42} tube={0.006} color="#b8860b" opacity={active ? 0.18 : 0.09} />
      <Ring position={[0, 0, 0.01]} rotation={[0, 0, Math.PI / 6]} radius={0.92} tube={0.004} color="#ffffff" opacity={active ? 0.12 : 0.055} />

      {unicursal.slice(0, -1).map((point, index) => {
        const next = unicursal[index + 1]
        const dx = next[0] - point[0]
        const dy = next[1] - point[1]
        const length = Math.hypot(dx, dy)
        const angle = Math.atan2(dy, dx)
        return (
          <mesh
            key={index}
            position={[(point[0] + next[0]) / 2, (point[1] + next[1]) / 2, 0.04]}
            rotation={[0, 0, angle]}
            raycast={noRaycast}
          >
            <planeGeometry args={[length, 0.014]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? '#ffcf7c' : '#ff3d1f'}
              transparent
              opacity={active ? 0.18 : 0.09}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}

      <Text visible={false} position={[0, -1.72, 0.08]} fontSize={0.08} color="#b8860b" anchorX="center" anchorY="middle" raycast={noRaycast}>
        93 // ABRAHADABRA // 418
      </Text>
    </group>
  )
}

function HardLightAstrolabe({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasOracleReading = false,
}: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)
  const oracleBoost = oracleLoading || hasOracleReading

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (rootRef.current) {
      rootRef.current.rotation.y += delta * (0.035 + impulse * 0.04 + (oracleBoost ? 0.025 : 0))
      rootRef.current.rotation.x = Math.sin(t * 0.2) * 0.06
    }

    if (coreRef.current) {
      coreRef.current.opacity = Math.min(0.5, 0.12 + Math.sin(t * 1.2) * 0.04 + impulse * 0.08 + (loading ? 0.08 : 0))
    }
  })

  return (
    <group ref={rootRef} position={[0, 6.4, -5.4]} scale={2.75} raycast={noRaycast}>
      <Ring position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.92} tube={0.01} color="#ffcf7c" opacity={0.28} />
      <Ring position={[0, 0, 0]} rotation={[0.95, 0, 0.45]} radius={0.7} tube={0.008} color="#ffffff" opacity={0.16} />
      <Ring position={[0, 0, 0]} rotation={[0, Math.PI / 2, -0.22]} radius={0.55} tube={0.006} color="#ff5a1f" opacity={0.14} />
      <mesh raycast={noRaycast}>
        <sphereGeometry args={[0.095, 16, 10]} />
        <meshBasicMaterial
          ref={coreRef}
          color={oracleBoost ? '#ffd18a' : '#ffffff'}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
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
  const oracleColor = oracleLoading || hasOracleReading ? '#ffcf7c' : '#b8860b'
  const forgeColor = loading ? '#ffffff' : '#ff6a00'

  return (
    <group raycast={noRaycast}>
      <Beam
        position={[0, 1.72, -1.02]}
        rotation={[0, 0, 0]}
        size={[0.24, 2.7]}
        color={oracleColor}
        opacity={active ? 0.032 : 0.012}
      />

      <Beam
        position={[-1.24, 1.08, -1.3]}
        rotation={[0, 0, -0.3]}
        size={[0.12, 2.2]}
        color="#ff5a1f"
        opacity={active ? 0.026 : 0.008}
      />

      <Beam
        position={[1.24, 1.08, -1.3]}
        rotation={[0, 0, 0.3]}
        size={[0.12, 2.2]}
        color="#b8860b"
        opacity={active ? 0.024 : 0.008}
      />

      <Beam
        position={[0, 0.12, -0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[2.35, 0.045]}
        color={forgeColor}
        opacity={loading ? 0.12 : 0.03}
      />
    </group>
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
      <DaliesqueVoidFloor />
      <TwinThelemicPillars
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
      />
      <FloatingObeliskField ritualImpulseRef={ritualImpulseRef} />
      <HolographicThelemicAxis
        ritualImpulseRef={ritualImpulseRef}
        hasDeck={hasDeck}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
      <HardLightAstrolabe
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
      />
      <ChamberRaySystem
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasDeck={hasDeck}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
    </group>
  )
}
