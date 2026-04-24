import { useMemo, useState, type ReactNode } from 'react'
import { Text } from '@react-three/drei'
import type { ForgePhase, TechLevel, Tone, Tradition } from '../types/grimoire'

type Option<T extends string> = {
  value: T
  label: string
}

type RitualConsoleProps = {
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
}

const SUBJECT_OPTIONS = [
  'Faust',
  'True Will',
  'The Shadow',
  'Creative Power',
  'Love Under Will',
  'Money / Survival',
  'Fear / Ordeal',
  'The Holy Guardian Angel',
]

const INTENT_OPTIONS = [
  'What is the hidden cost?',
  'What must I do next?',
  'What force is blocking manifestation?',
  'What should be disciplined?',
  'What is the ordeal teaching?',
  'What is the initiatory opportunity?',
]

const TRADITION_OPTIONS: Option<Tradition>[] = [
  { value: 'thelemic', label: 'Thelemic' },
  { value: 'hermetic', label: 'Hermetic' },
  { value: 'tarot', label: 'Tarot' },
  { value: 'kabbalistic', label: 'Kabbalistic' },
  { value: 'tantric', label: 'Tantric' },
  { value: 'chaos_magick', label: 'Chaos Magick' },
  { value: 'goetic', label: 'Goetic' },
]

const TONE_OPTIONS: Option<Tone>[] = [
  { value: 'oracular', label: 'Oracular' },
  { value: 'scholarly', label: 'Scholarly' },
  { value: 'visionary', label: 'Visionary' },
  { value: 'severe', label: 'Severe' },
  { value: 'ecstatic', label: 'Ecstatic' },
]

const TECH_LEVEL_OPTIONS: Option<TechLevel>[] = [
  { value: 'neophyte', label: 'Neophyte' },
  { value: 'adept', label: 'Adept' },
  { value: 'magus', label: 'Magus' },
]

function indexOfValue<T extends string>(options: Option<T>[], value: T) {
  return Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
}

function previousIndex(current: number, count: number) {
  if (count <= 1) return 0
  return (current - 1 + count) % count
}

function nextIndex(current: number, count: number) {
  if (count <= 1) return 0
  return (current + 1) % count
}

function cycleArrayValue(values: string[], current: string, direction: -1 | 1) {
  const index = Math.max(0, values.findIndex((value) => value === current))
  const next =
    direction === 1
      ? nextIndex(index, values.length)
      : previousIndex(index, values.length)

  return values[next]
}

function cycleOptionValue<T extends string>(
  options: Option<T>[],
  current: T,
  direction: -1 | 1,
) {
  const index = indexOfValue(options, current)
  const next =
    direction === 1
      ? nextIndex(index, options.length)
      : previousIndex(index, options.length)

  return options[next].value
}

function shortText(value: string, max = 44) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

function PanelFrame({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[2.45, 2.95]} />
        <meshStandardMaterial
          color="#120606"
          emissive="#2a0a0a"
          emissiveIntensity={0.42}
          transparent
          opacity={0.94}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[2.53, 3.03]} />
        <meshBasicMaterial color="#ffb000" transparent opacity={0.12} />
      </mesh>

      <mesh position={[0, 1.36, 0.014]}>
        <planeGeometry args={[2.24, 0.26]} />
        <meshBasicMaterial color="#2a0a0a" transparent opacity={0.82} />
      </mesh>

      <Text
        position={[-1.02, 1.27, 0.03]}
        anchorX="left"
        anchorY="top"
        fontSize={0.074}
        color="#ffcf7c"
        maxWidth={2.04}
      >
        {title}
      </Text>

      {children}
    </group>
  )
}

function RayButton({
  label,
  position,
  width = 0.72,
  disabled = false,
  danger = false,
  primary = false,
  onClick,
}: {
  label: string
  position: [number, number, number]
  width?: number
  disabled?: boolean
  danger?: boolean
  primary?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const active = !disabled
  const baseColor = danger ? '#3a0808' : primary ? '#4a1608' : '#201010'
  const glowColor = danger ? '#ff5050' : primary ? '#ffcf7c' : '#d89b6b'

  return (
    <group
      position={position}
      scale={hovered && active ? 1.06 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (active) setHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (active) onClick()
      }}
    >
      <mesh>
        <planeGeometry args={[width, 0.2]} />
        <meshBasicMaterial
          color={active ? baseColor : '#130707'}
          transparent
          opacity={active ? 0.94 : 0.44}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[width + 0.08, 0.28]} />
        <meshBasicMaterial
          color={hovered && active ? glowColor : '#8f5b00'}
          transparent
          opacity={hovered && active ? 0.32 : 0.14}
        />
      </mesh>

      <Text
        position={[0, 0.004, 0.018]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.052}
        color={active ? (hovered ? '#ffffff' : '#ffcf7c') : '#6f5435'}
        maxWidth={width - 0.08}
      >
        {label}
      </Text>

      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[width + 0.22, 0.42]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function ValueStepper({
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
        position={[-1.02, 0.1, 0.01]}
        anchorX="left"
        anchorY="middle"
        fontSize={0.045}
        color="#c58a53"
        maxWidth={0.74}
      >
        {label.toUpperCase()}
      </Text>

      <RayButton
        label="‹"
        position={[-0.45, 0, 0.01]}
        width={0.25}
        onClick={onPrevious}
      />

      <mesh position={[0.2, 0, 0]}>
        <planeGeometry args={[1.08, 0.23]} />
        <meshBasicMaterial color="#160909" transparent opacity={0.92} />
      </mesh>

      <Text
        position={[0.2, 0.004, 0.018]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.05}
        color="#f2d4a2"
        maxWidth={0.98}
      >
        {shortText(value, 34)}
      </Text>

      <RayButton
        label="›"
        position={[0.85, 0, 0.01]}
        width={0.25}
        onClick={onNext}
      />
    </group>
  )
}

export function InWorldRitualConsole({
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
}: RitualConsoleProps) {
  const selectedSubject = useMemo(() => {
    return SUBJECT_OPTIONS.includes(subject) ? subject : SUBJECT_OPTIONS[0]
  }, [subject])

  const selectedIntent = useMemo(() => {
    return INTENT_OPTIONS.includes(intent) ? intent : INTENT_OPTIONS[0]
  }, [intent])

  const traditionLabel =
    TRADITION_OPTIONS.find((option) => option.value === tradition)?.label ?? tradition

  const toneLabel =
    TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone

  const techLevelLabel =
    TECH_LEVEL_OPTIONS.find((option) => option.value === techLevel)?.label ?? techLevel

  const canBegin = !loading && selectedSubject.trim().length >= 2
  const canConsult = hasDeck && !oracleLoading && oracleQuestion.trim().length >= 3

  return (
    <group position={[0, 1.65, 1.05]} rotation={[0, Math.PI, 0]}>
      <PanelFrame title="VR RITUAL CONSOLE">
        <Text
          position={[-1.02, 1.03, 0.04]}
          anchorX="left"
          anchorY="top"
          fontSize={0.046}
          color="#d8bf9b"
          maxWidth={2.04}
          lineHeight={1.24}
        >
          Use the ray pointer to configure and begin the working without leaving VR.
        </Text>

        <ValueStepper
          label="Subject"
          value={selectedSubject}
          y={0.68}
          onPrevious={() => {
            onSubjectChange(cycleArrayValue(SUBJECT_OPTIONS, selectedSubject, -1))
          }}
          onNext={() => {
            onSubjectChange(cycleArrayValue(SUBJECT_OPTIONS, selectedSubject, 1))
          }}
        />

        <ValueStepper
          label="Tradition"
          value={traditionLabel}
          y={0.38}
          onPrevious={() => {
            onTraditionChange(cycleOptionValue(TRADITION_OPTIONS, tradition, -1))
          }}
          onNext={() => {
            onTraditionChange(cycleOptionValue(TRADITION_OPTIONS, tradition, 1))
          }}
        />

        <ValueStepper
          label="Tone"
          value={toneLabel}
          y={0.08}
          onPrevious={() => {
            onToneChange(cycleOptionValue(TONE_OPTIONS, tone, -1))
          }}
          onNext={() => {
            onToneChange(cycleOptionValue(TONE_OPTIONS, tone, 1))
          }}
        />

        <ValueStepper
          label="Level"
          value={techLevelLabel}
          y={-0.22}
          onPrevious={() => {
            onTechLevelChange(cycleOptionValue(TECH_LEVEL_OPTIONS, techLevel, -1))
          }}
          onNext={() => {
            onTechLevelChange(cycleOptionValue(TECH_LEVEL_OPTIONS, techLevel, 1))
          }}
        />

        <ValueStepper
          label="Intent"
          value={selectedIntent}
          y={-0.52}
          onPrevious={() => {
            const nextIntent = cycleArrayValue(INTENT_OPTIONS, selectedIntent, -1)
            onIntentChange(nextIntent)
            onOracleQuestionChange(nextIntent)
          }}
          onNext={() => {
            const nextIntent = cycleArrayValue(INTENT_OPTIONS, selectedIntent, 1)
            onIntentChange(nextIntent)
            onOracleQuestionChange(nextIntent)
          }}
        />

        <RayButton
          label={loading ? 'FORGING…' : 'BEGIN RITUAL'}
          position={[-0.56, -0.88, 0.05]}
          width={0.92}
          primary
          disabled={!canBegin}
          onClick={() => {
            onSubjectChange(selectedSubject)
            onIntentChange(selectedIntent)
            onOracleQuestionChange(selectedIntent)
            void onBeginRitual()
          }}
        />

        <RayButton
          label={oracleLoading ? 'CONSULTING…' : 'CONSULT ORACLE'}
          position={[0.56, -0.88, 0.05]}
          width={0.92}
          primary
          disabled={!canConsult}
          onClick={() => {
            void onConsultOracle()
          }}
        />

        <RayButton
          label="CLEAR ORACLE"
          position={[-0.56, -1.17, 0.05]}
          width={0.92}
          disabled={!hasOracleReading}
          onClick={onClearOracle}
        />

        <RayButton
          label="CLEAR RITUAL"
          position={[0.56, -1.17, 0.05]}
          width={0.92}
          danger
          disabled={loading}
          onClick={onClearRitual}
        />

        <Text
          position={[0, -1.38, 0.04]}
          anchorX="center"
          anchorY="middle"
          fontSize={0.043}
          color={loading || oracleLoading ? '#ffcf7c' : '#8b6a45'}
          maxWidth={2.0}
        >
          {`PHASE: ${forgePhase.toUpperCase()} // DECK: ${hasDeck ? 'ACTIVE' : 'NONE'} // ORACLE: ${
            hasOracleReading ? 'READING' : 'EMPTY'
          }`}
        </Text>
      </PanelFrame>
    </group>
  )
}
