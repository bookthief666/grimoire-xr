# Living Electric Rotunda — Station Bay / Altar Phase

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

The screenshots and numbers agree: the authored chambers are relatively light, while Sanctum was still stacking a large pre-Rotunda environment on top of the new Rotunda plus the actual Forge/workbench surfaces.

## Rotunda-native Sanctum compression

Rather than broadly editing the large `RitualChamberScene` orchestrator or deleting functionality, the three largest pre-Rotunda decorative subsystems keep their existing public component APIs but now have compact implementations:

### `TempleAtmosphere`

- now provides reactive lighting only;
- no second cosmic void, star field, floor aura, A∴A∴ trace, or orbiting seal layer;
- no shadow-casting key light or shadow-map pass;
- the shared Rotunda owns the environment.

### `TempleGrandArchitecture`

- no second floor, remote twisted pillars, floating obelisks, distant axis, or redundant ray system;
- replaced by a local Sanctum circuit crown behind the Forge;
- one merged line lattice and one instanced node field provide geometric density efficiently.

### `TempleXenotheurgy`

- no second collection of wall circuits, obelisks, veils, star gate, and parallel room-scale installations;
- replaced by one coherent state-reactive astral engine;
- retains an orrery vocabulary, Babalon glyph, all 78 card loci in one instanced mesh, and instanced ritual nodes.

The previous implementations remain available in Git history and the earlier qualified PR commits for forensic comparison/revert. No runtime legacy query flag is retained because it would permanently keep duplicate implementation complexity in the product surface.

At the end of the first compression pass, the local Sanctum pieces defined directly in `RitualChamberScene` — including the four legacy `93` pillars and related shrine pieces — remained as the next measured target. The hero slice below records their subsequent retirement.

## Electric Rotunda hero slice — 2026-08-10

The next measured implementation slice retires the remaining duplicated local room layer rather than recoloring it:

- removes the four independent `93` pillars and their per-mesh edge passes;
- removes duplicated lateral wall planes, rear shrine/arch/dais, local ceiling crown, and individually drawn Sanctum ember field;
- leaves the shared Rotunda responsible for room enclosure and celestial atmosphere;
- converts the Sanctum circuit backdrop to an opaque architectural recess plus one merged frame/lattice;
- removes the astral engine's full-disc veil and promotes one solar core, one Babalon star, two orbitals, one instanced 78-card field, and one instanced ritual-node field into a clear hierarchy;
- lays the dormant card-manifestation seal into its altar surface instead of projecting an `Awaiting Selection` ring/text layer across the hero engine;
- gives all four registered station bays a verified preview artifact: solar forge, permutation axis, Monas construction, and 22-link chapter Tree;
- adds slow, deterministic preview pulse and uses existing colonnade/dome draws for cyan, magenta, violet, gold, and ice-white energy routing;
- replaces the plain command plinth body with a dimensional obsidian hexagonal crown while preserving all four control-zone selector positions.

No Forge, spread, card, Oracle, archive, image-generation, or chamber-switching capability was removed. The explicit image-generation policy and provenance layers are unchanged.

Local in-app-browser flat smoke after the slice recorded:

- Sanctum idle: 427 direct WebGL draws;
- Cell active: 288 direct WebGL draws;
- successful altar-driven Sanctum → Cell → Monad → Chapel → Sanctum switching;
- no runtime error logs; the existing Three `Clock` deprecation warning remains.

This browser surface is cadence-limited near 30 fps, so its frame-time result is not used as performance qualification and is not compared numerically with Fold/Quest frame time. The direct-draw result is retained as local comparative evidence only. A new Fold capture and the first real Quest `immersive-vr` capture remain required.

## Functional invariants

The compression pass must preserve:

- Forge configuration and deck creation;
- Spread and card interaction;
- explicit/manual card-image generation;
- Oracle and ritual tablets;
- card manifestation/altar behavior;
- shared station-bay navigation and chamber switching.

## Performance guardrails

- no postprocessing bloom;
- one low-cost floor reflection echo under the altar, not a rendered reflection pass;
- no raycasting on ambient wall bays;
- keep the existing `?perf=1` probe active;
- `?perf=1&hud=1` adds a DOM-only QA overlay for Fold screenshots without adding WebGL draw calls;
- no shadow-map pass in the Rotunda-native Sanctum atmosphere;
- measure the compressed Sanctum before another density pass.

## Current verification

The station-bay / altar implementation and the Rotunda-native Sanctum component replacements are required to pass the normal PR gates:

- deterministic tests;
- TypeScript/Vite production build;
- ESLint;
- production/full dependency audit;
- Vercel preview deployment.

The station-layout tests additionally verify that wall bays remain ambient while all four altar selectors remain in `ZONES.control` and out of the central forward sightline.

## Next visual evidence

Capture one clean Sanctum screenshot and one `?perf=1&hud=1` Sanctum screenshot on the Fold 6 after the latest deployment. Compare the result to the recorded 17.17 ms / 827.1-average-draw baseline before adding any replacement density. If the compressed Sanctum is comfortably healthy, the next aesthetic pass can spend the recovered budget on efficient architectural detail that actually moves the room toward the neon-rotunda reference. If it remains over budget, the next measured targets are the local `93` pillar/shrine layer and the Forge/readout rendering density — not the authored chambers, which are already healthy in the Fold evidence.
