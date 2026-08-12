# Grimoire OS · Mobile + VR

This is the complete Tarot/Grimoire React application packaged as a Vite + React + Tailwind + Capacitor app for iOS and Android. The UI remains HTML/CSS, Framer Motion, Web Audio, and Canvas; it has not been converted to React Native.

The web build also contains a Quest-oriented WebXR experience at `/vr`: the **Temple of the Unremembered Name**, with seven planetary courts connected to the same local Ollama/ComfyUI scheduler. Showcase & Continuity 0.8 adds an automatic first-run Showcase Rite, swipeable manifested-card reliquary, validated JSON restoration, and an installable offline phone shell on top of the provider-free Demo Current and Galaxy Z Fold layouts. The 2D and VR experiences are route-split, so the Three.js runtime is not loaded by the original app. Start with [SHOWCASE-CONTINUITY-0.8.md](SHOWCASE-CONTINUITY-0.8.md) and [COMPLETE-INSTRUMENT-GUIDE.md](COMPLETE-INSTRUMENT-GUIDE.md); use [FOLD-6-TEST-GUIDE.md](FOLD-6-TEST-GUIDE.md) and [VR-PROTOTYPE.md](VR-PROTOTYPE.md) for device acceptance.

The supplied application source is integrated at `src/App.jsx`. Both native projects are generated and synchronized under `ios/` and `android/`.

## Run locally

Requirements: Node.js 22 or newer.

```bash
cp .env.example .env.local
npm install
```

The default development stack is fully local: Qwen3 8B through Ollama for text and Juggernaut XL Ragnarok through ComfyUI for images. Copy the measured Apple-M2 settings from `.env.example`; no provider secret is compiled into the app.

Start Ollama and the existing ComfyUI installation before the API. Browser, PWA, Fold, and Quest testing should expose only the production preview on port 4173, which keeps `/vr`, `/api`, and `/health` on one HTTPS origin. A native Capacitor build instead needs a stable HTTPS deployment of the validated Node API on port 8787. Never expose Ollama or ComfyUI directly. See [LOCAL-AI-SETUP.md](LOCAL-AI-SETUP.md) for the exact commands and health checks.

Start the API proxy in one terminal:

```bash
npm run api
```

Start Vite in another:

```bash
npm run dev
```

Vite proxies browser requests from `/api` to `http://localhost:8787`.

## Build and test

```bash
npm run check
npm run mobile:sync
```

`check` runs the regression tests and a production Vite build. `mobile:sync` rebuilds and copies `dist/` plus native plugin configuration into both platform projects.

## Preview the VR atrium

After `npm run build`, start the production preview and open `http://localhost:4173/vr` on the development computer:

```bash
npm run vr:preview
```

The preview server proxies same-origin `/api` and `/health` calls to the local Grimoire API on port 8787. A headset requires an HTTPS origin; follow the single-tunnel Quest procedure in [VR-PROTOTYPE.md](VR-PROTOTYPE.md).

The `/vr` Ritual tab includes live Ollama, ComfyUI, queue, and WebXR readiness plus a manual provider recheck. The other tabs expose Deck · 78, Oracle, Spirit, and Archive without requiring a headset.

**Use Phone Demo · No Mac** keeps the entire interaction circuit available without providers. It generates deterministic rehearsal text and local SVG relics, preserves the same application state and archives, and labels every result as Demo Current. Switching back restores the real Qwen/ComfyUI path without changing its API boundary.

For an installable/offline Fold build, use the production preview rather than the Vite development server. Open the secure or device-local `/vr` URL, visit Archive, and choose **Install Grimoire XR** when offered. The service worker caches only the application shell and generated static assets; `/api`, `/health`, Ollama, and ComfyUI routes are explicitly bypassed.

## Build native apps

A phone cannot reach the development machine through its own `localhost`. Expose the Mac's Node API on port 8787 through the existing HTTPS tunnel, then set its public address in `.env.local`:

```dotenv
VITE_GRIMOIRE_API_URL=https://api.your-domain.example
```

Keep Ollama on `127.0.0.1:11434` and ComfyUI on `127.0.0.1:8188`; never tunnel either raw provider. Add the app/web origins to `ALLOWED_ORIGINS`, then run:

```bash
npm run mobile:sync
npm run ios:open       # macOS only
npm run android:open
```

Before a store release, replace the placeholder application ID `com.grimoire.app` in `capacitor.config.ts` with an identifier you control, then regenerate the native platforms before signing.

## Included mobile work

- Capacitor Haptics replaces `navigator.vibrate`, including iOS support.
- Black status bar with light foreground content.
- Dynamic safe-area padding for the notch, Dynamic Island, rounded corners, and home indicator.
- Native keyboard resize behavior and a keyboard-safe Spirit Box composer.
- Selection/callout/tap-highlight suppression and double-tap zoom prevention without disabling accessibility pinch zoom.
- A single device-pixel-ratio-aware Canvas animation loop with proper cleanup.
- Native Filesystem + Share Sheet archive export on iOS and Android.
- Locally bundled Press Start 2P and VT323 fonts for offline startup.
- A validated server boundary with origin checks, rate limiting, opaque asynchronous job IDs, and short polling requests.
- A FIFO Metal-resource scheduler that prevents Ollama and ComfyUI inference from overlapping.
- Qwen3 8B at an 8,192-token context with immediate unload, plus the measured 640×960/18-step SDXL preset.
- Regression fixes for Oracle return/failure and reading-cloth card ID zero.

Read [MOBILE-SETUP.md](MOBILE-SETUP.md) for the complete from-scratch, Xcode, Android Studio, configuration, and release walkthrough.
