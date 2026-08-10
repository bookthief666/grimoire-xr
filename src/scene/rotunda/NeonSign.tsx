import * as THREE from 'three'
import { NEON } from '../../theme/neon'
import { TempleText } from '../TempleText'

const noRaycast = () => null

export function NeonSign({
  label,
  accent,
  active = false,
  width = 1.62,
}: {
  label: string
  accent: string
  active?: boolean
  width?: number
}) {
  return (
    <group raycast={noRaycast}>
      <mesh position={[0, 0, -0.012]} raycast={noRaycast}>
        <planeGeometry args={[width + 0.16, 0.4]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.14 : 0.065}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0, -0.004]} raycast={noRaycast}>
        <planeGeometry args={[width + 0.06, 0.31]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.82 : 0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh raycast={noRaycast}>
        <planeGeometry args={[width, 0.245]} />
        <meshBasicMaterial color={NEON.void} transparent opacity={0.96} />
      </mesh>

      <TempleText
        position={[0, 0.005, 0.018]}
        fontSize={0.105}
        color={active ? '#ffffff' : accent}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.12}
      >
        {label.toUpperCase()}
      </TempleText>
    </group>
  )
}
