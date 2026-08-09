import * as THREE from 'three'
import { TECH_LEVEL_OPTIONS, TONE_OPTIONS } from '../../constants/ritualOptions'
import { TAROT_SYSTEM_OPTIONS } from '../../constants/tarotSystems'
import { EROS_LEVEL_OPTIONS } from '../../constants/erosLevels'
import { ART_STYLE_FAMILY_OPTIONS, getStylesByFamily } from '../../constants/artStyles'
import type { ArtStyleFamily } from '../../constants/artStyles'
import type { ArtStyle, ErosLevel, ForgePhase, TarotSystem, TechLevel, Tone } from '../../types/grimoire'
import { FloatingDial, FloatingMenuButton } from './WorkbenchControls'
import { INTENT_OPTIONS, SUBJECT_OPTIONS, cycleOption, cycleString, optionLabel, shortText } from './shared'
import { TempleText } from '../TempleText'

function ForgeGlyph({
  glyph,
  x,
  y,
}: {
  glyph: string
  x: number
  y: number
}) {
  return (
    <group position={[x, y, 0.08]}>
      <TempleText
        position={[0, 0, 0]}
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
  const phaseLabel = forgePhase.toUpperCase()
  const panelOpacity = energized ? 0.92 : 0.72

  const rows = [
    ['SUBJECT', subjectLabel],
    ['TAROT', optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)],
    ['TONE', optionLabel(TONE_OPTIONS, tone)],
    ['LEVEL', optionLabel(TECH_LEVEL_OPTIONS, techLevel)],
    ['FAMILY', optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)],
    ['STYLE', optionLabel(activeArtStyleOptions, artStyle)],
    ['EROS', optionLabel(EROS_LEVEL_OPTIONS, erosLevel)],
    ['INTENT', intentLabel],
  ] as const

  const glyphRail = ['☿', '♀', '☉', '♄', '☽']

  return (
    <group position={[1.08, 1.0, 0.1]} scale={0.81}>
      <mesh>
        <planeGeometry args={[1.72, 1.48]} />
        <meshStandardMaterial
          color="#070405"
          emissive="#1a0906"
          emissiveIntensity={0.38}
          transparent
          opacity={panelOpacity}
          roughness={0.29}
          metalness={0.68}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.86, 1.62]} />
        <meshBasicMaterial
          color="#ff7a1a"
          transparent
          opacity={energized ? 0.08 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.61, 0.04]}>
        <planeGeometry args={[1.42, 0.012]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -0.63, 0.04]}>
        <planeGeometry args={[1.42, 0.01]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <ForgeGlyph glyph="☿" x={-0.74} y={0.59} />
      <ForgeGlyph glyph="☉" x={0.74} y={0.59} />
      <ForgeGlyph glyph="♄" x={-0.74} y={-0.61} />
      <ForgeGlyph glyph="☽" x={0.74} y={-0.61} />

      {glyphRail.map((glyph, index) => (
        <TempleText
          key={`${glyph}-${index}`}
          position={[-0.34 + index * 0.17, 0.46, 0.07]}
          fontSize={0.027}
          color={energized ? '#d99a5b' : '#7a5542'}
          anchorX="center"
          anchorY="middle"
        >
          {glyph}
        </TempleText>
      ))}

      <TempleText
        position={[0, 0.545, 0.07]}
        fontSize={0.044}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.28}
      >
        ACTIVE FORGE CONFIG
      </TempleText>

      <TempleText
        position={[0, 0.40, 0.07]}
        fontSize={0.026}
        color={canForge ? '#ffcf7c' : '#9a6558'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.22}
      >
        {phaseLabel} · {status}
      </TempleText>

      {rows.map(([label, value], index) => {
        const y = 0.295 - index * 0.104

        return (
          <group key={label}>
            <mesh position={[0, y - 0.034, 0.03]}>
              <planeGeometry args={[1.28, 0.0025]} />
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
              position={[-0.62, y, 0.07]}
              fontSize={0.025}
              color="#8f6742"
              anchorX="left"
              anchorY="middle"
              maxWidth={0.34}
            >
              {label}
            </TempleText>

            <TempleText
              position={[-0.18, y, 0.07]}
              fontSize={0.028}
              color="#f2d4a2"
              anchorX="left"
              anchorY="middle"
              maxWidth={0.82}
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
  tarotSystem,
  tone,
  techLevel,
  activeIntent,
  artStyleFamily,
  artStyle,
  erosLevel,
  onSubjectChange,
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
    <group position={[-1.04, 1.0, 0.1]} scale={0.86}>
      <mesh>
        <planeGeometry args={[1.92, 1.76]} />
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
        <planeGeometry args={[2.06, 1.92]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {([[-1, 1], [1, 1], [-1, -1], [1, -1]] as [number, number][]).map(([sx, sy], ci) => {
        const cx = sx * 0.92
        const cy = sy * 0.835
        const armLen = 0.11
        const armW = 0.014

        return (
          <group key={ci} position={[cx, cy, 0.02]}>
            <mesh position={[sx * armLen * 0.5, 0, 0]}>
              <planeGeometry args={[armLen, armW]} />
              <meshBasicMaterial
                color="#ff9a00"
                transparent
                opacity={0.52}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, sy * armLen * 0.5, 0]}>
              <planeGeometry args={[armW, armLen]} />
              <meshBasicMaterial
                color="#ff9a00"
                transparent
                opacity={0.52}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0, 0.003]}>
              <circleGeometry args={[0.018, 10]} />
              <meshBasicMaterial
                color="#ffcf7c"
                transparent
                opacity={0.55}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}

      <TempleText
        position={[0, 0.67, 0.07]}
        fontSize={0.05}
        color="#ffd18a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        GRIMOIRE ENGINE FORGE
      </TempleText>

      <mesh position={[0, 0.615, 0.065]}>
        <planeGeometry args={[1.62, 0.012]} />
        <meshBasicMaterial
          color="#ff9a00"
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <TempleText
        position={[0, 0.57, 0.07]}
        fontSize={0.026}
        color="#8f6742"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.48}
      >
        Tune the deck-current. Ignite only when the engine is aligned.
      </TempleText>

      <FloatingDial
        label="SUBJECT"
        value={activeSubject}
        y={0.39}
        onPrevious={() =>
          onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, -1))
        }
        onNext={() =>
          onSubjectChange(cycleString(SUBJECT_OPTIONS, activeSubject, 1))
        }
      />

      <FloatingDial
        label="TAROT SYSTEM"
        value={optionLabel(TAROT_SYSTEM_OPTIONS, tarotSystem)}
        y={0.23}
        onPrevious={() =>
          onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, -1))
        }
        onNext={() =>
          onTarotSystemChange(cycleOption(TAROT_SYSTEM_OPTIONS, tarotSystem, 1))
        }
      />

      <FloatingDial
        label="TONE"
        value={optionLabel(TONE_OPTIONS, tone)}
        y={0.07}
        onPrevious={() => onToneChange(cycleOption(TONE_OPTIONS, tone, -1))}
        onNext={() => onToneChange(cycleOption(TONE_OPTIONS, tone, 1))}
      />

      <FloatingDial
        label="LEVEL"
        value={optionLabel(TECH_LEVEL_OPTIONS, techLevel)}
        y={-0.09}
        onPrevious={() =>
          onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, -1))
        }
        onNext={() =>
          onTechLevelChange(cycleOption(TECH_LEVEL_OPTIONS, techLevel, 1))
        }
      />

      <FloatingDial
        label="STYLE FAMILY"
        value={optionLabel(ART_STYLE_FAMILY_OPTIONS, artStyleFamily)}
        y={-0.25}
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
        y={-0.41}
        onPrevious={() =>
          onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, -1))
        }
        onNext={() =>
          onArtStyleChange(cycleOption(activeArtStyleOptions, artStyle, 1))
        }
      />

      <FloatingDial
        label="EROS LEVEL"
        value={optionLabel(EROS_LEVEL_OPTIONS, erosLevel)}
        y={-0.57}
        onPrevious={() =>
          onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, -1))
        }
        onNext={() =>
          onErosLevelChange(cycleOption(EROS_LEVEL_OPTIONS, erosLevel, 1))
        }
      />

      <FloatingDial
        label="INTENT"
        value={activeIntent}
        y={-0.73}
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
        y={-0.9}
        width={0.98}
        disabled={!canForge}
        onClick={onBeginRitual}
      />
    </group>
  )
}
