import assert from 'node:assert/strict'
import test from 'node:test'
import { buildReaderPages, paginate } from '../src/scene/chambers/readerPagination.ts'
import { LIBER_333 } from '../src/tools/liber333Corpus.ts'

test('pagination never splits a word', () => {
  const text = 'alpha beta gamma delta epsilon zeta eta theta'
  for (const page of paginate(text, 12)) {
    for (const word of page.split(' ')) {
      assert.ok(text.split(' ').includes(word), `mangled word: ${word}`)
    }
  }
})

test('pagination loses no words and preserves order', () => {
  for (const record of LIBER_333) {
    const rejoined = paginate(record.text, 300).join(' ')
    assert.equal(
      rejoined.split(/\s+/).filter(Boolean).join(' '),
      record.text.split(/\s+/).filter(Boolean).join(' '),
      `chapter ${record.chapter} verse altered by pagination`,
    )
  }
})

test('verse and commentary never share a page', () => {
  // The reader must be able to show where Crowley stops and this edition
  // starts; a merged page would attribute editorial prose to the source.
  const record = LIBER_333.find((r) => r.chapter === 63)
  assert.ok(record)

  const pages = buildReaderPages(record.text, record.commentary)
  const kinds = pages.map((p) => p.kind)

  assert.equal(kinds[0], 'verse')
  assert.ok(kinds.includes('commentary'))
  // All verse pages precede all commentary pages.
  assert.equal(kinds.lastIndexOf('verse') < kinds.indexOf('commentary'), true)
})

test('every chapter produces at least one readable page of each kind', () => {
  for (const record of LIBER_333) {
    const pages = buildReaderPages(record.text, record.commentary)
    assert.ok(pages.some((p) => p.kind === 'verse'), `chapter ${record.chapter} has no verse page`)
    assert.ok(
      pages.some((p) => p.kind === 'commentary'),
      `chapter ${record.chapter} has no commentary page`,
    )
    for (const page of pages) assert.ok(page.body.length > 0)
  }
})
