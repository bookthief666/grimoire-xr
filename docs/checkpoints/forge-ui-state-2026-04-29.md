# Forge UI State Checkpoint — 2026-04-29

## Current stable state

The forge UI has been migrated to the new canonical selection model.

Canonical controls now visible in the in-world forge menu:

- Tarot System
- Style Family
- Art Style
- Eros Level

The forge workbench now includes:

- cascading Style Family → Art Style controls
- active forge configuration readout
- glyph-styled forge dials
- aligned forge/readout panel styling
- mode/state visual energy modulation
- cleanup of malformed JSX destructuring formatting

## Canonical model

The canonical creative controls are:

- `tarotSystem`
- `artStyleFamily`
- `artStyle`
- `erosLevel`

`artStyleFamily` is a UI grouping model. `artStyle` is the actual style selection used by prompt compilation.

Changing `artStyleFamily` should select the first style in that family.

Changing `artStyle` directly should update `artStyleFamily` to match the chosen style.

## Legacy model

`visualStyle` is legacy.

It has been removed from the visible workbench forge-menu wiring, but it still remains in:

- engine state
- schema compatibility
- archive restoration
- API compatibility
- legacy image request payloads

Do not remove `visualStyle` globally until the image pipeline has been validated.

`erosField` remains intentionally active.

It is still used for scene visual effects, especially the astrolabe/atmospheric layer. Do not remove it. It is no longer the canonical erotic intensity selector; `erosLevel` is canonical.

## Prompt compiler status

`api/forge.ts` now uses:

- `getTarotSystem`
- `getErosLevel`
- `getArtStyle`

The forge text prompt compiler treats the new model as primary and legacy fields as secondary hints.

This is merged to `main`.

## Image compiler status

The image prompt compiler is still pending final validation.

The branch `agent/image-prompt-compiler-style-model` attempted to wire the image route to:

- `tarotSystem`
- `erosLevel`
- `artStyle`

This branch touches `api/card-image-start.ts` and should not be merged until runtime testing confirms:

- Vercel preview can reach `COMFYUI_BASE_URL`
- Cloudflare tunnel is current
- `/api/card-image-start` returns a valid ComfyUI `promptId`
- `/api/card-image-status` returns the generated image URL

## Protected systems

Do not modify these casually:

- `api/card-image-start.ts`
- `api/card-image-status.ts`
- `api/comfy/workflow_api.json`
- image texture rendering
- ComfyUI workflow structure

Only touch them during a dedicated image-pipeline branch.

## Recent merged UI work

Recent stable UI milestones:

- cascading art style forge controls
- visual-style workbench wiring removal
- forge prompt compiler style model
- ornate forge configuration readout
- glyph forge controls
- forge panel polish
- forge mode/state visual energy
- workbench JSX cleanup

## Next safe branches

Recommended next branches:

1. `agent/forge-ui-screenshot-review`
   - visual inspection only
   - no code unless spacing defects are obvious

2. `agent/image-prompt-runtime-fix`
   - only when Mac ComfyUI and Cloudflare tunnel are available
   - finish validating `agent/image-prompt-compiler-style-model`

3. `agent/visual-style-final-deprecation`
   - only after image runtime branch is merged and stable
   - remove or archive remaining `visualStyle` compatibility carefully

4. `agent/archive-config-versioning`
   - add explicit config version metadata before more schema cleanup
