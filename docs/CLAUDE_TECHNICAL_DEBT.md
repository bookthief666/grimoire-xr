# Technical Debt & Known Bugs — Grimoire XR

Generated 2026-08-10. Ordered roughly by severity/cost of ignoring, not by discovery order. Nothing here is hidden or softened — several of these were found during this documentation pass specifically by reading code that had not been re-checked since it was written.

## High priority

### 1. Card selection auto-triggers paid image generation — confirmed live bug, violates a stated product invariant

**File:** `src/scene/workbench/WorkbenchCards.tsx`, `onPointerUp` handler, ~line 220–251.

The handler calls `onSelect()` and then, in the same gesture with no further user action, checks `card.artPrompt && card.imageStatus !== 'ready' && card.imageStatus !== 'generating'` and — if true — immediately calls `onGenerateImage(card.id)`, which threads through `RitualWorkbench.tsx` → `RitualChamberScene.tsx` → `App.tsx` → `engine.generateImageForCard`, which calls the backend (ComfyUI or AI Horde) image-generation pipeline.

This means **tapping/clicking a card that doesn't already have an image silently starts an expensive generation job.** There is no separate "generate image" button gesture required — selection and generation are fused. This was checked against the codebase during this documentation pass specifically because a governing instruction stated the invariant "selecting or manifesting a card MUST NOT automatically trigger expensive image generation; image generation must remain an explicit user action," and the code does not honor it.

Confirmed by direct code reading (call graph traced end-to-end from the pointer handler to `useGrimoireEngine.ts:585 generateImageForCard`), not merely suspected. **Not fixed as part of this documentation pass** — fixing it means deciding what the correct UX is (a separate "generate art" affordance per card? a confirmation? a settings toggle?), which is a product decision, not a mechanical one, so it's recorded here rather than silently patched.

### 2. Monas Hieroglyphica: 6 theorems implemented, not 24

**File:** `src/tools/monas.ts`.

Dee's actual *Monas Hieroglyphica* (1564) contains 24 theorems. `monas.ts`'s own header comment is honest about scope — "It covers Theorems 1–4 with six animation phases," porting from a described "source project" that is itself a partial reading engine — but the in-app `THEOREMS` array presents six fully-formed theorem entries (numbered 1–6, each with Latin, English, and layered commentary) with no in-UI indication that theorems 7–24 don't exist. A user without prior knowledge of the source text has no way to know this chamber is a fragment. See `CLAUDE_PROJECT_HANDOFF.md`'s source-provenance audit for the full classification of this content.

### 3. Draw-call budget still over target

786 draw calls per frame (measured `2026-08-10` via `pw-test/histogram.js`, commit `9a93985`), against a self-imposed target of "at or below 748." The colonnade merge (170 meshes → 6 draws) recovered less than expected — likely because the dominant cost now sits elsewhere (333 of 786 calls are single-quad draws, i.e. individual planes: UI text glyphs via `TempleText`, sigil components, or workbench card faces not yet instanced). No profiling has isolated exactly which subsystem is responsible; this is a real gap, not a solved problem with a stale number.

## Medium priority

### 4. Two known per-chamber layout defects, unfixed since first observed

- **Monad chamber:** the lectern's theorem commentary text overlaps its own RESET/ADVANCE buttons. Visible in the Fold-6 screenshots that prompted the aesthetic reset; still present in the most recent screenshot taken during this session (`/tmp/chamber-monad.png`, captured 2026-08-10) — the commentary block and the button row visibly collide.
- **Chapel chamber:** the Tree of Life diagram drifts off-centre, with the oracle desk covering the Malkuth sephira position. Also still visible in the current screenshot (`/tmp/chamber-chapel.png`).

Both are cosmetic/layout bugs, not functional breaks (the buttons and desk still work), but both were explicitly named as known-and-deferred in the working plan and have not been revisited.

### 5. `RotundaColonnade.tsx` arch geometry has no normals and no UVs

The merged `buildArchGeometry()` writes only a `position` attribute (deliberately — `computeVertexNormals()` was removed in commit `9a93985` since the material is `meshBasicMaterial`, which ignores normals). This is correct for the current unlit/additive look, but means the geometry cannot be reused later with a lit material (`meshStandardMaterial`, etc.) without reconstruction. Acceptable now; a trap if a future engineer tries to relight the colonnade without noticing.

### 6. Legacy floor code retained behind a flag rather than removed

`src/scene/RitualChamberScene.tsx` retired the old `TempleFloor` behind `SHOW_LEGACY_TEMPLE_FLOOR = false` rather than deleting it, because it z-fights with the new `RotundaFloor` at the same y-offset if both are ever enabled simultaneously. Dead-but-present code; should be deleted once the rotunda floor is confirmed as the permanent replacement (it has not been formally confirmed as permanent by the user, only implicitly by continued iteration on it).

### 7. Two parallel palette systems

`src/theme/neon.ts` (current) and `src/theme/palette.ts` (superseded, still present, still imported in places at the time the neon system was introduced — not re-audited for full removal in this pass). The old `PALETTE`'s warm-amber hex values (`#d8e8ff` ×50, `#f8f3df` ×39, by an earlier count) were flagged as "drifted out of use" when `neon.ts` was designed, but `palette.ts` was not deleted, and no exhaustive check has been done in this session to confirm zero remaining references. **Action needed:** grep for `from '../theme/palette'` (and relative variants) repo-wide and either finish the migration or explicitly decide `palette.ts` is dead and delete it.

### 8. `RotundaColonnade.tsx`'s uncommitted-fix pattern may recur elsewhere

The `useMemo(fn, [])` vs `useMemo(() => fn(), [])` `react-hooks` lint failure has now been hit and fixed twice independently (`RotundaDome.tsx`'s `makeStars`, `RotundaColonnade.tsx`'s `buildArchGeometry`). No sweep has been done to confirm no third instance exists elsewhere in the codebase. Low cost to check (`npx eslint .` already surfaces it; the 30-problem baseline shown by `npm run lint` as of this pass did not include a fresh instance, so this is not currently an open bug — noted only as a pattern worth remembering).

## Lower priority / worth knowing about

### 9. Large JS bundle, no code-splitting

`npm run build` warns that several chunks exceed 500kB after minification (`music_room` chunk reaches ~2.09MB / ~717kB gzipped). These bundle names (`office_small`, `meeting_room`, `office_large`, `emulate`, `living_room`, `music_room`) look like they come from a dependency (likely `@react-three/xr`'s hand/controller model assets or an XR-related asset pack) rather than this project's own code, but this has not been confirmed by inspecting the dependency graph. Worth a `vite-bundle-visualizer`-style pass before this matters for load time on a standalone Quest browser, which has meaningfully less bandwidth/CPU headroom than desktop.

### 10. `eslint` baseline sits at 30 problems (28 errors, 2 warnings), not zero

This is a pre-existing baseline the plan explicitly permits staying at or under, not a regression from this session's work — but it means `npm run lint` does not currently pass cleanly, and a future engineer running it for the first time will see 30 pre-existing failures and may reasonably wonder which are new. One concrete example surfaced by the lint run during this pass: `src/scene/workbench/WorkbenchCards.tsx:27` — `setState()` called synchronously inside a `useEffect` body (`react-hooks/set-state-in-effect`), which the rule explains can trigger cascading renders. Not investigated further in this pass; recorded because it's the kind of issue that's easy to fix in isolation and was sitting in the output already reviewed.

### 11. No automated test suite

No `*.test.*` / `*.spec.*` files exist anywhere in `src/` or `api/` (confirmed by the full-repository `find` inventory run for this documentation pass — 90 tracked files total, none matching test-file naming conventions). All verification this session has been manual/scripted-but-external (Playwright scripts living outside the repo — see `CLAUDE_PROJECT_HANDOFF.md`). There is no CI configuration in `.github/` either (no `.github/` directory exists in the tracked file list at all). Regressions can currently only be caught by a human (or agent) manually re-running the same battery of checks each time.

### 12. `TempleXenotheurgy.tsx` — unclear current role

`src/scene/TempleXenotheurgy.tsx` exists in the tree but was not referenced anywhere in this session's design discussion or prior summarized work. It may be active atmosphere code, may be dead, was not investigated in this pass — flagged so it isn't silently forgotten.

## Explicitly not touched, per constraints on this documentation pass

- No `npm audit fix --force` or sweeping dependency upgrades were run or are recommended without a deliberate, separate review — the dependency list (`package.json`) is small (8 runtime deps) and each was chosen deliberately during earlier work; a security audit of it was requested conceptually but a full CVE-by-CVE pass was not performed in this session.
- No secrets were read, printed, or committed. `.env.example` documents variable **names** only (`GEMINI_API_KEY`, `GEMINI_MODEL`, `COMFYUI_BASE_URL`, `COMFYUI_CLIENT_ID`, `COMFYUI_CHECKPOINT_DEFAULT`, `COMFYUI_CHECKPOINT_EROS`, `COMFYUI_CF_ACCESS_CLIENT_ID`, `COMFYUI_CF_ACCESS_CLIENT_SECRET`, `AI_HORDE_API_KEY`, `API_PROXY_TARGET`); no values for any of these were ever inspected or logged during this session.
