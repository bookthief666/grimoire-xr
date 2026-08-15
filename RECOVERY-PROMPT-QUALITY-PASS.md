# Fold 6 Recovery + Structured Prompt Quality Pass

This stacked slice sits on top of the device-validated Preview/Final and img2img Refine work. It addresses two quality problems without changing the measured ComfyUI render presets.

## 1. Interrupted-job recovery

The Node API keeps job state in memory. Restarting `npm run api` invalidates previously issued job IDs. A missing status job is therefore terminal, not transient.

New behavior:

- `/api/text/status` and `/api/image/status` return `404` with `code: "JOB_MISSING"` when a job no longer exists.
- the client preserves HTTP status/code on API errors;
- a missing job stops polling immediately and surfaces a deliberate-retry message;
- network failures and upstream 5xx failures remain retryable for up to five consecutive polls;
- the client still never automatically resubmits an expensive text/image job.

This prevents the repeated stale-job 404 loop observed after restarting the Mac API while the Fold still had active polling promises.

## 2. Structured Tarot image prompt compiler

New card images use prompt schema `tarot-structured-v1` instead of the previous flat concatenation.

The compiler separates:

- canonical Tarot card identity;
- the current invocation subject;
- Tarot lineage/tradition;
- generated composition and iconography;
- Hebrew / astrological / alchemical / spirit correspondences;
- selected art direction and aesthetic register;
- Eros register;
- framing and focal hierarchy;
- lighting and material detail;
- explicit visual constraints.

Existing cards keep their exact stored `promptUsed` during Re-Manifest, Finalize, and Refine. Legacy cards without prompt provenance are labeled internally as `legacy-flat-v1`; newly compiled cards are labeled `tarot-structured-v1`.

The prompt compiler does not add another model call. Qwen still writes the exegesis/meta/visual once; the compiler deterministically turns those fields into the image prompt.

## Guardrails

- Preview remains 640×960 / 18 steps.
- Final remains 832×1216 / 28 steps.
- Refine remains 832×1216 / 28 steps with default denoise 0.28.
- Juggernaut XL Ragnarok, CFG 4, DPM++ 2M, and Karras remain unchanged.
- no change to the single Metal-intensive FIFO scheduler;
- no automatic job resubmission;
- no merge to `main` from this unrelated checkpoint history.

## Local verification

After switching to `agent/fold6-recovery-prompt-compiler`:

```bash
node scripts/apply-fold6-recovery-prompt-compiler.mjs
npm run check
```

The guarded patcher performs every exact-match transformation in memory before writing either `src/App.jsx` or `server/index.mjs`. If any expected source block has drifted, it aborts without writing either file.

## Device acceptance

1. Restart the Node API and open the Fold app with no active generation. Forge one brand-new card and confirm the Visual Prompt now contains the structured sections such as `SUBJECT`, `INVOCATION SUBJECT`, `TAROT SYSTEM`, `COMPOSITION AND ICONOGRAPHY`, `FRAMING`, and `CONSTRAINTS`.
2. Confirm Preview, Re-Manifest, Finalize, and Refine still behave as before and retain the exact stored prompt for the card.
3. Start one text or image operation, restart only the Node API while the Fold is polling, and confirm the client fails that operation promptly with an interrupted/expired message instead of emitting the same 404 five times.
4. Deliberately retry the operation and confirm a new job is submitted only after that explicit user action.
