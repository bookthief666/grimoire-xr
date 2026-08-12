# Verification record

Verified on 2026-08-10/11 after integrating the complete application:

- Canonical `tarot_grimoire_os.tsx` application logic is present in `src/App.jsx`.
- `npm install` completed and the lockfile is current.
- Thirty-seven tests pass under Vitest 3.2.7: three reducer regressions, four Ollama provider tests, three ComfyUI workflow tests, two FIFO resource-scheduler tests, eleven VR content/seal/deck/persistence/layout/atmosphere/manual-placement/batch-target tests, four provider-free Demo Current tests, four VR archive/statistics/HTML/import tests, two PWA manifest/service-worker boundary tests, two VR submit-once polling tests, one shared-catalog parity test, and one preview-proxy configuration test.
- Vite 5.4.21 produced a clean production build from 2,730 transformed modules, including lazy-separated 2D and WebXR routes.
- Press Start 2P and VT323 are emitted as local font assets.
- An end-to-end API smoke test passed against controlled Ollama and ComfyUI doubles. It verified `/health`, asynchronous text and image submission/status polling, completed payload retrieval, and the enforced order `Ollama text → Ollama unload → ComfyUI image`.
- The production preview served the `/vr` history route and its hashed entry asset successfully. Its same-origin `/health` proxy returned the live Node provider and resource-scheduler state.
- A desktop-preview regression reported from Chrome on macOS was reproduced from screenshots: the lazy route stylesheet had not applied, collapsing the canvas and exposing an unstyled document; forwarded browser origins also caused ritual POSTs to be rejected while `/health` remained green.
- The VR shell stylesheet is now part of the guaranteed entry CSS. A production integration smoke verified that the entry stylesheet contains `.vr-shell` and that a POST through `127.0.0.1:4173` reaches API body validation (`400`) rather than origin rejection (`403`).
- Pixel Temple 0.3 replaces the obstructing full-circle gate arrangement with a tested, symmetric forward apse: every court remains beyond `z = -2`, the center court is deepest, and desktop orbiting is bounded to the readable face of the sanctuary.
- Portal and temple masonry are merged into low-draw-call block geometry. The floor texture and manifested-card sampling use nearest-neighbor filtering to preserve the 2D Grimoire's pixel language without deliberately reducing headset render resolution.
- Arcane Temple 0.4 moves the context codex onto a scaled right-side lectern in desktop and XR poses so it no longer occupies the altar sightline. The seven portal bodies, trims, and recesses are now instanced in three draw calls rather than rendered as 21 independent meshes.
- The user's Arcane Temple 0.4 Mac screenshot records 60 FPS, 85 draw calls, and 11,050 triangles before the atmosphere pass, improving the earlier 106-call view while preserving a clear altar sightline.
- Electric Babalon 0.5 adds a ceiling-mounted `{7/3}` heptagram, counter-rotating inner star, additive interference wire, seven instanced electrodes, a single dynamic astral-particle field, one instanced glitch-fragment field, and a translucent altar voltage column. Effects react to ritual activity and court completion without postprocessing or shadows.
- Complete Instrument 0.6 replaces the partial flat workbench with a tabbed Ritual, Deck · 78, Oracle, Spirit, and Archive console. Selecting a tab also selects its planetary spatial codex, while provider readiness and queue state remain visible.
- The 78-card command deck supports search, navigation, exegesis, explicit manifestation, prompt copy, inspection patina, per-card reset, and guarded sequential Grand Forge slices of 3, 10, or every missing image. Pause is honored between jobs so an active Ollama or ComfyUI request is never abandoned.
- Triad, Hexagram, and Cross now support deterministic random draw or manual unique card placement from the entire deck before casting. Spirit exposes its 24-message local conversation, keyboard send, optional dictation, and clear controls.
- The Archive console adds tested statistics and escaped portable HTML generation, structured JSON export, browser file sharing/fallback download, and Capacitor Filesystem + Share integration. Ritual audio is user-gesture activated and Audio Off suppresses both the ambient drone and operation tones.
- Fold Current 0.7 adds tested deterministic ritual, forged-card, SVG relic, Oracle, Spirit, and queued/running/ready simulation functions. The mode is explicit, persisted, reversible, and recorded in exports; it never silently substitutes for a failed live provider.
- Showcase & Continuity 0.8 adds a five-step automatic first-run guide that synchronizes the flat tab with its spatial court. It launches no generation operation and remains manually replayable from the console footer.
- Luna now contains a manifested-card reliquary with lazy thumbnails, full-screen metadata/exegesis inspection, touch swiping, keyboard navigation, prompt copy, and direct return to the selected Forge arcanum.
- The JSON archive round trip now includes the ruling portrait and has a tested importer. It rejects malformed or foreign formats, invalid card/court IDs, and unsafe image URLs; normalizes partial rituals to the complete 78; and restores creative settings, cards, Oracle, Spirit history, operations, and court progress.
- The production web build now publishes a standalone PWA manifest, code-derived 192/512 pixel maskable icon set, and offline shell worker. Provider and health routes are explicitly excluded from caching, while a `demo=1` shortcut enables the labeled provider-free current.
- Coarse-touch devices receive native Capacitor or browser vibration feedback, larger targets, keyboard-aware visual-viewport sizing, closed-screen and unfolded posture layouts, a reduced DPR ceiling, and an Adaptive atmosphere ceiling of tier 2 before performance downshift.
- Atmosphere intensity has explicit Vivid/Balanced/Veiled/Off overrides plus an Adaptive mode. Adaptive uses the vivid tier on a healthy desktop, a balanced Quest tier, and downshifts when measured frame rate is low.
- The complete creative catalog is shared between 2D and XR: at least 50 art styles, six Eros levels, three knowledge levels, and eleven traditions including the original nine plus Bruno and Astarte.
- XR ritual normalization guarantees 78 ordered archetypes (22 Major and 56 Minor) even if local-model output is incomplete. Deterministic spread selection is covered for unique ten-card results.
- Milestone 2 production compilation covers kinetic relic arrival/inspection, optional controller haptics, persistent palace-state normalization, and progress-driven locus illumination.
- `npx cap sync` copied the current `dist/` into Android and iOS.
- Capacitor synchronized Haptics, Keyboard, Status Bar, Filesystem, and Share plugins on both platforms.
- Capacitor Doctor reports the Android configuration as healthy.
- The generated iOS target contains `UIViewControllerBasedStatusBarAppearance = true`.
- The generated Android manifest declares Internet access and contains the Capacitor file provider.

Native compiler notes:

- Xcode cannot run in this Linux workspace; open `ios/App/App.xcodeproj` on macOS to compile/sign.
- The Android Gradle wrapper could not download its Gradle distribution because this workspace blocks `services.gradle.org`. Android Studio on a normal connected workstation will perform that download and compile the synchronized project.
- Live generation against the user's Mac was not invoked from this workspace. The controlled provider tests do not replace the required Qwen3 8B/Juggernaut XL device slice on `Arianas-Air` and `SM-F956U`.
- This workspace has no physical Quest or WebGL browser, so immersive session start, controller-ray scale, spatial text comfort, and measured 72 Hz performance remain the first device acceptance test.
