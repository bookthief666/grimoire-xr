import assert from 'node:assert/strict'
import test from 'node:test'
import { forgeDialPose } from '../src/scene/workbench/forgeDialLayout.ts'
import { blocksForwardSightline, zoneOf, ZONES } from '../src/scene/zones.ts'

/**
 * The Forge carries nine dials — more than any other surface here — and they
 * are the reason it cost 156 draws as two stacked panels. These assertions pin
 * the replacement geometry to the same constraints the three chambers learned,
 * plus the one specific to this layout: the columns must stay outside the
 * forward sightline corridor, because that is what buys them the full vertical
 * range nine rows need.
 */

const LEFT_ROWS = 5
const RIGHT_ROWS = 4

const everyDial = () => {
  const poses = []
  for (let r = 0; r < LEFT_ROWS; r += 1) poses.push(forgeDialPose('left', r))
  for (let r = 0; r < RIGHT_ROWS; r += 1) poses.push(forgeDialPose('right', r))
  return poses
}

test('every dial sits in the content zone', () => {
  for (const { position } of everyDial()) {
    assert.equal(
      zoneOf(...position),
      'content',
      `dial at ${JSON.stringify(position)} is not in ZONES.content`,
    )
  }
})

test('every dial clears the altar console distance band', () => {
  for (const { position } of everyDial()) {
    const distance = Math.hypot(position[0], position[1] - 1.6, position[2])
    assert.ok(
      distance >= ZONES.content.near,
      `dial at ${distance.toFixed(2)}m is nearer than the content zone begins`,
    )
  }
})

test('no dial crosses the forward sightline', () => {
  // The solar engine and the altar own the forward axis. This is also what
  // lets the rows use the full vertical range instead of the narrow
  // interactive band a centred row would be confined to.
  for (const { position } of everyDial()) {
    assert.equal(blocksForwardSightline(...position), false, JSON.stringify(position))
  }
})

test('the columns clear the sightline corridor with margin', () => {
  // blocksForwardSightline guards |x| < 0.8. Sitting just outside it would be
  // fragile; these sit clear enough that a later nudge cannot silently break it.
  for (const { position } of everyDial()) {
    assert.ok(Math.abs(position[0]) > 0.95, `dial x=${position[0]} is too near the corridor`)
  }
})

test('rows are far enough apart to hit with a controller ray', () => {
  const a = forgeDialPose('left', 0).position
  const b = forgeDialPose('left', 1).position
  const gap = Math.abs(a[1] - b[1])
  const distance = Math.hypot(a[0], a[1] - 1.6, a[2])
  const degrees = (Math.atan2(gap, distance) * 180) / Math.PI

  assert.ok(degrees > 4, `rows are only ${degrees.toFixed(1)} degrees apart`)
})

test('the columns are mirrored and face inward', () => {
  const left = forgeDialPose('left', 0)
  const right = forgeDialPose('right', 0)

  assert.ok(Math.abs(left.position[0] + right.position[0]) < 1e-9)
  assert.equal(left.position[1], right.position[1])
  assert.ok(Math.abs(left.rotationY + right.rotationY) < 1e-9)
  assert.ok(left.rotationY > 0, 'left column must turn toward the centre')
})
