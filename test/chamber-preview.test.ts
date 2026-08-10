import assert from 'node:assert/strict'
import test from 'node:test'
import { CHAMBER_PREVIEW_ARTIFACTS } from '../src/scene/chambers/previewArtifacts.ts'
import { CHAMBER_IDS } from '../src/scene/chambers/types.ts'

/**
 * These assertions run against `CHAMBER_IDS`, the runtime source of truth the
 * `ChamberId` union is derived from, rather than against a second copy of the
 * mapping. Restating the literal would only prove the constant still equals
 * itself. The regressions worth catching are a chamber gaining an id without a
 * bay identity, and two bays collapsing onto the same artifact so the wall
 * stations stop being distinguishable at a glance.
 *
 * The registry itself cannot be imported here: it pulls in React/Three chamber
 * components, which the native type-stripping test runner cannot resolve. That
 * direction is covered by the compiler instead — `Chamber.previewArtifact` is
 * required, and `CHAMBER_PREVIEW_ARTIFACTS` is declared
 * `satisfies Readonly<Record<ChamberId, ChamberPreviewArtifact>>`.
 */

test('every chamber id has a preview identity', () => {
  for (const id of CHAMBER_IDS) {
    assert.ok(
      CHAMBER_PREVIEW_ARTIFACTS[id],
      `chamber "${id}" has no preview artifact`,
    )
  }
})

test('the preview map carries no entry for a chamber that does not exist', () => {
  const registered = new Set<string>(CHAMBER_IDS)

  for (const id of Object.keys(CHAMBER_PREVIEW_ARTIFACTS)) {
    assert.ok(
      registered.has(id),
      `CHAMBER_PREVIEW_ARTIFACTS has orphan entry "${id}"`,
    )
  }
})

test('preview identities are unique, so no two bays render alike', () => {
  const used = CHAMBER_IDS.map((id) => CHAMBER_PREVIEW_ARTIFACTS[id])

  assert.equal(
    new Set(used).size,
    CHAMBER_IDS.length,
    `two chambers share a preview artifact: ${used.join(', ')}`,
  )
})
