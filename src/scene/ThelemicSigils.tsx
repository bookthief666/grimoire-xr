import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

type Vec3 = [number, number, number]

type UnicursalHexagramGlyphProps = {
  radius?: number
  color?: string
  opacity?: number
  lineWidth?: number
  withRose?: boolean
}

/**
 * Continuous-line Thelemic unicursal hexagram approximation.
 *
 * This intentionally avoids the ordinary two-triangle hexagram form.
 * Use this for Thelemic hard-light sigils throughout the XR space.
 */
const UNICURSAL_POINTS: Vec3[] = [
  [0, 1, 0],
  [-0.28, 0.18, 0],
  [-0.92, 0.38, 0],
  [-0.36, -0.08, 0],
  [-0.56, -0.82, 0],
  [0, -0.34, 0],
  [0.56, -0.82, 0],
  [0.36, -0.08, 0],
  [0.92, 0.38, 0],
  [0.28, 0.18, 0],
  [0, 1, 0],
]

export function UnicursalHexagramGlyph({
  radius = 1,
  color = '#f8f3df',
  opacity = 0.92,
  lineWidth = 2.4,
  withRose = true,
}: UnicursalHexagramGlyphProps) {
  const points = useMemo(
    () =>
      UNICURSAL_POINTS.map(
        ([x, y, z]) => new THREE.Vector3(x * radius, y * radius, z * radius),
      ),
    [radius],
  )

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth * 3.2}
        transparent
        opacity={opacity * 0.16}
      />

      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
      />

      {withRose ? (
        <group>
          {Array.from({ length: 5 }, (_, index) => {
            const angle = (index / 5) * Math.PI * 2
            return (
              <mesh
                key={index}
                position={[
                  Math.cos(angle) * radius * 0.105,
                  Math.sin(angle) * radius * 0.105,
                  0.004,
                ]}
              >
                <circleGeometry args={[radius * 0.04, 16]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity * 0.42}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )
          })}
        </group>
      ) : null}
    </group>
  )
}
