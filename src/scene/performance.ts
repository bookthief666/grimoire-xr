export const QUEST_PERFORMANCE_BUDGET = Object.freeze({
  baselineHz: 72,
  stretchHz: 90,
  baselineFrameMs: 1000 / 72,
  stretchFrameMs: 1000 / 90,
  /** Sustained samples above this are considered a regression at the 72 Hz target. */
  warningFrameMs: 15,
  /** Avoid judging transitions/loading spikes from a single frame. */
  sampleWindowSeconds: 5,
})

export type FrameBudgetState = 'healthy' | 'warning' | 'over-budget'

export function classifyFrameTime(milliseconds: number): FrameBudgetState {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return 'over-budget'
  if (milliseconds <= QUEST_PERFORMANCE_BUDGET.baselineFrameMs) return 'healthy'
  if (milliseconds <= QUEST_PERFORMANCE_BUDGET.warningFrameMs) return 'warning'
  return 'over-budget'
}

export type PerformanceSample = {
  averageFrameMs: number
  worstFrameMs: number
  sampleCount: number
  state: FrameBudgetState
}

export function summarizeFrameTimes(samples: readonly number[]): PerformanceSample {
  const usable = samples.filter((value) => Number.isFinite(value) && value >= 0)

  if (usable.length === 0) {
    return {
      averageFrameMs: Number.POSITIVE_INFINITY,
      worstFrameMs: Number.POSITIVE_INFINITY,
      sampleCount: 0,
      state: 'over-budget',
    }
  }

  const averageFrameMs = usable.reduce((sum, value) => sum + value, 0) / usable.length
  const worstFrameMs = Math.max(...usable)

  return {
    averageFrameMs,
    worstFrameMs,
    sampleCount: usable.length,
    state: classifyFrameTime(averageFrameMs),
  }
}
