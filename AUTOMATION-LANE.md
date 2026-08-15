# Grimoire trusted automation lane

This branch reduces manual Mac/Fold verification without weakening the existing acceptance gates.

## What is automated

### Hosted verification

`.github/workflows/ci.yml` runs on GitHub-hosted infrastructure for pull requests and trusted development branches:

- exact `npm ci` dependency install;
- Vitest suite;
- production Vite build.

This lane does not require the developer Mac, ComfyUI, Ollama, or an Android device.

### Trusted M2 local-AI verification

`.github/workflows/local-ai-m2.yml` is intentionally **not** triggered by pull requests. It targets a repository-level self-hosted macOS ARM64 runner with the custom label `grimoire-m2` and runs with read-only repository permissions.

The lane:

1. checks out only a trusted `agent/fold6-*` or `checkpoint/*` target;
2. installs exact dependencies;
3. runs `npm run check`;
4. verifies Ollama and ComfyUI are reachable locally;
5. starts the tested branch's Node API on isolated port 8788;
6. runs the API contract suite;
7. resumes an incomplete Preview/Final/Refine checkpoint when one exists, otherwise starts a fresh run;
8. optionally builds/installs/launches the Android app when an authorized device is connected;
9. uploads QA images, reports, screenshots, API logs, Android logcat, and related evidence as an ephemeral GitHub Actions artifact.

The generated QA evidence remains outside Git history.

## Why the self-hosted lane is trust-only

`bookthief666/grimoire-xr` is currently public. GitHub recommends self-hosted runners only for private repositories because untrusted workflow execution on a self-hosted machine is a security risk.

For that reason this workflow has several deliberate restrictions:

- no `pull_request` or `pull_request_target` trigger;
- job runs only when `github.actor == github.repository_owner`;
- read-only `GITHUB_TOKEN` permissions;
- no repository secrets are required;
- target refs are restricted to `agent/fold6-*` and `checkpoint/*`;
- a custom `grimoire-m2` runner label isolates the hardware lane;
- QA API uses port 8788 instead of replacing the interactive development API on 8787.

The strongest option is still to make the repository private or register the M2 runner against a separate private automation repository. Do not broaden this workflow to arbitrary public pull requests.

## One-time Mac bridge setup

The remaining manual setup is registering the Mac as a GitHub self-hosted runner:

1. Open the repository on GitHub.
2. Open **Settings → Actions → Runners → New self-hosted runner**.
3. Choose macOS and ARM64.
4. Follow GitHub's generated installation/registration commands on the Mac. The registration token is time-limited.
5. Add the custom runner label `grimoire-m2`.
6. Keep the runner installed in its own directory, separate from the development worktree.
7. Configure it to run as a service if the Mac should accept QA jobs without manually starting the runner process.

The M2 still needs the existing local dependencies available:

- Ollama at `127.0.0.1:11434` with `qwen3:8b`;
- ComfyUI at `127.0.0.1:8188` with `juggernautXL_ragnarokBy.safetensors`;
- Node/npm;
- `cloudflared`, Android SDK/Gradle, and `adb` for the optional physical Fold smoke lane.

## Physical Fold smoke evidence

When an authorized Android device is connected, `scripts/qa-fold-adb.sh` automatically:

- starts an ephemeral Cloudflare Quick Tunnel to the isolated QA API;
- rebuilds the Capacitor app with that HTTPS endpoint;
- runs `cap sync` and Gradle `assembleDebug`;
- installs the APK with `adb install -r`;
- launches `com.grimoire.app/.MainActivity`;
- asserts that the app process remains alive;
- captures a device screenshot, UI hierarchy, package metadata, tunnel health, and logcat.

This is a native launch/crash/connectivity smoke gate. Higher-level interaction automation should be added separately with semantic UI automation rather than hard-coded screen coordinates.

## Evidence flow

Once the self-hosted runner is registered, QA evidence can flow without manual screenshots:

```text
GitHub branch/commit
      ↓
trusted M2 runner
      ├─ tests + build
      ├─ local Ollama/ComfyUI QA
      ├─ Preview/Final/Refine report
      └─ optional Fold install/launch evidence
      ↓
GitHub Actions artifact
      ↓
review through the GitHub connector
```

This keeps human acceptance for genuinely subjective visual quality while automating the repetitive execution, logging, checkpointing, artifact collection, and objective pass/fail checks.
