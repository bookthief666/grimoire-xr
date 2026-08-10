# Grimoire XR — Current Engineering Status

This document is the canonical technical status for active development. The `CLAUDE_*` documents in this directory remain useful historical records of the Claude foundation as it existed before the subsequent foundation-hardening and React/XR-hardening work; where they conflict with this file or the current code/CI, this file and the live repository state take precedence.

## Active stack

```text
main
  └─ claude/temple-foundation-hub
       └─ agent/react-xr-hardening-v2
            └─ agent/neon-rotunda-stations
                 └─ codex/electric-rotunda-instruments   ← draft PR #27
                      └─ agent/xr-truthful-measurement-and-bay-instancing   ← draft PR #28
                           └─ codex/quad-draw-consolidation
```

`main` has not been used as the direct development target for this hardening work.

The current optimization branch is stacked from exact PR #28 head
`07b6303f320f8ff345bc4b57c22a61f48d3e6a1b`. No work in this stack targets or
modifies `main` directly.

The older `claude/temple-visual-uplift-Y2JMb` branch is historical ancestry. It is not the active integration target and should not be force-renamed, rebased over, or used to replace the tested foundation.

## What is now resolved

### Explicit card-art generation

Selecting/manifesting a forged card no longer starts the image backend. Card art is a separate explicit action with generating, retry, ready, and unavailable states. This is a product invariant and is regression-tested.

### Source integrity

The source-provenance contract distinguishes primary source, translation, scholarly commentary, operative reconstruction, and experimental correspondence.

- **Cell:** application breath timing / spatial correspondence is labeled as operative reconstruction where it is not source-critical transcription.
- **Monad:** the six-stage point → line → circle → sun → moon → cross experience is explicitly an operative reconstruction. It is not represented as Dee's six historical theorems or as a complete substitute for the 24-theorem *Monas Hieroglyphica*.
- **Chapel:** deterministic chapter hashing and chapter→Sephira assignment are explicitly experimental Grimoire XR correspondences, not historical Crowley attributions. The Tree uses ten Sephiroth and 22 geometric links without inventing path-letter/Tarot attributions.

See `SOURCE_PROVENANCE.md`.

### Forge configuration

Tradition is restored as a first-class Forge control and readout. All seven configured magical currents remain available alongside Tarot System, Tone, Level, style controls, Eros controls, and Intent.

### React/XR purity and deterministic decoration

Persistent star and ember fields are deterministic. React render paths no longer use `Math.random()` for these scene distributions, so remounting a chamber cannot spatially reshuffle them around the XR origin.

Manifested-card state stores identity + transform rather than copying a stale card object. The displayed card is derived from the authoritative deck, so image/status changes propagate without synchronization effects.

Archive hydration is lazy initial state rather than a mount-time cascade of setters. Tablet and legacy-oracle pagination use content-scoped state rather than effect-driven resets.

### Shared XR pointer lifecycle

The shared `pressable()` interaction contract now treats pointer capture as best-effort cleanup rather than a failure point:

- stale or already-released capture adapters cannot abort an otherwise valid activation;
- pointer-up attempts capture cleanup before activation;
- pointer-cancel releases capture;
- a control that becomes disabled between pointer-down and pointer-up still releases capture without activating;
- helper behavior is regression-tested.

The bespoke drag implementations used by workbench cards and the optional draggable reading panels remain separate because drag semantics are more complex than a press. Their real controller-ray cancellation/drift behavior is a target-headset qualification item rather than an unverified rewrite.

### Explicit XR development modes

Normal development no longer ambiguously falls into `@react-three/xr`'s localhost emulator behavior when native WebXR is absent.

- normal URL: flat/native behavior;
- `?emulate=1`: explicitly enables the Meta Quest 3 IWER emulator for desktop XR-path testing;
- real Quest qualification: native WebXR, **without** `emulate=1`.

The emulator remains a development aid, not release evidence. See `XR_DEVELOPMENT_MODES.md`.

### Known chamber layout collisions

- Monad lectern content and controls now occupy separate structural zones.
- Chapel Tree topology is kept rigid while the Tree and oracle desk occupy separate sightline zones; individual Sephiroth were not distorted to hide the collision.

These fixes still require visual confirmation at the target headset scale before promotion.

### Lint

The inherited Claude foundation baseline of 30 lint problems has been retired. Lint is now clean and is a blocking GitHub Actions job.

### Dependency security

The declared dependency ranges were not changed. A guarded lockfile-only refresh updated vulnerable transitive packages inside their compatible ranges. The retained lockfile currently passes both:

```bash
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

with zero reported vulnerabilities in CI. Both audits are now blocking qualification gates.

The temporary write-capable workflow used to perform the one-time lockfile refresh was deleted immediately after the guarded update. No write-capable one-shot maintenance workflow remains in the retained branch state.

## Automated qualification

The authoritative CI workflow is `.github/workflows/ci.yml` on Node 22.

Blocking jobs:

1. **Test + production build** — deterministic Node tests plus TypeScript/Vite production build.
2. **Lint** — full ESLint run; no tolerated legacy baseline.
3. **Dependency audit** — production and full npm audit gates.

GitHub workflow actions use `actions/checkout@v6` and `actions/setup-node@v6`.

Current deterministic coverage includes:

- Abulafia permutation/breath contracts;
- Monad operative-stage contract;
- Liber 333 deterministic draw / Tree-link contract;
- explicit Forge/image policy;
- Quest frame-budget helpers;
- deterministic star/ember fields;
- performance-probe activation/report contract;
- shared XR pointer-capture lifecycle and cancellation behavior.

## Performance evidence

Claude's last pre-hardening browser instrumentation measured **786 draw calls/frame** after the colonnade merge. That number is retained as historical evidence, not treated as a Quest framerate result.

Grimoire XR now includes a dependency-free runtime probe for new measurements. Append:

```text
?perf=1
```

to the URL. The probe remains dormant during normal use, resets around chamber morphs, captures stable five-second windows, and publishes the latest report to:

```js
window.__GRIMOIRE_XR_PERF__
```

It also logs `[GRIMOIRE PERF]` with chamber ID, XR mode, average/worst frame time, budget classification, and average/worst direct WebGL draw calls.

For desktop XR-path testing, `?emulate=1&perf=1` may be used. Real Quest qualification must use `?perf=1` without the emulator flag.

The production build still emits large lazy XR/emulation/room chunks from the current `@react-three/xr` dependency. That warning has not been hidden by raising Vite's chunk threshold. Do not change bundling or XR dependencies solely to silence the warning; measure initial-load and headset impact first.

The first Electric Rotunda flat-browser smoke recorded 427 direct draws for
idle Sanctum and 288 for Cell. Later probe-v2 measurement at exact PR #28 head,
matched at 877 × 834, recorded 369 Sanctum, 214 Cell, 178 Monad at its point
phase, 329 Monad completed, and 245 Chapel draws per mono view. Consolidating
the measured workbench and Monad segment clusters reduced Sanctum to 267 and
completed Monad to 187; unchanged chamber states retained their matched counts.
These are local comparison points only. See `DRAW_CALL_CONSOLIDATION.md` for
method and deltas. Fold and Quest captures remain separate requirements.

See `QUEST_QUALIFICATION.md` for the required capture sequence.

## Current retained parent evidence

The qualified visual parent is `agent/neon-rotunda-stations` at `6898c1fdb638a0e788e745ba73a8a19cbef7617a` (draft PR #25). The published Electric Rotunda slice is stacked from that exact commit. GitHub Actions run #95 passed test/build, lint, and both dependency-audit jobs for its initial visual commit. The corresponding Vercel preview reached Ready/DEPLOYED. Local verification also passed:

- Test + production build;
- blocking lint;
- blocking production dependency audit;
- blocking full dependency audit;
- flat visual/chamber-switch smoke.

Vercel Ready establishes that the preview deployed; it does not establish WebXR correctness, real backend image generation, or target-device performance. Fold re-capture, real backend image-generation smoke, and Quest immersive qualification are still external/device gates.

## What is still genuinely unverified

No repository-side automated evidence can replace the following target-device checks:

- entering a real `immersive-vr` Quest session;
- morph comfort and fixed-origin / eye-height stability on hardware; the current architecture deliberately has no locomotion;
- controller-ray pointer capture and small-ray-drift behavior;
- bespoke card/panel drag capture and cancellation behavior;
- readable scale and sightlines through headset optics;
- Monad lectern and Chapel lower-Tree layout at real headset scale;
- sustained standalone Quest performance for every chamber;
- repeated chamber cycles for memory/resource growth;
- the canonical ten-minute no-context-loss check and extended 30-minute thermal/resource soak;
- enter/exit XR lifecycle stability;
- explicit card-art generation and retry UX with the real network/backend path.

These remain promotion blockers. Do not relabel flat-browser, Fold, Vercel, emulator, headless Chromium, or CI evidence as real-headset verification.

## Next engineering order

1. Keep automated gates green while the active hardening PR remains draft.
2. Run flat-browser/Fold visual smoke on the current preview, especially Monad and Chapel.
3. Use `?perf=1` to capture reproducible flat baseline reports for all chambers.
4. Optionally use `?emulate=1&perf=1` as an intermediate desktop XR-path smoke test, while keeping its evidence tier separate.
5. Run the first real Quest immersive qualification using `QUEST_QUALIFICATION.md`.
6. Optimize only from measured bottlenecks; do not reduce visual fidelity speculatively just to chase the old 748-draw proxy target.
7. Promote the hardened foundation only after the real-device blockers have evidence.

## Rules for future agents

- Do not merge directly to `main` merely because desktop CI is green.
- Do not reintroduce automatic image generation on card selection.
- Do not collapse source-critical content and AI/project interpretation into one undifferentiated text layer.
- Do not weaken the 72 Hz performance contract to make a test pass.
- Do not use `npm audit fix --force` as routine maintenance.
- Do not treat desktop XR emulation as real-headset evidence.
- Do not treat the historical `CLAUDE_*` handoff snapshot as newer than live code, CI, and this status document.
