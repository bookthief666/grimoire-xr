# Fold 6 Local AI Observability + Acceptance Harness

This stacked slice does not alter the validated rendering presets. It adds operational visibility and a repeatable end-to-end acceptance harness before any further ControlNet, IP-Adapter, LoRA, or model-complexity work.

## What changes

### API capability contract

`GET /health` now exposes an `api` object describing the actual server contract in use:

- protocol version;
- async-job support;
- `JOB_MISSING` recovery contract;
- queue and timing telemetry availability;
- current structured Tarot prompt schema;
- selected text/image providers;
- supported image modes;
- whether a ComfyUI provider-image reference can be retained for refine.

This makes stale native builds and stale Mac API processes easier to diagnose without guessing which branch is currently running.

### Live job progress

Image work now surfaces meaningful status changes instead of one static spinner label:

- queued, including FIFO queue position when applicable;
- preparing the local GPU / unloading the text model;
- sampling Preview;
- sampling Final;
- refining the source image;
- transient reconnect attempts.

Ready image metadata also retains queue/run/elapsed timing telemetry. The focused-card metadata line displays the completed render duration.

### Repeatable local-AI QA

Two scripts are available:

```bash
npm run qa:ai:contracts
npm run qa:ai
```

`qa:ai:contracts` is fast. It validates `/health` capability metadata and confirms a deliberately missing image job returns HTTP 404 with `code: JOB_MISSING`.

`qa:ai` performs the contract checks and then executes three real ComfyUI renders with one fixed prompt and seed:

1. Preview at the configured Preview preset.
2. Seed-matched Final at the configured Final preset.
3. Composition-preserving Refine from the exact Preview provider image.

The harness asserts mode, seed, width, height, steps, denoise, provider-image provenance, and timing telemetry. It writes a local comparison artifact under `qa-output/`:

- `preview.png`
- `final.png`
- `refine.png`
- `report.json`
- `index.html`

`qa-output/` is ignored by Git and must not be committed.

## Expected local workflow

After switching to `agent/fold6-ai-observability-qa`:

```bash
node scripts/apply-fold6-ai-observability-qa.mjs
npm run check
```

Restart only the Node API after the server patch:

```bash
npm run api
```

In another Terminal:

```bash
npm run qa:ai:contracts
npm run qa:ai
```

The full QA script intentionally runs three real image generations, so it can take several minutes on the M2. It never retries a submission automatically.

## Render guardrails

This pass keeps the accepted image parameters unchanged:

- Preview: 640×960 / 18 steps.
- Final: 832×1216 / 28 steps.
- Refine: 832×1216 / 28 steps.
- Refine denoise: 0.28 by default.
- CFG: 4.
- Sampler: DPM++ 2M.
- Scheduler: Karras.
- Checkpoint: Juggernaut XL Ragnarok.
- one shared Metal-intensive FIFO queue.

## Acceptance boundary

Do not merge this stacked branch merely because unit/build tests pass. Acceptance requires:

1. `npm run check` green;
2. `npm run qa:ai:contracts` green against the restarted API;
3. `npm run qa:ai` green and a visual inspection of the generated `index.html` comparison;
4. one Fold 6 card operation confirming live queue/preparing/sampling labels and completed render timing;
5. the previously added immediate `JOB_MISSING` interruption behavior still works after an API restart.

Only after this observability layer is accepted should the image system move to more complex conditioning such as IP-Adapter, ControlNet, or LoRAs.
