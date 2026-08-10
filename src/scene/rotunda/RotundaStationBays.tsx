import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { provenanceLabel } from '../../tools/provenance'
import type { Chamber, ChamberId } from '../chambers/types'
import { TempleText } from '../TempleText'
import { NeonSign } from './NeonSign'
import { stationPose } from './navigationLayout'

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
}: {
  chamber: Chamber
  active: boolean
  index: number
  count: number
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
      <mesh position={[0, 0.12, -0.035]} raycast={noRaycast}>
        <planeGeometry args={[1.88, 2.24]} />
        <meshBasicMaterial color="#03050a" transparent opacity={0.94} />
      </mesh>

      {/* One cheap halo behind the whole bay instead of bloom/postprocessing. */}
      <mesh position={[0, 0.12, -0.06]} raycast={noRaycast}>
        <planeGeometry args={[2.08, 2.44]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 0.075 : 0.025}
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
          opacity={active ? 0.9 : 0.42}
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
            opacity={active ? 0.78 : 0.34}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <group position={[0, 0.94, 0.015]}>
        <NeonSign label={chamber.name} accent={chamber.accent} active={active} />
      </group>

      <mesh position={[0, 0.18, 0.012]} raycast={noRaycast}>
        <ringGeometry args={[0.29, 0.305, 48]} />
        <meshBasicMaterial
          color={chamber.accent}
          transparent
          opacity={active ? 0.95 : 0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.18, -0.002]} raycast={noRaycast}>
        <circleGeometry args={[0.275, 40]} />
        <meshBasicMaterial color={NEON.void} />
      </mesh>

      <TempleText
        position={[0, 0.18, 0.03]}
        fontSize={0.23}
        color={active ? '#ffffff' : chamber.accent}
        anchorX="center"
        anchorY="middle"
      >
        {chamber.seal}
      </TempleText>

      <TempleText
        position={[0, -0.23, 0.026]}
        fontSize={0.062}
        color={NEON.text}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.48}
        textAlign="center"
      >
        {chamber.purpose}
      </TempleText>

      <TempleText
        position={[0, -0.53, 0.026]}
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
  return (
    <group raycast={noRaycast}>
      {chambers.map((chamber, index) => (
        <StationBay
          key={chamber.id}
          chamber={chamber}
          active={chamber.id === activeId}
          index={index}
          count={chambers.length}
        />
      ))}
    </group>
  )
}
