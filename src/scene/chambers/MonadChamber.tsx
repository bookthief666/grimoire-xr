import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  GLYPH_PHASES,
  MONAS_CORPUS_SCOPE,
  phaseReached,
  registersFor,
  sentencesForPhase,
  type GlyphPhase,
} from '../../tools/monas'
import type { CommentaryRegister } from '../../tools/monasCorpus'
import { MONAS_PROVENANCE_LABELS } from '../../tools/provenance'
import type { ChamberProps } from './types'
import { TempleText } from '../TempleText'
import { ScriptureArc } from '../ScriptureArc'
import { pressable } from '../pressable'
import { monadControlPose, monadRegisterPose } from './monadReaderLayout'
import {
  buildMergedPlanarSegments,
  type PlanarSegment,
} from '../geometry/mergedPlanarSegments'

export const MONAD_ACCENT = '#d8e8ff'

/**
 * The glyph is the chamber. It sits on the forward axis, above the reading
 * height and far enough back to be built at architectural scale rather than
 * held at arm's length.
 *
 * It once sat at [0, 1.86, -1.15] with a flat lectern directly beneath it,
 * whose tilted top edge reached above the horizon and drew straight over the
 * construction it existed to explain. That lectern is gone entirely: the
 * reading is now inscribed around the practitioner in concentric bands, and
 * the forward axis belongs to the glyph alone.
 */
const GLYPH_ORIGIN: [number, number, number] = [0, 2.0, -1.55]
const GLYPH_SCALE = 1.32

function mergedCircleSegments(radius: number, opacity: number): PlanarSegment[] {
  const points = Array.from({ length: 48 }, (_, index) => {
    const angle = (index / 48) * Math.PI * 2
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const
  })

  return points.map((point, index) => ({
    from: point,
    to: points[(index + 1) % points.length],
    width: 0.007,
    color: MONAD_ACCENT,
    intensity: opacity,
  }))
}

const LINE_SEGMENTS: PlanarSegment[] = [
  { from: [0, 0], to: [0, 0.34], width: 0.008, color: MONAD_ACCENT, intensity: 0.75 },
]
const CIRCLE_SEGMENTS = mergedCircleSegments(0.2, 0.62)
const MOON_SEGMENTS: PlanarSegment[] = Array.from({ length: 24 }, (_, index) => {
  const start = Math.PI * (0.08 + (index / 23) * 0.84)
  const end = Math.PI * (0.08 + ((index + 1) / 23) * 0.84)
  const radius = 0.17

  return {
    from: [Math.cos(start) * radius, Math.sin(start) * radius * 0.72],
    to: [Math.cos(end) * radius, Math.sin(end) * radius * 0.72],
    width: 0.009,
    color: '#f4f8ff',
    intensity: 0.88,
  }
})
const CROSS_SEGMENTS: PlanarSegment[] = [
  { from: [0, 0.16], to: [0, -0.17], width: 0.011, color: MONAD_ACCENT, intensity: 0.92 },
  { from: [-0.13, 0.02], to: [0.13, 0.02], width: 0.011, color: MONAD_ACCENT, intensity: 0.92 },
]

function MergedTrace({ segments }: { segments: readonly PlanarSegment[] }) {
  const geometry = useMemo(
    () => buildMergedPlanarSegments(segments, 'xy'),
    [segments],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * A press target with no plate behind it.
 *
 * The visible mark is the label; the hit area is an invisible quad sized for a
 * controller ray rather than for the glyph it sits under.
 */
function MonadKey({
  label,
  color = '#7f93a8',
  size = 0.028,
  width = 0.34,
  onPress,
}: {
  label: string
  color?: string
  size?: number
  width?: number
  onPress: () => void
}) {
  return (
    <group {...pressable(onPress)}>
      <TempleText fontSize={size} color={color} anchorX="center" anchorY="middle">
        {label}
      </TempleText>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, 0.1]} />
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

/** How far apart the construction layers stand when the glyph is opened out. */
const LAYER_DEPTH = 0.1

function MonadGlyph({
  phase,
  morphRef,
  exploded,
}: {
  phase: GlyphPhase
  morphRef: ChamberProps['morphRef']
  exploded: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const pointRef = useRef<THREE.MeshBasicMaterial>(null)
  const layersRef = useRef<Array<THREE.Group | null>>([])
  const spreadRef = useRef(0)

  useFrame(({ clock }, delta) => {
    const morph = morphRef.current
    const time = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.scale.setScalar((0.9 + morph * 0.1) * GLYPH_SCALE)
      // Opened out, the figure turns further: the whole point of the exploded
      // view is parallax, and a flat-on stack of planes has none.
      const sway = 0.09 + spreadRef.current * 0.22
      groupRef.current.rotation.y = Math.sin(time * 0.18) * sway
    }

    if (pointRef.current) {
      pointRef.current.opacity = (0.7 + Math.sin(time * 1.4) * 0.3) * morph
    }

    // Ease rather than snap, so the separation reads as an unfolding rather
    // than a state change. Frame-rate independent within a sane delta.
    const target = exploded ? 1 : 0
    spreadRef.current += (target - spreadRef.current) * Math.min(1, delta * 4.5)

    const centre = (GLYPH_PHASES.length - 1) / 2
    layersRef.current.forEach((layer, order) => {
      if (layer) layer.position.z = (order - centre) * LAYER_DEPTH * spreadRef.current
    })
  })

  const show = (target: GlyphPhase) => phaseReached(phase, target)

  return (
    <group ref={groupRef} position={GLYPH_ORIGIN}>
      {/* Each construction step is its own layer so the exploded view can pull
          them apart in depth. Dee's monad is an order of operations, not a
          picture, and depth is the one medium that can show an order without
          animating it away. */}
      <group
        ref={(node) => {
          layersRef.current[0] = node
        }}
      >
        <mesh>
          <circleGeometry args={[0.014, 20]} />
          <meshBasicMaterial
            ref={pointRef}
            color="#ffffff"
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <group
        ref={(node) => {
          layersRef.current[1] = node
        }}
      >
        {show('line') ? <MergedTrace segments={LINE_SEGMENTS} /> : null}
      </group>

      <group
        ref={(node) => {
          layersRef.current[2] = node
        }}
      >
        {show('circle') ? <MergedTrace segments={CIRCLE_SEGMENTS} /> : null}
      </group>

      <group
        ref={(node) => {
          layersRef.current[3] = node
        }}
      >
        {show('sun') ? (
          <mesh position={[0, 0, -0.002]}>
            <circleGeometry args={[0.195, 40]} />
            <meshBasicMaterial
              color={MONAD_ACCENT}
              transparent
              opacity={0.08}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ) : null}
      </group>

      <group
        ref={(node) => {
          layersRef.current[4] = node
        }}
      >
        {show('moon') ? (
          <group position={[0, 0.235, 0]}>
            <MergedTrace segments={MOON_SEGMENTS} />
          </group>
        ) : null}
      </group>

      <group
        ref={(node) => {
          layersRef.current[5] = node
        }}
      >
        {show('cross') ? (
          <group position={[0, -0.33, 0]}>
            <MergedTrace segments={CROSS_SEGMENTS} />
          </group>
        ) : null}
      </group>
    </group>
  )
}

export function MonadArchitecture({ morphRef }: ChamberProps) {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const morph = morphRef.current
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.0004
      ringsRef.current.scale.setScalar(0.7 + morph * 0.3)
    }
  })

  return (
    <group>
      <ambientLight color="#141a22" intensity={0.5} />
      <pointLight position={[0, 2.6, -0.6]} color={MONAD_ACCENT} intensity={3.2} distance={7} />

      <group ref={ringsRef} position={[0, 0.012, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        {[1.1, 1.8, 2.6, 3.5].map((radius, index) => (
          <mesh key={radius}>
            <ringGeometry args={[radius, radius + 0.006, 96]} />
            <meshBasicMaterial
              color={MONAD_ACCENT}
              transparent
              opacity={0.2 - index * 0.035}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function MonadInstrument({ morphRef, active }: ChamberProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [register, setRegister] = useState<CommentaryRegister>('literal')
  const [showSourceNote, setShowSourceNote] = useState(false)
  const [exploded, setExploded] = useState(false)

  const phase = GLYPH_PHASES[phaseIndex]
  const sentences = useMemo(() => sentencesForPhase(phase), [phase])
  const sentence = sentences[Math.min(sentenceIndex, sentences.length - 1)]
  const registers = useMemo(() => registersFor(sentence), [sentence])

  // A register the current sentence does not carry must never stay selected:
  // the commentary layers are partial across the corpus, and holding a stale
  // choice would render an empty band under a confident label.
  const activeRegister = registers.includes(register) ? register : registers[0]
  const commentary = sentence.layers[activeRegister] ?? ''

  const goToPhase = (next: number) => {
    setPhaseIndex(next)
    setSentenceIndex(0)
    setShowSourceNote(false)
  }

  const navigation: Array<{ label: string; color?: string; width?: number; press: () => void }> = [
    { label: '◂ RESET', color: '#7f93a8', press: () => { goToPhase(0); setExploded(false) } },
    {
      label: exploded ? '▪ COLLAPSE' : '◈ OPEN',
      color: exploded ? MONAD_ACCENT : '#7f93a8',
      press: () => setExploded((open) => !open),
    },
    {
      label: showSourceNote ? '▪ NOTE' : '◇ NOTE',
      color: showSourceNote ? '#ffd7a1' : '#7f93a8',
      width: 0.26,
      press: () => setShowSourceNote((open) => !open),
    },
    {
      label: 'ADVANCE ▸',
      color: '#ffffff',
      press: () => goToPhase((phaseIndex + 1) % GLYPH_PHASES.length),
    },
  ]

  // The moon phase carries six sourced sentences and point and sun carry two.
  // Before this the chamber could only ever show the first of them. Cycling on
  // one key keeps every control on a single tested row rather than adding a
  // second row of dots that would have to clear the same zones.
  if (sentences.length > 1) {
    navigation.splice(3, 0, {
      label: `SENTENCE ${sentenceIndex + 1}/${sentences.length} ▸`,
      color: '#9fb3c8',
      width: 0.46,
      press: () => {
        setSentenceIndex((current) => (current + 1) % sentences.length)
        setShowSourceNote(false)
      },
    })
  }

  return (
    <group>
      <MonadGlyph phase={phase} morphRef={morphRef} exploded={exploded} />

      {/* THE SOURCE — nearest and brightest. Dee's own Latin.
          Everything below it is progressively further out and dimmer, so the
          distance from Dee to this edition's reading of him is a distance the
          practitioner physically looks across rather than a caption. */}
      <ScriptureArc
        radius={1.9}
        y={1.88}
        fontSize={0.03}
        color="#ffd7a1"
        opacity={0.9}
        maxWidth={2.5}
        shelf={false}
      >
        {`${MONAS_PROVENANCE_LABELS.latin} · THEOREM ${sentence.theorem}${sentence.provisional ? ' (PREVIEW)' : ''}`}
      </ScriptureArc>

      <ScriptureArc
        radius={1.9}
        y={1.68}
        fontSize={0.054}
        color="#fff3df"
        maxWidth={2.8}
        shelfColor="#ffd7a1"
        shelfOpacity={0.26}
        outlineOpacity={0.16}
      >
        {sentence.latin}
      </ScriptureArc>

      {/* THE TRANSLATION — a step further out. */}
      <ScriptureArc
        radius={2.32}
        y={1.42}
        fontSize={0.026}
        color={MONAD_ACCENT}
        opacity={0.8}
        maxWidth={3.0}
        shelf={false}
      >
        {MONAS_PROVENANCE_LABELS.english}
      </ScriptureArc>

      <ScriptureArc
        radius={2.32}
        y={1.26}
        fontSize={0.044}
        color="#dbe7f5"
        opacity={0.95}
        maxWidth={3.3}
        shelfColor={MONAD_ACCENT}
        shelfOpacity={0.18}
      >
        {sentence.english}
      </ScriptureArc>

      {/* THIS EDITION READING DEE — furthest and coolest. */}
      {showSourceNote ? (
        <ScriptureArc
          radius={2.78}
          y={0.62}
          fontSize={0.034}
          color="#9a8fb5"
          opacity={0.88}
          maxWidth={3.6}
          shelfColor="#ffd7a1"
          shelfOpacity={0.14}
        >
          {`${MONAS_PROVENANCE_LABELS.sourceNote} — ${sentence.sourceNote}`}
        </ScriptureArc>
      ) : (
        <ScriptureArc
          radius={2.78}
          y={0.62}
          fontSize={0.034}
          color="#a99cc4"
          opacity={0.85}
          maxWidth={3.6}
          shelfColor="#8f7fb5"
          shelfOpacity={0.14}
        >
          {commentary}
        </ScriptureArc>
      )}

      {/* Register selector. Only the registers this sentence actually carries
          are offered — the layers are partial across the corpus, and a button
          resolving to nothing would misrepresent what the edition wrote. */}
      {!showSourceNote && registers.length > 1
        ? registers.map((name, i) => {
            const pose = monadRegisterPose(i, registers.length)
            const selected = name === activeRegister
            return (
              <group key={name} position={pose.position} rotation={[0, pose.rotationY, 0]}>
                <MonadKey
                  label={name.toUpperCase()}
                  color={selected ? '#ffffff' : '#6b7f96'}
                  size={0.026}
                  width={0.3}
                  onPress={() => setRegister(name)}
                />
              </group>
            )
          })
        : null}

      {navigation.map((control, i) => {
        const pose = monadControlPose(i, navigation.length)
        return (
          <group key={control.label} position={pose.position} rotation={[0, pose.rotationY, 0]}>
            <MonadKey
              label={control.label}
              color={control.color}
              width={control.width}
              onPress={control.press}
            />
          </group>
        )
      })}

      {/* Phase track, centred beneath the glyph rather than beneath the
          lectern, so progress reads against the thing that is progressing. */}
      <group position={[0, 1.33, -1.5]}>
        {GLYPH_PHASES.map((glyphPhase, i) => (
          <mesh
            key={glyphPhase}
            position={[(i - (GLYPH_PHASES.length - 1) / 2) * 0.085, 0, 0]}
          >
            <circleGeometry args={[0.014, 16]} />
            <meshBasicMaterial
              color={MONAD_ACCENT}
              transparent
              opacity={active && phaseReached(phase, glyphPhase) ? 0.9 : 0.14}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Scope, stated in the room. Five of Dee's twenty-four theorems are
          represented; the rest are absent, not summarised. */}
      <ScriptureArc
        radius={2.78}
        y={0.4}
        fontSize={0.022}
        color="#544c68"
        maxWidth={3.4}
        shelf={false}
      >
        {`SOURCED FRAGMENT · THEOREMS ${MONAS_CORPUS_SCOPE.coveredTheorems.join(', ')} OF ${MONAS_CORPUS_SCOPE.theoremsInWork}`}
      </ScriptureArc>
    </group>
  )
}
