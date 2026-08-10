# Quest / WebXR Verification Status — Grimoire XR

Generated 2026-08-10. This document exists to answer one question honestly: **has this actually been tested on a headset?** The answer, stated up front, is **no**. Every claim below is tagged with exactly how it was checked, and the tag is load-bearing — do not upgrade any item's confidence without doing the verification it's missing.

## Verification tiers used below

- **VERIFIED ON REAL HEADSET** — put on a Quest, entered immersive-vr, observed directly. Nothing in this project has reached this tier.
- **VERIFIED ONLY IN DESKTOP-FLAT-BROWSER** — a phone (Samsung Fold 6) or desktop browser, `Canvas` in its default non-XR mode, screen-tapped/mouse-driven. Real rendering, real interaction, but not the `XRSession` code path and not a headset's optics, comfort, or performance ceiling.
- **VERIFIED ONLY BY AUTOMATED TEST** — headless Chromium (Playwright) with SwiftShader software rendering, synthetic mouse events, no `XRSession` either. Good for draw-call counts, page errors, and geometry regressions; useless for comfort, framerate on real GPU hardware, or controller-ray interaction.
- **NOT YET VERIFIED** — asserted from reading the code, never run.

## Session-wide fact

No immersive `XRSession` has been entered at any point in this project's recorded history, in this session or earlier. The "Enter VR" button is visible and, per code inspection, calls `@react-three/xr`'s `xrStore.enterVR()`, but no tool available in this environment can put on a headset. Every "confirmed working in VR" statement anywhere in this repo's commit messages or documentation should be read as "confirmed working in the flat-mode `Canvas`, which shares the same React tree and geometry as the XR path, but is not the same runtime path."

## Core spatial architecture — NOT YET VERIFIED on hardware, reasoned from code

- **No `XROrigin`.** `App.tsx` calls `createXRStore()` with no origin/offset configuration, and `<XR store={xrStore}>` wraps the scene directly. The practical consequence (documented in `src/scene/zones.ts`) is that the immersive-VR reference space's `[0,0,0]` maps directly onto the scene's `[0,0,0]`, so the user's head in a headset lands at approximately `[0, 1.6, 0]` — distinct from the flat-mode survey camera at `[0, 1.6, 3]` (`App.tsx`'s `<Canvas camera={{position: [0, 1.6, 3], ...}}>`). This is architecturally load-bearing: `zones.ts` explicitly measures every interaction distance from `USER_EYE_VR`, not the flat camera, specifically because a layout that reads correctly in flat mode was previously found to be wrong in the VR frame. This 1.6m eye-height / origin-at-scene-centre assumption has never been checked against a real Quest's tracked height or boundary system — it assumes a specific default standing height and no room-scale offset.
- **No locomotion of any kind.** No teleport, no smooth-locomotion, no `XROrigin` translation. This is a deliberate, load-bearing design constraint, not an oversight — it's the stated justification for "summon, don't walk" (chamber morphing replaces walking to a different room) and "stand at centre, turn head" (the rotunda's bay layout). If a future engineer adds locomotion, every distance in `zones.ts` and every chamber layout needs re-deriving, since they all assume a fixed head position.
- **Controller-ray interaction.** The pointer-capture pattern in `src/scene/pressable.ts` (`onPointerDown` → `setPointerCapture`, `onPointerUp` → `releasePointerCapture` → fire callback) exists specifically because bare `onClick` was found unreliable against XR controller rays in `@react-three/xr` — this fix (commit `b4dbe81`, "fix: repair XR interaction defects in the workbench UI") was itself validated only in flat-mode mouse testing plus headless Playwright mouse-event simulation, both of which exercise `onPointerDown`/`onPointerUp`/`onPointerMove` but **not the actual XR ray input path**. Whether the fix holds against a real Quest controller ray, hand tracking, or gaze+pinch input is NOT YET VERIFIED.
- **Comfort.** No vignetting, no snap-turn, no seated/standing calibration prompt, no boundary-awareness handling beyond what `@react-three/xr` provides by default. None of this has been evaluated, because none of it can be evaluated without a headset.

## What *was* verified, and how

### VERIFIED ONLY IN DESKTOP-FLAT-BROWSER (phone, Samsung Fold 6)

- The Four Chambers load and the summoning-ring seals switch between them.
- The Ritual Workbench: CONFIG panel, IGNITE FORGE, card spread, dragging cards, ORACLE panel with pagination, CLEAR/RESET.
- The Neon Rotunda floor and (as of the colonnade merge, screenshot-only — see below) the enclosed colonnade/dome.
- General visual read of the aesthetic — this is what produced the user's explicit feedback ("this is what I see when I test the space with my samsung fold 6...") that drove the aesthetic-reset and Neon Rotunda work.
- Termux/local-network dev-server reachability from the phone (this took real troubleshooting: port conflicts, `vercel dev` prompts, autocorrect-mangled flags in terminal commands).

This tier is real signal — a live device, a live GPU, real touch/tap input — but it is explicitly **not** the XR runtime path, since Fold 6 testing was done by opening the page in a mobile browser and interacting with the flat `Canvas`, not by entering an XR session (a phone is not a 6DOF headset and cannot run `immersive-vr`).

### VERIFIED ONLY BY AUTOMATED TEST (headless Playwright, this session)

- **Draw-call counts**, via a custom histogram tool (`pw-test/histogram.js`) that patches `WebGLRenderingContext.prototype.drawElements/drawArrays/drawElementsInstanced` to count real GPU draw calls in one sampled frame. This is the only quantitative performance signal that exists for this project — there is no framerate measurement on real hardware anywhere in the record. Progression across the session: 1009 → 774 (star field + deck constellation instanced) → 748 (glyph "petal ring" instanced) → 762 (+ rotunda floor) → 906 (+ colonnade/dome, an acknowledged overshoot) → **786** (current, after the colonnade instancing/merge commit `9a93985`). 786 is still above the self-imposed "at or below 748" target restated in the working plan; this is stated plainly rather than rounded down.
- **Screenshot comparison across all four chambers** (`pw-test/chambers.js`), most recently re-run after the colonnade merge: no page errors, colonnade/dome/floor render as expected in all four chamber states (Sanctum, Cell, Monad, Chapel).
- **Font/glyph coverage** — parsed the bundled `DejaVuSans.ttf` cmap table directly to confirm 35 of 38 needed glyphs are present; this is a static-analysis check, not a rendered check, though the rendered screenshots corroborate it (no tofu/missing-glyph boxes visible).
- **CDN-dependency detection** — the `troika-three-text` CDN fetch failure that was producing a 0%-lit-pixel canvas was diagnosed by logging outbound network requests inside headless Chromium and cross-referencing with a pixel readback of the rendered canvas, confirming total render failure before the fix and normal rendering after.

Headless Chromium here runs with `--use-gl=swiftshader --ignore-gpu-blocklist --enable-webgl --no-sandbox` — software rasterization. It proves the WebGL call sequence and geometry are correct; it says nothing about real-GPU framerate, thermal throttling, or standalone-Quest performance headroom.

### NOT YET VERIFIED

- Real Quest framerate (72/90/120Hz target) for any chamber or transition.
- Whether 786 draw calls (current) or the eventual lower number is actually acceptable on standalone Quest hardware — the ~100–200 target is a rule of thumb applied to a "should render once per eye" mental model, not a number derived from profiling an actual Quest.
- Hand tracking, if the user's device supports it and expects it to work — the app has only ever been driven by controller-ray-shaped pointer events in testing.
- Passthrough/mixed-reality behavior — this app targets fully immersive `immersive-vr`, and passthrough has not been discussed or tested.
- Audio (spatial or otherwise) — not mentioned anywhere in the session's work; if the app has audio, it is unverified in XR context.
- Session lifecycle edge cases: entering VR mid-oracle-request, backgrounding the headset, losing tracking, the "Enter VR" button's behavior on a device with no WebXR support at all.

## Recommendation for the next verification pass

In priority order, since none of this has ever touched a headset:

1. **Enter an actual `immersive-vr` session on a Quest** and confirm the eye-height/origin assumption in `zones.ts` holds — this is the single assumption everything else in the spatial layout depends on.
2. Confirm controller-ray pointer capture actually fires reliably against `pressable.ts` targets — the summoning ring, workbench cards, and forge controls.
3. Get any framerate reading at all on real hardware, even a rough one, to know whether 786 draw calls is fine or still a problem — right now the budget is a guess extrapolated from general Quest-development folklore, not a measurement.
4. Only after 1–3: worry about comfort polish (vignetting, snap-turn, etc.), which has not been discussed by the user and is not implemented.
