import assert from 'node:assert/strict'
import test from 'node:test'
import { MONAS_SENTENCES } from '../src/tools/monasCorpus.ts'
import {
  GLYPH_PHASES,
  MONAS_CORPUS_SCOPE,
  MONAS_PROVENANCE,
  registersFor,
  sentenceForPhase,
  sentencesForPhase,
} from '../src/tools/monas.ts'
import { MONAS_FIELD_PROVENANCE } from '../src/tools/provenance.ts'

/** The exact string every entry used to carry in its source-language slot. */
const PLACEHOLDER = 'OPERATIVE RECONSTRUCTION — NOT A DEE QUOTATION'

test('the placeholder is gone from every sentence', () => {
  // This is the whole point of the port. Before it, the chamber displayed this
  // string where Dee's Latin belongs, because no sourced text was available.
  for (const sentence of MONAS_SENTENCES) {
    assert.ok(
      !sentence.latin.includes(PLACEHOLDER),
      `${sentence.id} still carries the placeholder`,
    )
    assert.ok(sentence.latin.trim().length > 0, `${sentence.id} has empty Latin`)
  }
})

test('the corpus is the sourced fragment it claims to be, not the whole work', () => {
  assert.equal(MONAS_SENTENCES.length, MONAS_CORPUS_SCOPE.sentences)

  const covered = [...new Set(MONAS_SENTENCES.map((s) => s.theorem))].sort((a, b) => a - b)
  assert.deepEqual(covered, [...MONAS_CORPUS_SCOPE.coveredTheorems])

  // Guards the claim that matters most: this is 5 of Dee's 24, and nothing in
  // the code may quietly start implying otherwise.
  assert.equal(MONAS_CORPUS_SCOPE.theoremsInWork, 24)
  assert.ok(covered.length < MONAS_CORPUS_SCOPE.theoremsInWork)
})

test('every construction phase has at least one sourced sentence', () => {
  // If this fails, some phase would need text invented to fill it — which is
  // exactly what must never happen.
  for (const phase of GLYPH_PHASES) {
    const sentences = sentencesForPhase(phase)
    assert.ok(sentences.length > 0, `phase "${phase}" has no sourced sentence`)
    assert.equal(sentenceForPhase(phase), sentences[0])
  }
})

test('every sentence carries all four provenance fields with real content', () => {
  for (const sentence of MONAS_SENTENCES) {
    for (const field of ['latin', 'english', 'paraphrase', 'sourceNote'] as const) {
      assert.equal(typeof sentence[field], 'string', `${sentence.id} ${field}`)
      assert.ok(sentence[field].trim().length > 0, `${sentence.id} ${field} is empty`)
    }
  }
})

test('advertised registers always have content behind them', () => {
  // The chamber only renders register buttons that registersFor() returns. A
  // button that resolves to nothing would be a lie about what the edition
  // actually wrote — the registers are partial by design.
  for (const sentence of MONAS_SENTENCES) {
    const registers = registersFor(sentence)
    assert.ok(registers.length > 0, `${sentence.id} has no registers at all`)
    assert.ok(registers.includes('literal'), `${sentence.id} lacks the literal register`)

    for (const register of registers) {
      const body = sentence.layers[register]
      assert.ok(
        typeof body === 'string' && body.trim().length > 0,
        `${sentence.id} advertises "${register}" with no content`,
      )
    }
  }
})

test('registers are reported in a stable order across sentences', () => {
  for (const sentence of MONAS_SENTENCES) {
    const registers = registersFor(sentence)
    const sorted = [...registers].sort(
      (a, b) => registersFor(sentence).indexOf(a) - registersFor(sentence).indexOf(b),
    )
    assert.deepEqual(registers, sorted)
    assert.equal(registers[0], 'literal', 'literal must lead')
  }
})

test("Dee's numbering and the construction order are not conflated", () => {
  // The two sequences genuinely disagree: theorem 1 is the circle phase and
  // theorem 2 covers both line and point. Collapsing them would misrepresent
  // Dee's ordering as the glyph's assembly order.
  const circle = sentenceForPhase('circle')
  assert.equal(circle.theorem, 1)

  const line = sentenceForPhase('line')
  const point = sentenceForPhase('point')
  assert.equal(line.theorem, 2)
  assert.equal(point.theorem, 2)

  const phaseOrder = GLYPH_PHASES.map((p) => sentenceForPhase(p).theorem)
  const ascending = [...phaseOrder].sort((a, b) => a - b)
  assert.notDeepEqual(phaseOrder, ascending, 'phase order must not be theorem order')
})

test('provenance separates source, translation and commentary', () => {
  assert.equal(MONAS_FIELD_PROVENANCE.latin, 'primary-source')
  assert.equal(MONAS_FIELD_PROVENANCE.english, 'translation')
  assert.equal(MONAS_FIELD_PROVENANCE.paraphrase, 'scholarly-commentary')
  assert.equal(MONAS_FIELD_PROVENANCE.layers, 'scholarly-commentary')

  // The Latin must never share a tier with the edition's own interpretation.
  assert.notEqual(MONAS_FIELD_PROVENANCE.latin, MONAS_FIELD_PROVENANCE.paraphrase)
  assert.notEqual(MONAS_FIELD_PROVENANCE.latin, MONAS_FIELD_PROVENANCE.english)
})

test('the provenance record admits the missing nineteen theorems', () => {
  assert.equal(MONAS_PROVENANCE.layer, 'primary-source')
  assert.match(MONAS_PROVENANCE.reference, /24 theorems/)
  assert.match(MONAS_PROVENANCE.notes ?? '', /Do not compose Latin/)
})

test('the provisional entry keeps its flag', () => {
  // The original tagged its final entry 'cross-preview'. Renaming it to 'cross'
  // for the construction vocabulary must not erase that it was a preview.
  const provisional = MONAS_SENTENCES.filter((s) => s.provisional)
  assert.equal(provisional.length, 1)
  assert.equal(provisional[0].phase, 'cross')
  assert.equal(provisional[0].theorem, 6)
})
