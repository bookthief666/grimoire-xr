# Refine Img2Img 0.12

This stacked slice adds a composition-preserving finalization path for generated Tarot cards without changing the existing Preview or seed-only Finalize behavior.

## Image paths

- **Preview** — 640×960, 18 steps. Fast measured M2 baseline.
- **Finalize** — 832×1216, 28 steps. Fresh txt2img using the stored prompt and seed.
- **Refine Final** — 832×1216, 28 steps, default denoise 0.28. The exact current ComfyUI output is retrieved server-side, staged into ComfyUI input, scaled to the final preset, VAE-encoded, and used as the img2img latent source.

## Provenance contract

Ready ComfyUI jobs now retain a small `providerImage` reference beside the base64 `imageUrl`. The Fold stores that reference in `card.generation` and sends it back only when the user explicitly chooses Refine. The large image data URL is never posted back through the tunnel.

The API accepts only generated ComfyUI `output` references for refinement and rejects traversal or arbitrary input references. The scheduler still serializes all Metal-intensive work, so the staging filename can be overwritten instead of creating an unbounded collection of temporary refine inputs.

## Fold behavior

A card created before this slice has no provider image reference. Re-manifest it once after the refine-capable API is running; the new Preview will capture its ComfyUI reference and enable **REFINE FINAL**.

Refine reuses the card's existing exegesis, visual prompt, and seed. It does not invoke Qwen again. A refined card records `mode=refine`, final dimensions, steps, sampler/scheduler, denoise, and the new output reference. **REFINE AGAIN** can then use that refined result as the next img2img source.

## Acceptance

1. Run `npm run check` after applying the guarded integration patch.
2. Restart only the Node API so the new ComfyUI workflow is loaded.
3. Confirm `/health` reports final/refine dimensions and the refine denoise value.
4. On the Fold, re-manifest one Preview after the new API is running.
5. Confirm the card exposes **REFINE FINAL**.
6. Run Refine and verify `REFINE · 832×1216 · 28 STEPS · SEED … · DENOISE 0.28`.
7. Compare it against seed-only Finalize: Refine should retain the chosen Preview's pose and layout more strongly.
8. Do not Grand Forge until this single-card slice is accepted.
