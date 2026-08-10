import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildCosmicStarField,
  buildEmberField,
  deterministicUnit,
} from '../src/scene/deterministicField.ts'

test('deterministic unit generator is stable and bounded', () => {
  assert.equal(deterministicUnit(12, 3), deterministicUnit(12, 3))
  assert.notEqual(deterministicUnit(12, 3), deterministicUnit(12, 4))
  assert.ok(deterministicUnit(12, 3) >= 0)
  assert.ok(deterministicUnit(12, 3) < 1)
})

test('cosmic star field remounts identically', () => {
  const first = buildCosmicStarField()
  const second = buildCosmicStarField()

  assert.equal(first.length, 78)
  assert.deepEqual(first, second)
  assert.equal(first.filter((star) => star.warm).length, 9)
})

test('ember field is deterministic and remains inside chamber bounds', () => {
  const embers = buildEmberField()
  assert.equal(embers.length, 22)
  assert.deepEqual(embers, buildEmberField())

  for (const ember of embers) {
    assert.ok(ember.x >= -2.6 && ember.x <= 2.6)
    assert.ok(ember.y >= 0.15 && ember.y <= 2.95)
    assert.ok(ember.z >= -5 && ember.z <= -0.6)
  }
})
