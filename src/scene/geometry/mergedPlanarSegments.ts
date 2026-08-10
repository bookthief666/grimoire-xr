import * as THREE from 'three'

export type PlanarSegment = {
  from: readonly [number, number]
  to: readonly [number, number]
  width: number
  depth?: number
  color?: THREE.ColorRepresentation
  intensity?: number
}

export type PlanarSegmentPlane = 'xy' | 'xz'

/**
 * Build many flat luminous bars as one indexed geometry.
 *
 * The old scene expressed every bar as its own plane mesh. Each one carried
 * only two triangles but still paid for a complete draw submission. Baking
 * opacity into vertex colour preserves additive output (`colour * opacity`)
 * while allowing differently coloured bars to share one material and draw.
 */
export function buildMergedPlanarSegments(
  segments: readonly PlanarSegment[],
  plane: PlanarSegmentPlane,
) {
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []

  for (const segment of segments) {
    const dx = segment.to[0] - segment.from[0]
    const dy = segment.to[1] - segment.from[1]
    const length = Math.hypot(dx, dy)
    if (length === 0 || segment.width <= 0) continue

    const halfWidth = segment.width / 2
    const perpendicularX = (-dy / length) * halfWidth
    const perpendicularY = (dx / length) * halfWidth
    const depth = segment.depth ?? 0
    const corners = [
      [segment.from[0] + perpendicularX, segment.from[1] + perpendicularY],
      [segment.from[0] - perpendicularX, segment.from[1] - perpendicularY],
      [segment.to[0] - perpendicularX, segment.to[1] - perpendicularY],
      [segment.to[0] + perpendicularX, segment.to[1] + perpendicularY],
    ] as const

    const vertexOffset = positions.length / 3
    for (const [first, second] of corners) {
      if (plane === 'xy') positions.push(first, second, depth)
      else positions.push(first, depth, second)
    }

    const color = new THREE.Color(segment.color ?? '#ffffff')
      .multiplyScalar(segment.intensity ?? 1)
    for (let vertex = 0; vertex < 4; vertex += 1) {
      colors.push(color.r, color.g, color.b)
    }

    indices.push(
      vertexOffset,
      vertexOffset + 1,
      vertexOffset + 2,
      vertexOffset,
      vertexOffset + 2,
      vertexOffset + 3,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return geometry
}
