import { useMemo, useRef, useState } from 'react'
import { Text, useTexture } from '@react-three/drei'
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
  VisualStyle,
  ErosField,
} from '../types/grimoire'

type Vec2 = [number, number]

type WorkbenchMode = 'closed' | 'forge' | 'spread' | 'archive'

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
  visualStyle: VisualStyle
  erosField: ErosField
  intent: string
  forgePhase: ForgePhase
  loading: boolean
  hasDeck: boolean
  oracleQuestion: string
  oracleLoading: boolean
  hasOracleReading: boolean
  hasSavedRitual: boolean
  lastSavedAt: string | null
  archiveMessage: string | null
  onSaveRitual: () => boolean
  onLoadArchive: () => boolean
  onClearArchive: () => void
  onSubjectChange: (subject: string) => void
  onTraditionChange: (tradition: Tradition) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onVisualStyleChange: (visualStyle: VisualStyle) => void
  onErosFieldChange: (erosField: ErosField) => void
  onIntentChange: (intent: string) => void
  onOracleQuestionChange: (question: string) => void
  onBeginRitual: () => Promise<void>
  onConsultOracle: () => Promise<void>
  onClearOracle: () => void
  onClearRitual: () => void
  onGenerateCardImage: (cardId: number) => Promise<boolean>
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

const VISUAL_STYLE_OPTIONS: VisualStyle[] = [
  'Hierophantic',
  'Astral',
  'Venusian',
  'Goetic',
  'Alchemical',
  'Xenotheurgic',
]

const EROS_FIELD_OPTIONS: ErosField[] = [
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

function formatArchiveTime(value: string | null) {
  if (!value) return 'NO SAVED RITUAL'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).toUpperCase()
}

function cycleString<T extends string>(
  values: ReadonlyArray<T>,
  current: T,
  direction: -1 | 1,
): T {
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


function AltarAstrolabeRings({
  active,
  erosField,
}: {
  active: boolean
  erosField: ErosField
}) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null)
  const middleRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)

  const erosAccent =
    erosField === 'Ecstatic'
      ? '#9a35ff'
      : erosField === 'Charged'
        ? '#ff3d5a'
        : '#d6a642'

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (outerRef.current) {
      outerRef.current.opacity = active ? 0.18 + Math.sin(t * 0.55) * 0.05 : 0.1
    }

    if (middleRef.current) {
      middleRef.current.opacity = active ? 0.28 + Math.sin(t * 0.82 + 1.1) * 0.07 : 0.14
    }

    if (innerRef.current) {
      innerRef.current.opacity = active ? 0.34 + Math.sin(t * 1.1 + 0.4) * 0.08 : 0.18
    }
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.905, 96]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#d6a642"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.007, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 8]}>
        <ringGeometry args={[0.48, 0.486, 80]} />
        <meshBasicMaterial
          ref={middleRef}
          color={erosAccent}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.008, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 5]}>
        <ringGeometry args={[0.26, 0.268, 64]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#ffcf7c"
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r1 = 0.74
        const r2 = i % 3 === 0 ? 0.86 : 0.81

        return (
          <TableBar
            key={i}
            a={[Math.cos(angle) * r1, Math.sin(angle) * r1]}
            b={[Math.cos(angle) * r2, Math.sin(angle) * r2]}
            color={i % 3 === 0 ? erosAccent : '#b8860b'}
            opacity={active ? 0.38 : 0.2}
            width={i % 3 === 0 ? 0.014 : 0.008}
          />
        )
      })}

      <Text
        position={[0, TABLE_Y + 0.05, 0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color={active ? '#ffd18a' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.72}
      >
        GRIMOIRE ENGINE
      </Text>
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
  onVisualStyleChange,
  onErosFieldChange,
  onIntentChange,
  onOracleQuestionChange,
  loading,
  canForge,
  onBeginRitual,}: {
  activeSubject: string
  tradition: Tradition
  tone: Tone
  techLevel: TechLevel
  activeIntent: string
  visualStyle: VisualStyle
  erosField: ErosField
  loading: boolean
  canForge: boolean
  onBeginRitual: () => void
  onSubjectChange: (subject: string) => void
  onTraditionChange: (tradition: Tradition) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onIntentChange: (intent: string) => void
  onVisualStyleChange: (style: VisualStyle) => void
  onErosFieldChange: (field: ErosField) => void
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
        label={loading ? 'FORGING DECK…' : 'IGNITE DECK FORGE'}
        x={0.18}
        y={-0.74}
        width={0.98}
        disabled={!canForge}
        onClick={onBeginRitual}
      />
    </group>
  )
}


function SpreadMandala({
  active,
  occupied,
}: {
  active: boolean
  occupied: number
}) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)
  const lensRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const charge = Math.min(1, occupied / 5)

    if (outerRef.current) {
      outerRef.current.opacity = active
        ? 0.18 + Math.sin(t * 0.8) * 0.045 + charge * 0.08
        : 0.045
    }

    if (innerRef.current) {
      innerRef.current.opacity = active
        ? 0.24 + Math.sin(t * 1.3 + 0.8) * 0.055 + charge * 0.08
        : 0.06
    }

    if (lensRef.current) {
      lensRef.current.opacity = active
        ? 0.13 + Math.sin(t * 1.8) * 0.035 + charge * 0.06
        : 0.035
    }
  })

  if (!active) return null

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.013, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.96, 0.972, 96]} />
        <meshBasicMaterial
          ref={outerRef}
          color="#8a35ff"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.016, 0.02]} rotation={[-Math.PI / 2, 0, Math.PI / 7]}>
        <ringGeometry args={[0.55, 0.562, 80]} />
        <meshBasicMaterial
          ref={innerRef}
          color="#ffcf7c"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.011, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 72]} />
        <meshBasicMaterial
          ref={lensRef}
          color="#210428"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TableBar a={[-0.82, -0.44]} b={[0.82, -0.44]} color="#8a35ff" opacity={0.22} width={0.01} />
      <TableBar a={[-0.82, 0.44]} b={[0.82, 0.44]} color="#8a35ff" opacity={0.22} width={0.01} />
      <TableBar a={[-0.82, -0.44]} b={[0, 0.62]} color="#ffcf7c" opacity={0.26} width={0.012} />
      <TableBar a={[0.82, -0.44]} b={[0, 0.62]} color="#ffcf7c" opacity={0.26} width={0.012} />
      <TableBar a={[0, -0.72]} b={[0, 0.68]} color="#ff3d5a" opacity={0.2} width={0.01} />

      {[
        [-0.82, -0.44, '☽'],
        [0.82, -0.44, '☉'],
        [-0.82, 0.44, '♀'],
        [0.82, 0.44, '♄'],
        [0, 0.68, '✶'],
        [0, -0.72, '☿'],
      ].map(([x, z, glyph], index) => (
        <group key={`${glyph}-${index}`} position={[Number(x), TABLE_Y + 0.036, Number(z)]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.045, 0.058, 18]} />
            <meshBasicMaterial
              color={index < occupied ? '#ffd18a' : '#7b5536'}
              transparent
              opacity={index < occupied ? 0.72 : 0.26}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Text
            position={[0, 0.024, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.038}
            color={index < occupied ? '#fff0c0' : '#7b5536'}
            anchorX="center"
            anchorY="middle"
          >
            {String(glyph)}
          </Text>
        </group>
      ))}

      <Text
        position={[0, TABLE_Y + 0.054, -0.94]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color="#9f744b"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        SPREAD FIELD // CARD CURRENT ACTIVE
      </Text>
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
  const fieldRef = useRef<THREE.MeshBasicMaterial>(null)
  const rimRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (fieldRef.current) {
      fieldRef.current.opacity = active
        ? 0.28 + Math.sin(t * 1.6 + x * 2.0 + z) * 0.055
        : 0.12 + Math.sin(t * 0.8 + x) * 0.02
    }

    if (rimRef.current) {
      rimRef.current.opacity = active
        ? 0.58 + Math.sin(t * 1.9 + z) * 0.12
        : 0.24
    }
  })

  const cornerColor = active ? '#ffcf7c' : '#7b5536'

  return (
    <group>
      <mesh position={[x, TABLE_Y + 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.44, 0.66]} />
        <meshBasicMaterial
          ref={fieldRef}
          color={active ? '#231008' : '#080504'}
          transparent
          opacity={0.16}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[x, TABLE_Y + 0.018, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.155, 0.166, 32]} />
        <meshBasicMaterial
          ref={rimRef}
          color={active ? '#ffcf7c' : '#8a4b18'}
          transparent
          opacity={0.36}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[x, TABLE_Y + 0.019, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.235, 0.242, 4]} />
        <meshBasicMaterial
          color={active ? '#9a6bff' : '#4f2a60'}
          transparent
          opacity={active ? 0.32 : 0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {([[-1, 1], [1, 1], [-1, -1], [1, -1]] as [number, number][]).map(([sx, sz], index) => (
        <group key={index} position={[x + sx * 0.19, TABLE_Y + 0.034, z + sz * 0.29]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.075, 0.009]} />
            <meshBasicMaterial
              color={cornerColor}
              transparent
              opacity={active ? 0.72 : 0.28}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[0.075, 0.009]} />
            <meshBasicMaterial
              color={cornerColor}
              transparent
              opacity={active ? 0.72 : 0.28}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      <Text
        position={[x, TABLE_Y + 0.046, z + 0.42]}
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

function CardFaceArt({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl) as THREE.Texture

  return (
    <mesh position={[0, 0, 0.027]}>
      <planeGeometry args={[0.28, 0.45]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.96}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function WorkbenchCard({
  card,
  x,
  z,
  selected,
  onSelect,
  onGenerateImage,
  onDragStart,
}: {
  card: GrimoireCard
  x: number
  z: number
  selected: boolean
  onSelect: () => void
  onGenerateImage: (cardId: number) => void
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

        if (
          card.artPrompt &&
          card.imageStatus !== 'ready' &&
          card.imageStatus !== 'generating'
        ) {
          onGenerateImage(card.id)
        }
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

      {card.imageUrl ? <CardFaceArt imageUrl={card.imageUrl} /> : null}

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

      <Text
        position={[0, 0.2, 0.036]}
        fontSize={0.022}
        color={card.artPrompt ? '#d9b5ff' : '#7b5536'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.26}
      >
        {card.imageStatus === 'ready' ? 'IMAGE SEALED' : card.artPrompt ? 'ART SEED' : 'NO IMAGE'}
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
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)
  const stackRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (haloRef.current) {
      haloRef.current.opacity = active
        ? 0.26 + Math.sin(t * 1.4) * 0.08
        : 0.09 + Math.sin(t * 0.7) * 0.025
    }

    if (innerRef.current) {
      innerRef.current.opacity = active
        ? 0.42 + Math.sin(t * 2.1) * 0.12
        : 0.18
    }

    if (stackRef.current) {
      stackRef.current.position.y = TABLE_Y + 0.07 + Math.sin(t * 0.9) * (active ? 0.012 : 0.004)
      stackRef.current.rotation.z = Math.sin(t * 0.45) * (active ? 0.025 : 0.008)
    }
  })

  return (
    <group>
      <mesh position={[-1.2, TABLE_Y + 0.018, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.43, 48]} />
        <meshBasicMaterial
          ref={haloRef}
          color={active ? '#8a35ff' : '#7b5536'}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-1.2, TABLE_Y + 0.021, -0.04]} rotation={[-Math.PI / 2, 0, Math.PI / 8]}>
        <ringGeometry args={[0.24, 0.27, 40]} />
        <meshBasicMaterial
          ref={innerRef}
          color={active ? '#ffcf7c' : '#9a5a18'}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const inner = 0.31
        const outer = i % 3 === 0 ? 0.43 : 0.39

        return (
          <TableBar
            key={i}
            a={[-1.2 + Math.cos(angle) * inner, -0.04 + Math.sin(angle) * inner]}
            b={[-1.2 + Math.cos(angle) * outer, -0.04 + Math.sin(angle) * outer]}
            color={i % 3 === 0 ? '#ffcf7c' : '#8a35ff'}
            opacity={active ? 0.38 : 0.14}
            width={i % 3 === 0 ? 0.012 : 0.007}
          />
        )
      })}

      <group ref={stackRef}>
        {Array.from({ length: active ? 9 : 5 }, (_, i) => (
          <mesh
            key={i}
            position={[
              -1.2 + i * 0.006,
              TABLE_Y + 0.055 + i * 0.008,
              -0.04 - i * 0.004,
            ]}
            rotation={[-Math.PI / 2, 0, -0.08 + i * 0.012]}
          >
            <boxGeometry args={[0.46, 0.68, 0.018]} />
            <meshStandardMaterial
              color={active ? '#180907' : '#100706'}
              emissive={active ? '#3a1608' : '#140807'}
              emissiveIntensity={active ? 0.58 : 0.22}
              roughness={0.44}
              metalness={0.44}
            />
          </mesh>
        ))}

        <mesh position={[-1.2, TABLE_Y + 0.146, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.54]} />
          <meshBasicMaterial
            color={active ? '#2a1208' : '#090505'}
            transparent
            opacity={active ? 0.9 : 0.72}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[-1.2, TABLE_Y + 0.15, -0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.055, 0.078, 20]} />
          <meshBasicMaterial
            color={active ? '#ffcf7c' : '#7b5536'}
            transparent
            opacity={active ? 0.86 : 0.34}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Text
          position={[-1.2, TABLE_Y + 0.158, 0.12]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.034}
          color={active ? '#ffd18a' : '#8b6a45'}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.34}
        >
          {active ? `${count} ONLINE` : 'UNFORGED'}
        </Text>
      </group>

      <Text
        position={[-1.2, TABLE_Y + 0.09, 0.44]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.032}
        color={active ? '#d9b5ff' : '#9a6b48'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.72}
      >
        ARCANA MATRIX
      </Text>

      <Text
        position={[-1.2, TABLE_Y + 0.066, -0.52]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.026}
        color={active ? '#9f744b' : '#5f4932'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.72}
      >
        DECK MEMORY // SPREAD SOURCE
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
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const outerRingRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRingRef = useRef<THREE.MeshBasicMaterial>(null)

  const baseColor = danger ? '#3a0707' : active ? '#3a1808' : '#120807'
  const glowColor = danger ? '#ff3030' : active ? '#ffcf7c' : '#ff9a00'
  const textColor = disabled ? '#5f4932' : hovered || active ? '#fff0c0' : '#d99b58'

  useFrame(({ clock }) => {
    if (disabled) return

    const t = clock.getElapsedTime()
    const pulse = active || hovered ? 0.5 + Math.sin(t * 3.2) * 0.5 : 0

    if (haloRef.current) {
      haloRef.current.opacity = hovered || active ? 0.13 + pulse * 0.12 : 0.075
    }

    if (outerRingRef.current) {
      outerRingRef.current.opacity = hovered || active ? 0.58 + pulse * 0.26 : 0.42
    }

    if (innerRingRef.current) {
      innerRingRef.current.opacity = hovered || active ? 0.52 + pulse * 0.24 : 0.35
    }
  })

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
          ref={innerRingRef}
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
          ref={outerRingRef}
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
          ref={haloRef}
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

function FloatingArchiveMenu({
  hasSavedRitual,
  lastSavedAt,
  archiveMessage,
  onSaveRitual,
  onLoadArchive,
  onClearArchive,
}: {
  hasSavedRitual: boolean
  lastSavedAt: string | null
  archiveMessage: string | null
  onSaveRitual: () => boolean
  onLoadArchive: () => boolean
  onClearArchive: () => void
}) {
  return (
    <group position={[-1.05, 0.98, 0.08]} scale={0.98}>
      <mesh>
        <planeGeometry args={[1.48, 1.02]} />
        <meshStandardMaterial
          color="#090404"
          emissive="#1d0907"
          emissiveIntensity={0.36}
          transparent
          opacity={0.9}
          roughness={0.32}
          metalness={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.62, 1.15]} />
        <meshBasicMaterial
          color={hasSavedRitual ? '#8a35ff' : '#b8860b'}
          transparent
          opacity={hasSavedRitual ? 0.12 : 0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.39, 0.05]}
        fontSize={0.045}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.1}
      >
        RITUAL ARCHIVE
      </Text>

      <Text
        position={[0, 0.26, 0.05]}
        fontSize={0.028}
        color={hasSavedRitual ? '#d9b5ff' : '#9f744b'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.18}
      >
        {hasSavedRitual ? 'LOCAL MEMORY SEALED' : 'NO RITUAL SEALED'}
      </Text>

      <Text
        position={[0, 0.13, 0.05]}
        fontSize={0.026}
        color="#bfa788"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.18}
      >
        {formatArchiveTime(lastSavedAt)}
      </Text>

      <FloatingMenuButton
        label="SEAL CURRENT"
        x={-0.42}
        y={-0.08}
        width={0.5}
        onClick={() => {
          onSaveRitual()
        }}
      />

      <FloatingMenuButton
        label="LOAD LAST"
        x={0.18}
        y={-0.08}
        width={0.5}
        disabled={!hasSavedRitual}
        onClick={() => {
          onLoadArchive()
        }}
      />

      <FloatingMenuButton
        label="CLEAR SEAL"
        x={-0.12}
        y={-0.31}
        width={0.62}
        disabled={!hasSavedRitual}
        onClick={onClearArchive}
      />

      <Text
        position={[0, -0.48, 0.05]}
        fontSize={0.026}
        color="#8f6742"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
      >
        {archiveMessage ?? 'Deck, selection, and ritual configuration persist locally.'}
      </Text>
    </group>
  )
}

function FloatingSigilDock({
  menuMode,
  oracleLoading,
  canConsult,
  hasOracleReading,
  hasSavedRitual,
  onToggleForge,
  onToggleSpread,
  onToggleArchive,
  onConsultOracle,
  onClearOracle,
  onReset,
}: {
  menuMode: WorkbenchMode
  oracleLoading: boolean
  canConsult: boolean
  hasOracleReading: boolean
  hasSavedRitual: boolean
  onToggleForge: () => void
  onToggleSpread: () => void
  onToggleArchive: () => void
  onConsultOracle: () => void
  onClearOracle: () => void
  onReset: () => void
}) {
  const sideDock = menuMode === 'spread' || menuMode === 'forge' || menuMode === 'archive'

  const dockPlanePosition: [number, number, number] = sideDock
    ? [1.54, TABLE_Y + 0.2, 0.22]
    : [0, TABLE_Y + 0.42, 0.94]

  const dockPlaneSize: [number, number] = sideDock ? [0.42, 2.12] : [2.38, 0.34]

  const sigilPosition = (
    normalX: number,
    sideIndex: number,
  ): { x: number; y: number; z: number } => {
    if (!sideDock) {
      return { x: normalX, y: TABLE_Y + 0.42, z: 0.92 }
    }

    return {
      x: 1.54,
      y: TABLE_Y + 0.82 - sideIndex * 0.26,
      z: 0.22,
    }
  }

  const config = sigilPosition(-0.78, 0)
  const spread = sigilPosition(-0.47, 1)
  const oracle = sigilPosition(-0.16, 2)
  const archive = sigilPosition(0.16, 3)
  const clear = sigilPosition(0.47, 4)
  const reset = sigilPosition(0.78, 5)

  return (
    <group>
      <mesh position={dockPlanePosition} rotation={[-0.18, 0, 0]}>
        <planeGeometry args={dockPlaneSize} />
        <meshBasicMaterial
          color="#050202"
          transparent
          opacity={sideDock ? 0.22 : 0.36}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <FloatingSigilButton
        sigil="✶"
        label={menuMode === 'forge' ? 'Seal Forge' : 'Configure Forge'}
        x={config.x}
        y={config.y}
        z={config.z}
        active={menuMode === 'forge'}
        onClick={onToggleForge}
      />

      {menuMode !== 'forge' ? (
        <>
          <FloatingSigilButton
            sigil="⌬"
            label={menuMode === 'spread' ? 'Seal Spread Field' : 'Reveal Spread Field'}
            x={spread.x}
            y={spread.y}
            z={spread.z}
            active={menuMode === 'spread'}
            onClick={onToggleSpread}
          />

          <FloatingSigilButton
            sigil={oracleLoading ? '…' : '☉'}
            label={oracleLoading ? 'Oracle Awakening' : 'Invoke Oracle'}
            x={oracle.x}
            y={oracle.y}
            z={oracle.z}
            active={oracleLoading}
            disabled={!canConsult}
            onClick={onConsultOracle}
          />

          <FloatingSigilButton
            sigil={hasSavedRitual ? '◈' : '◇'}
            label={menuMode === 'archive' ? 'Seal Archive Tablet' : 'Open Archive Tablet'}
            x={archive.x}
            y={archive.y}
            z={archive.z}
            active={menuMode === 'archive' || hasSavedRitual}
            onClick={onToggleArchive}
          />

          <FloatingSigilButton
            sigil="✕"
            label="Clear Oracle Tablet"
            x={clear.x}
            y={clear.y}
            z={clear.z}
            disabled={!hasOracleReading}
            onClick={onClearOracle}
          />

          <FloatingSigilButton
            sigil="↺"
            label="Banish Ritual"
            x={reset.x}
            y={reset.y}
            z={reset.z}
            danger
            onClick={onReset}
          />
        </>
      ) : null}
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
  visualStyle,
  erosField,
  intent,
  forgePhase,
  loading,
  hasDeck,
  oracleQuestion,
  oracleLoading,
  hasOracleReading,
  hasSavedRitual,
  lastSavedAt,
  archiveMessage,
  onSaveRitual,
  onLoadArchive,
  onClearArchive,
  onSubjectChange,
  onTraditionChange,
  onToneChange,
  onTechLevelChange,
  onVisualStyleChange,
  onErosFieldChange,
  onIntentChange,
  onOracleQuestionChange,
  onBeginRitual,
  onConsultOracle,
  onClearOracle,
  onClearRitual,
  onGenerateCardImage,
  onCardSelect,}: RitualWorkbenchProps) {
  const [cardOffsets, setCardOffsets] = useState<Record<number, Vec2>>({})
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [menuMode, setMenuMode] = useState<WorkbenchMode>('closed')

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

      <AltarAstrolabeRings
        active={hasDeck || menuMode !== 'closed' || loading || oracleLoading || hasOracleReading}
        erosField={erosField}
      />
      <TableHexagram active={hasDeck || loading || oracleLoading || hasOracleReading} />

      <DeckTray count={cards.length} active={hasDeck} />

      <SpreadMandala
        active={menuMode === 'spread' || hasDeck}
        occupied={displayedCards.length}
      />

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
            onGenerateImage={(cardId) => {
              void onGenerateCardImage(cardId)
            }}
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
          onVisualStyleChange={onVisualStyleChange}
          onErosFieldChange={onErosFieldChange}
          onIntentChange={onIntentChange}
          onOracleQuestionChange={onOracleQuestionChange}
        />
      ) : null}

      {menuMode === 'archive' ? (
        <FloatingArchiveMenu
          hasSavedRitual={hasSavedRitual}
          lastSavedAt={lastSavedAt}
          archiveMessage={archiveMessage}
          onSaveRitual={onSaveRitual}
          onLoadArchive={onLoadArchive}
          onClearArchive={onClearArchive}
        />
      ) : null}

      <FloatingSigilDock
        menuMode={menuMode}
        oracleLoading={oracleLoading}
        canConsult={canConsult}
        hasOracleReading={hasOracleReading}
        hasSavedRitual={hasSavedRitual}
        onToggleForge={() => setMenuMode(menuMode === 'forge' ? 'closed' : 'forge')}
        onToggleSpread={() => setMenuMode(menuMode === 'spread' ? 'closed' : 'spread')}
        onToggleArchive={() => setMenuMode(menuMode === 'archive' ? 'closed' : 'archive')}
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