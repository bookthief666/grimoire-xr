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

test('wall stations align to consecutive colonnade bays', () => {
  const poses = Array.from({ length: 4 }, (_, index) => stationPose(index, 4))
  const angles = poses.map((pose) => pose.rotationY)

  for (let index = 1; index < angles.length; index += 1) {
    assert.ok(
      Math.abs((angles[index] - angles[index - 1]) - Math.PI / 6) < 1e-9,
      'station bays must stay one colonnade bay apart',
    )
  }
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
