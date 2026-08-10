import test from 'node:test'
import assert from 'node:assert/strict'

import {
  QUEST_DRAW_BUDGET,
  QUEST_PERFORMANCE_BUDGET,
  classifyDrawCalls,
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

test('a report with no session recorded is explicitly mono, not assumed', () => {
  const report = buildPerformanceReport({
    chamberId: 'sanctum',
    mode: 'flat',
    frameTimes: [10, 10],
    drawCalls: [400, 400],
    drawCounterSupported: true,
  })

  assert.equal(report.version, 2)
  assert.equal(report.viewCount, 1)
  assert.equal(report.stereo, false)
  assert.equal(report.presenting, false)
  assert.equal(report.averageDrawCallsPerView, 400)
})

test('stereo capture divides draw evidence by real view count', () => {
  // The case the v2 report exists for: the same content submitted once per eye
  // reads as double the draws, and a total that omits viewCount is not
  // comparable to any flat-browser figure.
  const report = buildPerformanceReport({
    chamberId: 'sanctum',
    mode: 'immersive-vr',
    frameTimes: [12, 12],
    drawCalls: [854, 854],
    drawCounterSupported: true,
    viewCount: 2,
    presenting: true,
    multiviewExtension: null,
  })

  assert.equal(report.stereo, true)
  assert.equal(report.presenting, true)
  assert.equal(report.viewCount, 2)
  assert.equal(report.averageDrawCalls, 854)
  assert.equal(report.averageDrawCallsPerView, 427)
  assert.equal(report.worstDrawCallsPerView, 427)
  assert.equal(report.multiviewExtension, null)
})

test('a degenerate view count can never produce a NaN QA figure', () => {
  for (const viewCount of [0, -1, Number.NaN]) {
    const report = buildPerformanceReport({
      chamberId: 'cell',
      mode: 'immersive-vr',
      frameTimes: [11],
      drawCalls: [300],
      drawCounterSupported: true,
      viewCount,
    })

    assert.equal(report.viewCount, 1)
    assert.ok(Number.isFinite(report.averageDrawCallsPerView))
    assert.equal(report.averageDrawCallsPerView, 300)
  }
})

test('draw budget is judged per view, so stereo cannot hide cost', () => {
  assert.equal(classifyDrawCalls(QUEST_DRAW_BUDGET.perViewTarget), 'healthy')
  assert.equal(classifyDrawCalls(QUEST_DRAW_BUDGET.perViewWarning), 'warning')
  assert.equal(classifyDrawCalls(QUEST_DRAW_BUDGET.perViewWarning + 1), 'over-budget')

  // 854 total draws is over budget whether it came from one view or two; the
  // per-view split changes the diagnosis, never the total submitted work.
  const mono = buildPerformanceReport({
    chamberId: 'sanctum',
    mode: 'flat',
    frameTimes: [10],
    drawCalls: [854],
    drawCounterSupported: true,
  })
  const stereo = buildPerformanceReport({
    chamberId: 'sanctum',
    mode: 'immersive-vr',
    frameTimes: [10],
    drawCalls: [854],
    drawCounterSupported: true,
    viewCount: 2,
    presenting: true,
  })

  assert.equal(mono.drawBudgetState, 'over-budget')
  assert.equal(stereo.drawBudgetState, 'over-budget')
  assert.equal(stereo.averageDrawCallsPerView, mono.averageDrawCallsPerView / 2)
})
