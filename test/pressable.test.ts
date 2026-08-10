import test from 'node:test'
import assert from 'node:assert/strict'

import {
  capturePointerSafely,
  pressable,
  releasePointerSafely,
} from '../src/scene/pressable.ts'

test('pointer capture helpers tolerate adapter failures', () => {
  assert.equal(
    capturePointerSafely({ setPointerCapture: () => { throw new Error('stale pointer') } }, 7),
    false,
  )

  assert.equal(
    releasePointerSafely({ releasePointerCapture: () => { throw new Error('already released') } }, 7),
    false,
  )
})

test('release skips a pointer the target no longer owns', () => {
  let releaseCount = 0
  const released = releasePointerSafely(
    {
      hasPointerCapture: () => false,
      releasePointerCapture: () => { releaseCount += 1 },
    },
    3,
  )

  assert.equal(released, false)
  assert.equal(releaseCount, 0)
})

test('pressable releases before activation and on cancellation', () => {
  const sequence: string[] = []
  const handlers = pressable(() => sequence.push('activate'))
  const target = {
    setPointerCapture: () => sequence.push('capture'),
    hasPointerCapture: () => true,
    releasePointerCapture: () => sequence.push('release'),
  }
  const event = {
    pointerId: 4,
    target,
    stopPropagation: () => {},
  }

  handlers.onPointerDown(event as never)
  handlers.onPointerUp(event as never)
  handlers.onPointerCancel(event as never)

  assert.deepEqual(sequence, ['capture', 'release', 'activate', 'release'])
})

test('disabled pointer-up still performs capture cleanup without activating', () => {
  let releases = 0
  let activations = 0
  const handlers = pressable(() => { activations += 1 }, true)
  const event = {
    pointerId: 9,
    target: {
      hasPointerCapture: () => true,
      releasePointerCapture: () => { releases += 1 },
    },
    stopPropagation: () => {},
  }

  handlers.onPointerUp(event as never)

  assert.equal(releases, 1)
  assert.equal(activations, 0)
})
