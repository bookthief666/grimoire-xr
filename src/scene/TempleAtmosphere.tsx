import { useMemo, useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../theme/palette'

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

function VoidDome() {
  const starData = useMemo(() => {
    return Array.from({ length: 90 }, (_, index) => {
      const theta = Math.random() * Math.PI * 2
      const y = -0.8 + Math.random() * 5.4
      const radius = 5.2 + Math.random() * 2.4
      return {
        id: index,
        position: [
          Math.cos(theta) * radius,
          y,
          Math.sin(theta) * radius - 1.4,
        ] as [number, number, number],
        size: 0.008 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
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

      const pulse = 0.65 + Math.sin(t * 0.8 + data.phase) * 0.35
      star.scale.setScalar(data.size * (1 + pulse * 0.65))
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[8.8, 36, 18]} />
        <meshBasicMaterial
          color="#020005"
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
            color={index % 4 === 0 ? '#ffcf7c' : '#8a2cff'}
            transparent
            opacity={0.62}
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
    const oracleBoost = hasOracleReading ? 0.22 : 0

    if (crownRef.current) {
      crownRef.current.rotation.y += delta * (0.06 + impulse * 0.08)
    }

    if (outerRef.current) {
      outerRef.current.opacity =
        0.18 + Math.sin(t * 0.7) * 0.04 + impulse * 0.18 + oracleBoost
    }

    if (middleRef.current) {
      middleRef.current.opacity =
        0.24 + Math.sin(t * 0.9 + 1.2) * 0.05 + impulse * 0.2 + oracleBoost
    }

    if (innerRef.current) {
      innerRef.current.opacity =
        0.28 + Math.sin(t * 1.2 + 0.4) * 0.06 + impulse * 0.28 + oracleBoost
    }
  })

  return (
    <group>
      <mesh position={[0, 0.018, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.85, 3.06, 72]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#ff2a00"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.021, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.32, 72]} />
        <meshBasicMaterial
          ref={middleRef}
          color="#ffb000"
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.024, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 72]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#5e00ff"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={crownRef} position={[0, 0.032, -1.0]}>
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index / 12) * Math.PI * 2
          const radius = index % 2 === 0 ? 2.62 : 2.42
          return (
            <mesh
              key={index}
              position={[
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius,
              ]}
              rotation={[-Math.PI / 2, 0, angle]}
            >
              <planeGeometry args={[0.06, 0.32]} />
              <meshBasicMaterial
                color={index % 3 === 0 ? '#ffcf7c' : '#ff2a00'}
                transparent
                opacity={0.46}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function SephiroticWall({
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
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [2, 5],
      [3, 4],
      [3, 5],
      [3, 6],
      [4, 6],
      [5, 6],
      [4, 7],
      [5, 8],
      [6, 7],
      [6, 8],
      [7, 9],
      [8, 9],
      [6, 9],
    ] as [number, number][],
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const baseBoost = hasActiveCard ? 0.12 : 0
    const oracleBoost = hasOracleReading ? 0.22 : 0

    for (let i = 0; i < sphereRefs.current.length; i += 1) {
      const mat = sphereRefs.current[i]
      if (!mat) continue

      mat.opacity =
        0.34 +
        Math.sin(t * 1.05 + i * 0.7) * 0.08 +
        impulse * 0.22 +
        baseBoost +
        oracleBoost
    }
  })

  return (
    <group position={[0, -0.05, 0]}>
      {paths.map(([a, b], index) => (
        <GlyphPlaneLine
          key={`${a}-${b}-${index}`}
          a={nodes[a]}
          b={nodes[b]}
          color={index % 3 === 0 ? '#ffcf7c' : '#ff2a00'}
          opacity={0.24}
        />
      ))}

      {nodes.map(([x, y], index) => (
        <mesh key={index} position={[x, y, -4.05]}>
          <circleGeometry args={[0.075, 24]} />
          <meshBasicMaterial
            ref={(el) => {
              sphereRefs.current[index] = el
            }}
            color={index === 0 ? '#ffffff' : index === 9 ? '#ff2a00' : '#ffcf7c'}
            transparent
            opacity={0.36}
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
        fontSize={0.075}
        color="#ffcf7c"
        maxWidth={1.8}
      >
        ASTRUM ARGENTUM
      </Text>

      <Text
        position={[0, 0.18, -4.02]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.06}
        color="#d89b6b"
        maxWidth={1.6}
      >
        93 // 418 // 156
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

    groupRef.current.rotation.y += delta * (0.045 + impulse * 0.06)
    groupRef.current.position.y = 1.85 + Math.sin(t * 0.7) * 0.035
  })

  const labels = hasOracleReading
    ? ['ORACLE', 'AGAPE', 'ABRAHADABRA', '93']
    : ['THELEMA', 'AGAPE', 'WILL', '93']

  return (
    <group ref={groupRef} position={[0, 1.85, -1.55]}>
      {labels.map((label, index) => {
        const angle = (index / labels.length) * Math.PI * 2
        const radius = 2.65
        return (
          <Text
            key={label}
            position={[
              Math.cos(angle) * radius,
              index % 2 === 0 ? 0.16 : -0.1,
              Math.sin(angle) * radius,
            ]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            anchorX="center"
            anchorY="middle"
            fontSize={0.09}
            color={index % 2 === 0 ? '#ffcf7c' : '#ff2a00'}
            maxWidth={1.0}
          >
            {label}
          </Text>
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

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const activeBoost = hasActiveCard ? 6 : 0
    const oracleBoost = hasOracleReading ? 8 : 0

    if (altarLightRef.current) {
      const target = 8 + activeBoost + oracleBoost + impulse * 15 + Math.sin(t * 1.2) * 1.2
      altarLightRef.current.intensity = THREE.MathUtils.lerp(
        altarLightRef.current.intensity,
        target,
        delta * 3,
      )
    }

    if (rearLightRef.current) {
      const target = 4 + oracleBoost * 0.7 + impulse * 10 + Math.sin(t * 0.8) * 0.8
      rearLightRef.current.intensity = THREE.MathUtils.lerp(
        rearLightRef.current.intensity,
        target,
        delta * 2.5,
      )
    }
  })

  return (
    <group>
      <pointLight
        ref={altarLightRef}
        position={[0, 1.35, -1.0]}
        color={hasOracleReading ? '#8a2cff' : '#ffb000'}
        intensity={8}
        distance={5.5}
      />

      <pointLight
        ref={rearLightRef}
        position={[0, 2.65, -3.6]}
        color="#ff2a00"
        intensity={4}
        distance={6}
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
      <VoidDome />
      <ReactiveLights
        ritualImpulseRef={ritualImpulseRef}
        hasActiveCard={hasActiveCard}
        hasOracleReading={hasOracleReading}
      />
      <HolographicFloorAura
        ritualImpulseRef={ritualImpulseRef}
        hasOracleReading={hasOracleReading}
      />
      <SephiroticWall
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
