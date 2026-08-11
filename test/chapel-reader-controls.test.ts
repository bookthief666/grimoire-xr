import assert from 'node:assert/strict'
import test from 'node:test'
import { readerControlPose } from '../src/scene/chambers/readerControlLayout.ts'
import { blocksForwardSightline, zoneOf, ZONES } from '../src/scene/zones.ts'

/**
 * The reader's PREV/PAGE/NEXT/CLOSE controls previously sat at 1.32m from the
 * practitioner — inside ZONES.work, the same distance band as the altar
 * desk's own CONSULT/QUESTION/TRIAD controls (~1.24m). A reach for NEXT could
 * land on CONSULT instead, silently discarding the open chapter and drawing a
 * new reading. zones.ts explicitly reserves ZONES.content for exactly this
 * case: "Readings and tablets. Interactive only for pagination."
 */

test('reader controls sit in the content zone, not the altar work zone', () => {
  for (let i = 0; i < 4; i += 1) {
    const { position } = readerControlPose(i, 4)
    assert.equal(
      zoneOf(...position),
      'content',
      `control ${i} at ${JSON.stringify(position)} is not in ZONES.content`,
    )
  }
})

test('reader controls are farther out than the altar desk controls', () => {
  // The altar's CONSULT sits at roughly [0.4, 0.94, -0.97] (ORACLE_DESK_POSITION
  // plus its local offset), about 1.24m from the practitioner. Every reader
  // control must clear ZONES.work's far bound so the two can never be confused.
  for (let i = 0; i < 4; i += 1) {
    const [x, y, z] = readerControlPose(i, 4).position
    const distance = Math.hypot(x, y - 1.6, z)
    assert.ok(
      distance >= ZONES.content.near,
      `control ${i} at ${distance.toFixed(2)}m is closer than the content zone begins`,
    )
  }
})

test('reader controls do not block the forward sightline', () => {
  for (let i = 0; i < 4; i += 1) {
    const { position } = readerControlPose(i, 4)
    assert.equal(blocksForwardSightline(...position), false, `control ${i} blocks sightline`)
  }
})

test('reader controls stay symmetric about the forward axis', () => {
  const left = readerControlPose(0, 4).position[0]
  const right = readerControlPose(3, 4).position[0]
  assert.ok(Math.abs(left + right) < 1e-9, 'outer pair is not mirrored')
})
