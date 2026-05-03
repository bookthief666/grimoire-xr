import { useMemo, useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { UnicursalHexagramGlyph } from './ThelemicSigils'

type TempleAtmosphereProps = {
  ritualImpulseRef: MutableRefObject<number>
  hasActiveCard: boolean
  hasOracleReading: boolean
}

type Point2 = [number, number]

function GlyphPlaneLine({
  a,
  b,
  z = -4.08,
  color = '#ffb000',
  opacity = 0.38,
  width = 0.018,
}: {
  a: Point2
  b: Point2
  z?: number
  color?: string
  opacity?: number
  width?: number
}) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]}
      rotation={[0, 0, angle]}
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

function CosmicVoid() {
  const starData = useMemo(() => {
    return Array.from({ length: 78 }, (_, index) => {
      const theta = Math.random() * Math.PI * 2
      const y = 0.2 + Math.random() * 9.0
      const radius = 10 + Math.random() * 28
      return {
        id: index,
        position: [
          Math.cos(theta) * radius,
          y,
          Math.sin(theta) * radius - 18,
        ] as [number, number, number],
        size: 0.012 + Math.random() * 0.026,
        phase: Math.random() * Math.PI * 2,
        warm: index % 9 === 0,
      }
    })
  }, [])

  const starRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    for (let i = 0; i < starRefs.current.length; i += 1) {
      const star = starRefs.current[i]
      const data = starData[i]
      if (!star) continue

      const pulse = 0.72 + Math.sin(t * 0.55 + data.phase) * 0.28
      star.scale.setScalar(data.size * (1 + pulse * 0.55))
    }
  })

  return (
    <group>
      <mesh position={[0, 2.4, -16]}>
        <sphereGeometry args={[64, 36, 18]} />
        <meshBasicMaterial
          color="#010103"
          side={THREE.BackSide}
          transparent
          opacity={1}
        />
      </mesh>

      {starData.map((star, index) => (
        <mesh
          key={star.id}
          ref={(el) => {
            starRefs.current[index] = el
          }}
          position={star.position}
        >
          <sphereGeometry args={[star.size, 5, 5]} />
          <meshBasicMaterial
            color={star.warm ? '#f8f3df' : '#d8e8ff'}
            transparent
            opacity={star.warm ? 0.52 : 0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function HolographicFloorAura({
  ritualImpulseRef,
  hasOracleReading,
}: {
  ritualImpulseRef: MutableRefObject<number>
  hasOracleReading: boolean
}) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null)
  const middleRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)
  const crownRef = useRef<THREE.Group>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const oracleBoost = hasOracleReading ? 0.12 : 0

    if (crownRef.current) {
      crownRef.current.rotation.y += delta * (0.035 + impulse * 0.05)
    }

    if (outerRef.current) {
      outerRef.current.opacity =
        0.1 + Math.sin(t * 0.58) * 0.025 + impulse * 0.12 + oracleBoost
    }

    if (middleRef.current) {
      middleRef.current.opacity =
        0.13 + Math.sin(t * 0.74 + 1.2) * 0.032 + impulse * 0.14 + oracleBoost
    }

    if (innerRef.current) {
      innerRef.current.opacity =
        0.11 + Math.sin(t * 0.92 + 0.4) * 0.035 + impulse * 0.16 + oracleBoost
    }
  })

  return (
    <group>
      <mesh position={[0, 0.018, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.85, 3.02, 72]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#d8e8ff"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.021, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.08, 2.18, 72]} />
        <meshBasicMaterial
          ref={middleRef}
          color="#b98cff"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.024, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 72]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#f8f3df"
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={crownRef} position={[0, 0.04, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <UnicursalHexagramGlyph
          radius={2.05}
          color="#f8f3df"
          opacity={0.34}
          lineWidth={2.6}
          withRose
        />

        <UnicursalHexagramGlyph
          radius={2.12}
          color="#d8e8ff"
          opacity={0.11}
          lineWidth={5.4}
          withRose={false}
        />
      </group>
    </group>
  )
}

function DistantAATrace({
  ritualImpulseRef,
  hasActiveCard,
  hasOracleReading,
}: {
  ritualImpulseRef: MutableRefObject<number>
  hasActiveCard: boolean
  hasOracleReading: boolean
}) {
  const sphereRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])

  const nodes = useMemo(
    () => [
      [0, 3.0],
      [-0.56, 2.55],
      [0.56, 2.55],
      [0, 2.2],
      [-0.74, 1.72],
      [0.74, 1.72],
      [0, 1.34],
      [-0.52, 0.9],
      [0.52, 0.9],
      [0, 0.45],
    ] as Point2[],
    [],
  )

  const paths = useMemo(
    () => [
      [0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5],
      [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [4, 7],
      [5, 8], [6, 7], [6, 8], [7, 9], [8, 9], [6, 9],
    ] as [number, number][],
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const baseBoost = hasActiveCard ? 0.04 : 0
    const oracleBoost = hasOracleReading ? 0.08 : 0

    for (let i = 0; i < sphereRefs.current.length; i += 1) {
      const mat = sphereRefs.current[i]
      if (!mat) continue

      mat.opacity =
        0.12 +
        Math.sin(t * 0.72 + i * 0.7) * 0.028 +
        impulse * 0.1 +
        baseBoost +
        oracleBoost
    }
  })

  return (
    <group position={[0, -0.1, -8.8]} scale={1.55}>
      {paths.map(([a, b], index) => (
        <GlyphPlaneLine
          key={`${a}-${b}-${index}`}
          a={nodes[a]}
          b={nodes[b]}
          color={index % 3 === 0 ? '#f8f3df' : '#d8e8ff'}
          opacity={0.085}
          width={0.01}
          z={-4.08}
        />
      ))}

      {nodes.map(([x, y], index) => (
        <mesh key={index} position={[x, y, -4.05]}>
          <circleGeometry args={[0.06, 20]} />
          <meshBasicMaterial
            ref={(el) => {
              sphereRefs.current[index] = el
            }}
            color={index === 0 ? '#ffffff' : index === 9 ? '#b98cff' : '#d8e8ff'}
            transparent
            opacity={0.13}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <Text
        position={[0, 3.28, -4.02]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.06}
        color="#d8e8ff"
        fillOpacity={0.22}
        maxWidth={1.8}
      >
        A∴A∴
      </Text>
    </group>
  )
}

type SealDef = { label: string; symbol: string; color: string }

function AmbientSigilSeal({ label, symbol, color }: SealDef) {
  return (
    <group>
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[0.44, 0.18]} />
        <meshBasicMaterial
          color="#080404"
          transparent
          opacity={0.52}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[0.5, 0.012]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[-0.16, 0.002, 0.026]}
        fontSize={0.074}
        color={color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.48}
        maxWidth={0.22}
      >
        {symbol}
      </Text>

      <Text
        position={[0.04, 0.002, 0.026]}
        fontSize={0.026}
        color={color}
        anchorX="left"
        anchorY="middle"
        fillOpacity={0.55}
        maxWidth={0.36}
      >
        {label}
      </Text>
    </group>
  )
}

function FloatingSigils({
  ritualImpulseRef,
  hasOracleReading,
}: {
  ritualImpulseRef: MutableRefObject<number>
  hasOracleReading: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (!groupRef.current) return

    groupRef.current.rotation.y += delta * (0.026 + impulse * 0.035)
    groupRef.current.position.y = 1.74 + Math.sin(t * 0.58) * 0.028
  })

  const seals: SealDef[] = hasOracleReading
    ? [
        { label: 'ORACLE', symbol: '☉', color: '#f8f3df' },
        { label: 'AGAPE', symbol: '♀', color: '#d8e8ff' },
        { label: 'ABRAHADABRA', symbol: '⌬', color: '#b98cff' },
        { label: '93', symbol: '☽', color: '#f8f3df' },
      ]
    : [
        { label: 'THELEMA', symbol: '93', color: '#f8f3df' },
        { label: 'AGAPE', symbol: '☽', color: '#d8e8ff' },
        { label: 'WILL', symbol: '⌬', color: '#f8f3df' },
        { label: '93', symbol: '☉', color: '#d8e8ff' },
      ]

  return (
    <group ref={groupRef} position={[0, 1.74, -1.72]}>
      {seals.map((seal, index) => {
        const angle = (index / seals.length) * Math.PI * 2
        const radius = 2.48
        return (
          <group
            key={seal.label}
            position={[
              Math.cos(angle) * radius,
              index % 2 === 0 ? 0.11 : -0.08,
              Math.sin(angle) * radius,
            ]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <AmbientSigilSeal
              label={seal.label}
              symbol={seal.symbol}
              color={seal.color}
            />
          </group>
        )
      })}
    </group>
  )
}

function ReactiveLights({
  ritualImpulseRef,
  hasActiveCard,
  hasOracleReading,
}: {
  ritualImpulseRef: MutableRefObject<number>
  hasActiveCard: boolean
  hasOracleReading: boolean
}) {
  const altarLightRef = useRef<THREE.PointLight>(null)
  const rearLightRef = useRef<THREE.PointLight>(null)
  const lowKeyRef = useRef<THREE.DirectionalLight>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const activeBoost = hasActiveCard ? 4 : 0
    const oracleBoost = hasOracleReading ? 5.5 : 0

    if (altarLightRef.current) {
      const target = 6.6 + activeBoost + oracleBoost + impulse * 11 + Math.sin(t * 1.0) * 0.9
      altarLightRef.current.intensity = THREE.MathUtils.lerp(
        altarLightRef.current.intensity,
        target,
        delta * 3,
      )
    }

    if (rearLightRef.current) {
      const target = 1.8 + oracleBoost * 0.45 + impulse * 5 + Math.sin(t * 0.6) * 0.5
      rearLightRef.current.intensity = THREE.MathUtils.lerp(
        rearLightRef.current.intensity,
        target,
        delta * 2.5,
      )
    }

    if (lowKeyRef.current) {
      lowKeyRef.current.intensity = THREE.MathUtils.lerp(
        lowKeyRef.current.intensity,
        2.4 + impulse * 1.4,
        delta * 1.8,
      )
    }
  })

  return (
    <group>
      <ambientLight color="#070910" intensity={0.075} />

      <directionalLight
        ref={lowKeyRef}
        position={[-5.5, 1.1, 1.8]}
        color="#d8e8ff"
        intensity={2.4}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      <pointLight
        ref={altarLightRef}
        position={[0, 1.1, -0.82]}
        color={hasOracleReading ? '#f8f3df' : '#d8e8ff'}
        intensity={6.6}
        distance={4.6}
      />

      <pointLight
        ref={rearLightRef}
        position={[0, 4.6, -14.0]}
        color="#b98cff"
        intensity={1.8}
        distance={14}
      />
    </group>
  )
}

export function TempleAtmosphere({
  ritualImpulseRef,
  hasActiveCard,
  hasOracleReading,
}: TempleAtmosphereProps) {
  return (
    <group>
      <CosmicVoid />
      <ReactiveLights
        ritualImpulseRef={ritualImpulseRef}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
      <HolographicFloorAura
        ritualImpulseRef={ritualImpulseRef}
        hasOracleReading={hasOracleReading}
      />
      <DistantAATrace
        ritualImpulseRef={ritualImpulseRef}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
      <FloatingSigils
        ritualImpulseRef={ritualImpulseRef}
        hasOracleReading={hasOracleReading}
      />
    </group>
  )
}
