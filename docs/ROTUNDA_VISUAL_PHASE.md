# Neon Rotunda — Station Bay / Altar Phase

This branch continues the visual-overhaul plan after the qualified React/XR hardening baseline.

## Intent

The Fold 6 screenshots show that the floor, dome, colonnade and chamber instruments are structurally coherent, but the previous shared navigation still read as a small UI rail rather than as architecture. This phase makes the rotunda itself carry tool identity while preserving the existing VR spatial-zone contract.

## Architectural decision

Wall stations are ambient visual architecture, not far-away interaction targets. The actual chamber summon controls live on the altar console inside the VR control zone. Selecting a key summons the existing registered chamber and visually activates the corresponding wall bay.

This keeps the current four tools registry-driven and leaves adjacent colonnade bays available for future instruments without inventing functions that do not exist yet.

`SummoningRing.tsx` remains only as a compatibility facade so `RitualChamberScene` and `ChamberDirector` do not need broad churn. Its old seal-rail geometry has been removed; the facade now mounts `RotundaStationBays` plus `RotundaAltarPlinth`.

## Performance guardrails

- no postprocessing bloom;
- one low-cost floor reflection echo under the altar, not a rendered reflection pass;
- no raycasting on ambient wall bays;
- keep the existing `?perf=1` probe active after the old summoning rail is retired;
- `?perf=1&hud=1` adds a DOM-only QA overlay for Fold screenshots without adding WebGL draw calls;
- measure the resulting build before any further density pass.

## Current verification

Mounted branch head is qualified through the normal PR gates:

- deterministic tests: pass;
- TypeScript/Vite production build: pass;
- ESLint: pass;
- production/full dependency audit: pass;
- Vercel preview: deployed.

The station-layout tests additionally verify that wall bays remain ambient while all four altar selectors remain in `ZONES.control` and out of the central forward sightline.

## Next visual evidence

Before adding another density layer, capture the new deployed build on the Fold 6 in Sanctum, Cell, Monad and Chapel, both with and without the QA HUD. The next pass should be driven by those images and `?perf=1` results, with particular attention to the remaining legacy Sanctum architecture (including the old `93` pillars) versus the new rotunda shell.
