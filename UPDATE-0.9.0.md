# Apply Grimoire XR Reference Lock 0.9.0

## Before replacing files

In the running Grimoire, open **Archive** and choose **Download JSON**. Confirm the downloaded file exists. This preserves the manifested Burning Veil image and is required because browser autosave intentionally omits large image bytes.

## Install

Stop only the Vite preview with Control-C. Ollama and ComfyUI may remain running.

```bash
cd /Users/a/Projects/grimoire-vr-m2-v08-verified/worktree/grimoire-capacitor-mobile
unzip -o ~/Downloads/grimoire-xr-reference-lock-0.9.0-update.zip -d .
npm run check
npm run vr:preview
```

Open `http://192.168.1.119:4173/vr` and hard-refresh once. The console header should read `REFERENCE LOCK 0.9.0`.

## Restore and repair the existing relic

1. Open **Archive**.
2. Choose **Restore JSON Archive** and select the JSON exported before installation.
3. Open **The Burning Veil** in Deck.
4. Verify the metadata now identifies inherited card `THE EMPRESS · III`, Hebrew path `DALETH (ד)`, fixed attribution `VENUS`, and letter value `4`.
5. Choose **RE-SCRIBE · LOCK REFERENCES**. This asks Qwen for a corrected exegesis while retaining the manifested image, original visual prompt, and patina.
6. Export a fresh JSON archive after the revised exegesis arrives.

Do not click **Return to Prima Materia** unless you deliberately want to delete the current card record and image from the active palace.
