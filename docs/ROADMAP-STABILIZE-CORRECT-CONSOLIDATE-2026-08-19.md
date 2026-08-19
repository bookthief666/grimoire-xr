# Grimoire XR — Stabilize → Correct → Consolidate → Expand

Date: 2026-08-19
Status: active engineering plan

## Why this plan exists

The 0.46 Oracle→Relic Chamber defect exposed a QA gap: a source-level marker could exist while the actual user interaction was still inert for valid canonical readings. This roadmap makes behavioral truth, semantic integrity, and real-device evidence prerequisites for further feature expansion.

## Phase A — Finish 0.46 without adding scope

0.46 remains limited to Relic Chamber + Reliquary. No new visual systems or product features are added until these behaviors are proven:

1. Oracle Thesis / Antithesis / Synthesis cards open the Relic Chamber using canonical cardId as the invariant trigger.
2. The opening path resolves the current live deck copy first, then the reading copy, then a regenerated canonical card as fail-safe.
3. Reopening the same relic increments encounter history without resetting it.
4. KEEP THIS READING persists one reading-sized memory, not a duplicate 78-card session.
5. Sealing the same reading upserts rather than duplicates.
6. Hard refresh preserves Reliquary entries.
7. OPEN MEMORY restores the exact ReadingRecord and rebuilds the canonical deck before overlaying saved relic layers.
8. Missing artwork fails soft without destroying semantic state.
9. FORGET requires deliberate confirmation and affects only the selected memory.
10. Scribe/export tools remain available as secondary actions.

Acceptance requires automated QA + Fold 6 behavioral evidence. Source-text assertions alone are not sufficient evidence for interaction correctness.

## Phase B — 0.47 Semantic & Ontology Integrity

No new magical surface work. Correct the currently overloaded visible `Tradition` concept and eliminate stale authority after configuration changes.

Expose distinct concepts:

- Tarot System
- Correspondence Profile
- Relation Method
- Interpretive Lens
- Ritual Theme
- Reading Depth
- Eros / content-intensity policy

Required invariants:

- selecting a lens must not silently disable an unrelated relation method;
- changing Tarot System must rebind/regenerate visible identity authority coherently;
- stale source-qualified labels may never survive a configuration that no longer authorizes them;
- unsupported combinations remain explicit rather than silently coerced;
- legacy `Tradition` presets may remain as convenience presets, but presets are not the semantic model.

## Phase C — 0.48 Canonical Conformance / Doctrine De-duplication

Before extracting a shared package, add cross-client conformance fixtures that compare the 2D bridge with the canonical `tarot-archetype-vr` contract.

Minimum fixtures:

- all 78 canonical IDs and ordering;
- Thoth display labels and native titles;
- suit families and court mappings;
- selected verified correspondences;
- Three Aces relation result;
- Major-gap UNSPECIFIED result;
- semantic contract ID/version/pin.

Only after conformance is green should doctrine move into a shared package/module. Migration must be incremental and version-asserted; no broad rewrite.

## Parallel VR integrity lane

Before additional spatial spectacle:

1. Replace brittle source-string release assertions with model/numeric/behavior checks.
2. Keep authored framing constraints where they encode actual geometry, but test exported values/behavior rather than literal source spelling.
3. Run the built-in Quest acceptance recorder for at least 60 immersive seconds.
4. Record P05 FPS, draw calls, triangles, Codex legibility, card interaction, and comfort.
5. Resolve Eros-policy vs Priestess presentation consistency.
6. Continue visual enchantment only after the above produces real-device truth.

## Repository/release integrity

- Do not merge or deploy during this cycle.
- Preserve the unrelated current `grimoire-xr/main` before any future default-branch change.
- Establish a reviewed release-candidate lineage before changing `main`.
- Add real GitHub branch protection / required checks before promoting a release line.
- Park 0.41 Living Triad Current until this integrity cycle is complete and its product role is re-evaluated.

## Product work already validated

The following are not considered detours and remain part of the intended product:

- durable continuity and crash recovery;
- generation-free first reading;
- Living Book provenance translation;
- Ritual Hybrid + Exalted reversible art direction;
- enchanted Threshold / Oracle surfaces;
- Relic Chamber and persistent Reliquary, once 0.46 is behaviorally accepted.

## Expansion resumes only after integrity gates

Planned feature work after Phases A–C and VR truth:

- Living Reliquary recurrence visualizations;
- Spirit grounded in active/saved ReadingRecords;
- shared 2D/VR memory objects;
- persistent sanctum relics / constellational reading memory;
- further spatial enchantment driven by real ritual state.

Governing rule: **presentation may become elaborate; semantics and release truth must become simpler to verify, not harder.**
