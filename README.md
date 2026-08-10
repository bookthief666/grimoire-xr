# Grimoire XR

Grimoire XR is a VR-first occult grimoire and ritual-instrument environment. The
practitioner stands inside a persistent rotunda and summons different working
chambers around a stationary XR origin rather than navigating a conventional app
or locomoting through a level.

The current foundation distinguishes two kinds of instrument:

- **The Sanctum** — the generative workstation: forge a symbolic deck with
  Gemini, generate optional card art through ComfyUI, lay a spread, consult the
  oracle, and archive a ritual.
- **Authored chambers** — deterministic, source-aware instruments designed to
  remain useful offline. The current set is The Cell, The Monad, and The Chapel
  of Lies.

Built with React 19, TypeScript, Vite, React Three Fiber, Drei, Three.js and
WebXR.

## Requirements

- Node **22.6+**.
- A WebXR headset for immersive VR. The project is developed against Quest-class
  standalone hardware and also runs as a flat browser scene for development.
- `GEMINI_API_KEY` for generative forge/oracle calls.
- ComfyUI environment variables only if card-art generation is required.

## Setup

```bash
npm install
cp .env.example .env.local
```

Then populate the required environment values described in `.env.example`.

## Running

The Vite client and Vercel API handlers are separate processes in development:

```bash
npm run dev
vercel dev
```

`npm run dev` serves the client over HTTPS and exposes it on the LAN for headset
testing. Vite proxies `/api/*` to `http://localhost:3000`; override that target
with `API_PROXY_TARGET` when necessary.

WebXR requires a secure context. On a headset, open the Vite LAN HTTPS URL and
accept the local development certificate.

## Verification

| Command | Purpose |
|---|---|
| `npm test` | Deterministic unit tests for chamber/tool contracts and forge policies |
| `npm run build` | Type-check `src/`, API handlers and Vite config, then produce the client bundle |
| `npm run lint` | Full ESLint audit; legacy foundation debt is currently tracked separately |
| `npm run check` | Blocking qualification: tests + production build |
| `npm run check:full` | Tests + build + full lint audit |
| `npm run dev` | HTTPS Vite development server |
| `npm run preview` | Preview the production bundle |

GitHub Actions uses Node 22. The blocking qualification job runs tests and a
production build. A separate non-blocking lint-audit job keeps inherited lint
and React-purity debt visible until that debt is retired in its own focused
slice.

## Temple architecture

```text
src/
  App.tsx
  engine/
    useGrimoireEngine.ts        live generative ritual state
  services/                     typed API clients
  constants/                    traditions, tarot systems, tones, art styles
  types/grimoire.ts             runtime schemas / domain types
  tools/
    provenance.ts               source-layer contract
    abulafia.ts                 Cell operative reconstruction
    monas.ts                    Monad six-phase operative reconstruction
    liber333.ts                 Chapel deterministic experimental mapping
  scene/
    RitualChamberScene.tsx      temple root
    TempleText.tsx              bundled-font text boundary
    pressable.ts                XR pointer-capture interaction helper
    performance.ts              Quest frame-budget helpers
    rotunda/                    persistent shared floor, colonnade and dome
    chambers/
      ChamberDirector.tsx       room morph / presentation state
      MorphGroup.tsx            Sanctum eye-centered morph wrapper
      SummoningRing.tsx         persistent chamber selector
      registry.ts               instrument registry, capabilities and provenance
      CellChamber.tsx
      MonadChamber.tsx
      ChapelChamber.tsx
    workbench/
      ForgeMenu.tsx
      WorkbenchCards.tsx
      imagePolicy.ts            explicit card-art request policy
      SpreadField.tsx
      SigilDock.tsx
      AltarHardware.tsx
      WorkbenchControls.tsx
      ImagePipelineStatus.tsx
```

There is deliberately no general locomotion in the current foundation. The
`ChamberDirector` dissolves one room and forms another around the practitioner.
This keeps chamber switching comfortable and cheaper for standalone XR.

## Source integrity

Historical source, translation, scholarly commentary, app-authored ritual
reconstruction and experimental correspondence are separate data layers.
Generative AI interpretation may be added on top of a source layer but must not
impersonate or overwrite it.

See [`docs/SOURCE_PROVENANCE.md`](docs/SOURCE_PROVENANCE.md) for the full policy.

Current status:

- **Cell** — operative reconstruction inspired by Abulafian ecstatic Kabbalah;
  exact breath timing and world-axis mapping are application mechanics pending
  source-critical citation.
- **Monad** — the six-stage spatial build is explicitly an operative
  reconstruction, not Dee's twenty-four-theorem sequence and not a source
  transcription.
- **Chapel** — question hashing and chapter-to-Sephira assignment are explicitly
  experimental correspondences; the room uses a 22-link Tree geometry without
  pretending array order is a sourced path-attribution table.

## Image generation policy

Selecting or manifesting a forged card **does not generate art**. Card art is a
separate, explicit operation from the in-world card control. Pending/error cards
may expose `GENERATE ART` / `RETRY ART`; generating/ready cards suppress duplicate
requests.

This separation protects expensive backend work and makes the ritual state
predictable.

## Quest qualification

The baseline standalone-XR target is 72 Hz (about 13.9 ms/frame), with 90 Hz as
a stretch target. Promotion of the temple foundation requires a real-headset pass
covering chamber morphs, controller-ray capture, Sanctum forge behavior, explicit
art generation and every authored chamber.

See [`docs/QUEST_QUALIFICATION.md`](docs/QUEST_QUALIFICATION.md).

## API / environment

`GEMINI_API_KEY` is the only strictly required network credential for the
Sanctum's text generation. Without ComfyUI configuration, Grimoire XR can still
run and forge text; card art is simply unavailable.

```text
api/
  forge.ts                    deck + dossier generation
  oracle.ts                   oracle consultation
  card-image-start.ts         explicit ComfyUI request start
  card-image-status.ts        asynchronous image status
```

## Deployment

The production target is Vercel. `api/*.ts` become serverless handlers and the
Vite build is served as the client. Configure environment variables from
`.env.example` in project settings.

Do not promote the foundation to `main` solely because the web build succeeds.
The Quest/WebXR qualification gate is part of the release contract.
