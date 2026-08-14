# Spatial Ritual Composer 0.10

## Product intention

Grimoire XR should behave like a coherent magical instrument, not a flat application surrounded by occult scenery. Every important choice must have:

1. a precise effect on the existing Grimoire state;
2. a spatial form that communicates that effect;
3. an accessible, non-spatial equivalent;
4. a clear response in light, motion, sound, or haptics;
5. a safe failure path that never loses the user's work or submits an expensive job twice.

The immediate goal is a Quest-testable vertical slice in which a user can enter the temple, name and tune a subject, review the complete arrangement, awaken the 78-card Grimoire, and navigate to every planetary court without removing the headset.

This is an embodiment layer over the current instrument. It must not fork the original application's catalogs, prompt construction, provider queue, archive, or ritual state.

## Core design law: correspondence before spectacle

Visual effects are permitted only when they reveal one of these meanings:

- **identity** — which subject, court, card, or current is active;
- **choice** — what the user is pointing at or has selected;
- **intensity** — Eros, intellectual depth, atmosphere, or ritual progress;
- **operation** — idle, armed, queued, generating, complete, paused, or failed;
- **memory** — what has been inscribed, manifested, inspected, or carried into the archive.

An effect that communicates none of these meanings is decoration and must fit inside the remaining performance and comfort budget.

## Non-negotiable architectural decisions

### ADR-001 — One authoritative Grimoire state

`VrApp.jsx` remains the single owner of subject, tradition, aesthetic, Eros, intellect, atmosphere, ritual, cards, providers, operations, and archive state.

The Spatial Ritual Composer is an alternate controller of the same state currently used by `VrCommandDeck`. It receives a serializable model and calls the existing actions. It does not maintain a second ritual, copy catalogs, construct prompts, or call providers directly.

Only transient presentation state may be local to the composer:

- open or closed;
- current stage;
- focused token;
- category page;
- a temporary spoken-subject transcript before confirmation.

### ADR-002 — Hybrid text entry

Long-form text must not depend on a fantasy keyboard.

- Exact subject entry remains available in the normal threshold console before entering XR.
- In XR, subject presets and capability-detected speech input are primary.
- If speech input is unavailable, **Scribe at the Threshold** exits or pauses immersive presentation and focuses the existing DOM field.
- Oracle and Spirit retain the same fallback: speech in XR, precise typing at the threshold.
- A companion-phone input channel may be explored later, but it is not required for 0.10.

### ADR-003 — A symbolic effigy before a generated portrait

The centerpiece begins as a deterministic **Mnemonic Genius Effigy**, not a claim of a literal or authenticated spiritual presence.

Before image generation, its geometry is derived locally from the subject string and the selected currents. After ComfyUI returns a portrait, the same effigy may hold layered portrait planes and particles. True volumetric reconstruction or generated 3D geometry is a later experiment and must be labeled honestly.

### ADR-004 — Controller-ray baseline, hands as enhancement

Every core operation must work with one Quest controller ray and trigger. Hand tracking may add pinch, grasp, and wrist gestures, but it cannot be the only route to a tool.

### ADR-005 — Expensive operations remain explicit

Awakening, text scribing, image manifestation, portrait generation, Oracle casting, and batch forging preserve their existing guarded boundaries.

- Selection never starts generation.
- One deliberate confirmation creates one job.
- Busy state disables duplicate submission.
- Queue state remains visible in both the wrist instrument and the active court.
- Image generation remains separate from intellectual generation.

### ADR-006 — Quest validation begins after the first complete loop

We will not design every chamber blindly on desktop. Once the composer, effigy, awakening, and planetary navigation work as a single loop, that slice goes to Quest for scale, reach, legibility, controller, comfort, and frame-time validation.

## The spatial magical grammar

The user should need to learn only five verbs.

| Verb | Controller baseline | Hand enhancement | Meaning |
| --- | --- | --- | --- |
| Point | Ray hover | Aim or hover fingertip | Reveal label and consequence |
| Choose | Trigger release | Pinch | Select a token or ordinary action |
| Turn | Left/right spatial control | Grasp and rotate | Cycle a wheel, style, card, or seal |
| Place | Trigger-drag or choose destination | Grasp and release | Put a card or token into a ritual position |
| Consecrate | Explicit hold or second confirmation | Hold closed hand over seal | Start a costly or state-changing operation |

Every spatial control also needs a visible Back/Undo route. No essential interaction may depend on remembering a hidden gesture.

## The Threshold and the Composer

### 0. Threshold Chamber

Before XR begins, the existing command console becomes the precision threshold:

- exact subject typing;
- provider and queue readiness;
- Demo Current versus Live Local AI;
- seated/standing and dominant-hand preference;
- atmosphere/reduced-motion preference;
- Enter the Temple.

Entering XR does not freeze these choices. It simply exchanges the precision console for their embodied equivalents.

### 1. Mercury — The Naming Mirror

Purpose: define the person, deity, text, image, category, or living question.

Spatial form:

- a dark mirror above the altar carrying the current subject;
- nearby mnemonic tokens for the existing suggested subjects;
- a **Speak the Name** sigil when speech recognition is available;
- a **Scribe at the Threshold** token as the universal fallback.

On confirmation, the mirror emits the first deterministic lines of the Mnemonic Genius Effigy. Changing the subject rebuilds the local effigy but does not start Ollama or ComfyUI.

### 2. Saturn — The Wheel of Lineages

Purpose: select one of the 11 traditions.

Spatial form:

- 11 engraved lineage tablets on a slow Saturnine wheel;
- only the focused tablet expands and displays its description;
- previous, focused, and next remain the primary readable trio;
- the complete ring stays visible as a mnemonic structure without requiring 11 simultaneous text blocks.

The chosen tablet enters the altar and becomes the effigy's outer geometric law.

### 3. Venus — The Sevenfold Aesthetic Loom

Purpose: preserve all 51 art styles without presenting an unusable wall.

The existing catalog already resolves into seven families:

1. Classical
2. Esoteric
3. Ancient
4. Modern
5. Surreal
6. East Asian
7. Experimental

Spatial form:

- seven colored threads or prisms form the outer Loom;
- selecting a family opens only that family's styles;
- three style swatches are readable at once: previous, focused, next;
- focused style previews a small procedural material treatment on the effigy;
- confirmation pulls the chosen thread through the figure.

The catalog and exact prompt text continue to come from `grimoireCatalog.js`.

### 4. Babalon — The Eros Furnace

Purpose: select the existing six Eros levels without reducing them to a generic slider.

Spatial form:

- six hearth states, from an unlit coal through progressively more intense flames;
- each state shows its exact label and a concise effect summary;
- intensity changes the effigy's pulse, proximity of orbiting particles, and restrained color temperature;
- selecting a state never generates adult imagery by itself; it only updates the same existing prompt context used by the original application.

The most intense states should feel powerful through rhythm and geometry rather than indiscriminate screen-filling effects.

### 5. Sol/Mercury — The Three Lamps of Intellect

Purpose: select Neophyte, Adept, or Magus interpretive depth.

Spatial form:

- three illuminated books, lenses, or masks;
- Neophyte produces one clear ray;
- Adept produces a balanced double correspondence;
- Magus produces a denser Qabalistic lattice;
- each choice displays its plain-language consequence before confirmation.

### 6. Luna — Astral Weather

Purpose: tune presentation and comfort independently from content.

Spatial form:

- a small lunar weather instrument with Adaptive, Vivid, Balanced, Veiled, and Off;
- the choice previews immediately and remains reversible;
- it does not alter generated textual or pictorial meaning.

### 7. The Central Seal — Review and Awaken

The altar displays the complete arrangement before submission:

- subject;
- tradition;
- aesthetic family and style;
- Eros level;
- intellectual depth;
- Demo or Live provider mode;
- text provider readiness;
- image provider readiness, clearly identified as optional for awakening.

Each value is represented by a removable token around the effigy. Pointing at a token returns directly to that stage.

**Awaken the 78 Arcana** is the sole submission action. It requires a named subject, a ready text path or Demo Current, and an explicit consecration. The current server queue and `beginRitual` remain authoritative.

## The Mnemonic Genius Effigy

### Deterministic local construction

A pure subject hash should produce stable parameters such as:

- number and phase of line segments;
- axial proportions;
- inner polygon;
- orbit inclination;
- asymmetry offset;
- pulse phase.

The selected currents then transform the base without destroying its identity:

| Current | Visible effect |
| --- | --- |
| Subject | Stable seed and core silhouette |
| Tradition | Outer sigil law and orbit geometry |
| Aesthetic | Material treatment and quantized animation vocabulary |
| Eros | Pulse amplitude, heat, and particle intimacy |
| Intellect | Density and hierarchy of inscriptions |
| Ritual progress | Number of awakened orbiting arcana/court lights |
| Busy state | Controlled voltage and faster internal motion |
| Error state | Broken circuit with readable error text, never chaotic flashing |

### Evolution through the operation

1. **Unnamed:** a dormant black crystal.
2. **Named:** a procedural wireframe daimon.
3. **Tuned:** tradition, style, Eros, and intellect alter it in real time.
4. **Awakened:** the seven mnemonic seal words orbit the ruling title.
5. **Portrait manifested:** translucent portrait layers appear inside the wireframe.
6. **Cards forged:** selected archetypes orbit as small relics.
7. **Seven courts complete:** the figure binds to the ceiling crown and Luna constellation.

The effigy must never block the active codex or sit between the user and a required hit target.

## The Wrist Grimoire

The Wrist Grimoire is the persistent navigation and status instrument. It must also open from a controller button or a fixed altar sigil so users are never trapped by hand-pose recognition.

Primary layer:

- seven planetary glyphs;
- current court;
- Back to Altar;
- queue/busy indicator;
- text and image provider gems;
- Demo Current label when active.

Secondary layer:

- audio;
- atmosphere;
- reduced motion;
- recenter/calibrate height;
- dominant hand;
- exit immersive mode.

The menu should be glanceable and should close after navigation. It is not a miniature copy of the entire command console.

## Complete capability-to-embodiment map

| Existing capability | Spatial instrument | Precise fallback |
| --- | --- | --- |
| Subject and dossier | Naming Mirror and central effigy | Threshold subject field |
| Tradition | Saturnine lineage wheel | Existing select control |
| 51 aesthetics | Sevenfold Venus Loom | Existing categorized/select control |
| Eros 0–5 | Six-state Eros Furnace | Existing select control |
| Neophyte/Adept/Magus | Three Lamps of Intellect | Existing select control |
| Astral Weather | Lunar weather dial | Existing select control |
| Awaken 78 cards | Consecrate central seal | Existing Awaken button |
| Card navigation | Arcana wheel; focused card rises | Searchable 78-card list |
| Scribe exegesis | Inscription action at Mars | Scribe button |
| Manifest card image | Separate furnace consecration | Manifest button |
| Patina | Inspect/turn relic, with ordinary button equivalent | Inspect + Add Patina |
| Return to prima materia | Dissolution confirmation | Existing reset action |
| Grand Forge 3/10/all | Guarded Mars batch rack, pause between jobs | Existing armed batch controls |
| Oracle draw | Cards enter the Jupiter cloth | Draw Random Spread |
| Oracle manual placement | Point/drag card into a labeled position | Existing tray and slot controls |
| Oracle question | Speak in XR | Threshold textarea |
| Cast reading | Consecrate completed cloth | Cast Reading button |
| Spirit dialogue | Speak toward Saturn vessel, with captions | Existing textarea/dictation |
| Portrait manifestation | Sol mirror, explicitly separate from awakening | Existing portrait button |
| Genius seal | Turn the mnemonic seal | Existing Sol action |
| Archive history | Luna constellation/timeline | Existing archive list |
| Gallery | Orbiting reliquary inspected one card at a time | Existing lazy gallery |
| Statistics | Constellation frequency instrument | Existing statistics panel |
| JSON/HTML/share | Carry the Lunar archive | Existing download/share controls |
| Restore archive | Import at threshold, then reconstitute the temple | Existing validated import |
| Demo Current | Gold rehearsal current with permanent label | Existing Demo toggle |
| Provider health | Two status gems and queue ring | Existing health panel |
| Guided Showcase | A guided planetary pilgrimage | Existing Showcase Rite |

## State and component architecture

### Proposed pure model module

`src/vr/spatialRitualModel.js`

Responsibilities:

- composer stage definitions;
- grouping `ART_STYLES` by existing `cat` values;
- catalog paging and wraparound;
- subject normalization and deterministic effigy parameters;
- construction of a review snapshot;
- `canAwaken` and clear disabled reasons;
- no React, Three.js, browser API, or provider calls.

Every function in this module receives explicit inputs and receives unit tests.

### Proposed presentation components

- `SpatialRitualComposer.jsx` — stage machine and altar instruments;
- `MnemonicEffigy.jsx` — procedural and portrait-bearing centerpiece;
- `WristGrimoire.jsx` — court navigation and system status;
- `SpatialChoiceRail.jsx` — reusable previous/focused/next selection primitive;
- `SpatialActionSeal.jsx` — ordinary versus guarded action behavior.

### Interface from `VrApp`

The scene receives a compact `composerModel` containing only serializable state and a `composerActions` adapter containing the existing setters and `beginRitual`.

The scene must not import application API functions. Provider operations remain in `VrApp`.

### Invariants

- A catalog index always resolves against the shared catalog.
- Busy generation prevents ritual-tuning changes that would mislabel the in-flight job.
- The prompt uses a captured review snapshot, not mutable presentation focus.
- Leaving XR does not clear the arrangement.
- Reload restores canonical state through the current palace snapshot.
- Generated image data remains outside the lightweight browser snapshot.

## Visual art direction

### “16-bit sovereign” in three dimensions

The style should come from:

- stepped silhouettes and deliberately faceted geometry;
- nearest-filtered textures;
- quantized animation timing on secondary effects;
- black, scarlet, brass, bone, teal, and magenta correspondence colors;
- scanline/dither motifs on flat displays;
- high-resolution headset rendering for legibility.

It should not come from reducing the headset render resolution until the scene becomes uncomfortable.

### Material hierarchy

- stone: stable architecture and inactive state;
- brass/gold: law, confirmation, preserved memory;
- bone: readable knowledge;
- scarlet: will, active selection, generation;
- teal: information, provider readiness, safe guidance;
- magenta: Venus/Eros and transformation;
- violet/ash: Saturn, simulation, archive shadow.

### Motion hierarchy

- architecture: still;
- available choice: slow breath;
- hover: one restrained response;
- selected: stable orbit or seated token;
- busy: faster inner motion, not whole-world movement;
- complete: one clear arrival gesture;
- error: still broken circuit plus text, never repeated strobing.

## Audio and haptic grammar

Audio remains opt-in and captions/status text remain authoritative.

| Event | Audio | Haptics |
| --- | --- | --- |
| Focus | Very quiet court timbre or none | None |
| Choose | Short material-specific tone | Light pulse |
| Stage complete | Two-note resolving interval | Double light pulse |
| Consecrate job | Low impact plus rising queue tone | Medium deliberate pulse |
| Job complete | Court-specific resolved chord | Success pattern |
| Error | Muted broken interval | One distinct low pulse |

Positional court motifs come only after controller navigation and frame timing are validated.

## Comfort, accessibility, and safety contract

- Entire setup loop must work seated or standing without locomotion.
- Important controls remain within a comfortable forward arc and approximately 0.9–1.8 meters from the user.
- Recenter and height calibration remain available at all times.
- No essential choice relies on color alone; glyph, position, and text reinforce it.
- Controller rays work for both dominant-hand choices.
- Hand-specific gestures always have a ray/button equivalent.
- Reduced Motion suppresses rapid glitching, large pulses, and unnecessary particle acceleration.
- Text panels face the user, avoid extreme angles, and use concise summaries with a route to the full flat console.
- No mandatory smooth locomotion.
- Teleport and snap turning are required before adding distant planetary chambers.
- No flashing pattern may approach photosensitive-strobe frequencies.
- Adult/intense settings change content context only after deliberate user selection; they never activate through hover.

## Performance contract

The current scene already measures roughly 95–100 calls in desktop screenshots, so the composer cannot simply accumulate on top of every existing object.

### Target headset budget

- 72 Hz target, approximately 13.9 ms total frame time;
- no postprocessing, bloom, real-time shadows, heavy physics, or mandatory environment model;
- no more than 100 steady-state draw calls in the first Quest slice, followed by an optimization target below 90;
- composer should add no more than six net steady-state calls by temporarily replacing or suppressing the floating codex and instancing choice tokens;
- no more than 12,000 additional triangles for the composer and effigy together;
- one generated portrait/card texture visible at a time;
- dynamic labels limited to the focused choice and summary rather than dozens of simultaneous text meshes;
- atmosphere automatically drops a tier during dense composer or gallery modes if measured frame rate requires it.

Performance is an acceptance condition, not a polish task.

## Quest validation matrix

The first headset session must cover:

| Dimension | Required cases |
| --- | --- |
| Posture | Seated and standing |
| Input | Left and right controller; hands observed but not required for pass |
| Mode | Demo Current and Live Local AI |
| Provider | Ready, text unavailable, image unavailable, queued, failed |
| Subject | Preset, pretyped custom subject, speech if available |
| Comfort | Adaptive, Veiled, Reduced Motion |
| Persistence | Exit XR, reload, restore current arrangement |
| Operation | One awakening without duplicate request |
| Performance | Idle composer, busy awakening, effigy complete |

### First Quest acceptance path

1. Enter from the threshold with a custom subject already typed.
2. Open the Naming Mirror and confirm the subject.
3. Select a different tradition.
4. Choose one of seven aesthetic families, then an individual style.
5. Change Eros and intellect and observe distinct, restrained effigy responses.
6. Return to any prior stage and revise it.
7. Review every value at the altar.
8. Consecrate one awakening.
9. Observe queued, running, and complete states without a second submission.
10. Open the Wrist Grimoire and visit all seven courts.
11. Exit and reload; confirm the canonical arrangement persists.
12. Record steady frame rate, draw calls, reach issues, text legibility, and discomfort.

## Implementation sequence

### Milestone 0.10A — Pure ritual model

- Add stage and catalog grouping model.
- Add deterministic subject hash and effigy parameter builder.
- Add review snapshot and disabled-reason functions.
- Unit-test every index, category, normalization, and readiness boundary.

Exit gate: no duplicated catalogs and all pure tests pass.

### Milestone 0.10B — Spatial composer shell

- Add composer mode at the altar.
- Add one reusable choice rail.
- Wire subject presets, tradition, Eros, intellect, and atmosphere to existing state.
- Add seven-family then style selection for the Venus Loom.
- Suppress or reposition the existing codex while composing.

Exit gate: desktop mouse can perform the complete arrangement and existing console reflects every change immediately.

### Milestone 0.10C — Mnemonic Genius Effigy

- Add stable procedural geometry.
- Add correspondence-driven transformations.
- Add dormant, named, tuned, busy, complete, and error states.
- Preserve a clear altar sightline.

Exit gate: the same subject/settings always reconstruct the same base form; effects remain within budget.

### Milestone 0.10D — Consecration and Wrist Grimoire

- Add complete review ring and direct revision.
- Connect the sole Awaken action to existing `beginRitual`.
- Add guarded busy/queue feedback.
- Add wrist/controller/fixed-sigil access to all seven courts and core settings.

Exit gate: one complete no-headset loop and automated build/tests pass.

### Milestone 0.10Q — Physical Quest acceptance

- Validate controller rays, hit sizes, scale, reach, legibility, comfort, state persistence, and 72 Hz target.
- Tune constants from measurements, not screenshots.
- Do not begin distant chambers until this gate passes.

### Milestone 0.11 — Embodied planetary tools

- Mars focused-card rise, scribe/manifest separation, guarded Grand Forge rack.
- Jupiter direct card placement with pointer fallback and completed-cloth consecration.
- Saturn capability-detected speech with persistent captions.
- Sol portrait layering inside the effigy.
- Luna gallery and archive constellation.

### Milestone 0.12 — Movement, hands, and ceremonial polish

- Teleport anchors and snap turning.
- Optional hand poses and grasp interactions.
- Positional court motifs.
- Authored haptic vocabulary.
- Accessibility and reduced-motion refinement.
- Final Quest performance and regression pass.

## Automated verification

New pure logic should be covered without WebXR hardware:

- exact seven aesthetic families and all 51 styles represented once;
- all 11 traditions, six Eros levels, and three intellect levels reachable;
- catalog wraparound and category paging;
- deterministic effigy output for Unicode and long subjects;
- blank subject rejected with a specific reason;
- Demo Current and provider-readiness rules;
- busy-state duplicate prevention;
- review snapshot stability;
- no provider call from presentation modules;
- restored indices normalize safely.

Existing API, archive, journey, demo, reference, and content suites remain mandatory. Quest observations are recorded separately because controller reach, legibility, comfort, and frame timing cannot be proven by unit tests.

## Risks and countermeasures

| Risk | Countermeasure |
| --- | --- |
| Beautiful but slower than the flat console | Keep focused-three rails, direct revision tokens, and one-controller completion path |
| Too much floating text | One focused label, one consequence summary, instanced unlabeled background tokens |
| 51-style overload | Seven families first, then local style rail |
| Unreliable immersive typing | Threshold typing, presets, speech detection, explicit exit/focus fallback |
| Hand tracking inconsistency | Controller ray is the acceptance baseline |
| Duplicate AI jobs | Existing busy guard plus one guarded consecration action |
| Effigy obscures altar/codex | Fixed sightline envelope and mode-specific codex suppression |
| Quest frame regression | Net-call budget, instancing, focused labels, automatic atmosphere reduction |
| Mystical metaphor hides function | Every object shows a plain consequence summary on focus |
| Spatial and flat state diverge | Single `VrApp` state and shared catalog imports only |
| Overbuilding before device evidence | Quest gate immediately after 0.10D |

## Definition of “spatial setup complete”

The setup is complete only when a first-time headset user can, without external coaching:

1. understand what kind of subject may be named;
2. enter or confirm that subject;
3. reach every tradition, aesthetic, Eros, and intellect option;
4. understand the consequence of the focused option before choosing it;
5. revise any prior choice;
6. distinguish Demo Current from Live Local AI;
7. distinguish text readiness from optional image readiness;
8. awaken exactly once;
9. understand queued/running/complete/error states;
10. reach all seven courts and return to the altar;
11. complete the same path seated, with either controller hand;
12. retain a precise flat-console fallback for every essential operation.

Only after this definition passes on Quest should the composer be considered an actual magical instrument rather than an attractive prototype.
