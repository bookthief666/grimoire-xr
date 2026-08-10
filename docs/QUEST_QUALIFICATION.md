# Quest / WebXR Qualification Gate

This document is the release gate for promoting the temple-foundation architecture toward `main`.

## Performance target

The baseline standalone-XR target is **72 Hz** (about **13.9 ms per frame**). A 90 Hz profile is a stretch target, not the minimum merge requirement. Runtime helper constants live in `src/scene/performance.ts`.

Judge performance over sustained samples, not one loading or morph-transition spike.

## Required device pass

Run on the primary Quest-class standalone headset in immersive WebXR.

### Entry and rendering

- HTTPS entry succeeds without remote font/CDN dependency.
- All temple text renders, including Hebrew and planetary glyphs used by the current chambers.
- No black-canvas or WebGL context-loss event during a ten-minute session.
- Enter/exit immersive VR at least three times without stale controller state.

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

### Chapel

- Tree renders ten Sephiroth and 22 geometric links.
- same question produces the same chapter draw.
- triad never repeats a chapter within one draw.
- displayed Sephira title includes `WORKING MAP` until sourced historical attributions replace the experimental map.

## Performance capture

For each chamber, record at least five seconds of stable interaction after initial shader/font warm-up.

Block promotion when:

- sustained average exceeds the 72 Hz budget;
- frame pacing visibly judders during ordinary head motion;
- controller interaction introduces repeated stalls;
- morphing leaks objects/materials across repeated chamber changes;
- memory growth is obvious over repeated Sanctum ↔ chamber cycles.

## Merge evidence

Attach or record:

- commit SHA tested;
- headset/browser version;
- average and worst observed frame time or equivalent FPS capture;
- pass/fail for each chamber;
- screenshots or short recordings of any visual defect;
- explicit confirmation that card selection no longer auto-generates art.
