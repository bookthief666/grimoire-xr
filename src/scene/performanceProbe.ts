import {
  QUEST_PERFORMANCE_BUDGET,
  classifyDrawCalls,
  summarizeFrameTimes,
  type FrameBudgetState,
} from './performance.ts'

export type DrawCallCounter = {
  supported: boolean
  readAndReset: () => number
  dispose: () => void
}

/**
 * Extensions that would let a device render both eyes in one draw. Advertised
 * support is necessary but NOT sufficient: Three must also choose to use it.
 * That is exactly why the report carries the empirical `drawCallsPerView`
 * alongside this flag — if multiview were truly active, per-view draws would
 * not scale with `viewCount`, and the two figures would disagree. Trust the
 * measurement over the capability string.
 */
const MULTIVIEW_EXTENSIONS = ['OCULUS_multiview', 'OVR_multiview2'] as const

export type GrimoirePerformanceReport = {
  version: 2
  chamberId: string
  mode: string
  capturedAt: string
  sampleWindowSeconds: number
  sampleCount: number
  averageFrameMs: number
  worstFrameMs: number
  frameBudgetState: FrameBudgetState
  averageDrawCalls: number
  worstDrawCalls: number
  drawCounterSupported: boolean

  /**
   * Stereo truth. Every performance figure this project recorded before v2 was
   * captured in a flat browser at one view, and none of them said so. A total
   * draw count is not comparable across view counts, so a report that omits
   * this is not interpretable as a 72 Hz predictor.
   */
  viewCount: number
  stereo: boolean
  presenting: boolean
  averageDrawCallsPerView: number
  worstDrawCallsPerView: number
  drawBudgetState: FrameBudgetState
  multiviewExtension: string | null
}

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext

/** First advertised multiview extension, or null. See MULTIVIEW_EXTENSIONS. */
export function detectMultiviewExtension(context: WebGLContext): string | null {
  try {
    const supported = context.getSupportedExtensions() ?? []
    return MULTIVIEW_EXTENSIONS.find((name) => supported.includes(name)) ?? null
  } catch {
    return null
  }
}

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
  viewCount = 1,
  presenting = false,
  multiviewExtension = null,
}: {
  chamberId: string
  mode: string
  frameTimes: readonly number[]
  drawCalls: readonly number[]
  drawCounterSupported: boolean
  viewCount?: number
  presenting?: boolean
  multiviewExtension?: string | null
}): GrimoirePerformanceReport {
  const frameSummary = summarizeFrameTimes(frameTimes)

  // Guard the divisor rather than trusting the caller: a session that ends
  // mid-window can report zero views, and a NaN in a QA figure is worse than
  // a conservative one.
  const views = Number.isFinite(viewCount) && viewCount >= 1 ? Math.floor(viewCount) : 1

  const averageDrawCalls = safeAverage(drawCalls)
  const worstDrawCalls = drawCalls.length ? Math.max(...drawCalls) : 0
  const averageDrawCallsPerView = averageDrawCalls / views

  return {
    version: 2,
    chamberId,
    mode,
    capturedAt: new Date().toISOString(),
    sampleWindowSeconds: QUEST_PERFORMANCE_BUDGET.sampleWindowSeconds,
    sampleCount: frameSummary.sampleCount,
    averageFrameMs: frameSummary.averageFrameMs,
    worstFrameMs: frameSummary.worstFrameMs,
    frameBudgetState: frameSummary.state,
    averageDrawCalls,
    worstDrawCalls,
    drawCounterSupported,
    viewCount: views,
    stereo: views > 1,
    presenting,
    averageDrawCallsPerView,
    worstDrawCallsPerView: worstDrawCalls / views,
    drawBudgetState: classifyDrawCalls(averageDrawCallsPerView),
    multiviewExtension,
  }
}

export function performanceProbeEnabled(
  search = typeof window === 'undefined' ? '' : window.location.search,
) {
  return new URLSearchParams(search).get('perf') === '1'
}

/**
 * The visual HUD is a separate opt-in from measurement so normal `?perf=1`
 * captures remain screenshot-clean. `?perf=1&hud=1` enables both.
 */
export function performanceHudEnabled(
  search = typeof window === 'undefined' ? '' : window.location.search,
) {
  const params = new URLSearchParams(search)
  return params.get('perf') === '1' && params.get('hud') === '1'
}
