import assert from 'node:assert/strict'
import test from 'node:test'
import {
  monadControlPose,
  monadRegisterPose,
} from '../src/scene/chambers/monadReaderLayout.ts'
import { blocksForwardSightline, zoneOf, ZONES } from '../src/scene/zones.ts'

/**
 * Reading controls must sit further out than the altar console, always.
 *
 * The Monad's lectern controls once shared a screen band with the altar
 * selector row and lost the raycast to it, so ADVANCE silently switched
 * chambers instead of advancing the construction. The Chapel's reader controls
 * later landed at 1.32m, inside ZONES.work with the altar's CONSULT at ~1.24m.
 * Same bug, twice. These assertions exist so it cannot happen a third time.
 */

const CONTROL_COUNTS = [2, 3, 4, 5]
const REGISTER_COUNTS = [1, 2, 3, 4, 5, 6, 7]

test('navigation controls sit in the content zone', () => {
  for (const count of CONTROL_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const { position } = monadControlPose(i, count)
      assert.equal(
        zoneOf(...position),
        'content',
        `control ${i}/${count} at ${JSON.stringify(position)} is not in ZONES.content`,
      )
    }
  }
})

test('register selector sits in the content zone at every register count', () => {
  // Registers are partial across the corpus: a sentence may advertise one or
  // all seven, and the row must stay legal at both extremes.
  for (const count of REGISTER_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const { position } = monadRegisterPose(i, count)
      assert.equal(
        zoneOf(...position),
        'content',
        `register ${i}/${count} at ${JSON.stringify(position)} is not in ZONES.content`,
      )
    }
  }
})

test('every reading control clears the altar console distance band', () => {
  const beyondWork = (position: readonly [number, number, number]) =>
    Math.hypot(position[0], position[1] - 1.6, position[2]) >= ZONES.content.near

  for (const count of CONTROL_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      assert.ok(beyondWork(monadControlPose(i, count).position), `control ${i}/${count}`)
    }
  }
  for (const count of REGISTER_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      assert.ok(beyondWork(monadRegisterPose(i, count).position), `register ${i}/${count}`)
    }
  }
})

test('reading controls never block the forward sightline to the glyph', () => {
  // The glyph is the chamber. Controls must not sit in front of it.
  for (const count of CONTROL_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const { position } = monadControlPose(i, count)
      assert.equal(blocksForwardSightline(...position), false, `control ${i}/${count}`)
    }
  }
  for (const count of REGISTER_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const { position } = monadRegisterPose(i, count)
      assert.equal(blocksForwardSightline(...position), false, `register ${i}/${count}`)
    }
  }
})

test('a full seven-register row stays within a comfortable head turn', () => {
  // The step tightens past five registers so the row does not wrap behind the
  // practitioner, who cannot walk away from it.
  const first = monadRegisterPose(0, 7)
  const last = monadRegisterPose(6, 7)
  const spread = Math.abs(first.rotationY - last.rotationY)

  assert.ok(spread < Math.PI / 2, `seven registers span ${spread.toFixed(2)} rad`)
})

test('control rows are symmetric about the forward axis', () => {
  assert.ok(Math.abs(monadControlPose(0, 4).position[0] + monadControlPose(3, 4).position[0]) < 1e-9)
  assert.ok(Math.abs(monadRegisterPose(0, 7).position[0] + monadRegisterPose(6, 7).position[0]) < 1e-9)
})
