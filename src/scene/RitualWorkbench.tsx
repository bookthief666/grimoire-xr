import { useMemo, useState } from 'react'
import * as THREE from 'three'
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
import type { ArtStyleFamily } from '../constants/artStyles'
import {
  INTENT_OPTIONS,
  SUBJECT_OPTIONS,
  TABLE_Y,
  WORKBENCH_SCALE,
  clamp,
} from './workbench/shared'
import type { ForgeEnergy, Vec2, WorkbenchMode } from './workbench/shared'
import { ImagePipelineStatus } from './workbench/ImagePipelineStatus'
import {
  AltarAstrolabeRings,
  AltarChromeHardware,
  TableHexagram,
} from './workbench/AltarHardware'
import { FloatingForgeMenu, ForgeConfigReadout } from './workbench/ForgeMenu'
import { SpreadMandala, SpreadSlot } from './workbench/SpreadField'
import { DeckTray, WorkbenchCard } from './workbench/WorkbenchCards'
import { FloatingArchiveMenu, FloatingSigilDock } from './workbench/SigilDock'
import { TempleText } from './TempleText'

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

  // These two readouts share the same volume to the right of the altar, so only
  // one may ever be mounted. The forge readout takes precedence while the user
  // is tuning or a forge is running; otherwise the image pipeline reports on an
  // existing deck. Idle with no deck shows neither, leaving the altar clean.
  const showForgeReadout = menuMode === 'forge' || loading || oracleLoading
  const showImagePipeline = !showForgeReadout && hasDeck

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

        <TempleText
          position={[0, 0.655, 0.035]}
          fontSize={0.026}
          color="#8f6742"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          ☿  FORGE VECTOR  ☉  CONFIGURATION CURRENT  ♀
        </TempleText>
      </group>

      {/* Summoned, not permanent. The forge readout owns this space while the
          user is configuring or forging; the image pipeline only reports once a
          deck exists. They must never both render - their bounds overlap and
          the pipeline panel would eclipse 7 of the readout's 8 rows. */}
      {showImagePipeline ? (
        <ImagePipelineStatus
          cards={cards}
          selectedCardId={selectedCardId}
          archiveMessage={archiveMessage}
        />
      ) : null}
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

      {showForgeReadout ? (
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
      ) : null}

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

      <TempleText
        position={[0, TABLE_Y + 0.052, 0.54]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.04}
        color={loading || oracleLoading ? '#ffcf7c' : '#9a6b48'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.7}
      >
        {menuMode === 'forge' ? 'FORGE MENU OPEN' : menuMode === 'spread' ? 'SPREAD FIELD OPEN' : `${forgePhase.toUpperCase()} // ${hasDeck ? 'DECK ACTIVE' : 'ALTAR IDLE'}`}
      </TempleText>
    </group>
  )
}
