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
/**
 * Heap's algorithm, iterative — ported from the original's
 * `generatePermutations` so the emission ORDER matches, not just the set.
 *
 * The order is load-bearing. The original's manual states it plainly: "The
 * output order is not alphabetical; it is the order the algorithm produces, and
 * that order is part of the practice."
 *
 * A recursive Heap's variant stood here before. It produced the same 24
 * arrangements and preserved positional distinctness, but diverged from the
 * original at index 6 — HHVY where the original emits HHYV — so a practitioner
 * working the same name in the two applications parted company a quarter of the
 * way through and never met again.
 *
 * Positional distinctness is the other half: the two He of YHVH are tracked as
 * separate letters rather than deduplicated, so the name yields 24 arrangements
 * and not 12. Collapsing them would be arithmetically tidier and operatively
 * false.
 */
export function permute<T>(items: readonly T[]): T[][] {
  const n = items.length
  const results: T[][] = []

  if (n === 0) return results

  const working = [...items]
  results.push(working.slice())

  const c = new Array<number>(n).fill(0)
  let i = 0

  while (i < n) {
    if (c[i] < i) {
      const swapIndex = i % 2 === 0 ? 0 : c[i]
      const tmp = working[swapIndex]
      working[swapIndex] = working[i]
      working[i] = tmp
      results.push(working.slice())
      c[i] += 1
      i = 0
    } else {
      c[i] = 0
      i += 1
    }
  }

  return results
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
/**
 * The five gates, in the order the original's `createDefaultSequence()` emits.
 *
 * A gate pairs one vowel with one direction and occupies two movements of the
 * breath. The ORDER is part of the scheme, not presentation: the original
 * attributes the mapping to the operative scheme of *Ohr ha-Sekhel*, and
 * describes it as "an application-layer correspondence used by this instrument,
 * not a claim about historical practice".
 *
 * This list previously ran holam, qubuts, hiriq, tzere, qamatz — positions two
 * and five swapped against the cited scheme.
 *
 * The sounds were also wrong, and wrong about Hebrew rather than merely
 * divergent: holam was labelled 'u' and qubuts 'o'. Holam is the /o/ vowel and
 * qubuts the /u/, as the original's table has them. A practitioner intoning
 * from the old readout was sounding the wrong vowel through two of the five
 * gates.
 *
 * Direction vectors stay in this scene's frame, where forward is -Z. The
 * original tabulates qubuts as "Z +1" in its own convention; that is the same
 * gate described from a different axis convention, not a disagreement.
 */
export const VOWELS: readonly Vowel[] = [
  { name: 'Holam', sound: 'o', mark: 'ֹ', axis: 'up', direction: [0, 1, 0] },
  { name: 'Qamatz', sound: 'a', mark: 'ָ', axis: 'right', direction: [1, 0, 0] },
  { name: 'Hiriq', sound: 'i', mark: 'ִ', axis: 'down', direction: [0, -1, 0] },
  { name: 'Tzere', sound: 'e', mark: 'ֵ', axis: 'left', direction: [-1, 0, 0] },
  { name: 'Qubuts', sound: 'u', mark: 'ֻ', axis: 'forward', direction: [0, 0, -1] },
] as const

/** Gates per letter. One gate is one inhale and one exhale. */
export const GATES_PER_LETTER = VOWELS.length

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

/**
 * A practice session, ported from the original's `createPracticeSession`.
 *
 * The discipline nests three levels, and the XR chamber previously had none of
 * them: it mapped elapsed time straight onto one of 24 permutations, so a
 * single breath advanced a whole arrangement and the letters were never walked.
 * It demonstrated permutations rather than performing the practice.
 *
 * The real shape is permutations, then letters within each permutation — the
 * centre holds the letter you are working — then five gates per letter, each
 * gate one inhale and one exhale. For YHVH that is 24 x 4 x 5 = 480 breath
 * cycles, about sixty-four minutes, which is the figure the original's own
 * manual quotes.
 */
export type PracticeSession = {
  tokens: readonly NameToken[]
  permutations: NameToken[][]
  totalPermutations: number
  lettersPerPermutation: number
  /** Letter-cycles: permutations x letters. Each is GATES_PER_LETTER breaths. */
  totalCycles: number
  /** Breath cycles for the whole session. */
  totalBreaths: number
}

export function createPracticeSession(
  tokens: readonly NameToken[],
): PracticeSession {
  const permutations = permute(tokens)
  const lettersPerPermutation = tokens.length
  const totalCycles = permutations.length * lettersPerPermutation

  return {
    tokens,
    permutations,
    totalPermutations: permutations.length,
    lettersPerPermutation,
    totalCycles,
    totalBreaths: totalCycles * GATES_PER_LETTER,
  }
}

export type PracticePosition = {
  permutationIndex: number
  letterIndex: number
  /** Which of the five gates this breath is working. */
  gateIndex: number
  currentPermutation: NameToken[]
  currentLetter: NameToken | null
  gate: Vowel
  /** Letter-cycles completed, matching the original's `cycleInSession`. */
  cycleInSession: number
  isComplete: boolean
}

/**
 * Where a given breath falls in the session.
 *
 * Ported from `getPracticePosition`, extended by the gate level the original
 * keeps in its metronome rather than its practice engine. Walks
 * permutation-major, letter-minor, gate-innermost; completion is terminal and
 * clamps rather than wrapping.
 */
export function getPracticePosition(
  session: PracticeSession,
  breathCount: number,
): PracticePosition {
  const breath = Math.max(0, Math.floor(breathCount))
  const lastPermutation = session.permutations[session.totalPermutations - 1] ?? []

  if (session.totalBreaths === 0 || breath >= session.totalBreaths) {
    return {
      permutationIndex: Math.max(0, session.totalPermutations - 1),
      letterIndex: Math.max(0, session.lettersPerPermutation - 1),
      gateIndex: GATES_PER_LETTER - 1,
      currentPermutation: lastPermutation,
      currentLetter: null,
      gate: VOWELS[GATES_PER_LETTER - 1],
      cycleInSession: session.totalCycles,
      isComplete: true,
    }
  }

  const cycle = Math.floor(breath / GATES_PER_LETTER)
  const gateIndex = breath % GATES_PER_LETTER
  const permutationIndex = Math.floor(cycle / session.lettersPerPermutation)
  const letterIndex = cycle % session.lettersPerPermutation
  const currentPermutation = session.permutations[permutationIndex]

  return {
    permutationIndex,
    letterIndex,
    gateIndex,
    currentPermutation,
    currentLetter: currentPermutation[letterIndex],
    gate: VOWELS[gateIndex],
    cycleInSession: cycle,
    isComplete: false,
  }
}

/** Render a permutation the way the original's `renderPermutation` does. */
export function renderPermutation(tokens: readonly NameToken[]) {
  return tokens.map((token) => token.latin).join('')
}

export function renderPermutationHebrew(tokens: readonly NameToken[]) {
  return tokens.map((token) => token.hebrew).join('')
}
