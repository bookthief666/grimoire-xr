import assert from 'node:assert/strict'
import test from 'node:test'
import { LIBER_333 } from '../src/tools/liber333Corpus.ts'
import {
  CHAPTER_COUNT,
  calculateGematria,
  drawReading,
  getReadingChapterIndexes,
  isVeil,
  sephiraForRecord,
  stringToHash,
  theosophicReduction,
} from '../src/tools/liber333.ts'
import {
  LIBER333_CORPUS_CONVENTION,
  LIBER333_FIELD_PROVENANCE,
} from '../src/tools/provenance.ts'

/**
 * Parity fixtures produced by running the ORIGINAL edition's own
 * `calculateGematria`, `stringToHash` and `getReadingChapterIndexes`
 * (bookthief666/liber-333-grimoire) against fixed questions.
 *
 * These are the point of this file. Grimoire XR previously seeded
 * `(englishOrdinal + FNV-1a) % 94` and applied fixed offsets of 0/31/62, so the
 * same question produced different chapters in the two applications. If these
 * assertions fail, the two editions have diverged again.
 */
const GOLDEN = [
  {
    q: 'What is the hidden part of this Will?',
    simple: 345, reduced: 3, raw: 29, steps: [345, 12, 3],
    hash: 1801770900, single: [63], triad: [63, 3, 50],
  },
  {
    q: 'Show me what I refuse to see',
    simple: 282, reduced: 3, raw: 22, steps: [282, 12, 3],
    hash: 530186420, single: [0], triad: [0, 3, 6],
  },
  {
    // Digits are not counted by English Ordinal, so this sums to zero.
    q: '93',
    simple: 0, reduced: 0, raw: 0, steps: [0],
    hash: 1818, single: [0], triad: [0, 1, 32],
  },
  {
    q: 'a',
    simple: 1, reduced: 1, raw: 1, steps: [1],
    hash: 97, single: [1], triad: [1, 2, 3],
  },
  {
    // Empty question: every index collides and the forward-wrap resolves them.
    q: '',
    simple: 0, reduced: 0, raw: 0, steps: [0],
    hash: 0, single: [0], triad: [0, 1, 2],
  },
  {
    q: 'Kill thyself',
    simple: 139, reduced: 4, raw: 11, steps: [139, 13, 4],
    hash: 1685933393, single: [45], triad: [45, 4, 59],
  },
] as const

test('gematria matches the original edition exactly', () => {
  for (const g of GOLDEN) {
    const actual = calculateGematria(g.q)
    assert.equal(actual.simple, g.simple, `simple for ${JSON.stringify(g.q)}`)
    assert.equal(actual.reduced, g.reduced, `reduced for ${JSON.stringify(g.q)}`)
    assert.equal(actual.raw, g.raw, `raw for ${JSON.stringify(g.q)}`)
    assert.deepEqual(actual.reductionSteps, [...g.steps], `steps for ${JSON.stringify(g.q)}`)
  }
})

test('theosophic reduction has no master-number exception', () => {
  // The earlier implementation stopped at 11, 22 and 33. The original edition
  // reduces unconditionally, and the antithesis chapter depends on it.
  assert.equal(theosophicReduction(11), 2)
  assert.equal(theosophicReduction(22), 4)
  assert.equal(theosophicReduction(33), 6)
  assert.equal(theosophicReduction(345), 3)
})

test('question hash matches the original edition exactly', () => {
  for (const g of GOLDEN) {
    assert.equal(stringToHash(g.q), g.hash, `hash for ${JSON.stringify(g.q)}`)
  }
})

test('chapter selection matches the original edition exactly', () => {
  for (const g of GOLDEN) {
    const gematria = calculateGematria(g.q)

    assert.deepEqual(
      getReadingChapterIndexes({ chapterCount: 94, gematria, question: g.q, mode: 'single' }),
      [...g.single],
      `single draw for ${JSON.stringify(g.q)}`,
    )
    assert.deepEqual(
      getReadingChapterIndexes({ chapterCount: 94, gematria, question: g.q, mode: 'triad' }),
      [...g.triad],
      `triad draw for ${JSON.stringify(g.q)}`,
    )
  }
})

test('a triad never draws the same record twice', () => {
  for (const g of GOLDEN) {
    const reading = drawReading(g.q, 'triad')
    const indexes = reading.draws.map((d) => d.index)
    assert.equal(new Set(indexes).size, 3, `duplicate draw for ${JSON.stringify(g.q)}`)
  }
})

test('the corpus is 94 records covering the two veils and Chapters 0-91', () => {
  assert.equal(LIBER_333.length, LIBER333_CORPUS_CONVENTION.totalRecords)
  assert.equal(CHAPTER_COUNT, 94)

  const numbers = LIBER_333.map((r) => r.chapter)
  assert.equal(Math.min(...numbers), -LIBER333_CORPUS_CONVENTION.preliminaryRecords)
  assert.equal(Math.max(...numbers), LIBER333_CORPUS_CONVENTION.numberedEnd)

  // Contiguous, so an index can never resolve to a chapter that does not exist.
  for (let i = 1; i < numbers.length; i += 1) {
    assert.equal(numbers[i], numbers[i - 1] + 1, `gap before chapter ${numbers[i]}`)
  }
})

test('every record carries all eight fields with real content', () => {
  for (const record of LIBER_333) {
    for (const field of ['title', 'text', 'commentary', 'sephira', 'path', 'element', 'tarot'] as const) {
      assert.equal(typeof record[field], 'string', `chapter ${record.chapter} ${field}`)
      assert.ok(record[field].length > 0, `chapter ${record.chapter} ${field} is empty`)
    }
  }
})

test('a drawn record reports its own chapter number, not its array index', () => {
  // Index 0 is chapter -2, the '?' veil. Reading the index as a chapter number
  // is the specific bug this guards: it made the veils unreachable and invented
  // chapters 92 and 93.
  const first = LIBER_333[0]
  assert.equal(first.chapter, -2)
  assert.ok(isVeil(first))

  const reading = drawReading('', 'single')
  assert.equal(reading.draws[0].index, 0)
  assert.equal(reading.draws[0].number, -2)
  assert.equal(reading.draws[0].record.title, '?')
})

test('veils are drawable and carry no path or Tarot attribution', () => {
  const veils = LIBER_333.filter(isVeil)
  assert.equal(veils.length, 2)
  for (const veil of veils) {
    assert.equal(veil.path, '—')
    assert.equal(veil.tarot, '—')
  }
})

test('Sephira comes from the record, never from a modulo of the number', () => {
  // The earlier implementation returned SEPHIROTH[number % 10], which is
  // invented data standing in front of the correspondence the corpus carries.
  const kether = LIBER_333.find((r) => r.chapter === 1)
  assert.ok(kether)
  assert.equal(kether.sephira, 'Kether')
  assert.equal(sephiraForRecord(kether)?.name, 'Kether')

  // Veil sephiroth are outside the Tree and must resolve to nothing rather than
  // being forced onto a node.
  assert.equal(sephiraForRecord(LIBER_333[0]), null)
})

test('commentary is never labelled as source text', () => {
  assert.equal(LIBER333_FIELD_PROVENANCE.text, 'primary-source')
  assert.equal(LIBER333_FIELD_PROVENANCE.title, 'primary-source')
  assert.equal(LIBER333_FIELD_PROVENANCE.commentary, 'scholarly-commentary')

  for (const field of ['sephira', 'path', 'element', 'tarot'] as const) {
    assert.equal(LIBER333_FIELD_PROVENANCE[field], 'experimental-correspondence')
  }
})
