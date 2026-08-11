# Original-Application Parity Audit

Generated 2026-08-10 against `codex/quad-draw-consolidation` @ `1180451`.

Evidence tier for everything below: **source inspection of the original
repositories**, cloned read-only. Where a claim comes from reading code rather
than running the original application, it says so. No original application was
executed for this pass — several need credentials or a browser session that this
environment does not have.

## How the originals were reached

The directive pointed at `/Users/a/Abulafia.Exe` and
`/Users/a/Downloads/liber333.jsx`. Those are paths on the owner's Mac; this work
runs in a remote Linux container and they do not exist here. With explicit
authorization the three sibling repositories were cloned instead:

| Repository | Files | Size | State |
| --- | ---: | ---: | --- |
| `bookthief666/liber-333-grimoire` | 92 | 1.4 MB | complete |
| `bookthief666/abulafia.exe` | 37 | 724 KB | complete |
| `bookthief666/monas-hieroglyphica` | 51 | 121 MB | complete |

**The Monas original is not missing.** It was described as unlocated; it is
intact, and its size is almost entirely the theorem plates.

---

## Blocking issues found before any porting

### 1. Copyright — Monas audio cannot be redistributed

`monas-hieroglyphica` contains **`Ryuichi Sakamoto - Bibo No Aozora.mp3`**
(5.1 MB), a commercial copyrighted recording. It is fine in a private local
project; shipping it inside a deployed Grimoire XR build would be infringement.

Monas audio parity is therefore **blocked on an owner decision**, not on
engineering: licence the track, commission or select a replacement, or ship the
chamber silent. Do not port this file.

### 2. Asset bug — invisible characters in two filenames

Two plates carry a **zero-width space (U+200B) prefixed to the filename**:

- `​theorema-XV.jpg`
- `​theorema-VIII.jpg`

Any naive path reference to `theorema-XV.jpg` will 404 while looking correct in
every editor and terminal. Rename on import, and assert filenames are ASCII in
whatever manifest step ports them.

### 3. Fonts — a CDN dependency Grimoire XR has already been burned by

`monas-hieroglyphica/src/index.css` line 1 imports four faces from
`fonts.googleapis.com`: **IM Fell English, UnifrakturMaguntia, MedievalSharp,
Petit Formal Script**.

Grimoire XR has hit exactly this failure before — `troika-three-text` fetching
glyphs from `cdn.jsdelivr.net` produced a completely blank canvas when the host
was unreachable, which is why `TempleText` exists and bundles DejaVu locally.
Porting Monas typography means vendoring all four faces and verifying glyph
coverage, not copying the `@import`.

These are all Open Font Licence families, so redistribution is permitted — but
that should be confirmed per-face at port time, not assumed from this note.

---

## Parity matrix — The Chapel of Lies (Liber 333)

Original: `bookthief666/liber-333-grimoire`.

| Original capability | Source | Original behaviour | Current XR | Parity | Proposed XR embodiment | Provenance tier |
| --- | --- | --- | --- | --- | --- | --- |
| 94-record chapter corpus | `src/data/liber333.js` | Two veils + Chapters 0–91, 8 fields each | **Ported this slice** | complete | Chapter reader, paginated | mixed, per field |
| English Ordinal gematria | `features/gematria/gematriaEngine.js` | `simple`, `reduced`, `raw`, `reductionSteps` | **Ported exactly** | complete | Derivation shown on the desk | mechanic |
| Deterministic selection | `features/oracle/divinationSelection.js` | simple / reduced / hash, forward-wrap dedup | **Ported exactly** | complete | Single and triad formations | mechanic |
| Per-field provenance | `src/data/provenance.js` | 3 labels + notes + corpus convention | **Ported verbatim** | complete | Labels shown per page in reader | — |
| Tree model | `features/tree/treeModel.js` | `TREE_POS`, `deriveTreePaths`, `getVeilChapters` | XR has own `SEPHIROTH`/`PATHS`; record's sephira now drives lighting | partial | Reconcile the two topologies | correspondence |
| Notable-number correspondences | `features/gematria/gematriaData.js` | `NOTABLE_NUMBERS`, factor/proximity analysis | **missing** | missing | Spatial annotation on the derivation | correspondence |
| AI Oracle | `features/oracle/{oraclePrompts,oracleRequest,useAIOracle}.js`, `api/oracle.js` | Single + triad prompts, rate limiting, validation | **missing** | intentionally deferred | Distinct third voice, visibly not source or commentary | AI interpretation |
| Journal + backup | `features/journal/*` | Storage, recurrence, milestones, export/import | **missing** | missing | Persistent archive wall | — |
| Planetary hour / lunar phase | `features/cosmic/cosmicTiming.js` | `calculatePlanetaryTime`, `calculateLunarPhase` | **missing** | missing | Restrained ambient state | correspondence |
| Rites | `features/rites/ritualData.js` | `RITUALS` | **missing** | missing | TBD — needs source review | TBD |
| Experience settings | `features/settings/experienceSettings.js` | Motion reduction, ceremony scaling, persistence | **missing** | missing | Maps onto XR comfort settings | — |
| Audio / voice / haptics / particles / CRT / glitch | `liber333.jsx`, `IchorOrb.jsx` | Ambience, bells, speech, vibration, canvas FX | **missing** | missing | Needs performance budget first | — |

### Defects this slice fixed

Four were found by diffing the XR port against the original. All are corrected
in this branch and covered by `test/liber333-parity.test.ts`.

1. **The corpus was absent.** `CHAPTER_COUNT = 94` was declared with zero chapter
   content in the repository. The room drew a number it could not show.
2. **The chapter range was wrong.** The port claimed "chapters 0 through 93" in a
   comment and in its provenance `reference`, and computed indices 0…93. The real
   corpus is −2 … 91. It invented chapters 92 and 93 and made both veils
   unreachable.
3. **The draw algorithm did not match.** The port seeded
   `(englishOrdinal + FNV-1a) % 94` then applied fixed offsets 0/31/62. The
   original uses `simple % n`, `reduced % n`, `stringToHash(question) % n` with
   forward-wrapping dedup. The same question produced different chapters in the
   two applications.
4. **The Sephira was invented.** `experimentalSephiraForChapter()` returned
   `SEPHIROTH[number % 10]` while every record already carried its own `sephira`.
   Honestly labelled, but fabricated data standing in front of real data.

A fifth, smaller divergence surfaced while porting: the XR `theosophicReduction`
stopped at master numbers 11/22/33; the original reduces unconditionally. That
alone changed the antithesis chapter for any question whose sum passed through
one of them.

---

## Parity matrix — The Cell (Abulafia.EXE)

Original: `bookthief666/abulafia.exe`. Not yet ported beyond the mathematics.

| Original capability | Source | Current XR | Parity |
| --- | --- | --- | --- |
| Heap's permutation, positional duplicates | `engines/permutationEngine.ts` | present (`tools/abulafia.ts`) | complete |
| 4 s inhale / 4 s exhale | `engines/metronomeEngine.ts` (`inhaleMs: 4000`, `exhaleMs: 4000`) | present | complete |
| Five vowels, five directions | `engines/metronomeEngine.ts` | present | complete |
| Metronome state machine | `advanceMetronome`, `getActiveStep`, `getPhaseProgress` | partial — XR derives from a clock | partial |
| Runtime transport | `adapters/metronomeRuntime.ts` — start / pause / reset / tick | **missing** — no hold/resume/manual step | missing |
| Practice session | `engines/practiceEngine.ts` — `createPracticeSession`, `getPracticePosition` | **missing** | missing |
| Ritual Gate | `components/RitualGate.tsx` | **missing** — no entry ceremony | missing |
| Study Temple | `components/StudyTemple.tsx` | **missing** — no explanatory layer | missing |
| Somatic HUD | `components/SomaticHud.tsx` | reduced to a small panel | partial |
| Particle field | `components/ParticleField.tsx` | **missing** | missing |
| Audio | `adapters/audioRuntime.ts` — `VOWEL_FREQUENCIES`, `BELL_FREQUENCY`, breath/drone gain | **missing** | missing |
| Hero image | `src/assets/hero.png` | **missing** | missing |
| Existing unit tests | 6 `.test.ts` files | not carried over | missing |

The original's own tests are the cheapest parity guarantee available for this
instrument and should be ported alongside the engines.

---

## Parity matrix — The Monad (Monas Hieroglyphica)

Original: `bookthief666/monas-hieroglyphica`.

**Read this before assuming scope.** Three different numbers are in play and
conflating them would produce exactly the false claim the provenance rules
forbid:

- **24** — theorem plates present as image assets (`theorema-I` … `theorema-XXIV`);
- **5** — entries in `src/data/theoremMeta.ts` (`id`, `numeral`, `title`, `shape`,
  `marginalia`, `scholium`, `bgImage`);
- **13** — entries in `src/data/monasSentences.ts`;
- **6** — construction phases in the current Grimoire XR chamber.

So the original application **has 24 plates but interprets far fewer**. Having
the images does not mean 24 theorems are authored anywhere. Dee's work has 24
theorems; no implementation in this family covers them all.

| Original capability | Source | Current XR | Parity |
| --- | --- | --- | --- |
| 24 theorem plates | `theorema-*.jpg/png/jpeg` | **missing** | missing |
| Title image | `Titleimage.jpg` | **missing** | missing |
| Theorem metadata (5) | `data/theoremMeta.ts` | XR has its own 6-phase model | divergent |
| Latin/English sentences (13) | `data/monasSentences.ts` | XR has 6 authored phase texts | divergent |
| Glyph centrepiece | `components/MonasGlyph.tsx` | present, merged geometry, exploded view | partial |
| Particle manifestation | `components/ParticleManifestation.tsx` (14 KB) | **missing** | missing |
| Background crossfade | `components/BackgroundCrossfade.tsx` | **missing** | missing |
| Etched glyph overlay | `components/EtchedGlyphOverlay.tsx` (8.9 KB) | **missing** | missing |
| Facsimile veil / marginalia / scholium | `FacsimileVeil`, `LivingMarginalia`, `ManuscriptScholium` | **missing** | missing |
| Theorem navigator | `components/TheoremNavigator.tsx` | XR has ADVANCE/RESET only | partial |
| Sentence decoder | `components/SentenceDecoder.tsx` | **missing** | missing |
| Ambient drone | `components/AmbientDrone.tsx` | **missing** | blocked (see copyright) |
| Typography | 4 CDN font families | **missing** | blocked until vendored |

---

## What this slice actually delivered

Scope was one vertical slice for the Chapel: corpus, correct arithmetic, correct
identity, ported provenance, and one end-to-end reading. Deliberately **not**
included: AI Oracle, journal, milestones, cosmic timing, audio, voice, haptics,
particles, CRT/glitch.

Measured with the shipped `?perf=1` probe at PR #29's matched viewport
(877 × 834, flat browser, mono, one view):

| State | Before | After |
| ---: | ---: | ---: |
| Chapel idle | 245 | **246** |
| Chapel after triad draw | not previously measured | **269.9** |

Both under the 300-per-view working ceiling. Adding the whole corpus cost about
one draw call at idle because it is text data, not geometry — the reader only
renders what is on screen.

Bundle: `liber333Corpus.ts` is ~111 KB of source text. The pre-existing >500 kB
chunk warning is unchanged in substance and has not been silenced.

---

## Recommended order for the remaining work

1. **Abulafia ritual core** — the strongest next slice. Its invariants are
   explicit and already unit-tested in the original, so parity is verifiable
   rather than judged. Port `permutationEngine`, `metronomeEngine`,
   `practiceEngine`, `metronomeRuntime` and their tests, then build Ritual Gate /
   Ritual Mode / Study Mode as room states.
2. **Chapel second slice** — AI Oracle as a visibly distinct third voice, then
   journal and recurrence as a persistent archive.
3. **Monas** — only after the owner resolves the audio licence and the fonts are
   vendored. Start with the 24 plates as spatial folios; do not manufacture
   theorem text to fill the gap between 5 authored entries and 24 plates.

Nothing in this document has been verified on a headset. All XR figures are
flat-browser, mono, one view.
