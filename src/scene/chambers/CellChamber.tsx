import { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  GATES_PER_LETTER,
  NAMES,
  VOWELS,
  breathAt,
  createPracticeSession,
  getPracticePosition,
  renderPermutation,
  renderPermutationHebrew,
  type Axis,
} from '../../tools/abulafia'
import { GATE_TABLE, STUDY_SECTIONS } from '../../tools/abulafiaStudy'
import { PROVENANCE_LABELS } from '../../tools/provenance'
import { USER_EYE_VR } from '../zones'
import type { ChamberProps } from './types'
import { TempleText } from '../TempleText'
import { ScriptureArc } from '../ScriptureArc'
import { pressable } from '../pressable'
import { cellControlPose } from './cellReaderLayout'
import { cellPractice } from './cellPracticeState'

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

/**
 * A press target with no plate behind it: the visible mark is the label, the
 * hit area an invisible quad sized for a controller ray.
 */
function CellKey({
  label,
  color = '#c8ced4',
  size = 0.03,
  width = 0.3,
  onPress,
}: {
  label: string
  color?: string
  size?: number
  width?: number
  onPress: () => void
}) {
  return (
    <group {...pressable(onPress)}>
      <TempleText fontSize={size} color={color} anchorX="center" anchorY="middle">
        {label}
      </TempleText>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, 0.1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function CellArchitecture({ morphRef, active }: ChamberProps) {
  const floorRef = useRef<THREE.MeshBasicMaterial>(null)
  const [gateAxis, setGateAxis] = useState<Axis>(VOWELS[0].axis)

  // The lit axis comes from the instrument's practice position, not from this
  // component's own clock. Deriving it independently held while both sides ran
  // free but broke under the transport: pausing froze the readout while the
  // wall kept advancing, so the Name asked for one direction and another stayed
  // lit. Turning to face the axis you are sounding is the whole premise here.
  useFrame(() => {
    const m = morphRef.current

    if (floorRef.current) {
      floorRef.current.opacity = 0.16 * m
    }

    if (!active) return

    const next = cellPractice.position?.gate.axis
    if (next && next !== gateAxis) setGateAxis(next)
  })

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
      {/* No chamber shell. The rotunda (floor, colonnade, dome) is now the
          room, shared by every chamber. A local shell here would sit inside the
          colonnade at radius 6.4 and occlude it entirely. */}

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
          active={active && v.axis === gateAxis}
          morphRef={morphRef}
        />
      ))}
    </group>
  )
}

export function CellInstrument({ morphRef, active }: ChamberProps) {
  const [nameIndex, setNameIndex] = useState(0)
  const [running, setRunning] = useState(true)
  const [showStudy, setShowStudy] = useState(false)
  const [studyPage, setStudyPage] = useState(0)

  const groupRef = useRef<THREE.Group>(null)
  const breathRef = useRef<THREE.Mesh>(null)
  const breathMatRef = useRef<THREE.MeshBasicMaterial>(null)

  // Breath count is held in refs, not state: it advances every frame and must
  // not re-render. `held` accumulates the breaths skipped while paused so
  // resuming continues where the practice stopped rather than jumping to
  // wherever the wall clock has reached.
  const breathRef2 = useRef(0)
  const heldRef = useRef(0)
  const manualRef = useRef(0)

  const [display, setDisplay] = useState({
    breath: 0,
    phase: 'inhale' as 'inhale' | 'exhale',
  })

  const name = NAMES[nameIndex]
  const session = useMemo(() => createPracticeSession(name.tokens), [name])

  useFrame(({ clock }) => {
    const m = morphRef.current

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.85 + m * 0.15)
      groupRef.current.position.y = 1.34 - (1 - m) * 0.18
    }

    if (!active) return

    const elapsed = clock.getElapsedTime()
    const breath = breathAt(elapsed)

    // Inhale swells the ring, exhale releases it. This is the metronome the
    // practice is paced by, so it drives the visuals rather than decorating them.
    const swell = breath.phase === 'inhale' ? breath.progress : 1 - breath.progress

    if (breathRef.current) {
      breathRef.current.scale.setScalar((0.82 + swell * 0.34) * m)
    }
    if (breathMatRef.current) {
      breathMatRef.current.opacity = (0.2 + swell * 0.45) * m
    }

    if (running) {
      breathRef2.current = breath.cycle - heldRef.current + manualRef.current
    } else {
      // Freeze the count and bank the breaths passing while held.
      heldRef.current = breath.cycle - breathRef2.current + manualRef.current
    }

    const position = getPracticePosition(session, breathRef2.current)

    // The architecture reads this to light the matching axis. Written every
    // frame so the wall can never disagree with the readout, including while
    // held or stepped by hand.
    cellPractice.position = position

    if (
      display.breath !== breathRef2.current ||
      display.phase !== breath.phase
    ) {
      setDisplay({ breath: breathRef2.current, phase: breath.phase })
    }
  })

  const position = getPracticePosition(session, display.breath)
  const letter = position.currentLetter ?? position.currentPermutation[0]
  const gate = position.gate

  type CellAction = 'hold' | 'step' | 'name' | 'study' | 'page'

  const runAction = useCallback(
    (action: CellAction) => {
      if (action === 'hold') setRunning((r) => !r)
      if (action === 'step') manualRef.current += 1
      if (action === 'name') {
        setNameIndex((i) => (i + 1) % NAMES.length)
        heldRef.current = 0
        manualRef.current = 0
        breathRef2.current = 0
        cellPractice.position = null
        setStudyPage(0)
      }
      if (action === 'study') {
        setShowStudy((open) => !open)
        setStudyPage(0)
      }
      if (action === 'page') setStudyPage((p) => (p + 1) % STUDY_SECTIONS.length)
    },
    [],
  )

  // Data, not closures. The controls table is mapped during render, and the
  // lint rule correctly refuses to let a ref-touching function ride along in it.
  const controls: Array<{
    label: string
    action: CellAction
    color?: string
    width?: number
  }> = [
    { label: running ? 'HOLD' : 'RESUME', action: 'hold', color: '#c8ced4' },
    { label: 'STEP ▸', action: 'step', color: '#c8ced4' },
    { label: name.label, action: 'name', color: CELL_ACCENT },
    {
      label: showStudy ? '▪ STUDY' : '◇ STUDY',
      action: 'study',
      color: showStudy ? CELL_ACCENT : '#8a949c',
      width: 0.36,
    },
  ]

  if (showStudy) {
    controls.push({
      label: `${studyPage + 1}/${STUDY_SECTIONS.length} ▸`,
      action: 'page',
      color: '#8a949c',
      width: 0.28,
    })
  }

  const section = STUDY_SECTIONS[studyPage]

  return (
    <group>
      {/* The letter being worked, held at the centre. The old panel showed the
          whole permutation at once; the practice works one letter at a time and
          the room should say which. */}
      <group ref={groupRef} position={[0, 1.34, -0.95]}>
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
          position={[0, 0.06, 0]}
          fontSize={0.26}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {letter?.hebrew ?? ''}
        </TempleText>

        <TempleText
          position={[0, -0.14, 0]}
          fontSize={0.062}
          color={CELL_ACCENT}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.3}
        >
          {letter?.latin ?? ''}
        </TempleText>
      </group>

      {/* The gate: what to sound, and where to turn. */}
      <ScriptureArc
        radius={2.0}
        y={1.86}
        fontSize={0.036}
        color={CELL_ACCENT}
        opacity={0.85}
        maxWidth={2.6}
        shelf={false}
      >
        {position.isComplete
          ? 'THE SESSION IS COMPLETE'
          : `${gate.name.toUpperCase()} · ${gate.sound.toUpperCase()} · ${gate.axis.toUpperCase()}`}
      </ScriptureArc>

      <ScriptureArc
        radius={2.0}
        y={1.7}
        fontSize={0.028}
        color="#7c868e"
        maxWidth={2.8}
        shelf={false}
      >
        {`${display.phase.toUpperCase()} · GATE ${position.gateIndex + 1}/${GATES_PER_LETTER} · LETTER ${position.letterIndex + 1}/${session.lettersPerPermutation} · PERMUTATION ${position.permutationIndex + 1}/${session.totalPermutations}`}
      </ScriptureArc>

      {/* The arrangement this letter belongs to, so the permutation stays
          visible while a single letter holds the centre. */}
      <ScriptureArc
        radius={2.3}
        y={0.86}
        fontSize={0.05}
        color="#c8ced4"
        opacity={0.9}
        maxWidth={2.6}
        shelfColor={CELL_ACCENT}
        shelfOpacity={0.16}
      >
        {renderPermutationHebrew(position.currentPermutation)}
      </ScriptureArc>

      <ScriptureArc
        radius={2.3}
        y={0.7}
        fontSize={0.03}
        color="#5f6970"
        maxWidth={2.6}
        shelf={false}
      >
        {`${renderPermutation(position.currentPermutation)}  ·  BREATH ${Math.min(display.breath + 1, session.totalBreaths)} / ${session.totalBreaths}`}
      </ScriptureArc>

      {showStudy ? (
        <>
          <ScriptureArc
            radius={2.75}
            y={0.44}
            fontSize={0.03}
            color={CELL_ACCENT}
            opacity={0.8}
            maxWidth={3.4}
            shelf={false}
          >
            {`${section.kicker.toUpperCase()} · ${section.title} · ${PROVENANCE_LABELS[section.layer]}`}
          </ScriptureArc>

          <ScriptureArc
            radius={2.75}
            y={0.26}
            fontSize={0.036}
            color="#aab4bc"
            opacity={0.92}
            maxWidth={3.6}
            shelfColor={CELL_ACCENT}
            shelfOpacity={0.12}
          >
            {section.id === 'gates'
              ? `${section.body[0]}  —  ${GATE_TABLE.map((g) => `${g.vowel} ${g.sound} ${g.direction}`).join('  ·  ')}`
              : section.body.join('  ')}
          </ScriptureArc>
        </>
      ) : null}

      {controls.map((control, i) => {
        const pose = cellControlPose(i, controls.length)
        return (
          <group key={control.label} position={pose.position} rotation={[0, pose.rotationY, 0]}>
            <CellKey
              label={control.label}
              color={control.color}
              width={control.width}
              onPress={() => runAction(control.action)}
            />
          </group>
        )
      })}
    </group>
  )
}
