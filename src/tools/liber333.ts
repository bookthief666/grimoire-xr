/**
 * LIBER 333 — ported core logic.
 *
 * Companion to Crowley's *Liber CCCXXXIII: The Book of Lies*, 94 chapters
 * attributed across the Tree of Life. The source project selects chapters
 * deterministically from the English Ordinal gematria of the question, and
 * offers Single or Triad (Thesis / Antithesis / Synthesis) readings.
 *
 * Only the deterministic, offline half is ported: gematria, Tree topology, and
 * chapter selection. The source project's server-owned prompt boundary — where
 * the interpretation text comes from — is deliberately out of scope, so the
 * Chapel works without a network.
 */

/** English Ordinal: A=1 … Z=26. Non-letters contribute nothing. */
export function englishOrdinal(text: string): number {
  let total = 0

  for (const ch of text.toUpperCase()) {
    const code = ch.charCodeAt(0)
    if (code >= 65 && code <= 90) total += code - 64
  }

  return total
}

/** Reduce to a single digit, preserving the classic 11/22/33 master numbers. */
export function theosophicReduction(value: number): number {
  let n = Math.abs(Math.trunc(value))

  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0)
  }

  return n
}

export type Sephira = {
  index: number
  name: string
  title: string
  /** Traditional scale colour, used as the lamp colour in the Chapel. */
  color: string
  /** Position on the Tree, x right-positive, y up-positive, in Tree units. */
  position: readonly [number, number]
}

/**
 * The ten Sephiroth.
 *
 * Coordinates match the 10-node arrangement already used by `DistantAATrace` in
 * TempleAtmosphere.tsx, so the Chapel and the distant background traces stay
 * consistent rather than drifting into two different Trees.
 */
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

/** The connecting paths, as index pairs into SEPHIROTH. */
export const PATHS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5],
  [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [4, 7],
  [5, 8], [6, 7], [6, 8], [7, 9], [8, 9], [6, 9],
] as const

/** The Book of Lies has 94 chapters — 0 (the star) through 93. */
export const CHAPTER_COUNT = 94

export type ChapterDraw = {
  /** 0 … 93. */
  number: number
  /** Which Sephira the chapter is attributed to. */
  sephira: Sephira
  /** Role within a reading. */
  position: 'single' | 'thesis' | 'antithesis' | 'synthesis'
}

/**
 * FNV-1a. A stable hash so the same question always yields the same reading —
 * the source project treats determinism as a correctness property, not a
 * convenience, so a seeded PRNG that varied per session would be wrong.
 */
function hash(text: string): number {
  let h = 2166136261

  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }

  return h >>> 0
}

function chapterAt(seed: number, offset: number): ChapterDraw['number'] {
  return (seed + offset) % CHAPTER_COUNT
}

/**
 * Draw chapters for a question.
 *
 * The gematria of the question seeds the draw, so the reading is a function of
 * what was actually asked. A Triad returns Thesis / Antithesis / Synthesis on
 * distinct chapters.
 */
export function drawChapters(
  question: string,
  mode: 'single' | 'triad',
): ChapterDraw[] {
  const gematria = englishOrdinal(question)
  const seed = (gematria + hash(question.trim().toLowerCase())) % CHAPTER_COUNT

  const make = (n: number, position: ChapterDraw['position']): ChapterDraw => ({
    number: n,
    sephira: SEPHIROTH[n % SEPHIROTH.length],
    position,
  })

  if (mode === 'single') return [make(seed, 'single')]

  // Offsets 0/31/62 are pairwise distinct mod 94 (the differences are 31, 31
  // and 62, none of which vanish), so the triad can never draw a chapter twice.
  return [
    make(seed, 'thesis'),
    make(chapterAt(seed, 31), 'antithesis'),
    make(chapterAt(seed, 62), 'synthesis'),
  ]
}
