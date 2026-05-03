import { useMemo, useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
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

function HoloRing({
  position,
  rotation = [0, 0, 0],
  radius,
  tube = 0.01,
  color,
  opacity = 0.42,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  radius: number
  tube?: number
  color: string
  opacity?: number
}) {
  return (
    <mesh position={position} rotation={rotation} raycast={noRaycast}>
      <torusGeometry args={[radius, tube, 8, 96]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity * 0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function HoloBar({
  a,
  b,
  color = '#b8860b',
  opacity = 0.38,
  width = 0.018,
  yOffset = 0,
}: {
  a: [number, number, number]
  b: [number, number, number]
  color?: string
  opacity?: number
  width?: number
  yOffset?: number
}) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const dz = b[2] - a[2]
  const length = Math.hypot(dx, dy, dz)

  const midpoint: [number, number, number] = [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2 + yOffset,
    (a[2] + b[2]) / 2,
  ]

  const quat = new THREE.Quaternion()
  const direction = new THREE.Vector3(dx, dy, dz).normalize()
  quat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction)

  return (
    <mesh position={midpoint} quaternion={quat} raycast={noRaycast}>
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity * 0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function ThelemicStarGate({ ritualImpulseRef, loading = false, oracleLoading = false, hasActiveCard = false, hasOracleReading = false }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const stateBoost =
      (loading ? 0.22 : 0) +
      (oracleLoading ? 0.34 : 0) +
      (hasActiveCard ? 0.16 : 0) +
      (hasOracleReading ? 0.28 : 0)

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * (0.18 + stateBoost * 0.2)) * (0.035 + stateBoost * 0.03)
      groupRef.current.rotation.y = Math.sin(t * 0.11) * (0.025 + stateBoost * 0.035)
      const scale = 1 + Math.sin(t * 1.4) * 0.012 + stateBoost * 0.045
      groupRef.current.scale.setScalar(2.55 * scale)
    }

    if (coreRef.current) {
      coreRef.current.opacity = Math.min(
        0.16,
        0.035 + Math.sin(t * 1.15) * 0.018 + impulse * 0.045 + stateBoost * 0.055,
      )
    }
  })


  return (
    <group ref={groupRef} position={[0, 5.55, -14.4]} raycast={noRaycast}>
      <mesh position={[0, 0, -0.035]} raycast={noRaycast}>
        <planeGeometry args={[2.9, 2.55]} />
        <meshBasicMaterial
          color="#080106"
          transparent
          opacity={0.045}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.025]} raycast={noRaycast}>
        <planeGeometry args={[3.25, 2.9]} />
        <meshBasicMaterial
          ref={coreRef}
          color="#8a35ff"
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <HoloRing position={[0, 0, 0.02]} radius={1.18} tube={0.006} color="#d8e8ff" opacity={0.12} />
      <HoloRing position={[0, 0, 0.035]} radius={0.54} tube={0.005} color="#f8f3df" opacity={0.1} />

      <group position={[0, 0, 0.07]}>
        <BabalonStarGlyph
          radius={1.0}
          color="#f8f3df"
          opacity={0.46}
          lineWidth={1.85}
          withRose
        />
      </group>

      <group position={[0, 0, 0.055]}>
        <BabalonStarGlyph
          radius={1.06}
          color="#d8e8ff"
          opacity={0.105}
          lineWidth={3.2}
          withCircle={false}
          withRose={false}
        />
      </group>

      <Text visible={false}
        position={[0, 1.43, 0.1]}
        fontSize={0.105}
        color="#f8f3df"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
        raycast={noRaycast}
      >
        ASTRAL ENGINE OF THE WILL
      </Text>

      <Text visible={false}
        position={[0, -1.45, 0.1]}
        fontSize={0.075}
        color="#9a6bff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
        raycast={noRaycast}
      >
        XENOTHEURGIC · HERMETIC · THELEMIC
      </Text>

      {(loading || oracleLoading || hasActiveCard || hasOracleReading) ? (
        <Text visible={false}
          position={[0, -1.66, 0.12]}
          fontSize={0.065}
          color={oracleLoading || hasOracleReading ? '#d9b5ff' : '#ffd18a'}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
          raycast={noRaycast}
        >
          {oracleLoading
            ? 'ORACLE FLAME ACTIVE'
            : loading
              ? 'DECK FORGE IGNITED'
              : hasOracleReading
                ? 'READING INSCRIBED'
                : 'ARCANUM FOCUSED'}
        </Text>
      ) : null}
    </group>
  )
}

function FloatingOrrery({ ritualImpulseRef, loading = false, oracleLoading = false, hasOracleReading = false }: Props) {
  const root = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const core = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const stateBoost = (loading ? 0.18 : 0) + (oracleLoading ? 0.28 : 0) + (hasOracleReading ? 0.22 : 0)

    if (root.current) root.current.rotation.y += delta * (0.18 + impulse * 0.18 + stateBoost * 0.22)
    if (inner.current) inner.current.rotation.x += delta * (0.22 + impulse * 0.12 + stateBoost * 0.16)

    if (core.current) {
      core.current.opacity = Math.min(0.22, 0.08 + Math.sin(t * 1.4) * 0.025 + impulse * 0.045 + stateBoost * 0.06)
    }
  })

  return (
    <group position={[0, 6.0, -1.0]} scale={1.5} raycast={noRaycast}>
      <group ref={root}>
        <HoloRing position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.86} tube={0.008} color="#d8e8ff" opacity={0.22} />
        <HoloRing position={[0, 0, 0]} rotation={[0.75, 0, 0]} radius={0.66} tube={0.007} color="#4258ff" opacity={0.12} />
        <HoloRing position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} radius={0.5} tube={0.006} color="#b98cff" opacity={0.10} />
      </group>

      <group ref={inner}>
        <HoloRing position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} radius={0.32} tube={0.006} color="#f8f3df" opacity={0.22} />
      </group>

      <mesh raycast={noRaycast}>
        <sphereGeometry args={[0.13, 18, 12]} />
        <meshBasicMaterial
          ref={core}
          color="#e8d5ff"
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {[
        ['☉', 1.02, '#ffd18a'],
        ['☽', 0.82, '#d9b5ff'],
        ['♀', 0.62, '#ff5d8f'],
        ['☿', 0.47, '#d8e8ff'],
      ].map(([glyph, r, color], i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <Text visible={false}
            key={glyph}
            position={[Math.cos(a) * Number(r), Math.sin(a) * 0.2, Math.sin(a) * Number(r)]}
            fontSize={0.13}
            color={String(color)}
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

function QabalisticCircuitWall() {
  const nodes = [
    [0, 0.92], [-0.48, 0.58], [0.48, 0.58],
    [-0.72, 0.12], [0, 0.18], [0.72, 0.12],
    [-0.48, -0.36], [0.48, -0.36], [0, -0.82],
  ] as [number, number][]

  const lines = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
    [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [7, 8],
  ]

  return (
    <group position={[0, 2.9, -10.0]} scale={3.0} raycast={noRaycast}>
      {lines.map(([a, b], i) => (
        <HoloBar
          key={i}
          a={[nodes[a][0], nodes[a][1], 0.05]}
          b={[nodes[b][0], nodes[b][1], 0.05]}
          color={i % 3 === 0 ? '#4258ff' : '#d8e8ff'}
          opacity={0.34}
          width={0.012}
        />
      ))}

      {nodes.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.08]} raycast={noRaycast}>
          <circleGeometry args={[0.045, 18]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#ffd18a' : '#9a6bff'}
            transparent
            opacity={0.7}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function XenoObelisk({
  x,
  z,
  height,
}: {
  x: number
  z: number
  height: number
}) {
  return (
    <group position={[x, 0, z]} raycast={noRaycast}>
      <mesh position={[0, height / 2, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.075, 0.18, height, 5]} />
        <meshLambertMaterial color="#020306" emissive="#03070b" flatShading />
      </mesh>

      <mesh position={[0, height + 0.12, 0]} raycast={noRaycast}>
        <coneGeometry args={[0.18, 0.35, 5]} />
        <meshBasicMaterial
          color="#d8e8ff"
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <HoloRing position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} radius={0.34} tube={0.006} color="#d8e8ff" opacity={0.18} />
      <HoloRing position={[0, height * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.22} tube={0.005} color="#4258ff" opacity={0.12} />
    </group>
  )
}

function EroticSacredVeils({ ritualImpulseRef, oracleLoading = false, hasActiveCard = false, hasOracleReading = false }: Props) {
  const left = useRef<THREE.MeshBasicMaterial>(null)
  const right = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const stateBoost = (oracleLoading ? 0.14 : 0) + (hasActiveCard ? 0.08 : 0) + (hasOracleReading ? 0.12 : 0)
    const opacity = 0.16 + Math.sin(t * 0.5) * 0.04 + impulse * 0.08 + stateBoost

    if (left.current) left.current.opacity = Math.min(0.16, opacity * 0.45)
    if (right.current) right.current.opacity = Math.min(0.13, opacity * 0.36)
  })

  return (
    <group position={[0, 1.55, -4.0]} raycast={noRaycast}>
      <mesh position={[-1.18, 0, 0]} rotation={[0, 0, -0.16]} raycast={noRaycast}>
        <planeGeometry args={[0.24, 1.8]} />
        <meshBasicMaterial
          ref={left}
          color="#9a1034"
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[1.18, 0, 0]} rotation={[0, 0, 0.16]} raycast={noRaycast}>
        <planeGeometry args={[0.24, 1.8]} />
        <meshBasicMaterial
          ref={right}
          color="#6b35ff"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function ProcessionCircuits() {
  return (
    <group raycast={noRaycast}>
      {[-0.9, -0.45, 0.45, 0.9].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.018, -1.05]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <planeGeometry args={[0.018, 3.25]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#d8e8ff' : '#4258ff'}
            transparent
            opacity={0.14}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}


function RitualStateConduit({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasActiveCard = false,
  hasOracleReading = false,
}: Props) {
  const columnRef = useRef<THREE.MeshBasicMaterial>(null)
  const ringARef = useRef<THREE.MeshBasicMaterial>(null)
  const ringBRef = useRef<THREE.MeshBasicMaterial>(null)
  const crownRef = useRef<THREE.Group>(null)

  const active =
    loading || oracleLoading || hasActiveCard || hasOracleReading

  const stateLabel = oracleLoading
    ? 'ORACLE CHANNEL OPEN'
    : loading
      ? 'FORGE CURRENT RISING'
      : hasOracleReading
        ? 'ORACLE INSCRIPTION SEALED'
        : hasActiveCard
          ? 'ARCANUM UNDER LENS'
          : 'TEMPLE DORMANT'

  const stateColor = oracleLoading || hasOracleReading
    ? '#9a6bff'
    : hasActiveCard
      ? '#ffcf7c'
      : loading
        ? '#ff3d5a'
        : '#b8860b'

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const activeBoost = active ? 1 : 0

    if (columnRef.current) {
      columnRef.current.opacity = active
        ? Math.min(0.26, 0.08 + Math.sin(t * 2.2) * 0.025 + impulse * 0.08)
        : 0.045 + Math.sin(t * 0.5) * 0.015
    }

    if (ringARef.current) {
      ringARef.current.opacity = active
        ? 0.22 + Math.sin(t * 1.7) * 0.055
        : 0.16
    }

    if (ringBRef.current) {
      ringBRef.current.opacity = active
        ? 0.17 + Math.sin(t * 2.1 + 1.1) * 0.045
        : 0.11
    }

    if (crownRef.current) {
      crownRef.current.rotation.y += delta * (0.18 + activeBoost * 0.34 + impulse * 0.28)
      crownRef.current.position.y = 1.78 + Math.sin(t * 1.15) * 0.025 + activeBoost * 0.05
      const scale = 1 + activeBoost * 0.08 + Math.sin(t * 1.6) * 0.018
      crownRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={[0, 0, -0.82]} raycast={noRaycast}>
      <mesh position={[0, 0.95, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.34, 0.18, 1.85, 32, 1, true]} />
        <meshBasicMaterial
          ref={columnRef}
          color={stateColor}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <ringGeometry args={[0.42, 0.45, 72]} />
        <meshBasicMaterial
          ref={ringARef}
          color={stateColor}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 8]} raycast={noRaycast}>
        <ringGeometry args={[0.72, 0.735, 96]} />
        <meshBasicMaterial
          ref={ringBRef}
          color={oracleLoading || hasOracleReading ? '#d9b5ff' : '#ffcf7c'}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={crownRef} position={[0, 1.78, 0]} raycast={noRaycast}>
        <HoloRing
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          radius={0.38}
          tube={0.009}
          color={stateColor}
          opacity={active ? 0.52 : 0.18}
        />
        <HoloRing
          position={[0, 0, 0]}
          rotation={[0.82, 0, 0]}
          radius={0.3}
          tube={0.007}
          color={oracleLoading || hasOracleReading ? '#d9b5ff' : '#ffd18a'}
          opacity={active ? 0.42 : 0.14}
        />

        {['✶', '☉', '☽', '♀'].map((glyph, i) => {
          const a = (i / 4) * Math.PI * 2
          return (
            <Text visible={false}
              key={glyph}
              position={[Math.cos(a) * 0.48, Math.sin(a) * 0.1, Math.sin(a) * 0.48]}
              fontSize={0.075}
              color={stateColor}
              anchorX="center"
              anchorY="middle"
              raycast={noRaycast}
            >
              {glyph}
            </Text>
          )
        })}
      </group>

      <Text visible={false}
        position={[0, 2.08, 0]}
        fontSize={0.065}
        color={active ? stateColor : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.65}
        raycast={noRaycast}
      >
        {stateLabel}
      </Text>
    </group>
  )
}


function DeckConstellation({
  ritualImpulseRef,
  loading = false,
  hasDeck = false,
  oracleLoading = false,
  hasActiveCard = false,
  hasOracleReading = false,
}: Props) {
  const rootRef = useRef<THREE.Group>(null)
  const majorRef = useRef<THREE.Group>(null)
  const minorRef = useRef<THREE.Group>(null)

  const active =
    loading || hasDeck || oracleLoading || hasActiveCard || hasOracleReading

  const cards = useMemo(() => {
    return Array.from({ length: 78 }, (_, index) => {
      const isMajor = index < 22
      const lane = isMajor ? 0 : 1 + ((index - 22) % 4)
      const laneIndex = isMajor ? index : Math.floor((index - 22) / 4)
      const laneCount = isMajor ? 22 : 14
      const t = laneCount <= 1 ? 0 : laneIndex / (laneCount - 1)
      const arc = -Math.PI * 0.82 + t * Math.PI * 1.64
      const radius = isMajor ? 1.68 : 1.95 + lane * 0.09

      return {
        index,
        isMajor,
        x: Math.sin(arc) * radius,
        y: 0.12 + Math.cos(arc) * 0.54 + lane * 0.015,
        z: -0.02 - lane * 0.018,
        rot: -arc * 0.18,
        delay: index * 0.037,
      }
    })
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const boost = active ? 1 : 0

    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(t * 0.18) * 0.045
      rootRef.current.position.y = 1.44 + Math.sin(t * 0.62) * 0.025
      const scale = 1 + boost * 0.035 + impulse * 0.04
      rootRef.current.scale.setScalar(2.5 * scale)
    }

    if (majorRef.current) {
      majorRef.current.rotation.z += delta * (0.025 + boost * 0.018)
    }

    if (minorRef.current) {
      minorRef.current.rotation.z -= delta * (0.014 + boost * 0.012)
    }
  })

  const label = loading
    ? 'SEVENTY-EIGHT ARCANA FORGING'
    : hasDeck
      ? 'SEVENTY-EIGHT ARCANA ONLINE'
      : hasOracleReading
        ? 'DECK MEMORY INSCRIBED'
        : 'DECK MATRIX DORMANT'

  return (
    <group ref={rootRef} position={[0, 2.0, -8.0]} raycast={noRaycast}>
      <group ref={minorRef} raycast={noRaycast}>
        {cards
          .filter((card) => !card.isMajor)
          .map((card) => {
            const awakened = active || card.index % 7 === 0
            const opacity = awakened ? 0.08 : 0.025
            return (
              <mesh
                key={card.index}
                position={[card.x, card.y, card.z]}
                rotation={[0, card.rot, 0]}
                raycast={noRaycast}
              >
                <planeGeometry args={[0.055, 0.09]} />
                <meshBasicMaterial
                  color={oracleLoading || hasOracleReading ? '#9a6bff' : '#b8860b'}
                  transparent
                  opacity={opacity}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )
          })}
      </group>

      <group ref={majorRef} raycast={noRaycast}>
        {cards
          .filter((card) => card.isMajor)
          .map((card) => {
            const opacity = active ? 0.14 : 0.04
            return (
              <group
                key={card.index}
                position={[card.x, card.y, card.z + 0.035]}
                rotation={[0, card.rot, 0]}
                raycast={noRaycast}
              >
                <mesh raycast={noRaycast}>
                  <planeGeometry args={[0.075, 0.12]} />
                  <meshBasicMaterial
                    color={loading ? '#ffffff' : hasDeck ? '#f8f3df' : '#d8e8ff'}
                    transparent
                    opacity={opacity}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                <mesh position={[0, 0, 0.008]} raycast={noRaycast}>
                  <ringGeometry args={[0.018, 0.024, 12]} />
                  <meshBasicMaterial
                    color="#ffd18a"
                    transparent
                    opacity={active ? 0.7 : 0.25}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            )
          })}
      </group>

      <HoloRing
        position={[0, 0.08, -0.035]}
        rotation={[0, 0, 0]}
        radius={1.52}
        tube={0.008}
        color={hasDeck ? '#f8f3df' : '#d8e8ff'}
        opacity={active ? 0.34 : 0.12}
      />

      <HoloRing
        position={[0, 0.08, -0.045]}
        rotation={[0, 0, Math.PI / 2]}
        radius={2.06}
        tube={0.006}
        color={oracleLoading || hasOracleReading ? '#d9b5ff' : '#b8860b'}
        opacity={active ? 0.22 : 0.075}
      />

      <Text visible={false}
        position={[0, -0.92, 0.06]}
        fontSize={0.062}
        color={active ? '#ffd18a' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        raycast={noRaycast}
      >
        {label}
      </Text>
    </group>
  )
}


function HumanScaleTempleLife({
  ritualImpulseRef,
  loading = false,
  oracleLoading = false,
  hasActiveCard = false,
  hasOracleReading = false,
  hasDeck = false,
}: Props) {
  const glyphRootRef = useRef<THREE.Group>(null)
  const sanctumRef = useRef<THREE.Group>(null)
  const veilRef = useRef<THREE.MeshBasicMaterial>(null)
  const auraRef = useRef<THREE.MeshBasicMaterial>(null)

  const active = loading || oracleLoading || hasActiveCard || hasOracleReading || hasDeck
  const oracleActive = oracleLoading || hasOracleReading

  const glyphs = useMemo(() => {
    return ['✶', '☉', '☽', '♀', '☿', '♃', '♄', '⟁', '✦', '◌'].map((glyph, i) => {
      const angle = (i / 10) * Math.PI * 2
      return {
        glyph,
        x: Math.cos(angle) * (1.15 + (i % 3) * 0.08),
        y: 1.18 + (i % 4) * 0.11,
        z: -0.92 + Math.sin(angle) * 0.38,
        phase: i * 0.77,
        color: i % 3 === 0 ? '#ffd18a' : i % 3 === 1 ? '#9a6bff' : '#ff3d5a',
      }
    })
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const boost = active ? 1 : 0

    if (glyphRootRef.current) {
      glyphRootRef.current.rotation.y = Math.sin(t * 0.18) * 0.08
      glyphRootRef.current.position.y = Math.sin(t * 0.72) * 0.018
      glyphRootRef.current.scale.setScalar(1 + boost * 0.045 + impulse * 0.035)
    }

    if (sanctumRef.current) {
      sanctumRef.current.rotation.y = Math.sin(t * 0.22) * 0.045
      sanctumRef.current.position.y = 0.04 + Math.sin(t * 0.55) * 0.02
    }

    if (veilRef.current) {
      veilRef.current.opacity = Math.min(
        0.22,
        0.09 + Math.sin(t * 0.72) * 0.025 + (oracleActive ? 0.18 : 0) + impulse * 0.08,
      )
    }

    if (auraRef.current) {
      auraRef.current.opacity = Math.min(
        0.24,
        0.08 + Math.sin(t * 1.05) * 0.035 + (active ? 0.12 : 0) + impulse * 0.1,
      )
    }

    if (sanctumRef.current) {
      sanctumRef.current.rotation.z += delta * (oracleActive ? 0.025 : 0.008)
    }
  })



  return (
    <group raycast={noRaycast}>
      <group ref={glyphRootRef} raycast={noRaycast}>
        {glyphs.map((g, i) => (
          <group key={g.glyph + i} position={[g.x, g.y, g.z]} raycast={noRaycast}>
            <mesh raycast={noRaycast}>
              <circleGeometry args={[0.075, 20]} />
              <meshBasicMaterial
                color="#050203"
                transparent
                opacity={0.34}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh position={[0, 0, 0.006]} raycast={noRaycast}>
              <ringGeometry args={[0.087, 0.094, 24]} />
              <meshBasicMaterial
                color={g.color}
                transparent
                opacity={active ? 0.48 : 0.24}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            <Text visible={false}
              position={[0, 0, 0.018]}
              fontSize={0.064}
              color={g.color}
              anchorX="center"
              anchorY="middle"
              raycast={noRaycast}
            >
              {g.glyph}
            </Text>
          </group>
        ))}
      </group>

      <group ref={sanctumRef} position={[0, 0.04, -2.42]} raycast={noRaycast}>
        <mesh position={[0, 1.52, -0.08]} raycast={noRaycast}>
          <planeGeometry args={[1.12, 2.28]} />
          <meshBasicMaterial
            ref={veilRef}
            color={oracleActive ? '#d8e8ff' : '#05070b'}
            transparent
            opacity={0.12}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, 1.52, -0.12]} raycast={noRaycast}>
          <planeGeometry args={[1.55, 2.65]} />
          <meshBasicMaterial
            ref={auraRef}
            color={oracleActive ? '#f8f3df' : '#071018'}
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        <HoloRing
          position={[0, 1.48, 0.02]}
          rotation={[0, 0, 0]}
          radius={0.52}
          tube={0.007}
          color={oracleActive ? '#f8f3df' : '#d8e8ff'}
          opacity={oracleActive ? 0.42 : 0.18}
        />

        <HoloRing
          position={[0, 1.48, 0.04]}
          rotation={[0, 0, Math.PI / 2]}
          radius={0.34}
          tube={0.006}
          color={hasActiveCard ? '#f8f3df' : '#4258ff'}
          opacity={active ? 0.34 : 0.13}
        />

        <Text visible={false}
          position={[0, 2.92, 0.08]}
          fontSize={0.072}
          color={oracleActive ? '#d9b5ff' : '#9f744b'}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.82}
          raycast={noRaycast}
        >
          ORACLE SANCTUM
        </Text>
      </group>

    </group>
  )
}

export function TempleXenotheurgy({ ritualImpulseRef, loading = false, oracleLoading = false, hasActiveCard = false, hasOracleReading = false, hasDeck = false }: Props) {
  return (
    <group>
      <ProcessionCircuits />
      <HumanScaleTempleLife
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
        hasDeck={hasDeck}
      />
      <DeckConstellation
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
        hasDeck={hasDeck}
      />
      <RitualStateConduit
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
      <QabalisticCircuitWall />
      <ThelemicStarGate ritualImpulseRef={ritualImpulseRef} loading={loading} oracleLoading={oracleLoading} hasActiveCard={hasActiveCard} hasOracleReading={hasOracleReading} />
      <FloatingOrrery ritualImpulseRef={ritualImpulseRef} loading={loading} oracleLoading={oracleLoading} hasOracleReading={hasOracleReading} />
      <EroticSacredVeils ritualImpulseRef={ritualImpulseRef} oracleLoading={oracleLoading} hasActiveCard={hasActiveCard} hasOracleReading={hasOracleReading} />

      <XenoObelisk x={-1.72} z={-0.95} height={1.35} />
      <XenoObelisk x={1.72} z={-0.95} height={1.35} />
      <XenoObelisk x={-2.35} z={-2.35} height={2.15} />
      <XenoObelisk x={2.35} z={-2.35} height={2.15} />
    </group>
  )
}
