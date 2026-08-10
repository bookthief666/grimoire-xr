# Neon Rotunda — Station Bay / Altar Phase

This branch continues the visual-overhaul plan after the qualified React/XR hardening baseline.

## Intent

The screenshots from the Fold 6 show that the floor, dome, colonnade and chamber instruments are now structurally coherent, but the shared navigation still reads as a small UI rail rather than as architecture. The goal of this phase is to make the rotunda itself carry tool identity while preserving the existing VR spatial-zone contract.

## Architectural decision

Wall stations are ambient visual architecture, not far-away interaction targets. The actual chamber summon controls live on the altar console inside the VR control zone. Selecting a key summons the existing registered chamber and visually activates the corresponding wall bay.

This keeps the current four tools registry-driven and leaves adjacent colonnade bays available for future instruments without inventing functions that do not exist yet.

## Performance guardrails

- no postprocessing bloom;
- one low-cost floor reflection echo under the altar, not a rendered reflection pass;
- no raycasting on ambient wall bays;
- keep the existing `?perf=1` probe active after the old summoning rail is retired;
- measure the resulting build before any further density pass.

## Verification

The phase must retain:

- all deterministic tests;
- clean TypeScript/Vite production build;
- zero ESLint debt;
- existing explicit card-image generation policy;
- chamber switching through the new altar controls;
- Fold/flat fallback;
- Quest zone constraints.
