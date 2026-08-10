import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { Edges } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../theme/palette'
import type {
  ForgePhase,
  GrimoireCard,
  OracleReading,
  SubjectDossier,
  TechLevel,
  Tone,
  Tradition,
  TarotSystem,
  ArtStyle,
  ErosField,
  ErosLevel,
} from '../types/grimoire'
import { InWorldOraclePanels } from './InWorldOraclePanels'
import { RitualTempleTablets } from './RitualTempleTablets'
import { TempleAtmosphere } from './TempleAtmosphere'
import { TempleXenotheurgy } from './TempleXenotheurgy'
import { TempleGrandArchitecture } from './TempleGrandArchitecture'
import { InWorldRitualConsole } from './InWorldRitualConsole'
import { RitualWorkbench } from './RitualWorkbench'
import { BabalonStarGlyph } from './ThelemicSigils'
import { CHAMBERS } from './chambers/registry'
import { useChamberDirector } from './chambers/ChamberDirector'
import { SummoningRing } from './chambers/SummoningRing'
import { RotundaFloor } from './rotunda/RotundaFloor'
import { RotundaColonnade } from './rotunda/RotundaColonnade'
import { RotundaDome } from './rotunda/RotundaDome'
import { CHAMBER_HUE, NEON } from '../theme/neon'
import { MorphGroup } from './chambers/MorphGroup'
import type { Chamber, ChamberProps } from './chambers/types'
import type { ArtStyleFamily } from '../constants/artStyles'
import { TempleText } from './TempleText'

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

type ManifestPlacement = {
  cardId: number
  spawnPosition: [number, number, number]
  spawnRotationY: number
  activationId: number
}

type ManifestState = ManifestPlacement & {
  card: GrimoireCard
}

/** Mounts whichever non-Sanctum chamber is currently presented. */
function ActiveChamber({
  chamber,
  ...props
}: ChamberProps & { chamber: Chamber }) {
  const { Architecture, Instrument } = chamber

  return (
    <>
      {Architecture ? <Architecture {...props} /> : null}
      {Instrument ? <Instrument {...props} /> : null}
    </>
  )
}

const SHOW_LEGACY_TEMPLE_FLOOR = false
const SHOW_LEGACY_VR_CONSOLE = false
const SHOW_LEGACY_CARD_ARC = false

// Reading surface. RitualTempleTablets is the intended in-world display;
// InWorldOraclePanels is the older draggable panel system kept for A/B in VR.
const SHOW_TEMPLE_TABLETS = true
const SHOW_LEGACY_ORACLE_PANELS = false

let ritualAudioCtx: AudioContext | null = null

function playRitualSting() {
  if (typeof window === 'undefined') return

  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioCtx) return

  if (!ritualAudioCtx) {
    ritualAudioCtx = new AudioCtx()
  }

  const ctx = ritualAudioCtx

  if (ctx.state === 'suspended') {
    void ctx.resume()
  }

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(110, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.22)

  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.3)
}

function FloorBar({
  a,
  b,
  color = PALETTE.glyphDim,
  opacity = 0.8,
  width = 0.035,
  y = 0.012,
}: {
  a: [number, number]
  b: [number, number]
  color?: string
  opacity?: number
  width?: number
  y?: number
}) {
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]}
      rotation={[-Math.PI / 2, 0, angle]}
    >
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function HexagramSeal() {
  return (
    <group position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <BabalonStarGlyph
        radius={1.06}
        color={PALETTE.glyph}
        opacity={0.92}
        lineWidth={2.8}
        withRose
      />
    </group>
  )
}

function RadialMarks() {
  const bars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const inner: [number, number] = [
        Math.cos(angle) * 1.38,
        Math.sin(angle) * 1.38,
      ]
      const outer: [number, number] = [
        Math.cos(angle) * 2.04,
        Math.sin(angle) * 2.04,
      ]
      return { inner, outer }
    })
  }, [])

  return (
    <>
      {bars.map((bar, i) => (
        <FloorBar
          key={i}
          a={bar.inner}
          b={bar.outer}
          color={PALETTE.glyphDim}
          opacity={0.68}
          width={0.03}
          y={0.011}
        />
      ))}
    </>
  )
}

function TempleFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshLambertMaterial color={PALETTE.floor} flatShading />
      </mesh>

      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.45, 2.62, 48]} />
        <meshBasicMaterial color="#d8e8ff" transparent opacity={0.18} />
      </mesh>

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.98, 2.03, 48]} />
        <meshBasicMaterial color="#4258ff" transparent opacity={0.08} />
      </mesh>

      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.32, 48]} />
        <meshBasicMaterial color="#f8f3df" transparent opacity={0.16} />
      </mesh>

      <HexagramSeal />
      <RadialMarks />
    </group>
  )
}

type TextureState = {
  url: string
  texture: THREE.Texture
}

function ChamberCardFaceArt({
  imageUrl,
  width,
  height,
  label = 'IMAGE',
}: {
  imageUrl: string
  width: number
  height: number
  label?: string
}) {
  const [textureState, setTextureState] = useState<TextureState | null>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    loader.load(
      imageUrl,
      (loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.needsUpdate = true

        setTextureState((current) => {
          current?.texture.dispose()
          return { url: imageUrl, texture: loadedTexture }
        })
      },
      undefined,
      () => {
        if (!cancelled) setFailedUrl(imageUrl)
      },
    )

    return () => {
      cancelled = true
    }
  }, [imageUrl])

  const texture = textureState?.url === imageUrl ? textureState.texture : null
  const failed = failedUrl === imageUrl

  if (failed) {
    return (
      <group>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#160807" side={THREE.DoubleSide} />
        </mesh>

        <TempleText
          position={[0, 0, 0.04]}
          fontSize={Math.min(width, height) * 0.075}
          color="#ff9a7a"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.76}
        >
          IMAGE ERROR
        </TempleText>
      </group>
    )
  }

  if (!texture) {
    return (
      <group>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#120806" side={THREE.DoubleSide} />
        </mesh>

        <TempleText
          position={[0, 0, 0.04]}
          fontSize={Math.min(width, height) * 0.07}
          color="#d9b5ff"
          anchorX="center"
          anchorY="middle"
          maxWidth={width * 0.76}
        >
          SEALING {label}
        </TempleText>
      </group>
    )
  }

  return (
    <mesh position={[0, 0, 0.022]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.98}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Altar({
  manifest,
  ritualImpulseRef,
  onLanding,
}: {
  manifest: ManifestState | null
  ritualImpulseRef: MutableRefObject<number>
  onLanding: (activationId: number) => void
}) {
  const manifestedCardRef = useRef<THREE.Group>(null)
  const altarRingMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const altarHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const landedActivationIdRef = useRef<number | null>(null)

  const dormantRingColor = useRef(new THREE.Color(PALETTE.glyphDim))
  const restingRingColor = useRef(new THREE.Color(PALETTE.ember))
  const flareRingColor = useRef(new THREE.Color(PALETTE.gold))

  const dormantHaloColor = useRef(new THREE.Color(PALETTE.goldDim))
  const restingHaloColor = useRef(new THREE.Color(PALETTE.ember))
  const flareHaloColor = useRef(new THREE.Color(PALETTE.sacred))

  const tempRing = useRef(new THREE.Color())
  const tempHalo = useRef(new THREE.Color())

  useEffect(() => {
    if (!manifest || !manifestedCardRef.current) return

    const localSpawnX = manifest.spawnPosition[0]
    const localSpawnY = manifest.spawnPosition[1]
    const localSpawnZ = manifest.spawnPosition[2] + 1

    manifestedCardRef.current.position.set(localSpawnX, localSpawnY, localSpawnZ)
    manifestedCardRef.current.rotation.set(0, manifest.spawnRotationY, 0)
    manifestedCardRef.current.scale.set(0.82, 0.82, 0.82)

    landedActivationIdRef.current = null

    if (altarRingMaterialRef.current) {
      altarRingMaterialRef.current.color.copy(flareRingColor.current)
    }

    if (altarHaloMaterialRef.current) {
      altarHaloMaterialRef.current.color.copy(flareHaloColor.current)
    }
  }, [manifest])

  useFrame((_, delta) => {
    const impulse = ritualImpulseRef.current

    if (manifest && manifestedCardRef.current) {
      const card = manifestedCardRef.current

      card.position.x = THREE.MathUtils.lerp(card.position.x, 0, delta * 4.2)
      card.position.y = THREE.MathUtils.lerp(card.position.y, 0.94, delta * 4.4)
      card.position.z = THREE.MathUtils.lerp(card.position.z, 0, delta * 4.6)

      card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, -Math.PI / 2, delta * 4.2)
      card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, 0, delta * 4.2)
      card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, 0, delta * 4.2)

      card.scale.x = THREE.MathUtils.lerp(card.scale.x, 1, delta * 4.2)
      card.scale.y = THREE.MathUtils.lerp(card.scale.y, 1, delta * 4.2)
      card.scale.z = THREE.MathUtils.lerp(card.scale.z, 1, delta * 4.2)

      const closeEnough =
        Math.abs(card.position.x) < 0.02 &&
        Math.abs(card.position.y - 0.94) < 0.02 &&
        Math.abs(card.position.z) < 0.02 &&
        Math.abs(card.rotation.x + Math.PI / 2) < 0.03

      if (
        closeEnough &&
        landedActivationIdRef.current !== manifest.activationId
      ) {
        landedActivationIdRef.current = manifest.activationId
        onLanding(manifest.activationId)
      }
    }

    if (altarRingMaterialRef.current) {
      tempRing.current
        .copy(manifest ? restingRingColor.current : dormantRingColor.current)
        .lerp(flareRingColor.current, impulse * 0.95)

      altarRingMaterialRef.current.color.lerp(tempRing.current, delta * 7)
    }

    if (altarHaloMaterialRef.current) {
      tempHalo.current
        .copy(manifest ? restingHaloColor.current : dormantHaloColor.current)
        .lerp(flareHaloColor.current, impulse * 0.95)

      altarHaloMaterialRef.current.color.lerp(tempHalo.current, delta * 6)
    }
  })

  return (
    <group position={[0, 0, -1.0]}>
      <mesh position={[0, 0.16, 0.16]}>
        <boxGeometry args={[1.5, 0.12, 0.95]} />
        <meshLambertMaterial color={PALETTE.massDark} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.2, 0.72, 0.6]} />
        <meshLambertMaterial color={PALETTE.mass} flatShading />
        <Edges color={PALETTE.outlineDark} />
      </mesh>

      <mesh position={[0, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color={PALETTE.cardFace} />
      </mesh>

      <mesh position={[0, 0.913, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.37, 36]} />
        <meshBasicMaterial
          ref={altarRingMaterialRef}
          color={manifest ? PALETTE.ember : PALETTE.glyphDim}
        />
      </mesh>

      <mesh position={[0, 0.94, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.02, 10, 28]} />
        <meshBasicMaterial
          ref={altarHaloMaterialRef}
          color={PALETTE.goldDim}
          transparent
          opacity={manifest ? 0.9 : 0.18}
        />
      </mesh>

      {manifest ? (
        <>
          <group ref={manifestedCardRef}>
            <mesh>
              <boxGeometry args={[0.52, 0.86, 0.03]} />
              <meshLambertMaterial color={PALETTE.cardBody} flatShading />
              <Edges color={PALETTE.outlineHot} />
            </mesh>

            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.44, 0.74]} />
              <meshBasicMaterial color={PALETTE.cardFace} />
            </mesh>

            {isUsableGeneratedCardImageUrl(manifest.card.imageUrl) ? (
              <ChamberCardFaceArt
                imageUrl={manifest.card.imageUrl}
                width={0.42}
                height={0.7}
                label="ARCANUM"
              />
            ) : null}

            <mesh position={[0, 0.26, 0.019]}>
              <ringGeometry args={[0.07, 0.11, 20]} />
              <meshBasicMaterial color={PALETTE.gold} />
            </mesh>

            <TempleText
              position={[0, -0.3, 0.03]}
              fontSize={0.05}
              maxWidth={0.34}
              color={PALETTE.textPrimary}
              anchorX="center"
              anchorY="middle"
            >
              {manifest.card.name}
            </TempleText>
          </group>

          <TempleText
            position={[0, 1.22, 0]}
            fontSize={0.075}
            color={PALETTE.textPrimary}
            anchorX="center"
            anchorY="middle"
          >
            {manifest.card.name}
          </TempleText>
        </>
      ) : null}
    </group>
  )
}

function CardArc({
  cards,
  onSelect,
  selectedId,
}: {
  cards: GrimoireCard[]
  onSelect: (
    card: GrimoireCard,
    position: [number, number, number],
    rotY: number,
  ) => void
  selectedId: number | null
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const cardSlots = useMemo(() => {
    if (cards.length === 0) return []
    const radius = 2.08

    return cards.map((card, index) => {
      const t = -0.8 + (index / Math.max(cards.length - 1, 1)) * 1.6
      const x = Math.sin(t) * radius
      const z = -2.02 - Math.cos(t) * radius * 0.32
      const y = 1.33
      const rotY = -t * 0.82

      return {
        ...card,
        position: [x, y, z] as [number, number, number],
        rotY,
      }
    })
  }, [cards])

  return (
    <group>
      {cardSlots.map((card) => {
        const isSelected = card.id === selectedId
        const isHovered = card.id === hoveredId

        return (
          <group
            key={card.id}
            position={card.position}
            rotation={[0, card.rotY, 0]}
            onPointerUp={(event) => {
              event.stopPropagation()
              onSelect(card, card.position, card.rotY)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(card.id)
            }}
            onPointerOut={() => setHoveredId(null)}
            scale={isHovered ? 1.06 : 1}
          >
            <mesh>
              <boxGeometry args={[0.42, 0.72, 0.025]} />
              <meshLambertMaterial
                color={isSelected ? PALETTE.cardBody : PALETTE.cardBodyDim}
                flatShading
              />
              <Edges color={isHovered ? PALETTE.outlineHot : PALETTE.outlineDark} />
            </mesh>

            <mesh position={[0, 0, 0.014]}>
              <planeGeometry args={[0.35, 0.59]} />
              <meshBasicMaterial color={isSelected ? PALETTE.cardFace : PALETTE.massDark} />
            </mesh>

            {isUsableGeneratedCardImageUrl(card.imageUrl) ? (
              <ChamberCardFaceArt
                imageUrl={card.imageUrl}
                width={0.33}
                height={0.56}
                label="SEAL"
              />
            ) : null}

            <mesh position={[0, 0.22, 0.015]}>
              <ringGeometry args={[0.045, 0.07, 16]} />
              <meshBasicMaterial color={isSelected ? PALETTE.gold : PALETTE.goldDim} />
            </mesh>

            <TempleText
              position={[0, -0.26, 0.026]}
              fontSize={0.04}
              maxWidth={0.28}
              color={isSelected ? PALETTE.textPrimary : PALETTE.textSecondary}
              anchorX="center"
              anchorY="middle"
            >
              {card.name}
            </TempleText>
          </group>
        )
      })}
    </group>
  )
}

export function RitualChamberScene({
  cards,
  selectedCardId,
  altarCard,
  focusedCard = null,
  dossier = null,
  oracleReading = null,
  showInWorldPanels = true,
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
  hasSavedRitual = false,
  lastSavedAt = null,
  archiveMessage = null,
  onSaveRitual = () => false,
  onLoadArchive = () => false,
  onClearArchive = () => {},
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
  onCardActivate,
  onAltarLanding,
}: {
  cards: GrimoireCard[]
  selectedCardId: number | null
  altarCard: GrimoireCard | null
  focusedCard?: GrimoireCard | null
  dossier?: SubjectDossier | null
  oracleReading?: OracleReading | null
  showInWorldPanels?: boolean
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
  hasSavedRitual?: boolean
  lastSavedAt?: string | null
  archiveMessage?: string | null
  onSaveRitual?: () => boolean
  onLoadArchive?: () => boolean
  onClearArchive?: () => void
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
  onCardActivate: (card: GrimoireCard) => void
  onAltarLanding: () => void
}) {
  const [manifestPlacement, setManifestPlacement] = useState<ManifestPlacement | null>(null)

  const manifest = useMemo<ManifestState | null>(() => {
    if (!manifestPlacement || !altarCard) return null

    const latestCard = cards.find((card) => card.id === manifestPlacement.cardId)
    if (!latestCard) return null

    return {
      ...manifestPlacement,
      card: latestCard,
    }
  }, [altarCard, cards, manifestPlacement])

  const activationCounterRef = useRef(0)
  const ritualImpulseRef = useRef(0)

  useFrame((_, delta) => {
    ritualImpulseRef.current = THREE.MathUtils.lerp(
      ritualImpulseRef.current,
      0,
      delta * 2.35,
    )
  })

  const handleSelect = (
    card: GrimoireCard,
    position: [number, number, number],
    rotY: number,
  ) => {
    playRitualSting()
    activationCounterRef.current += 1
    onCardActivate(card)

    setManifestPlacement({
      cardId: card.id,
      spawnPosition: position,
      spawnRotationY: rotY,
      activationId: activationCounterRef.current,
    })
  }

  const handleLanding = () => {
    ritualImpulseRef.current = 1
    onAltarLanding()
  }

  // Which room the temple is currently presenting. The Sanctum is the existing
  // temple; the others replace it entirely during a morph.
  const director = useChamberDirector(CHAMBERS, 'sanctum')
  const inSanctum = director.chamber.id === 'sanctum'

  const chamberProps = {
    morphRef: director.morphRef,
    ritualImpulseRef,
    active: !director.inTransition,
  }

  const shouldShowOraclePanels =
    showInWorldPanels &&
    (Boolean(dossier) || Boolean(focusedCard) || Boolean(oracleReading))

  return (
    <group>
      {/* The summoning ring is the one control present in every chamber. */}
      {/* The rotunda floor is shared by every chamber - it is the ground the
          whole temple stands on, and it re-tints to the summoned chamber's hue.
          Rendered outside MorphGroup so the ground stays put while rooms
          dissolve and reform on top of it. */}
      <RotundaFloor accent={CHAMBER_HUE[director.chamber.id] ?? NEON.cyan} />
      <RotundaColonnade accent={CHAMBER_HUE[director.chamber.id] ?? NEON.cyan} />
      <RotundaDome accent={CHAMBER_HUE[director.chamber.id] ?? NEON.cyan} />

      <SummoningRing
        chambers={CHAMBERS}
        activeId={director.requested}
        disabled={director.inTransition}
        onSummon={director.summon}
      />

      {/* Non-Sanctum chambers replace the temple wholesale. */}
      {!inSanctum ? <ActiveChamber chamber={director.chamber} {...chamberProps} /> : null}

      {inSanctum ? (
      <MorphGroup morphRef={director.morphRef}>
      <TempleAtmosphere
        ritualImpulseRef={ritualImpulseRef}
        hasActiveCard={Boolean(focusedCard)}
        hasOracleReading={Boolean(oracleReading)}
      />

      <TempleXenotheurgy
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasDeck={hasDeck}
        hasActiveCard={Boolean(focusedCard)}
        hasOracleReading={hasOracleReading}
      />

      <TempleGrandArchitecture
        ritualImpulseRef={ritualImpulseRef}
        loading={loading}
        oracleLoading={oracleLoading}
        hasDeck={hasDeck}
        hasActiveCard={Boolean(focusedCard)}
        hasOracleReading={hasOracleReading}
      />

      {/* The old TempleFloor is superseded by RotundaFloor, which is shared by
          every chamber rather than being Sanctum-only. Both drew a disc at y=0
          with rings at y 0.004-0.006, so rendering both z-fights. */}
      {SHOW_LEGACY_TEMPLE_FLOOR ? <TempleFloor /> : null}
      <RitualWorkbench
        cards={cards}
        selectedCardId={selectedCardId}
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
        hasDeck={hasDeck}
        oracleQuestion={oracleQuestion}
        oracleLoading={oracleLoading}
        hasOracleReading={hasOracleReading}
        hasSavedRitual={hasSavedRitual}
        lastSavedAt={lastSavedAt}
        archiveMessage={archiveMessage}
        onSaveRitual={onSaveRitual}
        onLoadArchive={onLoadArchive}
        onClearArchive={onClearArchive}
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
        onConsultOracle={onConsultOracle}
        onClearOracle={onClearOracle}
        onClearRitual={onClearRitual}
        onGenerateCardImage={onGenerateCardImage}
        onCardSelect={handleSelect}
      />

      {SHOW_LEGACY_VR_CONSOLE ? (
        <InWorldRitualConsole
          subject={subject}
          tradition={tradition}
          tone={tone}
          techLevel={techLevel}
          intent={intent}
          forgePhase={forgePhase}
          loading={loading}
          hasDeck={hasDeck}
          oracleQuestion={oracleQuestion}
          oracleLoading={oracleLoading}
          hasOracleReading={hasOracleReading}
          onSubjectChange={onSubjectChange}
          onTraditionChange={onTraditionChange}
          onToneChange={onToneChange}
          onTechLevelChange={onTechLevelChange}
          onIntentChange={onIntentChange}
          onOracleQuestionChange={onOracleQuestionChange}
          onBeginRitual={onBeginRitual}
          onConsultOracle={onConsultOracle}
          onClearOracle={onClearOracle}
          onClearRitual={onClearRitual}
        />
      ) : null}

      <Altar
        manifest={manifest}
        ritualImpulseRef={ritualImpulseRef}
        onLanding={handleLanding}
      />

      {SHOW_LEGACY_CARD_ARC ? (
        <CardArc
          cards={cards}
          selectedId={selectedCardId}
          onSelect={handleSelect}
        />
      ) : null}

      {shouldShowOraclePanels && SHOW_TEMPLE_TABLETS ? (
        <RitualTempleTablets
          dossier={dossier ?? null}
          focusedCard={focusedCard ?? null}
          oracleReading={oracleReading ?? null}
        />
      ) : null}

      {shouldShowOraclePanels && SHOW_LEGACY_ORACLE_PANELS ? (
        <InWorldOraclePanels
          dossier={dossier ?? null}
          focusedCard={focusedCard ?? null}
          oracleReading={oracleReading ?? null}
        />
      ) : null}
      </MorphGroup>
      ) : null}
    </group>
  )
}
