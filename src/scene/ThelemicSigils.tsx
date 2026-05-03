import { Line, Text } from '@react-three/drei'
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
 * Continuous-line Thelemic unicursal hexagram glyph.
 *
 * This path is shaped after the standard Thelemic unicursal hexagram
 * silhouette: top apex, side triangular wings, central crossing, lower
 * diamond, and bottom apex. It is not the ordinary two-triangle hexagram
 * and not a pentagram.
 */
const UNICURSAL_POINTS: Vec3[] = [
  [0, 1.0, 0],
  [0.34, 0.18, 0],
  [0.94, 0.42, 0],
  [0.53, -0.09, 0],
  [0.78, -0.58, 0],
  [0.16, -0.23, 0],
  [0, -1.0, 0],
  [-0.16, -0.23, 0],
  [-0.78, -0.58, 0],
  [-0.53, -0.09, 0],
  [-0.94, 0.42, 0],
  [-0.34, 0.18, 0],
  [0, 1.0, 0],
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
        lineWidth={lineWidth * 2.2}
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


type BabalonStarGlyphProps = {
  radius?: number
  color?: string
  opacity?: number
  lineWidth?: number
  withCircle?: boolean
  withLetters?: boolean
  /**
   * Compatibility alias for older UnicursalHexagramGlyph call sites.
   * When true, renders the central Babalon seal points.
   */
  withRose?: boolean
}

const BABALON_STAR_ORDER = [0, 3, 6, 2, 5, 1, 4, 0]
const BABALON_LETTERS = ['B', 'A', 'B', 'A', 'L', 'O', 'N'] as const

/**
 * Seven-point Babalon star / septagram glyph.
 *
 * This is deliberately not the unicursal hexagram and not a five-point
 * pentagram. Use it for the Babalon-star temple floor, crown, and major
 * hard-light seals.
 */
export function BabalonStarGlyph({
  radius = 1,
  color = '#f8f3df',
  opacity = 0.9,
  lineWidth = 2.4,
  withCircle = true,
  withLetters = false,
  withRose = true,
}: BabalonStarGlyphProps) {
  const vertices = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 7
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      )
    })
  }, [radius])

  const starPoints = useMemo(
    () => BABALON_STAR_ORDER.map((index) => vertices[index].clone()),
    [vertices],
  )

  return (
    <group>
      {withCircle ? (
        <mesh position={[0, 0, -0.004]}>
          <ringGeometry args={[radius * 1.04, radius * 1.08, 96]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * 0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      <Line
        points={starPoints}
        color={color}
        lineWidth={lineWidth * 2.2}
        transparent
        opacity={opacity * 0.18}
      />

      <Line
        points={starPoints}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
      />

      {withRose ? (
        <group>
          {Array.from({ length: 7 }, (_, index) => {
            const angle = -Math.PI / 2 + (index * Math.PI * 2) / 7
            return (
              <mesh
                key={index}
                position={[
                  Math.cos(angle) * radius * 0.17,
                  Math.sin(angle) * radius * 0.17,
                  0.008,
                ]}
              >
                <circleGeometry args={[radius * 0.028, 14]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={opacity * 0.46}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )
          })}
        </group>
      ) : null}

      {withLetters ? (
        <group>
          {vertices.map((point, index) => (
            <Text
              key={`${BABALON_LETTERS[index]}-${index}`}
              position={[point.x * 0.72, point.y * 0.72, 0.02]}
              fontSize={radius * 0.115}
              color={color}
              anchorX="center"
              anchorY="middle"
              fillOpacity={opacity * 0.72}
              maxWidth={radius * 0.18}
            >
              {BABALON_LETTERS[index]}
            </Text>
          ))}
        </group>
      ) : null}
    </group>
  )
}

