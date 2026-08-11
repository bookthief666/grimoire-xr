import assert from 'node:assert/strict'
import test from 'node:test'
import {
  TECH_LEVEL_OPTIONS,
  TONE_OPTIONS,
  TRADITION_OPTIONS,
} from '../src/constants/ritualOptions.ts'
import { TAROT_SYSTEM_OPTIONS } from '../src/constants/tarotSystems.ts'
import { EROS_LEVEL_OPTIONS } from '../src/constants/erosLevels.ts'
import {
  ART_STYLE_FAMILY_OPTIONS,
  getStylesByFamily,
} from '../src/constants/artStyles.ts'
import { cycleOption, cycleString, INTENT_OPTIONS, SUBJECT_OPTIONS } from '../src/scene/workbench/shared.ts'

/**
 * The Forge was rebuilt from two plated panels into inscribed dials, and each
 * dial now has ONE hit plane instead of two arrow targets — direction comes
 * from which side of the plane the ray lands on. That halves the invisible
 * geometry, but it also means "does back still work?" is no longer obvious
 * from looking at the scene, and a pixel probe cannot answer it because the
 * solar engine animates continuously behind the text.
 *
 * So it is asserted here instead: every dimension the Forge exposes must cycle
 * in both directions and come back to where it started. The presentation
 * changed; the capability must not have.
 */

const OPTION_DIMENSIONS = [
  ['tradition', TRADITION_OPTIONS],
  ['tarot system', TAROT_SYSTEM_OPTIONS],
  ['tone', TONE_OPTIONS],
  ['technical level', TECH_LEVEL_OPTIONS],
  ['art style family', ART_STYLE_FAMILY_OPTIONS],
  ['eros level', EROS_LEVEL_OPTIONS],
] as const

test('every option dimension cycles forward through all of its values', () => {
  for (const [name, options] of OPTION_DIMENSIONS) {
    let value = options[0].value
    const seen = new Set([value])

    for (let i = 1; i < options.length; i += 1) {
      value = cycleOption(options, value, 1)
      seen.add(value)
    }

    assert.equal(seen.size, options.length, `${name} did not reach every value`)
  }
})

test('every option dimension cycles backward and returns', () => {
  for (const [name, options] of OPTION_DIMENSIONS) {
    const start = options[0].value
    const forward = cycleOption(options, start, 1)
    const back = cycleOption(options, forward, -1)

    assert.equal(back, start, `${name} did not return when stepped back`)
  }
})

test('cycling wraps at both ends rather than sticking', () => {
  // A dial the practitioner cannot step past the end of would strand them on
  // the last value with no way back round.
  for (const [name, options] of OPTION_DIMENSIONS) {
    const first = options[0].value
    const last = options[options.length - 1].value

    assert.equal(cycleOption(options, first, -1), last, `${name} does not wrap backward`)
    assert.equal(cycleOption(options, last, 1), first, `${name} does not wrap forward`)
  }
})

test('art styles cycle within every family, not across the whole set', () => {
  // Style is scoped by family: the dial must cycle the 5-15 styles of the
  // current family rather than all 57.
  for (const family of ART_STYLE_FAMILY_OPTIONS) {
    const styles = getStylesByFamily(family.value).map((style) => ({
      value: style.id,
      label: style.label,
    }))

    assert.ok(styles.length > 0, `family ${family.value} has no styles`)

    const start = styles[0].value
    const forward = cycleOption(styles, start, 1)
    assert.equal(cycleOption(styles, forward, -1), start, `${family.value} did not return`)
    assert.ok(
      styles.some((s) => s.value === forward),
      `${family.value} cycled outside its own styles`,
    )
  }
})

test('the free-text dimensions cycle both ways too', () => {
  for (const [name, values] of [
    ['subject', SUBJECT_OPTIONS],
    ['intent', INTENT_OPTIONS],
  ] as const) {
    assert.ok(values.length > 1, `${name} has nothing to cycle`)

    const start = values[0]
    const forward = cycleString(values, start, 1)
    assert.notEqual(forward, start, `${name} did not advance`)
    assert.equal(cycleString(values, forward, -1), start, `${name} did not return`)
  }
})
