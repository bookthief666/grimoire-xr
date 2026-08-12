# Apply Grimoire XR 0.8.1 Review + Tunnel Hardening

This small update does not replace the temple, console, providers, native projects, or saved palace. It adds the master review, the independent Claude review brief, and a safer repeatable Vite preview-host configuration.

## Before applying

Keep the currently working Grimoire open until convenient. Applying the update requires restarting only Vite Preview. Ollama, ComfyUI, the Grimoire API, and Cloudflare can remain running.

Back up the verified project:

```bash
cp -R \
  /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile \
  /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile-before-0.8.1
```

## Install the small update

From the verified project directory, unzip the update archive into the current folder:

```bash
cd /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile
unzip -o ~/Downloads/GRIMOIRE-XR-0.8.1-REVIEW-AND-TUNNEL-HARDENING.zip -d .
```

## Configure the current tunnel hostname

Open `.env.local`:

```bash
open -e .env.local
```

Add this line using the hostname printed by the currently running tunnel, without `https://` and without `/vr`:

```dotenv
GRIMOIRE_PREVIEW_ALLOWED_HOSTS=complications-trader-galaxy-reduction.trycloudflare.com
```

Leave `VITE_GRIMOIRE_API_URL` blank for browser, PWA, Fold, and Quest testing through the single preview tunnel.

## Verify and restart Preview

```bash
cd /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile
npm run check
```

Press `Control-C` only in the Terminal running `npm run vr:preview`, then restart it:

```bash
npm run vr:preview
```

Verify the tunnel host is allowed:

```bash
curl -I \
  -H 'Host: complications-trader-galaxy-reduction.trycloudflare.com' \
  http://127.0.0.1:4173/vr
```

Expected result:

```text
HTTP/1.1 200 OK
```

Open on the Fold:

```text
https://complications-trader-galaxy-reduction.trycloudflare.com/vr
```

When a future Quick Tunnel generates a different hostname, change only `GRIMOIRE_PREVIEW_ALLOWED_HOSTS` in `.env.local` and restart Preview. No source edit is required.

## What to read next

- `docs/GRIMOIRE_XR_MASTER_REVIEW_2026-08-12.md`
- `docs/CLAUDE_OPUS_REVIEW_BRIEF.md`

The master review defines the 0.8.1 foundation/device-acceptance milestone and the evidence gate before 0.9 Embodied Courts.
