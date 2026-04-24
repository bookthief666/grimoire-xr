import { useMemo, useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Props = {
  ritualImpulseRef: MutableRefObject<number>
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
        opacity={opacity}
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
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function ThelemicStarGate({ ritualImpulseRef }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.18) * 0.035
      groupRef.current.rotation.y = Math.sin(t * 0.11) * 0.025
    }

    if (coreRef.current) {
      coreRef.current.opacity = 0.18 + Math.sin(t * 1.15) * 0.06 + impulse * 0.2
    }
  })

  const hex = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI) / 3
      return [
        Math.cos(angle) * 1.05,
        Math.sin(angle) * 1.05,
        0,
      ] as [number, number, number]
    })
  }, [])

  return (
    <group ref={groupRef} position={[0, 1.78, -2.58]} raycast={noRaycast}>
      <mesh position={[0, 0, -0.035]} raycast={noRaycast}>
        <planeGeometry args={[2.9, 2.55]} />
        <meshBasicMaterial
          color="#080106"
          transparent
          opacity={0.34}
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
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <HoloRing position={[0, 0, 0.02]} radius={1.25} tube={0.018} color="#b8860b" opacity={0.62} />
      <HoloRing position={[0, 0, 0.035]} radius={0.88} tube={0.012} color="#8a35ff" opacity={0.42} />
      <HoloRing position={[0, 0, 0.05]} radius={0.48} tube={0.01} color="#ffcf7c" opacity={0.58} />

      <HoloBar a={hex[0]} b={hex[2]} color="#ffcf7c" opacity={0.62} width={0.025} />
      <HoloBar a={hex[2]} b={hex[4]} color="#ffcf7c" opacity={0.62} width={0.025} />
      <HoloBar a={hex[4]} b={hex[0]} color="#ffcf7c" opacity={0.62} width={0.025} />
      <HoloBar a={hex[1]} b={hex[3]} color="#ff3d5a" opacity={0.48} width={0.02} />
      <HoloBar a={hex[3]} b={hex[5]} color="#ff3d5a" opacity={0.48} width={0.02} />
      <HoloBar a={hex[5]} b={hex[1]} color="#ff3d5a" opacity={0.48} width={0.02} />

      {hex.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 0.07]} raycast={noRaycast}>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#ffd18a' : '#9a6bff'}
            transparent
            opacity={0.78}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <Text
        position={[0, 1.43, 0.1]}
        fontSize={0.105}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
        raycast={noRaycast}
      >
        ASTRAL ENGINE OF THE WILL
      </Text>

      <Text
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
    </group>
  )
}

function FloatingOrrery({ ritualImpulseRef }: Props) {
  const root = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const core = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (root.current) root.current.rotation.y += delta * (0.18 + impulse * 0.18)
    if (inner.current) inner.current.rotation.x += delta * (0.22 + impulse * 0.12)

    if (core.current) {
      core.current.opacity = 0.35 + Math.sin(t * 1.4) * 0.08 + impulse * 0.18
    }
  })

  return (
    <group position={[0, 1.48, -0.82]} scale={0.78} raycast={noRaycast}>
      <group ref={root}>
        <HoloRing position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.86} tube={0.012} color="#b8860b" opacity={0.52} />
        <HoloRing position={[0, 0, 0]} rotation={[0.75, 0, 0]} radius={0.66} tube={0.01} color="#8a35ff" opacity={0.38} />
        <HoloRing position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} radius={0.5} tube={0.008} color="#ff3d5a" opacity={0.28} />
      </group>

      <group ref={inner}>
        <HoloRing position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} radius={0.32} tube={0.008} color="#ffcf7c" opacity={0.54} />
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
        ['☿', 0.47, '#b8860b'],
      ].map(([glyph, r, color], i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <Text
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
    <group position={[0, 1.62, -3.05]} scale={1.35} raycast={noRaycast}>
      {lines.map(([a, b], i) => (
        <HoloBar
          key={i}
          a={[nodes[a][0], nodes[a][1], 0.05]}
          b={[nodes[b][0], nodes[b][1], 0.05]}
          color={i % 3 === 0 ? '#9a6bff' : '#b8860b'}
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
        <meshLambertMaterial color="#070204" flatShading />
      </mesh>

      <mesh position={[0, height + 0.12, 0]} raycast={noRaycast}>
        <coneGeometry args={[0.18, 0.35, 5]} />
        <meshBasicMaterial
          color="#8a35ff"
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <HoloRing position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} radius={0.34} tube={0.006} color="#b8860b" opacity={0.32} />
      <HoloRing position={[0, height * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.22} tube={0.005} color="#ff3d5a" opacity={0.24} />
    </group>
  )
}

function EroticSacredVeils({ ritualImpulseRef }: Props) {
  const left = useRef<THREE.MeshBasicMaterial>(null)
  const right = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const opacity = 0.16 + Math.sin(t * 0.5) * 0.04 + impulse * 0.08

    if (left.current) left.current.opacity = opacity
    if (right.current) right.current.opacity = opacity * 0.82
  })

  return (
    <group position={[0, 1.24, -1.92]} raycast={noRaycast}>
      <mesh position={[-1.18, 0, 0]} rotation={[0, 0, -0.16]} raycast={noRaycast}>
        <planeGeometry args={[0.48, 2.1]} />
        <meshBasicMaterial
          ref={left}
          color="#9a1034"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[1.18, 0, 0]} rotation={[0, 0, 0.16]} raycast={noRaycast}>
        <planeGeometry args={[0.48, 2.1]} />
        <meshBasicMaterial
          ref={right}
          color="#6b35ff"
          transparent
          opacity={0.12}
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
            color={i % 2 === 0 ? '#b8860b' : '#8a35ff'}
            transparent
            opacity={0.24}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

export function TempleXenotheurgy({ ritualImpulseRef }: Props) {
  return (
    <group>
      <ProcessionCircuits />
      <QabalisticCircuitWall />
      <ThelemicStarGate ritualImpulseRef={ritualImpulseRef} />
      <FloatingOrrery ritualImpulseRef={ritualImpulseRef} />
      <EroticSacredVeils ritualImpulseRef={ritualImpulseRef} />

      <XenoObelisk x={-1.72} z={-0.95} height={1.35} />
      <XenoObelisk x={1.72} z={-0.95} height={1.35} />
      <XenoObelisk x={-2.35} z={-2.35} height={2.15} />
      <XenoObelisk x={2.35} z={-2.35} height={2.15} />
    </group>
  )
}
