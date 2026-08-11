import assert from 'node:assert/strict'
import test from 'node:test'
import { cellControlPose } from '../src/scene/chambers/cellReaderLayout.ts'
import { blocksForwardSightline, zoneOf, ZONES } from '../src/scene/zones.ts'

/**
 * Third chamber, same three constraints. Each was learned by breaking it, so
 * each is asserted rather than left to a comment.
 */

const COUNTS = [3, 4, 5, 6]

test('controls sit in the content zone at every count', () => {
  for (const count of COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const { position } = cellControlPose(i, count)
      assert.equal(
        zoneOf(...position),
        'content',
        `control ${i}/${count} at ${JSON.stringify(position)} is not in ZONES.content`,
      )
    }
  }
})

test('controls clear the altar console distance band', () => {
  for (const count of COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const [x, y, z] = cellControlPose(i, count).position
      const distance = Math.hypot(x, y - 1.6, z)
      assert.ok(
        distance >= ZONES.content.near,
        `control ${i}/${count} at ${distance.toFixed(2)}m is nearer than the content zone`,
      )
    }
  }
})

test('controls never block the forward sightline to the axis field', () => {
  // The Cell's whole premise is turning to face the lit axis. A control row
  // across the forward view at eye height would sit in front of it.
  for (const count of COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const { position } = cellControlPose(i, count)
      assert.equal(blocksForwardSightline(...position), false, `control ${i}/${count}`)
    }
  }
})

test('controls clear the altar plinth crown', () => {
  // The plinth tops out near y 0.75 and stands between the practitioner and
  // this chamber's controls in the flat fallback view.
  for (const count of COUNTS) {
    for (let i = 0; i < count; i += 1) {
      assert.ok(cellControlPose(i, count).position[1] > 0.8, `control ${i}/${count} is too low`)
    }
  }
})

test('the row stays symmetric about the forward axis', () => {
  assert.ok(Math.abs(cellControlPose(0, 4).position[0] + cellControlPose(3, 4).position[0]) < 1e-9)
  assert.ok(Math.abs(cellControlPose(0, 6).position[0] + cellControlPose(5, 6).position[0]) < 1e-9)
})
