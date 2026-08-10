import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { provenanceLabel } from '../../tools/provenance'
import type { Chamber, ChamberId } from '../chambers/types'
import { TempleText } from '../TempleText'
import { NeonSign } from './NeonSign'
import { stationPose } from './navigationLayout'
import { StationPreviewArtifact } from './StationPreviewArtifact'

const noRaycast = () => null

function stationMeta(chamber: Chamber) {
  if (!chamber.source) {
    return chamber.offline === 'partial'
      ? 'GENERATIVE · NETWORK SERVICES'
      : 'GENERATIVE WORKSTATION'
  }

  return `${provenanceLabel(chamber.source)} · ${chamber.offline === 'full' ? 'OFFLINE' : 'NETWORK'}`
}

function StationBay({
  chamber,
  active,
  index,
  count,
  setAnimationRef,
  setFieldMaterialRef,
}: {
  chamber: Chamber
  active: boolean
  index: number
  count: number
  setAnimationRef: (node: THREE.Group | null) => void
  setFieldMaterialRef: (node: THREE.MeshBasicMaterial | null) => void
}) {
  const pose = stationPose(index, count)

  return (
    <group
      position={pose.position}
      rotation={[0, pose.rotationY, 0]}
      raycast={noRaycast}
    >
      {/* Dark architectural recess. It depth-writes, so the signage reads as
          mounted into the rotunda wall instead of floating in the void. */}
      <mesh position={[0, 0.12, -0.11]} raycast={noRaycast}>
        <boxGeometry args={[1.88, 2.24, 0.18]} />
        <meshBasicMaterial color="#03050a" />
      </mesh>

      {/* One cheap halo behind the whole bay instead of bloom/postprocessing. */}
      <mesh position={[0, 0.12, -0.06]} raycast={noRaycast}>
        <planeGeometry args={[2.08, 2.44]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 0.12 : 0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Arch and jambs visually lock the bay into the colonnade opening. */}
      <mesh position={[0, 0.66, 0.004]} raycast={noRaycast}>
        <torusGeometry args={[0.72, 0.016, 5, 36, Math.PI]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 0.96 : 0.56}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.1, 0.004]} raycast={noRaycast}>
          <planeGeometry args={[0.024, 1.12]} />
          <meshBasicMaterial
            color={chamber.accent}
            transparent
            opacity={active ? 0.84 : 0.46}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {[-0.68, 0.72].map((y) => (
        <mesh key={y} position={[0, y, 0.006]} raycast={noRaycast}>
          <planeGeometry args={[1.42, 0.018]} />
          <meshBasicMaterial
            color={chamber.accent}
            transparent
            opacity={active ? 0.58 : 0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <group position={[0, 0.94, 0.015]}>
        <NeonSign label={chamber.name} accent={chamber.accent} active={active} />
      </group>

      <group position={[0, 0.2, 0.035]}>
        <StationPreviewArtifact
          kind={chamber.previewArtifact}
          accent={chamber.accent}
          active={active}
          animationRef={setAnimationRef}
          fieldMaterialRef={setFieldMaterialRef}
        />
      </group>

      <TempleText
        position={[0, -0.37, 0.026]}
        fontSize={0.057}
        color={NEON.text}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.48}
        textAlign="center"
      >
        {chamber.purpose}
      </TempleText>

      <TempleText
        position={[0, -0.58, 0.026]}
        fontSize={0.044}
        color={active ? chamber.accent : NEON.textDim}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
        textAlign="center"
      >
        {active ? `ACTIVE · ${stationMeta(chamber)}` : stationMeta(chamber)}
      </TempleText>
    </group>
  )
}

/**
 * Ambient wall stations. They intentionally do not raycast: at ~6m they live
 * in the ambient zone, so the actual interaction surface belongs on the altar
 * console at hand reach. This keeps the room-as-interface composition without
 * turning distant architecture into ergonomically ambiguous controls.
 */
export function RotundaStationBays({
  chambers,
  activeId,
}: {
  chambers: readonly Chamber[]
  activeId: ChamberId
}) {
  const animationRefs = useRef<Array<THREE.Group | null>>([])
  const fieldMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([])

  // One shared frame subscription animates every ambient preview. The four bays
  // stay mounted for architectural continuity without registering four separate
  // useFrame callbacks.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    chambers.forEach((chamber, index) => {
      const phaseOffset = index * 1.37
      const pulse = 0.5 + Math.sin(t * 0.72 + phaseOffset) * 0.5
      const active = chamber.id === activeId
      const artifact = animationRefs.current[index]
      const field = fieldMaterialRefs.current[index]

      if (artifact) {
        artifact.rotation.z = Math.sin(t * 0.16 + phaseOffset) * 0.035
        artifact.scale.setScalar(1 + pulse * (active ? 0.04 : 0.015))
      }
      if (field) {
        field.opacity = (active ? 0.13 : 0.045) + pulse * (active ? 0.07 : 0.02)
      }
    })
  })

  return (
    <group raycast={noRaycast}>
      {chambers.map((chamber, index) => (
        <StationBay
          key={chamber.id}
          chamber={chamber}
          active={chamber.id === activeId}
          index={index}
          count={chambers.length}
          setAnimationRef={(node) => {
            animationRefs.current[index] = node
          }}
          setFieldMaterialRef={(node) => {
            fieldMaterialRefs.current[index] = node
          }}
        />
      ))}
    </group>
  )
}
