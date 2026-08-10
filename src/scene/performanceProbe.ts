import { QUEST_PERFORMANCE_BUDGET, summarizeFrameTimes } from './performance'

export type DrawCallCounter = {
  supported: boolean
  readAndReset: () => number
  dispose: () => void
}

export type GrimoirePerformanceReport = {
  version: 1
  chamberId: string
  mode: string
  capturedAt: string
  sampleWindowSeconds: number
  sampleCount: number
  averageFrameMs: number
  worstFrameMs: number
  frameBudgetState: 'healthy' | 'warning' | 'over-budget'
  averageDrawCalls: number
  worstDrawCalls: number
  drawCounterSupported: boolean
}

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext

function safeAverage(values: readonly number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Instrument the concrete WebGL context rather than relying on renderer.info.
 *
 * Grimoire XR currently uses Three r184. Counting the actual draw entry points
 * gives the qualification probe one metric that remains meaningful even when
 * renderer-level statistics change or omit a render pass. The wrapper exists
 * only when the explicit ?perf=1 QA mode is enabled.
 */
export function installWebGLDrawCounter(context: WebGLContext): DrawCallCounter {
  let calls = 0

  const originalDrawArrays = context.drawArrays.bind(context)
  const originalDrawElements = context.drawElements.bind(context)

  const webgl2 = 'drawArraysInstanced' in context
    ? (context as WebGL2RenderingContext)
    : null
  const originalDrawArraysInstanced = webgl2?.drawArraysInstanced.bind(webgl2)
  const originalDrawElementsInstanced = webgl2?.drawElementsInstanced.bind(webgl2)

  const restore = () => {
    context.drawArrays = originalDrawArrays
    context.drawElements = originalDrawElements

    if (webgl2 && originalDrawArraysInstanced && originalDrawElementsInstanced) {
      webgl2.drawArraysInstanced = originalDrawArraysInstanced
      webgl2.drawElementsInstanced = originalDrawElementsInstanced
    }
  }

  try {
    context.drawArrays = (mode, first, count) => {
      calls += 1
      originalDrawArrays(mode, first, count)
    }

    context.drawElements = (mode, count, type, offset) => {
      calls += 1
      originalDrawElements(mode, count, type, offset)
    }

    if (webgl2 && originalDrawArraysInstanced && originalDrawElementsInstanced) {
      webgl2.drawArraysInstanced = (mode, first, count, instanceCount) => {
        calls += 1
        originalDrawArraysInstanced(mode, first, count, instanceCount)
      }

      webgl2.drawElementsInstanced = (mode, count, type, offset, instanceCount) => {
        calls += 1
        originalDrawElementsInstanced(mode, count, type, offset, instanceCount)
      }
    }
  } catch {
    restore()
    return {
      supported: false,
      readAndReset: () => 0,
      dispose: () => {},
    }
  }

  return {
    supported: true,
    readAndReset: () => {
      const value = calls
      calls = 0
      return value
    },
    dispose: restore,
  }
}

export function buildPerformanceReport({
  chamberId,
  mode,
  frameTimes,
  drawCalls,
  drawCounterSupported,
}: {
  chamberId: string
  mode: string
  frameTimes: readonly number[]
  drawCalls: readonly number[]
  drawCounterSupported: boolean
}): GrimoirePerformanceReport {
  const frameSummary = summarizeFrameTimes(frameTimes)

  return {
    version: 1,
    chamberId,
    mode,
    capturedAt: new Date().toISOString(),
    sampleWindowSeconds: QUEST_PERFORMANCE_BUDGET.sampleWindowSeconds,
    sampleCount: frameSummary.sampleCount,
    averageFrameMs: frameSummary.averageFrameMs,
    worstFrameMs: frameSummary.worstFrameMs,
    frameBudgetState: frameSummary.state,
    averageDrawCalls: safeAverage(drawCalls),
    worstDrawCalls: drawCalls.length ? Math.max(...drawCalls) : 0,
    drawCounterSupported,
  }
}

export function performanceProbeEnabled(search = typeof window === 'undefined' ? '' : window.location.search) {
  return new URLSearchParams(search).get('perf') === '1'
}
