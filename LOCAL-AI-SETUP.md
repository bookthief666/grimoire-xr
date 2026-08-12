# Local AI scheduler setup

This build runs Qwen3 8B and Juggernaut XL Ragnarok on the same Apple M2 Mac without allowing their Metal-intensive work to overlap. Text and image requests receive opaque job IDs, wait in one FIFO queue, and are polled through short HTTP requests. This also serializes the Oracle's three card renders and prevents a Spirit Box request from starting during an image render.

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
COMFYUI_WIDTH=640
COMFYUI_HEIGHT=960
COMFYUI_STEPS=18
COMFYUI_CFG=4
COMFYUI_SAMPLER=dpmpp_2m
COMFYUI_SCHEDULER=karras

AI_QUEUE_MAX=24
AI_PROVIDER_POLL_MS=2000
```

`OLLAMA_KEEP_ALIVE=0` causes Ollama to unload Qwen immediately after each completed text response. The scheduler also requests an unload before handing the machine to ComfyUI. The 8,192-token context is half the earlier 16,384-token allocation and materially reduces the Metal context cache.

## 2. Start the four services

Terminal 1 — Ollama:

```bash
/usr/local/bin/ollama serve
```

Terminal 2 — the existing private ComfyUI installation:

```bash
cd /Users/a/Documents/ComfyUI-Server
source /Users/a/Documents/ComfyUI/.venv/bin/activate
python main.py --listen 127.0.0.1 --port 8188
```

Do not start a second ComfyUI instance. The existing database and port 8188 are shared by the installation.

Terminal 3 — Grimoire API, from the current project directory:

```bash
cd /path/to/grimoire-capacitor-mobile
npm run api
```

Terminal 4 — production preview for browser, PWA, Fold, and Quest testing:

```bash
npm run vr:preview
```

Terminal 5 — single-origin HTTPS tunnel to the production preview:

```bash
cloudflared tunnel --edge-ip-version 4 --protocol http2 --url http://127.0.0.1:4173
```

Copy only the generated hostname (without `https://` or `/vr`) into the server-only `.env.local` value `GRIMOIRE_PREVIEW_ALLOWED_HOSTS`, then restart the preview. Open the resulting HTTPS URL with `/vr` appended exactly once. Leave `VITE_GRIMOIRE_API_URL` blank for this same-origin path.

Never tunnel ports 11434 or 8188. Their raw APIs do not enforce the Grimoire request boundary. A native Capacitor build cannot use the preview proxy; for native testing, expose or deploy only the protected Node API on port 8787 and set its stable HTTPS address as `VITE_GRIMOIRE_API_URL` before rebuilding.

## 3. Verify the providers and scheduler

```bash
ollama list
curl -sS http://127.0.0.1:8188/system_stats | python3 -m json.tool
curl -sS http://localhost:8787/health | python3 -m json.tool
```

The health response should report:

```json
{
  "configured": true,
  "textProvider": "ollama",
  "textConfigured": true,
  "imageProvider": "comfyui",
  "imageConfigured": true,
  "ollama": {
    "ready": true,
    "model": "qwen3:8b"
  },
  "resourceScheduler": {
    "active": null,
    "queueDepth": 0
  }
}
```

Test text through the compatibility endpoint:

```bash
curl -sS -X POST http://localhost:8787/api/text \
  -H 'Content-Type: application/json' \
  --data '{"prompt":"Return only this JSON object: {\"ok\":true}","isJson":true}' |
python3 -m json.tool
```

## 4. Build and test on the Galaxy Z Fold 6

For the browser/PWA route, keep `VITE_GRIMOIRE_API_URL` blank and update only `GRIMOIRE_PREVIEW_ALLOWED_HOSTS` when a Quick Tunnel hostname changes. For a native Capacitor build, update `VITE_GRIMOIRE_API_URL` to the protected API address before rebuilding:

```bash
npm run check
npm run mobile:sync
```

In Android Studio, select `SM-F956U` and the `app` configuration. Test in this order:

1. EROS OFF and one ritual.
2. One individual card forge.
3. Spirit Box after the image completes.
4. One Oracle triad while watching `/health`; queue depth may grow, but `resourceScheduler.active` must show only one job.
5. Grand Forge only after the earlier slices complete reliably.

The client never automatically resubmits a lost text or image job. Five consecutive status-poll failures surface an error; an explicit user retry is then required. This prevents hidden work on the Mac from being duplicated after a transient tunnel interruption.
