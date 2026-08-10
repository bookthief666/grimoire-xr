import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Chamber, ChamberId } from './types'
import { TempleText } from '../TempleText'
import { pressable } from '../pressable'
import { PerformanceProbe } from '../PerformanceProbe'
import { provenanceLabel } from '../../tools/provenance'

const RING_Y = 0.86
const RING_Z = -0.3
const RING_TILT = -0.42

function Seal({
  chamber,
  x,
  active,
  disabled,
  onSummon,
}: {
  chamber: Chamber
  x: number
  active: boolean
  disabled: boolean
  onSummon: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const coronaRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const breath = 0.5 + Math.sin(time * 0.9 + x * 5) * 0.5

    if (haloRef.current) {
      const base = active ? 0.34 : hovered ? 0.26 : 0.09
      haloRef.current.opacity = base + breath * (active ? 0.16 : 0.05)
    }

    if (coronaRef.current) coronaRef.current.rotation.z = time * 0.35

    if (groupRef.current) {
      const target = hovered && !disabled ? 1.12 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18)
    }
  })

  const provenance = chamber.source
    ? `${provenanceLabel(chamber.source)} · ${chamber.offline === 'full' ? 'OFFLINE' : 'NETWORK'}`
    : 'GENERATIVE WORKSTATION · NETWORK SERVICES'

  return (
    <group
      ref={groupRef}
      position={[x, RING_Y, RING_Z]}
      rotation={[RING_TILT, 0, 0]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      {...pressable(onSummon, disabled)}
    >
      <mesh position={[0, 0, -0.002]}>
        <circleGeometry args={[0.082, 28]} />
        <meshBasicMaterial
          ref={haloRef}
          color={chamber.accent}
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <circleGeometry args={[0.058, 32]} />
        <meshBasicMaterial color="#04050b" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.058, 0.0625, 48]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 1 : hovered ? 0.85 : 0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.003]}>
        <ringGeometry args={[0.044, 0.0455, 40]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 0.55 : 0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {active ? (
        <mesh ref={coronaRef} position={[0, 0, 0.004]}>
          <ringGeometry args={[0.069, 0.0735, 6]} />
          <meshBasicMaterial
            color={chamber.accent}
            transparent
            opacity={0.8}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      <TempleText
        position={[0, 0.001, 0.02]}
        fontSize={0.05}
        color={disabled ? '#4a4a52' : active ? '#ffffff' : chamber.accent}
        anchorX="center"
        anchorY="middle"
      >
        {chamber.seal}
      </TempleText>

      {hovered ? (
        <>
          <TempleText
            position={[0, -0.105, 0.02]}
            fontSize={0.026}
            color="#f2f2f5"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.7}
          >
            {chamber.name}
          </TempleText>
          <TempleText
            position={[0, -0.142, 0.02]}
            fontSize={0.025}
            color="#8b8b96"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
          >
            {chamber.purpose}
          </TempleText>
          <TempleText
            position={[0, -0.182, 0.02]}
            fontSize={0.021}
            color={chamber.source ? chamber.accent : '#ffd18a'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.86}
          >
            {provenance}
          </TempleText>
        </>
      ) : null}

      <mesh position={[0, -0.03, 0.03]}>
        <planeGeometry args={[0.22, 0.28]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function SummoningRing({
  chambers,
  activeId,
  disabled,
  onSummon,
}: {
  chambers: readonly Chamber[]
  activeId: ChamberId
  disabled: boolean
  onSummon: (id: ChamberId) => void
}) {
  const spacing = 0.24
  const start = -((chambers.length - 1) * spacing) / 2

  return (
    <group>
      <PerformanceProbe chamberId={activeId} inTransition={disabled} />

      <mesh position={[0, RING_Y, RING_Z - 0.004]} rotation={[RING_TILT, 0, 0]}>
        <planeGeometry args={[chambers.length * spacing + 0.06, 0.004]} />
        <meshBasicMaterial
          color="#6b7684"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {chambers.map((chamber, index) => (
        <Seal
          key={chamber.id}
          chamber={chamber}
          x={start + index * spacing}
          active={chamber.id === activeId}
          disabled={disabled}
          onSummon={() => onSummon(chamber.id)}
        />
      ))}
    </group>
  )
}
