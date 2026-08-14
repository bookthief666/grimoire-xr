# Grimoire XR 0.8.2 — Operation Clarity

This drop-in update makes long local-AI operations understandable and prevents placeholder controls from masking their state.

## What changed

- A live elapsed-time interlock explains when Qwen is composing the complete 78-card architecture.
- The Deck explicitly identifies its pre-awakening entries as placeholders.
- Placeholder cards, search, Scribe Exegesis, and Spatial Forge remain safely locked until the ritual result returns.
- Card selection can no longer overwrite the visible status of a running AI operation.

## Apply on the Mac

Wait until the current AI operation finishes or errors. Then stop the preview with Control-C, but leave Ollama and ComfyUI available.

From the verified project directory:

```bash
cd /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile
unzip -o ~/Downloads/grimoire-xr-operation-clarity-0.8.2-update.zip -d .
npm run check
npm run vr:preview
```

Open `http://192.168.1.119:4173/vr` again and hard-refresh once.

## Reading the first awakening

During the initial 78-card rite, the console should say `AWAKENING THE COMPLETE 78-CARD PALACE` and show an elapsed clock. The bottom-right diagnostics should show `TEXT`. On an M2, several minutes is normal because Qwen is creating one coherent JSON architecture for all 78 cards.

Completion is unmistakable:

- the status stops saying the local intelligence is working;
- `THE UNREMEMBERED NAME` is replaced by a generated title;
- `LATENT ARCHETYPE` is replaced by generated card metadata;
- Scribe Exegesis and Spatial Forge unlock.

For a direct scheduler check from another Terminal:

```bash
curl -sS http://127.0.0.1:8787/health | python3 -m json.tool
```

`resourceScheduler.active.kind` equal to `text` means Qwen is actively working. `runningForMs` is the server-side elapsed time. An empty queue while `active` is populated is healthy.

## ComfyUI note

Warnings about optional custom nodes such as `was-ns`, Florence, or MVAdapter are not involved in Scribe Exegesis or the initial text awakening. If ComfyUI reaches `Starting server` and the Grimoire health check reports `comfyui.ready: true`, the app's checkpoint-only image workflow can still operate.
