import test from 'node:test'
import assert from 'node:assert/strict'

import {
  QUEST_PERFORMANCE_BUDGET,
  classifyFrameTime,
  summarizeFrameTimes,
} from '../src/scene/performance.ts'

test('Quest baseline budget targets 72 Hz or better', () => {
  assert.equal(QUEST_PERFORMANCE_BUDGET.baselineHz, 72)
  assert.ok(QUEST_PERFORMANCE_BUDGET.baselineFrameMs < 14)
  assert.equal(classifyFrameTime(10), 'healthy')
  assert.equal(classifyFrameTime(14.5), 'warning')
  assert.equal(classifyFrameTime(20), 'over-budget')
})

test('performance summaries use sustained average rather than one spike', () => {
  const result = summarizeFrameTimes([12, 12, 12, 18])
  assert.equal(result.sampleCount, 4)
  assert.equal(result.worstFrameMs, 18)
  assert.ok(result.averageFrameMs < QUEST_PERFORMANCE_BUDGET.baselineFrameMs)
  assert.equal(result.state, 'healthy')
})
