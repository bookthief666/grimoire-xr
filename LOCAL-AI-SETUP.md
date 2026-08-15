# Local AI scheduler setup

This build runs Qwen3 8B and Juggernaut XL Ragnarok on the same Apple M2 Mac without allowing their Metal-intensive work to overlap. Text and image requests receive opaque job IDs, wait in one FIFO queue, and are polled through short HTTP requests. This also serializes the Oracle's card renders and prevents a Spirit Box request from starting during an image render.

## 1. Configuration

Keep the existing `VITE_GRIMOIRE_API_URL` value in `.env.local`. Replace the local-provider values with:

```dotenv
TEXT_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_CONTEXT_LENGTH=8192
OLLAMA_KEEP_ALIVE=0
OLLAMA_REQUEST_TIMEOUT_MS=900000

IMAGE_PROVIDER=comfyui
COMFYUI_BASE_URL=http://127.0.0.1:8188
COMFYUI_CHECKPOINT=juggernautXL_ragnarokBy.safetensors

# Preview: measured working Apple-M2 baseline.
COMFYUI_WIDTH=640
COMFYUI_HEIGHT=960
COMFYUI_STEPS=18

# Final: higher-quality txt2img preset.
COMFYUI_FINAL_WIDTH=832
COMFYUI_FINAL_HEIGHT=1216
COMFYUI_FINAL_STEPS=28

# Refine Final: img2img strength. Lower values preserve more of the chosen image.
COMFYUI_REFINE_DENOISE=0.28

COMFYUI_CFG=4
COMFYUI_SAMPLER=dpmpp_2m
COMFYUI_SCHEDULER=karras

AI_QUEUE_MAX=24
AI_PROVIDER_POLL_MS=2000
```

`OLLAMA_KEEP_ALIVE=0` causes Ollama to unload Qwen immediately after each completed text response. The scheduler also requests an unload before handing the machine to ComfyUI. The 8,192-token context reduces the Metal context cache.

The preview preset is the known-good default. `FINALIZE` reruns txt2img at 832×1216 / 28 steps with the stored prompt and seed. `REFINE FINAL` instead retrieves the exact generated ComfyUI output on the Mac, stages it into ComfyUI input, scales it to the final preset, VAE-encodes it, and runs img2img at the configured denoise value. This is the stronger composition-preserving path.

## 2. Restart the native Fold stack

After a Mac restart, use these services. If Ollama or the API reports `address already in use`, verify the existing process instead of starting a duplicate.

Terminal 1 — Ollama:

```bash
ollama serve
```

Verify:

```bash
curl -sS http://127.0.0.1:11434/api/tags | python3 -m json.tool
```

Terminal 2 — the existing private ComfyUI installation:

```bash
cd /Users/a/Documents/ComfyUI-Server
source /Users/a/Documents/ComfyUI/.venv/bin/activate
python main.py --listen 127.0.0.1 --port 8188
```

Do not start a second ComfyUI instance. Never expose port 8188 publicly.

Terminal 3 — Grimoire API, from the current project directory:

```bash
cd /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile
npm run api
```

Verify:

```bash
curl -sS http://127.0.0.1:8787/health | python3 -m json.tool
```

Terminal 4 — Quick Tunnel for the installed Capacitor app:

```bash
cloudflared tunnel \
  --edge-ip-version 4 \
  --protocol http2 \
  --url http://127.0.0.1:8787
```

The installed Fold app contains its UI already, so its `VITE_GRIMOIRE_API_URL` must point to this HTTPS API address. A Vite environment value is baked into the native build; when a Quick Tunnel hostname changes, update `.env.local`, run `npm run mobile:sync`, and reinstall the app.

Never set the Fold app to `127.0.0.1`, `localhost`, port 11434, or port 8188. On the phone those loopback names point to the phone itself, and Ollama/ComfyUI must remain private.

### Optional browser/PWA/Quest preview

For a same-origin browser or Quest preview, run:

```bash
npm run vr:preview
```

and tunnel port 4173 instead:

```bash
cloudflared tunnel --edge-ip-version 4 --protocol http2 --url http://127.0.0.1:4173
```

That preview proxies `/api` and `/health` to the Node API. Keep `VITE_GRIMOIRE_API_URL` blank for this same-origin browser path and put only the tunnel hostname in `GRIMOIRE_PREVIEW_ALLOWED_HOSTS`.

## 3. Verify providers and scheduler

```bash
ollama list
curl -sS http://127.0.0.1:8188/system_stats | python3 -m json.tool
curl -sS http://127.0.0.1:8787/health | python3 -m json.tool
```

The health response should report the selected providers as configured, `qwen3:8b` ready, ComfyUI ready on MPS, the Juggernaut checkpoint, the 640×960 / 18-step preview baseline, plus the final/refine dimensions and refine denoise. An idle scheduler should report no active job.

After changing `server/*.mjs`, restart only `npm run api`; Ollama, ComfyUI, and an existing Quick Tunnel can remain running.

## 4. Preview, final, and refine contracts

The asynchronous image endpoint accepts the legacy request:

```json
{ "prompt": "..." }
```

which defaults to preview, or an explicit request:

```json
{
  "prompt": "...",
  "mode": "preview"
}
```

A reproducible seed-only final request uses:

```json
{
  "prompt": "...",
  "mode": "final",
  "seed": 424242
}
```

A composition-preserving refine request uses only the small server-side Comfy reference, not the base64 image payload:

```json
{
  "prompt": "...",
  "mode": "refine",
  "seed": 424242,
  "sourceImage": {
    "filename": "Grimoire_00001_.png",
    "subfolder": "",
    "type": "output"
  }
}
```

The server validates that refine references point only to generated ComfyUI outputs. It fetches the source internally from ComfyUI, uploads it back to a single overwriteable staging input, then builds the img2img workflow. This avoids sending a large data URL back through the Fold tunnel and avoids accumulating one staging file per refine operation.

Status responses can include `provider`, `mode`, `seed`, `width`, `height`, `steps`, `cfg`, `sampler`, `scheduler`, `denoise`, and `providerImage` alongside the ready `imageUrl`. The Fold client persists this generation object with the card.

## 5. Build and test on the Galaxy Z Fold 6

For a native Capacitor build, set `VITE_GRIMOIRE_API_URL` to the working protected HTTPS API address before rebuilding:

```bash
npm run check
npm run mobile:sync
```

In Android Studio, select `SM-F956U` and the `app` configuration. Test in this order:

1. EROS OFF and one ritual.
2. Forge one preview card and confirm generation metadata is retained.
3. Re-manifest the preview and confirm it does not unnecessarily rescribe the exegesis.
4. Confirm `FINALIZE` still produces the seed-only 832×1216 / 28-step render.
5. Re-manifest a preview after the refine-capable API is running, then choose `REFINE FINAL`.
6. Confirm the refined card reports `REFINE`, 832×1216, 28 steps, the retained seed, and the configured denoise value.
7. Visually compare the source Preview and Refine result: the latter should preserve pose/layout more strongly than `FINALIZE` while adding final-size detail.
8. Spirit Box after image generation completes.
9. One Oracle triad while watching `/health`; queue depth may grow, but `resourceScheduler.active` must show only one job.
10. Grand Forge only after the earlier slices complete reliably.

The client never automatically resubmits a lost text or image job. Five consecutive status-poll failures surface an error; an explicit user retry is then required. This prevents hidden work on the Mac from being duplicated after a transient tunnel interruption.
