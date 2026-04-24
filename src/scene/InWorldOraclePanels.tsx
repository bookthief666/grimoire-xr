import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GrimoireCard, OracleReading, SubjectDossier } from '../types/grimoire'

type InWorldOraclePanelsProps = {
  dossier?: SubjectDossier | null
  focusedCard?: GrimoireCard | null
  oracleReading?: OracleReading | null
}

type UnknownRecord = Record<string, unknown>
type PanelKind = 'dossier' | 'card' | 'oracle'
type Vec3 = [number, number, number]

const DEFAULT_PANEL_OFFSETS: Record<PanelKind, Vec3> = {
  dossier: [-1.36, 0.0, -0.28],
  card: [0, 0.08, -0.36],
  oracle: [1.36, 0.0, -0.28],
}

const MOVE_STEP_X = 0.18
const MOVE_STEP_Y = 0.14
const MOVE_STEP_Z = 0.22

function cloneDefaultOffsets(): Record<PanelKind, Vec3> {
  return {
    dossier: [...DEFAULT_PANEL_OFFSETS.dossier],
    card: [...DEFAULT_PANEL_OFFSETS.card],
    oracle: [...DEFAULT_PANEL_OFFSETS.oracle],
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clampPanelOffset([x, y, z]: Vec3): Vec3 {
  return [
    clamp(x, -2.45, 2.45),
    clamp(y, -0.85, 0.85),
    clamp(z, -1.35, 0.75),
  ]
}

function rotationForOffset([x]: Vec3): [number, number, number] {
  return [0, clamp(-x * 0.14, -0.36, 0.36), 0]
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {}
}

function readString(source: unknown, keys: string[]) {
  const record = asRecord(source)

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function readStringArray(source: unknown, keys: string[]) {
  const record = asRecord(source)

  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) {
      const strings = value
        .map((entry) => {
          if (typeof entry === 'string') return entry.trim()
          if (entry && typeof entry === 'object') {
            return readString(entry, ['name', 'title', 'label', 'value'])
          }
          return ''
        })
        .filter(Boolean)

      if (strings.length) return strings
    }
  }

  return []
}

function readNestedString(source: unknown, parentKey: string, keys: string[]) {
  const parent = asRecord(source)[parentKey]
  return readString(parent, keys)
}

function shortText(value: string, max = 80) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned
}

function paginateText(text: string, maxChars = 310) {
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!normalized) return ['No text available.']

  const words = normalized.split(/\s+/)
  const pages: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word

    if (candidate.length > maxChars && current) {
      pages.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) pages.push(current)

  return pages.length ? pages : ['No text available.']
}

function makeDossierText(dossier: SubjectDossier) {
  const subject =
    readString(dossier, ['subject', 'title', 'name']) || 'Subject Dossier'

  const archetype = readString(dossier, [
    'archetype',
    'primaryArchetype',
    'pattern',
  ])

  const summary = readString(dossier, [
    'summary',
    'overview',
    'synopsis',
    'thesis',
    'description',
  ])

  const historical = readString(dossier, [
    'historicalContext',
    'history',
    'context',
    'background',
  ])

  const occult = readString(dossier, [
    'occultReading',
    'esotericReading',
    'symbolicReading',
    'interpretation',
    'magicalDiagnosis',
  ])

  const advice = readString(dossier, [
    'operativeAdvice',
    'practice',
    'instruction',
  ])

  const warnings = readStringArray(dossier, [
    'warnings',
    'cautions',
    'risks',
    'shadows',
  ])

  const keys = readStringArray(dossier, [
    'keywords',
    'keyIdeas',
    'motifs',
    'symbols',
  ])

  return [
    `SUBJECT: ${subject}`,
    archetype ? `ARCHETYPE: ${archetype}` : '',
    summary,
    historical ? `CONTEXT: ${historical}` : '',
    occult ? `OCCULT READING: ${occult}` : '',
    advice ? `OPERATIVE ADVICE: ${advice}` : '',
    keys.length ? `KEYS: ${keys.join(' · ')}` : '',
    warnings.length ? `WARNINGS: ${warnings.join(' · ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function makeCardText(card: GrimoireCard) {
  const metadata = asRecord(card.metadata)
  const keywords = Array.isArray(metadata.keywords)
    ? metadata.keywords.filter((entry): entry is string => typeof entry === 'string')
    : []

  const ritual = readString(card, ['ritualFunction', 'ritual', 'operation', 'practice'])
  const ritualInstruction = readNestedString(card, 'ritual', [
    'instruction',
    'practice',
    'operation',
    'formula',
    'summary',
  ])

  return [
    `${card.name}`,
    card.sigil ? `SIGIL: ${card.sigil}` : '',
    [
      metadata.element ? `ELEMENT: ${String(metadata.element)}` : '',
      metadata.planet ? `PLANET: ${String(metadata.planet)}` : '',
      metadata.polarity ? `POLARITY: ${String(metadata.polarity)}` : '',
      metadata.alchemical ? `ALCHEMY: ${String(metadata.alchemical)}` : '',
      metadata.hebrew ? `HEBREW: ${String(metadata.hebrew)}` : '',
      typeof metadata.gematria === 'number'
        ? `GEMATRIA: ${metadata.gematria}`
        : '',
    ]
      .filter(Boolean)
      .join(' // '),
    keywords.length ? `KEYWORDS: ${keywords.join(' · ')}` : '',
    card.exegesis ? `EXEGESIS: ${card.exegesis}` : '',
    ritual || ritualInstruction
      ? `OPERATION: ${ritual || ritualInstruction}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function formatDrawnCards(reading: OracleReading) {
  const drawnCards = asRecord(reading).drawnCards

  if (!Array.isArray(drawnCards) || !drawnCards.length) return ''

  const rendered = drawnCards
    .map((entry, index) => {
      if (typeof entry === 'string') return `${index + 1}. ${entry}`

      if (entry && typeof entry === 'object') {
        const name = readString(entry, ['cardName', 'name', 'title', 'card'])
        const position = readString(entry, ['position', 'role'])
        const interpretation = readString(entry, [
          'interpretation',
          'meaning',
          'reading',
          'exegesis',
        ])
        const operativeInstruction = readString(entry, [
          'operativeInstruction',
          'operation',
          'instruction',
          'practice',
        ])

        return [
          `${index + 1}. ${position ? `${position}: ` : ''}${name || 'Unnamed Card'}`,
          interpretation ? `INTERPRETATION: ${interpretation}` : '',
          operativeInstruction ? `OPERATION: ${operativeInstruction}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      }

      return ''
    })
    .filter(Boolean)

  return rendered.length ? rendered.join('\n\n') : ''
}

function makeOracleText(reading: OracleReading) {
  const question = readString(reading, ['question', 'query', 'prompt'])
  const spreadName = readString(reading, ['spreadName', 'spread', 'layout'])
  const answer = readString(reading, ['answer', 'response', 'oracle', 'reading'])
  const diagnosis = readString(reading, ['diagnosis', 'analysis'])
  const prescription = readString(reading, [
    'prescription',
    'instruction',
    'practice',
    'operation',
  ])
  const warning = readString(reading, ['warning', 'caution', 'shadow'])
  const drawnCards = formatDrawnCards(reading)
  const keywords = readStringArray(reading, ['keywords', 'keys', 'motifs'])

  return [
    question ? `QUESTION: ${question}` : '',
    spreadName ? `SPREAD: ${spreadName}` : '',
    drawnCards ? `DRAWN CARDS:\n${drawnCards}` : '',
    answer ? `ANSWER: ${answer}` : '',
    diagnosis ? `DIAGNOSIS: ${diagnosis}` : '',
    prescription ? `PRESCRIPTION: ${prescription}` : '',
    warning ? `WARNING: ${warning}` : '',
    keywords.length ? `KEYWORDS: ${keywords.join(' · ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function CornerGlyph({
  x,
  y,
  accent,
}: {
  x: number
  y: number
  accent: string
}) {
  return (
    <group position={[x, y, 0.035]}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.11, 0.018]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[0.11, 0.018]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function PanelButton({
  label,
  x,
  y,
  accent,
  width = 0.22,
  disabled = false,
  onClick,
}: {
  label: string
  x: number
  y: number
  accent: string
  width?: number
  disabled?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={[x, y, 0.065]}
      scale={hovered && !disabled ? 1.08 : 1}
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
        <planeGeometry args={[width, 0.16]} />
        <meshBasicMaterial
          color={disabled ? '#120808' : '#251008'}
          transparent
          opacity={disabled ? 0.38 : 0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width + 0.1, 0.28]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={hovered && !disabled ? 0.32 : 0.11}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.004, 0.025]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.042}
        color={disabled ? '#6e4934' : hovered ? '#ffffff' : '#ffd18a'}
        maxWidth={width - 0.03}
      >
        {label}
      </Text>

      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[width + 0.2, 0.34]} />
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

function MoveControls({
  accent,
  onMove,
  onReset,
  onDone,
}: {
  accent: string
  onMove: (delta: Vec3) => void
  onReset: () => void
  onDone: () => void
}) {
  return (
    <group>
      <Text
        position={[0, -0.69, 0.07]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.028}
        color="#b98855"
        maxWidth={1.05}
      >
        MOVE PANEL
      </Text>

      <PanelButton
        label="LEFT"
        x={-0.45}
        y={-0.86}
        accent={accent}
        width={0.28}
        onClick={() => onMove([-MOVE_STEP_X, 0, 0])}
      />

      <PanelButton
        label="RIGHT"
        x={-0.12}
        y={-0.86}
        accent={accent}
        width={0.32}
        onClick={() => onMove([MOVE_STEP_X, 0, 0])}
      />

      <PanelButton
        label="UP"
        x={0.22}
        y={-0.86}
        accent={accent}
        width={0.22}
        onClick={() => onMove([0, MOVE_STEP_Y, 0])}
      />

      <PanelButton
        label="DOWN"
        x={0.5}
        y={-0.86}
        accent={accent}
        width={0.3}
        onClick={() => onMove([0, -MOVE_STEP_Y, 0])}
      />

      <PanelButton
        label="NEAR"
        x={-0.43}
        y={-1.06}
        accent={accent}
        width={0.3}
        onClick={() => onMove([0, 0, MOVE_STEP_Z])}
      />

      <PanelButton
        label="FAR"
        x={-0.1}
        y={-1.06}
        accent={accent}
        width={0.24}
        onClick={() => onMove([0, 0, -MOVE_STEP_Z])}
      />

      <PanelButton
        label="HOME"
        x={0.22}
        y={-1.06}
        accent={accent}
        width={0.3}
        onClick={onReset}
      />

      <PanelButton
        label="DONE"
        x={0.53}
        y={-1.06}
        accent={accent}
        width={0.3}
        onClick={onDone}
      />
    </group>
  )
}

function PanelShell({
  title,
  subtitle,
  pages,
  accent,
  onMove,
  onReset,
  children,
}: {
  title: string
  subtitle: string
  pages: string[]
  accent: string
  onMove: (delta: Vec3) => void
  onReset: () => void
  children?: ReactNode
}) {
  const [pageIndex, setPageIndex] = useState(0)
  const [moveMode, setMoveMode] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const pageSignature = pages.join('\u0000')
  const safePages = pages.length ? pages : ['No text available.']
  const currentPage = safePages[Math.min(pageIndex, safePages.length - 1)] ?? ''

  useEffect(() => {
    setPageIndex(0)
  }, [pageSignature])

  useFrame(({ clock }) => {
    if (!groupRef.current || moveMode) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = Math.sin(t * 0.85 + title.length) * 0.012
  })

  const goPrevious = () => {
    setPageIndex((current) =>
      current <= 0 ? safePages.length - 1 : current - 1,
    )
  }

  const goNext = () => {
    setPageIndex((current) => (current + 1) % safePages.length)
  }

  return (
    <group ref={groupRef}>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          if (!moveMode) goNext()
        }}
      >
        <planeGeometry args={[1.16, 1.38]} />
        <meshStandardMaterial
          color="#100606"
          emissive="#251006"
          emissiveIntensity={moveMode ? 0.48 : 0.34}
          transparent
          opacity={moveMode ? 0.94 : 0.86}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[1.26, 1.48]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={moveMode ? 0.18 : 0.105}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.57, 0.02]}>
        <planeGeometry args={[0.98, 0.18]} />
        <meshBasicMaterial
          color="#220d07"
          transparent
          opacity={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      <CornerGlyph x={-0.48} y={0.55} accent={accent} />
      <CornerGlyph x={0.48} y={0.55} accent={accent} />
      <CornerGlyph x={-0.48} y={-0.55} accent={accent} />
      <CornerGlyph x={0.48} y={-0.55} accent={accent} />

      <mesh position={[0, 0.69, -0.006]}>
        <ringGeometry args={[0.12, 0.15, 28]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={moveMode ? 0.48 : 0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.6, 0.045]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.048}
        color="#ffd18a"
        maxWidth={0.72}
      >
        {title}
      </Text>

      <PanelButton
        label={moveMode ? 'READ' : 'MOVE'}
        x={0.42}
        y={0.6}
        accent={accent}
        width={0.25}
        onClick={() => setMoveMode((current) => !current)}
      />

      <Text
        position={[0, 0.47, 0.045]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.029}
        color="#b98855"
        maxWidth={0.92}
      >
        {subtitle}
      </Text>

      <Text
        position={[-0.46, 0.31, 0.045]}
        anchorX="left"
        anchorY="top"
        fontSize={0.036}
        color={moveMode ? '#c89a6a' : '#f2d4a2'}
        maxWidth={0.92}
        lineHeight={1.22}
      >
        {moveMode
          ? 'Use the movement controls below to reposition this reading panel. Press READ when done.'
          : currentPage}
      </Text>

      {moveMode ? (
        <MoveControls
          accent={accent}
          onMove={onMove}
          onReset={onReset}
          onDone={() => setMoveMode(false)}
        />
      ) : (
        <>
          <PanelButton
            label="‹"
            x={-0.34}
            y={-0.54}
            accent={accent}
            disabled={safePages.length <= 1}
            onClick={goPrevious}
          />

          <Text
            position={[0, -0.54, 0.055]}
            anchorX="center"
            anchorY="middle"
            fontSize={0.031}
            color="#9a6b48"
            maxWidth={0.38}
          >
            {safePages.length > 1
              ? `${pageIndex + 1}/${safePages.length}`
              : 'TAP PANEL'}
          </Text>

          <PanelButton
            label="›"
            x={0.34}
            y={-0.54}
            accent={accent}
            disabled={safePages.length <= 1}
            onClick={goNext}
          />
        </>
      )}

      {children}
    </group>
  )
}

export function InWorldOraclePanels({
  dossier = null,
  focusedCard = null,
  oracleReading = null,
}: InWorldOraclePanelsProps) {
  const [panelOffsets, setPanelOffsets] = useState<Record<PanelKind, Vec3>>(
    cloneDefaultOffsets,
  )

  const movePanel = (kind: PanelKind, delta: Vec3) => {
    setPanelOffsets((current) => {
      const base = current[kind]
      return {
        ...current,
        [kind]: clampPanelOffset([
          base[0] + delta[0],
          base[1] + delta[1],
          base[2] + delta[2],
        ]),
      }
    })
  }

  const resetPanel = (kind: PanelKind) => {
    setPanelOffsets((current) => ({
      ...current,
      [kind]: [...DEFAULT_PANEL_OFFSETS[kind]],
    }))
  }

  const dossierPages = useMemo(() => {
    return dossier ? paginateText(makeDossierText(dossier), 300) : []
  }, [dossier])

  const cardPages = useMemo(() => {
    return focusedCard ? paginateText(makeCardText(focusedCard), 275) : []
  }, [focusedCard])

  const oraclePages = useMemo(() => {
    return oracleReading ? paginateText(makeOracleText(oracleReading), 300) : []
  }, [oracleReading])

  const hasAnyPanel =
    dossierPages.length > 0 || cardPages.length > 0 || oraclePages.length > 0

  if (!hasAnyPanel) return null

  const dossierTitle = dossier
    ? shortText(readString(dossier, ['subject', 'title', 'name']) || 'DOSSIER', 20)
    : 'DOSSIER'

  const cardTitle = focusedCard ? shortText(focusedCard.name, 20) : 'ARCANUM'
  const oracleTitle = oracleReading ? 'ORACLE' : 'ORACLE'

  return (
    <group position={[0, 1.76, -2.84]}>
      {dossierPages.length ? (
        <group
          position={panelOffsets.dossier}
          rotation={rotationForOffset(panelOffsets.dossier)}
        >
          <PanelShell
            title={dossierTitle.toUpperCase()}
            subtitle="SUBJECT DOSSIER"
            pages={dossierPages}
            accent="#ff9a00"
            onMove={(delta) => movePanel('dossier', delta)}
            onReset={() => resetPanel('dossier')}
          />
        </group>
      ) : null}

      {cardPages.length ? (
        <group
          position={panelOffsets.card}
          rotation={rotationForOffset(panelOffsets.card)}
        >
          <PanelShell
            title={cardTitle.toUpperCase()}
            subtitle="ACTIVE ARCANUM"
            pages={cardPages}
            accent="#ffcf7c"
            onMove={(delta) => movePanel('card', delta)}
            onReset={() => resetPanel('card')}
          />
        </group>
      ) : null}

      {oraclePages.length ? (
        <group
          position={panelOffsets.oracle}
          rotation={rotationForOffset(panelOffsets.oracle)}
        >
          <PanelShell
            title={oracleTitle}
            subtitle="CONSULTATION"
            pages={oraclePages}
            accent="#8a2cff"
            onMove={(delta) => movePanel('oracle', delta)}
            onReset={() => resetPanel('oracle')}
          />
        </group>
      ) : null}
    </group>
  )
}
