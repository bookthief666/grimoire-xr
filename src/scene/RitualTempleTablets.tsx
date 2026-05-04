import { useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GrimoireCard, OracleReading, SubjectDossier } from '../types/grimoire'

type UnknownRecord = Record<string, unknown>

type TabletData = {
  title: string
  subtitle: string
  body: string
  accent: string
  seal: string
}

type RitualTempleTabletsProps = {
  dossier?: SubjectDossier | null
  focusedCard?: GrimoireCard | null
  oracleReading?: OracleReading | null
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {}
}

function readString(source: unknown, keys: string[]) {
  const record = asRecord(source)

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
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

function paginateText(text: string, maxChars = 560) {
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!normalized) return ['No inscription has manifested.']

  const paragraphs = normalized.split(/\n\n+/)
  const pages: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph

    if (candidate.length > maxChars && current) {
      pages.push(current)
      current = paragraph
    } else if (paragraph.length > maxChars) {
      const words = paragraph.split(/\s+/)
      let chunk = current

      for (const word of words) {
        const next = chunk ? `${chunk} ${word}` : word
        if (next.length > maxChars && chunk) {
          pages.push(chunk)
          chunk = word
        } else {
          chunk = next
        }
      }

      current = chunk
    } else {
      current = candidate
    }
  }

  if (current) pages.push(current)
  return pages.length ? pages : ['No inscription has manifested.']
}

function makeDossierText(dossier: SubjectDossier) {
  const suggestedQuestions = readStringArray(dossier, ['suggestedQuestions'])
  const keywords = readStringArray(dossier, ['keywords', 'keys', 'motifs'])

  return [
    dossier.summary ? `SUMMARY\n${dossier.summary}` : '',
    dossier.magicalDiagnosis ? `MAGICAL DIAGNOSIS\n${dossier.magicalDiagnosis}` : '',
    dossier.operativeAdvice ? `OPERATIVE ADVICE\n${dossier.operativeAdvice}` : '',
    dossier.omen ? `OMEN\n${dossier.omen}` : '',
    suggestedQuestions.length ? `QUESTIONS\n${suggestedQuestions.join('\n')}` : '',
    keywords.length ? `KEYS\n${keywords.join(' · ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function makeCardText(card: GrimoireCard) {
  const metadata = asRecord(card.metadata)
  const keywords = Array.isArray(metadata.keywords)
    ? metadata.keywords.filter((entry): entry is string => typeof entry === 'string')
    : []

  return [
    card.sigil ? `SIGIL\n${card.sigil}` : '',
    [
      metadata.element ? `ELEMENT ${String(metadata.element)}` : '',
      metadata.planet ? `PLANET ${String(metadata.planet)}` : '',
      metadata.polarity ? `POLARITY ${String(metadata.polarity)}` : '',
      metadata.alchemical ? `ALCHEMY ${String(metadata.alchemical)}` : '',
      metadata.hebrew ? `HEBREW ${String(metadata.hebrew)}` : '',
      typeof metadata.gematria === 'number' ? `GEMATRIA ${metadata.gematria}` : '',
    ]
      .filter(Boolean)
      .join(' // '),
    keywords.length ? `KEYWORDS\n${keywords.join(' · ')}` : '',
    card.exegesis ? `EXEGESIS\n${card.exegesis}` : '',
    card.ritualFunction ? `OPERATION\n${card.ritualFunction}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function formatDrawnCards(reading: OracleReading) {
  const drawnCards = asRecord(reading).drawnCards

  if (!Array.isArray(drawnCards) || !drawnCards.length) return ''

  return drawnCards
    .map((entry, index) => {
      if (typeof entry === 'string') return `${index + 1}. ${entry}`

      if (!entry || typeof entry !== 'object') return ''

      const name = readString(entry, ['cardName', 'name', 'title', 'card'])
      const position = readString(entry, ['position', 'role'])
      const interpretation = readString(entry, [
        'interpretation',
        'meaning',
        'reading',
        'exegesis',
      ])
      const operation = readString(entry, [
        'operativeInstruction',
        'operation',
        'instruction',
        'practice',
      ])

      return [
        `${index + 1}. ${position ? `${position}: ` : ''}${name || 'Unnamed Card'}`,
        interpretation ? `   ${interpretation}` : '',
        operation ? `   OPERATION: ${operation}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .filter(Boolean)
    .join('\n\n')
}

function makeOracleText(reading: OracleReading) {
  const drawnCards = formatDrawnCards(reading)
  const keywords = readStringArray(reading, ['keywords', 'keys', 'motifs'])

  return [
    reading.question ? `QUESTION\n${reading.question}` : '',
    reading.spreadName ? `SPREAD\n${reading.spreadName}` : '',
    drawnCards ? `DRAWN CARDS\n${drawnCards}` : '',
    reading.answer ? `ANSWER\n${reading.answer}` : '',
    reading.diagnosis ? `DIAGNOSIS\n${reading.diagnosis}` : '',
    reading.prescription ? `PRESCRIPTION\n${reading.prescription}` : '',
    reading.warning ? `WARNING\n${reading.warning}` : '',
    keywords.length ? `KEYWORDS\n${keywords.join(' · ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function TabletRune({
  x,
  y,
  accent,
}: {
  x: number
  y: number
  accent: string
}) {
  const sx = x > 0 ? -1 : 1
  const sy = y > 0 ? -1 : 1
  const arm = 0.13
  const w = 0.015

  return (
    <group position={[x, y, 0.08]}>
      <mesh position={[sx * arm * 0.5, 0, 0]}>
        <planeGeometry args={[arm, w]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, sy * arm * 0.5, 0]}>
        <planeGeometry args={[w, arm]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.022, 12]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function TabletButton({
  label,
  x,
  accent,
  disabled = false,
  onClick,
}: {
  label: string
  x: number
  accent: string
  disabled?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={[x, -0.67, 0.12]}
      scale={hovered && !disabled ? 1.08 : 1}
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
      <mesh position={[0, 0, -0.006]}>
        <circleGeometry args={[0.19, 30]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.001}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <circleGeometry args={[0.11, 30]} />
        <meshBasicMaterial
          color={disabled ? '#0a0504' : '#1c0a06'}
          transparent
          opacity={disabled ? 0.32 : 0.86}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <ringGeometry args={[0.135, 0.148, 34]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={hovered && !disabled ? 0.88 : 0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0.003, 0.04]}
        fontSize={0.055}
        color={disabled ? '#665039' : hovered ? '#ffffff' : '#ff95a3'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.34, 0.34]} />
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

function TempleTablet({ data }: { data: TabletData }) {
  const groupRef = useRef<THREE.Group>(null)
  const frameMat = useRef<THREE.MeshBasicMaterial>(null)
  const [pageIndex, setPageIndex] = useState(0)

  const pages = useMemo(() => paginateText(data.body), [data.body])
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? ''

  useEffect(() => {
    setPageIndex(0)
  }, [data.title, data.body])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = Math.sin(t * 0.75) * 0.018
    if (frameMat.current) {
      frameMat.current.opacity = 0.2 + Math.sin(t * 0.9) * 0.07
    }
  })

  const previous = () => {
    setPageIndex((current) => (current <= 0 ? pages.length - 1 : current - 1))
  }

  const next = () => {
    setPageIndex((current) => (current + 1) % pages.length)
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[1.92, 1.52]} />
        <meshStandardMaterial
          color="#080404"
          emissive="#2a0f05"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
          roughness={0.22}
          metalness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.08, 1.7]} />
        <meshBasicMaterial
          color={data.accent}
          transparent
          opacity={0.105}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.024]}>
        <ringGeometry args={[0.7, 0.716, 64]} />
        <meshBasicMaterial
          color={data.accent}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pulsing rectangular border frame */}
      <mesh position={[0, 0.775, 0.013]}>
        <planeGeometry args={[1.92, 0.016]} />
        <meshBasicMaterial
          ref={frameMat}
          color={data.accent}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.775, 0.013]}>
        <planeGeometry args={[1.92, 0.016]} />
        <meshBasicMaterial
          color={data.accent}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-0.968, 0, 0.013]}>
        <planeGeometry args={[0.016, 1.55]} />
        <meshBasicMaterial
          color={data.accent}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.968, 0, 0.013]}>
        <planeGeometry args={[0.016, 1.55]} />
        <meshBasicMaterial
          color={data.accent}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TabletRune x={-0.84} y={0.63} accent={data.accent} />
      <TabletRune x={0.84} y={0.63} accent={data.accent} />
      <TabletRune x={-0.84} y={-0.63} accent={data.accent} />
      <TabletRune x={0.84} y={-0.63} accent={data.accent} />

      <Text
        position={[0, 0.61, 0.08]}
        fontSize={0.062}
        color="#ff95a3"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.42}
      >
        {data.title}
      </Text>

      <Text
        position={[0, 0.51, 0.08]}
        fontSize={0.028}
        color="#914052"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.48}
      >
        {data.subtitle}
      </Text>

      <Text
        position={[0, 0.35, 0.08]}
        fontSize={0.052}
        color={data.accent}
        anchorX="center"
        anchorY="middle"
      >
        {data.seal}
      </Text>

      <Text
        position={[-0.78, 0.22, 0.08]}
        fontSize={0.038}
        color="#f2d4a2"
        anchorX="left"
        anchorY="top"
        maxWidth={1.55}
        lineHeight={1.2}
      >
        {page}
      </Text>

      <TabletButton
        label="‹"
        x={-0.32}
        accent={data.accent}
        disabled={pages.length <= 1}
        onClick={previous}
      />

      <Text
        position={[0, -0.67, 0.12]}
        fontSize={0.03}
        color="#914052"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.4}
      >
        {pages.length > 1 ? `${pageIndex + 1}/${pages.length}` : 'INSCRIPTION'}
      </Text>

      <TabletButton
        label="›"
        x={0.32}
        accent={data.accent}
        disabled={pages.length <= 1}
        onClick={next}
      />
    </group>
  )
}

export function RitualTempleTablets({
  dossier = null,
  focusedCard = null,
  oracleReading = null,
}: RitualTempleTabletsProps) {
  const data = useMemo<TabletData | null>(() => {
    if (oracleReading) {
      return {
        title: 'ORACLE TABLET',
        subtitle: 'The answer condenses upon the glass of the altar.',
        body: makeOracleText(oracleReading),
        accent: '#8a2cff',
        seal: '☉',
      }
    }

    if (focusedCard) {
      return {
        title: focusedCard.name.toUpperCase(),
        subtitle: 'Active arcanum raised for inspection.',
        body: makeCardText(focusedCard),
        accent: '#ff003c',
        seal: '✶',
      }
    }

    if (dossier) {
      return {
        title: dossier.subject.toUpperCase(),
        subtitle: dossier.archetype || 'Subject dossier engraved in the field.',
        body: makeDossierText(dossier),
        accent: '#ff3355',
        seal: '⌬',
      }
    }

    return null
  }, [dossier, focusedCard, oracleReading])

  if (!data) return null

  return (
    <group position={[0, 1.58, -1.22]} rotation={[0, 0, 0]} scale={0.9}>
      <TempleTablet data={data} />
    </group>
  )
}
