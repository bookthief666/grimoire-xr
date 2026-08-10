import assert from 'node:assert/strict'
import test from 'node:test'
import * as THREE from 'three'
import {
  buildMergedPlanarSegments,
  type PlanarSegment,
} from '../src/scene/geometry/mergedPlanarSegments.ts'

const SEGMENTS: PlanarSegment[] = [
  { from: [-1, 0], to: [1, 0], width: 0.1, color: '#ffffff', intensity: 0.5 },
  { from: [0, -1], to: [0, 1], width: 0.2, depth: 0.25, color: '#ff0000' },
]

test('merged planar segments scale attributes and indices with visible bars', () => {
  const geometry = buildMergedPlanarSegments(SEGMENTS, 'xy')

  assert.equal(geometry.getAttribute('position').count, SEGMENTS.length * 4)
  assert.equal(geometry.getAttribute('color').count, SEGMENTS.length * 4)
  assert.equal(geometry.getIndex()?.count, SEGMENTS.length * 6)

  geometry.dispose()
})

test('merged planar segments preserve plane, depth, and premultiplied light energy', () => {
  const geometry = buildMergedPlanarSegments(SEGMENTS, 'xz')
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute
  const colors = geometry.getAttribute('color') as THREE.BufferAttribute

  for (let vertex = 0; vertex < 4; vertex += 1) {
    assert.equal(positions.getY(vertex), 0)
    assert.ok(Math.abs(colors.getX(vertex) - 0.5) < 1e-6)
    assert.ok(Math.abs(colors.getY(vertex) - 0.5) < 1e-6)
    assert.ok(Math.abs(colors.getZ(vertex) - 0.5) < 1e-6)
  }

  for (let vertex = 4; vertex < 8; vertex += 1) {
    assert.equal(positions.getY(vertex), 0.25)
  }

  geometry.dispose()
})

test('zero-length and zero-width segments do not emit degenerate quads', () => {
  const geometry = buildMergedPlanarSegments([
    { from: [0, 0], to: [0, 0], width: 1 },
    { from: [0, 0], to: [1, 0], width: 0 },
  ], 'xy')

  assert.equal(geometry.getAttribute('position').count, 0)
  assert.equal(geometry.getIndex()?.count, 0)

  geometry.dispose()
})
