import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { provenanceLabel } from '../../tools/provenance'
import type { Chamber, ChamberId } from '../chambers/types'
import { PerformanceProbe } from '../RuntimePerformanceProbe'
import { pressable } from '../pressable'
import { TempleText } from '../TempleText'
import { ROTUNDA_NAV, selectorX } from './navigationLayout'

function chamberMeta(chamber: Chamber) {
  if (!chamber.source) return 'GENERATIVE WORKSTATION · NETWORK SERVICES'
  return `${provenanceLabel(chamber.source)} · ${chamber.offline === 'full' ? 'OFFLINE' : 'NETWORK'}`
}

function SummoningKey({
  chamber,
  x,
  active,
  disabled,
  onHover,
  onSummon,
}: {
  chamber: Chamber
  x: number
  active: boolean
  disabled: boolean
  onHover: (hovered: boolean) => void
  onSummon: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const targetScale = useRef(new THREE.Vector3(1, 1, 1))

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 1.1 + x * 6) * 0.5

    if (haloRef.current) {
      const base = active ? 0.21 : hovered ? 0.14 : 0.045
      haloRef.current.opacity = base + pulse * (active ? 0.09 : 0.025)
    }

    if (groupRef.current) {
      const target = hovered && !disabled ? 1.1 : 1
      targetScale.current.setScalar(target)
      groupRef.current.scale.lerp(targetScale.current, 0.18)
    }
  })

  const setHover = (value: boolean) => {
    setHovered(value)
    onHover(value)
  }

  return (
    <group
      ref={groupRef}
      position={[x, ROTUNDA_NAV.selectorY, ROTUNDA_NAV.selectorZ]}
      rotation={[-0.42, 0, 0]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHover(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHover(false)
      }}
      {...pressable(onSummon, disabled)}
    >
      <mesh position={[0, 0, -0.005]}>
        <circleGeometry args={[0.082, 32]} />
        <meshBasicMaterial
          ref={haloRef}
          color={chamber.accent}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <circleGeometry args={[0.058, 32]} />
        <meshBasicMaterial color="#03050a" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.058, 0.064, 40]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={disabled ? 0.2 : active ? 1 : hovered ? 0.82 : 0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0, 0.001, 0.02]}
        fontSize={0.05}
        color={disabled ? '#4a4a52' : active ? '#ffffff' : chamber.accent}
        anchorX="center"
        anchorY="middle"
      >
        {chamber.seal}
      </TempleText>

      <mesh position={[0, -0.01, 0.032]}>
        <planeGeometry args={[0.19, 0.2]} />
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

export function RotundaAltarPlinth({
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
  const [hoveredId, setHoveredId] = useState<ChamberId | null>(null)
  const crownRef = useRef<THREE.Group>(null)
  const fieldRef = useRef<THREE.MeshBasicMaterial>(null)
  const active = useMemo(
    () => chambers.find((chamber) => chamber.id === activeId) ?? chambers[0],
    [activeId, chambers],
  )
  const display = hoveredId
    ? chambers.find((chamber) => chamber.id === hoveredId) ?? active
    : active

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (crownRef.current) crownRef.current.rotation.y = Math.sin(t * 0.22) * 0.08
    if (fieldRef.current) {
      fieldRef.current.opacity = 0.08 + (0.5 + Math.sin(t * 0.8) * 0.5) * 0.055
    }
  })

  return (
    <group>
      <PerformanceProbe chamberId={activeId} inTransition={disabled} />

      {/* A single dim floor echo fakes a polished reflection without rendering
          the scene twice. */}
      <mesh position={[0, 0.008, -0.56]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.05]} />
        <meshBasicMaterial
          color={display.accent}
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Obsidian pedestal. The selectors float above its crown inside the
          control zone; the body itself stays low enough not to block the
          forward content sightline. */}
      <mesh position={[0, 0.31, -0.56]} scale={[1, 1, 0.52]}>
        <cylinderGeometry args={[0.58, 0.72, 0.62, 6]} />
        <meshStandardMaterial
          color="#03050b"
          emissive="#090d18"
          emissiveIntensity={0.32}
          roughness={0.3}
          metalness={0.82}
        />
      </mesh>

      <mesh position={[0, 0.64, -0.56]} scale={[1, 1, 0.55]}>
        <cylinderGeometry args={[0.76, 0.64, 0.1, 6]} />
        <meshStandardMaterial
          color="#070a12"
          emissive={display.accent}
          emissiveIntensity={0.18}
          roughness={0.24}
          metalness={0.78}
        />
      </mesh>

      <group ref={crownRef} position={[0, 0.695, -0.56]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.43, 0.47, 6]} />
          <meshBasicMaterial
            ref={fieldRef}
            color={display.accent}
            transparent
            opacity={0.1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.29, 0.315, 6]} />
          <meshBasicMaterial color={NEON.ice} transparent opacity={0.42} />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.205, 40]} />
          <meshBasicMaterial color={display.accent} transparent opacity={0.82} />
        </mesh>
        <TempleText
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.11}
          color={display.accent}
          anchorX="center"
          anchorY="middle"
        >
          {display.seal}
        </TempleText>
      </group>

      <mesh position={[0, 0.39, -0.17]}>
        <planeGeometry args={[0.88, 0.29]} />
        <meshBasicMaterial
          color={display.accent}
          transparent
          opacity={0.095}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <TempleText
        position={[0, 0.46, -0.158]}
        fontSize={0.055}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.86}
      >
        {display.name.toUpperCase()}
      </TempleText>

      <TempleText
        position={[0, 0.37, -0.157]}
        fontSize={0.029}
        color={NEON.textDim}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.86}
        textAlign="center"
      >
        {display.purpose}
      </TempleText>

      <TempleText
        position={[0, 0.29, -0.156]}
        fontSize={0.023}
        color={display.accent}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.88}
        textAlign="center"
      >
        {chamberMeta(display)}
      </TempleText>

      {chambers.map((chamber, index) => (
        <SummoningKey
          key={chamber.id}
          chamber={chamber}
          x={selectorX(index, chambers.length)}
          active={chamber.id === activeId}
          disabled={disabled}
          onHover={(hovered) => setHoveredId(hovered ? chamber.id : null)}
          onSummon={() => onSummon(chamber.id)}
        />
      ))}
    </group>
  )
}
