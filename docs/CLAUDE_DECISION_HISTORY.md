# Decision History — Grimoire XR

Generated 2026-08-10. A timeline of the choices made across this project's Claude-assisted development, why each was made, what was rejected instead, and where the user's own direction changed the trajectory. This is a supplement to `CLAUDE_PROJECT_HANDOFF.md`, not a replacement — read that first for current state; read this for *why* the state is what it is.

## Stage 1 — Foundation repair

Before any visual work, the codebase had real defects: a reading-surface component built but never wired into the scene, `api/` excluded from TypeScript project coverage entirely (so backend type errors were invisible to `tsc`), and a literal-string bug in `api/oracle.ts` where `'\\n\\n'` was sent to the Gemini prompt instead of an actual newline (`'\n\n'`) — corrupting every oracle prompt's structure silently, since the API would still return *something*, just with degraded prompt formatting.

**Decision:** fix these before any aesthetic work, and split the then-2972-line `RitualWorkbench.tsx` into `src/scene/workbench/*` modules before adding more surface area to it. Rejected alternative: leave the monolith and just add new chamber code alongside it — rejected because every subsequent chamber/rotunda change touched workbench-adjacent code, and a 2972-line file would have made that materially harder to review at every step.

## Stage 2 — XR interaction correctness

**Decision:** replace ad hoc `onClick` handlers with a canonical `pressable()` helper (`src/scene/pressable.ts`) using explicit `setPointerCapture`/`releasePointerCapture`. Why: bare `onClick` was found unreliable against XR controller rays in `@react-three/xr` — clicks would sometimes not register or would double-fire. Rejected alternative: patch each component's local press handler individually — several chamber files (`CellChamber.tsx`, `MonadChamber.tsx`, `ChapelChamber.tsx`) had done exactly this independently, each missing `setPointerCapture` in a slightly different way, which is what motivated pulling it into one shared helper instead of a fourth bespoke fix.

**Decision:** establish `src/scene/zones.ts` as the single spatial vocabulary, anchored on `USER_EYE_VR = [0, 1.6, 0]` (the true VR head position given no `XROrigin`), not the flat-mode camera at `[0, 1.6, 3]`. Why: earlier layout work had been implicitly validated only in the flat camera view, and distances that read correctly there were wrong by ~3m in the actual VR reference frame. This is recorded as a "trap" in the file's own doc comment specifically so it doesn't get relearned the hard way again.

## Stage 3 — Multi-tool integration: the pivotal creative-authority handoff

The user supplied three sibling repo names (`monas-hieroglyphica`, `liber-333-grimoire`, `abulafia.exe`) and explicitly granted broad creative authority: *"you have creative control in terms of evolving the whole app... let's create something fun and mind blowing and useful."* Critically, the user proposed the core interaction model themselves: *"it would be cool if each tool when selected could transform or morphs the whole vr space significantly into different rooms."*

**Decision:** build a `ChamberDirector` state machine with a single shared `morphRef` (0→1, mutated in `useFrame`) rather than unmounting/remounting React trees per chamber switch. Why: unmount/remount would cause visible pops and lose animation continuity mid-transition; a shared morph value lets architecture dissolve and re-form smoothly. Rejected alternative: a full scene swap via conditional rendering — simpler to write, but visually abrupt and not what "morph" implies.

**Decision:** give each tool its own pure-logic module (`src/tools/abulafia.ts`, `monas.ts`, `liber333.ts`) separate from the React components that render them. Why: the underlying algorithms (Heap's permutation, gematria hashing, theorem sequencing) are testable and reusable independent of any specific 3D presentation, and this separation is what made it possible to fix the Cell chamber's architecture/instrument desync bug cleanly (see below) — both components could be pointed at one shared derivation function instead of duplicating logic.

**Bug found and fixed here:** `CellArchitecture` and `CellInstrument` each derived "current permutation step" from independent local clocks, so the lit spatial axis marker and the displayed Hebrew/Latin text could disagree — undermining the chamber's entire premise (turn to face the axis you're chanting). Fixed by extracting `stepIndexAt()`/`vowelForStep()` into `tools/abulafia.ts` as one shared derivation called identically by both components against the same `clock.getElapsedTime()`.

## Stage 4 — Performance discipline established mid-stream

**Decision:** self-impose a ~100–200 draw-call budget for standalone Quest, doubled in effect since WebXR renders once per eye, and track it explicitly in every commit from this point forward. Why: not directed by the user in this exact form — a self-imposed engineering constraint, made because chamber geometry was growing fast (four full rooms' worth of architecture) and nothing was yet measuring the cost. Method chosen: a custom Playwright script patching `WebGLRenderingContext.prototype.drawElements/drawArrays/drawElementsInstanced` to count real per-frame draw calls, built after two earlier approaches failed — `canvas.__r3f` internals inspection (not exposed by this R3F version) and a naive triangle counter (produced `Infinity`/`0`, unusable).

**Decision:** use GPU instancing (`InstancedMesh`) and manual `BufferGeometry` merging as the two allowed techniques for cutting draw calls, rather than reaching for postprocessing-based tricks or reducing visual density. This is consistent with — not separate from — the standing constraint that postprocessing (`EffectComposer`, `Bloom`, `DoF`, `SSAO`) is off the table for this project; both constraints push toward "more geometry, fewer draws" as the only lever.

## Stage 5 — Aesthetic reset, explicitly authorized

After Fold-6 screenshots of the working Four Chambers, the user released all obligation to preserve the original look: *"you do not need to keep the original metal holographic look... it was just a placeholder... reimagine the whole place and make it look way better... let's just make something aesthetically esoteric occult and enchanting and alive."*

**Decision:** treat this as full permission to replace, not layer onto, the existing visual system. This is why `src/theme/neon.ts` is documented as *superseding*, not joining, `src/theme/palette.ts` — a deliberate choice to avoid a third parallel palette system, even though it left `palette.ts` not-yet-deleted (tracked as debt item #7 in `CLAUDE_TECHNICAL_DEBT.md`).

## Stage 6 — The Neon Rotunda: reference image, explicit "adapt, don't copy" instruction

The user supplied a reference image (saturated neon rotunda, constellation dome, glowing floor sigils, wall bays, altar plinth) with an explicit instruction to use judgment rather than pursue literal fidelity: *"doesn't have to be exactly like the picture but let's try and see how much of that picture and feel and vibe can be effectively and properly built and adapted."*

**Decision, stated openly in the plan rather than silently assumed:** most of the reference is directly buildable with existing techniques (neon line-art via additive-blended thin geometry, instanced constellation dome, existing sigil glyph components for the floor medallions). Two things are explicitly **not** buildable as shown and must be faked or acknowledged as absent:
- **Floor reflections** — a true planar reflector re-renders the scene into a texture every frame, unaffordable at the stated draw-call budget. Decision: fake it with a few mirrored, dimmed, squashed copies of only the brightest elements, rather than promising real reflections and under-delivering.
- **Soft bloom** — the reference's glow is postprocessing, which is off-limits per standing project constraints. Decision: continue the existing "fake bloom" technique (layered low-opacity additive planes/discs) and say plainly that the result will read as neon but crisper than the reference, rather than overclaiming.

**Decision:** reframe the room around the "stand at centre, turn head" model rather than a rail of four seals facing the user. Why: there is no locomotion anywhere in the app (see Stage 2), so a ring of wall bays the user turns to face is a better fit for the movement model than a linear rail, and it scales — new tools become new bays without redesigning the layout. This decision reused, rather than replaced, the existing `CHAMBERS` registry (`src/scene/chambers/registry.ts`), since it already carried exactly the fields (`name`, `purpose`, `seal`, `accent`) a bay needs — a presentation change, not a data-model change.

**Sequencing decision, revised once with evidence:** the original plan ordered signage bays before the dome/colonnade. After Phase 1 (floor only) was verified on the Fold 6, the screenshots made it unambiguous that the room read as "a lit disc suspended in void" — no vertical structure at all. **Decision, changed in response to that evidence:** reprioritize the dome and colonnade ahead of the signage bays, since bays hung on non-existent walls would have nothing to attach to. This is recorded as a case where a plan was revised mid-flight because a screenshot contradicted the original ordering assumption, not because the user asked for a re-order.

**Budget overshoot, disclosed rather than hidden:** Phase 2 (colonnade + dome + seal fix, commit `053fe43`) landed the enclosed room but overshot the stated 748-draw-call target, reaching 906. The cause (108 separate arch-segment meshes, ~60 column-part meshes, none yet instanced) was recorded in the commit message itself rather than left for a future audit to discover. The subsequent instancing/merge rewrite (commit `9a93985`, this session) recovered to 786 — better, but the commit message and `CLAUDE_TECHNICAL_DEBT.md` both say plainly that this is still over target rather than rounding the result down to "fixed."

## Stage 7 — This documentation pass

**Decision:** when asked to produce a full project handoff, run the actual reconciliation commands rather than reconstruct branch/commit state from memory or the conversation summary — the summary itself flagged uncertainty about whether uncommitted changes existed, and a live `git status` resolved that (none did; the only local change was the colonnade file, which was completed and committed first).

**Decision:** finish and commit the in-progress `RotundaColonnade.tsx` instancing rewrite before writing documentation about it, rather than documenting an unverified, uncommitted file as if it were done. It was built, lint-checked, draw-call-measured, and screenshot-verified across all four chambers before being committed as `9a93985` — see `CLAUDE_TECHNICAL_DEBT.md` item #3 for the honest result (786, not the hoped-for ≤748).

**Decision:** when the reconciliation surfaced that the session's actual working branch (`claude/temple-foundation-hub`) does not match the harness's "designated branch" header (`claude/temple-visual-uplift-Y2JMb`), document the discrepancy prominently rather than either (a) silently continuing without mentioning it, or (b) unilaterally moving 15 commits of tested work onto the "designated" branch name without asking. See `CLAUDE_BRANCH_INVENTORY.md`.

**Decision:** while auditing the "no auto image-generation" invariant the task specifically asked to check, a real violation was found in `WorkbenchCards.tsx` (card selection silently triggers image generation). It is documented as a confirmed bug in `CLAUDE_TECHNICAL_DEBT.md` rather than fixed inline — fixing it is a product decision (what should the corrected UX be?) outside the scope of a documentation task, and silently patching product behavior while asked to document it would have exceeded what was asked.

## Ideas raised and explicitly not pursued

- **Real-time planar reflections for the rotunda floor** — rejected on cost grounds (Stage 6), faked instead.
- **Postprocessing-based bloom** — standing constraint from the original project brief, never revisited or challenged by the user; consistently faked with additive geometry instead.
- **A second bundled font to cover the 3 unresolved occult glyphs (🜂🜃⟁)** — rejected in favor of swapping to covered lookalikes, specifically because adding any font with even one missing glyph would silently reactivate the CDN dependency that was the whole reason a bundled font was needed in the first place (`troika-three-text` falls back to network fetch per-glyph, not per-font).
- **Physics** — never implemented, per standing project constraint; not revisited.
- **New npm dependencies for any of the above** — never added; every technique used (instancing, merged buffers, additive-blended fake bloom, fake reflections) was built from `three`/`@react-three/fiber` primitives already in the dependency list.
