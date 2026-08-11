// Ported from the original application's Study Temple.
//
// Source: bookthief666/abulafia.exe, src/components/StudyTemple.tsx
// Prose is the original's, verbatim. Nothing here was written to fill a gap.
//
// The XR chamber had the mechanism and none of the teaching: no account of what
// Abulafia was doing, why the two He of YHVH are not interchangeable, what a
// gate is, or where the vowel/direction correspondence comes from. A room that
// performs a discipline without being able to explain it is a demonstration,
// not an instrument.
//
// The correspondence section carries the original's own disclaimer, which is
// exactly the provenance discipline this project requires and which was already
// written: the mapping follows the operative scheme of Ohr ha-Sekhel and is an
// application-layer correspondence, not a claim about historical practice.

import type { ProvenanceLayer } from './provenance'

export type StudySection = {
  id: string
  /** Small label above the title in the original's layout. */
  kicker: string
  title: string
  body: readonly string[]
  layer: ProvenanceLayer
}

export const STUDY_TITLE = 'Tzeruf Ha-Otiot'
export const STUDY_SUBTITLE = 'The Permutation of Letters'

/** The five gates as the original tabulates them, for display beside the practice. */
export const GATE_TABLE = [
  { vowel: 'holam', sound: 'O', direction: 'up' },
  { vowel: 'qamatz', sound: 'A', direction: 'right' },
  { vowel: 'hiriq', sound: 'I', direction: 'down' },
  { vowel: 'tzere', sound: 'E', direction: 'left' },
  { vowel: 'qubuts', sound: 'U', direction: 'forward' },
] as const

export const STUDY_SECTIONS: readonly StudySection[] = [
  {
    id: 'rationale',
    kicker: 'The Manual',
    title: STUDY_TITLE,
    layer: 'scholarly-commentary',
    body: [
      'Abraham Abulafia, writing in the thirteenth century, held that ordinary language binds the mind to meaning, and that meaning binds it to the world of things. To loosen that binding he prescribed a discipline: take a name, break it into its letters, and turn those letters through every arrangement they admit — sounding each one on the breath, with the head inclined along a fixed set of directions. This instrument performs that discipline exactly, and refuses to simplify it.',
    ],
  },
  {
    id: 'miktav',
    kicker: 'Core Logic I',
    title: 'Miktav — The Permutation Engine',
    layer: 'operative-reconstruction',
    body: [
      "Given a name of n letters, the engine generates all n! permutations by Heap's algorithm. Every letter is treated as positionally distinct: in YHVH the two Hs are not interchangeable but are tracked as separate souls, so the name yields 24 arrangements, not twelve. Collapsing them would be arithmetically tidier and operatively false.",
      'The output order is not alphabetical; it is the order the algorithm produces, and that order is part of the practice.',
    ],
  },
  {
    id: 'mivta',
    kicker: 'Core Logic II',
    title: 'Mivta — The Somatic Metronome',
    layer: 'operative-reconstruction',
    body: [
      'Each letter is carried through five gates. A gate is a pairing of one vowel with one direction, and it occupies two movements of the breath: four seconds of inhalation, in which nothing is sounded and the letter is gathered, then four seconds of exhalation, in which the letter is intoned with its vowel and the head turns along the direction.',
      'The pace is enforced. You cannot hurry it, and the inability to hurry it is the point.',
    ],
  },
  {
    id: 'gates',
    kicker: 'Correspondence',
    title: 'The Five Gates',
    layer: 'experimental-correspondence',
    body: [
      'The mapping below follows the operative scheme of Ohr ha-Sekhel. It is an application-layer correspondence used by this instrument, not a claim about historical practice.',
    ],
  },
  {
    id: 'practice',
    kicker: 'Practice',
    title: 'How to Use the Chamber',
    layer: 'operative-reconstruction',
    body: [
      'Enter a name at the gate. Four letters produce twenty-four permutations and four hundred and eighty breath cycles — roughly an hour of unbroken work. Begin with less if you have not done this before.',
      'In the chamber, the centre holds the letter you are working. Beneath it the instrument names the sound and the direction. On the inhale, the field contracts and darkens: gather, and prepare. On the exhale, it opens and brightens: sound the letter with its vowel, and let the head follow the indicated direction. When five gates are complete the next letter takes the centre; when the letters are exhausted the next permutation begins.',
      'Stop when the discipline stops being a discipline. The engine keeps its place.',
    ],
  },
]
