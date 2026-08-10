import type { SourceProvenance } from './provenance'

/**
 * LIBER 333 — deterministic offline instrument model.
 *
 * Crowley's Book of Lies contains chapters 0 through 93. Grimoire XR may use
 * deterministic question-to-chapter selection as an application mechanic, but
 * that mechanic and the chapter-to-Sephira mapping below are NOT presented as
 * historical Crowley attributions. They are explicitly experimental
 * correspondences until a source-critical attribution table is supplied.
 */

export const LIBER333_PROVENANCE: SourceProvenance = {
  id: 'crowley-liber333-experimental-map',
  work: 'Liber CCCXXXIII: The Book of Lies',
  author: 'Aleister Crowley',
  date: '1912–1913',
  layer: 'experimental-correspondence',
  claim:
    'Question hashing, English Ordinal seeding and chapter-to-Sephira assignment are Grimoire XR mechanics, not asserted historical attributions from Crowley.',
  reference: 'Aleister Crowley, Liber CCCXXXIII: The Book of Lies, chapters 0–93.',
  notes:
    'A future source edition should store chapter text/commentary and documented attributions separately from this deterministic oracle layer.',
}

export function englishOrdinal(text: string): number {
  let total = 0
  for (const ch of text.toUpperCase()) {
    const code = ch.charCodeAt(0)
    if (code >= 65 && code <= 90) total += code - 64
  }
  return total
}

export function theosophicReduction(value: number): number {
  let n = Math.abs(Math.trunc(value))
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return n
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

export const CHAPTER_COUNT = 94

export type ChapterDraw = {
  number: number
  sephira: Sephira
  position: 'single' | 'thesis' | 'antithesis' | 'synthesis'
  basis: 'experimental-correspondence'
}

function hash(text: string): number {
  let h = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    h ^= text.charCodeAt(index)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function chapterAt(seed: number, offset: number): number {
  return (seed + offset) % CHAPTER_COUNT
}

function experimentalSephiraForChapter(number: number): Sephira {
  const source = SEPHIROTH[number % SEPHIROTH.length]
  return {
    ...source,
    title: `${source.title} · WORKING MAP`,
  }
}

/**
 * Deterministic oracle draw. Identical normalized questions produce identical
 * chapter numbers. The Sephira association is deliberately labelled as a
 * working map; do not use it as evidence of Crowley's historical attribution.
 */
export function drawChapters(
  question: string,
  mode: 'single' | 'triad',
): ChapterDraw[] {
  const normalized = question.trim().toLowerCase()
  const gematria = englishOrdinal(question)
  const seed = (gematria + hash(normalized)) % CHAPTER_COUNT

  const make = (
    number: number,
    position: ChapterDraw['position'],
  ): ChapterDraw => ({
    number,
    sephira: experimentalSephiraForChapter(number),
    position,
    basis: 'experimental-correspondence',
  })

  if (mode === 'single') return [make(seed, 'single')]

  return [
    make(seed, 'thesis'),
    make(chapterAt(seed, 31), 'antithesis'),
    make(chapterAt(seed, 62), 'synthesis'),
  ]
}
