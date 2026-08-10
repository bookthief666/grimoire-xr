import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { TempleText } from '../TempleText'
import { NEON_SIGN_PLATES, NEON_SIGN_WIDTH } from './neonSignLayout'

const noRaycast = () => null

/** The label alone. Text cannot instance, so bays render this per station. */
export function NeonSignLabel({
  label,
  accent,
  active = false,
  width = NEON_SIGN_WIDTH,
}: {
  label: string
  accent: string
  active?: boolean
  width?: number
}) {
  return (
    <TempleText
      position={[0, 0.005, 0.018]}
      fontSize={0.105}
      color={active ? '#ffffff' : accent}
      anchorX="center"
      anchorY="middle"
      maxWidth={width - 0.12}
      raycast={noRaycast}
    >
      {label.toUpperCase()}
    </TempleText>
  )
}

export function NeonSign({
  label,
  accent,
  active = false,
  width = NEON_SIGN_WIDTH,
}: {
  label: string
  accent: string
  active?: boolean
  width?: number
}) {
  return (
    <group raycast={noRaycast}>
      {NEON_SIGN_PLATES.map((plate) => (
        <mesh key={plate.z} position={[0, 0, plate.z]} raycast={noRaycast}>
          <planeGeometry args={[width + plate.pad, plate.height]} />
          <meshBasicMaterial
            color={plate.additive ? accent : NEON.void}
            transparent
            opacity={active ? plate.active : plate.idle}
            depthWrite={false}
            blending={plate.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </mesh>
      ))}

      <NeonSignLabel label={label} accent={accent} active={active} width={width} />
    </group>
  )
}
