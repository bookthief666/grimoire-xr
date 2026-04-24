import { useRef, type MutableRefObject } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../theme/palette'

type Props = {
  ritualImpulseRef: MutableRefObject<number>
}

const noRaycast = () => null

function GlowRing({
  position,
  rotation = [0, 0, 0],
  radius,
  tube = 0.008,
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
      <torusGeometry args={[radius, tube, 8, 64]} />
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

function XenoObelisk({
  x,
  z,
  height = 1.8,
  color = '#120607',
}: {
  x: number
  z: number
  height?: number
  color?: string
}) {
  return (
    <group position={[x, 0, z]} raycast={noRaycast}>
      <mesh position={[0, height / 2, 0]} raycast={noRaycast}>
        <cylinderGeometry args={[0.08, 0.14, height, 5]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>

      <mesh position={[0, height + 0.13, 0]} raycast={noRaycast}>
        <coneGeometry args={[0.16, 0.32, 5]} />
        <meshBasicMaterial
          color={PALETTE.ember}
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <GlowRing
        position={[0, 0.14, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        radius={0.32}
        tube={0.006}
        color="#8a35ff"
        opacity={0.28}
      />

      <GlowRing
        position={[0, 0.88, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        radius={0.18}
        tube={0.005}
        color="#ffcf7c"
        opacity={0.24}
      />
    </group>
  )
}

function AstralOrrery({ ritualImpulseRef }: Props) {
  const ringA = useRef<THREE.Group>(null)
  const ringB = useRef<THREE.Group>(null)
  const core = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current

    if (ringA.current) ringA.current.rotation.y += delta * (0.12 + impulse * 0.12)
    if (ringB.current) ringB.current.rotation.x += delta * (0.09 + impulse * 0.1)

    if (core.current) {
      core.current.opacity = 0.22 + Math.sin(t * 1.25) * 0.06 + impulse * 0.16
    }
  })

  return (
    <group position={[0, 2.25, -1.82]} raycast={noRaycast}>
      <group ref={ringA}>
        <GlowRing position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.92} tube={0.012} color="#b8860b" opacity={0.42} />
        <GlowRing position={[0, 0, 0]} rotation={[0.65, 0, 0]} radius={0.72} tube={0.008} color="#8a35ff" opacity={0.26} />
      </group>

      <group ref={ringB}>
        <GlowRing position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} radius={0.58} tube={0.008} color="#ff3d5a" opacity={0.22} />
        <GlowRing position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} radius={0.38} tube={0.007} color="#ffd18a" opacity={0.34} />
      </group>

      <mesh raycast={noRaycast}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshBasicMaterial
          ref={core}
          color="#d9b5ff"
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {['☉', '☽', '♀', '☿', '♃', '♄'].map((glyph, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <Text
            key={glyph}
            position={[Math.cos(a) * 1.08, Math.sin(a) * 0.22, Math.sin(a) * 0.24]}
            fontSize={0.09}
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

function AstralWall() {
  return (
    <group position={[0, 1.78, -3.18]} raycast={noRaycast}>
      <mesh raycast={noRaycast}>
        <planeGeometry args={[2.4, 2.15]} />
        <meshBasicMaterial
          color="#120507"
          transparent
          opacity={0.22}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <GlowRing position={[0, 0.15, 0.025]} radius={0.78} tube={0.01} color="#b8860b" opacity={0.32} />
      <GlowRing position={[0, 0.15, 0.035]} radius={0.48} tube={0.008} color="#8a35ff" opacity={0.24} />

      <mesh position={[0, 0.15, 0.04]} raycast={noRaycast}>
        <ringGeometry args={[0.18, 0.22, 36]} />
        <meshBasicMaterial
          color="#ffcf7c"
          transparent
          opacity={0.46}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[
        [0, 0.88],
        [-0.45, 0.55],
        [0.45, 0.55],
        [-0.72, 0.05],
        [0.72, 0.05],
        [-0.45, -0.45],
        [0.45, -0.45],
        [0, -0.78],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]} raycast={noRaycast}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#ffd18a' : '#8a35ff'}
            transparent
            opacity={0.52}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <Text
        position={[0, -1.15, 0.08]}
        fontSize={0.075}
        color="#8f6742"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.0}
        raycast={noRaycast}
      >
        ASTRUM · TABULA · VOLUNTAS
      </Text>
    </group>
  )
}

function ProcessionCircuits() {
  return (
    <group raycast={noRaycast}>
      {[-0.75, -0.38, 0.38, 0.75].map((x, i) => (
        <mesh
          key={x}
          position={[x, 0.018, -0.85 - i * 0.06]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <planeGeometry args={[0.014, 2.2]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#b8860b' : '#8a35ff'}
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {[0.42, 0.72, 1.02].map((r, i) => (
        <mesh
          key={r}
          position={[0, 0.019 + i * 0.002, -0.82]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={noRaycast}
        >
          <ringGeometry args={[r, r + 0.008, 64]} />
          <meshBasicMaterial
            color={i === 1 ? '#8a35ff' : '#b8860b'}
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function EroticSacredVeils({ ritualImpulseRef }: Props) {
  const left = useRef<THREE.MeshBasicMaterial>(null)
  const right = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const impulse = ritualImpulseRef.current
    const opacity = 0.075 + Math.sin(t * 0.5) * 0.025 + impulse * 0.05

    if (left.current) left.current.opacity = opacity
    if (right.current) right.current.opacity = opacity * 0.9
  })

  return (
    <group position={[0, 1.45, -2.72]} raycast={noRaycast}>
      <mesh position={[-0.58, 0, 0]} rotation={[0, 0, -0.08]} raycast={noRaycast}>
        <planeGeometry args={[0.5, 2.45]} />
        <meshBasicMaterial
          ref={left}
          color="#8a0d2a"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.58, 0, 0]} rotation={[0, 0, 0.08]} raycast={noRaycast}>
        <planeGeometry args={[0.5, 2.45]} />
        <meshBasicMaterial
          ref={right}
          color="#8a35ff"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function TempleXenotheurgy({ ritualImpulseRef }: Props) {
  return (
    <group>
      <ProcessionCircuits />
      <AstralWall />
      <AstralOrrery ritualImpulseRef={ritualImpulseRef} />
      <EroticSacredVeils ritualImpulseRef={ritualImpulseRef} />

      <XenoObelisk x={-2.55} z={-1.05} height={1.55} />
      <XenoObelisk x={2.55} z={-1.05} height={1.55} />
      <XenoObelisk x={-1.86} z={-2.42} height={2.05} color="#090308" />
      <XenoObelisk x={1.86} z={-2.42} height={2.05} color="#090308" />

      <Text
        position={[0, 3.05, -2.08]}
        fontSize={0.105}
        color="#9a6bff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.3}
        raycast={noRaycast}
      >
        THELEMIC XENOTHEURGIC TEMPLE OS
      </Text>
    </group>
  )
}
