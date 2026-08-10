import test from 'node:test'
import assert from 'node:assert/strict'

import { TRADITION_OPTIONS } from '../src/constants/ritualOptions.ts'
import {
  CARD_IMAGE_POLICY,
  canRequestCardImage,
  cardImageActionLabel,
} from '../src/scene/workbench/imagePolicy.ts'

test('forge retains every supported magical tradition', () => {
  assert.deepEqual(
    TRADITION_OPTIONS.map((option) => option.value),
    [
      'thelemic',
      'hermetic',
      'goetic',
      'tarot',
      'kabbalistic',
      'tantric',
      'chaos_magick',
    ],
  )
})

test('card selection never implies image generation', () => {
  assert.equal(CARD_IMAGE_POLICY.selectionGeneratesImage, false)
  assert.equal(CARD_IMAGE_POLICY.explicitActionRequired, true)
})

test('explicit image action is available only for requestable cards', () => {
  const pending = {
    artPrompt: 'vertical ritual card',
    imageStatus: 'pending' as const,
    imageUrl: undefined,
  }
  const generating = { ...pending, imageStatus: 'generating' as const }
  const ready = {
    ...pending,
    imageStatus: 'ready' as const,
    imageUrl: '/api/image?id=1',
  }
  const failed = { ...pending, imageStatus: 'error' as const }

  assert.equal(canRequestCardImage(pending), true)
  assert.equal(canRequestCardImage(generating), false)
  assert.equal(canRequestCardImage(ready), false)
  assert.equal(canRequestCardImage(failed), true)
  assert.equal(cardImageActionLabel(failed), 'RETRY ART')
})
