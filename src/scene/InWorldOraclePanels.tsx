import { useMemo, useState, type ReactNode } from 'react'
import { Text } from '@react-three/drei'
import type { GrimoireCard, OracleReading, SubjectDossier } from '../types/grimoire'

type PanelPage = {
  heading: string
  body: string
  color?: string
}

const PAGE_CHAR_LIMIT = 360

function cleanText(text: string | undefined | null) {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

function chunkText(text: string | undefined | null, limit = PAGE_CHAR_LIMIT) {
  const cleaned = cleanText(text)
  if (!cleaned) return []

  const chunks: string[] = []
  let remaining = cleaned

  while (remaining.length > limit) {
    const slice = remaining.slice(0, limit)
    const breakPoint = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('; '), slice.lastIndexOf(', '), slice.lastIndexOf(' '))

    const end = breakPoint > limit * 0.55 ? breakPoint + 1 : limit
    chunks.push(remaining.slice(0, end).trim())
    remaining = remaining.slice(end).trim()
  }

  if (remaining) chunks.push(remaining)
  return chunks
}

function makeSectionPages(
  sections: Array<{
    heading: string
    body?: string | null
    color?: string
    limit?: number
  }>,
) {
  const pages: PanelPage[] = []

  for (const section of sections) {
    const chunks = chunkText(section.body, section.limit ?? PAGE_CHAR_LIMIT)

    chunks.forEach((chunk, index) => {
      pages.push({
        heading:
          chunks.length > 1
            ? `${section.heading} ${index + 1}/${chunks.length}`
            : section.heading,
        body: chunk,
        color: section.color,
      })
    })
  }

  return pages
}

function formatDrawnCards(reading: OracleReading) {
  if (!reading.drawnCards.length) return ''

  return reading.drawnCards
    .map((card) => {
      return `${card.position}: ${card.cardName}. ${card.interpretation} Operative instruction: ${card.operativeInstruction}`
    })
    .join('\n\n')
}

function formatCorrespondences(card: GrimoireCard) {
  return [
    card.metadata.element ? `Element: ${card.metadata.element}` : '',
    card.metadata.planet ? `Planet: ${card.metadata.planet}` : '',
    card.metadata.polarity ? `Polarity: ${card.metadata.polarity}` : '',
    card.metadata.alchemical ? `Alchemy: ${card.metadata.alchemical}` : '',
    card.metadata.hebrew ? `Hebrew: ${card.metadata.hebrew}` : '',
    card.metadata.daimon ? `Daimon: ${card.metadata.daimon}` : '',
    card.metadata.gematria !== undefined ? `Gematria: ${card.metadata.gematria}` : '',
    card.metadata.keywords.length ? `Keywords: ${card.metadata.keywords.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' • ')
}

function PanelShell({
  position,
  rotation,
  title,
  pageIndex,
  pageCount,
  onNextPage,
  children,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  title: string
  pageIndex: number
  pageCount: number
  onNextPage: () => void
  children: ReactNode
}) {
  const hasPages = pageCount > 1

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation()
        if (hasPages) onNextPage()
      }}
    >
      <mesh>
        <planeGeometry args={[2.1, 2.5]} />
        <meshStandardMaterial
          color="#140707"
          emissive="#2a0a0a"
          emissiveIntensity={0.35}
          transparent
          opacity={0.94}
        />
      </mesh>

      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[2.16, 2.56]} />
        <meshBasicMaterial color="#6a2b10" transparent opacity={0.28} />
      </mesh>

      <mesh position={[0, 1.16, 0.01]}>
        <planeGeometry args={[1.92, 0.22]} />
        <meshBasicMaterial color="#2a0a0a" transparent opacity={0.72} />
      </mesh>

      <Text
        position={[-0.9, 1.08, 0.02]}
        anchorX="left"
        anchorY="top"
        fontSize={0.07}
        color="#ffcf7c"
        maxWidth={1.8}
      >
        {title}
      </Text>

      {children}

      <Text
        position={[0, -1.12, 0.02]}
        anchorX="center"
        anchorY="middle"
        fontSize={0.04}
        color={hasPages ? '#ffcf7c' : '#8b6a45'}
        maxWidth={1.8}
      >
        {hasPages
          ? `TAP / SELECT PANEL FOR NEXT PAGE ${pageIndex + 1}/${pageCount}`
          : `PAGE ${pageIndex + 1}/${pageCount}`}
      </Text>
    </group>
  )
}

function PagedPanel({
  position,
  rotation,
  title,
  pages,
  pageIndex,
  onNextPage,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  title: string
  pages: PanelPage[]
  pageIndex: number
  onNextPage: () => void
}) {
  const safePages =
    pages.length > 0
      ? pages
      : [
          {
            heading: 'No Data',
            body: 'No readable content is currently available for this panel.',
            color: '#d8bf9b',
          },
        ]

  const safeIndex = pageIndex % safePages.length
  const page = safePages[safeIndex]

  return (
    <PanelShell
      position={position}
      rotation={rotation}
      title={title}
      pageIndex={safeIndex}
      pageCount={safePages.length}
      onNextPage={onNextPage}
    >
      <Text
        position={[-0.9, 0.86, 0.02]}
        anchorX="left"
        anchorY="top"
        fontSize={0.055}
        color="#c58a53"
        maxWidth={1.8}
      >
        {page.heading.toUpperCase()}
      </Text>

      <Text
        position={[-0.9, 0.72, 0.02]}
        anchorX="left"
        anchorY="top"
        fontSize={0.049}
        color={page.color ?? '#f2d4a2'}
        maxWidth={1.8}
        lineHeight={1.34}
      >
        {page.body}
      </Text>
    </PanelShell>
  )
}

export function InWorldOraclePanels({
  dossier,
  focusedCard,
  oracleReading,
}: {
  dossier: SubjectDossier | null
  focusedCard: GrimoireCard | null
  oracleReading?: OracleReading | null
}) {
  const [dossierPageIndex, setDossierPageIndex] = useState(0)
  const [cardPageIndex, setCardPageIndex] = useState(0)
  const [oraclePageIndex, setOraclePageIndex] = useState(0)

  const dossierPages = useMemo(() => {
    if (!dossier) return []

    return makeSectionPages([
      {
        heading: 'Subject',
        body: dossier.subject,
        color: '#ffcf7c',
        limit: 260,
      },
      {
        heading: 'Archetype',
        body: dossier.archetype,
        color: '#f2d4a2',
        limit: 320,
      },
      {
        heading: 'Omen',
        body: dossier.omen,
        color: '#f2d4a2',
      },
      {
        heading: 'Summary',
        body: dossier.summary,
        color: '#d8bf9b',
      },
      {
        heading: 'Magical Diagnosis',
        body: dossier.magicalDiagnosis,
        color: '#d8bf9b',
      },
      {
        heading: 'Operative Advice',
        body: dossier.operativeAdvice,
        color: '#ffcf7c',
      },
      {
        heading: 'Suggested Questions',
        body: dossier.suggestedQuestions?.join(' • '),
        color: '#d8bf9b',
      },
    ])
  }, [dossier])

  const cardPages = useMemo(() => {
    if (!focusedCard) return []

    return makeSectionPages([
      {
        heading: 'Exegesis',
        body: focusedCard.exegesis,
        color: '#f2d4a2',
      },
      {
        heading: 'Ritual Function',
        body: focusedCard.ritualFunction,
        color: '#ffcf7c',
      },
      {
        heading: 'Correspondences',
        body: formatCorrespondences(focusedCard),
        color: '#d8bf9b',
      },
    ])
  }, [focusedCard])

  const oraclePages = useMemo(() => {
    if (!oracleReading) return []

    return makeSectionPages([
      {
        heading: 'Question',
        body: oracleReading.question,
        color: '#ffcf7c',
        limit: 260,
      },
      {
        heading: 'Answer',
        body: oracleReading.answer,
        color: '#f2d4a2',
      },
      {
        heading: 'Diagnosis',
        body: oracleReading.diagnosis,
        color: '#d8bf9b',
      },
      {
        heading: 'Prescription',
        body: oracleReading.prescription,
        color: '#ffcf7c',
      },
      {
        heading: 'Warning',
        body: oracleReading.warning,
        color: '#ff9b7a',
      },
      {
        heading: 'Drawn Cards',
        body: formatDrawnCards(oracleReading),
        color: '#d8bf9b',
      },
      {
        heading: 'Keywords',
        body: oracleReading.keywords.join(', '),
        color: '#d8bf9b',
        limit: 260,
      },
    ])
  }, [oracleReading])

  return (
    <group>
      {dossier ? (
        <PagedPanel
          position={[-2.2, 1.65, -1.65]}
          rotation={[0, 0.42, 0]}
          title="Dossier"
          pages={dossierPages}
          pageIndex={dossierPageIndex}
          onNextPage={() => {
            setDossierPageIndex((current) =>
              dossierPages.length ? (current + 1) % dossierPages.length : 0,
            )
          }}
        />
      ) : null}

      {focusedCard ? (
        <PagedPanel
          position={[2.2, 1.65, -1.65]}
          rotation={[0, -0.42, 0]}
          title={focusedCard.name}
          pages={cardPages}
          pageIndex={cardPageIndex}
          onNextPage={() => {
            setCardPageIndex((current) =>
              cardPages.length ? (current + 1) % cardPages.length : 0,
            )
          }}
        />
      ) : null}

      {oracleReading ? (
        <PagedPanel
          position={[0, 2.05, -2.62]}
          rotation={[0, 0, 0]}
          title="Oracle"
          pages={oraclePages}
          pageIndex={oraclePageIndex}
          onNextPage={() => {
            setOraclePageIndex((current) =>
              oraclePages.length ? (current + 1) % oraclePages.length : 0,
            )
          }}
        />
      ) : null}
    </group>
  )
}
