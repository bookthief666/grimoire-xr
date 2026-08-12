# Showcase & Continuity 0.8 · Complete Instrument

The `/vr` route now contains a complete flat command console for every original Grimoire tool. It is the readable control surface for desktop and mobile; selecting a tab also turns the spatial temple toward its matching planetary court.

## Away from the Mac

Choose **Use Phone Demo · No Mac** on the Ritual tab. The app locally creates a deterministic 78-card rehearsal deck, symbolic SVG relics, Oracle readings, Spirit responses, statistics, and portable archives. These use the real interface and persistence paths but are not presented as AI output. A gold **Phone Demo Active** banner remains visible and exports include `operationMode: provider-free-demo`.

On the first visit, the five-step **Showcase Rite** opens automatically. It turns the spatial temple and command console together through Ritual, Deck, Oracle, Spirit, and Archive without launching a costly operation. End it at any time; **Start Showcase Rite** in the footer runs it again.

Choose **Return to Live Local AI** when the Mac is reachable, recheck providers, and re-awaken the subject if you want Qwen to replace the rehearsal ritual. See [FOLD-6-TEST-GUIDE.md](FOLD-6-TEST-GUIDE.md) for closed and unfolded acceptance tests.

## Fast Mac start

Prerequisites: Ollama is running with `qwen3:8b`, ComfyUI is listening on port 8188 with `juggernautXL_ragnarokBy.safetensors`, and `.env.local` is configured from `.env.example`.

Open three Terminal windows in the project folder.

Terminal 1 — start or verify Ollama:

```bash
open -a Ollama
curl -sS http://127.0.0.1:11434/api/tags | python3 -m json.tool
```

Terminal 2 — start ComfyUI using the command for the existing installation, then verify it in the Grimoire health response.

Terminal 3 — start the protected API:

```bash
npm run api
```

Terminal 4 — build and preview the real production route:

```bash
npm run check
npm run vr:preview
```

Open `http://127.0.0.1:4173/vr` and perform a hard refresh with `Command-Shift-R` after each new build. The Ritual tab should show both the text and image providers as ready. **Recheck Local Providers** refreshes the status immediately.

## The five-station console

### Ritual

1. Name a person, deity, text, image, or living question. The suggestion chips are optional.
2. Choose tradition, aesthetic, Eros intensity, intellectual depth, and Astral Weather.
3. Select **Awaken the Complete Grimoire**. Ollama creates the dossier, ruling Genius, questions, and all 78 subject-specific arcana.
4. **Manifest Ruling Portrait** is deliberately separate because it starts ComfyUI.
5. **Audio On** starts the low-volume ritual drone and enables operation tones. Audio Off is fully silent.

### Deck · 78

- Search or select any Major or Minor Arcanum.
- **Scribe Exegesis** generates the intellectual card and metadata through Ollama.
- **Manifest Image** sends only that card to ComfyUI.
- **Inspect + Add Patina** records repeated attention in Arcane Statistics.
- **Copy Visual Prompt** exposes the exact reusable visual instruction.
- **Return to Prima Materia** clears only the selected forged card.

Grand Forge is sequential so Ollama and ComfyUI never compete for Metal resources. Start with **Forge Next 3**. **Forge Next 10** is a longer unattended slice. **Forge All Missing** requires the arm checkbox. **Pause After Current Card** never abandons a running provider job; it stops before submitting the next card. Keep the page open and export periodically. Generated bitmaps are intentionally omitted from the small automatic browser snapshot. A downloaded JSON archive preserves its embedded images and can restore them for the current session, so keep that file as the durable image-bearing backup. In Phone Demo the same controls create lightweight local SVG rehearsal relics, making the full circuit practical to test on the Fold.

### Oracle

1. Choose Triad, Hexagram, or Cross and write a question.
2. Use **Draw Random Spread**, or manually select a card in the 78-card tray and then select its position on the cloth.
3. Select a filled position with no tray card selected to clear it.
4. Choose **Cast Reading**. The exact positional order is sent to Ollama and appears spatially at Jupiter.

### Spirit

- Type a message and press Return to send; use Shift-Return for a new line.
- **Dictate** uses browser speech recognition when available.
- The last 24 local messages provide conversational continuity.
- **Clear Local Dialogue** removes the current Spirit history.
- The interface labels every response as an imaginative, historically informed simulation rather than an authentic quotation or supernatural claim.

### Archive

- Arcane Statistics show inscribed and manifested counts, patina, operations, the dominant card, the dominant alchemical current, and recurring Spirit echoes.
- The Manifested Reliquary presents every image as a thumbnail. Open it for a full-screen card, swipe or use arrow keys, copy its prompt, or return that exact arcanum to the Forge.
- **Download JSON** preserves structured data.
- **Download HTML Grimoire** creates a portable, readable book containing the currently forged images.
- **Share / Save Archive** invokes the browser share sheet when file sharing is supported, downloads otherwise, and uses the native Capacitor share sheet on Android and iOS.
- **Restore JSON Archive** validates the Grimoire format, normalizes the full 78-card ritual, rejects unsafe image URLs and foreign records, then restores the subject, current, portrait, cards, Oracle, Spirit history, operations, and completed courts.
- **Install Grimoire XR** appears when a supported browser receives the production PWA install event. The installed shell and Phone Demo work offline; live providers still require the protected Mac bridge.

Archive restoration never executes imported HTML or scripts. Only the known Grimoire JSON format and safe embedded image data URLs are accepted.

## Phone and Quest

For a native phone build, set `VITE_GRIMOIRE_API_URL` in `.env.local` to the HTTPS address of the protected Grimoire API, never to Ollama or ComfyUI directly. Then run:

```bash
npm run mobile:sync
npm run android:open
```

For Quest, leave `VITE_GRIMOIRE_API_URL` blank, run `npm run vr:preview`, and tunnel the preview so `/vr`, `/api`, and `/health` remain one HTTPS origin:

```bash
cloudflared tunnel --url http://localhost:4173
```

See [MOBILE-SETUP.md](MOBILE-SETUP.md), [LOCAL-AI-SETUP.md](LOCAL-AI-SETUP.md), and [VR-PROTOTYPE.md](VR-PROTOTYPE.md) for the complete platform procedures.

## If a control is disabled

- In Live Local AI, **Awaken** requires a subject and a ready Ollama provider; Phone Demo needs only a subject.
- In Live Local AI, **Manifest** requires ComfyUI; Phone Demo creates a local labeled SVG relic.
- **Oracle** and **Spirit** require an awakened ritual and either Ollama or Phone Demo.
- Grand Forge requires an awakened deck, no operation already running, and either both live providers or Phone Demo.
- Enter Immersive VR requires a WebXR browser and HTTPS on a headset. Desktop mode remains fully usable without WebXR.

The status strip always reports the current queue phase. Do not click a generation action repeatedly while it says queued or running; one click creates one server job and the UI polls that job to completion.
