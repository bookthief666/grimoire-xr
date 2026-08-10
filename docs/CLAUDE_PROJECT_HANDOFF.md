# Grimoire XR — Project Handoff

Generated 2026-08-10 by Claude, acting across this session as engineer, technical historian, and archivist for this project. This is the master document. Companion documents, each focused on one concern:

- `CLAUDE_BRANCH_INVENTORY.md` — full branch/commit/reflog state, and a discrepancy that needs a human decision.
- `CLAUDE_TECHNICAL_DEBT.md` — every known bug, ranked by severity, including one confirmed live bug found while writing this handoff.
- `CLAUDE_QUEST_XR_STATUS.md` — exactly what has and has not been verified on real WebXR hardware (short answer: nothing has touched a real headset yet).
- `CLAUDE_DECISION_HISTORY.md` — why things are built the way they are, including ideas that were raised and rejected.

Read this document first. It is written for a successor engineer — human or AI — who has never seen this codebase or this conversation.

## What this project is

Grimoire XR is a WebXR occult tarot/grimoire application: React 19 + TypeScript + Vite + `@react-three/fiber`/`drei`/`xr` + `three`. The product concept has two layers:

1. **The Sanctum** — a generative, deck-forging, tarot-reading experience bound to a live "grimoire engine" (`src/engine/useGrimoireEngine.ts`) that talks to a Gemini-backed oracle and an image-generation backend (ComfyUI, with an AI Horde fallback). This is the original, pre-existing core of the app.
2. **Three authored, deterministic chambers** — The Cell (Abulafia-style Name permutation), The Monad (Dee's *Monas Hieroglyphica* construction), and The Chapel of Lies (Liber 333/gematria chapter-drawing) — each a self-contained, offline, pure-logic tool translated from three sibling repositories (`monas-hieroglyphica`, `liber-333-grimoire`, `abulafia.exe`) into full VR rooms, per explicit user direction to give the app "creative control" and make each tool "transform... the whole vr space."

All four "chambers" (Sanctum plus the three authored ones) live inside one shared architectural shell — the **Neon Rotunda** — and switching between them **morphs** the room rather than teleporting the user or swapping scenes outright, because the app has no locomotion of any kind.

## Architecture overview

### Top-level render tree

`App.tsx` owns `useGrimoireEngine()` (the Sanctum's state/data layer) and renders a single `<Canvas>` wrapping `<XR store={xrStore}>`. `RitualChamberScene.tsx` is the scene root: it mounts the shared rotunda shell (`RotundaFloor`, `RotundaColonnade`, `RotundaDome`, all outside any per-chamber grouping so they persist across chamber switches) plus `ChamberDirector`, which drives which chamber's `Architecture`/`Instrument` pair is currently active.

### The morph model

`src/scene/chambers/registry.ts` is the single source of truth for the four chambers — `id`, `name`, `purpose`, `seal`, `accent`, and (for the three authored chambers) `Architecture`/`Instrument` component references. `ChamberDirector.tsx` holds one `morphRef` (0→1, driven in `useFrame`), shared by whichever chamber's components are transitioning, so a chamber can dissolve and the next can form without React unmount/mount churn mid-animation. `SummoningRing.tsx` (a rail of seal buttons) is the current chamber-selection UI; the Neon Rotunda plan calls for retiring it in favor of wall-mounted "bays" driven by the same registry, but that phase has not started (see "Unfinished work" below).

### Spatial vocabulary

`src/scene/zones.ts` is the one file that defines "where things go" and why. Key fact: there is no `XROrigin`, so the immersive-VR reference space maps directly onto the scene origin — the user's head in a headset sits at approximately `USER_EYE_VR = [0, 1.6, 0]`. This is *not* the same as the flat-mode `<Canvas>` camera at `[0, 1.6, 3]` (a pulled-back survey view for desktop/phone browsers). Every zone distance (`reserved`/`control`/`work`/`content`/`ambient`) is measured from `USER_EYE_VR`. This distinction is the file's own stated reason for existing: work that looked correct from the flat camera was previously found wrong in the real VR frame.

### XR interaction

`src/scene/pressable.ts` exports `pressable(onActivate, disabled)`, the one canonical pointer implementation for interactive 3D objects, using `setPointerCapture`/`releasePointerCapture` rather than bare `onClick` — bare clicks were found unreliable against XR controller rays. This replaced several independent, incomplete local implementations that had accumulated across chamber files.

### The three authored chambers

Each is `src/tools/<name>.ts` (pure logic, offline, deterministic) + `src/scene/chambers/<Name>Chamber.tsx` (`*Architecture` + `*Instrument` React components):

- **Cell / Abulafia** (`tools/abulafia.ts`): Heap's permutation algorithm over Tetragrammaton-derived vowel/letter sequences, breath timing constants, a shared `stepIndexAt()`/`vowelForStep()` derivation (extracted specifically to fix an architecture/instrument desync bug — see `CLAUDE_DECISION_HISTORY.md`).
- **Monad / Monas Hieroglyphica** (`tools/monas.ts`): six glyph-construction phases (point → line → circle → sun → moon → cross), each tied to one of Dee's theorems. **Implements 6 of the real text's 24 theorems** — see the provenance audit below.
- **Chapel of Lies / Liber 333** (`tools/liber333.ts`): Sephiroth/Paths data, FNV-1a string hashing (`hashString`), gematria-seeded chapter draws across a 94-chapter structure (Thesis/Antithesis/Synthesis offsets).

### The Neon Rotunda (current visual system)

`src/theme/neon.ts` defines the current palette (cyan/magenta/violet/gold/ice/ember/void, plus floor tones) and **supersedes** the older `src/theme/palette.ts`, which is not yet deleted (tech debt #7). `src/scene/rotunda/` holds the shared shell:

- `RotundaFloor.tsx` — ground disc, horizon ring, guide rings, spokes, four floor-sigil medallions reusing existing glyph components.
- `RotundaDome.tsx` — instanced constellation ceiling (120 stars + nearest-neighbor link lines, 2 draw calls total via `InstancedMesh`).
- `RotundaColonnade.tsx` — 12-column colonnade with arches and entablature, **as of this session's last commit (`9a93985`)** collapsed from ~170 individual meshes to 6 draw calls (instanced shafts/strips/bands + one merged `BufferGeometry` for every arch curve).

### Text and fonts

`src/scene/TempleText.tsx` wraps drei's `<Text>` (itself a `troika-three-text` wrapper) and defaults `font="/fonts/DejaVuSans.ttf"`. This exists because `troika-three-text` silently fetches glyph outlines from `cdn.jsdelivr.net` per-glyph unless a local font is supplied — in this sandboxed environment that CDN is blocked, which was producing a completely blank (0%-lit-pixel) canvas before the fix. All 116 `<Text>` usages across the codebase were mechanically converted to `<TempleText>`. The bundled font covers all but 3 of the glyphs the app needs; those 3 (🜂🜃⟁) were swapped for covered lookalikes rather than adding a second font, because even one uncovered glyph in *any* font reactivates the CDN dependency.

### Backend / API

`api/` (Vercel serverless functions, proxied from Vite dev via `API_PROXY_TARGET`):
- `oracle.ts` — Gemini-backed reading interpretation. Fixed this session-family: a literal `'\\n'` (backslash-n) vs `'\n'` (real newline) bug that was corrupting every prompt sent to Gemini.
- `forge.ts` — deck/card-content generation.
- `image.ts`, `card-image.ts`, `card-image-start.ts`, `card-image-status.ts` — ComfyUI-backed card art generation with a polling status pattern; `api/comfy/workflow_api.json` is the ComfyUI workflow definition. AI Horde is a documented fallback provider.
- `tsconfig.api.json` closes a gap where `api/` was previously outside all TypeScript project references — added so `tsc -b` actually checks backend code.

### Every major subsystem, named

Ritual Workbench (`src/scene/RitualWorkbench.tsx` + `src/scene/workbench/*`: `AltarHardware`, `ForgeMenu`, `SpreadField`, `WorkbenchCards`, `SigilDock`, `WorkbenchControls`, `ImagePipelineStatus`, `shared.ts`) · Forge Menu (deck/card generation config UI) · tradition selection (`src/constants/tarotSystems.ts`) · card manifestation and image generation (`useGrimoireEngine.ts` + the `api/card-image*` handlers — **see the AI-behavior audit below for a confirmed bug in how these two are wired together**) · oracle / Spirit interpretation (`api/oracle.ts`, `InWorldOraclePanels.tsx`) · Sigil Dock and Spread Field (workbench sub-components) · Chamber Director / Summoning Ring / Rotunda / Morph transitions (`src/scene/chambers/*`, `src/scene/rotunda/*`) · Cell/Monad/Chapel chambers and their `src/tools/*` logic modules · TempleText / offline fonts (`src/scene/TempleText.tsx`, `public/fonts/`) · pointer/XR press handling (`src/scene/pressable.ts`) · backend/API routes (`api/*`) · persistence (none found beyond in-memory engine state and `localStorage` for VR window positions, per earlier commit history — not re-verified in depth this session) · assets (`src/assets/hero.png`, `public/icons.svg`, `public/favicon.svg`, `public/fonts/*`) · build config (`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`) · LAN/HTTPS/WebXR dev setup (`@vitejs/plugin-basic-ssl`, `host: true` in `vite.config.ts`, used for phone testing over the local network) · service workers/PWA (none found — this app is not currently a PWA) · testing/CI (none found in the repository — see `CLAUDE_TECHNICAL_DEBT.md` #11).

## Source-provenance audit

Every historical/occult claim in the authored chambers, classified honestly:

| Content | Classification | Notes |
|---|---|---|
| Cell chamber: Tetragrammaton letter/vowel structure, breath timing | OPERATIVE RECONSTRUCTION / EXPERIMENTAL CORRESPONDENCE | Ported from the sibling `abulafia.exe` project's own operative framework, not a direct primary-source transcription of a historical Abulafian text. |
| Monad chamber: Latin text of Theorems 1–6 | TRANSLATION (Latin) presented alongside AI-PROJECT INTERPRETATION (English "working rendering," explicitly labeled as such in the source code's own comments, not claimed as a literary translation) | The file's own header states this plainly: "The English is a working rendering rather than a literary translation." |
| Monad chamber: "GEOMETRY / CABALA / ALCHEMY / OPERATION" commentary per theorem | AI-PROJECT INTERPRETATION | Original interpretive layering, not attributed to Dee or any named scholar. |
| Monad chamber: **scope** (6 of 24 theorems) | Must be stated as PLACEHOLDER-partial, not fabricated-complete | The real *Monas Hieroglyphica* has 24 theorems; this implements 6, ported from a sibling project that is itself explicitly a partial "vertical slice" reading engine (its own source comment: "covers Theorems 1–4... six animation phases"). **No fabricated scholarship was added to paper over the gap** — theorems 7–24 simply do not exist in this app, and this document is where that's said plainly rather than left for a user to discover by disappointment. |
| Chapel chamber: Sephiroth/Paths structure, Tree of Life | SCHOLARLY COMMENTARY / OPERATIVE RECONSTRUCTION | Standard 10-sephirah/22-path Qabalistic structure, consistent with widely-published correspondences; not sourced to one specific primary text in the code. |
| Chapel chamber: 94-chapter Thesis/Antithesis/Synthesis structure, gematria-seeded chapter draw | EXPERIMENTAL CORRESPONDENCE / AI-PROJECT INTERPRETATION | Ported from the sibling `liber-333-grimoire` project's own design; this is that project's operative system, not a claim about a historical text's structure. |
| Tarot/oracle content generated at runtime by Gemini | AI-PROJECT INTERPRETATION, generated live | Not static/authored content; quality and accuracy depend entirely on the live model and prompt, neither audited for historical accuracy in this pass. |

**No missing scholarship was fabricated to make any system look complete.** Where a gap exists (Monad's 24-vs-6 theorem count being the clearest case), it is recorded as a gap, not filled with invented Latin.

## AI / generative behavior audit

**Stated invariant:** selecting or manifesting a card must not automatically trigger expensive image generation; that must remain an explicit user action.

**Finding: this invariant is currently violated.** Traced the full call path during this session: `src/scene/workbench/WorkbenchCards.tsx`'s card `onPointerUp` handler calls `onSelect()` and then, in the same handler with no further user gesture, conditionally calls `onGenerateImage(card.id)` whenever the card has an `artPrompt` and isn't already `ready`/`generating`. This threads through `RitualWorkbench.tsx` → `RitualChamberScene.tsx` → `App.tsx` → `useGrimoireEngine.ts`'s `generateImageForCard`, which calls the real backend image pipeline. **Selecting a card that lacks art silently starts a generation job.** This is stated honestly here and filed as the top item in `CLAUDE_TECHNICAL_DEBT.md`; it was not fixed as part of this documentation pass because the correct UX (a separate button? a confirmation step? a setting?) is a product decision for the user, not something to decide unilaterally while doing a documentation/reconciliation task.

Other AI-touching code paths, for completeness: `api/oracle.ts` (Gemini, invoked by an explicit "CONSULT" action in the oracle panel, not automatically) and `api/forge.ts` (deck/card text generation, invoked by the explicit "IGNITE FORGE" action) both appear to be gated behind explicit user actions, consistent with the stated invariant — only the image-generation-on-select path violates it.

## Performance

See `CLAUDE_QUEST_XR_STATUS.md` for the full verification-tier breakdown. Headline number: **786 draw calls per frame**, measured 2026-08-10 via the custom Playwright histogram tool against the current `claude/temple-foundation-hub` HEAD (`9a93985`), against a self-imposed target of "at or below 748." Progression across the session: 1009 → 774 → 748 → 762 (+floor) → 906 (+colonnade/dome, acknowledged overshoot) → 786 (current, after this session's colonnade instancing/merge). This number has never been correlated with an actual framerate on real Quest hardware — it's a proxy metric, not a validated performance guarantee.

## Testing / QA performed this session

- `npm run build` (`tsc -b && vite build`) — clean, no errors, after the colonnade fix.
- `npm run lint` — 30 problems (28 errors, 2 warnings), matching the stated baseline; no new errors introduced by this session's change.
- `pw-test/histogram.js` (external, scratchpad-only) — real per-frame draw-call count via patched `WebGLRenderingContext` prototypes.
- `pw-test/chambers.js` (external, scratchpad-only) — screenshots and zero-page-error confirmation across all four chambers, re-run after the colonnade fix.
- No failing check was hidden or omitted from this report. The lint baseline is not zero, and that is stated as-is rather than described as "passing."

## Assets

`src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` (the latter two are Vite/React template defaults, likely unused — not confirmed removed in this pass), `public/favicon.svg`, `public/icons.svg`, `public/fonts/DejaVuSans.ttf` + `DejaVuSans-LICENSE.txt` (Bitstream Vera license, copied verbatim) + `README.txt`. No AI-generated card art assets are committed to the repository — card images are generated at runtime and are not persisted to the repo (confirmed by the full file inventory: no image files beyond the ones listed above exist under `src/` or `public/`).

## Backend / deployment

Deployment target: Vercel (serverless functions under `api/`, per `vite.config.ts`'s dev-proxy comment referencing `vercel dev`). Environment variables required (see `.env.example` — **names only, no values were ever read or logged this session**):

| Variable | Purpose | Required? |
|---|---|---|
| `GEMINI_API_KEY` | Text generation (oracle, forge) | Required — without it, forge/oracle requests return 502 |
| `GEMINI_MODEL` | Model override | Optional, defaults to `gemini-2.5-flash` |
| `COMFYUI_BASE_URL` | Card-art backend | Optional — card art is skipped (not errored) if unset |
| `COMFYUI_CLIENT_ID` | ComfyUI client identity | Paired with `COMFYUI_BASE_URL` |
| `COMFYUI_CHECKPOINT_DEFAULT` | Default art checkpoint | Paired with `COMFYUI_BASE_URL` |
| `COMFYUI_CHECKPOINT_EROS` | Alternate checkpoint for eros-level content | Paired with `COMFYUI_BASE_URL` |
| `COMFYUI_CF_ACCESS_CLIENT_ID` / `_SECRET` | Only if ComfyUI sits behind Cloudflare Access | Optional |
| `AI_HORDE_API_KEY` | Fallback image provider | Optional |
| `API_PROXY_TARGET` | Local dev only — where Vite proxies `/api/*` | Optional, defaults to `localhost:3000` |

## Dependencies

Runtime: `@google/genai`, `@react-three/drei`, `@react-three/fiber`, `@react-three/xr`, `react`/`react-dom`, `three`, `zod` (8 total). Dev: standard Vite/TS/ESLint toolchain plus `@vitejs/plugin-basic-ssl` for LAN HTTPS dev. No new runtime dependency was added at any point in this session's chamber/rotunda work — every technique (instancing, geometry merging, fake bloom/reflection) was built from primitives already present. No `npm audit fix --force` or blanket upgrade was run; see `CLAUDE_TECHNICAL_DEBT.md` for the explicit statement that a full CVE audit has not been performed.

## Local-only artifacts (not in the Git repository, would be invisible to a GitHub-only reviewer)

- Playwright verification scripts: `shot.js`, `shot2.js`, `shot3.js`, `shot4.js`, `verify.js`, `chambers.js`, `histogram.js`, `attribute.js`, `perf.js` — all in this Claude Code session's scratchpad directory, not the repo. These are real and were used repeatedly to verify work in this handoff (draw-call counts, screenshot comparisons, CDN-dependency diagnosis). **Recommendation, not yet acted on:** if continued Playwright-based verification is valuable, promote a cleaned-up subset (`histogram.js` and `chambers.js` are the two still in active use) into the repository itself, e.g. under a `scripts/pw-verify/` directory with a short README, so future engineers don't have to reconstruct them from scratch. This was not done in this pass because it's a scope decision (does the user want Playwright as a committed dev dependency?) rather than a mechanical one.
- A planning document at `/root/.claude/plans/can-we-review-everything-generic-beacon.md` (local to the Claude Code environment, not the repo) — contains the phase-by-phase Neon Rotunda plan referenced throughout `CLAUDE_DECISION_HISTORY.md`. Not committed; its substance is now captured in the decision-history document instead.

## Unfinished work — precise next steps

1. **Neon signage bays** (Phase 3 of the Neon Rotunda plan) — replace `SummoningRing.tsx` with wall-mounted bays between colonnade columns, driven by the existing `CHAMBERS` registry. Not started.
2. **Altar plinth** (Phase 4) — a shared, lit central work surface for every chamber's instrument, replacing the current workbench block. Not started.
3. **Per-chamber re-tint and defect fixes** (Phase 5) — re-tint each chamber to its accent hue against the now-shared rotunda shell; fix the two known layout bugs (Monad lectern/button overlap, Chapel Tree/desk collision — see `CLAUDE_TECHNICAL_DEBT.md` #4). Not started.
4. **Draw-call budget** — still 786 vs. a 748 target; the next reduction needs profiling to find what's actually costing the most (333 of 786 calls are single-quad draws — likely text glyphs or un-instanced UI planes — not yet isolated).
5. **Fix the card-selection auto-image-generation bug** (`CLAUDE_TECHNICAL_DEBT.md` #1) — needs a product decision on the correct UX before it can be implemented.
6. **Resolve the branch-name discrepancy** (`CLAUDE_BRANCH_INVENTORY.md`) — a human needs to decide whether `claude/temple-foundation-hub` should become the record under the "designated" name, get its own PR, or something else.
7. **`palette.ts` removal** — confirm zero remaining references and delete, or formally decide to keep it. Not audited to completion this session.

## Final Local-to-GitHub Reconciliation

All commands below were run live against this checkout on 2026-08-10, in this order, with real output (not reconstructed).

```
$ pwd
/home/user/grimoire-xr

$ git remote -v
origin  https://github.com/bookthief666/grimoire-xr (fetch)
origin  https://github.com/bookthief666/grimoire-xr (push)

$ git status --short
[empty — clean working tree, at the time this was run]

$ git status -sb
## claude/temple-foundation-hub...origin/claude/temple-foundation-hub

$ git branch --show-current
claude/temple-foundation-hub

$ git branch -vv
* claude/temple-foundation-hub      9a93985 [origin/claude/temple-foundation-hub] perf: merge colonnade into instanced/batched draws
  claude/temple-visual-uplift-Y2JMb dffe418 chore: update package-lock.json after npm install
  main                              368aa86 [origin/main] feat: remove board geometry and relight pillars

$ git branch -a
* claude/temple-foundation-hub
  claude/temple-visual-uplift-Y2JMb
  main
  remotes/origin/claude/temple-foundation-hub
  remotes/origin/claude/temple-visual-uplift-Y2JMb
  remotes/origin/main

$ git stash list
[empty]

$ git worktree list
/home/user/grimoire-xr  9a93985 [claude/temple-foundation-hub]

$ git tag --list
[empty]

$ git diff --stat
[empty]

$ git diff --staged --stat
[empty]

$ git ls-files --others --exclude-standard
[empty]
```

(Full `git log --all --graph --decorate --oneline -100` and `git reflog --date=iso -50` output is reproduced in full in `CLAUDE_BRANCH_INVENTORY.md` rather than duplicated here.)

### The six reconciliation questions, answered directly

1. **Is every piece of work described in this handoff actually committed?** YES. Working tree is clean; the one item that was uncommitted at the start of this session (the `RotundaColonnade.tsx` instancing rewrite) was completed, verified (build/lint/draw-call/screenshot), and committed as `9a93985` before this documentation was written.
2. **Is everything pushed to `origin`?** YES for the branch actually in use. `claude/temple-foundation-hub` local and `origin/claude/temple-foundation-hub` point at the identical commit (`9a93985`); `git status -sb` shows no ahead/behind. `claude/temple-visual-uplift-Y2JMb` was not touched this session and its local/remote state was not modified.
3. **Does local branch state match remote for every branch that exists?** YES — confirmed for all three branches via `git branch -vv`; none show `[ahead]`/`[behind]` markers.
4. **Is there any uncommitted, stashed, or untracked work anywhere in the checkout?** NO — `git status --short`, `git stash list`, `git diff --stat`, `git diff --staged --stat`, and `git ls-files --others --exclude-standard` are all empty.
5. **Has anything been merged into `main`, deleted, force-pushed, or rebased?** NO to all four. `main` remains at `368aa86`, untouched. No branch was deleted. No force-push occurred (`git push -u origin claude/temple-foundation-hub` was a plain fast-forward push of one new commit). No rebase occurred — the reflog shows only ordinary commits and two ordinary checkouts.
6. **Are there local-only artifacts a GitHub-only reviewer would never see?** YES — see "Local-only artifacts" above (Playwright scripts, the planning doc). None contain secrets. All are now described in this handoff so their existence and purpose are not lost even though their content is not.

### Twelve-point final report

1. **Repository:** `bookthief666/grimoire-xr`, single remote `origin`.
2. **Working branch:** `claude/temple-foundation-hub`, HEAD `9a93985`, in sync with `origin/claude/temple-foundation-hub`. This is the branch carrying every piece of work described in this handoff family.
3. **Discrepancy flagged, not resolved by this pass:** the session's harness-designated branch name is `claude/temple-visual-uplift-Y2JMb` (HEAD `dffe418`, a separate and fully-diverged ~50-commit history), but no work described here lives there. See `CLAUDE_BRANCH_INVENTORY.md` for the full ancestry and an explicit recommendation that a human, not an agent, decide how to reconcile the naming.
4. **`main` status:** untouched at `368aa86`. Not merged into. Not force-pushed. Not rebased.
5. **Commits pushed this session:** one — `9a93985` "perf: merge colonnade into instanced/batched draws," completing the previously-uncommitted colonnade instancing rewrite (fixed a `react-hooks` `useMemo` lint violation and removed a dead `computeVertexNormals()` call, then build/lint/draw-call/screenshot-verified before pushing).
6. **Draw-call budget:** 786/frame measured, against a 748 target — improved from 906 but not yet at target; root cause of the remaining gap not yet isolated (see Unfinished Work #4).
7. **Confirmed live bug found during this pass:** card selection auto-triggers image generation in `WorkbenchCards.tsx`, violating the stated "explicit user action only" invariant. Documented, not fixed — needs a product decision. `CLAUDE_TECHNICAL_DEBT.md` #1.
8. **Provenance gap documented, not fabricated around:** the Monad chamber implements 6 of the real *Monas Hieroglyphica*'s 24 theorems. Stated plainly in this document's provenance audit and in `CLAUDE_TECHNICAL_DEBT.md` #2.
9. **XR verification status:** nothing in this project has been run in an actual immersive `XRSession` on real headset hardware, ever, in the full recorded history of this project. All "VR" testing to date is flat-mode phone/desktop browser testing or headless-Chromium automated testing. Full breakdown in `CLAUDE_QUEST_XR_STATUS.md`.
10. **No destructive git operations occurred:** no branch deletions, no force-pushes, no history rewrites, no stash drops, confirmed by reflog inspection covering the full session-visible window.
11. **No secrets were read, logged, or exposed:** `.env.example` documents variable names only; this document's env-var table lists names only; no `.env*` file with real values exists in the tracked file list (`git ls-files` shows only `.env.example`).
12. **Five handoff documents now exist under `docs/`:** `CLAUDE_PROJECT_HANDOFF.md` (this file), `CLAUDE_BRANCH_INVENTORY.md`, `CLAUDE_TECHNICAL_DEBT.md`, `CLAUDE_QUEST_XR_STATUS.md`, `CLAUDE_DECISION_HISTORY.md`. All were committed and pushed to `claude/temple-foundation-hub` in the commit immediately following this one.
