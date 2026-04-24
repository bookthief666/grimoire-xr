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

const TABLE_Y = 0.08

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

function TableButton({
  label,
  x,
  z,
  width = 0.42,
  disabled = false,
  primary = false,
  danger = false,
  onClick,
}: {
  label: string
  x: number
  z: number
  width?: number
  disabled?: boolean
  primary?: boolean
  danger?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const color = danger ? '#3a0808' : primary ? '#4a1608' : '#1a0c08'
  const glow = danger ? '#ff4040' : primary ? '#ffcf7c' : '#ff9a00'

  return (
    <group
      position={[x, TABLE_Y + 0.024, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={hovered && !disabled ? 1.06 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (!disabled) onClick()
      }}
    >
      <mesh>
        <planeGeometry args={[width, 0.18]} />
        <meshBasicMaterial
          color={disabled ? '#0b0605' : color}
          transparent
          opacity={disabled ? 0.44 : 0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width + 0.08, 0.26]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={hovered && !disabled ? 0.34 : 0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.003, 0.025]}
        fontSize={0.04}
        color={disabled ? '#6d5135' : hovered ? '#ffffff' : '#ffd18a'}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.04}
      >
        {label}
      </Text>

      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[width + 0.18, 0.34]} />
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

function TableDial({
  label,
  value,
  z,
  onPrevious,
  onNext,
}: {
  label: string
  value: string
  z: number
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <group>
      <Text
        position={[-1.38, TABLE_Y + 0.04, z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.035}
        color="#b98855"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.4}
      >
        {label}
      </Text>

      <TableButton label="‹" x={-0.55} z={z} width={0.18} onClick={onPrevious} />

      <mesh
        position={[0, TABLE_Y + 0.025, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.74, 0.18]} />
        <meshBasicMaterial color="#0d0605" transparent opacity={0.88} />
      </mesh>

      <Text
        position={[0, TABLE_Y + 0.052, z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.036}
        color="#f2d4a2"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.68}
      >
        {shortText(value, 28)}
      </Text>

      <TableButton label="›" x={0.55} z={z} width={0.18} onClick={onNext} />
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

    const dx = point.x - dragState.startPoint.x
    const dz = point.z - dragState.startPoint.z

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
    <group position={[0, 0.92, -1.02]}>
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

      <TableHexagram active={hasDeck || loading || oracleLoading || hasOracleReading} />

      <DeckTray count={cards.length} active={hasDeck} />

      {spreadSlots.map((slot, index) => (
        <SpreadSlot
          key={slot.label}
          x={slot.x}
          z={slot.z}
          label={slot.label}
          active={index < displayedCards.length}
        />
      ))}

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

      <TableDial
        label="SUBJECT"
        value={activeSubject}
        z={-0.78}
        onPrevious={() =>
          onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, -1))
        }
        onNext={() =>
          onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, 1))
        }
      />

      <TableDial
        label="TRADITION"
        value={optionLabel(TRADITION_OPTIONS, tradition)}
        z={-1.0}
        onPrevious={() =>
          onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, -1))
        }
        onNext={() =>
          onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, 1))
        }
      />

      <TableDial
        label="TONE"
        value={optionLabel(TONE_OPTIONS, tone)}
        z={-1.22}
        onPrevious={() => onToneChange(cycleOption(TONE_OPTIONS, tone, -1))}
        onNext={() => onToneChange(cycleOption(TONE_OPTIONS, tone, 1))}
      />

      <TableDial
        label="LEVEL"
        value={optionLabel(TECH_LEVEL_OPTIONS, techLevel)}
        z={-1.44}
        onPrevious={() =>
          onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, -1))
        }
        onNext={() =>
          onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, 1))
        }
      />

      <TableDial
        label="INTENT"
        value={activeIntent}
        z={0.92}
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

      <TableButton
        label={loading ? 'FORGING' : 'FORGE'}
        x={-0.95}
        z={1.25}
        width={0.52}
        primary
        disabled={!canForge}
        onClick={() => void onBeginRitual()}
      />

      <TableButton
        label={oracleLoading ? 'ASKING' : 'ORACLE'}
        x={-0.32}
        z={1.25}
        width={0.52}
        primary
        disabled={!canConsult}
        onClick={() => void onConsultOracle()}
      />

      <TableButton
        label="CLEAR"
        x={0.32}
        z={1.25}
        width={0.48}
        disabled={!hasOracleReading}
        onClick={onClearOracle}
      />

      <TableButton
        label="RESET"
        x={0.93}
        z={1.25}
        width={0.48}
        danger
        onClick={() => {
          setCardOffsets({})
          onClearRitual()
        }}
      />

      <Text
        position={[0, TABLE_Y + 0.06, 0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.04}
        color={loading || oracleLoading ? '#ffcf7c' : '#9a6b48'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.7}
      >
        {`ALTAR WORKBENCH // ${forgePhase.toUpperCase()} // ${hasDeck ? 'DECK ACTIVE' : 'NO DECK'}`}
      </Text>
    </group>
  )
}