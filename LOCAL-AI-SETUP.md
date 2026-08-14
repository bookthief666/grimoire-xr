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

COMFYUI_CFG=4
COMFYUI_SAMPLER=dpmpp_2m
COMFYUI_SCHEDULER=karras

AI_QUEUE_MAX=24
AI_PROVIDER_POLL_MS=2000
```

`OLLAMA_KEEP_ALIVE=0` causes Ollama to unload Qwen immediately after each completed text response. The scheduler also requests an unload before handing the machine to ComfyUI. The 8,192-token context reduces the Metal context cache.

The preview preset is the known-good default. A final request may reuse the preview prompt and seed at 832×1216 / 28 steps. Reusing a seed across resolutions improves provenance and repeatability but does not guarantee a pixel-identical composition; a later img2img/refine path will be the stronger composition-preserving finalizer.

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

The health response should report the selected providers as configured, `qwen3:8b` ready, ComfyUI ready on MPS, the Juggernaut checkpoint, the 640×960 / 18-step preview baseline, and an idle scheduler when no job is running.

After changing `server/*.mjs`, restart only `npm run api`; Ollama, ComfyUI, and an existing Quick Tunnel can remain running.

## 4. Preview and final image contract

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

A reproducible final request uses:

```json
{
  "prompt": "...",
  "mode": "final",
  "seed": 424242
}
```

Status responses can include `provider`, `mode`, `seed`, `width`, `height`, `steps`, `cfg`, `sampler`, and `scheduler` alongside the ready `imageUrl`. The Fold client should persist this generation object with the card instead of discarding it.

## 5. Build and test on the Galaxy Z Fold 6

For a native Capacitor build, set `VITE_GRIMOIRE_API_URL` to the working protected HTTPS API address before rebuilding:

```bash
npm run check
npm run mobile:sync
```

In Android Studio, select `SM-F956U` and the `app` configuration. Test in this order:

1. EROS OFF and one ritual.
2. One preview card forge and confirm generation metadata is retained.
3. Re-manifest the preview and confirm it does not unnecessarily rescribe the exegesis.
4. Finalize that preview with its stored prompt and seed.
5. Spirit Box after image generation completes.
6. One Oracle triad while watching `/health`; queue depth may grow, but `resourceScheduler.active` must show only one job.
7. Grand Forge only after the earlier slices complete reliably.

The client never automatically resubmits a lost text or image job. Five consecutive status-poll failures surface an error; an explicit user retry is then required. This prevents hidden work on the Mac from being duplicated after a transient tunnel interruption.
