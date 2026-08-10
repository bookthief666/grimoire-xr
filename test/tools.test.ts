import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ABULAFIA_PROVENANCE,
  BREATH_CYCLE_SECONDS,
  TETRAGRAMMATON,
  breathAt,
  buildSequence,
  permute,
  stepIndexAt,
} from '../src/tools/abulafia.ts'
import {
  GLYPH_PHASES,
  MONAS_PROVENANCE,
  THEOREMS,
  phaseReached,
} from '../src/tools/monas.ts'
import {
  CHAPTER_COUNT,
  LIBER333_PROVENANCE,
  PATHS,
  drawChapters,
  englishOrdinal,
  theosophicReduction,
} from '../src/tools/liber333.ts'

test('Abulafia permutations preserve positional duplicates', () => {
  const permutations = permute(TETRAGRAMMATON)
  assert.equal(permutations.length, 24)

  const rendered = permutations.map((tokens) =>
    tokens.map((token) => token.latin).join(''),
  )
  assert.ok(new Set(rendered).size < rendered.length)

  const sequence = buildSequence(TETRAGRAMMATON)
  assert.equal(sequence.length, 24)
  assert.deepEqual(sequence[0].tokens.length, 4)
})

test('Abulafia breath clock is deterministic at phase boundaries', () => {
  assert.deepEqual(breathAt(0), { phase: 'inhale', progress: 0, cycle: 0 })
  assert.equal(breathAt(4).phase, 'exhale')
  assert.equal(breathAt(BREATH_CYCLE_SECONDS).cycle, 1)
  assert.equal(stepIndexAt(BREATH_CYCLE_SECONDS * 25, 24), 1)
})

test('Abulafia practice advertises reconstruction provenance', () => {
  assert.equal(ABULAFIA_PROVENANCE.layer, 'operative-reconstruction')
})

test('Monad phase model is ordered and explicitly reconstructed', () => {
  assert.equal(GLYPH_PHASES.length, 6)
  assert.equal(THEOREMS.length, GLYPH_PHASES.length)
  assert.equal(MONAS_PROVENANCE.layer, 'operative-reconstruction')
  assert.match(THEOREMS[0].latin, /NOT A DEE QUOTATION/)
  assert.equal(phaseReached('cross', 'point'), true)
  assert.equal(phaseReached('point', 'cross'), false)
})

test('Liber 333 arithmetic helpers remain stable', () => {
  assert.equal(englishOrdinal('ABC'), 6)
  assert.equal(englishOrdinal('A B-C!'), 6)
  assert.equal(theosophicReduction(93), 3)
  assert.equal(theosophicReduction(11), 11)
  assert.equal(CHAPTER_COUNT, 94)
})

test('Chapel uses 22 geometric paths and labels experimental mappings', () => {
  assert.equal(PATHS.length, 22)
  assert.equal(LIBER333_PROVENANCE.layer, 'experimental-correspondence')

  const first = drawChapters('What is the hidden cost?', 'triad')
  const second = drawChapters('What is the hidden cost?', 'triad')

  assert.deepEqual(first, second)
  assert.equal(first.length, 3)
  assert.equal(new Set(first.map((draw) => draw.number)).size, 3)

  for (const draw of first) {
    assert.ok(draw.number >= 0 && draw.number < CHAPTER_COUNT)
    assert.equal(draw.basis, 'experimental-correspondence')
    assert.match(draw.sephira.title, /WORKING MAP/)
  }
})
