import { useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PATHS,
  SEPHIROTH,
  drawChapters,
  englishOrdinal,
  theosophicReduction,
  type ChapterDraw,
} from '../../tools/liber333'
import type { ChamberProps } from './types'

/**
 * THE CHAPEL OF LIES — liber-333-grimoire
 *
 * Companion to Crowley's *Book of Lies*: 94 chapters attributed across the Tree
 * of Life, drawn deterministically from the English Ordinal gematria of the
 * question.
 *
 * Rather than putting a Tree diagram on a panel, here **the Tree is the room** —
 * ten sephiroth hang as lamps at architectural scale behind the altar, the
 * twenty-two paths are lit channels between them, and the sephira a drawn
 * chapter belongs to ignites. A Triad raises three inscriptions:
 * Thesis, Antithesis, Synthesis.
 *
 * Only the deterministic half is ported. The source project's server-owned
 * interpretation prompt is out of scope, so the Chapel runs offline: it draws and
 * attributes chapters, it does not invent their commentary.
 */

export const CHAPEL_ACCENT = '#9a6bff'

/** Tree units → world. The Tree stands behind and above the altar. */
const TREE_SCALE = 0.72
const TREE_ORIGIN: [number, number, number] = [0, 0.55, -3.15]

function treeToWorld(pos: readonly [number, number]): [number, number, number] {
  return [
    TREE_ORIGIN[0] + pos[0] * TREE_SCALE,
    TREE_ORIGIN[1] + pos[1] * TREE_SCALE,
    TREE_ORIGIN[2],
  ]
}

function PathChannel({
  from,
  to,
  lit,
  morphRef,
}: {
  from: readonly [number, number]
  to: readonly [number, number]
  lit: boolean
  morphRef: ChamberProps['morphRef']
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  const a = treeToWorld(from)
  const b = treeToWorld(to)
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 0.8) * 0.5
    matRef.current.opacity = (lit ? 0.42 + pulse * 0.24 : 0.09) * morphRef.current
  })

  return (
    <mesh
      position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]]}
      rotation={[0, 0, Math.atan2(dy, dx)]}
    >
      <planeGeometry args={[len, 0.014]} />
      <meshBasicMaterial
        ref={matRef}
        color={CHAPEL_ACCENT}
        transparent
        opacity={0.09}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function SephiraLamp({
  sephira,
  lit,
  morphRef,
}: {
  sephira: (typeof SEPHIROTH)[number]
  lit: boolean
  morphRef: ChamberProps['morphRef']
}) {
  const coreRef = useRef<THREE.MeshBasicMaterial>(null)
  const haloRef = useRef<THREE.MeshBasicMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  const world = treeToWorld(sephira.position)

  useFrame(({ clock }) => {
    const m = morphRef.current
    const t = clock.getElapsedTime()
    const pulse = 0.5 + Math.sin(t * 0.7 + sephira.index * 0.6) * 0.5

    if (coreRef.current) {
      coreRef.current.opacity = (lit ? 0.95 : 0.3 + pulse * 0.1) * m
    }
    if (haloRef.current) {
      haloRef.current.opacity = (lit ? 0.22 + pulse * 0.12 : 0.04) * m
    }
    if (groupRef.current) {
      groupRef.current.scale.setScalar((lit ? 1.18 : 1) * (0.7 + m * 0.3))
    }
  })

  return (
    <group ref={groupRef} position={world}>
      <mesh>
        <circleGeometry args={[0.085, 28]} />
        <meshBasicMaterial
          ref={coreRef}
          color={sephira.color}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0, -0.002]}>
        <circleGeometry args={[0.3, 28]} />
        <meshBasicMaterial
          ref={haloRef}
          color={sephira.color}
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.092, 0.099, 32]} />
        <meshBasicMaterial
          color={sephira.color}
          transparent
          opacity={lit ? 0.85 : 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {lit ? (
        <Text
          position={[0, -0.15, 0.01]}
          fontSize={0.055}
          color={sephira.color}
          anchorX="center"
          anchorY="middle"
        >
          {sephira.name.toUpperCase()}
        </Text>
      ) : null}
    </group>
  )
}

export function ChapelArchitecture({ morphRef }: ChamberProps) {
  const shellRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (shellRef.current) shellRef.current.scale.setScalar(0.55 + morphRef.current * 0.45)
  })

  return (
    <group>
      <mesh ref={shellRef}>
        <sphereGeometry args={[14, 28, 16]} />
        <meshBasicMaterial color="#04030a" side={THREE.BackSide} />
      </mesh>

      <ambientLight color="#120e1e" intensity={0.45} />
      <pointLight position={[0, 2.2, -2.4]} color={CHAPEL_ACCENT} intensity={4} distance={9} />
      <pointLight position={[0, 1.4, -0.4]} color="#ffd18a" intensity={1.6} distance={4} />
    </group>
  )
}

export function ChapelInstrument({ morphRef, active }: ChamberProps) {
  const [mode, setMode] = useState<'single' | 'triad'>('triad')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [draws, setDraws] = useState<ChapterDraw[]>([])

  const questions = useMemo(
    () => [
      'What is the hidden cost of this Will?',
      'What must be destroyed before it can proceed?',
      'Where am I lying to myself?',
      'What ordeal is being offered to me?',
      'What is ripe and asking to be taken?',
    ],
    [],
  )

  const question = questions[questionIndex]
  const gematria = englishOrdinal(question)

  const litSephiroth = useMemo(
    () => new Set(draws.map((d) => d.sephira.index)),
    [draws],
  )

  const litPaths = useMemo(() => {
    return new Set(
      PATHS.map((p, i) =>
        litSephiroth.has(p[0]) && litSephiroth.has(p[1]) ? i : -1,
      ).filter((i) => i >= 0),
    )
  }, [litSephiroth])

  const press = (fn: () => void) => ({
    onPointerDown: (event: { stopPropagation: () => void }) => {
      event.stopPropagation()
    },
    onPointerUp: (event: { stopPropagation: () => void }) => {
      event.stopPropagation()
      fn()
    },
  })

  return (
    <group>
      {/* THE TREE AS ARCHITECTURE */}
      <group>
        {PATHS.map((p, i) => (
          <PathChannel
            key={`${p[0]}-${p[1]}`}
            from={SEPHIROTH[p[0]].position}
            to={SEPHIROTH[p[1]].position}
            lit={active && litPaths.has(i)}
            morphRef={morphRef}
          />
        ))}

        {SEPHIROTH.map((s) => (
          <SephiraLamp
            key={s.name}
            sephira={s}
            lit={active && litSephiroth.has(s.index)}
            morphRef={morphRef}
          />
        ))}
      </group>

      {/* THE ORACLE DESK */}
      <group position={[0, 1.16, -0.86]} rotation={[-0.36, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.34]} />
          <meshBasicMaterial
            color="#06040d"
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Text
          position={[0, 0.115, 0.006]}
          fontSize={0.028}
          color="#e8dcff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.1}
        >
          {question}
        </Text>

        <Text
          position={[0, 0.058, 0.006]}
          fontSize={0.019}
          color={CHAPEL_ACCENT}
          anchorX="center"
          anchorY="middle"
        >
          {`ENGLISH ORDINAL ${gematria}  ·  REDUCED ${theosophicReduction(gematria)}`}
        </Text>

        <group position={[-0.4, -0.02, 0.01]} {...press(() => {
          setQuestionIndex((i) => (i + 1) % questions.length)
          setDraws([])
        })}>
          <Text fontSize={0.026} color="#9a8fb5" anchorX="center" anchorY="middle">
            QUESTION ▸
          </Text>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.34, 0.09]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group position={[0, -0.02, 0.01]} {...press(() => {
          setMode((m) => (m === 'single' ? 'triad' : 'single'))
          setDraws([])
        })}>
          <Text fontSize={0.026} color="#9a8fb5" anchorX="center" anchorY="middle">
            {mode.toUpperCase()}
          </Text>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.26, 0.09]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group position={[0.4, -0.02, 0.01]} {...press(() => setDraws(drawChapters(question, mode)))}>
          <Text fontSize={0.028} color="#ffffff" anchorX="center" anchorY="middle">
            CONSULT
          </Text>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.32, 0.09]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.001} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <Text
          position={[0, -0.115, 0.006]}
          fontSize={0.016}
          color="#5d5474"
          anchorX="center"
          anchorY="middle"
        >
          {draws.length
            ? 'THE TREE ANSWERS'
            : 'THE SAME QUESTION ALWAYS DRAWS THE SAME CHAPTERS'}
        </Text>
      </group>

      {/* THE INSCRIPTIONS */}
      {draws.map((draw, i) => {
        const spread = draws.length === 1 ? 0 : (i - 1) * 0.66
        return (
          <group key={draw.position} position={[spread, 1.74, -1.62]}>
            <mesh>
              <planeGeometry args={[0.6, 0.5]} />
              <meshBasicMaterial
                color="#07040f"
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh position={[0, 0, 0.002]}>
              <ringGeometry args={[0.3, 0.307, 40]} />
              <meshBasicMaterial
                color={draw.sephira.color}
                transparent
                opacity={0.4}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            <Text
              position={[0, 0.185, 0.008]}
              fontSize={0.026}
              color={draw.sephira.color}
              anchorX="center"
              anchorY="middle"
            >
              {draw.position.toUpperCase()}
            </Text>

            <Text
              position={[0, 0.06, 0.008]}
              fontSize={0.12}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {String(draw.number)}
            </Text>

            <Text
              position={[0, -0.06, 0.008]}
              fontSize={0.026}
              color="#cbbde8"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.52}
            >
              {`CHAPTER ${draw.number}`}
            </Text>

            <Text
              position={[0, -0.13, 0.008]}
              fontSize={0.022}
              color={draw.sephira.color}
              anchorX="center"
              anchorY="middle"
              maxWidth={0.54}
            >
              {draw.sephira.name}
            </Text>

            <Text
              position={[0, -0.185, 0.008]}
              fontSize={0.017}
              color="#6b6082"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.54}
            >
              {draw.sephira.title}
            </Text>
          </group>
        )
      })}
    </group>
  )
}
