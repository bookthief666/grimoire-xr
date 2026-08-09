/**
 * ABULAFIA.EXE — ported core logic.
 *
 * A "cognitive disassembly engine" after 13th-century Ecstatic Kabbalah:
 * semantic language is deconstructed into mathematical permutation, paced by a
 * somatic metronome. Only the pure logic is ported here — no backend, no keys —
 * so this chamber works entirely offline.
 *
 * The source project's design spec explicitly forbids ornament: deep black,
 * high-contrast white, one restrained accent. The Cell chamber honours that; it
 * is deliberately the most stripped room in the temple.
 */

/**
 * Heap's algorithm.
 *
 * Identical characters MUST stay positionally distinct — this is a stated
 * requirement of the source project, not an oversight. "YHVH" is processed as
 * four separate tokens and yields exactly 4! = 24 arrays. Deduplicating by
 * rendered string would collapse it to 12 and destroy the practice, because the
 * two He are different letters of the Name even though they draw the same.
 */
export function permute<T>(items: readonly T[]): T[][] {
  const out: T[][] = []
  const a = [...items]

  if (a.length === 0) return out

  const generate = (k: number) => {
    if (k === 1) {
      out.push([...a])
      return
    }

    for (let i = 0; i < k; i += 1) {
      generate(k - 1)

      if (k % 2 === 0) {
        ;[a[i], a[k - 1]] = [a[k - 1], a[i]]
      } else {
        ;[a[0], a[k - 1]] = [a[k - 1], a[0]]
      }
    }
  }

  generate(a.length)
  return out
}

export type Axis = 'up' | 'forward' | 'down' | 'left' | 'right'

export type Vowel = {
  /** Traditional pointing name. */
  name: string
  /** Latin transliteration used by the source project. */
  sound: string
  /** Niqqud mark. */
  mark: string
  axis: Axis
  /** Unit direction in world space. Forward is -Z, matching the scene. */
  direction: readonly [number, number, number]
}

/**
 * The five canonical vowels and their spatial mapping.
 *
 * This is the single most VR-native thing in any of the three tools. On a flat
 * screen "Holam → upward" is a label you read. In VR it is a direction you
 * physically turn your head and body along while chanting, which is what the
 * practice actually asks for.
 */
export const VOWELS: readonly Vowel[] = [
  { name: 'Holam', sound: 'u', mark: 'ֹ', axis: 'up', direction: [0, 1, 0] },
  { name: 'Qubuts', sound: 'o', mark: 'ֻ', axis: 'forward', direction: [0, 0, -1] },
  { name: 'Hiriq', sound: 'i', mark: 'ִ', axis: 'down', direction: [0, -1, 0] },
  { name: 'Tzere', sound: 'e', mark: 'ֵ', axis: 'left', direction: [-1, 0, 0] },
  { name: 'Qamatz', sound: 'a', mark: 'ָ', axis: 'right', direction: [1, 0, 0] },
] as const

/** Somatic Metronome: rigid 4s inhale, 4s exhale. Pacing is the practice. */
export const BREATH_IN_SECONDS = 4
export const BREATH_OUT_SECONDS = 4
export const BREATH_CYCLE_SECONDS = BREATH_IN_SECONDS + BREATH_OUT_SECONDS

export type BreathPhase = 'inhale' | 'exhale'

export type BreathState = {
  phase: BreathPhase
  /** 0 → 1 through the current phase. */
  progress: number
  /** Which breath of the session this is. */
  cycle: number
}

/** Where in the breath a given elapsed time falls. Pure, so it is frame-rate free. */
export function breathAt(elapsedSeconds: number): BreathState {
  const t = Math.max(0, elapsedSeconds)
  const cycle = Math.floor(t / BREATH_CYCLE_SECONDS)
  const withinCycle = t % BREATH_CYCLE_SECONDS

  return withinCycle < BREATH_IN_SECONDS
    ? { phase: 'inhale', progress: withinCycle / BREATH_IN_SECONDS, cycle }
    : {
        phase: 'exhale',
        progress: (withinCycle - BREATH_IN_SECONDS) / BREATH_OUT_SECONDS,
        cycle,
      }
}

/**
 * A single letter of a Name. Structural rather than derived from the
 * Tetragrammaton literal, so other names are not forced into Y/H/V.
 */
export type NameToken = {
  latin: string
  hebrew: string
  name: string
}

/** The Tetragrammaton, as four positionally-distinct tokens. */
export const TETRAGRAMMATON: readonly NameToken[] = [
  { latin: 'Y', hebrew: 'י', name: 'Yod' },
  { latin: 'H', hebrew: 'ה', name: 'He' },
  { latin: 'V', hebrew: 'ו', name: 'Vav' },
  { latin: 'H', hebrew: 'ה', name: 'He' },
]

/** Other names available for permutation, all short enough to stay legible in VR. */
export const NAMES: ReadonlyArray<{ id: string; label: string; tokens: readonly NameToken[] }> = [
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

/**
 * One step of the practice: a permutation of the Name paired with the vowel
 * whose axis is to be faced while chanting it.
 */
export type PermutationStep = {
  index: number
  tokens: NameToken[]
  vowel: Vowel
  latin: string
  hebrew: string
}

/** Build the full ordered practice sequence for a name. */
export function buildSequence(tokens: readonly NameToken[]): PermutationStep[] {
  return permute(tokens).map((perm, index) => ({
    index,
    tokens: perm,
    vowel: VOWELS[index % VOWELS.length],
    latin: perm.map((t) => t.latin).join(''),
    hebrew: perm.map((t) => t.hebrew).join(''),
  }))
}
