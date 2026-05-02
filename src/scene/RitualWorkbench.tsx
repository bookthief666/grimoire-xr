import { useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
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

const TABLE_Y = 0.08
const WORKBENCH_SCALE = 0.48
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
const TRADITION_OPTIONS: Tradition[] = [
  'thelemic',
  'hermetic',
  'goetic',
  'tarot',
  'kabbalistic',
  'tantric',
  'chaos_magick',
]
const EROS_FIELD_OPTIONS: ErosField[] = ['Veiled', 'Charged', 'Ecstatic']

function shortText(value: string, max = 34) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

function optionLabel<T extends string>(
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value
}

function cycleString<T extends string>(values: ReadonlyArray<T>, current: T, direction: -1 | 1): T {
  const index = Math.max(0, values.findIndex((value) => value === current))
  return values[(index + direction + values.length) % values.length]
}

function cycleOption<T extends string>(
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>,
  current: T,
  direction: -1 | 1,
): T {
  const index = Math.max(0, options.findIndex((option) => option.value === current))
  return options[(index + direction + options.length) % options.length].value
}

function formatArchiveTime(value: string | null) {
  if (!value) return 'NO LOCAL SEAL'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).toUpperCase()
}

function AltarBar({
  a,
  b,
  color = '#ff8a00',
  opacity = 0.74,
  width = 0.02,
  yOffset = 0.03,
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

function FutureTechAltar({ active, energy }: { active: boolean; energy: ForgeEnergy }) {
  const seamRef = useRef<THREE.MeshBasicMaterial>(null)
  const veilRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const boost = energy === 'working' || energy === 'oracle' ? 0.26 : energy === 'manifest' ? 0.16 : 0
    if (seamRef.current) seamRef.current.opacity = 0.44 + boost + Math.sin(t * 2.25) * 0.1
    if (veilRef.current) veilRef.current.opacity = active ? 0.14 + Math.sin(t * 0.75) * 0.04 : 0.08
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y - 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[3.62, 2.08, 0.18]} />
        <meshStandardMaterial color="#080507" emissive="#180408" emissiveIntensity={0.5} roughness={0.34} metalness={0.86} />
      </mesh>
      <mesh position={[0, TABLE_Y - 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[3.42, 1.9, 0.05]} />
        <meshBasicMaterial
          ref={seamRef}
          color="#ff5a1f"
          transparent
          opacity={0.52}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, TABLE_Y + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[3.18, 1.68, 0.12]} />
        <meshStandardMaterial color="#0a0708" emissive="#24100b" emissiveIntensity={0.64} roughness={0.22} metalness={0.76} />
      </mesh>
      <mesh position={[0, TABLE_Y + 0.108, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.94, 1.42]} />
        <meshBasicMaterial
          ref={veilRef}
          color="#2a1614"
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[[-1.73, 0], [1.73, 0], [0, -0.98], [0, 0.98]].map(([x, z], index) => (
        <mesh key={`${x}-${z}`} position={[x, TABLE_Y + 0.035, z]} rotation={[-Math.PI / 2, 0, index < 2 ? 0 : Math.PI / 2]}>
          <boxGeometry args={[0.055, 1.78, 0.035]} />
          <meshStandardMaterial color="#6a4318" emissive="#3a1808" emissiveIntensity={0.58} roughness={0.22} metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function AltarSigil({ active, energy }: { active: boolean; energy: ForgeEnergy }) {
  const ringRef = useRef<THREE.MeshBasicMaterial>(null)
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)
  const points = useMemo<Vec2[]>(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI) / 3
      return [Math.cos(angle) * 0.78, Math.sin(angle) * 0.78]
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const boost = energy === 'working' ? 0.24 : energy === 'oracle' ? 0.18 : 0
    if (ringRef.current) ringRef.current.opacity = (active ? 0.5 : 0.28) + boost + Math.sin(t * 1.65) * 0.08
    if (coreRef.current) coreRef.current.opacity = active ? 0.14 + boost * 0.35 : 0.08
  })

  return (
    <group>
      <mesh position={[0, TABLE_Y + 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.93, 0.965, 96]} />
        <meshBasicMaterial
          ref={ringRef}
          color={energy === 'oracle' ? '#c9a6ff' : '#ffcf7c'}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, TABLE_Y + 0.027, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 72]} />
        <meshBasicMaterial
          ref={coreRef}
          color="#ff3b16"
          transparent
          opacity={0.11}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <AltarBar a={points[0]} b={points[2]} color="#ffcf7c" width={0.028} opacity={0.9} />
      <AltarBar a={points[2]} b={points[4]} color="#ff8a00" width={0.028} opacity={0.82} />
      <AltarBar a={points[4]} b={points[0]} color="#ffcf7c" width={0.028} opacity={0.9} />
      <AltarBar a={points[1]} b={points[3]} color="#ff3b16" width={0.024} opacity={0.74} />
      <AltarBar a={points[3]} b={points[5]} color="#ff3b16" width={0.024} opacity={0.74} />
      <AltarBar a={points[5]} b={points[1]} color="#ff3b16" width={0.024} opacity={0.74} />
      <AltarBar a={[0, -0.86]} b={[0, 0.86]} color="#ffe1a3" width={0.014} opacity={0.52} />
      <Text position={[0, TABLE_Y + 0.075, 0.02]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.05} color="#ffcf7c" anchorX="center" anchorY="middle" fillOpacity={0.78}>
        93
      </Text>
    </group>
  )
}

function InstrumentButton({
  sigil,
  label,
  x,
  y,
  z,
  active = false,
  disabled = false,
  danger = false,
  vertical = false,
  onClick,
}: {
  sigil: string
  label: string
  x: number
  y: number
  z: number
  active?: boolean
  disabled?: boolean
  danger?: boolean
  vertical?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const railRef = useRef<THREE.MeshBasicMaterial>(null)
  const glowColor = danger ? '#ff3030' : active ? '#ffcf7c' : '#ff8a00'
  const textColor = disabled ? '#5f4932' : hovered || active ? '#fff0c0' : '#d99b58'

  useFrame(({ clock }) => {
    if (!railRef.current) return
    const pulse = hovered || active ? Math.sin(clock.getElapsedTime() * 3) * 0.14 : 0
    railRef.current.opacity = disabled ? 0.08 : 0.36 + pulse + (active ? 0.2 : 0)
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
        const target = event.target as unknown as { setPointerCapture?: (pointerId: number) => void }
        target.setPointerCapture?.(event.pointerId)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()
        const target = event.target as unknown as { releasePointerCapture?: (pointerId: number) => void }
        target.releasePointerCapture?.(event.pointerId)
        trigger()
      }}
    >
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[0.54, 0.54]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[vertical ? 0.14 : 0.28, vertical ? 0.28 : 0.14, 0.026]} />
        <meshStandardMaterial
          color={disabled ? '#050302' : active ? '#271007' : '#100706'}
          emissive={danger ? '#3a0505' : active ? '#3a1808' : '#160806'}
          emissiveIntensity={0.42}
          transparent
          opacity={disabled ? 0.22 : hovered || active ? 0.72 : 0.52}
          roughness={0.3}
          metalness={0.76}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[vertical ? 0.19 : 0.36, 0.014]} />
        <meshBasicMaterial
          ref={railRef}
          color={glowColor}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Text position={[0, 0.002, 0.046]} fontSize={0.082} color={textColor} anchorX="center" anchorY="middle" maxWidth={0.22}>
        {sigil}
      </Text>
      {hovered ? (
        <Text position={[0, vertical ? -0.28 : -0.25, 0.052]} fontSize={0.031} color="#ffd18a" anchorX="center" anchorY="middle" maxWidth={0.62}>
          {label}
        </Text>
      ) : null}
    </group>
  )
}

function MiniButton({
  label,
  x,
  y,
  width = 0.5,
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
  return (
    <group
      position={[x, y, 0.08]}
      scale={hovered && !disabled ? 1.04 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onPointerUp={(event) => {
        event.stopPropagation()
        if (!disabled) onClick()
      }}
    >
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width + 0.24, 0.34]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <boxGeometry args={[width, 0.11, 0.018]} />
        <meshStandardMaterial
          color={disabled ? '#080505' : '#180a07'}
          emissive={hovered ? '#371507' : '#160805'}
          emissiveIntensity={0.48}
          transparent
          opacity={disabled ? 0.28 : 0.72}
          roughness={0.24}
          metalness={0.75}
        />
      </mesh>
      <Text position={[0, 0.002, 0.052]} fontSize={0.035} color={disabled ? '#6d5135' : hovered ? '#ffffff' : '#ffd18a'} anchorX="center" anchorY="middle" maxWidth={width - 0.04}>
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
  onDragMove,
  onDragEnd,
  onGenerateImage,
}: {
  card: GrimoireCard
  x: number
  z: number
  selected: boolean
  onSelect: () => void
  onDragStart: (point: THREE.Vector3) => void
  onDragMove: (point: THREE.Vector3) => void
  onDragEnd: () => void
  onGenerateImage: (cardId: number) => void
}) {
  const [hovered, setHovered] = useState(false)
  const accent = selected ? '#ffcf7c' : hovered ? '#ff9a00' : '#8f6742'

  return (
    <group position={[x, TABLE_Y + 0.14, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
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
          const target = event.target as unknown as { setPointerCapture?: (pointerId: number) => void }
          target.setPointerCapture?.(event.pointerId)
          onDragStart(event.point.clone())
        }}
        onPointerMove={(event) => {
          event.stopPropagation()
          onDragMove(event.point.clone())
        }}
        onPointerUp={(event) => {
          event.stopPropagation()
          const target = event.target as unknown as { releasePointerCapture?: (pointerId: number) => void }
          target.releasePointerCapture?.(event.pointerId)
          onDragEnd()
          onSelect()
        }}
      >
        <boxGeometry args={[0.36, 0.56, 0.026]} />
        <meshStandardMaterial color={selected ? '#251008' : '#130909'} emissive={selected ? '#4a1a08' : '#180907'} emissiveIntensity={0.58} roughness={0.36} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.4, 0.6]} />
        <meshBasicMaterial color={accent} transparent opacity={selected ? 0.18 : 0.07} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0.19, 0.04]} fontSize={0.037} color="#ffd18a" anchorX="center" anchorY="middle" maxWidth={0.31}>
        {shortText(card.name, 22)}
      </Text>
      <Text position={[0, 0.045, 0.04]} fontSize={0.082} color={accent} anchorX="center" anchorY="middle" maxWidth={0.28}>
        {shortText(card.sigil, 4)}
      </Text>
      <Text position={[0, -0.145, 0.04]} fontSize={0.024} color="#bfa788" anchorX="center" anchorY="middle" maxWidth={0.3}>
        {shortText(card.metadata.planet, 18)} / {shortText(card.metadata.element, 18)}
      </Text>
      {selected ? (
        <MiniButton label="IMAGE SEAL" x={0} y={-0.275} width={0.34} onClick={() => onGenerateImage(card.id)} />
      ) : null}
    </group>
  )
}

function Dock({
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
  const sideDock = menuMode !== 'closed'
  const spreadDockDrop = menuMode === 'spread' ? 0.46 : 0
  const positions = sideDock
    ? [0, 1, 2, 3, 4, 5].map((index) => ({ x: 1.54, y: TABLE_Y + 0.82 - spreadDockDrop - index * 0.26, z: 0.22 }))
    : [-0.82, -0.49, -0.16, 0.17, 0.5, 0.83].map((x) => ({ x, y: TABLE_Y + 0.42, z: 0.94 }))
  const dockArgs: [number, number, number] = sideDock ? [0.36, 1.82, 0.02] : [2.35, 0.16, 0.02]

  return (
    <group>
      <mesh position={sideDock ? [1.54, TABLE_Y + 0.18 - spreadDockDrop, 0.22] : [0, TABLE_Y + 0.405, 0.94]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={dockArgs} />
        <meshStandardMaterial color="#070404" emissive="#1a0906" emissiveIntensity={0.32} transparent opacity={0.42} roughness={0.28} metalness={0.72} />
      </mesh>
      <InstrumentButton sigil="✶" label={menuMode === 'forge' ? 'Seal Forge' : 'Configure Forge'} {...positions[0]} vertical={sideDock} active={menuMode === 'forge'} onClick={onToggleForge} />
      {menuMode !== 'forge' ? (
        <>
          <InstrumentButton sigil="⌬" label={menuMode === 'spread' ? 'Seal Spread Field' : 'Reveal Spread Field'} {...positions[1]} vertical={sideDock} active={menuMode === 'spread'} onClick={onToggleSpread} />
          <InstrumentButton sigil={oracleLoading ? '…' : '☉'} label={oracleLoading ? 'Oracle Awakening' : 'Invoke Oracle'} {...positions[2]} vertical={sideDock} active={oracleLoading} disabled={!canConsult} onClick={onConsultOracle} />
          <InstrumentButton sigil={hasSavedRitual ? '◈' : '◇'} label={menuMode === 'archive' ? 'Seal Archive Tablet' : 'Open Archive Tablet'} {...positions[3]} vertical={sideDock} active={menuMode === 'archive' || hasSavedRitual} onClick={onToggleArchive} />
          <InstrumentButton sigil="✕" label="Clear Oracle Tablet" {...positions[4]} vertical={sideDock} disabled={!hasOracleReading} onClick={onClearOracle} />
          <InstrumentButton sigil="↺" label="Banish Ritual" {...positions[5]} vertical={sideDock} danger onClick={onReset} />
        </>
      ) : null}
    </group>
  )
}

function ForgePanel({
  subject,
  tradition,
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
  onSubjectChange,
  onTraditionChange,
  onTarotSystemChange,
  onToneChange,
  onTechLevelChange,
  onArtStyleFamilyChange,
  onArtStyleChange,
  onErosFieldChange,
  onErosLevelChange,
  onIntentChange,
  onOracleQuestionChange,
  onBeginRitual,
}: {
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
}) {
  const artOptions = getStylesByFamily(artStyleFamily).map((style) => ({ value: style.id as ArtStyle, label: style.label }))
  const rows = [
    { label: 'SUBJECT', value: subject || '—', action: () => onSubjectChange(cycleString(SUBJECT_OPTIONS, subject || SUBJECT_OPTIONS[0], 1)) },
    { label: 'TRADITION', value: tradition, action: () => onTraditionChange(cycleString(TRADITION_OPTIONS, tradition, 1)) },
    { label: 'TAROT', value: optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem), action: () => onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, 1)) },
    { label: 'TONE', value: optionLabel(TONE_OPTIONS, tone), action: () => onToneChange(cycleOption(TONE_OPTIONS, tone, 1)) },
    { label: 'TECH', value: optionLabel(TECH_LEVEL_OPTIONS, techLevel), action: () => onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, 1)) },
    { label: 'FAMILY', value: optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily), action: () => onArtStyleFamilyChange(cycleOption(ART_STYLE_FAMILY_OPTIONS, artStyleFamily, 1)) },
    { label: 'STYLE', value: optionLabel(artOptions, artStyle), action: () => onArtStyleChange(cycleOption(artOptions, artStyle, 1)) },
    { label: 'EROS FIELD', value: erosField, action: () => onErosFieldChange(cycleString(EROS_FIELD_OPTIONS, erosField, 1)) },
    { label: 'EROS LEVEL', value: optionLabel(EROS_LEVEL_OPTIONS, erosLevel), action: () => onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, 1)) },
    { label: 'INTENT', value: intent || '—', action: () => {
      const next = cycleString(INTENT_OPTIONS, intent || INTENT_OPTIONS[0], 1)
      onIntentChange(next)
      onOracleQuestionChange(next)
    } },
  ]

  return (
    <group position={[-1.05, 1.08, 0.08]} scale={0.86}>
      <mesh>
        <boxGeometry args={[1.76, 1.72, 0.035]} />
        <meshStandardMaterial color="#070405" emissive="#1b0906" emissiveIntensity={0.42} transparent opacity={0.82} roughness={0.28} metalness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0.72, 0.05]} fontSize={0.044} color="#ffd18a" anchorX="center" anchorY="middle" maxWidth={1.35}>
        FORGE INSTRUMENT TABLET
      </Text>
      {rows.map((row, index) => (
        <group key={row.label} position={[0, 0.54 - index * 0.108, 0.06]} onPointerUp={(event) => {
          event.stopPropagation()
          row.action()
        }}>
          <mesh>
            <planeGeometry args={[1.48, 0.08]} />
            <meshBasicMaterial color="#140807" transparent opacity={0.46} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <Text position={[-0.68, 0, 0.024]} fontSize={0.024} color="#9f744b" anchorX="left" anchorY="middle" maxWidth={0.44}>
            {row.label}
          </Text>
          <Text position={[0.13, 0, 0.024]} fontSize={0.028} color="#f2d4a2" anchorX="center" anchorY="middle" maxWidth={0.86}>
            {shortText(row.value, 36)}
          </Text>
        </group>
      ))}
      <MiniButton label={loading ? 'FORGING' : `BEGIN / ${forgePhase.toUpperCase()}`} x={0} y={-0.68} width={0.96} disabled={loading || subject.trim().length < 2} onClick={() => { void onBeginRitual() }} />
    </group>
  )
}

function ArchivePanel({
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
    <group position={[-1.05, 0.98, 0.08]} scale={0.94}>
      <mesh>
        <boxGeometry args={[1.48, 1.0, 0.034]} />
        <meshStandardMaterial color="#070405" emissive="#1b0906" emissiveIntensity={0.4} transparent opacity={0.84} roughness={0.26} metalness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0.36, 0.05]} fontSize={0.045} color="#ffd18a" anchorX="center" anchorY="middle" maxWidth={1.1}>
        ARCHIVE OBSIDIAN TABLET
      </Text>
      <Text position={[0, 0.18, 0.05]} fontSize={0.03} color={hasSavedRitual ? '#d9b5ff' : '#9f744b'} anchorX="center" anchorY="middle" maxWidth={1.18}>
        {hasSavedRitual ? 'LOCAL MEMORY SEALED' : 'NO RITUAL SEALED'}
      </Text>
      <Text position={[0, 0.04, 0.05]} fontSize={0.027} color="#bfa788" anchorX="center" anchorY="middle" maxWidth={1.18}>
        {formatArchiveTime(lastSavedAt)}
      </Text>
      <MiniButton label="SEAL CURRENT" x={-0.36} y={-0.18} width={0.5} onClick={() => { onSaveRitual() }} />
      <MiniButton label="LOAD LAST" x={0.28} y={-0.18} width={0.5} disabled={!hasSavedRitual} onClick={() => { onLoadArchive() }} />
      <MiniButton label="CLEAR SEAL" x={-0.04} y={-0.42} width={0.68} disabled={!hasSavedRitual} onClick={onClearArchive} />
      <Text position={[0, -0.56, 0.05]} fontSize={0.024} color="#8f6742" anchorX="center" anchorY="middle" maxWidth={1.22}>
        {archiveMessage ?? 'Deck, selection, and ritual configuration persist locally.'}
      </Text>
    </group>
  )
}

function StatusTablet({
  cards,
  selectedCardId,
  oracleQuestion,
  oracleLoading,
  hasOracleReading,
  archiveMessage,
}: {
  cards: GrimoireCard[]
  selectedCardId: number | null
  oracleQuestion: string
  oracleLoading: boolean
  hasOracleReading: boolean
  archiveMessage: string | null
}) {
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0] ?? null
  const readyCount = cards.filter((card) => card.imageStatus === 'ready').length
  const statusLine = oracleLoading ? 'ORACLE TRANSMISSION ACTIVE' : hasOracleReading ? 'ORACLE READING SEALED' : 'AWAITING RITUAL VECTOR'

  return (
    <group position={[1.1, 1.05, 0.08]} scale={0.82}>
      <mesh>
        <boxGeometry args={[1.6, 0.86, 0.032]} />
        <meshStandardMaterial color="#070405" emissive="#180806" emissiveIntensity={0.38} transparent opacity={0.82} roughness={0.29} metalness={0.68} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0.34, 0.05]} fontSize={0.04} color="#ffd18a" anchorX="center" anchorY="middle" maxWidth={1.2}>
        READOUT TALISMAN
      </Text>
      <Text position={[-0.68, 0.18, 0.05]} fontSize={0.029} color="#d8bf9b" anchorX="left" anchorY="middle" maxWidth={1.3}>
        CARD: {selectedCard ? shortText(selectedCard.name, 34) : 'NONE'}
      </Text>
      <Text position={[-0.68, 0.05, 0.05]} fontSize={0.029} color="#ffd18a" anchorX="left" anchorY="middle" maxWidth={1.3}>
        IMAGES READY: {readyCount}/{cards.length}
      </Text>
      <Text position={[-0.68, -0.08, 0.05]} fontSize={0.029} color={hasOracleReading ? '#d9b5ff' : '#bfa788'} anchorX="left" anchorY="middle" maxWidth={1.3}>
        {statusLine}
      </Text>
      <Text position={[-0.68, -0.22, 0.05]} fontSize={0.025} color="#bfa788" anchorX="left" anchorY="middle" maxWidth={1.3}>
        Q: {shortText(oracleQuestion || archiveMessage || 'No oracle question set.', 58)}
      </Text>
    </group>
  )
}

export function RitualWorkbench({
  cards,
  selectedCardId,
  subject,
  tradition,
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
  onTraditionChange,
  onTarotSystemChange,
  onToneChange,
  onTechLevelChange,
  onArtStyleFamilyChange,
  onArtStyleChange,
  onErosFieldChange,
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

  const forgeEnergy: ForgeEnergy = oracleLoading
    ? 'oracle'
    : loading || forgePhase === 'forging'
      ? 'working'
      : forgePhase === 'ready'
        ? 'manifest'
        : menuMode !== 'closed'
          ? 'tuning'
          : 'idle'

  const displayedCards = hasDeck ? cards.slice(0, 4) : cards.slice(0, 3)
  const spreadSlots = useMemo(() => [
    { x: -0.58, z: -0.34, label: 'ROOT' },
    { x: 0, z: -0.12, label: 'WILL' },
    { x: 0.58, z: -0.34, label: 'ORDEAL' },
    { x: 0, z: 0.42, label: 'CROWN' },
  ], [])

  const startCardDrag = (cardId: number, point: THREE.Vector3) => {
    setDragState({
      cardId,
      startPoint: point.clone(),
      startOffset: cardOffsets[cardId] ?? [0, 0],
    })
  }

  const updateCardDrag = (point: THREE.Vector3) => {
    if (!dragState) return
    const dx = point.x - dragState.startPoint.x
    const dz = point.z - dragState.startPoint.z
    setCardOffsets((previous) => ({
      ...previous,
      [dragState.cardId]: [dragState.startOffset[0] + dx, dragState.startOffset[1] + dz],
    }))
  }

  const endCardDrag = () => {
    setDragState(null)
  }

  const canConsult = hasDeck && !oracleLoading && !loading
  const altarActive = hasDeck || loading || oracleLoading || hasOracleReading || menuMode !== 'closed'
  const erosGlyph = erosField === 'Ecstatic' ? '♀ ECSTATIC FIELD' : erosField === 'Charged' ? '♀ CHARGED FIELD' : '♀ VEILED FIELD'

  return (
    <group position={[0, 0.32, -1.08]} scale={WORKBENCH_SCALE}>
      <FutureTechAltar active={altarActive} energy={forgeEnergy} />
      <AltarSigil active={altarActive} energy={forgeEnergy} />

      <Text position={[0, TABLE_Y + 0.17, 0.82]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.034} color="#bfa788" anchorX="center" anchorY="middle" maxWidth={1.6}>
        {erosGlyph} // {String(tradition).toUpperCase()} TEMPLE VECTOR
      </Text>

      {spreadSlots.map((slot, index) => (
        <group key={slot.label} position={[slot.x, TABLE_Y + 0.108, slot.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[0.42, 0.08]} />
            <meshBasicMaterial color={index < displayedCards.length ? '#ff8a00' : '#5a3a16'} transparent opacity={menuMode === 'spread' || hasDeck ? 0.18 : 0.05} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          <Text position={[0, 0, 0.03]} fontSize={0.024} color="#8f6742" anchorX="center" anchorY="middle" maxWidth={0.4}>
            {slot.label}
          </Text>
        </group>
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
            onDragMove={updateCardDrag}
            onDragEnd={endCardDrag}
            onGenerateImage={(cardId) => { void onGenerateCardImage(cardId) }}
            onSelect={() => onCardSelect(card, [x, 1.18, z - 1.0], 0)}
          />
        )
      })}

      {dragState ? (
        <mesh
          position={[0, TABLE_Y + 0.19, 0]}
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
          <planeGeometry args={[3.7, 2.2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}

      {menuMode === 'forge' ? (
        <ForgePanel
          subject={subject}
          tradition={tradition}
          tarotSystem={tarotSystem}
          tone={tone}
          techLevel={techLevel}
          artStyleFamily={artStyleFamily}
          artStyle={artStyle}
          erosField={erosField}
          erosLevel={erosLevel}
          intent={intent}
          forgePhase={forgePhase}
          loading={loading}
          onSubjectChange={onSubjectChange}
          onTraditionChange={onTraditionChange}
          onTarotSystemChange={onTarotSystemChange}
          onToneChange={onToneChange}
          onTechLevelChange={onTechLevelChange}
          onArtStyleFamilyChange={onArtStyleFamilyChange}
          onArtStyleChange={onArtStyleChange}
          onErosFieldChange={onErosFieldChange}
          onErosLevelChange={onErosLevelChange}
          onIntentChange={onIntentChange}
          onOracleQuestionChange={onOracleQuestionChange}
          onBeginRitual={onBeginRitual}
        />
      ) : null}

      {menuMode === 'archive' ? (
        <ArchivePanel
          hasSavedRitual={hasSavedRitual}
          lastSavedAt={lastSavedAt}
          archiveMessage={archiveMessage}
          onSaveRitual={onSaveRitual}
          onLoadArchive={onLoadArchive}
          onClearArchive={onClearArchive}
        />
      ) : null}

      <StatusTablet
        cards={cards}
        selectedCardId={selectedCardId}
        oracleQuestion={oracleQuestion}
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
        archiveMessage={archiveMessage}
      />

      <Dock
        menuMode={menuMode}
        oracleLoading={oracleLoading}
        canConsult={canConsult}
        hasOracleReading={hasOracleReading}
        hasSavedRitual={hasSavedRitual}
        onToggleForge={() => setMenuMode((mode) => (mode === 'forge' ? 'closed' : 'forge'))}
        onToggleSpread={() => setMenuMode((mode) => (mode === 'spread' ? 'closed' : 'spread'))}
        onToggleArchive={() => setMenuMode((mode) => (mode === 'archive' ? 'closed' : 'archive'))}
        onConsultOracle={() => { void onConsultOracle() }}
        onClearOracle={onClearOracle}
        onReset={onClearRitual}
      />
    </group>
  )
}
