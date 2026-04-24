import {
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../theme/palette'

type TempleAtmosphereProps = {
  ritualImpulseRef: MutableRefObject<number>
  hasActiveCard: boolean
  hasOracleReading: boolean
}

const PLANETARY_GLYPHS = ['♄', '♃', '♂', '☉', '♀', '☿', '☽', '☿', '♀', '☉', '♂', '♃']

function HolographicVoid() {
  return (
    <mesh>
      <sphereGeometry args={[14, 48, 24]} />
      <meshBasicMaterial
        color="#030006"
        side={THREE.BackSide}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

function AtmosphereRing({
  radius,
  tube,
  y,
  color,
  opacity,
  rotationSpeed,
  materialRef,
}: {
  radius: number
  tube: number
  y: number
  color: string
  opacity: number
  rotationSpeed: number
  materialRef: (material: THREE.MeshBasicMaterial | null) => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, tube, 12, 96]} />
        <meshBasicMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function FloorSigilWeb({
  ringMaterialRefs,
}: {
  ringMaterialRefs: MutableRefObject<THREE.MeshBasicMaterial[]>
}) {
  const rings = useMemo(
    () => [
      { inner: 2.78, outer: 2.82, color: '#ff003c', opacity: 0.16 },
      { inner: 3.18, outer: 3.22, color: '#ffb000', opacity: 0.14 },
      { inner: 3.86, outer: 3.9, color: '#5f7cff', opacity: 0.12 },
      { inner: 4.5, outer: 4.54, color: '#b15cff', opacity: 0.1 },
    ],
    [],
  )

  return (
    <group position={[0, 0.018, 0]}>
      {rings.map((ring, index) => (
        <mesh
          key={`${ring.inner}-${ring.outer}`}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[ring.inner, ring.outer, 96]} />
          <meshBasicMaterial
            ref={(material) => {
              if (material) ringMaterialRefs.current[index] = material
            }}
            color={ring.color}
            transparent
            opacity={ring.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function CardinalGate({
  angle,
  label,
}: {
  angle: number
  label: string
}) {
  const radius = 4.35
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const rotationY = -angle + Math.PI / 2

  return (
    <group position={[x, 1.28, z]} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[0.9, 1.5]} />
        <meshBasicMaterial
          color="#210909"
          transparent
          opacity={0.36}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[0.98, 1.58]} />
        <meshBasicMaterial
          color="#ffb000"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Text
        position={[0, 0.54, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.12}
        color={PALETTE.gold}
      >
        {label}
      </Text>

      <Text
        position={[0, -0.06, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.34}
        color="#ff3048"
      >
        ✦
      </Text>

      <Text
        position={[0, -0.52, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.07}
        color="#d8bf9b"
      >
        WILL
      </Text>
    </group>
  )
}

function PlanetaryGlyphHalo({
  haloRef,
}: {
  haloRef: MutableRefObject<THREE.Group | null>
}) {
  const glyphs = useMemo(() => {
    return PLANETARY_GLYPHS.map((glyph, index) => {
      const angle = (index / PLANETARY_GLYPHS.length) * Math.PI * 2
      const radius = 2.92

      return {
        glyph,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        angle,
      }
    })
  }, [])

  return (
    <group ref={(group) => {
      haloRef.current = group
    }} position={[0, 2.92, -0.15]}>
      {glyphs.map((entry, index) => (
        <Text
          key={`${entry.glyph}-${index}`}
          position={[entry.x, 0, entry.z]}
          rotation={[0, -entry.angle + Math.PI / 2, 0]}
          anchorX="center"
          anchorY="middle"
          fontSize={0.13}
          color={index % 3 === 0 ? '#ffcf7c' : '#7aa7ff'}
        >
          {entry.glyph}
        </Text>
      ))}
    </group>
  )
}

function RearAethyrVeil({
  materialRef,
}: {
  materialRef: MutableRefObject<THREE.MeshBasicMaterial | null>
}) {
  return (
    <group position={[0, 1.92, -4.22]}>
      <mesh>
        <planeGeometry args={[4.75, 3.1]} />
        <meshBasicMaterial
          ref={(material) => {
            materialRef.current = material
          }}
          color="#441018"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Text
        position={[0, 1.18, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.12}
        color="#ffcf7c"
      >
        ASTRUM ARGENTUM
      </Text>

      <Text
        position={[0, 0.82, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.28}
        color="#ff3048"
      >
        ✶
      </Text>

      <Text
        position={[0, -1.16, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.08}
        color="#d8bf9b"
      >
        EVERY MAN AND EVERY WOMAN IS A STAR
      </Text>
    </group>
  )
}

function AstralDust({
  impulseRef,
}: {
  impulseRef: MutableRefObject<number>
}) {
  const particleRefs = useRef<(THREE.Mesh | null)[]>([])

  const particles = useMemo(() => {
    return Array.from({ length: 34 }, (_, index) => ({
      x: (Math.random() - 0.5) * 8,
      y: 0.4 + Math.random() * 3.1,
      z: -0.5 - Math.random() * 5.6,
      size: 0.012 + Math.random() * 0.024,
      phase: Math.random() * Math.PI * 2 + index,
      drift: 0.025 + Math.random() * 0.045,
    }))
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = impulseRef.current

    particleRefs.current.forEach((mesh, index) => {
      const particle = particles[index]
      if (!mesh || !particle) return

      mesh.position.y += delta * particle.drift * (1 + impulse * 0.7)
      mesh.position.x += Math.sin(t * 0.45 + particle.phase) * 0.0008
      mesh.position.z += Math.cos(t * 0.38 + particle.phase) * 0.0006

      if (mesh.position.y > 3.75) {
        mesh.position.y = 0.32
      }

      const pulse = 1 + Math.sin(t * 1.7 + particle.phase) * 0.22 + impulse * 0.35
      mesh.scale.setScalar(pulse)
    })
  })

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            particleRefs.current[index] = mesh
          }}
          position={[particle.x, particle.y, particle.z]}
        >
          <sphereGeometry args={[particle.size, 6, 6]} />
          <meshBasicMaterial
            color={index % 4 === 0 ? '#7aa7ff' : '#ffcf7c'}
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

export function TempleAtmosphere({
  ritualImpulseRef,
  hasActiveCard,
  hasOracleReading,
}: TempleAtmosphereProps) {
  const floorRingMaterialRefs = useRef<THREE.MeshBasicMaterial[]>([])
  const upperRingMaterialRefs = useRef<THREE.MeshBasicMaterial[]>([])
  const rearVeilMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null)
  const glyphHaloRef = useRef<THREE.Group | null>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const oracleBoost = hasOracleReading ? 0.22 : 0
    const cardBoost = hasActiveCard ? 0.14 : 0

    floorRingMaterialRefs.current.forEach((material, index) => {
      const wave = 0.5 + Math.sin(t * (0.65 + index * 0.08) + index) * 0.5
      material.opacity = 0.08 + wave * 0.08 + impulse * 0.18 + oracleBoost
    })

    upperRingMaterialRefs.current.forEach((material, index) => {
      const wave = 0.5 + Math.sin(t * (0.55 + index * 0.06) + index * 1.7) * 0.5
      material.opacity = 0.08 + wave * 0.1 + impulse * 0.16 + cardBoost
    })

    if (rearVeilMaterialRef.current) {
      const wave = 0.5 + Math.sin(t * 0.58) * 0.5
      rearVeilMaterialRef.current.opacity =
        0.06 + wave * 0.06 + impulse * 0.14 + oracleBoost
    }

    if (glyphHaloRef.current) {
      glyphHaloRef.current.rotation.y += delta * (0.025 + impulse * 0.03)
      glyphHaloRef.current.position.y =
        2.92 + Math.sin(t * 0.6) * 0.035 + impulse * 0.04
    }
  })

  return (
    <group>
      <HolographicVoid />

      <FloorSigilWeb ringMaterialRefs={floorRingMaterialRefs} />

      <AtmosphereRing
        radius={3.05}
        tube={0.012}
        y={3.12}
        color="#7aa7ff"
        opacity={0.12}
        rotationSpeed={0.025}
        materialRef={(material) => {
          if (material) upperRingMaterialRefs.current[0] = material
        }}
      />

      <AtmosphereRing
        radius={3.72}
        tube={0.01}
        y={3.22}
        color="#ffcf7c"
        opacity={0.1}
        rotationSpeed={-0.018}
        materialRef={(material) => {
          if (material) upperRingMaterialRefs.current[1] = material
        }}
      />

      <AtmosphereRing
        radius={4.38}
        tube={0.009}
        y={3.33}
        color="#ff3048"
        opacity={0.09}
        rotationSpeed={0.014}
        materialRef={(material) => {
          if (material) upperRingMaterialRefs.current[2] = material
        }}
      />

      <CardinalGate angle={0} label="EAST" />
      <CardinalGate angle={Math.PI / 2} label="NORTH" />
      <CardinalGate angle={Math.PI} label="WEST" />
      <CardinalGate angle={(Math.PI * 3) / 2} label="SOUTH" />

      <PlanetaryGlyphHalo haloRef={glyphHaloRef} />
      <RearAethyrVeil materialRef={rearVeilMaterialRef} />
      <AstralDust impulseRef={ritualImpulseRef} />
    </group>
  )
}
