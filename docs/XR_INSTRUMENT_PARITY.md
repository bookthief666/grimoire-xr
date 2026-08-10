# XR Instrument Parity

This is the living capability inventory for Grimoire XR. An instrument is not considered integrated merely because a miniature representation appears in the room. Integration requires functional parity, spatial recomposition, an XR-native advantage, provenance integrity, and qualification evidence.

Last audited: 2026-08-10 on `codex/electric-rotunda-instruments`, stacked from qualified visual head `6898c1fdb638a0e788e745ba73a8a19cbef7617a`.

## Current instrument inventory

| Instrument | Source implementation | Existing capabilities preserved in XR | Current XR-native advantage | Missing parity / next capability gap | Provenance requirement | Network / offline | Performance class | QA status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| The Sanctum | `useGrimoireEngine`, `RitualWorkbench`, workbench modules, Oracle/tablet surfaces | Subject; tradition; Tarot system; tone; technical level; style family; art style; Eros field/level; intent; deck forge; seven-card spatial spread; selection and drag; explicit card-art request/retry; image state; Oracle question/reading; ritual tablets; local archive save/load/clear; chamber switching | Persistent altar layout; cards can be placed and compared spatially; configuration, spread, archive, Oracle, and manifestation occupy distinct ritual surfaces; state drives one central 78-locus astral engine | Forge remains a dense near-user panel family rather than a fully recomposed set of spatial configuration arcs/talismans. Backend image generation, error/retry, and controller drag still need device qualification. Only the first seven forged cards currently manifest on the workbench at once. | Generated interpretation must not impersonate source text. Selection and image generation remain separate actions. Tradition remains first-class configuration. | Deck/Oracle/image services require network; archive and retained state are local | Moderate; still the visual outlier | Automated policy/interaction/build gates pass. Flat local smoke passed. Fold re-capture and Quest immersive qualification required. |
| The Cell | `tools/abulafia.ts`, `CellChamber.tsx` | Deterministic 24-step positional permutations; multiple Name sequences; 4s inhale/4s exhale pacing; vowel/sound/axis readout; automatic run; hold/resume; manual step; world-axis architecture | Breath is embodied as a spatial pulse; the active permutation and vowel axis are simultaneously visible around the practitioner | No spatial audio; no gesture input; no session history, configurable cadence, or practice export. Pointer fallback exists and must remain if gestures are added. | Breath timing, vowel/axis correspondence, and current sequencing are visibly labeled operative reconstruction rather than canonical Abulafian prescription | Fully offline | Light | Deterministic sequence/breath/provenance tests pass. Flat chamber switch smoke passed. Fold and Quest legibility/input qualification required. |
| The Monad | `tools/monas.ts`, `MonadChamber.tsx` | Six ordered construction phases; advance/reset; staged spatial glyph; phase progress; construction description and commentary | The composite glyph is assembled as a persistent spatial construction instead of a flat illustration | No exploded view, scale manipulation, alternate viewing angle, or complete sourced 24-theorem edition. Current six stages are an application-authored pedagogical sequence, not full historical parity with the source work. | Every current stage remains operative reconstruction; application text is not presented as Dee quotation or as Theorems I–VI | Fully offline | Light | Phase order/provenance tests pass; production build passes. Flat chamber switching passed; source-layout and headset-scale QA required. |
| The Chapel of Lies | `tools/liber333.ts`, `ChapelChamber.tsx` | Stable question set; single/triad modes; deterministic draw; English ordinal and reduction; ten Sephiroth; 22 geometric links; spatial inscriptions; lit node/path relationships | The Tree is room-scale architecture and drawn chapters illuminate spatial relationships rather than appearing only in a list | No source-text corpus reader, saved draw history, draw comparison, or user-authored question entry. Chapter cards currently show draw identity and experimental placement, not the full chapter text. | Chapter-to-Sephira placement is always experimental correspondence. Geometric paths do not invent letter/Tarot attributions. | Fully offline | Light | Arithmetic/determinism/22-path/provenance tests pass. Flat chamber switching passed; triad readability and Quest qualification required. |

## Architectural registry state

The four real instruments are the only labelled bays. Registry metadata currently answers:

- instrument identity and purpose;
- verified preview-artifact type;
- capabilities;
- network/offline behavior;
- coarse performance class;
- provenance for authored instruments;
- room architecture and instrument implementation.

No fictional future instruments were added. Empty colonnade space remains architectural only.

## Legacy and partial surfaces audited

These are compatibility or A/B surfaces, not additional instruments:

- `InWorldRitualConsole`: older Sanctum configuration console, disabled by `SHOW_LEGACY_VR_CONSOLE`;
- `InWorldOraclePanels`: older draggable Oracle panels, disabled by `SHOW_LEGACY_ORACLE_PANELS`;
- `CardArc`: older chamber-scale card rail, disabled by `SHOW_LEGACY_CARD_ARC`;
- `TempleFloor`: superseded by the shared `RotundaFloor`, disabled to prevent z-fighting;
- `SummoningRing`: compatibility facade that mounts the registry-driven station bays and near-user command altar; the old distant seal rail is retired.

Repository and current branch history contain no separate mobile application with deeper instrument behavior to port wholesale. The meaningful legacy Sanctum capabilities are already carried by `useGrimoireEngine` and the current workbench modules. The authored Cell, Monad, and Chapel are new XR instruments whose documented gaps are expansion work, not hidden regressions.

## Qualification meanings

- **Automated:** deterministic contracts, TypeScript/Vite build, lint, dependency audits.
- **Flat smoke:** visual/interaction evidence in a non-XR browser. This is not headset evidence.
- **Fold:** device-side flat browser evidence. This is not immersive WebXR evidence.
- **Emulated XR:** explicit `?emulate=1`; useful for path testing, never Quest evidence.
- **Quest qualified:** native `immersive-vr` capture on target hardware without emulation.

An instrument remains partially qualified until its relevant real-controller interactions, readable scale, transitions, repeated chamber cycle, and target-device performance are measured.
