import test from 'node:test'
import assert from 'node:assert/strict'

import {
  QUEST_PERFORMANCE_BUDGET,
  classifyFrameTime,
  summarizeFrameTimes,
} from '../src/scene/performance.ts'
import {
  buildPerformanceReport,
  performanceHudEnabled,
  performanceProbeEnabled,
} from '../src/scene/performanceProbe.ts'

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

test('performance probe is explicit and cannot switch on accidentally', () => {
  assert.equal(performanceProbeEnabled(''), false)
  assert.equal(performanceProbeEnabled('?perf=0'), false)
  assert.equal(performanceProbeEnabled('?perf=1'), true)
  assert.equal(performanceProbeEnabled('?debugPanels&perf=1'), true)
})

test('performance HUD requires both measurement and visual opt-in', () => {
  assert.equal(performanceHudEnabled(''), false)
  assert.equal(performanceHudEnabled('?hud=1'), false)
  assert.equal(performanceHudEnabled('?perf=1'), false)
  assert.equal(performanceHudEnabled('?perf=1&hud=1'), true)
})

test('performance report preserves chamber, frame, and draw-call evidence', () => {
  const report = buildPerformanceReport({
    chamberId: 'monad',
    mode: 'immersive-vr',
    frameTimes: [12, 13, 14],
    drawCalls: [710, 720, 730],
    drawCounterSupported: true,
  })

  assert.equal(report.chamberId, 'monad')
  assert.equal(report.mode, 'immersive-vr')
  assert.equal(report.sampleCount, 3)
  assert.equal(report.averageFrameMs, 13)
  assert.equal(report.worstFrameMs, 14)
  assert.equal(report.averageDrawCalls, 720)
  assert.equal(report.worstDrawCalls, 730)
  assert.equal(report.drawCounterSupported, true)
  assert.equal(report.frameBudgetState, 'healthy')
})
