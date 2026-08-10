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
  ForgePhase,
  TarotSystem,
  TechLevel,
  Tone,
  Tradition,
} from '../../types/grimoire'
import { FloatingDial, FloatingMenuButton } from './WorkbenchControls'
import {
  INTENT_OPTIONS,
  SUBJECT_OPTIONS,
  cycleOption,
  cycleString,
  optionLabel,
  shortText,
} from './shared'
import { TempleText } from '../TempleText'

function ForgeGlyph({ glyph, x, y }: { glyph: string; x: number; y: number }) {
  return (
    <group position={[x, y, 0.08]}>
      <TempleText
        fontSize={0.09}
        color="#ff6a00"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.18}
      >
        {glyph}
      </TempleText>
      <TempleText
        position={[0, 0, 0.003]}
        fontSize={0.058}
        color="#ffd7a3"
        anchorX="center"
        anchorY="middle"
      >
        {glyph}
      </TempleText>
    </group>
  )
}

export function ForgeConfigReadout({
  activeSubject,
  tradition,
  tarotSystem,
  tone,
  techLevel,
  activeIntent,
  artStyleFamily,
  artStyle,
  erosLevel,
  forgePhase,
  loading,
  canForge,
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
  forgePhase: ForgePhase
  loading: boolean
  canForge: boolean
}) {
  const activeArtStyleOptions = getStylesByFamily(artStyleFamily).map((style) => ({
    value: style.id,
    label: style.label,
  }))

  const subjectLabel = activeSubject.trim() || '—'
  const intentLabel = activeIntent.trim() || '—'
  const energized = loading || forgePhase === 'forging' || forgePhase === 'ready'
  const status = loading ? 'FORGING' : canForge ? 'READY' : 'SUBJECT REQUIRED'
  const rows = [
    ['SUBJECT', subjectLabel],
    ['CURRENT', optionLabel(TRADITION_OPTIONS, tradition)],
    ['TAROT', optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)],
    ['TONE', optionLabel(TONE_OPTIONS, tone)],
    ['LEVEL', optionLabel(TECH_LEVEL_OPTIONS, techLevel)],
    ['FAMILY', optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)],
    ['STYLE', optionLabel(activeArtStyleOptions, artStyle)],
    ['EROS', optionLabel(EROS_LEVEL_OPTIONS, erosLevel)],
    ['INTENT', intentLabel],
  ] as const

  return (
    <group position={[1.08, 1.0, 0.1]} scale={0.78}>
      <mesh>
        <planeGeometry args={[1.76, 1.66]} />
        <meshStandardMaterial
          color="#070405"
          emissive="#1a0906"
          emissiveIntensity={0.38}
          transparent
          opacity={energized ? 0.92 : 0.74}
          roughness={0.29}
          metalness={0.68}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.9, 1.8]} />
        <meshBasicMaterial
          color="#ff7a1a"
          transparent
          opacity={energized ? 0.08 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.7, 0.04]}>
        <planeGeometry args={[1.44, 0.012]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ForgeGlyph glyph="☿" x={-0.76} y={0.68} />
      <ForgeGlyph glyph="☉" x={0.76} y={0.68} />
      <ForgeGlyph glyph="♄" x={-0.76} y={-0.7} />
      <ForgeGlyph glyph="☽" x={0.76} y={-0.7} />

      <TempleText
        position={[0, 0.625, 0.07]}
        fontSize={0.044}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
      >
        ACTIVE FORGE CONFIG
      </TempleText>

      <TempleText
        position={[0, 0.52, 0.07]}
        fontSize={0.026}
        color={canForge ? '#ffcf7c' : '#9a6558'}
        anchorX="center"
        anchorY="middle"
      >
        {`${forgePhase.toUpperCase()} · ${status}`}
      </TempleText>

      {rows.map(([label, value], index) => {
        const y = 0.405 - index * 0.105
        return (
          <group key={label}>
            <mesh position={[0, y - 0.035, 0.03]}>
              <planeGeometry args={[1.3, 0.0025]} />
              <meshBasicMaterial
                color="#ff8a00"
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
            <TempleText
              position={[-0.64, y, 0.07]}
              fontSize={0.024}
              color="#8f6742"
              anchorX="left"
              anchorY="middle"
            >
              {label}
            </TempleText>
            <TempleText
              position={[-0.18, y, 0.07]}
              fontSize={0.027}
              color="#f2d4a2"
              anchorX="left"
              anchorY="middle"
              maxWidth={0.84}
            >
              {shortText(value, 30)}
            </TempleText>
          </group>
        )
      })}
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

  return (
    <group position={[-1.04, 1.0, 0.1]} scale={0.8}>
      <mesh>
        <planeGeometry args={[1.98, 2.22]} />
        <meshStandardMaterial
          color="#0a0505"
          emissive="#241006"
          emissiveIntensity={0.42}
          transparent
          opacity={0.9}
          roughness={0.28}
          metalness={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.12, 2.36]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0, 0.91, 0.07]}
        fontSize={0.05}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
      >
        GRIMOIRE ENGINE FORGE
      </TempleText>

      <TempleText
        position={[0, 0.83, 0.07]}
        fontSize={0.026}
        color="#8f6742"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        Tune the current deliberately. Selection never generates art by itself.
      </TempleText>

      <FloatingDial
        label="SUBJECT"
        value={activeSubject}
        y={0.64}
        onPrevious={() => onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, -1))}
        onNext={() => onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, 1))}
      />

      <FloatingDial
        label="TRADITION"
        value={optionLabel(TRADITION_OPTIONS, tradition)}
        y={0.48}
        onPrevious={() => onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, -1))}
        onNext={() => onTraditionChange(cycleOption(TRADITION_OPTIONS, tradition, 1))}
      />

      <FloatingDial
        label="TAROT SYSTEM"
        value={optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)}
        y={0.32}
        onPrevious={() => onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, -1))}
        onNext={() => onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, 1))}
      />

      <FloatingDial
        label="TONE"
        value={optionLabel(TONE_OPTIONS, tone)}
        y={0.16}
        onPrevious={() => onToneChange(cycleOption(TONE_OPTIONS, tone, -1))}
        onNext={() => onToneChange(cycleOption(TONE_OPTIONS, tone, 1))}
      />

      <FloatingDial
        label="LEVEL"
        value={optionLabel(TECH_LEVEL_OPTIONS, techLevel)}
        y={0}
        onPrevious={() => onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, -1))}
        onNext={() => onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, 1))}
      />

      <FloatingDial
        label="STYLE FAMILY"
        value={optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)}
        y={-0.16}
        onPrevious={() =>
          onArtStyleFamilyChange(cycleOption(ART_STYLE_FAMILY_OPTIONS, artStyleFamily, -1))
        }
        onNext={() =>
          onArtStyleFamilyChange(cycleOption(ART_STYLE_FAMILY_OPTIONS, artStyleFamily, 1))
        }
      />

      <FloatingDial
        label="ART STYLE"
        value={optionLabel(activeArtStyleOptions, artStyle)}
        y={-0.32}
        onPrevious={() => onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, -1))}
        onNext={() => onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, 1))}
      />

      <FloatingDial
        label="EROS LEVEL"
        value={optionLabel(EROS_LEVEL_OPTIONS, erosLevel)}
        y={-0.48}
        onPrevious={() => onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, -1))}
        onNext={() => onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, 1))}
      />

      <FloatingDial
        label="INTENT"
        value={activeIntent}
        y={-0.64}
        onPrevious={() => {
          const next = cycleString(INTENT_OPTIONS, activeIntent, -1)
          onIntentChange(next)
          onOracleQuestionChange(next)
        }}
        onNext={() => {
          const next = cycleString(INTENT_OPTIONS, activeIntent, 1)
          onIntentChange(next)
          onOracleQuestionChange(next)
        }}
      />

      <FloatingMenuButton
        label={loading ? 'FORGING DECK…' : 'IGNITE DECK FORGE'}
        x={0.18}
        y={-0.91}
        width={0.98}
        disabled={!canForge}
        onClick={onBeginRitual}
      />
    </group>
  )
}
