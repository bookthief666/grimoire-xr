# Quest / WebXR Qualification Gate

This document is the release gate for promoting the temple-foundation architecture toward `main`.

## Performance target

The baseline standalone-XR target is **72 Hz** (about **13.9 ms per frame**). A 90 Hz profile is a stretch target, not the minimum merge requirement. Runtime helper constants live in `src/scene/performance.ts`.

Judge performance over sustained samples, not one loading or morph-transition spike.

## Reproducible performance probe

Append `?perf=1` to the Grimoire XR URL before entering the chamber or immersive VR session.

The probe is intentionally dormant without that exact query parameter. When enabled it:

- counts actual WebGL draw entry points without adding a Playwright/runtime dependency;
- resets its sample whenever the active chamber changes or a chamber morph is in progress;
- waits for one complete rendered frame after a reset before collecting data;
- samples stable windows for five seconds;
- publishes the latest report to `window.__GRIMOIRE_XR_PERF__`;
- writes the same report to the browser console as `[GRIMOIRE PERF]`.

Each report records:

- chamber ID;
- XR/flat mode;
- timestamp;
- sample count;
- average and worst frame time;
- 72 Hz budget classification;
- average and worst draw calls;
- whether direct WebGL draw-call instrumentation was supported by the browser.

Do not compare a morph-transition report with a stable chamber report. The probe deliberately discards transition frames so the four chamber baselines remain comparable.

The app currently uses Three r184. The probe instruments WebGL draw calls directly instead of treating `renderer.info` as authoritative, which keeps the captured draw-call metric independent of renderer-level statistics behavior.

## Required device pass

Run on the primary Quest-class standalone headset in immersive WebXR.

### Entry and rendering

- HTTPS entry succeeds without remote font/CDN dependency.
- All temple text renders, including Hebrew and planetary glyphs used by the current chambers.
- No black-canvas or WebGL context-loss event during a ten-minute session.
- Enter/exit immersive VR at least three times without stale controller state.

### Fixed-origin comfort

The current chamber contract has no teleport or smooth locomotion. Qualification
therefore evaluates the comfort of room morphs around a stationary practitioner,
not locomotion comfort:

- the shared floor, altar, colonnade, and eye-height relationship remain fixed through every chamber morph;
- ordinary head turns do not reveal scale jumps or unstable world motion;
- chamber materialization does not create a vection-inducing camera move;
- controller reach remains comfortable from the fixed origin.

### Summoning ring / chamber morph

For Sanctum → Cell → Monad → Chapel → Sanctum:

- chamber seal receives controller ray reliably;
- pointer-down/up capture survives small controller-ray drift;
- one chamber transition occurs per activation;
- controls are disabled during the morph;
- no two chamber instruments remain interactable at once;
- shared rotunda remains spatially stable;
- no obvious z-fighting appears at the shared floor.

### Sanctum regression pass

- Tradition is visible and can cycle through every configured magical current.
- Tarot System, Tone, Level, Style Family, Art Style, Eros Level, and Intent still cycle.
- Forge produces a valid deck with the selected Tradition preserved in the request path.
- Selecting a card manifests/selects it but **does not** start image generation.
- `GENERATE ART` starts exactly one image operation for that card.
- `GENERATING…` prevents duplicate requests.
- error state exposes `RETRY ART`.
- completed art displays on the workbench and manifested card.
- spread dragging remains usable after image generation.
- oracle and archive controls still operate.

### Cell

- YHVH sequence contains 24 positional permutations.
- breathing animation and displayed phase remain synchronized.
- illuminated axis matches the displayed vowel-axis instruction.
- HOLD/RESUME and manual STEP behave without runaway React updates.
- chamber remains readable while turning the head toward all five axes.

### Monad

- source slot explicitly states that the six-stage model is an operative reconstruction and not a Dee quotation.
- advancing stages builds rather than replaces the glyph.
- no source-language text is represented as Dee unless verified in the source corpus.
- lectern commentary remains clear of RESET/ADVANCE controls at normal head position.

### Chapel

- Tree renders ten Sephiroth and 22 geometric links.
- same question produces the same chapter draw.
- triad never repeats a chapter within one draw.
- displayed Sephira title includes `WORKING MAP` until sourced historical attributions replace the experimental map.
- Yesod/Malkuth and the lower Tree remain visually clear of the oracle desk from the fixed XR origin.

## Performance capture

For each chamber, record at least one complete five-second `?perf=1` stable report after initial shader/font warm-up. Prefer multiple consecutive windows so a single unusually quiet/busy window cannot determine the result.

Capture in this order for comparability:

1. Sanctum idle, no panels open.
2. Sanctum with a forged deck visible.
3. Cell active and breathing animation running.
4. Monad at the completed six-stage glyph.
5. Chapel with a triad drawn and the Tree illuminated.
6. Repeat Sanctum after the full chamber cycle to expose resource leaks or accumulated cost.

Block promotion when:

- sustained average exceeds the 72 Hz budget;
- frame pacing visibly judders during ordinary head motion;
- controller interaction introduces repeated stalls;
- morphing leaks objects/materials across repeated chamber changes;
- memory growth is obvious over repeated Sanctum ↔ chamber cycles;
- direct draw-call instrumentation is unsupported and no equivalent profiler evidence is captured.

## Stereo is the difference between a number and a prediction

**Every performance figure recorded for this project before probe report v2 was
captured at one view, and none of them said so.** All Fold 6 evidence came from
a flat phone browser; the headless and desktop captures were equally mono. That
makes them real measurements of the wrong thing for a 72 Hz XR contract.

In an immersive session the renderer submits geometry once per eye unless a
multiview path is genuinely active. A chamber measured at 427 draws flat should
be expected near 854 submitted draws in stereo — worse than the 827-draw Sanctum
that already measured 17.17 ms / 58.2 fps and failed the 13.9 ms budget. No flat
capture, on any device, can settle this.

The v2 report therefore records, per five-second window:

- `viewCount` — taken from Three's XR `ArrayCamera.cameras.length`, the
  renderer's own answer, not an assumption about the headset;
- `stereo` / `presenting` — whether this capture is comparable to a flat one;
- `averageDrawCallsPerView` / `worstDrawCallsPerView` — total ÷ views;
- `drawBudgetState` — per-view classification against `QUEST_DRAW_BUDGET`;
- `multiviewExtension` — the advertised extension name, or `null`.

Read `multiviewExtension` as a capability claim, not a behaviour. An extension
being advertised does not mean Three used it. The empirical check is whether
draws scale with `viewCount`: if per-view draws hold roughly steady between a
flat and a stereo capture of the same chamber, the second eye is costing a full
submission. If per-view draws roughly halve in stereo, multiview is genuinely
active. **Record both captures for at least one chamber so this can be decided
rather than assumed.**

Do not compare a v1 figure against a v2 figure without first confirming both
were mono. Do not carry any pre-v2 number into a 72 Hz argument.

## Stability and soak capture

The canonical functional gate remains a minimum ten-minute session with no
black canvas or WebGL context loss. For this visual slice, extend the same run to
at least 30 minutes as a thermal/resource soak. Repeatedly cycle Sanctum → Cell →
Monad → Chapel → Sanctum and watch for rising frame time, draw count, memory,
heat-related throttling, stale controller state, or degraded interaction. Record
the ten-minute context-loss result and the completed 30-minute soak separately.

## Merge evidence

Attach or record:

- commit SHA tested;
- headset and browser versions;
- each `window.__GRIMOIRE_XR_PERF__` report or equivalent captured metrics;
- pass/fail for each chamber;
- screenshots or short recordings of any visual defect;
- explicit confirmation that card selection no longer auto-generates art;
- explicit confirmation that Monad controls and Chapel lower-Tree geometry do not collide at headset scale.
- pass/fail evidence for the ten-minute context-loss gate and 30-minute thermal/resource soak.
