# Grimoire XR · Showcase & Continuity 0.8

This pass makes the complete instrument easier to discover, demonstrate, carry, and restore. It does not add another AI provider or silently automate expensive generation.

## What is new

- **Showcase Rite:** an automatic, dismissible first-run path through Ritual, Deck, Oracle, Spirit, and Archive. Each step turns the spatial temple toward the matching court. Run it again from the console footer.
- **Manifested Reliquary:** Archive now displays every generated image as a card gallery. Open a card full-screen, swipe or use arrow keys, inspect metadata and patina, copy its visual prompt, or send it back to the Forge.
- **Portable restoration:** **Restore JSON Archive** accepts only `grimoire-xr-archive-v1`, normalizes the ritual back to 78 cards, filters records and court IDs, and accepts only safe embedded image data URLs. It restores the subject, creative current, ritual, portrait, forged deck, Oracle, Spirit history, operations, and completed courts.
- **Installable phone shell:** the production web build contains a standalone manifest, 192/512 pixel launcher art, and an offline service worker. It caches the application shell and generated frontend assets but explicitly bypasses live provider routes.
- **Offline Phone Demo:** the home-screen app can reopen without a network and rehearse the complete local SVG/text circuit. Qwen and ComfyUI still require the protected Mac bridge.

## Fast update from 0.7

After applying the 0.8 patch or replacing the project with the full 0.8 archive:

```bash
npm ci
npm run check
npm run mobile:sync
```

No new npm dependency was added. `mobile:sync` copies the new gallery, restoration code, manifest, icons, and production assets into Android and iOS.

## Browser test

Use a production preview so the service worker and install flow are active:

```bash
npm run check
npm run vr:preview
```

Open `http://127.0.0.1:4173/vr` on the same device.

1. On a fresh browser profile, verify Showcase step I is open and Ritual is selected.
2. Select **Next Court** four times and confirm the temple turns to Forge, Jupiter, Saturn, and Luna with the tab.
3. Enable **Use Phone Demo · No Mac**, awaken a subject, and manifest at least three cards.
4. Open Archive and select a gallery thumbnail. Swipe left/right, copy the prompt, then choose **Open in Forge**.
5. Download JSON. Change the palace, then restore that JSON and verify its images and history return.
6. Return to Archive and choose **Install Grimoire XR** if Chrome offers it.

If the custom install button does not appear, use the browser menu’s **Install app** or **Add to Home screen** command. Installation needs HTTPS or a same-device `localhost`/`127.0.0.1` origin. A plain LAN-IP HTTP page can run the app but cannot register the offline worker.

## Continuity contract

The small automatic browser snapshot deliberately strips generated image data to protect mobile storage. It restores text, settings, deck state, Oracle and Spirit records, and court progress after an ordinary reload.

The downloaded JSON file is the durable, image-bearing handoff. Importing it restores embedded images immediately for the current session. Keep the file if those images matter; after a later reload, the lightweight browser snapshot again omits them.

HTML export remains the human-readable book. It is not an import format and is never executed by the restoration path.

## Offline boundary

The service worker handles only same-origin GET requests for the page shell and static assets. It bypasses:

- `/api/*`
- `/health`
- `/ollama/*`
- `/comfyui/*`
- every cross-origin request

This means offline caching cannot replay, hide, or stale a live generation result. When the Mac is unavailable, deliberately choose Phone Demo. When it returns, choose Live Local AI and recheck the providers.
