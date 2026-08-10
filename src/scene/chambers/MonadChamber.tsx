import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  GLYPH_PHASES,
  MONAS_PROVENANCE,
  THEOREMS,
  phaseReached,
  type GlyphPhase,
} from '../../tools/monas'
import { provenanceLabel } from '../../tools/provenance'
import type { ChamberProps } from './types'
import { TempleText } from '../TempleText'
import { pressable } from '../pressable'
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
 * It used to sit at [0, 1.86, -1.15] with the lectern directly beneath it at
 * [0, 1.36, -0.95]. Tilted back, the lectern's top edge reached about +6 deg
 * above the horizon while the glyph's lower half sat below it, so the panel
 * drew straight over the construction it exists to explain. The lectern has
 * moved off-axis and down to reading angle; the glyph took the centre.
 */
const GLYPH_ORIGIN: [number, number, number] = [0, 2.0, -1.55]
const GLYPH_SCALE = 1.32
const LECTERN_WIDTH = 1.34
const LECTERN_HEIGHT = 0.84
const LECTERN_TEXT_WIDTH = 1.2

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
  const [index, setIndex] = useState(0)
  const [exploded, setExploded] = useState(false)
  const phase = THEOREMS[index]
  const lecternRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const morph = morphRef.current
    if (lecternRef.current) lecternRef.current.scale.setScalar(0.88 + morph * 0.12)
  })

  return (
    <group>
      <MonadGlyph phase={phase.phase} morphRef={morphRef} exploded={exploded} />

      {/* Off the forward axis and angled back toward the practitioner: a
          lectern beside the work, not a panel across it. */}
      <group ref={lecternRef} position={[-0.95, 1.34, -0.98]} rotation={[-0.24, 0.5, 0]}>
        <mesh>
          <planeGeometry args={[LECTERN_WIDTH, LECTERN_HEIGHT]} />
          <meshBasicMaterial color="#03060a" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>

        <TempleText
          position={[-0.62, 0.29, 0.006]}
          fontSize={0.024}
          color={MONAD_ACCENT}
          anchorX="left"
          anchorY="middle"
          maxWidth={LECTERN_TEXT_WIDTH}
        >
          {`${provenanceLabel(MONAS_PROVENANCE)} · PHASE ${index + 1}/${THEOREMS.length}`}
        </TempleText>

        <TempleText
          position={[-0.62, 0.23, 0.006]}
          fontSize={0.032}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
          maxWidth={LECTERN_TEXT_WIDTH}
        >
          {phase.title.toUpperCase()}
        </TempleText>

        <TempleText
          position={[-0.62, 0.17, 0.006]}
          fontSize={0.022}
          color="#77889b"
          anchorX="left"
          anchorY="top"
          maxWidth={LECTERN_TEXT_WIDTH}
          lineHeight={1.25}
        >
          {MONAS_PROVENANCE.claim}
        </TempleText>

        <TempleText
          position={[-0.62, 0.02, 0.006]}
          fontSize={0.024}
          color="#f2f6fb"
          anchorX="left"
          anchorY="top"
          maxWidth={LECTERN_TEXT_WIDTH}
          lineHeight={1.28}
        >
          {phase.english}
        </TempleText>

        <TempleText
          position={[-0.62, -0.15, 0.006]}
          fontSize={0.021}
          color="#6b7f96"
          anchorX="left"
          anchorY="top"
          maxWidth={LECTERN_TEXT_WIDTH}
          lineHeight={1.3}
        >
          {phase.commentary}
        </TempleText>

        <group
          position={[0.42, 0.4, 0.01]}
          {...pressable(() => setIndex((current) => (current + 1) % THEOREMS.length))}
        >
          <TempleText fontSize={0.029} color="#ffffff" anchorX="center" anchorY="middle">
            ADVANCE ▸
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.38, 0.11]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group position={[-0.5, 0.4, 0.01]} {...pressable(() => setIndex(0))}>
          <TempleText fontSize={0.029} color="#7f93a8" anchorX="center" anchorY="middle">
            ◂ RESET
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.34, 0.11]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Pull the construction apart in depth. Dee's argument is that the
            monad is assembled in a fixed order; flat, that order is only
            visible while it animates. Separated, it stays readable. */}
        <group position={[-0.02, 0.4, 0.01]} {...pressable(() => setExploded((open) => !open))}>
          <TempleText
            fontSize={0.026}
            color={exploded ? MONAD_ACCENT : '#7f93a8'}
            anchorX="center"
            anchorY="middle"
          >
            {exploded ? '▪ COLLAPSE' : '◈ OPEN'}
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.4, 0.11]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Phase track, centred beneath the glyph rather than beneath the
          lectern, so progress reads against the thing that is progressing. */}
      <group position={[0, 1.33, -1.5]}>
        {GLYPH_PHASES.map((glyphPhase, phaseIndex) => (
          <mesh
            key={glyphPhase}
            position={[(phaseIndex - (GLYPH_PHASES.length - 1) / 2) * 0.085, 0, 0]}
          >
            <circleGeometry args={[0.014, 16]} />
            <meshBasicMaterial
              color={MONAD_ACCENT}
              transparent
              opacity={active && phaseReached(phase.phase, glyphPhase) ? 0.9 : 0.14}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
