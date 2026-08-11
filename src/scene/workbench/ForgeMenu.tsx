import * as THREE from 'three'
import {
  TECH_LEVEL_OPTIONS,
  TONE_OPTIONS,
  TRADITION_OPTIONS,
} from '../../constants/ritualOptions'
import { TAROT_SYSTEM_OPTIONS } from '../../constants/tarotSystems'
import { EROS_LEVEL_OPTIONS } from '../../constants/erosLevels'
import {
  ART_STYLE_FAMILY_OPTIONS,
  getStylesByFamily,
} from '../../constants/artStyles'
import type { ArtStyleFamily } from '../../constants/artStyles'
import type {
  ArtStyle,
  ErosLevel,
  TarotSystem,
  TechLevel,
  Tone,
  Tradition,
} from '../../types/grimoire'
import { FloatingMenuButton } from './WorkbenchControls'
import {
  INTENT_OPTIONS,
  SUBJECT_OPTIONS,
  cycleOption,
  cycleString,
  optionLabel,
  shortText,
} from './shared'
import { TempleText } from '../TempleText'
import { ScriptureArc } from '../ScriptureArc'
import { pressable } from '../pressable'
import { forgeDialPose } from './forgeDialLayout'

/**
 * One configuration dimension, inscribed rather than plated.
 *
 * The old `FloatingDial` cost about twelve draws each — a backing plate, two
 * rules, a doubled glyph, a label, a value and two arrow targets — and nine of
 * them plus two panels was 156 draws, which pushed the Sanctum from 267 to 423
 * against a ceiling of 300.
 *
 * There is one hit plane, not two. Direction comes from which side of it the
 * ray lands on: an invisible plane still costs a draw, so two arrow targets per
 * row is eighteen wasted draws across nine dials, and one wide target is a
 * better thing to hit with a controller ray than a small glyph anyway.
 */
function ForgeDial({
  label,
  value,
  column,
  row,
  onStep,
}: {
  label: string
  value: string
  column: 'left' | 'right'
  row: number
  onStep: (direction: 1 | -1) => void
}) {
  const pose = forgeDialPose(column, row)

  return (
    <group position={pose.position} rotation={[0, pose.rotationY, 0]}>
      <TempleText
        position={[0, 0.035, 0]}
        fontSize={0.03}
        color="#c98a4a"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
      >
        {label}
      </TempleText>

      <TempleText
        position={[0, -0.018, 0]}
        fontSize={0.044}
        color="#ffe6c2"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.92}
      >
        {`◂  ${value}  ▸`}
      </TempleText>

      <mesh
        position={[0, 0, 0.012]}
        {...pressable((event) => {
          // Local x of the hit decides direction: left half steps back, right
          // half steps forward. The arrows are drawn into the value line rather
          // than being separate targets, which is what makes one hit plane per
          // dial enough.
          const local = event.object.worldToLocal(event.point.clone())
          onStep(local.x < 0 ? -1 : 1)
        })}
      >
        <planeGeometry args={[0.96, 0.12]} />
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

export function FloatingForgeMenu({
  activeSubject,
  tradition,
  tarotSystem,
  tone,
  techLevel,
  activeIntent,
  artStyleFamily,
  artStyle,
  erosLevel,
  onSubjectChange,
  onTraditionChange,
  onTarotSystemChange,
  onToneChange,
  onTechLevelChange,
  onArtStyleFamilyChange,
  onArtStyleChange,
  onErosLevelChange,
  onIntentChange,
  onOracleQuestionChange,
  loading,
  canForge,
  onBeginRitual,
}: {
  activeSubject: string
  tradition: Tradition
  tarotSystem: TarotSystem
  tone: Tone
  techLevel: TechLevel
  activeIntent: string
  artStyleFamily: ArtStyleFamily
  artStyle: ArtStyle
  erosLevel: ErosLevel
  loading: boolean
  canForge: boolean
  onBeginRitual: () => void
  onSubjectChange: (subject: string) => void
  onTraditionChange: (tradition: Tradition) => void
  onTarotSystemChange: (tarotSystem: TarotSystem) => void
  onToneChange: (tone: Tone) => void
  onTechLevelChange: (techLevel: TechLevel) => void
  onIntentChange: (intent: string) => void
  onArtStyleFamilyChange: (family: ArtStyleFamily) => void
  onArtStyleChange: (style: ArtStyle) => void
  onErosLevelChange: (level: ErosLevel) => void
  onOracleQuestionChange: (question: string) => void
}) {
  const activeArtStyleOptions = getStylesByFamily(artStyleFamily).map((style) => ({
    value: style.id,
    label: style.label,
  }))

  const status = loading
    ? 'FORGING THE DECK'
    : canForge
      ? 'READY TO FORGE'
      : 'A SUBJECT IS REQUIRED'

  return (
    <group>
      {/* The voice the reading speaks in. */}
      <ForgeDial
        label="SUBJECT"
        value={shortText(activeSubject.trim() || '—', 22)}
        column="left"
        row={0}
        onStep={(d) => onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, d))}
      />
      <ForgeDial
        label="TRADITION"
        value={optionLabel(TRADITION_OPTIONS, tradition)}
        column="left"
        row={1}
        onStep={(d) => onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, d))}
      />
      <ForgeDial
        label="TAROT SYSTEM"
        value={optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)}
        column="left"
        row={2}
        onStep={(d) => onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, d))}
      />
      <ForgeDial
        label="TONE"
        value={optionLabel(TONE_OPTIONS, tone)}
        column="left"
        row={3}
        onStep={(d) => onToneChange(cycleOption(TONE_OPTIONS, tone, d))}
      />
      <ForgeDial
        label="TECHNICAL LEVEL"
        value={optionLabel(TECH_LEVEL_OPTIONS, techLevel)}
        column="left"
        row={4}
        onStep={(d) => onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, d))}
      />

      {/* The image the deck is drawn in. */}
      <ForgeDial
        label="ART FAMILY"
        value={optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)}
        column="right"
        row={0}
        onStep={(d) =>
          onArtStyleFamilyChange(cycleOption(ART_STYLE_FAMILY_OPTIONS, artStyleFamily, d))
        }
      />
      <ForgeDial
        label="ART STYLE"
        value={optionLabel(activeArtStyleOptions, artStyle)}
        column="right"
        row={1}
        onStep={(d) => onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, d))}
      />
      <ForgeDial
        label="EROS"
        value={optionLabel(EROS_LEVEL_OPTIONS, erosLevel)}
        column="right"
        row={2}
        onStep={(d) => onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, d))}
      />
      <ForgeDial
        label="INTENT"
        value={shortText(activeIntent.trim() || '—', 22)}
        column="right"
        row={3}
        onStep={(d) => {
          const next = cycleString(INTENT_OPTIONS, activeIntent, d)
          onIntentChange(next)
          onOracleQuestionChange(next)
        }}
      />

      {/* Status, where the readout panel used to repeat all nine values. */}
      <ScriptureArc
        radius={2.05}
        y={1.94}
        fontSize={0.042}
        color={canForge ? '#ffd18a' : '#a87a52'}
        maxWidth={2.8}
        shelfColor="#ff9a3c"
        shelfOpacity={0.18}
        outlineOpacity={0.14}
      >
        {status}
      </ScriptureArc>

      {/* A stated invariant of this project, kept verbatim and kept visible. */}
      <ScriptureArc
        radius={2.4}
        y={0.62}
        fontSize={0.028}
        color="#8a7358"
        maxWidth={3.2}
        shelf={false}
      >
        Tune the current deliberately. Selection never generates art by itself.
      </ScriptureArc>

      <group position={[0, 0.86, -1.55]}>
        <FloatingMenuButton
          label={loading ? 'FORGING DECK…' : 'IGNITE DECK FORGE'}
          x={0}
          y={0}
          width={0.98}
          disabled={!canForge}
          onClick={onBeginRitual}
        />
      </group>
    </group>
  )
}
