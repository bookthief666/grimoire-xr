import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  TECH_LEVEL_OPTIONS,
  TONE_OPTIONS,
  TRADITION_OPTIONS,
} from '../constants/ritualOptions'
import type { ForgePhase, TechLevel, Tone, Tradition } from '../types/grimoire'

type Option<T extends string> = {
  readonly value: T
  readonly label: string
}

type EditableField = 'subject' | 'intent' | 'oracleQuestion'

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

const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

function indexOfValue<T extends string>(
  options: ReadonlyArray<Option<T>>,
  value: T,
) {
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
  options: ReadonlyArray<Option<T>>,
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

function shortText(value: string, max = 40) {
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
        <planeGeometry args={[1.9, 2.34]} />
        <meshStandardMaterial
          color="#120606"
          emissive="#2a0a0a"
          emissiveIntensity={0.38}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[1.98, 2.42]} />
        <meshBasicMaterial
          color="#ffb000"
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 1.03, 0.014]}>
        <planeGeometry args={[1.68, 0.2]} />
        <meshBasicMaterial
          color="#2a0a0a"
          transparent
          opacity={0.74}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[-0.78, 0.96, 0.03]}
        anchorX="left"
        anchorY="top"
        fontSize={0.052}
        color="#ffcf7c"
        maxWidth={1.5}
      >
        {title}
      </Text>

      {children}
    </group>
  )
}

function MiniConsoleFrame({
  children,
}: {
  children: ReactNode
}) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[1.1, 0.5]} />
        <meshStandardMaterial
          color="#120606"
          emissive="#2a0a0a"
          emissiveIntensity={0.36}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[1.18, 0.58]} />
        <meshBasicMaterial
          color="#ffb000"
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {children}
    </group>
  )
}

function RayButton({
  label,
  position,
  width = 0.54,
  disabled = false,
  danger = false,
  primary = false,
  targetLabel,
  disabledLabel,
  onClick,
  onTargetChange,
}: {
  label: string
  position: [number, number, number]
  width?: number
  disabled?: boolean
  danger?: boolean
  primary?: boolean
  targetLabel?: string
  disabledLabel?: string
  onClick: () => void
  onTargetChange: (label: string | null) => void
}) {
  const [hovered, setHovered] = useState(false)

  const active = !disabled
  const baseColor = danger ? '#3a0808' : primary ? '#4a1608' : '#201010'
  const glowColor = danger ? '#ff5050' : primary ? '#ffcf7c' : '#d89b6b'
  const displayedLabel = disabled && disabledLabel ? disabledLabel : label

  return (
    <group
      position={position}
      scale={hovered && active ? 1.06 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        onTargetChange(targetLabel ?? label)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setHovered(false)
        onTargetChange(null)
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (active) onClick()
      }}
    >
      <mesh>
        <planeGeometry args={[width, 0.16]} />
        <meshBasicMaterial
          color={active ? baseColor : '#100606'}
          transparent
          opacity={active ? 0.92 : 0.42}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[width + 0.08, 0.23]} />
        <meshBasicMaterial
          color={hovered && active ? glowColor : '#8f5b00'}
          transparent
          opacity={hovered && active ? 0.36 : active ? 0.12 : 0.06}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.003, 0.018]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.038}
        color={active ? (hovered ? '#ffffff' : '#ffcf7c') : '#6f5435'}
        maxWidth={width - 0.06}
      >
        {displayedLabel}
      </Text>

      <mesh position={[0, 0, 0.035]}>
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

function ValueStepper({
  label,
  value,
  y,
  onPrevious,
  onNext,
  onTargetChange,
}: {
  label: string
  value: string
  y: number
  onPrevious: () => void
  onNext: () => void
  onTargetChange: (label: string | null) => void
}) {
  return (
    <group position={[0, y, 0.04]}>
      <Text
        position={[-0.78, 0.07, 0.01]}
        anchorX="left"
        anchorY="middle"
        fontSize={0.036}
        color="#c58a53"
        maxWidth={0.54}
      >
        {label.toUpperCase()}
      </Text>

      <RayButton
        label="‹"
        position={[-0.22, 0, 0.01]}
        width={0.18}
        targetLabel={`Previous ${label}`}
        onClick={onPrevious}
        onTargetChange={onTargetChange}
      />

      <mesh position={[0.24, 0, 0]}>
        <planeGeometry args={[0.68, 0.18]} />
        <meshBasicMaterial
          color="#160909"
          transparent
          opacity={0.86}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0.24, 0.003, 0.018]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.037}
        color="#f2d4a2"
        maxWidth={0.62}
      >
        {shortText(value, 26)}
      </Text>

      <RayButton
        label="›"
        position={[0.72, 0, 0.01]}
        width={0.18}
        targetLabel={`Next ${label}`}
        onClick={onNext}
        onTargetChange={onTargetChange}
      />
    </group>
  )
}

function fieldLabel(field: EditableField) {
  switch (field) {
    case 'subject':
      return 'SUBJECT'
    case 'intent':
      return 'INTENT'
    case 'oracleQuestion':
      return 'ORACLE QUESTION'
  }
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
  const [collapsed, setCollapsed] = useState(true)
  const [targetLabel, setTargetLabel] = useState<string | null>(null)
  const [editorField, setEditorField] = useState<EditableField | null>(null)

  useEffect(() => {
    if (!subject.trim()) onSubjectChange(SUBJECT_OPTIONS[0])
    if (!intent.trim()) onIntentChange(INTENT_OPTIONS[0])
    if (!oracleQuestion.trim()) onOracleQuestionChange(INTENT_OPTIONS[0])
    // Deliberately mount-only: do not fight manual VR editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedSubject = useMemo(() => {
    return subject.trim() || SUBJECT_OPTIONS[0]
  }, [subject])

  const selectedIntent = useMemo(() => {
    return intent.trim() || INTENT_OPTIONS[0]
  }, [intent])

  const traditionLabel =
    TRADITION_OPTIONS.find((option) => option.value === tradition)?.label ?? tradition

  const toneLabel =
    TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone

  const techLevelLabel =
    TECH_LEVEL_OPTIONS.find((option) => option.value === techLevel)?.label ?? techLevel

  const canBegin = !loading && selectedSubject.trim().length >= 2
  const canConsult =
    hasDeck &&
    !loading &&
    !oracleLoading &&
    oracleQuestion.trim().length >= 3

  const statusText = `PHASE: ${forgePhase.toUpperCase()} // DECK: ${
    hasDeck ? 'ACTIVE' : 'NONE'
  } // ORACLE: ${hasOracleReading ? 'READING' : oracleLoading ? 'CONSULTING' : 'EMPTY'}`

  const getFieldValue = (field: EditableField) => {
    switch (field) {
      case 'subject':
        return subject
      case 'intent':
        return intent
      case 'oracleQuestion':
        return oracleQuestion
    }
  }

  const setFieldValue = (field: EditableField, value: string) => {
    switch (field) {
      case 'subject':
        onSubjectChange(value)
        return
      case 'intent':
        onIntentChange(value)
        return
      case 'oracleQuestion':
        onOracleQuestionChange(value)
        return
    }
  }

  if (collapsed) {
    return (
      <group position={[-2.05, 1.14, -1.55]} rotation={[0, 0.54, 0]}>
        <MiniConsoleFrame>
          <Text
            position={[-0.44, 0.16, 0.03]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.045}
            color="#ffcf7c"
            maxWidth={0.9}
          >
            RITUAL CONSOLE
          </Text>

          <Text
            position={[-0.44, 0.01, 0.03]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.032}
            color={loading || oracleLoading ? '#ffcf7c' : '#8b6a45'}
            maxWidth={0.9}
          >
            {forgePhase.toUpperCase()}
          </Text>

          <RayButton
            label="OPEN"
            position={[0.28, -0.13, 0.04]}
            width={0.48}
            primary
            targetLabel="Open Ritual Console"
            onClick={() => setCollapsed(false)}
            onTargetChange={setTargetLabel}
          />
        </MiniConsoleFrame>
      </group>
    )
  }

  if (editorField) {
    const editorValue = getFieldValue(editorField)

    return (
      <group position={[-2.25, 1.26, -1.95]} rotation={[0, 0.58, 0]}>
        <PanelFrame title="VR TEXT INPUT">
          <Text
            position={[-0.78, 0.78, 0.04]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.036}
            color="#c58a53"
            maxWidth={1.5}
          >
            EDITING: {fieldLabel(editorField)}
          </Text>

          <mesh position={[0, 0.58, 0.02]}>
            <planeGeometry args={[1.58, 0.24]} />
            <meshBasicMaterial
              color="#100606"
              transparent
              opacity={0.88}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Text
            position={[0, 0.59, 0.04]}
            anchorX="center"
            anchorY="middle"
            fontSize={0.038}
            color="#f2d4a2"
            maxWidth={1.44}
          >
            {shortText(editorValue || ' ', 58)}
          </Text>

          <RayButton
            label="SUBJECT"
            position={[-0.54, 0.34, 0.05]}
            width={0.42}
            primary={editorField === 'subject'}
            targetLabel="Edit Subject"
            onClick={() => setEditorField('subject')}
            onTargetChange={setTargetLabel}
          />

          <RayButton
            label="INTENT"
            position={[0, 0.34, 0.05]}
            width={0.42}
            primary={editorField === 'intent'}
            targetLabel="Edit Intent"
            onClick={() => setEditorField('intent')}
            onTargetChange={setTargetLabel}
          />

          <RayButton
            label="QUESTION"
            position={[0.54, 0.34, 0.05]}
            width={0.48}
            primary={editorField === 'oracleQuestion'}
            targetLabel="Edit Oracle Question"
            onClick={() => setEditorField('oracleQuestion')}
            onTargetChange={setTargetLabel}
          />

          {KEYBOARD_ROWS.map((row, rowIndex) => {
            const y = 0.08 - rowIndex * 0.2
            const spacing = 0.15
            const startX = -((row.length - 1) * spacing) / 2

            return row.split('').map((key, index) => (
              <RayButton
                key={`${row}-${key}-${index}`}
                label={key}
                position={[startX + index * spacing, y, 0.05]}
                width={0.11}
                targetLabel={`Type ${key}`}
                onClick={() => setFieldValue(editorField, `${editorValue}${key}`)}
                onTargetChange={setTargetLabel}
              />
            ))
          })}

          <RayButton
            label="SPACE"
            position={[-0.5, -0.64, 0.05]}
            width={0.48}
            targetLabel="Type Space"
            onClick={() => setFieldValue(editorField, `${editorValue} `)}
            onTargetChange={setTargetLabel}
          />

          <RayButton
            label="BACK"
            position={[0, -0.64, 0.05]}
            width={0.38}
            targetLabel="Backspace"
            onClick={() => setFieldValue(editorField, editorValue.slice(0, -1))}
            onTargetChange={setTargetLabel}
          />

          <RayButton
            label="CLEAR"
            position={[0.48, -0.64, 0.05]}
            width={0.38}
            danger
            targetLabel="Clear Text"
            onClick={() => setFieldValue(editorField, '')}
            onTargetChange={setTargetLabel}
          />

          <RayButton
            label="DONE"
            position={[-0.28, -0.9, 0.05]}
            width={0.52}
            primary
            targetLabel="Close Keyboard"
            onClick={() => setEditorField(null)}
            onTargetChange={setTargetLabel}
          />

          <RayButton
            label="HIDE"
            position={[0.36, -0.9, 0.05]}
            width={0.52}
            targetLabel="Hide Console"
            onClick={() => {
              setEditorField(null)
              setCollapsed(true)
            }}
            onTargetChange={setTargetLabel}
          />

          <Text
            position={[0, -1.08, 0.04]}
            anchorX="center"
            anchorY="middle"
            fontSize={0.032}
            color={targetLabel ? '#ffffff' : '#8b6a45'}
            maxWidth={1.68}
          >
            {targetLabel ? `TARGET: ${targetLabel.toUpperCase()}` : 'RAY-TYPE TEXT ONE KEY AT A TIME'}
          </Text>
        </PanelFrame>
      </group>
    )
  }

  return (
    <group position={[-2.25, 1.26, -1.95]} rotation={[0, 0.58, 0]}>
      <PanelFrame title="VR RITUAL CONSOLE">
        <Text
          position={[-0.78, 0.78, 0.04]}
          anchorX="left"
          anchorY="top"
          fontSize={0.034}
          color="#d8bf9b"
          maxWidth={1.5}
          lineHeight={1.16}
        >
          Compact VR controls. Hide before selecting cards if the ray feels crowded.
        </Text>

        <RayButton
          label="HIDE"
          position={[0.62, 0.91, 0.05]}
          width={0.36}
          targetLabel="Hide Ritual Console"
          onClick={() => setCollapsed(true)}
          onTargetChange={setTargetLabel}
        />

        <ValueStepper
          label="Subject"
          value={selectedSubject}
          y={0.48}
          onPrevious={() => {
            onSubjectChange(cycleArrayValue(SUBJECT_OPTIONS, selectedSubject, -1))
          }}
          onNext={() => {
            onSubjectChange(cycleArrayValue(SUBJECT_OPTIONS, selectedSubject, 1))
          }}
          onTargetChange={setTargetLabel}
        />

        <ValueStepper
          label="Tradition"
          value={traditionLabel}
          y={0.24}
          onPrevious={() => {
            onTraditionChange(cycleOptionValue(TRADITION_OPTIONS, tradition, -1))
          }}
          onNext={() => {
            onTraditionChange(cycleOptionValue(TRADITION_OPTIONS, tradition, 1))
          }}
          onTargetChange={setTargetLabel}
        />

        <ValueStepper
          label="Tone"
          value={toneLabel}
          y={0.0}
          onPrevious={() => {
            onToneChange(cycleOptionValue(TONE_OPTIONS, tone, -1))
          }}
          onNext={() => {
            onToneChange(cycleOptionValue(TONE_OPTIONS, tone, 1))
          }}
          onTargetChange={setTargetLabel}
        />

        <ValueStepper
          label="Level"
          value={techLevelLabel}
          y={-0.24}
          onPrevious={() => {
            onTechLevelChange(cycleOptionValue(TECH_LEVEL_OPTIONS, techLevel, -1))
          }}
          onNext={() => {
            onTechLevelChange(cycleOptionValue(TECH_LEVEL_OPTIONS, techLevel, 1))
          }}
          onTargetChange={setTargetLabel}
        />

        <ValueStepper
          label="Intent"
          value={selectedIntent}
          y={-0.48}
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
          onTargetChange={setTargetLabel}
        />

        <RayButton
          label="EDIT TEXT"
          position={[0, -0.72, 0.05]}
          width={0.72}
          targetLabel="Open VR Text Keyboard"
          onClick={() => setEditorField('subject')}
          onTargetChange={setTargetLabel}
        />

        <RayButton
          label={loading ? 'FORGING…' : 'BEGIN'}
          disabledLabel="WAIT"
          position={[-0.42, -0.94, 0.05]}
          width={0.64}
          primary
          disabled={!canBegin}
          targetLabel="Begin Ritual"
          onClick={() => {
            onOracleQuestionChange(oracleQuestion.trim() || selectedIntent)
            void onBeginRitual()
          }}
          onTargetChange={setTargetLabel}
        />

        <RayButton
          label={oracleLoading ? 'ASKING…' : 'ORACLE'}
          disabledLabel={!hasDeck ? 'NO DECK' : 'WAIT'}
          position={[0.42, -0.94, 0.05]}
          width={0.64}
          primary
          disabled={!canConsult}
          targetLabel="Consult Oracle"
          onClick={() => {
            void onConsultOracle()
          }}
          onTargetChange={setTargetLabel}
        />

        <RayButton
          label="CLEAR"
          disabledLabel="EMPTY"
          position={[-0.42, -1.15, 0.05]}
          width={0.64}
          disabled={!hasOracleReading}
          targetLabel="Clear Oracle Reading"
          onClick={onClearOracle}
          onTargetChange={setTargetLabel}
        />

        <RayButton
          label="RESET"
          disabledLabel="LOCKED"
          position={[0.42, -1.15, 0.05]}
          width={0.64}
          danger
          disabled={loading}
          targetLabel="Clear Ritual"
          onClick={onClearRitual}
          onTargetChange={setTargetLabel}
        />

        <Text
          position={[0, -1.31, 0.04]}
          anchorX="center"
          anchorY="middle"
          fontSize={0.032}
          color={targetLabel ? '#ffffff' : '#8b6a45'}
          maxWidth={1.68}
        >
          {targetLabel ? `TARGET: ${targetLabel.toUpperCase()}` : statusText}
        </Text>
      </PanelFrame>
    </group>
  )
}
