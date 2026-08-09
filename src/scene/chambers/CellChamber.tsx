import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  BREATH_CYCLE_SECONDS,
  NAMES,
  VOWELS,
  breathAt,
  buildSequence,
  type Axis,
} from '../../tools/abulafia'
import { USER_EYE_VR } from '../zones'
import type { ChamberProps } from './types'
import { TempleText } from '../TempleText'

/**
 * THE CELL — abulafia.exe
 *
 * The source project's own specification forbids ornament: deep black, high
 * contrast, one restrained accent, and explicitly no "cluttered fantasy
 * ornament" or "faux parchment". This is therefore the most stripped room in the
 * temple, and that austerity is the point rather than a shortcut — after the
 * Sanctum's gold and violet, arriving here should feel like a door closing.
 *
 * The reason this tool belongs in VR: its five vowels map to spatial directions.
 * On a flat screen "Holam → upward" is a label. Here the axis physically
 * ignites at the edge of the room and you turn your head along it while the
 * permutation is held. The practice is performed in space.
 */

export const CELL_ACCENT = '#5ce0d0'

/** Far enough to land in the AMBIENT zone — these mark the room, not the desk. */
const AXIS_DISTANCE = 2.7

/** Where each axis marker sits, measured from the user's head. */
const AXIS_ANCHOR: Record<Axis, [number, number, number]> = {
  up: [0, USER_EYE_VR[1] + AXIS_DISTANCE, 0],
  forward: [0, USER_EYE_VR[1], -AXIS_DISTANCE],
  down: [0, 0.02, 0],
  left: [-AXIS_DISTANCE, USER_EYE_VR[1], 0],
  right: [AXIS_DISTANCE, USER_EYE_VR[1], 0],
}

/** Face each marker back toward the user so its plate is readable. */
const AXIS_ROTATION: Record<Axis, [number, number, number]> = {
  up: [Math.PI / 2, 0, 0],
  forward: [0, 0, 0],
  down: [-Math.PI / 2, 0, 0],
  left: [0, Math.PI / 2, 0],
  right: [0, -Math.PI / 2, 0],
}

function AxisMarker({
  axis,
  label,
  sound,
  active,
  morphRef,
}: {
  axis: Axis
  label: string
  sound: string
  active: boolean
  morphRef: ChamberProps['morphRef']
}) {
  const ringRef = useRef<THREE.MeshBasicMaterial>(null)
  const glowRef = useRef<THREE.MeshBasicMaterial>(null)
  const barRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const m = morphRef.current
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 1.6) * 0.5

    if (ringRef.current) {
      ringRef.current.opacity = (active ? 0.85 + pulse * 0.15 : 0.12) * m
    }
    if (glowRef.current) {
      glowRef.current.opacity = (active ? 0.18 + pulse * 0.1 : 0.015) * m
    }
    if (barRef.current) {
      barRef.current.opacity = (active ? 0.5 : 0.05) * m
    }
  })

  return (
    <group position={AXIS_ANCHOR[axis]} rotation={AXIS_ROTATION[axis]}>
      <mesh>
        <ringGeometry args={[0.2, 0.215, 44]} />
        <meshBasicMaterial
          ref={ringRef}
          color={CELL_ACCENT}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.002]}>
        <circleGeometry args={[0.46, 36]} />
        <meshBasicMaterial
          ref={glowRef}
          color={CELL_ACCENT}
          transparent
          opacity={0.015}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* A short bar pointing back down the axis toward the user. */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.012, 0.62]} />
        <meshBasicMaterial
          ref={barRef}
          color={CELL_ACCENT}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0, 0.005, 0.01]}
        fontSize={0.088}
        color={active ? '#ffffff' : '#39424a'}
        anchorX="center"
        anchorY="middle"
      >
        {sound}
      </TempleText>

      <TempleText
        position={[0, -0.28, 0.01]}
        fontSize={0.036}
        color={active ? CELL_ACCENT : '#2d353b'}
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </TempleText>
    </group>
  )
}

export function CellArchitecture({ morphRef, active }: ChamberProps) {
  const shellRef = useRef<THREE.Mesh>(null)
  const floorRef = useRef<THREE.MeshBasicMaterial>(null)
  const [step, setStep] = useState(0)

  // The active axis is derived from elapsed time so the architecture and the
  // instrument stay locked to the same breath without prop-drilling.
  useFrame(({ clock }) => {
    const m = morphRef.current

    if (shellRef.current) {
      const s = 0.6 + m * 0.4
      shellRef.current.scale.setScalar(s)
    }

    if (floorRef.current) {
      floorRef.current.opacity = 0.16 * m
    }

    if (!active) return
    const cycle = Math.floor(clock.getElapsedTime() / BREATH_CYCLE_SECONDS)
    setStep((prev) => (prev === cycle ? prev : cycle))
  })

  const activeVowel = VOWELS[step % VOWELS.length]

  const grid = useMemo(() => {
    const lines: Array<[number, number, number, number]> = []
    for (let i = -4; i <= 4; i += 1) {
      lines.push([i * 0.8, -3.2, i * 0.8, 3.2])
      lines.push([-3.2, i * 0.8, 3.2, i * 0.8])
    }
    return lines
  }, [])

  return (
    <group>
      {/* Sealed black shell. No stars, no depth cues - the Cell is a closed box. */}
      {/* Tall enough to contain the up-axis marker at y 4.3; a shorter shell
          would occlude it behind the ceiling face. */}
      <mesh ref={shellRef}>
        <boxGeometry args={[9, 9.6, 9]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>

      <ambientLight color="#0d1416" intensity={0.35} />
      <pointLight position={[0, 2.4, 0]} color={CELL_ACCENT} intensity={2.2} distance={6} />

      {/* Cold measured floor grid: an instrument's calibration surface. */}
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {grid.map(([x1, y1, x2, y2], i) => {
          const dx = x2 - x1
          const dy = y2 - y1
          const len = Math.hypot(dx, dy)
          return (
            <mesh
              key={i}
              position={[(x1 + x2) / 2, (y1 + y2) / 2, 0]}
              rotation={[0, 0, Math.atan2(dy, dx)]}
            >
              <planeGeometry args={[len, 0.004]} />
              <meshBasicMaterial
                ref={i === 0 ? floorRef : undefined}
                color={CELL_ACCENT}
                transparent
                opacity={0.16}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>

      {VOWELS.map((v) => (
        <AxisMarker
          key={v.axis}
          axis={v.axis}
          label={v.name}
          sound={v.sound}
          active={active && v.axis === activeVowel.axis}
          morphRef={morphRef}
        />
      ))}
    </group>
  )
}

export function CellInstrument({ morphRef, active }: ChamberProps) {
  const [nameIndex, setNameIndex] = useState(0)
  const [running, setRunning] = useState(true)
  const [manualStep, setManualStep] = useState(0)

  const startRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)
  const breathRef = useRef<THREE.Mesh>(null)
  const breathMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const [display, setDisplay] = useState({ step: 0, phase: 'inhale', progress: 0 })

  const name = NAMES[nameIndex]
  const sequence = useMemo(() => buildSequence(name.tokens), [name])

  useFrame(({ clock }) => {
    const m = morphRef.current

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.85 + m * 0.15)
      groupRef.current.position.y = 1.34 - (1 - m) * 0.18
    }

    if (!active) return

    if (startRef.current === 0) startRef.current = clock.getElapsedTime()
    const elapsed = clock.getElapsedTime() - startRef.current
    const breath = breathAt(elapsed)

    // Inhale swells the ring, exhale releases it. This is the metronome the
    // practice is paced by, so it drives the visuals rather than decorating them.
    const swell =
      breath.phase === 'inhale' ? breath.progress : 1 - breath.progress

    if (breathRef.current) {
      const s = 0.82 + swell * 0.34
      breathRef.current.scale.setScalar(s * m)
    }
    if (breathMatRef.current) {
      breathMatRef.current.opacity = (0.2 + swell * 0.45) * m
    }

    const stepIndex = running ? breath.cycle % sequence.length : manualStep

    if (
      display.step !== stepIndex ||
      display.phase !== breath.phase ||
      Math.abs(display.progress - breath.progress) > 0.05
    ) {
      setDisplay({ step: stepIndex, phase: breath.phase, progress: breath.progress })
    }
  })

  const current = sequence[display.step % sequence.length]

  const press = (fn: () => void) => ({
    onPointerDown: (event: { stopPropagation: () => void }) => {
      event.stopPropagation()
    },
    onPointerUp: (event: { stopPropagation: () => void }) => {
      event.stopPropagation()
      fn()
    },
  })

  return (
    <group ref={groupRef} position={[0, 1.34, -0.95]}>
      {/* Breath ring. Its diameter is the metronome. */}
      <mesh ref={breathRef}>
        <ringGeometry args={[0.42, 0.432, 64]} />
        <meshBasicMaterial
          ref={breathMatRef}
          color={CELL_ACCENT}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0, 0.1, 0]}
        fontSize={0.19}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
      >
        {current.hebrew}
      </TempleText>

      <TempleText
        position={[0, -0.08, 0]}
        fontSize={0.072}
        color={CELL_ACCENT}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        {current.latin}
      </TempleText>

      <TempleText
        position={[0, -0.17, 0]}
        fontSize={0.03}
        color="#8a949c"
        anchorX="center"
        anchorY="middle"
      >
        {`${current.vowel.name.toUpperCase()} · ${current.vowel.sound} · ${current.vowel.axis.toUpperCase()}`}
      </TempleText>

      <TempleText
        position={[0, -0.235, 0]}
        fontSize={0.024}
        color="#4d565e"
        anchorX="center"
        anchorY="middle"
      >
        {`${(display.step % sequence.length) + 1} / ${sequence.length}   ${display.phase.toUpperCase()}`}
      </TempleText>

      {/* Controls, kept to the minimum the practice needs. */}
      <group position={[0, -0.34, 0.02]}>
        <group position={[-0.2, 0, 0]} {...press(() => setRunning((r) => !r))}>
          <TempleText fontSize={0.032} color="#c8ced4" anchorX="center" anchorY="middle">
            {running ? 'HOLD' : 'RESUME'}
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.2, 0.09]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.001}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        <group
          position={[0.06, 0, 0]}
          {...press(() => setManualStep((s) => (s + 1) % sequence.length))}
        >
          <TempleText fontSize={0.032} color="#c8ced4" anchorX="center" anchorY="middle">
            STEP
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.18, 0.09]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.001}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        <group
          position={[0.29, 0, 0]}
          {...press(() => {
            setNameIndex((i) => (i + 1) % NAMES.length)
            setManualStep(0)
          })}
        >
          <TempleText fontSize={0.032} color={CELL_ACCENT} anchorX="center" anchorY="middle">
            {name.label}
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.22, 0.09]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.001}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
