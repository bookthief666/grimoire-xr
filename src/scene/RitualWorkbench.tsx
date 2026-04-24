import { useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  TECH_LEVEL_OPTIONS,
  TONE_OPTIONS,
  TRADITION_OPTIONS,
} from '../constants/ritualOptions'
import type {
  ForgePhase,
  GrimoireCard,
  TechLevel,
  Tone,
  Tradition,
} from '../types/grimoire'

type Vec2 = [number, number]

type WorkbenchMode = 'closed' | 'forge' | 'spread'

type DragState = {
  cardId: number
  startPoint: THREE.Vector3
  startOffset: Vec2
}

type RitualWorkbenchProps = {
  cards: GrimoireCard[]
  selectedCardId: number | null
  subject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  intent: string
  forgePhase: ForgePhase
  loading: boolean
  hasDeck: boolean
  oracleQuestion: string
  oracleLoading: boolean
  hasOracleReading: boolean
  onSubjectChange: (subject: string) => void
  onTraditionChange: (tradition: Tradition) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onIntentChange: (intent: string) => void
  onOracleQuestionChange: (question: string) => void
  onBeginRitual: () => Promise<void>
  onConsultOracle: () => Promise<void>
  onClearOracle: () => void
  onClearRitual: () => void
  onCardSelect: (
    card: GrimoireCard,
    position: [number, number, number],
    rotY: number,
  ) => void
}

const SUBJECT_OPTIONS = [
  'Faust',
  'True Will',
  'The Shadow',
  'Creative Power',
  'Love Under Will',
  'Holy Guardian Angel',
  'Fear / Ordeal',
  'Money / Survival',
]

const INTENT_OPTIONS = [
  'What is the hidden cost?',
  'What must I do next?',
  'What force is blocking manifestation?',
  'What should be disciplined?',
  'What is the ordeal teaching?',
  'What is the initiatory opportunity?',
]

const VISUAL_STYLE_OPTIONS = [
  'Hierophantic',
  'Astral',
  'Venusian',
  'Goetic',
  'Alchemical',
  'Xenotheurgic',
]

const EROS_FIELD_OPTIONS = [
  'Veiled',
  'Charged',
  'Ecstatic',
]

const TABLE_Y = 0.08
const WORKBENCH_SCALE = 0.48

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function shortText(value: string, max = 32) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

function cycleString(values: string[], current: string, direction: -1 | 1) {
  const index = Math.max(0, values.findIndex((value) => value === current))
  const next = (index + direction + values.length) % values.length
  return values[next]
}

function cycleOption<T extends string>(
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>,
  current: T,
  direction: -1 | 1,
) {
  const index = Math.max(0, options.findIndex((option) => option.value === current))
  const next = (index + direction + options.length) % options.length
  return options[next].value
}

function optionLabel<T extends string>(
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value
}

function TableBar({
  a,
  b,
  color = '#ff9a00',
  opacity = 0.72,
  width = 0.018,
}: {
  a: Vec2
  b: Vec2
  color?: string
  opacity?: number
  width?: number
}) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, TABLE_Y + 0.012, (a[1] + b[1]) / 2]}
      rotation={[-Math.PI / 2, 0, angle]}
    >
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function TableHexagram({
  active,
}: {
  active: boolean
}) {
  const ringRef = useRef<THREE.MeshBasicMaterial>(null)

  const points = useMemo<Vec2[]>(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI) / 3
      return [Math.cos(angle) * 0.62, Math.sin(angle) * 0.62]
    })
  }, [])

  useFrame(({ clock }) => {
    if (!ringRef.current) return
    const pulse = 0.32 + Math.sin(clock.getElapsedTime() * 1.2) * 0.14
    ringRef.current.opacity = active ? 0.52 + pulse : 0.28 + pulse * 0.45
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.71, 72]} />
        <meshBasicMaterial
          ref={ringRef}
          color={active ? '#ffcf7c' : '#9a5a18'}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TableBar a={points[0]} b={points[2]} color="#ffb000" />
      <TableBar a={points[2]} b={points[4]} color="#ffb000" />
      <TableBar a={points[4]} b={points[0]} color="#ffb000" />
      <TableBar a={points[1]} b={points[3]} color="#ff5a1f" opacity={0.64} />
      <TableBar a={points[3]} b={points[5]} color="#ff5a1f" opacity={0.64} />
      <TableBar a={points[5]} b={points[1]} color="#ff5a1f" opacity={0.64} />
    </group>
  )
}

function FloatingMenuButton({
  label,
  x,
  y,
  width = 0.22,
  disabled = false,
  onClick,
}: {
  label: string
  x: number
  y: number
  width?: number
  disabled?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const trigger = () => {
    if (!disabled) onClick()
  }

  return (
    <group
      position={[x, y, 0.075]}
      scale={hovered && !disabled ? 1.04 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          setPointerCapture?: (pointerId: number) => void
        }

        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)
        trigger()
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <mesh>
        <planeGeometry args={[width, 0.16]} />
        <meshBasicMaterial
          color={disabled ? '#100807' : '#241008'}
          transparent
          opacity={disabled ? 0.42 : 0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width + 0.16, 0.28]} />
        <meshBasicMaterial
          color="#ffb000"
          transparent
          opacity={hovered && !disabled ? 0.36 : 0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.002, 0.03]}
        fontSize={0.04}
        color={disabled ? '#6d5135' : hovered ? '#ffffff' : '#ffd18a'}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.03}
      >
        {label}
      </Text>

      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[width + 0.26, 0.38]} />
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


function FloatingDial({
  label,
  value,
  y,
  onPrevious,
  onNext,
}: {
  label: string
  value: string
  y: number
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <group position={[0, y, 0.04]}>
      <Text
        position={[-0.72, 0, 0.055]}
        fontSize={0.034}
        color="#9f744b"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.38}
      >
        {label}
      </Text>

      <FloatingMenuButton label="‹" x={-0.28} y={0} width={0.16} onClick={onPrevious} />

      <mesh position={[0.18, 0, 0.045]}>
        <planeGeometry args={[0.72, 0.15]} />
        <meshBasicMaterial
          color="#090505"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0.18, 0.002, 0.075]}
        fontSize={0.034}
        color="#f2d4a2"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.66}
      >
        {shortText(value, 30)}
      </Text>

      <FloatingMenuButton label="›" x={0.65} y={0} width={0.16} onClick={onNext} />
    </group>
  )
}

function FloatingForgeMenu({
  activeSubject,
  tradition,
  tone,
  techLevel,
  activeIntent,
  visualStyle,
  erosField,
  onSubjectChange,
  onTraditionChange,
  onToneChange,
  onTechLevelChange,
  onIntentChange,
  onVisualStyleChange,
  onErosFieldChange,
  onOracleQuestionChange,
  loading,
  canForge,
  onBeginRitual,
}: {
  activeSubject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  activeIntent: string
  visualStyle: string
  erosField: string
  loading: boolean
  canForge: boolean
  onBeginRitual: () => void
  onSubjectChange: (subject: string) => void
  onTraditionChange: (tradition: Tradition) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onIntentChange: (intent: string) => void
  onVisualStyleChange: (style: string) => void
  onErosFieldChange: (field: string) => void
  onOracleQuestionChange: (question: string) => void
}) {
  return (
    <group position={[0, 1.1, 0.05]} scale={1.18}>
      <mesh>
        <planeGeometry args={[1.92, 1.76]} />
        <meshStandardMaterial
          color="#0a0505"
          emissive="#241006"
          emissiveIntensity={0.42}
          transparent
          opacity={0.9}
          roughness={0.28}
          metalness={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.06, 1.92]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.095}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {([[-1, 1], [1, 1], [-1, -1], [1, -1]] as [number, number][]).map(([sx, sy], ci) => {
        const cx = sx * 0.92
        const cy = sy * 0.835
        const armLen = 0.11
        const armW = 0.014

        return (
          <group key={ci} position={[cx, cy, 0.02]}>
            <mesh position={[sx * armLen * 0.5, 0, 0]}>
              <planeGeometry args={[armLen, armW]} />
              <meshBasicMaterial
                color="#ff9a00"
                transparent
                opacity={0.68}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, sy * armLen * 0.5, 0]}>
              <planeGeometry args={[armW, armLen]} />
              <meshBasicMaterial
                color="#ff9a00"
                transparent
                opacity={0.68}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0, 0.003]}>
              <circleGeometry args={[0.018, 10]} />
              <meshBasicMaterial
                color="#ffcf7c"
                transparent
                opacity={0.55}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}

      <Text
        position={[0, 0.67, 0.07]}
        fontSize={0.05}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        GRIMOIRE ENGINE FORGE
      </Text>

      <mesh position={[0, 0.615, 0.065]}>
        <planeGeometry args={[1.62, 0.012]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.57, 0.07]}
        fontSize={0.026}
        color="#8f6742"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.48}
      >
        Tune the deck-current. Ignite only when the engine is aligned.
      </Text>

      <FloatingDial
        label="SUBJECT"
        value={activeSubject}
        y={0.39}
        onPrevious={() =>
          onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, -1))
        }
        onNext={() =>
          onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, 1))
        }
      />

      <FloatingDial
        label="TRADITION"
        value={optionLabel(TRADITION_OPTIONS, tradition)}
        y={0.23}
        onPrevious={() =>
          onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, -1))
        }
        onNext={() =>
          onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, 1))
        }
      />

      <FloatingDial
        label="TONE"
        value={optionLabel(TONE_OPTIONS, tone)}
        y={0.07}
        onPrevious={() => onToneChange(cycleOption(TONE_OPTIONS, tone, -1))}
        onNext={() => onToneChange(cycleOption(TONE_OPTIONS, tone, 1))}
      />

      <FloatingDial
        label="LEVEL"
        value={optionLabel(TECH_LEVEL_OPTIONS, techLevel)}
        y={-0.09}
        onPrevious={() =>
          onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, -1))
        }
        onNext={() =>
          onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, 1))
        }
      />

      <FloatingDial
        label="ART STYLE"
        value={visualStyle}
        y={-0.25}
        onPrevious={() =>
          onVisualStyleChange(cycleString(VISUAL_STYLE_OPTIONS, visualStyle, -1))
        }
        onNext={() =>
          onVisualStyleChange(cycleString(VISUAL_STYLE_OPTIONS, visualStyle, 1))
        }
      />

      <FloatingDial
        label="EROS FIELD"
        value={erosField}
        y={-0.41}
        onPrevious={() =>
          onErosFieldChange(cycleString(EROS_FIELD_OPTIONS, erosField, -1))
        }
        onNext={() =>
          onErosFieldChange(cycleString(EROS_FIELD_OPTIONS, erosField, 1))
        }
      />

      <FloatingDial
        label="INTENT"
        value={activeIntent}
        y={-0.57}
        onPrevious={() => {
          const next = cycleString(INTENT_OPTIONS, activeIntent, -1)
          onIntentChange(next)
          onOracleQuestionChange(next)
        }}
        onNext={() => {
          const next = cycleString(INTENT_OPTIONS, activeIntent, 1)
          onIntentChange(next)
          onOracleQuestionChange(next)
        }}
      />

      <FloatingMenuButton
        label={loading ? 'FORGING…' : 'IGNITE FORGE'}
        x={0.18}
        y={-0.74}
        width={0.98}
        disabled={!canForge}
        onClick={onBeginRitual}
      />
    </group>
  )
}


function SpreadSlot({
  x,
  z,
  label,
  active,
}: {
  x: number
  z: number
  label: string
  active: boolean
}) {
  return (
    <group>
      <mesh position={[x, TABLE_Y + 0.016, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.66]} />
        <meshBasicMaterial
          color={active ? '#2a1208' : '#0b0605'}
          transparent
          opacity={active ? 0.38 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[x, TABLE_Y + 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.19, 28]} />
        <meshBasicMaterial
          color={active ? '#ffcf7c' : '#8a4b18'}
          transparent
          opacity={active ? 0.68 : 0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Text
        position={[x, TABLE_Y + 0.044, z + 0.42]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.03}
        color={active ? '#ffd18a' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.44}
      >
        {label}
      </Text>
    </group>
  )
}

function WorkbenchCard({
  card,
  x,
  z,
  selected,
  onSelect,
  onDragStart,
}: {
  card: GrimoireCard
  x: number
  z: number
  selected: boolean
  onSelect: () => void
  onDragStart: (point: THREE.Vector3) => void
}) {
  const [hovered, setHovered] = useState(false)
  const y = TABLE_Y + (selected || hovered ? 0.12 : 0.055)

  return (
    <group
      position={[x, y, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={hovered ? 1.06 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          setPointerCapture?: (pointerId: number) => void
        }

        target.setPointerCapture?.(event.pointerId)
        onDragStart(event.point.clone())
      }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      <mesh>
        <boxGeometry args={[0.34, 0.54, 0.025]} />
        <meshStandardMaterial
          color={selected ? '#2a1208' : '#160909'}
          emissive={selected ? '#6a2a08' : '#210c06'}
          emissiveIntensity={selected ? 0.72 : 0.36}
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.28, 0.45]} />
        <meshBasicMaterial color={selected ? '#301408' : '#0b0605'} />
      </mesh>

      <mesh position={[0, 0.12, 0.025]}>
        <ringGeometry args={[0.045, 0.062, 18]} />
        <meshBasicMaterial color={selected ? '#ffcf7c' : '#9a5a18'} />
      </mesh>

      <Text
        position={[0, -0.17, 0.035]}
        fontSize={0.032}
        color={selected ? '#fff1c6' : '#d8aa72'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.24}
      >
        {card.name}
      </Text>
    </group>
  )
}

function DeckTray({
  count,
  active,
}: {
  count: number
  active: boolean
}) {
  return (
    <group>
      <mesh position={[-1.2, TABLE_Y + 0.055, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.5, 0.72, 0.08]} />
        <meshStandardMaterial
          color="#120807"
          emissive={active ? '#3a1608' : '#150807'}
          emissiveIntensity={active ? 0.64 : 0.28}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>

      <Text
        position={[-1.2, TABLE_Y + 0.12, -0.04]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.045}
        color={active ? '#ffd18a' : '#8b6a45'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.42}
      >
        {active ? `${count} CARDS` : 'NO DECK'}
      </Text>

      <Text
        position={[-1.2, TABLE_Y + 0.09, 0.42]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color="#9a6b48"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.6}
      >
        DECK TRAY
      </Text>
    </group>
  )
}

function FloatingSigilButton({
  sigil,
  label,
  x,
  y = TABLE_Y + 0.42,
  z = 0.92,
  active = false,
  disabled = false,
  danger = false,
  onClick,
}: {
  sigil: string
  label: string
  x: number
  y?: number
  z?: number
  active?: boolean
  disabled?: boolean
  danger?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const baseColor = danger ? '#3a0707' : active ? '#3a1808' : '#120807'
  const glowColor = danger ? '#ff3030' : active ? '#ffcf7c' : '#ff9a00'
  const textColor = disabled ? '#5f4932' : hovered || active ? '#fff0c0' : '#d99b58'

  const trigger = () => {
    if (!disabled) onClick()
  }

  return (
    <group
      position={[x, y, z]}
      rotation={[-0.18, 0, 0]}
      scale={hovered && !disabled ? 1.08 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          setPointerCapture?: (pointerId: number) => void
        }

        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)
        trigger()
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <mesh>
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial
          color={disabled ? '#070403' : baseColor}
          transparent
          opacity={disabled ? 0.42 : 0.86}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.007]}>
        <ringGeometry args={[0.065, 0.074, 24]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={disabled ? 0.1 : hovered || active ? 0.72 : 0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.17, 0.185, 36]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={disabled ? 0.14 : hovered || active ? 0.82 : 0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <circleGeometry args={[0.27, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={disabled ? 0.035 : hovered || active ? 0.2 : 0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.003, 0.04]}
        fontSize={0.078}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.22}
      >
        {sigil}
      </Text>

      {hovered ? (
        <Text
          position={[0, -0.27, 0.05]}
          fontSize={0.033}
          color="#ffd18a"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.58}
        >
          {label}
        </Text>
      ) : null}

      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[0.52, 0.52]} />
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

function FloatingSigilDock({
  menuMode,
  oracleLoading,
  canConsult,
  hasOracleReading,
  onToggleForge,
  onToggleSpread,
  onConsultOracle,
  onClearOracle,
  onReset,
}: {
  menuMode: WorkbenchMode
  oracleLoading: boolean
  canConsult: boolean
  hasOracleReading: boolean
  onToggleForge: () => void
  onToggleSpread: () => void
  onConsultOracle: () => void
  onClearOracle: () => void
  onReset: () => void
}) {
  const sideDock = menuMode === 'spread'

  const dockPlanePosition: [number, number, number] = sideDock
    ? [1.42, TABLE_Y + 0.28, 0.32]
    : [0, TABLE_Y + 0.42, 0.94]

  const dockPlaneSize: [number, number] = sideDock ? [0.34, 1.72] : [2.18, 0.34]

  const sigilPosition = (
    normalX: number,
    sideIndex: number,
  ): { x: number; y: number; z: number } => {
    if (!sideDock) {
      return { x: normalX, y: TABLE_Y + 0.42, z: 0.92 }
    }

    return {
      x: 1.42,
      y: TABLE_Y + 0.86 - sideIndex * 0.32,
      z: 0.34,
    }
  }

  const config = sigilPosition(-0.66, 0)
  const spread = sigilPosition(-0.33, 1)
  const oracle = sigilPosition(0, 2)
  const clear = sigilPosition(0.33, 3)
  const reset = sigilPosition(0.66, 4)

  return (
    <group>
      <mesh position={dockPlanePosition} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={dockPlaneSize} />
        <meshBasicMaterial
          color="#050202"
          transparent
          opacity={sideDock ? 0.28 : 0.36}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <FloatingSigilButton
        sigil="✶"
        label={menuMode === 'forge' ? 'Close Forge Menu' : 'Open Forge Menu'}
        x={config.x}
        y={config.y}
        z={config.z}
        active={menuMode === 'forge'}
        onClick={onToggleForge}
      />

      <FloatingSigilButton
        sigil="⌬"
        label={menuMode === 'spread' ? 'Hide Spread' : 'Reveal Spread'}
        x={spread.x}
        y={spread.y}
        z={spread.z}
        active={menuMode === 'spread'}
        onClick={onToggleSpread}
      />

      <FloatingSigilButton
        sigil={oracleLoading ? '…' : '☉'}
        label={oracleLoading ? 'Consulting Oracle' : 'Consult Oracle'}
        x={oracle.x}
        y={oracle.y}
        z={oracle.z}
        active={oracleLoading}
        disabled={!canConsult}
        onClick={onConsultOracle}
      />

      <FloatingSigilButton
        sigil="✕"
        label="Clear Oracle"
        x={clear.x}
        y={clear.y}
        z={clear.z}
        disabled={!hasOracleReading}
        onClick={onClearOracle}
      />

      <FloatingSigilButton
        sigil="↺"
        label="Reset Ritual"
        x={reset.x}
        y={reset.y}
        z={reset.z}
        danger
        onClick={onReset}
      />
    </group>
  )
}



export function RitualWorkbench({
  cards,
  selectedCardId,
  subject,
  tradition,
  tone,
  techLevel,
  intent,
  forgePhase,
  loading,
  hasDeck,
  oracleQuestion,
  oracleLoading,
  hasOracleReading,
  onSubjectChange,
  onTraditionChange,
  onToneChange,
  onTechLevelChange,
  onIntentChange,
  onOracleQuestionChange,
  onBeginRitual,
  onConsultOracle,
  onClearOracle,
  onClearRitual,
  onCardSelect,
}: RitualWorkbenchProps) {
  const [cardOffsets, setCardOffsets] = useState<Record<number, Vec2>>({})
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [menuMode, setMenuMode] = useState<WorkbenchMode>('closed')
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLE_OPTIONS[0])
  const [erosField, setErosField] = useState(EROS_FIELD_OPTIONS[0])

  const displayedCards = cards.slice(0, 7)

  const spreadSlots = useMemo(() => {
    return [
      { x: -0.52, z: -0.06, label: 'THRESHOLD' },
      { x: 0, z: -0.06, label: 'OPERATION' },
      { x: 0.52, z: -0.06, label: 'RESULT' },
      { x: -0.26, z: 0.46, label: 'ROOT' },
      { x: 0.26, z: 0.46, label: 'KEY' },
      { x: -0.78, z: 0.46, label: 'SHADOW' },
      { x: 0.78, z: 0.46, label: 'CROWN' },
    ]
  }, [])

  const startCardDrag = (cardId: number, point: THREE.Vector3) => {
    setDragState({
      cardId,
      startPoint: point,
      startOffset: cardOffsets[cardId] ?? [0, 0],
    })
  }

  const updateCardDrag = (point: THREE.Vector3) => {
    if (!dragState) return

    const dx = (point.x - dragState.startPoint.x) / WORKBENCH_SCALE
    const dz = (point.z - dragState.startPoint.z) / WORKBENCH_SCALE

    setCardOffsets((current) => ({
      ...current,
      [dragState.cardId]: [
        clamp(dragState.startOffset[0] + dx, -1.25, 1.25),
        clamp(dragState.startOffset[1] + dz, -0.75, 0.8),
      ],
    }))
  }

  const endCardDrag = () => {
    setDragState(null)
  }

  const activeSubject = subject.trim() || SUBJECT_OPTIONS[0]
  const activeIntent = intent.trim() || INTENT_OPTIONS[0]

  const canForge = !loading && activeSubject.length >= 2
  const canConsult =
    hasDeck && !loading && !oracleLoading && oracleQuestion.trim().length >= 3

  return (
    <group position={[0, 0.82, -0.84]} scale={WORKBENCH_SCALE}>
      <mesh position={[0, TABLE_Y - 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[3.3, 1.85, 0.08]} />
        <meshStandardMaterial
          color="#090505"
          emissive="#1e0705"
          emissiveIntensity={0.42}
          roughness={0.34}
          metalness={0.72}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.18, 1.72]} />
        <meshBasicMaterial
          color="#ff8a00"
          transparent
          opacity={0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.014, 0.878]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.22, 0.016]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.58}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.014, -0.878]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.22, 0.016]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[1.6, TABLE_Y + 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.016, 1.76]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.44}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-1.6, TABLE_Y + 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.016, 1.76]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.44}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TableHexagram active={hasDeck || loading || oracleLoading || hasOracleReading} />

      <DeckTray count={cards.length} active={hasDeck} />

      {menuMode === 'spread' || hasDeck
        ? spreadSlots.map((slot, index) => (
            <SpreadSlot
              key={slot.label}
              x={slot.x}
              z={slot.z}
              label={slot.label}
              active={index < displayedCards.length}
            />
          ))
        : null}

      {displayedCards.map((card, index) => {
        const slot = spreadSlots[index] ?? spreadSlots[0]
        const offset = cardOffsets[card.id] ?? [0, 0]
        const x = slot.x + offset[0]
        const z = slot.z + offset[1]

        return (
          <WorkbenchCard
            key={card.id}
            card={card}
            x={x}
            z={z}
            selected={card.id === selectedCardId}
            onDragStart={(point) => startCardDrag(card.id, point)}
            onSelect={() => onCardSelect(card, [x, 1.18, z - 1.0], 0)}
          />
        )
      })}

      {dragState ? (
        <mesh
          position={[0, TABLE_Y + 0.18, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={(event) => {
            event.stopPropagation()
            updateCardDrag(event.point.clone())
          }}
          onPointerUp={(event) => {
            event.stopPropagation()
            endCardDrag()
          }}
          onPointerCancel={(event) => {
            event.stopPropagation()
            endCardDrag()
          }}
        >
          <planeGeometry args={[3.8, 2.4]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.001}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      {menuMode === 'forge' ? (
        <FloatingForgeMenu
          activeSubject={activeSubject}
          tradition={tradition}
          tone={tone}
          techLevel={techLevel}
          activeIntent={activeIntent}
          visualStyle={visualStyle}
          erosField={erosField}
          loading={loading}
          canForge={canForge}
          onBeginRitual={() => void onBeginRitual()}
          onSubjectChange={onSubjectChange}
          onTraditionChange={onTraditionChange}
          onToneChange={onToneChange}
          onTechLevelChange={onTechLevelChange}
          onIntentChange={onIntentChange}
          onVisualStyleChange={setVisualStyle}
          onErosFieldChange={setErosField}
          onOracleQuestionChange={onOracleQuestionChange}
        />
      ) : null}

      <FloatingSigilDock
        menuMode={menuMode}
        oracleLoading={oracleLoading}
        canConsult={canConsult}
        hasOracleReading={hasOracleReading}
        onToggleForge={() => setMenuMode(menuMode === 'forge' ? 'closed' : 'forge')}
        onToggleSpread={() => setMenuMode(menuMode === 'spread' ? 'closed' : 'spread')}
        onConsultOracle={() => void onConsultOracle()}
        onClearOracle={onClearOracle}
        onReset={() => {
          setCardOffsets({})
          onClearRitual()
        }}
      />

      <Text
        position={[0, TABLE_Y + 0.052, 0.54]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.04}
        color={loading || oracleLoading ? '#ffcf7c' : '#9a6b48'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.7}
      >
        {menuMode === 'forge' ? 'FORGE MENU OPEN' : menuMode === 'spread' ? 'SPREAD FIELD OPEN' : `${forgePhase.toUpperCase()} // ${hasDeck ? 'DECK ACTIVE' : 'ALTAR IDLE'}`}
      </Text>
    </group>
  )
}