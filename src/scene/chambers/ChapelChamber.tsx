import { useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
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
import { ScriptureArc } from '../ScriptureArc'
import { readerControlPose } from './readerControlLayout'
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

const noRaycast = () => null

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
  recedeRef,
  morphRef,
}: {
  from: readonly [number, number]
  to: readonly [number, number]
  lit: boolean
  /** 0 = present, 1 = withdrawn while a chapter has the room. Read inside
   *  useFrame, not as a rendered value — it changes every frame. */
  recedeRef: MutableRefObject<number>
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
    const base = lit ? 0.42 + pulse * 0.24 : 0.09
    matRef.current.opacity = base * morphRef.current * (1 - recedeRef.current * 0.82)
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
  recedeRef,
  morphRef,
}: {
  sephira: (typeof SEPHIROTH)[number]
  lit: boolean
  /** 0 = present, 1 = withdrawn while a chapter has the room. Read inside
   *  useFrame, not as a rendered value — it changes every frame. */
  recedeRef: MutableRefObject<number>
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

    // Withdrawing is not just dimming: the lamps also shrink slightly, so the
    // Tree reads as stepping back rather than switching off.
    const recede = recedeRef.current
    const present = 1 - recede * 0.85

    if (coreRef.current) {
      coreRef.current.opacity = (lit ? 0.95 : 0.3 + pulse * 0.1) * m * present
    }
    if (haloRef.current) {
      haloRef.current.opacity = (lit ? 0.22 + pulse * 0.12 : 0.04) * m * present
    }
    if (groupRef.current) {
      const scale = (lit ? 1.18 : 1) * (0.7 + m * 0.3) * (1 - recede * 0.18)
      groupRef.current.scale.setScalar(scale)
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
 * The chapter, inscribed onto the room.
 *
 * This replaced a flat dark panel. A rectangle of prose is the one shape VR is
 * worst at: it has a border the room does not, it occludes the architecture
 * behind it, and it forces a single focal plane. Here the text is the only
 * thing lit, wrapped around the practitioner on two cylinders.
 *
 * The provenance split is carried by depth rather than by a label alone. The
 * source verse is near and bright at eye level. The editorial commentary sits
 * further out and lower, cooler and dimmer, so reading from Crowley to this
 * edition is a physical movement — you look past and down. The labels remain,
 * because depth is a cue and not a citation, but the arrangement means the two
 * can never be mistaken for one voice even at a glance.
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
    () => buildReaderPages(record.text, record.commentary, 260, 380),
    [record.text, record.commentary],
  )

  const index = Math.min(page, pages.length - 1)
  const current = pages[index]
  const isVerse = current.kind === 'verse'

  // Controls ride a shallow arc at hand height rather than sitting on a plate.
  const controls: Array<{ label: string; color?: string; width?: number; press: () => void }> = [
    { label: '◂ PREV', press: () => onPage(Math.max(0, index - 1)) },
    { label: `${index + 1} / ${pages.length}`, color: '#5d5474', width: 0.26, press: () => onPage(0) },
    { label: 'NEXT ▸', press: () => onPage(Math.min(pages.length - 1, index + 1)) },
    { label: '✕ CLOSE', color: '#7a6f92', width: 0.28, press: onClose },
  ]

  return (
    <group>
      {/* The numeral hangs far back and huge, behind the Tree: the chapter as
          architecture rather than as a number on a card. */}
      <TempleText
        position={[0, 2.35, -5.4]}
        fontSize={veil ? 1.5 : 1.9}
        color={accent}
        fillOpacity={0.07}
        anchorX="center"
        anchorY="middle"
        raycast={noRaycast}
      >
        {veil ? record.title : String(record.chapter)}
      </TempleText>

      {/* Title band, above the verse. */}
      <ScriptureArc
        radius={2.15}
        y={2.12}
        fontSize={0.088}
        color="#ffffff"
        maxWidth={3.0}
        shelf={false}
        outlineOpacity={0.22}
      >
        {record.title}
      </ScriptureArc>

      <ScriptureArc
        radius={2.15}
        y={1.98}
        fontSize={0.036}
        color={accent}
        opacity={0.85}
        maxWidth={3.0}
        shelf={false}
      >
        {veil
          ? `PRELIMINARY VEIL · ${record.sephira}`
          : `CHAPTER ${record.chapter} · ${record.sephira}${record.tarot !== '—' ? ` · ${record.tarot}` : ''} · ${record.element}`}
      </ScriptureArc>

      {/* SOURCE — near, bright, at eye level. */}
      {isVerse ? (
        <>
          <ScriptureArc
            radius={2.0}
            y={1.78}
            fontSize={0.03}
            color="#8fe3c0"
            opacity={0.9}
            maxWidth={2.6}
            shelf={false}
          >
            {LIBER333_PROVENANCE_LABELS.sourceText}
          </ScriptureArc>

          <ScriptureArc
            radius={2.0}
            y={1.55}
            fontSize={0.062}
            color="#f4efff"
            maxWidth={2.9}
            shelfColor="#8fe3c0"
            shelfOpacity={0.3}
            outlineOpacity={0.18}
          >
            {current.body}
          </ScriptureArc>
        </>
      ) : (
        /* EDITION — further out, lower, cooler. You look past and down to it. */
        <>
          <ScriptureArc
            radius={2.6}
            y={1.62}
            fontSize={0.03}
            color="#c9a2ff"
            opacity={0.85}
            maxWidth={3.2}
            shelf={false}
          >
            {LIBER333_PROVENANCE_LABELS.editorialCommentary}
          </ScriptureArc>

          <ScriptureArc
            radius={2.6}
            y={1.38}
            fontSize={0.05}
            color="#b9abd6"
            opacity={0.92}
            maxWidth={3.5}
            shelfColor="#c9a2ff"
            shelfOpacity={0.2}
          >
            {current.body}
          </ScriptureArc>
        </>
      )}

      <ScriptureArc
        radius={2.0}
        y={1.13}
        fontSize={0.026}
        color="#5d5474"
        maxWidth={2.6}
        shelf={false}
      >
        {isVerse ? 'CROWLEY · LIBER CCCXXXIII' : 'THIS EDITION · NOT CROWLEY'}
      </ScriptureArc>

      {/* Controls on a shallow arc at hand height, each turned to face the
          practitioner. No backing plate: the hit planes stay invisible.
          Radius is deliberately inside ZONES.content (1.5-2.5m), which
          zones.ts reserves for exactly this: "Readings and tablets.
          Interactive only for pagination." The first version sat at 1.32m,
          inside ZONES.work — the same distance band as the altar desk's own
          CONSULT/QUESTION/TRIAD controls at ~1.19m, so a reach for NEXT could
          land on CONSULT instead and silently draw a new reading. This is the
          same class of collision already fixed once on the Monad's lectern. */}
      {controls.map((control, i) => {
        const pose = readerControlPose(i, controls.length)
        return (
          <group key={control.label} position={pose.position} rotation={[0, pose.rotationY, 0]}>
            <TinyButton
              label={control.label}
              color={control.color}
              width={control.width}
              onPress={control.press}
            />
          </group>
        )
      })}
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

  // Eased so the Tree withdraws and returns rather than snapping. Held in a ref
  // and read inside useFrame: this changes every frame and must not re-render.
  const recedeRef = useRef(0)
  useFrame((_, delta) => {
    const target = openRecord ? 1 : 0
    recedeRef.current += (target - recedeRef.current) * Math.min(1, delta * 3.2)
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
            recedeRef={recedeRef}
            morphRef={morphRef}
          />
        ))}

        {SEPHIROTH.map((s) => (
          <SephiraLamp
            key={s.name}
            sephira={s}
            lit={active && litSephiroth.has(s.index)}
            recedeRef={recedeRef}
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

      {/* THE INSCRIPTIONS — shafts of light standing in the room, not cards.
          Each rises at its own angle on a shallow arc so the triad reads as
          three standing presences the practitioner turns between, and each is
          a door into the chapter. They hide themselves while a chapter is open
          so the inscription has the room to itself. */}
      {draws.length === 0
        ? null
        : draws.map((draw, i) => {
            const a = draws.length === 1 ? 0 : (i - 1) * 0.34
            const r = 2.75
            const sephira = sephiraForRecord(draw.record)
            const colour = sephira?.color ?? CHAPEL_ACCENT
            const isOpen = openDraw === i
            const veil = isVeil(draw.record)

            if (openDraw !== null && !isOpen) return null

            return (
              <group
                key={draw.position}
                position={[Math.sin(a) * r, 0, -Math.cos(a) * r]}
                rotation={[0, -a, 0]}
              >
                {/* The shaft. Bright at the floor, fading upward, so it reads
                    as light standing rather than a rectangle hanging. */}
                <mesh position={[0, 1.05, 0]} raycast={noRaycast}>
                  <planeGeometry args={[0.5, 2.1]} />
                  <meshBasicMaterial
                    color={colour}
                    transparent
                    opacity={isOpen ? 0.16 : 0.075}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                <mesh position={[0, 1.05, -0.01]} raycast={noRaycast}>
                  <planeGeometry args={[0.03, 2.1]} />
                  <meshBasicMaterial
                    color={colour}
                    transparent
                    opacity={isOpen ? 0.9 : 0.45}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Pool of light where the shaft meets the floor. */}
                <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
                  <ringGeometry args={[0.16, 0.44, 32]} />
                  <meshBasicMaterial
                    color={colour}
                    transparent
                    opacity={isOpen ? 0.34 : 0.14}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                <TempleText
                  position={[0, 2.05, 0.02]}
                  fontSize={0.032}
                  color={colour}
                  anchorX="center"
                  anchorY="middle"
                  raycast={noRaycast}
                >
                  {draw.position.toUpperCase()}
                </TempleText>

                <TempleText
                  position={[0, 1.78, 0.02]}
                  fontSize={veil ? 0.28 : 0.34}
                  color="#ffffff"
                  fillOpacity={0.95}
                  anchorX="center"
                  anchorY="middle"
                  raycast={noRaycast}
                >
                  {veil ? draw.record.title : String(draw.number)}
                </TempleText>

                <TempleText
                  position={[0, 1.5, 0.02]}
                  fontSize={0.044}
                  color="#e6dcff"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={0.95}
                  textAlign="center"
                  raycast={noRaycast}
                >
                  {veil ? 'PRELIMINARY VEIL' : draw.record.title}
                </TempleText>

                <TempleText
                  position={[0, 1.3, 0.02]}
                  fontSize={0.036}
                  color={colour}
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={0.95}
                  raycast={noRaycast}
                >
                  {draw.record.sephira}
                </TempleText>

                {/* The whole shaft is the target, at a size a controller ray
                    can actually hold. */}
                <group
                  position={[0, 1.05, 0.03]}
                  {...pressable(() => {
                    setOpenDraw(isOpen ? null : i)
                    setPage(0)
                  })}
                >
                  <TempleText
                    position={[0, -0.42, 0]}
                    fontSize={0.038}
                    color={isOpen ? '#ffffff' : '#8d81ab'}
                    anchorX="center"
                    anchorY="middle"
                    raycast={noRaycast}
                  >
                    {isOpen ? '▾ CLOSE' : 'READ ▸'}
                  </TempleText>
                  {/* The one mesh here that keeps its default raycast: the
                      whole shaft is the press target, at a size a controller
                      ray can hold without fine aim. */}
                  <mesh>
                    <planeGeometry args={[0.56, 2.1]} />
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
