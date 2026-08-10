import assert from 'node:assert/strict'
import test from 'node:test'
import { CHAMBER_PREVIEW_ARTIFACTS } from '../src/scene/chambers/previewArtifacts.ts'

test('every chamber has one distinct verified preview identity', () => {
  assert.deepEqual(CHAMBER_PREVIEW_ARTIFACTS, {
    sanctum: 'solar-forge',
    cell: 'permutation-axis',
    monad: 'monas-construction',
    chapel: 'chapter-tree',
  })

  assert.equal(new Set(Object.values(CHAMBER_PREVIEW_ARTIFACTS)).size, 4)
})
