import type { ReactNode } from 'react'
import { Text } from '@react-three/drei'
import type { GrimoireCard, OracleReading, SubjectDossier } from '../types/grimoire'

function trimText(text: string | undefined | null, max = 220) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function formatDrawnCards(reading: OracleReading) {
  if (!reading.drawnCards.length) return ''

  return reading.drawnCards
    .map((card) => `${card.position}: ${card.cardName}`)
    .join(' • ')
}

function Field({
  title,
  value,
  y,
  color = '#f2d4a2',
  maxWidth = 1.8,
  fontSize = 0.05,
}: {
  title: string
  value: string
  y: number
  color?: string
  maxWidth?: number
  fontSize?: number
}) {
  if (!value) return null

  return (
    <>
      <Text
        position={[-0.9, y, 0.01]}
        anchorX="left"
        anchorY="top"
        fontSize={0.055}
        color="#c58a53"
        maxWidth={maxWidth}
      >
        {title.toUpperCase()}
      </Text>

      <Text
        position={[-0.9, y - 0.09, 0.01]}
        anchorX="left"
        anchorY="top"
        fontSize={fontSize}
        color={color}
        maxWidth={maxWidth}
        lineHeight={1.35}
      >
        {value}
      </Text>
    </>
  )
}

function PanelBase({
  position,
  rotation,
  title,
  children,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  title: string
  children: ReactNode
}) {
  return (
    <group position={position} rotation={rotation}>
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
    </group>
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
  return (
    <group>
      {dossier ? (
        <PanelBase
          position={[-2.2, 1.65, -1.65]}
          rotation={[0, 0.42, 0]}
          title="Dossier"
        >
          <Field title="Subject" value={trimText(dossier.subject, 50)} y={0.9} />
          <Field title="Archetype" value={trimText(dossier.archetype, 80)} y={0.63} />
          <Field title="Omen" value={trimText(dossier.omen, 90)} y={0.34} />
          <Field title="Summary" value={trimText(dossier.summary, 220)} y={0.0} />
          <Field
            title="Diagnosis"
            value={trimText(dossier.magicalDiagnosis ?? '', 220)}
            y={-0.62}
          />
        </PanelBase>
      ) : null}

      {focusedCard ? (
        <PanelBase
          position={[2.2, 1.65, -1.65]}
          rotation={[0, -0.42, 0]}
          title={focusedCard.name}
        >
          <Field title="Exegesis" value={trimText(focusedCard.exegesis, 220)} y={0.9} />

          <Field
            title="Ritual Function"
            value={trimText(focusedCard.ritualFunction ?? '', 150)}
            y={0.18}
          />

          <Field
            title="Correspondences"
            value={trimText(
              [
                focusedCard.metadata.element ? `Element: ${focusedCard.metadata.element}` : '',
                focusedCard.metadata.planet ? `Planet: ${focusedCard.metadata.planet}` : '',
                focusedCard.metadata.alchemical
                  ? `Alchemy: ${focusedCard.metadata.alchemical}`
                  : '',
                focusedCard.metadata.hebrew ? `Hebrew: ${focusedCard.metadata.hebrew}` : '',
                focusedCard.metadata.daimon ? `Daimon: ${focusedCard.metadata.daimon}` : '',
                focusedCard.metadata.gematria !== undefined
                  ? `Gematria: ${focusedCard.metadata.gematria}`
                  : '',
              ]
                .filter(Boolean)
                .join(' • '),
              180,
            )}
            y={-0.5}
          />
        </PanelBase>
      ) : null}

      {oracleReading ? (
        <PanelBase
          position={[0, 2.05, -2.62]}
          rotation={[0, 0, 0]}
          title="Oracle"
        >
          <Field
            title="Question"
            value={trimText(oracleReading.question, 120)}
            y={0.9}
            color="#ffcf7c"
          />

          <Field
            title="Answer"
            value={trimText(oracleReading.answer, 240)}
            y={0.48}
            color="#f2d4a2"
          />

          <Field
            title="Prescription"
            value={trimText(oracleReading.prescription, 190)}
            y={-0.2}
            color="#ffcf7c"
          />

          <Field
            title="Drawn Cards"
            value={trimText(formatDrawnCards(oracleReading), 180)}
            y={-0.78}
            color="#d8bf9b"
            fontSize={0.045}
          />

          {oracleReading.warning ? (
            <Field
              title="Warning"
              value={trimText(oracleReading.warning, 110)}
              y={-1.08}
              color="#ff9b7a"
              fontSize={0.043}
            />
          ) : null}
        </PanelBase>
      ) : null}
    </group>
  )
}
