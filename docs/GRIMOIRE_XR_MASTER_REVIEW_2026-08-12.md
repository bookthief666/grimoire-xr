# Grimoire XR · Master Review and Roadmap

**Review date:** 2026-08-12  
**Current milestone:** Showcase & Continuity 0.8, with 0.8.1 setup hardening in progress  
**Primary immersive target:** Meta Quest 3  
**Primary mobile acceptance target:** Samsung Galaxy Z Fold 6 (`SM-F956U`)  
**Local inference host:** Apple MacBook Air M2 (`Arianas-Air`)

## Executive conclusion

Grimoire XR is no longer merely a visual VR experiment. The current `/vr` route contains a broad transformation of the original 2D Grimoire into a shared flat/spatial instrument: subject ritual, a normalized 78-card architecture, explicit intellectual and image forging, configurable Oracle, persistent Spirit dialogue, statistics, archive/export/restore, a manifested-card gallery, ritual audio, provider diagnostics, an installable PWA shell, and a clearly labeled provider-free Fold demonstration mode.

The architecture is sound for this phase. It keeps the original 2D/Capacitor application intact, lazily loads the Three.js/WebXR route, protects local providers behind one Node boundary, and serializes Qwen and ComfyUI work so the M2 never runs both Metal-heavy providers simultaneously.

The next priority is **Foundation Freeze and Physical Acceptance**, not another broad aesthetic pass. We must preserve the known-good build under real version control, automate its startup and diagnostics, complete a recorded live-AI circuit on the Mac and Fold 6, and perform the first measured Quest 3 acceptance. Only then should 0.9 expand the atrium into embodied planetary chambers.

## Product north star

The intended work is a **Quest-first spatial instrument of memory, divination, image-forging, dialogue, and transformation**, not a decorative tarot menu in a 3D room.

The complete product should:

1. Preserve the original Grimoire's complete creative vocabulary and practical tools.
2. Transform those faculties into seven intelligible planetary courts.
3. Make operations spatial, kinetic, memorable, and comfortable in a headset.
4. Remain useful as a sophisticated Fold 6/desktop console when a headset is unavailable.
5. Support private local Qwen/ComfyUI generation without exposing either raw provider.
6. Make expensive image generation explicit, sequential, resumable, and observable.
7. Treat erotic or transgressive imagery as a **shadow of an idea**—a mnemonic and transformative instrument rather than empty spectacle.
8. Preserve the black, scarlet, brass, bone, scanline, hard-edged pixel language of the 2D application while using spatial scale, light, sound, motion, and ritual interaction meaningfully.

## Current architecture

### Client surfaces

- `src/App.jsx`: original 2D Grimoire and Capacitor-facing application.
- `src/vr/VrApp.jsx`: XR state, provider operations, persistence, archive, and scene/console coordination.
- `src/vr/VrCommandDeck.jsx`: Fold/desktop five-station console.
- `src/vr/AtriumScene.jsx`: R3F/WebXR temple, portals, codex, altar, relic, crown, particles, and constellation reactions.
- `/vr`: lazily loaded Quest-oriented route; the Three.js runtime is not loaded by the original 2D route.

### Local generation boundary

- Ollama: `qwen3:8b`, 8,192-token context, `keep_alive=0`.
- ComfyUI: `juggernautXL_ragnarokBy.safetensors`, 640×960, 18 steps, CFG 4, DPM++ 2M Karras.
- Node API: port 8787, validated asynchronous jobs, origin controls, rate limiting, opaque job IDs, polling, and bounded queue.
- FIFO scheduler: exactly one Metal-intensive text or image job runs at a time; text unload precedes image work.
- Browser/Fold/Quest: one HTTPS tunnel to Vite Preview on 4173; same-origin `/api` and `/health` are proxied to 8787.
- Native Capacitor: requires a stable HTTPS deployment/tunnel of only the protected API on 8787 and a rebuilt `VITE_GRIMOIRE_API_URL`.
- Never expose ports 11434 or 8188.

### Persistence boundary

- Lightweight automatic palace snapshot: restores settings, text, ritual/deck state, operations, and completed courts but strips generated bitmaps.
- Durable JSON archive: image-bearing, validated, restorable `grimoire-xr-archive-v1` format.
- Portable HTML: human-readable image-bearing book; deliberately not an import format.
- PWA service worker: caches only shell/static assets and bypasses provider and health routes.

## Milestone history

### Prototype foundation

- Established `/vr` as a separate lazy WebXR route.
- Built the Atrium of the Unremembered Name and seven planetary court model.
- Connected the scene to the protected local-AI boundary.
- Added desktop orbit/flat fallback before physical headset validation.

### Pixel Temple 0.3

- Replaced the obstructive circular gate layout with a symmetric forward apse.
- Kept all portals beyond the central altar and reduced scene complexity with merged/instanced masonry.
- Applied nearest-neighbor sampling and authored block silhouettes rather than degrading headset resolution.

### Arcane Temple 0.4

- Moved the contextual Genius/court codex to a right-side lectern.
- Cleared the central altar sightline.
- Reduced portal architecture to a small number of instanced calls.

### Electric Babalon 0.5

- Added a ceiling `{7/3}` heptagram, counter-rotating inner star, interference wire, seven electrodes, astral particles, glitch fragments, and altar voltage.
- Connected atmosphere strength to provider activity and court completion.
- Preserved Quest-safe fake glow: no bloom, shadows, heavy physics, or postprocessing.

### Complete Instrument 0.6

- Added the Ritual, Deck · 78, Oracle, Spirit, and Archive console.
- Restored the complete creative catalog and functional parity surface.
- Added explicit two-phase exegesis/image forging and guarded sequential Grand Forge slices.

### Fold Current 0.7

- Added Galaxy Z Fold layouts, touch sizing, haptics, keyboard-aware sizing, and reduced DPR.
- Added provider-free Phone Demo with deterministic text, local SVG relics, the real state/archive circuit, and unambiguous rehearsal labeling.

### Showcase & Continuity 0.8

- Added the five-step Showcase Rite.
- Added the Manifested Reliquary gallery with full-screen swipe/keyboard inspection and Forge handoff.
- Added validated JSON restoration including images for the current session.
- Added installable PWA assets and offline shell behavior.
- Preserved the expensive-generation boundary; showcase and ritual awakening do not silently generate 78 images.

### Setup hardening 0.8.1

- Standardizes browser/PWA/Fold/Quest testing on the single-origin 4173 preview tunnel.
- Distinguishes that route from native Capacitor's protected 8787 API requirement.
- Adds `GRIMOIRE_PREVIEW_ALLOWED_HOSTS` so temporary tunnel hostnames live in `.env.local` rather than committed source.
- Keeps Vite hostname validation enabled.

## Capability parity status

### Implemented and covered by unit/integration tests

- Exactly 78 normalized archetypes: 22 Major and 56 Minor.
- At least 50 art styles, six Eros levels, three knowledge levels, and eleven traditions.
- Subject ritual, dossier, ruling Genius, questions, and mnemonic seal.
- Individual exegesis and explicit image manifestation.
- Per-card patina, prompt copy, reforge/reset, and deck search/navigation.
- Grand Forge: next 3, next 10, armed all-missing, resumable selection, and pause between jobs.
- Triad/Hexagram/Cross deterministic draw and unique manual placement model.
- Spirit history and clearly labeled imaginative simulation.
- Statistics, JSON, escaped HTML, share/save integration, validated restoration, and manifested reliquary.
- Provider-free deterministic demo and local SVG relics.
- PWA manifest/service-worker boundary.
- FIFO provider serialization and submit-once polling.
- Palace state normalization and safe small persistence.
- Forward-apse court layout and bounded headset-readable text.

### Verified in automated review on 2026-08-12

- 37 Vitest tests pass across 11 files.
- The suite covers Ollama, ComfyUI, scheduler ordering, polling, complete deck normalization, manual spread placement, archive security/round-trip, demo labeling, PWA boundary, preview proxy, and mobile reducer regressions.
- Production build remains required after every source/configuration change and is part of `npm run check`.

### Verified live by the user on the Mac/Fold path

- Ollama, ComfyUI, protected API, and preview proxy all return healthy responses.
- Qwen3 8B and the configured Juggernaut XL checkpoint are detected.
- Production `/vr` renders the 0.8 console and Electric Babalon temple.
- Desktop observations reached 60 FPS around 85–94 calls and roughly 11–12K triangles in reported views.
- The malformed URL, stale-project process mismatch, Cloudflare transport failure, and Vite host rejection were diagnosed and resolved.
- The Fold can now reach the HTTPS tunnel.

### Implemented but still requiring explicit physical acceptance

- A complete live Qwen awakening through the current 0.8 console.
- One live exegesis followed by one explicit ComfyUI card manifestation and archive persistence.
- Fold closed-cover, unfolded portrait, and unfolded landscape acceptance matrix.
- Installed-PWA offline Phone Demo after fully closing and reopening the app.
- Native Android Capacitor build on `SM-F956U` after the current sync.
- Quest immersive session, controller ray scale, relic inspection, haptic enhancement, spatial text comfort, and 72 Hz frame timing.
- Full JSON export/change/restore round trip on the Fold with embedded images.
- Long-running next-3/next-10 live Grand Forge recovery behavior.

## Known risks and debts

### P0 — preservation and operational truth

1. **No Git history in the delivered archive.** The inspected project is not currently a Git worktree. A verified release can still be overwritten or mixed with an older extraction. The Mac copy must be initialized or connected to the canonical repository before major work resumes.
2. **Multiple historical copies exist.** Older Downloads, `grimoire-vr-m2`, clean, verified, and patched folders have already caused process/source mismatches. Only one canonical path should remain active.
3. **Physical Quest evidence is absent.** Desktop orbit mode cannot prove controller reach, binocular readability, comfort, scale, or 72 Hz behavior.

### P1 — setup, security, and release

1. Quick Tunnel URLs are temporary and public development endpoints. They are not production deployment or authentication.
2. Manual five-process startup is error-prone. A doctor/start workflow should verify paths, ports, configured model/checkpoint, tunnel host, and canonical project before launching.
3. The native identifier remains `com.grimoire.app`; signing, privacy disclosures, age/content review, store assets, and production backend authentication are unresolved.
4. No browser E2E suite currently proves the whole console circuit; the strongest tests are logic/integration tests plus manual device checks.

### P2 — maintainability and performance

1. `VrApp.jsx`, `AtriumScene.jsx`, `vr.css`, and `App.jsx` are large. Refactor behind behavior tests as new embodiment features arrive; do not perform a speculative rewrite.
2. The WebXR chunk remains large. Route splitting protects the 2D app, but Quest download/parse time and memory must be measured.
3. Large image-bearing JSON archives can be memory-intensive on mobile. Restoration is bounded and sanitized, but maximum practical Fold archive size needs stress testing.
4. Current ritual audio is non-positional and browser speech recognition is best effort.

## Recommended next sequence

### 0.8.1 — Foundation Freeze and Device Acceptance

1. Establish one canonical Git repository and tag the known-good baseline.
2. Add a Mac doctor/start command and a clear status report for all five services.
3. Complete and record the Mac live-AI circuit: awaken, exegesis, one image, Oracle, Spirit, export, restore.
4. Complete the Fold acceptance matrix in closed, unfolded portrait, and unfolded landscape modes.
5. Install the PWA, close it, enable airplane mode, and prove the complete Phone Demo circuit offline.
6. Build and run the native Android shell only after the web/PWA circuit passes.
7. Run the first Quest acceptance exactly as specified in `VR-PROTOTYPE.md`; record refresh rate, calls, triangles, text comfort, ray reach, and atmosphere tier.
8. Fix only device-proven blockers before starting 0.9.

### 0.9 — Embodied Courts

1. Add teleport anchors and comfort turning.
2. Expand each gate into a short authored planetary chamber with a single meaningful action.
3. Add direct controller placement on the Oracle cloth; then investigate hand gestures.
4. Make mnemonic seal construction a deterministic saved gesture ritual.
5. Convert ritual audio into accessible positional court motifs.
6. Give the ruling Genius a restrained companion presence derived from the completed court constellation.

### Later

- Optional encrypted cross-device synchronization built on the validated JSON schema.
- Named authenticated tunnel or deployed backend for non-development use.
- Native OpenXR evaluation in Unity or Godot only after WebXR proves which embodied mechanics justify the cost.

## Claude participation decision

Claude can add value as an **independent adversarial reviewer**, especially for architectural contradiction detection, WebXR performance risks, state/persistence review, and maintainability analysis. It should not edit the same working tree concurrently.

Recommended process:

1. Freeze the canonical source and give Claude the repository plus `docs/CLAUDE_OPUS_REVIEW_BRIEF.md`.
2. Require a read-only review with file/line evidence and explicit severity.
3. Require Claude to write only `docs/CLAUDE_OPUS_REVIEW_RESULT.md` or return the report in chat—no source changes, dependencies, commits, pushes, deployments, or generated assets.
4. Review its findings here, reproduce each claimed issue, and accept or reject it.
5. Assign a bounded code task only after its review identifies a concrete improvement that survives reproduction.

This preserves one canonical implementation lane while still obtaining a genuinely independent second opinion.

## Definition of success for the next checkpoint

0.8.1 is complete when:

- the source is safely versioned;
- `npm run check` passes;
- Mac startup is reproducible without path ambiguity;
- Fold live AI and offline Demo both pass their recorded matrices;
- one Android native run succeeds;
- one Quest immersive run produces measured evidence;
- every P0/P1 failure found in those checks is either fixed or recorded with an owner and next action;
- no raw local provider is exposed to the network.

