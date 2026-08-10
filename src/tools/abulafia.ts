import type { SourceProvenance } from './provenance'

/**
 * ABULAFIA.EXE — offline operative reconstruction.
 *
 * This chamber is inspired by ecstatic Kabbalistic permutation, breath and
 * directional-vocal practices associated with Abraham Abulafia. The exact
 * timing, UI sequence and vowel-to-world-axis mapping below are Grimoire XR
 * practice mechanics unless and until a source-critical edition documents a
 * specific historical instruction.
 */

export const ABULAFIA_PROVENANCE: SourceProvenance = {
  id: 'abulafia-operative-permutation-model',
  work: 'Ecstatic Kabbalah permutation practice',
  author: 'Abraham Abulafia tradition / Grimoire XR reconstruction',
  date: '13th century sources; modern VR reconstruction',
  layer: 'operative-reconstruction',
  claim:
    'Letter permutation is historically inspired; the fixed 4s/4s breath clock and five world-axis mapping are application-level practice mechanics, not asserted verbatim instructions from a critical edition.',
  reference: 'Source-critical citations pending for the specific permutation and head-direction practices represented in VR.',
}

/**
 * Heap's algorithm. Repeated glyphs stay positionally distinct: YHVH therefore
 * produces 4! = 24 token permutations even though some rendered strings repeat.
 */
export function permute<T>(items: readonly T[]): T[][] {
  const out: T[][] = []
  const values = [...items]

  if (values.length === 0) return out

  const generate = (k: number) => {
    if (k === 1) {
      out.push([...values])
      return
    }

    for (let index = 0; index < k; index += 1) {
      generate(k - 1)
      if (k % 2 === 0) {
        ;[values[index], values[k - 1]] = [values[k - 1], values[index]]
      } else {
        ;[values[0], values[k - 1]] = [values[k - 1], values[0]]
      }
    }
  }

  generate(values.length)
  return out
}

export type Axis = 'up' | 'forward' | 'down' | 'left' | 'right'

export type Vowel = {
  name: string
  sound: string
  mark: string
  axis: Axis
  direction: readonly [number, number, number]
}

/**
 * Working five-vowel spatial mapping for the VR exercise. It is intentionally
 * labelled reconstruction rather than "canonical" historical attribution.
 */
export const VOWELS: readonly Vowel[] = [
  { name: 'Holam', sound: 'u', mark: 'ֹ', axis: 'up', direction: [0, 1, 0] },
  { name: 'Qubuts', sound: 'o', mark: 'ֻ', axis: 'forward', direction: [0, 0, -1] },
  { name: 'Hiriq', sound: 'i', mark: 'ִ', axis: 'down', direction: [0, -1, 0] },
  { name: 'Tzere', sound: 'e', mark: 'ֵ', axis: 'left', direction: [-1, 0, 0] },
  { name: 'Qamatz', sound: 'a', mark: 'ָ', axis: 'right', direction: [1, 0, 0] },
] as const

export const BREATH_IN_SECONDS = 4
export const BREATH_OUT_SECONDS = 4
export const BREATH_CYCLE_SECONDS = BREATH_IN_SECONDS + BREATH_OUT_SECONDS

export type BreathPhase = 'inhale' | 'exhale'

export type BreathState = {
  phase: BreathPhase
  progress: number
  cycle: number
}

export function breathAt(elapsedSeconds: number): BreathState {
  const time = Math.max(0, elapsedSeconds)
  const cycle = Math.floor(time / BREATH_CYCLE_SECONDS)
  const withinCycle = time % BREATH_CYCLE_SECONDS

  return withinCycle < BREATH_IN_SECONDS
    ? {
        phase: 'inhale',
        progress: withinCycle / BREATH_IN_SECONDS,
        cycle,
      }
    : {
        phase: 'exhale',
        progress: (withinCycle - BREATH_IN_SECONDS) / BREATH_OUT_SECONDS,
        cycle,
      }
}

export type NameToken = {
  latin: string
  hebrew: string
  name: string
}

export const TETRAGRAMMATON: readonly NameToken[] = [
  { latin: 'Y', hebrew: 'י', name: 'Yod' },
  { latin: 'H', hebrew: 'ה', name: 'He' },
  { latin: 'V', hebrew: 'ו', name: 'Vav' },
  { latin: 'H', hebrew: 'ה', name: 'He' },
]

export const NAMES: ReadonlyArray<{
  id: string
  label: string
  tokens: readonly NameToken[]
}> = [
  { id: 'yhvh', label: 'YHVH', tokens: TETRAGRAMMATON },
  {
    id: 'ehyh',
    label: 'EHYH',
    tokens: [
      { latin: 'E', hebrew: 'א', name: 'Aleph' },
      { latin: 'H', hebrew: 'ה', name: 'He' },
      { latin: 'Y', hebrew: 'י', name: 'Yod' },
      { latin: 'H', hebrew: 'ה', name: 'He' },
    ],
  },
  {
    id: 'adni',
    label: 'ADNI',
    tokens: [
      { latin: 'A', hebrew: 'א', name: 'Aleph' },
      { latin: 'D', hebrew: 'ד', name: 'Daleth' },
      { latin: 'N', hebrew: 'נ', name: 'Nun' },
      { latin: 'I', hebrew: 'י', name: 'Yod' },
    ],
  },
]

export type PermutationStep = {
  index: number
  tokens: NameToken[]
  vowel: Vowel
  latin: string
  hebrew: string
}

export function buildSequence(tokens: readonly NameToken[]): PermutationStep[] {
  return permute(tokens).map((permutation, index) => ({
    index,
    tokens: permutation,
    vowel: vowelForStep(index),
    latin: permutation.map((token) => token.latin).join(''),
    hebrew: permutation.map((token) => token.hebrew).join(''),
  }))
}

export const SEQUENCE_LENGTH = 24

export function stepIndexAt(
  elapsedSeconds: number,
  sequenceLength = SEQUENCE_LENGTH,
) {
  return breathAt(elapsedSeconds).cycle % Math.max(1, sequenceLength)
}

export function vowelForStep(index: number): Vowel {
  return VOWELS[index % VOWELS.length]
}
