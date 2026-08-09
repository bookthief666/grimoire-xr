import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  GLYPH_PHASES,
  THEOREMS,
  phaseReached,
  type GlyphPhase,
} from '../../tools/monas'
import type { ChamberProps } from './types'
import { TempleText } from '../TempleText'
import { pressable } from '../pressable'

/**
 * THE MONAD — monas-hieroglyphica
 *
 * John Dee's monad is not a picture, it is a construction with an order of
 * operations: a point extends into a line, the line sweeps a circle, sun and
 * moon are set upon it, and the cross of the elements completes the figure.
 * The source project animates exactly those six phases in SVG.
 *
 * In here the construction happens in the air at arm's length instead, one
 * theorem at a time, with Dee's Latin and the working English on the lectern
 * beneath it. The room is white-on-black and Platonic — compass-and-straightedge
 * rather than candle-smoke — so it reads as the inside of a geometric proof.
 */

export const MONAD_ACCENT = '#d8e8ff'

const GLYPH_ORIGIN: [number, number, number] = [0, 1.86, -1.15]

/** A straight segment drawn as a thin additive plane. */
function Segment({
  from,
  to,
  width = 0.008,
  color = MONAD_ACCENT,
  opacity = 0.9,
}: {
  from: [number, number]
  to: [number, number]
  width?: number
  color?: string
  opacity?: number
}) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy)

  return (
    <mesh
      position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0]}
      rotation={[0, 0, Math.atan2(dy, dx)]}
    >
      <planeGeometry args={[len, width]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * The monad itself, assembled in phase order.
 *
 * Each element fades in only once the construction has reached its phase, so
 * stepping forward genuinely builds the figure rather than cross-fading between
 * finished pictures.
 */
function MonadGlyph({
  phase,
  morphRef,
}: {
  phase: GlyphPhase
  morphRef: ChamberProps['morphRef']
}) {
  const groupRef = useRef<THREE.Group>(null)
  const pointRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    const m = morphRef.current
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.9 + m * 0.1)
      groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.09
    }

    if (pointRef.current) {
      pointRef.current.opacity = (0.7 + Math.sin(t * 1.4) * 0.3) * m
    }
  })

  const show = (p: GlyphPhase) => (phaseReached(phase, p) ? 1 : 0)

  const circlePoints = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2
      return [Math.cos(a) * 0.2, Math.sin(a) * 0.2] as [number, number]
    })
  }, [])

  return (
    <group ref={groupRef} position={GLYPH_ORIGIN}>
      {/* THE POINT — indivisible, the origin of everything that follows. */}
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

      {/* THE LINE — the point in motion. */}
      {show('line') ? (
        <Segment from={[0, 0]} to={[0, 0.34]} opacity={0.75} />
      ) : null}

      {/* THE CIRCLE — the line swept about the point. */}
      {show('circle')
        ? circlePoints.map((p, i) => {
            const next = circlePoints[(i + 1) % circlePoints.length]
            return <Segment key={i} from={p} to={next} width={0.007} opacity={0.62} />
          })
        : null}

      {/* THE SUN — the circle with its centre restored. */}
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

      {/* THE MOON — the crescent set above, shining by borrowed light. */}
      {show('moon') ? (
        <group position={[0, 0.235, 0]}>
          {Array.from({ length: 24 }, (_, i) => {
            const a = Math.PI * (0.08 + (i / 23) * 0.84)
            const b = Math.PI * (0.08 + ((i + 1) / 23) * 0.84)
            const r = 0.17
            return (
              <Segment
                key={i}
                from={[Math.cos(a) * r, Math.sin(a) * r * 0.72]}
                to={[Math.cos(b) * r, Math.sin(b) * r * 0.72]}
                width={0.009}
                opacity={0.88}
                color="#f4f8ff"
              />
            )
          })}
        </group>
      ) : null}

      {/* THE CROSS OF THE ELEMENTS — the quaternary that completes the engine. */}
      {show('cross') ? (
        <group position={[0, -0.33, 0]}>
          <Segment from={[0, 0.16]} to={[0, -0.17]} width={0.011} opacity={0.92} />
          <Segment from={[-0.13, 0.02]} to={[0.13, 0.02]} width={0.011} opacity={0.92} />
          {/* The ternary hidden in the quaternary: the twin arcs beneath. */}
          <group position={[0, -0.2, 0]}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = Math.PI * (1.05 + (i / 13) * 0.9)
              const b = Math.PI * (1.05 + ((i + 1) / 13) * 0.9)
              const r = 0.07
              return (
                <Segment
                  key={`l${i}`}
                  from={[-0.055 + Math.cos(a) * r, Math.sin(a) * r]}
                  to={[-0.055 + Math.cos(b) * r, Math.sin(b) * r]}
                  width={0.008}
                  opacity={0.7}
                />
              )
            })}
            {Array.from({ length: 14 }, (_, i) => {
              const a = Math.PI * (1.05 + (i / 13) * 0.9)
              const b = Math.PI * (1.05 + ((i + 1) / 13) * 0.9)
              const r = 0.07
              return (
                <Segment
                  key={`r${i}`}
                  from={[0.055 + Math.cos(a) * r, Math.sin(a) * r]}
                  to={[0.055 + Math.cos(b) * r, Math.sin(b) * r]}
                  width={0.008}
                  opacity={0.7}
                />
              )
            })}
          </group>
        </group>
      ) : null}
    </group>
  )
}

export function MonadArchitecture({ morphRef }: ChamberProps) {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const m = morphRef.current

    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.0004
      ringsRef.current.scale.setScalar(0.7 + m * 0.3)
    }
  })

  return (
    <group>
      {/* No chamber shell. The rotunda (floor, colonnade, dome) is now the
          room, shared by every chamber. A local shell here would sit inside the
          colonnade at radius 6.4 and occlude it entirely. */}

      <ambientLight color="#141a22" intensity={0.5} />
      <pointLight position={[0, 2.6, -0.6]} color={MONAD_ACCENT} intensity={3.2} distance={7} />

      {/* Concentric construction rings on the floor: compass work, drawn large. */}
      <group ref={ringsRef} position={[0, 0.012, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        {[1.1, 1.8, 2.6, 3.5].map((r, i) => (
          <mesh key={r}>
            <ringGeometry args={[r, r + 0.006, 96]} />
            <meshBasicMaterial
              color={MONAD_ACCENT}
              transparent
              opacity={0.2 - i * 0.035}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Radial straightedge marks at the cardinal quarters. */}
        {[0, 1, 2, 3].map((q) => {
          const a = (q / 4) * Math.PI * 2
          return (
            <mesh
              key={q}
              position={[Math.cos(a) * 2.3, Math.sin(a) * 2.3, 0]}
              rotation={[0, 0, a]}
            >
              <planeGeometry args={[2.4, 0.004]} />
              <meshBasicMaterial
                color={MONAD_ACCENT}
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function MonadInstrument({ morphRef, active }: ChamberProps) {
  const [index, setIndex] = useState(0)
  const theorem = THEOREMS[index]
  const lecternRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const m = morphRef.current
    if (lecternRef.current) {
      lecternRef.current.scale.setScalar(0.88 + m * 0.12)
    }
  })

  return (
    <group>
      <MonadGlyph phase={theorem.phase} morphRef={morphRef} />

      {/* The lectern: Dee's Latin beside the working English, per the source
          project's principle of never showing one without the other. */}
      <group ref={lecternRef} position={[0, 1.30, -0.95]} rotation={[-0.34, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.12, 0.44]} />
          <meshBasicMaterial
            color="#03060a"
            transparent
            opacity={0.86}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, 0.222, 0.001]}>
          <planeGeometry args={[1.12, 0.0035]} />
          <meshBasicMaterial
            color={MONAD_ACCENT}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <TempleText
          position={[-0.53, 0.176, 0.006]}
          fontSize={0.028}
          color={MONAD_ACCENT}
          anchorX="left"
          anchorY="middle"
        >
          {`THEOREMA ${['I', 'II', 'III', 'IV', 'V', 'VI'][index] ?? theorem.number}  ·  ${theorem.title.toUpperCase()}`}
        </TempleText>

        <TempleText
          position={[-0.53, 0.1, 0.006]}
          fontSize={0.026}
          color="#9fb4cc"
          anchorX="left"
          anchorY="top"
          maxWidth={1.04}
          lineHeight={1.28}
        >
          {theorem.latin}
        </TempleText>

        <TempleText
          position={[-0.53, -0.012, 0.006]}
          fontSize={0.026}
          color="#f2f6fb"
          anchorX="left"
          anchorY="top"
          maxWidth={1.04}
          lineHeight={1.28}
        >
          {theorem.english}
        </TempleText>

        <TempleText
          position={[-0.53, -0.124, 0.006]}
          fontSize={0.025}
          color="#6b7f96"
          anchorX="left"
          anchorY="top"
          maxWidth={1.04}
          lineHeight={1.36}
        >
          {theorem.commentary}
        </TempleText>

        <group position={[0.4, -0.19, 0.01]} {...pressable(() => setIndex((i) => (i + 1) % THEOREMS.length))}>
          <TempleText fontSize={0.03} color="#ffffff" anchorX="center" anchorY="middle">
            ADVANCE ▸
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.34, 0.1]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.001}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        <group position={[-0.36, -0.19, 0.01]} {...pressable(() => setIndex(0))}>
          <TempleText fontSize={0.03} color="#7f93a8" anchorX="center" anchorY="middle">
            ◂ RESET
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.3, 0.1]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.001}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {/* Phase pips: how far the construction has come. */}
      <group position={[0, 1.02, -0.86]}>
        {GLYPH_PHASES.map((p, i) => (
          <mesh key={p} position={[(i - (GLYPH_PHASES.length - 1) / 2) * 0.062, 0, 0]}>
            <circleGeometry args={[0.011, 16]} />
            <meshBasicMaterial
              color={MONAD_ACCENT}
              transparent
              opacity={active && phaseReached(theorem.phase, p) ? 0.9 : 0.14}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
