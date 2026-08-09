import { Line } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { TempleText } from './TempleText'

type Vec3 = [number, number, number]

/**
 * A ring of identical discs, drawn in one call instead of `count` of them.
 *
 * These glyphs are used twelve times across five scene files, and each use was
 * issuing a separate draw call per petal. That matters more than it sounds:
 * profiling showed the temple is draw-call bound rather than geometry bound —
 * 774 calls against only ~99k triangles, with 42% of calls drawing a single
 * quad. Two triangles is not worth a state change and a draw.
 */
function PetalRing({
  count,
  orbit,
  petal,
  z,
  color,
  opacity,
  segments = 14,
  angleOffset = -Math.PI / 2,
}: {
  count: number
  orbit: number
  petal: number
  z: number
  color: string
  opacity: number
  segments?: number
  angleOffset?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Positions depend only on props, so the matrices are written once per change
  // rather than every frame.
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < count; i += 1) {
      const angle = angleOffset + (i * Math.PI * 2) / count
      dummy.position.set(Math.cos(angle) * orbit, Math.sin(angle) * orbit, z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  }, [angleOffset, count, dummy, orbit, z])

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <circleGeometry args={[petal, segments]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

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
        <PetalRing
          count={5}
          orbit={radius * 0.105}
          petal={radius * 0.04}
          z={0.004}
          color={color}
          opacity={opacity * 0.42}
          segments={16}
          angleOffset={0}
        />
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
        <PetalRing
          count={7}
          orbit={radius * 0.17}
          petal={radius * 0.028}
          z={0.008}
          color={color}
          opacity={opacity * 0.46}
        />
      ) : null}

      {withLetters ? (
        <group>
          {vertices.map((point, index) => (
            <TempleText
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
            </TempleText>
          ))}
        </group>
      ) : null}
    </group>
  )
}

