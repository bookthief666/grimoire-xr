import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import {
  buildPerformanceReport,
  installWebGLDrawCounter,
  performanceHudEnabled,
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

function hudBorderColor(state: GrimoirePerformanceReport['frameBudgetState']) {
  if (state === 'healthy') return '#3dff9a'
  if (state === 'warning') return '#ffd23f'
  return '#ff5a5f'
}

function updateHud(element: HTMLDivElement, report: GrimoirePerformanceReport) {
  const averageFps = report.averageFrameMs > 0 ? 1000 / report.averageFrameMs : 0
  element.style.borderColor = hudBorderColor(report.frameBudgetState)
  element.textContent = [
    'GRIMOIRE XR QA',
    `${report.chamberId.toUpperCase()} · ${report.mode.toUpperCase()}`,
    `AVG ${report.averageFrameMs.toFixed(2)} ms · ${averageFps.toFixed(1)} fps`,
    `WORST ${report.worstFrameMs.toFixed(2)} ms`,
    `DRAWS ${report.averageDrawCalls.toFixed(1)} avg · ${report.worstDrawCalls} worst`,
    `72 HZ ${report.frameBudgetState.toUpperCase()}`,
    report.drawCounterSupported ? 'DRAW COUNTER OK' : 'DRAW COUNTER UNSUPPORTED',
  ].join('\n')
}

/**
 * Opt-in QA probe. Add `?perf=1` to measure. Add `&hud=1` to show the latest
 * stable report as a DOM overlay for Fold/phone screenshots.
 *
 * The HUD lives outside WebGL, so it does not add Three draw calls. Every stable
 * five-second chamber window also remains available through
 * `window.__GRIMOIRE_XR_PERF__` and `[GRIMOIRE PERF]` console output.
 */
export function PerformanceProbe({ chamberId, inTransition }: PerformanceProbeProps) {
  const enabled = useMemo(() => performanceProbeEnabled(), [])
  const hudEnabled = useMemo(() => performanceHudEnabled(), [])
  const gl = useThree((state) => state.gl)
  const xrMode = useXR((state) => state.mode)

  const counterRef = useRef<DrawCallCounter | null>(null)
  const frameTimesRef = useRef<number[]>([])
  const drawCallsRef = useRef<number[]>([])
  const elapsedRef = useRef(0)
  const chamberRef = useRef(chamberId)
  const warmedRef = useRef(false)
  const hudRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled) return undefined

    const counter = installWebGLDrawCounter(gl.getContext())
    counterRef.current = counter

    return () => {
      counter.dispose()
      counterRef.current = null
    }
  }, [enabled, gl])

  useEffect(() => {
    if (!enabled || !hudEnabled || typeof document === 'undefined') return undefined

    const hud = document.createElement('div')
    hud.dataset.grimoireQaHud = 'true'
    hud.textContent = 'GRIMOIRE XR QA\nCOLLECTING 5s STABLE WINDOW…'
    Object.assign(hud.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      zIndex: '2147483647',
      pointerEvents: 'none',
      whiteSpace: 'pre',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.35',
      color: '#eaf6ff',
      background: 'rgba(2, 4, 10, 0.88)',
      border: '1px solid #7d8f9e',
      borderRadius: '6px',
      padding: '9px 10px',
      boxShadow: '0 0 18px rgba(0, 229, 255, 0.12)',
      textAlign: 'left',
      maxWidth: 'min(310px, calc(100vw - 24px))',
    })

    document.body.appendChild(hud)
    hudRef.current = hud

    return () => {
      hud.remove()
      hudRef.current = null
    }
  }, [enabled, hudEnabled])

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
      if (hudRef.current) {
        hudRef.current.textContent = `GRIMOIRE XR QA\n${chamberId.toUpperCase()} · COLLECTING 5s STABLE WINDOW…`
        hudRef.current.style.borderColor = '#7d8f9e'
      }
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
    if (hudRef.current) updateHud(hudRef.current, report)

    frameTimesRef.current = []
    drawCallsRef.current = []
    elapsedRef.current = 0
  })

  return null
}
