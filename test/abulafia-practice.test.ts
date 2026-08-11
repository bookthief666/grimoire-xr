import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BREATH_CYCLE_SECONDS,
  GATES_PER_LETTER,
  TETRAGRAMMATON,
  VOWELS,
  createPracticeSession,
  getPracticePosition,
  permute,
  renderPermutation,
} from '../src/tools/abulafia.ts'

/**
 * Invariants ported from the original application's own tests
 * (bookthief666/abulafia.exe, permutationEngine.test.ts and
 * practiceEngine.test.ts), plus the ordering facts its manual states.
 *
 * Three divergences were found when comparing the XR port against it, all of
 * the same class: the algorithms had been reimplemented rather than ported, and
 * had drifted. These assertions exist so they cannot drift again.
 */

test('Heap emission order matches the original exactly', () => {
  // The original's manual: "The output order is not alphabetical; it is the
  // order the algorithm produces, and that order is part of the practice."
  //
  // A recursive Heap's variant produced the same 24 arrangements but diverged
  // at index 6 — HHVY where the original emits HHYV — so the same name worked
  // in the two applications parted company a quarter of the way through.
  const rendered = permute(TETRAGRAMMATON).map(renderPermutation)

  assert.deepEqual(rendered.slice(0, 8), [
    'YHVH', 'HYVH', 'VYHH', 'YVHH', 'HVYH', 'VHYH', 'HHYV', 'HHYV',
  ])
})

test('letters are positionally distinct, so YHVH yields 24 and not 12', () => {
  const permutations = permute(TETRAGRAMMATON)
  assert.equal(permutations.length, 24)

  // The two He are tracked as separate letters. Rendered as strings they
  // collapse to 12 — deduplicating them would be "arithmetically tidier and
  // operatively false".
  const rendered = permutations.map(renderPermutation)
  assert.equal(new Set(rendered).size, 12)
})

test('the five gates follow the cited scheme in order', () => {
  // Attributed by the original to the operative scheme of Ohr ha-Sekhel. The
  // pairings were already right here; positions two and five were swapped.
  assert.deepEqual(
    VOWELS.map((vowel) => `${vowel.name.toLowerCase()}/${vowel.axis}`),
    ['holam/up', 'qamatz/right', 'hiriq/down', 'tzere/left', 'qubuts/forward'],
  )
  assert.equal(GATES_PER_LETTER, 5)
})

test('a session nests permutations, letters and gates', () => {
  const session = createPracticeSession(TETRAGRAMMATON)

  assert.equal(session.totalPermutations, 24)
  assert.equal(session.lettersPerPermutation, 4)
  assert.equal(session.totalCycles, 24 * 4)
  assert.equal(session.totalBreaths, 24 * 4 * 5)
})

test('the session is the hour the manual describes', () => {
  // "Four letters produce twenty-four permutations and four hundred and eighty
  // breath cycles — roughly an hour of unbroken work." Asserted so the code and
  // that claim cannot drift apart.
  const session = createPracticeSession(TETRAGRAMMATON)
  assert.equal(session.totalBreaths, 480)

  const minutes = (session.totalBreaths * BREATH_CYCLE_SECONDS) / 60
  assert.equal(minutes, 64)
})

test('position walks permutation-major, letter-minor, gate-innermost', () => {
  const session = createPracticeSession(TETRAGRAMMATON)

  const first = getPracticePosition(session, 0)
  assert.equal(first.permutationIndex, 0)
  assert.equal(first.letterIndex, 0)
  assert.equal(first.gateIndex, 0)
  assert.equal(first.gate.name, 'Holam')
  assert.equal(first.currentLetter?.latin, 'Y')

  // Five breaths complete one letter, not one permutation.
  const secondLetter = getPracticePosition(session, 5)
  assert.equal(secondLetter.permutationIndex, 0)
  assert.equal(secondLetter.letterIndex, 1)
  assert.equal(secondLetter.gateIndex, 0)

  // Twenty breaths (4 letters x 5 gates) complete the first permutation.
  const secondPermutation = getPracticePosition(session, 20)
  assert.equal(secondPermutation.permutationIndex, 1)
  assert.equal(secondPermutation.letterIndex, 0)
  assert.equal(secondPermutation.cycleInSession, 4)
})

test('every gate in a letter is visited once, in order', () => {
  const session = createPracticeSession(TETRAGRAMMATON)
  const gates = Array.from(
    { length: GATES_PER_LETTER },
    (_, i) => getPracticePosition(session, i).gate.name,
  )

  assert.deepEqual(gates, ['Holam', 'Qamatz', 'Hiriq', 'Tzere', 'Qubuts'])
})

test('the current letter is the one at letterIndex of the current permutation', () => {
  const session = createPracticeSession(TETRAGRAMMATON)

  for (const breath of [0, 7, 23, 61, 199, 479]) {
    const position = getPracticePosition(session, breath)
    assert.equal(
      position.currentLetter,
      position.currentPermutation[position.letterIndex],
      `breath ${breath} letter disagrees with its permutation`,
    )
  }
})

test('completion is terminal and clamps rather than wrapping', () => {
  const session = createPracticeSession(TETRAGRAMMATON)

  const last = getPracticePosition(session, session.totalBreaths - 1)
  assert.equal(last.isComplete, false)

  for (const beyond of [session.totalBreaths, session.totalBreaths + 1000]) {
    const done = getPracticePosition(session, beyond)
    assert.equal(done.isComplete, true)
    assert.equal(done.currentLetter, null)
    assert.equal(done.cycleInSession, session.totalCycles)
    assert.equal(done.permutationIndex, session.totalPermutations - 1)
  }
})

test('negative and fractional breath counts are clamped, not thrown', () => {
  const session = createPracticeSession(TETRAGRAMMATON)

  assert.equal(getPracticePosition(session, -5).gateIndex, 0)
  assert.equal(getPracticePosition(session, 2.9).gateIndex, 2)
})
