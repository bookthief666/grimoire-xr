# Engineering Gate Policy

Applies to Grimoire XR feature branches after 2026-08-19.

## Evidence hierarchy

A milestone is not accepted because source markers exist. Acceptance evidence is ordered:

1. **Pure/model tests** — deterministic domain behavior and invariants.
2. **Behavioral integration tests** — user action causes the expected state transition/result.
3. **Static integration checks** — imports/mounts/wiring are present; useful but never sufficient alone for an interaction claim.
4. **Build/type/lint/diff safety** — code compiles and repository hygiene is clean.
5. **Physical-device evidence** — required for Fold/mobile layout, touch behavior, PWA/storage behavior, and XR performance/comfort.

## Interaction rule

Any feature described with a verb — open, save, restore, forget, copy, draw, attune, forge, recenter, select — requires at least one behavioral test or physical-device proof of the verb itself.

A hover animation, visible button, source string, or mounted callback does not prove the verb succeeds.

## Semantic rule

Presentation tests may not stand in for semantic tests. ReadingRecord relations, authority layers, source qualification, and archive round trips must be tested at their model boundary.

## Persistence rule

Any feature claiming persistence must prove:

- save;
- reload/restart restoration;
- schema/version handling where applicable;
- fail-soft behavior for non-semantic media;
- no silent loss of canonical ReadingRecord/card identity.

## Visual rule

Visual richness is not a release risk by itself. Visual changes are acceptable when:

- the prior accepted aesthetic remains recoverable when promised;
- controls remain legible/touchable on Fold;
- reduced-motion/performance policies preserve semantics;
- visuals react only to authorized state and do not fabricate doctrine.

## Branch rule

- One active milestone may contain product runtime changes.
- Future milestone planning/docs/tests may be prepared, but runtime activation waits until the parent milestone is frozen.
- No merge to main or deploy from an unaccepted milestone.
- Runtime activation commits should contain only the exact device-tested files whenever practical.

## Stop-the-line conditions

Pause feature expansion when any of the following appears:

- canonical/source authority can become stale or contradictory;
- a persistence path can overwrite or lose a stable ReadingRecord;
- a user-visible action is wired only by static/source tests;
- a release gate fails at its own accepted baseline;
- physical XR performance is being inferred without headset evidence;
- branch lineage/default branch no longer corresponds to the accepted product.
