# Claude Opus Review Brief · Grimoire XR

Copy the prompt below into a fresh Claude Opus session after giving it access to the complete canonical repository. Do not give it only screenshots or selected source files.

---

Act as an independent principal engineer, WebXR specialist, mobile/PWA architect, QA lead, security reviewer, and technical historian for **Grimoire XR**.

This is a **read-only adversarial review**. Do not modify source code, install dependencies, generate assets, commit, push, merge, deploy, open pull requests, or rewrite documentation except for one permitted deliverable: `docs/CLAUDE_OPUS_REVIEW_RESULT.md`. If you cannot create that file, return its complete contents in your response.

## Product objective

Grimoire XR must transform the complete original 2D Tarot/Grimoire into a Quest-first spatial instrument of memory, divination, image-forging, dialogue, and transformation while remaining highly usable on desktop and Samsung Galaxy Z Fold 6.

It is not enough for the application to display tarot-themed panels inside a 3D room. The seven planetary courts must become meaningful embodied operations. The black/scarlet/brass/bone, scanline, hard-edged pixel aesthetic must remain legible and performant in a headset. Erotic or transgressive material must function as a mnemonic “shadow of an idea,” not as empty decorative spectacle.

## Hard constraints

- Meta Quest 3 is the true immersive target.
- Galaxy Z Fold 6 is the primary touch/mobile acceptance device.
- The original 2D React/Capacitor application must remain functional.
- The VR route must stay lazy-separated so the original route does not load Three.js.
- Local text uses Ollama `qwen3:8b`; local images use ComfyUI with `juggernautXL_ragnarokBy.safetensors`.
- Qwen and ComfyUI share an Apple M2 and must never perform Metal-heavy inference concurrently.
- Expensive image generation must remain explicit. Never silently generate 78 images.
- Grand Forge must remain sequential, resumable, and pausable only between jobs.
- Never expose raw Ollama port 11434 or ComfyUI port 8188.
- Browser/PWA/Fold/Quest testing uses one HTTPS origin at the production preview on port 4173, whose `/api` and `/health` proxy to the protected Node API on 8787.
- Native Capacitor builds require a stable HTTPS Node API address and must not rely on Vite's preview proxy.
- Quest performance contract: target 72 Hz, no postprocessing/bloom, no real-time shadows, no heavy physics, no oversized imported environment model.
- Generated bitmaps must stay out of lightweight automatic localStorage snapshots.
- Portable JSON may carry safe embedded images; HTML export is never executable/importable.
- Provider-free Phone Demo must remain explicit and must never pretend to be AI output.
- Do not recommend a full Unity/Godot rewrite before physical WebXR evidence justifies it.

## Required reading

Read the complete repository, then at minimum:

- `docs/GRIMOIRE_XR_MASTER_REVIEW_2026-08-12.md`
- `README.md`
- `VR-PROTOTYPE.md`
- `VR-CAPABILITY-PARITY.md`
- `COMPLETE-INSTRUMENT-GUIDE.md`
- `SHOWCASE-CONTINUITY-0.8.md`
- `FOLD-6-TEST-GUIDE.md`
- `LOCAL-AI-SETUP.md`
- `MOBILE-SETUP.md`
- `VERIFICATION.md`
- `vite.config.js`
- `src/App.jsx`
- every file under `src/vr/`
- every file under `server/`
- `capacitor.config.ts`
- PWA manifest and service worker
- all tests

Do not trust the documentation's “Working” labels until you trace each feature to real state, handlers, provider calls, persistence, rendering, and tests.

## Required verification

1. Inspect repository status and recent history. State clearly if this is not a Git working tree.
2. Run the existing test and production build commands without modifying dependencies.
3. Map every claimed original-app faculty to actual implementation and evidence.
4. Distinguish:
   - implemented and automated-tested;
   - implemented but manual/device-only;
   - UI scaffold without complete behavior;
   - planned/unimplemented;
   - documentation claim contradicted by source.
5. Inspect the complete local-AI request lifecycle for duplicate submissions, lost polling, TTL behavior, provider overlap, unsafe exposure, origin confusion, and queue starvation.
6. Inspect archive import/export for XSS, unsafe URLs, memory exhaustion, schema confusion, and silent data loss.
7. Inspect PWA caching for stale API responses, offline ambiguity, installability, and service-worker update problems.
8. Inspect Fold layouts, safe areas, keyboard behavior, touch hitboxes, DPR, haptics, and orientation transitions.
9. Inspect Quest/WebXR scene lifecycle, pointer/controller handling, texture disposal, audio lifecycle, draw-call strategy, transparent overdraw, text readability, and performance instrumentation.
10. Inspect whether the scene's seven courts are genuinely operational or still primarily decorative navigation.
11. Identify maintainability risks in the large React/scene/CSS files, but do not propose a rewrite without a behavior-preserving incremental boundary.
12. Challenge the proposed 0.8.1 → 0.9 sequence and state any evidence-based change in priority.

## Output format

Write `docs/CLAUDE_OPUS_REVIEW_RESULT.md` with these sections:

1. **Executive verdict** — no more than 400 words.
2. **Verified architecture** — concise actual data/control flow.
3. **Capability parity matrix** — every original faculty and its real status.
4. **Findings** — ordered P0/P1/P2/P3. Every finding must include:
   - severity;
   - concise title;
   - exact file and line evidence;
   - reproduction or reasoning;
   - user impact;
   - smallest safe remediation;
   - missing test to add.
5. **Claims not reproduced** — do not present speculation as fact.
6. **Quest physical test script** — exact measurable acceptance steps.
7. **Fold 6 acceptance script** — closed, unfolded portrait, unfolded landscape, PWA offline, and live AI.
8. **Recommended next milestone** — bounded scope and definition of done.
9. **What Claude should build, if anything** — at most three tightly bounded tasks that would benefit from a separate implementation pass.
10. **Questions requiring the owner's decision** — only questions that cannot be answered from code or documentation.

## Review discipline

- Prefer concrete defects over stylistic preferences.
- Cite exact files and lines.
- Do not inflate severity.
- Do not call missing physical-device evidence a source-code bug.
- Do not recommend adding providers, cloud databases, multiplayer, accounts, analytics, monetization, or visual effects unless required to fix a demonstrated blocker.
- Treat automated tests as evidence of the tested contract, not proof of physical Quest/Fold behavior.
- If the master review is wrong, say so and prove it.
- If a claim cannot be verified, label it **UNVERIFIED**, not broken.

End with a compact recommendation: **Proceed with 0.8.1**, **Revise 0.8.1**, or **Block 0.8.1**, and state the exact reason.

---

