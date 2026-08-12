# Grimoire XR prototype

## What exists

The playable vertical slice is **Temple of the Unremembered Name**, a Quest-oriented WebXR memory palace. It is available at `/vr` and remains separate from the existing 2D/Capacitor interface while sharing the same protected local-AI boundary and FIFO Metal scheduler.

**Showcase & Continuity 0.8** retains Electric Babalon’s black, scarlet, brass, bone, scanline, and hard-edged pixel temple while making the complete instrument independently testable on a Galaxy Z Fold 6. A readable flat console groups setup and all tools into Ritual, Deck · 78, Oracle, Spirit, and Archive. The automatic first-run Showcase Rite turns the console and spatial court together through that complete circuit without launching a costly job. Provider-free Demo Current rehearses the same state and export circuit without pretending to be Qwen or ComfyUI. The contextual codex remains on a right-side lectern rather than the altar's central axis.

Above the altar hangs an electric sevenfold Babalon crown: a rotating `{7/3}` heptagram, counter-rotating inner star, chromatic interference wire, seven luminous electrodes, and a ritual-status light. One dynamic particle field carries embers and astral motes through the room; one instanced field flashes broken signal fragments around the side aisles; a translucent voltage column binds altar and ceiling. Court completion strengthens the crown, while AI work accelerates and destabilizes the current. Adaptive, Vivid, Balanced, Veiled, and Off modes let the same authored effect scale from desktop spectacle to Quest comfort without bloom or other heavyweight postprocessing.

The XR ritual creates the same complete **78-card archetype deck** as the original Grimoire: 22 Major Arcana followed by the 56 suited cards. A floor-level ring of 78 instanced tablets makes the latent deck visible at one draw call; selected and forged arcana change color. The command console provides searchable card navigation, the complete style/tradition/Eros/intellect catalog, explicit exegesis and image phases, guarded sequential Grand Forge, manual or automatic Triad/Hexagram/Cross arrangement, full Spirit history and dictation, Arcane Statistics, a swipeable manifested-card reliquary, validated JSON restoration, HTML/JSON/native sharing, provider diagnostics, opt-in ritual audio, an installable offline shell, and an explicitly labeled local rehearsal mode.

Milestone 2, **Kinetic Manifestation**, makes the palace remember and visibly react. Completed court operations brighten their floor and dome loci. A generated Mars relic rises and turns into the codex instead of appearing as a static texture; the user must point and release to open it before tempering the next arcanum. Supported controllers receive short, optional haptic pulses. The current ritual, textual artifacts, settings, and bound-court constellation survive a browser reload.

The central Monad initiates a subject. Seven surrounding courts transform the major Grimoire capabilities into spatial instruments:

| Court | Faculty | Prototype operation |
| --- | --- | --- |
| Luna · Living Archive | Mnemosyne | Reviews locally remembered ritual, card, Oracle, and Spirit operation titles |
| Mercury · Scriptorium | Gnosis | Generates the dossier, ruling genius, mnemonic seal, complete 78-card archetype deck, and questions |
| Venus · Loom of Forms | Eros | Cycles the aesthetic grammar used for the next manifested card |
| Sol · Genius Gate | Coherence | Reveals the ritual's ruling title, charge, and rotating mnemonic seal |
| Mars · Card Forge | Will | Scribes one conceptual arcanum, then manifests its image only on an explicit second action |
| Jupiter · Configurable Oracle | Synthesis | Reads unique 3-, 6-, or 10-card arrangements around a custom question |
| Saturn · Spirit Box | Shadow | Produces a clearly labeled imaginative intellectual simulation—not a quotation or supernatural claim |

The erotic/transgressive setting follows one conceptual rule throughout: an intense image must operate as a **shadow of an idea**, an instrument of memory and transformation, rather than an empty idol.

## Quest launch: one HTTPS tunnel

WebXR immersive sessions require a secure context. For local Quest testing, keep Ollama and ComfyUI private, run the built frontend locally, and tunnel only the Grimoire preview server. Its same-origin `/api` route is proxied internally to the Node API.

1. Start Ollama, ComfyUI, and the Grimoire API exactly as described in [LOCAL-AI-SETUP.md](LOCAL-AI-SETUP.md).
2. Build and start the production preview:

   ```bash
   npm run check
   npm run vr:preview
   ```

   If `/vr` was already open before rebuilding, perform a hard refresh (`Command-Shift-R` in Chrome) so the browser loads the new hashed JavaScript and CSS assets.

3. In another terminal, create an HTTPS quick tunnel to the preview—not to either raw provider:

   ```bash
   cloudflared tunnel --url http://localhost:4173
   ```

4. In Meta Quest Browser, open the printed `https://…trycloudflare.com/vr` address and choose **Enter Immersive VR**.

For this single-origin flow, leave `VITE_GRIMOIRE_API_URL` blank. Do not expose ports 11434 or 8188. A Cloudflare quick tunnel is suitable for private development tests, not deployment.

The Vite preview is the trusted public boundary: it normalizes proxied requests before forwarding them to the localhost-only Node API. The browser or temporary tunnel origin therefore does not need to be added to `ALLOWED_ORIGINS`; direct access to port 8787 remains restricted.

## Desktop preview acceptance

Before entering a headset, open `http://127.0.0.1:4173/vr` in Chrome and verify:

1. The WebGL atrium fills the viewport rather than appearing as a shallow strip.
2. The preflight controls appear inside a translucent, bordered panel instead of as unstyled text below the scene.
3. **Begin from desktop** advances to queued/running/ready status without showing **Origin not allowed**.
4. A health result alone is not sufficient: `/health` is a read-only request, while the third check exercises the protected POST path.
5. Open each of the five console tabs. Confirm the whole panel scrolls internally, text inputs remain visible above the keyboard, and selecting a tab turns the spatial codex toward the corresponding court.

## First headset test

Use one controller ray and complete this sequence:

1. Enter VR and confirm the black/scarlet/brass temple opens near the stepped central altar with a floating codex in comfortable reach. All seven portals should occupy the forward apse; no portal should sit between the user and the altar.
2. Look above the altar. Confirm the seven-pointed electric crown rotates without appearing attached to the user's head, the particle current remains spatially distributed, and the altar voltage stays translucent rather than obscuring text.
3. Point at each of the seven oversized gate hitboxes and release the trigger; the codex should change courts.
4. At Mercury or the Monad, begin the ritual and wait through queued/running/ready status without submitting again. Confirm the star, particles, glitch fragments, and altar voltage intensify while the local intelligence works.
5. At Mars, choose **Scribe This Arcanum**, then explicitly choose **Manifest Its Shadow**. Image generation should never begin automatically. The relic should rise into place with a rotating arrival, halo, and central-altar flare.
6. Point and release on the oversized relic hitbox. It should move toward the viewer, begin a restrained breathing rotation, optionally pulse the controller, and bind Mars into the constellation. Only then choose **Return and Temper the Next**.
7. In Oracle, manually place a unique card into every slot and cast the reading; then commune with Saturn from the persistent Spirit log. Confirm both outputs are readable on the codex and their titles enter Luna's local archive.
8. Check the desktop mirror's QA strip while the headset session runs. Initial target: 72 FPS, fewer than 95 draw calls with Vivid effects or fewer than 90 with Balanced effects, and fewer than 120,000 triangles. Record the actual steady-state and relic-inspection numbers rather than judging by appearance alone.
9. Change Astral Weather from Adaptive to Veiled and Off in the desktop console. Confirm `FX` changes in the QA strip and the spatial effects scale or disappear without affecting tools.
10. Exit through the Quest system menu, reload `/vr`, and confirm the subject, dossier, textual card, Oracle/Spirit answers, settings, atmosphere preference, and bound-court markers return. The generated bitmap should not be restored; explicitly manifest it again if needed.

## Performance contract

- Target refresh rate: 72 Hz when supported by the headset.
- No postprocessing, bloom, real-time shadows, heavy physics, or imported environment models.
- Glow is simulated with additive basic materials and restrained transparent geometry; masonry and portals use merged, flat-shaded block geometry.
- The complete atmosphere adds a fixed number of draw calls: one point field, one instanced glitch field, one voltage mesh, and four authored ceiling-seal calls. Particle density changes by tier without multiplying draw calls.
- The pixel aesthetic comes from authored silhouettes, nearest-neighbor textures, restricted colors, scanlines, and type—not from lowering immersive render resolution to an uncomfortable level.
- Interactions use `pointerup`, stop event propagation, and approximately 1.5× visual-size invisible hitboxes.
- Controller haptics are capability-detected and enhancement-only; unsupported browsers continue normally.
- The scene uses one generated card texture at a time; the texture is disposed when replaced.
- Palace snapshots exclude image data URLs to avoid exhausting Quest Browser storage.
- The 2D app and VR runtime are separate lazy chunks.
- Desktop orbit controls provide a no-headset fallback for layout and API testing.

## Remaining embodiment boundaries

- No immersive spatial keyboard yet; the now-complete command console and browser dictation remain the primary text-entry surface before entering VR.
- Movement is room-scale/standing only. The complete palace will need teleport anchors and comfort turning before it grows beyond the atrium.
- Luna's chronological archive remembers operation titles. The active palace snapshot restores the current dossier, card exegesis, Oracle/Spirit text, settings, and court progress without large image data. Portable JSON now restores a complete image-bearing palace between devices for the current session; automatic cross-device synchronization remains unimplemented.
- Controller interaction and short capability-detected pulses are implemented; hand-specific gestures and authored haptic patterns are a later pass.
- The opt-in ritual drone and cues are non-positional. Authored positional court motifs, companion embodiment, and native OpenXR packaging remain deferred until the WebXR interaction and frame budget are validated on a physical Quest.

## Next creative build sequence

1. Validate Electric Babalon's ceiling height, particle comfort, portal scale, controller rays, text legibility, color separation, and frame timing on the target Quest.
2. Add teleport anchors and comfort turning, then expand each gate into a short planetary chamber rather than a decorative menu.
3. Turn the existing ritual drone and operation cues into accessible positional court motifs.
4. Turn mnemonic seal construction into a gesture ritual with deterministic saved geometry.
5. Give the ruling Genius a restrained companion presence whose form is derived from the seven-card constellation.
6. Add optional encrypted cross-device synchronization on top of the validated portable JSON handoff.
7. Evaluate native Unity/Godot OpenXR only after the WebXR prototype proves which embodied mechanics deserve the higher implementation cost.
