import type { ReactNode } from 'react'
import { Text } from '@react-three/drei'
import type { GrimoireCard, OracleReading, SubjectDossier } from '../types/grimoire'

function trimText(text: string | undefined | null, max = 220) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function Field({
  title,
  value,
  y,
  color = '#f2d4a2',
  maxWidth = 1.8,
}: {
  title: string
  value: string
  y: number
  color?: string
  maxWidth?: number
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
        fontSize={0.05}
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

      <Text
        position={[-0.9, 1.08, 0.01]}
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

function formatOracleCards(reading: OracleReading) {
  return reading.drawnCards
    .map((card) => `${card.position}: ${card.cardName}`)
    .join(' • ')
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
        <PanelBase position={[-2.15, 1.65, -1.65]} rotation={[0, 0.42, 0]} title="Dossier">
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
        <PanelBase position={[2.15, 1.65, -1.65]} rotation={[0, -0.42, 0]} title={focusedCard.name}>
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
                focusedCard.metadata.alchemical ? `Alchemy: ${focusedCard.metadata.alchemical}` : '',
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
        <PanelBase position={[0, 1.62, -2.92]} rotation={[0, 0, 0]} title="Oracle">
          <Field title="Question" value={trimText(oracleReading.question, 90)} y={0.9} />
          <Field title="Spread" value={trimText(oracleReading.spreadName, 80)} y={0.62} />
          <Field title="Cards" value={trimText(formatOracleCards(oracleReading), 160)} y={0.36} />
          <Field title="Answer" value={trimText(oracleReading.answer, 230)} y={-0.08} />
          <Field title="Prescription" value={trimText(oracleReading.prescription, 190)} y={-0.82} />
        </PanelBase>
      ) : null}
    </group>
  )
}
