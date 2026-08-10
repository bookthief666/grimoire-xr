import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import {
  buildPerformanceReport,
  installWebGLDrawCounter,
  performanceProbeEnabled,
  type DrawCallCounter,
  type GrimoirePerformanceReport,
} from './performanceProbe'
import { QUEST_PERFORMANCE_BUDGET } from './performance'

declare global {
  interface Window {
    __GRIMOIRE_XR_PERF__?: GrimoirePerformanceReport
  }
}

type PerformanceProbeProps = {
  chamberId: string
  inTransition: boolean
}

/**
 * Opt-in QA probe. Add ?perf=1 to the URL to enable it.
 *
 * It has no visual surface and is not active during normal use. Every stable
 * five-second chamber window publishes a machine-readable report to
 * window.__GRIMOIRE_XR_PERF__ and logs the same payload. This gives desktop
 * automation and a real Quest browser one shared measurement contract without
 * taking a Playwright dependency or shipping a permanent debug HUD.
 */
export function PerformanceProbe({ chamberId, inTransition }: PerformanceProbeProps) {
  const enabled = useMemo(() => performanceProbeEnabled(), [])
  const gl = useThree((state) => state.gl)
  const xrMode = useXR((state) => state.mode)

  const counterRef = useRef<DrawCallCounter | null>(null)
  const frameTimesRef = useRef<number[]>([])
  const drawCallsRef = useRef<number[]>([])
  const elapsedRef = useRef(0)
  const chamberRef = useRef(chamberId)
  const warmedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return undefined

    const counter = installWebGLDrawCounter(gl.getContext())
    counterRef.current = counter

    return () => {
      counter.dispose()
      counterRef.current = null
    }
  }, [enabled, gl])

  useFrame((_, delta) => {
    if (!enabled) return

    const counter = counterRef.current
    const previousFrameDrawCalls = counter?.readAndReset() ?? 0

    if (chamberRef.current !== chamberId || inTransition) {
      chamberRef.current = chamberId
      frameTimesRef.current = []
      drawCallsRef.current = []
      elapsedRef.current = 0
      warmedRef.current = false
      return
    }

    // The draw counter observed here belongs to the frame that completed before
    // this useFrame callback. Ignore the first read after install/reset so a
    // partial frame can never contaminate a stable window.
    if (!warmedRef.current) {
      warmedRef.current = true
      return
    }

    frameTimesRef.current.push(delta * 1000)
    drawCallsRef.current.push(previousFrameDrawCalls)
    elapsedRef.current += delta

    if (elapsedRef.current < QUEST_PERFORMANCE_BUDGET.sampleWindowSeconds) return

    const report = buildPerformanceReport({
      chamberId,
      mode: xrMode ?? 'flat',
      frameTimes: frameTimesRef.current,
      drawCalls: drawCallsRef.current,
      drawCounterSupported: counter?.supported ?? false,
    })

    window.__GRIMOIRE_XR_PERF__ = report
    console.info('[GRIMOIRE PERF]', report)

    frameTimesRef.current = []
    drawCallsRef.current = []
    elapsedRef.current = 0
  })

  return null
}
