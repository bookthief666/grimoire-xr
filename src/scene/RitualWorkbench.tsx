import { useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { UnicursalHexagramGlyph } from './ThelemicSigils'
import {
  TECH_LEVEL_OPTIONS,
  TONE_OPTIONS,
} from '../constants/ritualOptions'
import { TAROT_SYSTEM_OPTIONS } from '../constants/tarotSystems'
import { EROS_LEVEL_OPTIONS } from '../constants/erosLevels'
import {
  ART_STYLE_FAMILY_OPTIONS,
  getStylesByFamily,
  type ArtStyleFamily,
} from '../constants/artStyles'
import type {
  ForgePhase,
  GrimoireCard,
  TechLevel,
  Tone,
  Tradition,
  TarotSystem,
  ArtStyle,
  ErosField,
  ErosLevel,
} from '../types/grimoire'

type Vec2 = [number, number]

type WorkbenchMode = 'closed' | 'forge' | 'spread' | 'archive'
type ForgeEnergy = 'idle' | 'tuning' | 'working' | 'manifest' | 'oracle'

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
  tarotSystem: TarotSystem
  tone: Tone
  techLevel: TechLevel
  artStyleFamily: ArtStyleFamily
  artStyle: ArtStyle
  erosField: ErosField
  erosLevel: ErosLevel
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
  onTarotSystemChange: (tarotSystem: TarotSystem) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onArtStyleFamilyChange: (family: ArtStyleFamily) => void
  onArtStyleChange: (style: ArtStyle) => void
  onErosFieldChange: (erosField: ErosField) => void
  onErosLevelChange: (erosLevel: ErosLevel) => void
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

function ImagePipelineStatus({
  cards,
  selectedCardId,
  archiveMessage,
}: {
  cards: GrimoireCard[]
  selectedCardId: number | null
  archiveMessage: string | null
}) {
  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ??
    cards.find((card) => card.imageStatus === 'generating') ??
    cards.find((card) => card.imageStatus === 'error') ??
    cards.find((card) => card.imageStatus === 'ready') ??
    cards[0] ??
    null

  const readyCount = cards.filter((card) => card.imageStatus === 'ready').length
  const generatingCount = cards.filter((card) => card.imageStatus === 'generating').length
  const errorCount = cards.filter((card) => card.imageStatus === 'error').length

  const status = selectedCard?.imageStatus ?? 'none'
  const hasImage = Boolean(selectedCard?.imageUrl)
  const hasPrompt = Boolean(selectedCard?.artPrompt)

  const statusColor =
    status === 'ready'
      ? '#9fffb7'
      : status === 'generating'
        ? '#ffd18a'
        : status === 'error'
          ? '#ff7a7a'
          : '#bfa788'

  const engineLine = archiveMessage
    ? shortText(archiveMessage, 58)
    : 'Awaiting image operation.'

  return (
    <group position={[1.16, 1.04, 0.14]} scale={0.82}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[1.56, 0.86]} />
        <meshStandardMaterial
          color="#080404"
          emissive="#1f0a05"
          emissiveIntensity={0.32}
          transparent
          opacity={0.86}
          roughness={0.36}
          metalness={0.46}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[1.66, 0.96]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.34, 0.04]}
        fontSize={0.042}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.36}
      >
        IMAGE PIPELINE
      </Text>

      <Text
        position={[-0.68, 0.20, 0.04]}
        fontSize={0.031}
        color="#d8bf9b"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`CARD: ${selectedCard ? shortText(selectedCard.name, 34) : 'NONE'}`}
      </Text>

      <Text
        position={[-0.68, 0.08, 0.04]}
        fontSize={0.031}
        color={statusColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`STATUS: ${status.toUpperCase()}${hasImage ? ' / IMAGE URL' : ''}`}
      </Text>

      <Text
        position={[-0.68, -0.04, 0.04]}
        fontSize={0.031}
        color={hasPrompt ? '#9fffb7' : '#ff7a7a'}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`ART SEED: ${hasPrompt ? 'YES' : 'NO'}`}
      </Text>

      <Text
        position={[-0.68, -0.16, 0.04]}
        fontSize={0.031}
        color="#d8bf9b"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.32}
      >
        {`READY: ${readyCount}/${cards.length}   GENERATING: ${generatingCount}   ERRORS: ${errorCount}`}
      </Text>

      <Text
        position={[-0.68, -0.31, 0.04]}
        fontSize={0.027}
        color="#bfa788"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.34}
      >
        {`ENGINE: ${engineLine}`}
      </Text>
    </group>
  )
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
  yOffset = 0.012,
}: {
  a: Vec2
  b: Vec2
  color?: string
  opacity?: number
  width?: number
  yOffset?: number
}) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, TABLE_Y + yOffset, (a[1] + b[1]) / 2]}
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

function AltarChromeHardware({
  railColor,
  forgeEnergy,
}: {
  railColor: string
  forgeEnergy: ForgeEnergy
}) {
  const energized = forgeEnergy !== 'idle'

  const seamOpacity =
    forgeEnergy === 'working'
      ? 0.34
      : forgeEnergy === 'manifest'
        ? 0.26
        : forgeEnergy === 'tuning'
          ? 0.22
          : forgeEnergy === 'oracle'
            ? 0.24
            : 0.12

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.018, 0.878]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.22, 0.032]} />
        <meshBasicMaterial
          color="#d8e8ff"
          transparent
          opacity={energized ? 0.18 : 0.105}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.018, -0.878]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.22, 0.024]} />
        <meshBasicMaterial
          color="#f8f3df"
          transparent
          opacity={energized ? 0.13 : 0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[1.6, TABLE_Y + 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.026, 1.76]} />
        <meshBasicMaterial
          color="#d8e8ff"
          transparent
          opacity={energized ? 0.14 : 0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-1.6, TABLE_Y + 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.026, 1.76]} />
        <meshBasicMaterial
          color="#d8e8ff"
          transparent
          opacity={energized ? 0.14 : 0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.021, 0.54]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.26, 0.018]} />
        <meshBasicMaterial
          color={railColor}
          transparent
          opacity={seamOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.021, -0.54]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.26, 0.014]} />
        <meshBasicMaterial
          color="#f8f3df"
          transparent
          opacity={seamOpacity * 0.58}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function TableHexagram({
  active,
  energy = 'idle',
}: {
  active: boolean
  energy?: ForgeEnergy
}) {
  const ringRef = useRef<THREE.MeshBasicMaterial>(null)

  const glyphColor =
    energy === 'working' ? '#ffffff' :
    energy === 'manifest' ? '#ffcf7c' :
    energy === 'oracle' ? '#b98cff' :
    active ? '#ffcf7c' :
    '#9a5a18'

  useFrame(({ clock }) => {
    if (!ringRef.current) return

    const speed =
      energy === 'working' ? 2.2 :
      energy === 'manifest' ? 1.45 :
      energy === 'oracle' ? 1.75 :
      1.2

    const base =
      energy === 'working' ? 0.62 :
      energy === 'manifest' ? 0.56 :
      energy === 'tuning' ? 0.48 :
      energy === 'oracle' ? 0.52 :
      0.28

    const pulse = 0.24 + Math.sin(clock.getElapsedTime() * speed) * 0.12
    ringRef.current.opacity = active ? base + pulse : 0.22 + pulse * 0.34
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.71, 72]} />
        <meshBasicMaterial
          ref={ringRef}
          color={glyphColor}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, TABLE_Y + 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 48]} />
        <meshBasicMaterial
          color={glyphColor}
          transparent
          opacity={active ? 0.09 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group position={[0, TABLE_Y + 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <UnicursalHexagramGlyph
          radius={0.62}
          color={glyphColor}
          opacity={active ? 0.94 : 0.52}
          lineWidth={2.35}
          withRose
        />
      </group>
    </group>
  )
}


function AltarAstrolabeRings({
  active,
  erosField,
  energy = 'idle',
}: {
  active: boolean
  erosField: ErosField
  energy?: ForgeEnergy
}) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null)
  const middleRef = useRef<THREE.MeshBasicMaterial>(null)
  const innerRef = useRef<THREE.MeshBasicMaterial>(null)

  const erosAccent =
    energy === 'oracle'
      ? '#b98cff'
      : energy === 'working'
        ? '#ffffff'
        : erosField === 'Ecstatic'
          ? '#9a35ff'
          : erosField === 'Charged'
            ? '#ff3d5a'
            : '#d6a642'

  const energyBoost =
    energy === 'working' ? 1.85 :
    energy === 'manifest' ? 1.45 :
    energy === 'tuning' ? 1.22 :
    energy === 'oracle' ? 1.35 :
    1

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (outerRef.current) {
      outerRef.current.opacity = active ? (0.16 + Math.sin(t * 0.55) * 0.05) * energyBoost : 0.1
    }

    if (middleRef.current) {
      middleRef.current.opacity = active ? (0.24 + Math.sin(t * 0.82 + 1.1) * 0.07) * energyBoost : 0.14
    }

    if (innerRef.current) {
      innerRef.current.opacity = active ? (0.28 + Math.sin(t * 1.1 + 0.4) * 0.08) * energyBoost : 0.18
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
    >
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[width + 0.28, 0.34]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <planeGeometry args={[width, 0.13]} />
        <meshBasicMaterial
          color={disabled ? '#100807' : '#241008'}
          transparent
          opacity={disabled ? 0.16 : hovered ? 0.44 : 0.24}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width + 0.12, 0.24]} />
        <meshBasicMaterial
          color="#ffb000"
          transparent
          opacity={hovered && !disabled ? 0.28 : 0.045}
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


function dialGlyph(label: string) {
  if (label === 'TAROT SYSTEM') return '☉'
  if (label === 'TONE') return '☽'
  if (label === 'LEVEL') return '♄'
  if (label === 'STYLE FAMILY') return '☿'
  if (label === 'ART STYLE') return '✶'
  if (label === 'EROS LEVEL') return '♀'
  if (label === 'INTENT') return '🜂'
  if (label === 'SUBJECT') return '🜃'
  return '✦'
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
  const glyph = dialGlyph(label)

  return (
    <group position={[0, y, 0.04]}>
      <mesh position={[0.18, 0, 0.033]}>
        <planeGeometry args={[1.62, 0.128]} />
        <meshBasicMaterial
          color="#120706"
          transparent
          opacity={0.44}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, 0.061, 0.038]}>
        <planeGeometry args={[1.56, 0.004]} />
        <meshBasicMaterial
          color="#ff8a00"
          transparent
          opacity={0.24}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, -0.061, 0.038]}>
        <planeGeometry args={[1.56, 0.003]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[-0.76, 0, 0.074]}
        fontSize={0.052}
        color="#f7be72"
        anchorX="center"
        anchorY="middle"
      >
        {glyph}
      </Text>

      <Text
        position={[-0.67, 0, 0.062]}
        fontSize={0.027}
        color="#9f744b"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.36}
      >
        {label}
      </Text>

      <Text
        position={[-0.28, 0.002, 0.078]}
        fontSize={0.058}
        color="#ffcf7c"
        anchorX="center"
        anchorY="middle"
        onClick={(event) => {
          event.stopPropagation()
          onPrevious()
        }}
      >
        ◂
      </Text>

      <mesh position={[-0.28, 0, 0.092]} onClick={(event) => {
        event.stopPropagation()
        onPrevious()
      }}>
        <planeGeometry args={[0.18, 0.16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, 0, 0.045]}>
        <planeGeometry args={[0.73, 0.116]} />
        <meshBasicMaterial
          color="#070404"
          transparent
          opacity={0.86}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.18, 0, 0.052]}>
        <planeGeometry args={[0.67, 0.056]} />
        <meshBasicMaterial
          color="#ff6a00"
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0.18, 0.002, 0.078]}
        fontSize={0.033}
        color="#f2d4a2"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.66}
      >
        {shortText(value, 30)}
      </Text>

      <Text
        position={[0.65, 0.002, 0.078]}
        fontSize={0.058}
        color="#ffcf7c"
        anchorX="center"
        anchorY="middle"
        onClick={(event) => {
          event.stopPropagation()
          onNext()
        }}
      >
        ▸
      </Text>

      <mesh position={[0.65, 0, 0.092]} onClick={(event) => {
        event.stopPropagation()
        onNext()
      }}>
        <planeGeometry args={[0.18, 0.16]} />
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


function ForgeGlyph({
  glyph,
  x,
  y,
}: {
  glyph: string
  x: number
  y: number
}) {
  return (
    <group position={[x, y, 0.08]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.09}
        color="#ff6a00"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.18}
      >
        {glyph}
      </Text>
      <Text
        position={[0, 0, 0.003]}
        fontSize={0.058}
        color="#ffd7a3"
        anchorX="center"
        anchorY="middle"
      >
        {glyph}
      </Text>
    </group>
  )
}

function ForgeConfigReadout({
  activeSubject,
  tarotSystem,
  tone,
  techLevel,
  activeIntent,
  artStyleFamily,
  artStyle,
  erosLevel,
  forgePhase,
  loading,
  canForge,
}: {
  activeSubject: string
  tarotSystem: TarotSystem
  tone: Tone
  techLevel: TechLevel
  activeIntent: string
  artStyleFamily: ArtStyleFamily
  artStyle: ArtStyle
  erosLevel: ErosLevel
  forgePhase: ForgePhase
  loading: boolean
  canForge: boolean
}) {
  const activeArtStyleOptions = getStylesByFamily(artStyleFamily).map((style) => ({
    value: style.id,
    label: style.label,
  }))

  const subjectLabel = activeSubject.trim() || '—'
  const intentLabel = activeIntent.trim() || '—'
  const energized = loading || forgePhase === 'forging' || forgePhase === 'ready'
  const status = loading ? 'FORGING' : canForge ? 'READY' : 'SUBJECT REQUIRED'
  const phaseLabel = forgePhase.toUpperCase()
  const panelOpacity = energized ? 0.92 : 0.72

  const rows = [
    ['SUBJECT', subjectLabel],
    ['TAROT', optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)],
    ['TONE', optionLabel(TONE_OPTIONS, tone)],
    ['LEVEL', optionLabel(TECH_LEVEL_OPTIONS, techLevel)],
    ['FAMILY', optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)],
    ['STYLE', optionLabel(activeArtStyleOptions, artStyle)],
    ['EROS', optionLabel(EROS_LEVEL_OPTIONS, erosLevel)],
    ['INTENT', intentLabel],
  ] as const

  const glyphRail = ['☿', '♀', '☉', '♄', '☽']

  return (
    <group position={[1.08, 1.0, 0.1]} scale={0.81}>
      <mesh>
        <planeGeometry args={[1.72, 1.48]} />
        <meshStandardMaterial
          color="#070405"
          emissive="#1a0906"
          emissiveIntensity={0.38}
          transparent
          opacity={panelOpacity}
          roughness={0.29}
          metalness={0.68}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.86, 1.62]} />
        <meshBasicMaterial
          color="#ff7a1a"
          transparent
          opacity={energized ? 0.08 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.61, 0.04]}>
        <planeGeometry args={[1.42, 0.012]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -0.63, 0.04]}>
        <planeGeometry args={[1.42, 0.01]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ForgeGlyph glyph="☿" x={-0.74} y={0.59} />
      <ForgeGlyph glyph="☉" x={0.74} y={0.59} />
      <ForgeGlyph glyph="♄" x={-0.74} y={-0.61} />
      <ForgeGlyph glyph="☽" x={0.74} y={-0.61} />

      {glyphRail.map((glyph, index) => (
        <Text
          key={`${glyph}-${index}`}
          position={[-0.34 + index * 0.17, 0.46, 0.07]}
          fontSize={0.027}
          color={energized ? '#d99a5b' : '#7a5542'}
          anchorX="center"
          anchorY="middle"
        >
          {glyph}
        </Text>
      ))}

      <Text
        position={[0, 0.545, 0.07]}
        fontSize={0.044}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.28}
      >
        ACTIVE FORGE CONFIG
      </Text>

      <Text
        position={[0, 0.40, 0.07]}
        fontSize={0.026}
        color={canForge ? '#ffcf7c' : '#9a6558'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.22}
      >
        {phaseLabel} · {status}
      </Text>

      {rows.map(([label, value], index) => {
        const y = 0.295 - index * 0.104

        return (
          <group key={label}>
            <mesh position={[0, y - 0.034, 0.03]}>
              <planeGeometry args={[1.28, 0.0025]} />
              <meshBasicMaterial
                color="#ff8a00"
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            <Text
              position={[-0.62, y, 0.07]}
              fontSize={0.025}
              color="#8f6742"
              anchorX="left"
              anchorY="middle"
              maxWidth={0.34}
            >
              {label}
            </Text>

            <Text
              position={[-0.18, y, 0.07]}
              fontSize={0.028}
              color="#f2d4a2"
              anchorX="left"
              anchorY="middle"
              maxWidth={0.82}
            >
              {shortText(value, 30)}
            </Text>
          </group>
        )
      })}
    </group>
  )
}


function FloatingForgeMenu({
  activeSubject,
  tarotSystem,
  tone,
  techLevel,
  activeIntent,
  artStyleFamily,
  artStyle,
  erosLevel,
  onSubjectChange,
  onTarotSystemChange,
  onToneChange,
  onTechLevelChange,
  onArtStyleFamilyChange,
  onArtStyleChange,
  onErosLevelChange,
  onIntentChange,
  onOracleQuestionChange,
  loading,
  canForge,
  onBeginRitual,
}: {
  activeSubject: string
  tarotSystem: TarotSystem
  tone: Tone
  techLevel: TechLevel
  activeIntent: string
  artStyleFamily: ArtStyleFamily
  artStyle: ArtStyle
  erosLevel: ErosLevel
  loading: boolean
  canForge: boolean
  onBeginRitual: () => void
  onSubjectChange: (subject: string) => void
  onTarotSystemChange: (tarotSystem: TarotSystem) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onIntentChange: (intent: string) => void
  onArtStyleFamilyChange: (family: ArtStyleFamily) => void
  onArtStyleChange: (style: ArtStyle) => void
  onErosLevelChange: (level: ErosLevel) => void
  onOracleQuestionChange: (question: string) => void
}) {
  const activeArtStyleOptions = getStylesByFamily(artStyleFamily).map((style) => ({
    value: style.id,
    label: style.label,
  }))

  return (
    <group position={[-1.04, 1.0, 0.1]} scale={0.86}>
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
          opacity={0.075}
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
                opacity={0.52}
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
                opacity={0.52}
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
        label="TAROT SYSTEM"
        value={optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)}
        y={0.23}
        onPrevious={() =>
          onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, -1))
        }
        onNext={() =>
          onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, 1))
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
        label="STYLE FAMILY"
        value={optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)}
        y={-0.25}
        onPrevious={() =>
          onArtStyleFamilyChange(cycleOption(ART_STYLE_FAMILY_OPTIONS, artStyleFamily, -1))
        }
        onNext={() =>
          onArtStyleFamilyChange(cycleOption(ART_STYLE_FAMILY_OPTIONS, artStyleFamily, 1))
        }
      />

      <FloatingDial
        label="ART STYLE"
        value={optionLabel(activeArtStyleOptions, artStyle)}
        y={-0.41}
        onPrevious={() =>
          onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, -1))
        }
        onNext={() =>
          onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, 1))
        }
      />

      <FloatingDial
        label="EROS LEVEL"
        value={optionLabel(EROS_LEVEL_OPTIONS, erosLevel)}
        y={-0.57}
        onPrevious={() =>
          onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, -1))
        }
        onNext={() =>
          onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, 1))
        }
      />

      <FloatingDial
        label="INTENT"
        value={activeIntent}
        y={-0.73}
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
        y={-0.9}
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
      <mesh position={[0, TABLE_Y + 0.021, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
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

      <mesh position={[0, TABLE_Y + 0.024, 0.02]} rotation={[-Math.PI / 2, 0, Math.PI / 7]}>
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

      <mesh position={[0, TABLE_Y + 0.018, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
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
      <TableBar a={[0, -0.72]} b={[0, 0.68]} color="#ff3d5a" opacity={0.2} width={0.01} yOffset={0.026} />

      {[
        [-0.82, -0.44, '☽'],
        [0.82, -0.44, '☉'],
        [-0.82, 0.44, '♀'],
        [0.82, 0.44, '♄'],
        [0, 0.68, '✶'],
        [0, -0.72, '☿'],
      ].map(([x, z, glyph], index) => (
        <group key={`${glyph}-${index}`} position={[Number(x), TABLE_Y + 0.046, Number(z)]}>
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
        ? 0.18 + Math.sin(t * 1.25 + x * 2.0 + z) * 0.035
        : 0.045 + Math.sin(t * 0.6 + x) * 0.012
    }

    if (rimRef.current) {
      rimRef.current.opacity = active
        ? 0.68 + Math.sin(t * 1.55 + z) * 0.1
        : 0.16
    }
  })

  const cornerColor = active ? '#ffcf7c' : '#7b5536'

  return (
    <group>
      <mesh position={[x, TABLE_Y + 0.024, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.58]} />
        <meshBasicMaterial
          ref={fieldRef}
          color={active ? '#1a0b08' : '#050303'}
          transparent
          opacity={0.16}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[x, TABLE_Y + 0.031, z]} rotation={[-Math.PI / 2, 0, 0]}>
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

      <mesh position={[x, TABLE_Y + 0.033, z]} rotation={[-Math.PI / 2, 0, 0]}>
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
        <group key={index} position={[x + sx * 0.17, TABLE_Y + 0.048, z + sz * 0.255]}>
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

function isUsableGeneratedCardImageUrl(value: string | undefined): value is string {
  if (!value) return false
  if (value.includes('example.com')) return false
  if (value.includes('grimoirexr.com/images/')) return false

  return (
    value.startsWith('data:image/') ||
    value.startsWith('blob:') ||
    value.startsWith('/api/')
  )
}

function CardFaceArt({ imageUrl }: { imageUrl: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTexture(null)
    setFailed(false)

    const loader = new THREE.TextureLoader()

    loader.load(
      imageUrl,
      (loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.flipY = false
        loadedTexture.needsUpdate = true

        setTexture((currentTexture) => {
          currentTexture?.dispose()
          return loadedTexture
        })
      },
      undefined,
      () => {
        if (!cancelled) setFailed(true)
      },
    )

    return () => {
      cancelled = true
    }
  }, [imageUrl])

  if (failed) {
    return (
      <group>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.28, 0.45]} />
          <meshBasicMaterial color="#160807" side={THREE.DoubleSide} />
        </mesh>

        <Text
          position={[0, 0, 0.045]}
          fontSize={0.024}
          color="#ff9a7a"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.22}
        >
          IMAGE ERROR
        </Text>
      </group>
    )
  }

  if (!texture) {
    return (
      <group>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.28, 0.45]} />
          <meshBasicMaterial color="#120806" side={THREE.DoubleSide} />
        </mesh>

        <Text
          position={[0, 0, 0.045]}
          fontSize={0.024}
          color="#d9b5ff"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.22}
        >
          SEALING IMAGE
        </Text>
      </group>
    )
  }

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
  onDragMove,
  onDragEnd,
}: {
  card: GrimoireCard
  x: number
  z: number
  selected: boolean
  onSelect: () => void
  onGenerateImage: (cardId: number) => Promise<boolean> | void
  onDragStart: (point: THREE.Vector3) => void
  onDragMove: (point: THREE.Vector3) => void
  onDragEnd: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const pointerDownPointRef = useRef<THREE.Vector3 | null>(null)
  const hasMovedRef = useRef(false)
  const cardGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const sigilRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const y = TABLE_Y + (selected || hovered ? 0.13 : 0.07)
  const cardGlowOpacity = selected ? 0.34 : hovered ? 0.22 : 0.085
  const cardGlowScale = selected ? 1.18 : hovered ? 1.1 : 1
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 2.4 + card.id * 0.73) * 0.5

    if (cardGlowMaterialRef.current) {
      cardGlowMaterialRef.current.opacity = cardGlowOpacity + pulse * (selected ? 0.09 : hovered ? 0.045 : 0.015)
    }

    if (sigilRingMaterialRef.current) {
      sigilRingMaterialRef.current.opacity = selected
        ? 0.82 + pulse * 0.16
        : hovered
          ? 0.58 + pulse * 0.12
          : 0.38 + pulse * 0.06
    }
  })

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

        const startPoint = event.point.clone()
        pointerDownPointRef.current = startPoint
        hasMovedRef.current = false

        target.setPointerCapture?.(event.pointerId)
        onDragStart(startPoint)
      }}
      onPointerMove={(event) => {
        if (!pointerDownPointRef.current) return

        event.stopPropagation()

        const moved = pointerDownPointRef.current.distanceTo(event.point)

        if (moved > 0.025) {
          hasMovedRef.current = true
          onDragMove(event.point.clone())
        }
      }}
      onPointerUp={(event) => {
        event.stopPropagation()

        const target = event.target as unknown as {
          releasePointerCapture?: (pointerId: number) => void
        }

        target.releasePointerCapture?.(event.pointerId)

        const moved = pointerDownPointRef.current
          ? pointerDownPointRef.current.distanceTo(event.point)
          : 0
        const wasDrag = moved > 0.18

        pointerDownPointRef.current = null
        hasMovedRef.current = false
        onDragEnd()

        if (wasDrag) return

        onSelect()

        if (
          card.artPrompt &&
          card.imageStatus !== 'ready' &&
          card.imageStatus !== 'generating'
        ) {
          console.info('[GRIMOIRE] Requesting ComfyUI image for card', {
            id: card.id,
            name: card.name,
            imageStatus: card.imageStatus,
            hasOnGenerateImage: typeof onGenerateImage,
          })

          const maybePromise = onGenerateImage(card.id)

          if (maybePromise && typeof maybePromise.then === 'function') {
            void maybePromise
              .then((ok) => {
                console.info('[GRIMOIRE] onGenerateImage resolved', {
                  id: card.id,
                  name: card.name,
                  ok,
                })
              })
              .catch((error) => {
                console.error('[GRIMOIRE] onGenerateImage rejected', error)
              })
          }
        }
      }}
      onPointerCancel={(event) => {
        event.stopPropagation()
        pointerDownPointRef.current = null
        hasMovedRef.current = false
        onDragEnd()
      }}
    >
      <mesh position={[0, 0, -0.018]} scale={cardGlowScale}>
        <planeGeometry args={[0.46, 0.68]} />
        <meshBasicMaterial
          ref={cardGlowMaterialRef}
          color={selected ? '#ffcf7c' : '#8a35ff'}
          transparent
          opacity={cardGlowOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[0.34, 0.54, 0.025]} />
        <meshStandardMaterial
          color={selected ? '#2a1208' : '#160909'}
          emissive={selected ? '#6a2a08' : hovered ? '#3a1608' : '#210c06'}
          emissiveIntensity={selected ? 0.82 : hovered ? 0.52 : 0.36}
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.28, 0.45]} />
        <meshBasicMaterial color={selected ? '#301408' : '#0b0605'} />
      </mesh>


      {isUsableGeneratedCardImageUrl(card.imageUrl) ? <CardFaceArt imageUrl={card.imageUrl} /> : null}

      <mesh position={[0, 0.12, 0.025]}>
        <ringGeometry args={[0.045, 0.062, 18]} />
        <meshBasicMaterial
          ref={sigilRingMaterialRef}
          color={selected ? '#ffcf7c' : hovered ? '#d99b58' : '#9a5a18'}
          transparent
          opacity={selected ? 0.95 : hovered ? 0.72 : 0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
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

  const armed = !disabled && (hovered || active)
  const accent = danger ? '#ff3d5a' : active ? '#f8f3df' : '#d8e8ff'
  const plaque = danger ? '#210609' : '#05070b'
  const glyphColor = disabled ? '#5e5048' : '#f8f3df'

  const trigger = () => {
    if (!disabled) onClick()
  }

  return (
    <group
      position={[x, y, z]}
      scale={armed ? 1.055 : 1}
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
    >
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[0.38, 0.38]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.24, 0.128]} />
        <meshBasicMaterial
          color={plaque}
          transparent
          opacity={disabled ? 0.18 : armed ? 0.74 : 0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.074, 0.01]}>
        <planeGeometry args={[0.29, 0.008]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.08 : armed ? 0.54 : 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -0.074, 0.01]}>
        <planeGeometry args={[0.23, 0.006]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.06 : armed ? 0.34 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-0.148, 0, 0.012]}>
        <planeGeometry args={[0.01, 0.12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.08 : armed ? 0.46 : 0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0.148, 0, 0.012]}>
        <planeGeometry args={[0.01, 0.12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.08 : armed ? 0.46 : 0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.34, 0.19]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={disabled ? 0.012 : armed ? 0.105 : 0.032}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.004, 0.045]}
        fontSize={0.076}
        color={glyphColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={disabled ? 0.42 : 0.95}
        maxWidth={0.18}
      >
        {sigil}
      </Text>

      {armed ? (
        <Text
          position={[0, -0.138, 0.044]}
          fontSize={0.018}
          color={accent}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.72}
          maxWidth={0.42}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}
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
  const spreadDockDrop = menuMode === 'spread' ? 0.46 : 0

  const dockPlanePosition: [number, number, number] = sideDock
    ? [1.54, TABLE_Y + 0.2 - spreadDockDrop, 0.22]
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
      y: TABLE_Y + 0.82 - spreadDockDrop - sideIndex * 0.26,
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
          opacity={sideDock ? 0.12 : 0.18}
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
  tarotSystem,
  tone,
  techLevel,
  artStyleFamily,
  artStyle,
  erosField,
  erosLevel,
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
  onTarotSystemChange,
  onToneChange,
  onTechLevelChange,
  onArtStyleFamilyChange,
  onArtStyleChange,
  onErosLevelChange,
  onIntentChange,
  onOracleQuestionChange,
  onBeginRitual,
  onConsultOracle,
  onClearOracle,
  onClearRitual,
  onGenerateCardImage,
  onCardSelect,
}: RitualWorkbenchProps) {
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

  const forgeEnergy: ForgeEnergy =
    loading || oracleLoading
      ? 'working'
      : hasDeck
        ? 'manifest'
        : hasOracleReading
          ? 'oracle'
          : menuMode === 'forge'
            ? 'tuning'
            : 'idle'

  const railColor =
    forgeEnergy === 'working'
      ? '#ffffff'
      : forgeEnergy === 'manifest'
        ? '#ffcf7c'
        : forgeEnergy === 'oracle'
          ? '#b98cff'
          : forgeEnergy === 'tuning'
            ? '#ff9a00'
            : '#8f6742'

  const railOpacity =
    forgeEnergy === 'working'
      ? 0.24
      : forgeEnergy === 'manifest'
        ? 0.18
        : forgeEnergy === 'tuning'
          ? 0.15
          : forgeEnergy === 'oracle'
            ? 0.16
            : 0.08

  return (
    <group position={[0, 0.82, -0.84]} scale={WORKBENCH_SCALE}>

      <group position={[0, 1.0, 0.055]}>
        <mesh position={[0, 0.62, 0]}>
          <planeGeometry args={[3.82, 0.008]} />
          <meshBasicMaterial
            color={railColor}
            transparent
            opacity={railOpacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, -0.62, 0]}>
          <planeGeometry args={[3.82, 0.006]} />
          <meshBasicMaterial
            color={railColor}
            transparent
            opacity={railOpacity * 0.62}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Text
          position={[0, 0.655, 0.035]}
          fontSize={0.026}
          color="#8f6742"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          ☿  FORGE VECTOR  ☉  CONFIGURATION CURRENT  ♀
        </Text>
      </group>

      <ImagePipelineStatus
        cards={cards}
        selectedCardId={selectedCardId}
        archiveMessage={archiveMessage}
      />
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
          color={railColor}
          transparent
          opacity={forgeEnergy === 'working' ? 0.13 : forgeEnergy === 'manifest' ? 0.105 : forgeEnergy === 'tuning' ? 0.09 : 0.065}
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

      <AltarChromeHardware railColor={railColor} forgeEnergy={forgeEnergy} />

      <AltarAstrolabeRings
        active={hasDeck || menuMode !== 'closed' || loading || oracleLoading || hasOracleReading}
        erosField={erosField}
        energy={forgeEnergy}
      />
      <TableHexagram
        active={hasDeck || loading || oracleLoading || hasOracleReading}
        energy={forgeEnergy}
      />

      <DeckTray count={cards.length} active={hasDeck} />

      <ForgeConfigReadout
        activeSubject={activeSubject}
        tarotSystem={tarotSystem}
        tone={tone}
        techLevel={techLevel}
        activeIntent={activeIntent}
        artStyleFamily={artStyleFamily}
        artStyle={artStyle}
        erosLevel={erosLevel}
        forgePhase={forgePhase}
        loading={loading || oracleLoading}
        canForge={canForge}
      />

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
            onDragMove={updateCardDrag}
            onDragEnd={endCardDrag}
            onGenerateImage={(cardId) => {
              console.info('[WORKBENCH] Forwarding image request to engine', { cardId })
              return onGenerateCardImage(cardId)
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
          tarotSystem={tarotSystem}
          tone={tone}
          techLevel={techLevel}
          activeIntent={activeIntent}
          artStyleFamily={artStyleFamily}
          artStyle={artStyle}
          erosLevel={erosLevel}
          loading={loading}
          canForge={canForge}
          onBeginRitual={() => void onBeginRitual()}
          onSubjectChange={onSubjectChange}
          onTarotSystemChange={onTarotSystemChange}
          onToneChange={onToneChange}
          onTechLevelChange={onTechLevelChange}
          onArtStyleFamilyChange={onArtStyleFamilyChange}
          onArtStyleChange={onArtStyleChange}
          onErosLevelChange={onErosLevelChange}
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
