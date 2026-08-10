import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ROTUNDA_NAV,
  selectorX,
  stationPose,
} from '../src/scene/rotunda/navigationLayout.ts'
import {
  blocksForwardSightline,
  zoneOf,
} from '../src/scene/zones.ts'

test('wall stations sit on colonnade openings, never between columns', () => {
  for (let index = 0; index < 4; index += 1) {
    const { rotationY } = stationPose(index, 4)
    // rotationY is angle + PI, so the offset from the forward axis is what is
    // left after removing that turn.
    const offset = rotationY - Math.PI - Math.PI
    const openings = offset / ROTUNDA_NAV.stationStepRadians

    assert.ok(
      Math.abs(openings - Math.round(openings)) < 1e-9,
      `station ${index} is not aligned to a colonnade opening`,
    )
  }
})

test('no wall station stands on the forward axis', () => {
  // The axis belongs to whatever the active chamber builds at the centre of
  // the room. A bay placed there is hidden behind it — which is exactly what
  // happened to two of four bays in the Sanctum before this layout.
  for (let index = 0; index < 4; index += 1) {
    const { rotationY } = stationPose(index, 4)
    const offset = Math.abs(rotationY - Math.PI - Math.PI)

    assert.ok(
      offset > ROTUNDA_NAV.stationStepRadians - 1e-9,
      `station ${index} sits on or beside the forward axis`,
    )
  }
})

test('wall stations stay symmetric about the forward axis', () => {
  const offsets = Array.from(
    { length: 4 },
    (_, index) => stationPose(index, 4).rotationY - Math.PI - Math.PI,
  )

  assert.ok(Math.abs(offsets[0] + offsets[3]) < 1e-9, 'outer pair is not mirrored')
  assert.ok(Math.abs(offsets[1] + offsets[2]) < 1e-9, 'inner pair is not mirrored')
})

test('wall stations remain ambient and non-workspace', () => {
  for (let index = 0; index < 4; index += 1) {
    const { position } = stationPose(index, 4)
    assert.equal(zoneOf(...position), 'ambient')
  }
})

test('altar summon keys remain inside the VR control zone', () => {
  for (let index = 0; index < 4; index += 1) {
    const x = selectorX(index, 4)
    assert.equal(
      zoneOf(x, ROTUNDA_NAV.selectorY, ROTUNDA_NAV.selectorZ),
      'control',
    )
    assert.equal(
      blocksForwardSightline(x, ROTUNDA_NAV.selectorY, ROTUNDA_NAV.selectorZ),
      false,
    )
  }
})
