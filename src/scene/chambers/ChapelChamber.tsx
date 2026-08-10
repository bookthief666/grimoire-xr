import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PATHS,
  SEPHIROTH,
  calculateGematria,
  drawReading,
  isVeil,
  sephiraForRecord,
  type ChapterDraw,
  type Reading,
} from '../../tools/liber333'
import { LIBER333_PROVENANCE_LABELS } from '../../tools/provenance'
import { buildReaderPages } from './readerPagination'
import type { ChamberProps } from './types'
import { TempleText } from '../TempleText'
import { pressable } from '../pressable'

/**
 * THE CHAPEL OF LIES — liber-333-grimoire
 *
 * The real 94-record corpus is now present: two preliminary veils followed by
 * Chapters 0–91, each with Crowley's verse, the edition's editorial commentary,
 * and its correspondence fields. The chamber previously declared a chapter
 * count and held no chapters, so a draw produced a bare number the room could
 * not show.
 *
 * Rather than putting a Tree diagram on a panel, here **the Tree is the room** —
 * ten sephiroth hang as lamps at architectural scale behind the altar, the
 * twenty-two paths are lit channels between them, and the sephira named by the
 * drawn record ignites. A Triad raises three inscriptions: Thesis, Antithesis,
 * Synthesis. Each is a door into the chapter reader.
 *
 * The Sephira comes from the record, not from arithmetic on its number. A
 * record whose sephira lies outside the Tree — the two veils, Ain Soph and
 * Ain Soph Aur — lights nothing rather than being forced onto a node.
 *
 * Still offline: the source project's server-owned AI Oracle is out of scope
 * for this slice, and the chamber invents no interpretation of its own. What it
 * displays is either Crowley's text or the edition's commentary, and it says
 * which.
 */

export const CHAPEL_ACCENT = '#9a6bff'

/**
 * Tree units → world.
 *
 * Keep the lowest lamp above the oracle-desk sightline. The previous origin put
 * Yesod/Malkuth behind the near desk in the flat verification camera; lifting
 * the whole Tree preserves its symmetry and keeps the instrument readable from
 * the fixed XR origin without moving individual Sephiroth out of topology.
 */
const TREE_SCALE = 1.25
const TREE_ORIGIN: [number, number, number] = [0, 1.15, -4.1]
const ORACLE_DESK_POSITION: [number, number, number] = [0, 0.92, -0.98]

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
        <TempleText
          position={[0, -0.15, 0.01]}
          fontSize={0.055}
          color={sephira.color}
          anchorX="center"
          anchorY="middle"
        >
          {sephira.name.toUpperCase()}
        </TempleText>
      ) : null}
    </group>
  )
}

export function ChapelArchitecture() {
  return (
    <group>
      {/* No chamber shell. The rotunda (floor, colonnade, dome) is now the
          room, shared by every chamber. A local shell here would sit inside the
          colonnade at radius 6.4 and occlude it entirely. */}

      <ambientLight color="#120e1e" intensity={0.45} />
      <pointLight position={[0, 2.2, -2.4]} color={CHAPEL_ACCENT} intensity={4} distance={9} />
      <pointLight position={[0, 1.4, -0.4]} color="#ffd18a" intensity={1.6} distance={4} />
    </group>
  )
}

function TinyButton({
  label,
  color = '#9a8fb5',
  size = 0.026,
  width = 0.3,
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
        <planeGeometry args={[width, 0.09]} />
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

/**
 * The chapter reader.
 *
 * Placed off the forward axis and turned toward the practitioner, for the same
 * reason the Monad's lectern is: a reading panel on the axis draws over the
 * architecture it is explaining. Its controls sit along the top edge, clear of
 * the altar selector row, which otherwise wins the raycast.
 *
 * Source verse and editorial commentary are separated and separately labelled.
 * The commentary in this corpus is modern editorial interpretation supplied by
 * the edition; rendering it in the same voice as the verse would present it as
 * Crowley's.
 */
function ChapterReader({
  draw,
  page,
  onPage,
  onClose,
}: {
  draw: ChapterDraw
  page: number
  onPage: (next: number) => void
  onClose: () => void
}) {
  const record = draw.record
  const veil = isVeil(record)
  const sephira = sephiraForRecord(record)
  const accent = sephira?.color ?? CHAPEL_ACCENT

  const pages = useMemo(
    () => buildReaderPages(record.text, record.commentary),
    [record.text, record.commentary],
  )

  const index = Math.min(page, pages.length - 1)
  const current = pages[index]
  const isVerse = current.kind === 'verse'

  return (
    <group position={[-1.02, 1.5, -1.16]} rotation={[-0.16, 0.52, 0]}>
      <mesh>
        <planeGeometry args={[1.42, 0.94]} />
        <meshBasicMaterial color="#06040d" transparent opacity={0.93} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[1.46, 0.98]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Controls along the top edge, away from the altar console.
          Spacing is deliberate: at 0.5 and 0.62 the NEXT and CLOSE hit planes
          overlapped between local x 0.56 and 0.65, so CLOSE swallowed presses
          meant for NEXT and dismissed the reader instead of turning the page.
          Panel half-width is 0.71; these four spans are disjoint inside it. */}
      <group position={[-0.52, 0.41, 0.012]}>
        <TinyButton label="◂ PREV" onPress={() => onPage(Math.max(0, index - 1))} />
      </group>
      <group position={[-0.16, 0.41, 0.012]}>
        <TinyButton
          label={`${index + 1}/${pages.length}`}
          color="#5d5474"
          width={0.22}
          onPress={() => onPage(0)}
        />
      </group>
      <group position={[0.2, 0.41, 0.012]}>
        <TinyButton label="NEXT ▸" onPress={() => onPage(Math.min(pages.length - 1, index + 1))} />
      </group>
      <group position={[0.58, 0.41, 0.012]}>
        <TinyButton label="✕ CLOSE" color="#7a6f92" width={0.16} size={0.022} onPress={onClose} />
      </group>

      <TempleText
        position={[-0.66, 0.29, 0.008]}
        fontSize={0.021}
        color={accent}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.3}
      >
        {veil
          ? `PRELIMINARY VEIL · ${record.sephira}`
          : `CHAPTER ${record.chapter} · ${record.sephira}${record.tarot !== '—' ? ` · ${record.tarot}` : ''}`}
      </TempleText>

      <TempleText
        position={[-0.66, 0.21, 0.008]}
        fontSize={0.034}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.3}
      >
        {record.title}
      </TempleText>

      {/* Provenance tier of the page currently shown, in the edition's own
          wording. This is the label that keeps commentary from reading as
          Crowley. */}
      <TempleText
        position={[-0.66, 0.13, 0.008]}
        fontSize={0.019}
        color={isVerse ? '#8fe3c0' : '#c9a2ff'}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.3}
      >
        {isVerse
          ? LIBER333_PROVENANCE_LABELS.sourceText
          : LIBER333_PROVENANCE_LABELS.editorialCommentary}
      </TempleText>

      <TempleText
        position={[-0.66, 0.06, 0.008]}
        fontSize={isVerse ? 0.026 : 0.023}
        color={isVerse ? '#f2ecff' : '#b3a7cc'}
        anchorX="left"
        anchorY="top"
        maxWidth={1.3}
        lineHeight={1.32}
      >
        {current.body}
      </TempleText>

      <TempleText
        position={[-0.66, -0.42, 0.008]}
        fontSize={0.016}
        color="#5d5474"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.3}
      >
        {isVerse ? 'CROWLEY · LIBER CCCXXXIII' : 'THIS EDITION · NOT CROWLEY'}
      </TempleText>
    </group>
  )
}

export function ChapelInstrument({ morphRef, active }: ChamberProps) {
  const [mode, setMode] = useState<'single' | 'triad'>('triad')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reading, setReading] = useState<Reading | null>(null)
  const [openDraw, setOpenDraw] = useState<number | null>(null)
  const [page, setPage] = useState(0)

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
  const gematria = useMemo(() => calculateGematria(question), [question])
  const draws = useMemo(() => reading?.draws ?? [], [reading])

  const reset = () => {
    setReading(null)
    setOpenDraw(null)
    setPage(0)
  }

  // The Sephira comes from the drawn record. A record whose sephira sits
  // outside the Tree (the two veils, Ain Soph / Ain Soph Aur) lights nothing
  // rather than being forced onto a node.
  const litSephiroth = useMemo(() => {
    const lit = new Set<number>()
    for (const draw of draws) {
      const sephira = sephiraForRecord(draw.record)
      if (sephira) lit.add(sephira.index)
    }
    return lit
  }, [draws])

  const litPaths = useMemo(() => {
    return new Set(
      PATHS.map((p, i) =>
        litSephiroth.has(p[0]) && litSephiroth.has(p[1]) ? i : -1,
      ).filter((i) => i >= 0),
    )
  }, [litSephiroth])

  const openRecord = openDraw === null ? null : draws[openDraw] ?? null

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

      {/* THE ORACLE DESK — deliberately below the Tree's lowest lamp. */}
      <group position={ORACLE_DESK_POSITION} rotation={[-0.3, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.4]} />
          <meshBasicMaterial
            color="#06040d"
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        <TempleText
          position={[0, 0.145, 0.006]}
          fontSize={0.028}
          color="#e8dcff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.1}
        >
          {question}
        </TempleText>

        {/* The derivation, not just its result. reductionSteps is the whole
            chain the edition reduces through, and it is what makes the draw
            checkable rather than magical. */}
        <TempleText
          position={[0, 0.088, 0.006]}
          fontSize={0.023}
          color={CHAPEL_ACCENT}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.14}
        >
          {`${gematria.raw} LETTERS · ${gematria.reductionSteps.join(' → ')}`}
        </TempleText>

        <group position={[-0.4, 0.02, 0.01]}>
          <TinyButton
            label="QUESTION ▸"
            width={0.34}
            onPress={() => {
              setQuestionIndex((i) => (i + 1) % questions.length)
              reset()
            }}
          />
        </group>

        <group position={[0, 0.02, 0.01]}>
          <TinyButton
            label={mode.toUpperCase()}
            width={0.26}
            onPress={() => {
              setMode((m) => (m === 'single' ? 'triad' : 'single'))
              reset()
            }}
          />
        </group>

        <group position={[0.4, 0.02, 0.01]}>
          <TinyButton
            label="CONSULT"
            color="#ffffff"
            size={0.028}
            width={0.32}
            onPress={() => {
              setReading(drawReading(question, mode))
              setOpenDraw(null)
              setPage(0)
            }}
          />
        </group>

        <TempleText
          position={[0, -0.075, 0.006]}
          fontSize={0.022}
          color="#5d5474"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.14}
        >
          {draws.length
            ? 'TOUCH A CHAPTER TO READ IT'
            : 'THE SAME QUESTION ALWAYS DRAWS THE SAME CHAPTERS'}
        </TempleText>

        <TempleText
          position={[0, -0.145, 0.006]}
          fontSize={0.017}
          color="#463f5c"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.14}
        >
          {`94 RECORDS · TWO VEILS THEN CHAPTERS 0–91`}
        </TempleText>
      </group>

      {/* THE INSCRIPTIONS — now selectors into the corpus, not dead ends. */}
      {draws.map((draw, i) => {
        const spread = draws.length === 1 ? 0 : (i - 1) * 0.66
        const sephira = sephiraForRecord(draw.record)
        const colour = sephira?.color ?? CHAPEL_ACCENT
        const isOpen = openDraw === i

        return (
          <group key={draw.position} position={[spread, 1.86, -1.9]}>
            <mesh {...pressable(() => {
              setOpenDraw(isOpen ? null : i)
              setPage(0)
            })}>
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
                color={colour}
                transparent
                opacity={isOpen ? 0.85 : 0.4}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            <TempleText
              position={[0, 0.195, 0.008]}
              fontSize={0.026}
              color={colour}
              anchorX="center"
              anchorY="middle"
            >
              {draw.position.toUpperCase()}
            </TempleText>

            <TempleText
              position={[0, 0.085, 0.008]}
              fontSize={0.11}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {isVeil(draw.record) ? draw.record.title : String(draw.number)}
            </TempleText>

            <TempleText
              position={[0, -0.035, 0.008]}
              fontSize={0.023}
              color="#cbbde8"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.54}
            >
              {isVeil(draw.record) ? 'PRELIMINARY VEIL' : draw.record.title}
            </TempleText>

            <TempleText
              position={[0, -0.145, 0.008]}
              fontSize={0.024}
              color={colour}
              anchorX="center"
              anchorY="middle"
              maxWidth={0.54}
            >
              {draw.record.sephira}
            </TempleText>

            <TempleText
              position={[0, -0.205, 0.008]}
              fontSize={0.021}
              color="#6b6082"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.54}
            >
              {isOpen ? 'READING' : 'READ ▸'}
            </TempleText>
          </group>
        )
      })}

      {openRecord ? (
        <ChapterReader
          draw={openRecord}
          page={page}
          onPage={setPage}
          onClose={() => setOpenDraw(null)}
        />
      ) : null}
    </group>
  )
}
