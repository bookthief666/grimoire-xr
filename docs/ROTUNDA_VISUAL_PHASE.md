# Neon Rotunda — Station Bay / Altar Phase

This branch continues the visual-overhaul plan after the qualified React/XR hardening baseline.

## Intent

The Fold 6 screenshots show that the floor, dome, colonnade and chamber instruments are now structurally coherent, but the previous shared navigation still read as a small UI rail rather than as architecture. This phase makes the rotunda itself carry tool identity while preserving the existing VR spatial-zone contract.

## Architectural decision

Wall stations are ambient visual architecture, not far-away interaction targets. The actual chamber summon controls live on the altar console inside the VR control zone. Selecting a key summons the existing registered chamber and visually activates the corresponding wall bay.

This keeps the current four tools registry-driven and leaves adjacent colonnade bays available for future instruments without inventing functions that do not exist yet.

`SummoningRing.tsx` remains only as a compatibility facade so `RitualChamberScene` and `ChamberDirector` do not need broad churn. Its old seal-rail geometry has been removed; the facade now mounts `RotundaStationBays` plus `RotundaAltarPlinth`.

## Fold 6 evidence — 2026-08-10

The on-screen `?perf=1&hud=1` probe produced the first device-side comparison of the new shared Rotunda shell:

- Chapel: 8.43 ms average, 118.7 fps, 292.4 average draws / 318 worst — 72 Hz healthy.
- Monad: 8.28 ms average, 120.8 fps, 284.9 average draws / 341 worst — 72 Hz healthy.
- Cell: visual smoke passed; the supplied screenshot was captured while the five-second window was still collecting, so no completed numeric sample is recorded yet.
- Sanctum: 17.17 ms average, 58.2 fps, 827.1 average draws / 901 worst — 72 Hz over-budget.

The screenshots and numbers agree: the authored chambers are relatively light, while Sanctum is still stacking its pre-Rotunda shell (`93` pillars, local shrine/walls, Xenotheurgy, GrandArchitecture) on top of the new Rotunda plus the actual Forge/workbench surfaces.

## Legacy Sanctum retirement

The duplicated pre-Rotunda Sanctum architecture is being retired from the default scene rather than deleted. `?legacySanctum=1` restores it for exact A/B comparison and regression diagnosis.

Default Sanctum must preserve the functional surfaces:

- Forge configuration and deck creation;
- Spread and card interaction;
- explicit/manual card-image generation;
- Oracle and ritual tablets;
- card manifestation/altar behavior;
- shared station-bay and chamber switching.

Only architecture and atmosphere that duplicate the shared Rotunda should disappear in this pass. Further visual density is added back deliberately after the new baseline is measured.

## Performance guardrails

- no postprocessing bloom;
- one low-cost floor reflection echo under the altar, not a rendered reflection pass;
- no raycasting on ambient wall bays;
- keep the existing `?perf=1` probe active after the old summoning rail is retired;
- `?perf=1&hud=1` adds a DOM-only QA overlay for Fold screenshots without adding WebGL draw calls;
- preserve a query-flag A/B path for retired Sanctum architecture;
- measure the stripped Sanctum before another density pass.

## Current verification

The station-bay / altar implementation has passed the normal PR gates:

- deterministic tests: pass;
- TypeScript/Vite production build: pass;
- ESLint: pass;
- production/full dependency audit: pass;
- Vercel preview: deployed.

The station-layout tests additionally verify that wall bays remain ambient while all four altar selectors remain in `ZONES.control` and out of the central forward sightline.

## Next visual evidence

After the legacy Sanctum shell is disabled by default, capture one clean Sanctum screenshot and one `?perf=1&hud=1` Sanctum screenshot on the Fold 6. Compare the result to the recorded 17.17 ms / 827.1-draw baseline before adding any replacement density. If the stripped Sanctum is comfortably healthy, the next aesthetic pass can spend that recovered budget on efficient architectural detail that actually moves the room toward the neon-rotunda reference.
