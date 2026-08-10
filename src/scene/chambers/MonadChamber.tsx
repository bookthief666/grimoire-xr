import { useMemo, useRef, useState } from 'react'
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

export const MONAD_ACCENT = '#d8e8ff'

const GLYPH_ORIGIN: [number, number, number] = [0, 1.86, -1.15]

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
  const length = Math.hypot(dx, dy)

  return (
    <mesh
      position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0]}
      rotation={[0, 0, Math.atan2(dy, dx)]}
    >
      <planeGeometry args={[length, width]} />
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

function CircleTrace({ radius, opacity }: { radius: number; opacity: number }) {
  const points = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2
        return [Math.cos(angle) * radius, Math.sin(angle) * radius] as [number, number]
      }),
    [radius],
  )

  return (
    <>
      {points.map((point, index) => (
        <Segment
          key={index}
          from={point}
          to={points[(index + 1) % points.length]}
          width={0.007}
          opacity={opacity}
        />
      ))}
    </>
  )
}

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
    const morph = morphRef.current
    const time = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.9 + morph * 0.1)
      groupRef.current.rotation.y = Math.sin(time * 0.18) * 0.09
    }

    if (pointRef.current) {
      pointRef.current.opacity = (0.7 + Math.sin(time * 1.4) * 0.3) * morph
    }
  })

  const show = (target: GlyphPhase) => phaseReached(phase, target)

  return (
    <group ref={groupRef} position={GLYPH_ORIGIN}>
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

      {show('line') ? <Segment from={[0, 0]} to={[0, 0.34]} opacity={0.75} /> : null}
      {show('circle') ? <CircleTrace radius={0.2} opacity={0.62} /> : null}

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

      {show('moon') ? (
        <group position={[0, 0.235, 0]}>
          {Array.from({ length: 24 }, (_, index) => {
            const a = Math.PI * (0.08 + (index / 23) * 0.84)
            const b = Math.PI * (0.08 + ((index + 1) / 23) * 0.84)
            const radius = 0.17
            return (
              <Segment
                key={index}
                from={[Math.cos(a) * radius, Math.sin(a) * radius * 0.72]}
                to={[Math.cos(b) * radius, Math.sin(b) * radius * 0.72]}
                width={0.009}
                opacity={0.88}
                color="#f4f8ff"
              />
            )
          })}
        </group>
      ) : null}

      {show('cross') ? (
        <group position={[0, -0.33, 0]}>
          <Segment from={[0, 0.16]} to={[0, -0.17]} width={0.011} opacity={0.92} />
          <Segment from={[-0.13, 0.02]} to={[0.13, 0.02]} width={0.011} opacity={0.92} />
        </group>
      ) : null}
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
  const phase = THEOREMS[index]
  const lecternRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const morph = morphRef.current
    if (lecternRef.current) lecternRef.current.scale.setScalar(0.88 + morph * 0.12)
  })

  return (
    <group>
      <MonadGlyph phase={phase.phase} morphRef={morphRef} />

      <group ref={lecternRef} position={[0, 1.3, -0.95]} rotation={[-0.34, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.24, 0.56]} />
          <meshBasicMaterial color="#03060a" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>

        <TempleText
          position={[-0.58, 0.225, 0.006]}
          fontSize={0.025}
          color={MONAD_ACCENT}
          anchorX="left"
          anchorY="middle"
        >
          {`${provenanceLabel(MONAS_PROVENANCE)} · PHASE ${index + 1}/${THEOREMS.length}`}
        </TempleText>

        <TempleText
          position={[-0.58, 0.17, 0.006]}
          fontSize={0.032}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          {phase.title.toUpperCase()}
        </TempleText>

        <TempleText
          position={[-0.58, 0.105, 0.006]}
          fontSize={0.024}
          color="#77889b"
          anchorX="left"
          anchorY="top"
          maxWidth={1.12}
        >
          {MONAS_PROVENANCE.claim}
        </TempleText>

        <TempleText
          position={[-0.58, -0.01, 0.006]}
          fontSize={0.026}
          color="#f2f6fb"
          anchorX="left"
          anchorY="top"
          maxWidth={1.12}
          lineHeight={1.28}
        >
          {phase.english}
        </TempleText>

        <TempleText
          position={[-0.58, -0.13, 0.006]}
          fontSize={0.023}
          color="#6b7f96"
          anchorX="left"
          anchorY="top"
          maxWidth={1.12}
          lineHeight={1.32}
        >
          {phase.commentary}
        </TempleText>

        <group
          position={[0.42, -0.235, 0.01]}
          {...pressable(() => setIndex((current) => (current + 1) % THEOREMS.length))}
        >
          <TempleText fontSize={0.03} color="#ffffff" anchorX="center" anchorY="middle">
            ADVANCE ▸
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.34, 0.1]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group position={[-0.42, -0.235, 0.01]} {...pressable(() => setIndex(0))}>
          <TempleText fontSize={0.03} color="#7f93a8" anchorX="center" anchorY="middle">
            ◂ RESET
          </TempleText>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.3, 0.1]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      <group position={[0, 1.0, -0.86]}>
        {GLYPH_PHASES.map((glyphPhase, phaseIndex) => (
          <mesh
            key={glyphPhase}
            position={[(phaseIndex - (GLYPH_PHASES.length - 1) / 2) * 0.062, 0, 0]}
          >
            <circleGeometry args={[0.011, 16]} />
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
