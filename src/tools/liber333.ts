import type { SourceProvenance } from './provenance'
import { LIBER_333, type ChapterRecord } from './liber333Corpus.ts'

/**
 * LIBER 333 — deterministic offline instrument model.
 *
 * The corpus is 94 records: two preliminary veil entries ('?' and '!', numbered
 * -2 and -1) followed by Chapters 0 through 91. This file previously described
 * the work as "chapters 0 through 93", which invented two chapters that do not
 * exist and made the veils unreachable.
 *
 * The gematria, hashing and selection below are ported verbatim from the
 * original edition (bookthief666/liber-333-grimoire) so the same question
 * yields the same chapters in both applications. Divergence here is a defect,
 * not a design choice — see test/liber333-parity.test.ts.
 *
 * Selection indexes the ARRAY. A record's identity is its own `chapter` field:
 * index 0 is chapter -2, not chapter 0.
 */

export const LIBER333_PROVENANCE: SourceProvenance = {
  id: 'crowley-liber333-experimental-map',
  work: 'Liber CCCXXXIII: The Book of Lies',
  author: 'Aleister Crowley',
  date: '1912–1913',
  layer: 'experimental-correspondence',
  claim:
    'Deterministic question-to-chapter selection is an application mechanic carried over from the original edition. The per-chapter Sephira, path, element and Tarot fields are correspondences supplied by that edition, not attributions attested in the source work.',
  reference:
    'Aleister Crowley, Liber CCCXXXIII: The Book of Lies. This edition stores 94 records: two preliminary veil entries before Chapters 0 through 91.',
  notes:
    'Chapter verse and title are source text; commentary is modern editorial interpretation. See LIBER333_FIELD_PROVENANCE for the per-field split.',
}

/** A=1..Z=26, as the original edition counts it. */
const ENGLISH_QABALAH: Readonly<Record<string, number>> = Object.freeze({
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10,
  k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20,
  u: 21, v: 22, w: 23, x: 24, y: 25, z: 26,
})

export type Gematria = {
  /** Full English Ordinal sum. */
  simple: number
  /** Theosophic reduction to a single digit. */
  reduced: number
  /** Letters counted. */
  raw: number
  /** Every step of the reduction, e.g. [93, 12, 3]. Drives the derivation. */
  reductionSteps: number[]
}

/**
 * Ported verbatim from the original edition's `calculateGematria`.
 *
 * Note there is deliberately NO master-number exception. An earlier version of
 * this file stopped reducing at 11, 22 and 33, which silently produced a
 * different antithesis chapter from the original for any question whose sum
 * passed through one of them.
 */
export function calculateGematria(text: string): Gematria {
  const clean = text.toLowerCase().replace(/[^a-z]/g, '')
  if (clean.length === 0) return { simple: 0, reduced: 0, raw: 0, reductionSteps: [0] }

  let simple = 0
  for (const ch of clean) simple += ENGLISH_QABALAH[ch] ?? 0

  let reduced = simple
  const reductionSteps = [simple]
  while (reduced > 9) {
    reduced = String(reduced)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
    reductionSteps.push(reduced)
  }

  return { simple, reduced, raw: clean.length, reductionSteps }
}

/** Full English Ordinal sum. Retained for callers that only need the total. */
export function englishOrdinal(text: string): number {
  return calculateGematria(text).simple
}

/** Theosophic reduction to a single digit. No master-number exception. */
export function theosophicReduction(value: number): number {
  let n = Math.abs(Math.trunc(value))
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return n
}

/**
 * Ported verbatim from the original edition. This is the classic djb2-style
 * 32-bit rolling hash; it must not be replaced with FNV-1a or anything else,
 * because the synthesis chapter depends on its exact output.
 */
export function stringToHash(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

export type Sephira = {
  index: number
  name: string
  title: string
  color: string
  position: readonly [number, number]
}

export const SEPHIROTH: readonly Sephira[] = [
  { index: 0, name: 'Kether', title: 'The Crown', color: '#f8f3df', position: [0, 3.0] },
  { index: 1, name: 'Chokmah', title: 'Wisdom', color: '#d8e8ff', position: [-0.56, 2.55] },
  { index: 2, name: 'Binah', title: 'Understanding', color: '#8f7ab8', position: [0.56, 2.55] },
  { index: 3, name: 'Chesed', title: 'Mercy', color: '#6b9bd8', position: [-0.74, 1.72] },
  { index: 4, name: 'Geburah', title: 'Severity', color: '#c8442e', position: [0.74, 1.72] },
  { index: 5, name: 'Tiphareth', title: 'Beauty', color: '#ffd18a', position: [0, 1.34] },
  { index: 6, name: 'Netzach', title: 'Victory', color: '#5fae7a', position: [-0.52, 0.9] },
  { index: 7, name: 'Hod', title: 'Splendour', color: '#e08a3c', position: [0.52, 0.9] },
  { index: 8, name: 'Yesod', title: 'The Foundation', color: '#9a6bff', position: [0, 0.45] },
  { index: 9, name: 'Malkuth', title: 'The Kingdom', color: '#7a6a52', position: [0, 0.0] },
] as const

/**
 * Conventional 22-link Tree topology used by the room-scale visualization.
 * These are geometric links only. Path letters/Tarot attributions should be
 * added as a separately sourced table rather than inferred from array order.
 */
export const PATHS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 2],
  [0, 5],
  [1, 2],
  [1, 3],
  [1, 5],
  [2, 4],
  [2, 5],
  [3, 4],
  [3, 5],
  [3, 6],
  [4, 5],
  [4, 7],
  [5, 6],
  [5, 7],
  [5, 8],
  [6, 7],
  [6, 8],
  [6, 9],
  [7, 8],
  [7, 9],
  [8, 9],
] as const

/** Records in the corpus: two veils plus Chapters 0-91. */
export const CHAPTER_COUNT = LIBER_333.length

export type ReadingPosition = 'single' | 'thesis' | 'antithesis' | 'synthesis'

export type ChapterDraw = {
  /** Index into LIBER_333, which is what the selection arithmetic produces. */
  index: number
  /** The record's own chapter number. -2 and -1 are the veils. */
  number: number
  record: ChapterRecord
  position: ReadingPosition
}

export type Reading = {
  question: string
  gematria: Gematria
  mode: 'single' | 'triad'
  draws: ChapterDraw[]
}

/** True for the two preliminary veil records, which carry no path or Tarot. */
export function isVeil(record: ChapterRecord) {
  return record.chapter < 0
}

/**
 * Ported verbatim from the original edition's `getReadingChapterIndexes`,
 * including its forward-wrapping duplicate avoidance.
 *
 * Single: the full English Ordinal value.
 * Triad:  thesis = full value, antithesis = theosophic reduction,
 *         synthesis = deterministic hash of the question.
 *
 * The previous implementation seeded once and then applied fixed offsets of
 * 0/31/62, which meant the same question produced different chapters here than
 * in the original application.
 */
export function getReadingChapterIndexes({
  chapterCount,
  gematria,
  question,
  mode,
}: {
  chapterCount: number
  gematria: Gematria
  question: string
  mode: 'single' | 'triad'
}): number[] {
  if (mode !== 'triad') return [gematria.simple % chapterCount]

  const idx1 = gematria.simple % chapterCount
  const idx2 = gematria.reduced % chapterCount
  const idx3 = stringToHash(question) % chapterCount

  const used = new Set([idx1])
  let i2 = idx2
  while (used.has(i2)) i2 = (i2 + 1) % chapterCount
  used.add(i2)

  let i3 = idx3
  while (used.has(i3)) i3 = (i3 + 1) % chapterCount

  return [idx1, i2, i3]
}

const TRIAD_POSITIONS: ReadingPosition[] = ['thesis', 'antithesis', 'synthesis']

/**
 * Deterministic reading. Identical questions produce identical chapters, and
 * the same chapters the original edition would produce.
 *
 * A Sephira is read from the drawn record rather than computed. The previous
 * implementation returned `SEPHIROTH[number % 10]`, which was invented data
 * standing in front of the real correspondence the corpus already carries.
 */
export function drawReading(question: string, mode: 'single' | 'triad'): Reading {
  const gematria = calculateGematria(question)
  const indexes = getReadingChapterIndexes({
    chapterCount: LIBER_333.length,
    gematria,
    question,
    mode,
  })

  return {
    question,
    gematria,
    mode,
    draws: indexes.map((index, order) => ({
      index,
      number: LIBER_333[index].chapter,
      record: LIBER_333[index],
      position: mode === 'single' ? 'single' : TRIAD_POSITIONS[order],
    })),
  }
}

/** The Sephira the drawn record names, when the corpus name matches the Tree. */
export function sephiraForRecord(record: ChapterRecord): Sephira | null {
  const name = record.sephira.trim().toLowerCase()
  return SEPHIROTH.find((s) => s.name.toLowerCase() === name) ?? null
}
