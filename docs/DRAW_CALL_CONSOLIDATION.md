# Draw-call consolidation evidence

Last measured: 2026-08-10 on `codex/quad-draw-consolidation`, based on
`07b6303f320f8ff345bc4b57c22a61f48d3e6a1b` (draft PR #28).

## Evidence tier and method

These are **flat in-app-browser, mono, one-view** measurements. They are useful
for comparing draw submissions at the same viewport; they are not Fold 6 or
Quest 3 performance evidence, and the browser-capped frame times are not used.

Both the parent and optimized builds were run side by side at 877 × 834. Each
capture used the shipped `?perf=1&hud=1` probe after an eight-second warm-up.
The parent was checked out directly at `07b6303`. For attribution only, the
probe's WebGL entry-point wrappers were temporarily extended to bucket draw
composition; that diagnostic extension is not part of the retained runtime.

| Chamber state | Parent draws/view | Optimized draws/view | Delta |
| --- | ---: | ---: | ---: |
| Sanctum idle | 369 | 267 | −102 (−27.6%) |
| Cell idle instrument | 214 | 214 | 0 |
| Monad point phase | 178 | 178 | 0 |
| Monad completed glyph | 329 | 187 | −142 (−43.2%) |
| Chapel idle instrument | 245 | 245 | 0 |

The same composition pass also established that permanently mounted room
geometry was not the remaining Sanctum bottleneck. Within the idle workbench,
removing one cluster at a time changed the parent count by: sigil dock 92,
deck tray 37, astrolabe 31, chrome rails 12, and table hexagram 8 draws.

## Retained change

The scene now builds static planar ornament as indexed `BufferGeometry` rather
than one mesh per two-triangle bar:

- the Sanctum chrome rails are one vertex-coloured additive draw unit;
- the astrolabe and deck-tray tick rings each use one merged bar geometry;
- each sigil button keeps its independent hit target, plaque, state, and text,
  while its five additive accents share one geometry;
- the Monad's line, 48-segment circle, 24-segment crescent, and two-bar cross
  each remain a separate construction layer for the exploded view, but every
  layer is submitted as one merged geometry.

Additive opacity is baked into vertex colour, matching the established bay
instancing technique. Every imperatively constructed geometry is disposed on
unmount. Tests verify proportional vertex/index counts, plane/depth placement,
premultiplied light energy, and rejection of degenerate segments.

Matched before/after screenshots were captured for all four chambers. Pixel
comparison remained below 0.5 mean absolute channel levels in every capture;
differences were limited to expected animation/probe timing. The Cell and
Chapel scene implementations were not changed.

## Evidence still required

The Fold 6 and Quest 3 gates in `QUEST_QUALIFICATION.md` remain entirely open.
In particular, no result above establishes stereo cost, controller ergonomics,
72 Hz, thermals, or WebGL-context stability. The first Quest capture must record
`viewCount`, `averageDrawCallsPerView`, and `multiviewExtension` for every
chamber before the remaining budget can be interpreted.
