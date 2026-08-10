import test from 'node:test'
import assert from 'node:assert/strict'

import { legacySanctumEnabled } from '../src/scene/sanctumProfile.ts'

test('legacy Sanctum architecture is opt-in only', () => {
  assert.equal(legacySanctumEnabled(''), false)
  assert.equal(legacySanctumEnabled('?legacySanctum=0'), false)
  assert.equal(legacySanctumEnabled('?perf=1&hud=1'), false)
  assert.equal(legacySanctumEnabled('?legacySanctum=1'), true)
  assert.equal(legacySanctumEnabled('?perf=1&legacySanctum=1'), true)
})
