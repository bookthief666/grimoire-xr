# Branch Inventory — Grimoire XR

Generated 2026-08-10 from a live `git` inspection of this checkout. All commands below were actually run against this repository on this date; output is reproduced, not reconstructed from memory.

## Remote

```
$ git remote -v
origin  https://github.com/bookthief666/grimoire-xr (fetch)
origin  https://github.com/bookthief666/grimoire-xr (push)
```

Single remote, single fork target. No forks-of-forks, no secondary remotes.

## Branches that exist right now

```
$ git branch -vv
* claude/temple-foundation-hub      9a93985 [origin/claude/temple-foundation-hub] perf: merge colonnade into instanced/batched draws
  claude/temple-visual-uplift-Y2JMb dffe418 chore: update package-lock.json after npm install
  main                              368aa86 [origin/main] feat: remove board geometry and relight pillars
```

All three exist both locally and on `origin` (`git branch -a` shows matching `remotes/origin/*` for each). Working tree is clean; no stashes, no worktrees beyond the primary checkout, no tags, nothing untracked.

### `main` — the deployed baseline

- Head: `368aa86` — "feat: remove board geometry and relight pillars"
- This is the shared default branch. Nothing in this session has merged into it, and nothing should without an explicit user decision — nothing in the record indicates the user has asked for that yet.

### `claude/temple-foundation-hub` — where all of this session's real work lives

- Forked from `main` at `368aa86` (reflog: `2026-08-08 09:14:04 checkout: moving from claude/temple-visual-uplift-Y2JMb to claude/temple-foundation-hub`, immediately followed by a fresh branch built forward from that point).
- Head: `9a93985` — "perf: merge colonnade into instanced/batched draws"
- 15 commits ahead of `main`. Full log, oldest first:

| Commit | Message |
|---|---|
| `1387b54` | fix: connect temple tablet reading surface and repair oracle prompt |
| `3ff8bd0` | build: type-check the api/ directory |
| `e8ca6bf` | refactor: split RitualWorkbench into src/scene/workbench modules |
| `5fce663` | chore: remove dead code, document setup, add api dev proxy |
| `b4dbe81` | fix: repair XR interaction defects in the workbench UI |
| `ff935d8` | feat: establish spatial zone discipline for the temple UI |
| `08c0c5c` | feat: the Four Chambers - a morphing multi-tool occult temple |
| `6b39276` | feat: collapse the Sanctum into the morph, and fix a raycast collision |
| `afc382f` | fix: bundle the font and cut the runtime CDN dependency |
| `5e89a8f` | fix: repair the Cell's axis desync and the chamber layout collisions |
| `e1b76b8` | perf: instance the star field and deck constellation |
| `4a280a6` | fix: one pointer implementation, and make chamber labels readable in VR |
| `47a2013` | perf: instance the glyph rose petals shared by every sigil |
| `baa75d7` | feat: neon rotunda floor - give the temple a ground to stand on |
| `053fe43` | feat: rotunda colonnade and constellation dome; fix the seal halos |
| `9a93985` | perf: merge colonnade into instanced/batched draws |

Local and `origin/claude/temple-foundation-hub` are in sync (`git status -sb` reports no ahead/behind). This is the branch to keep developing on.

### `claude/temple-visual-uplift-Y2JMb` — a separate, older, fully-diverged branch

- Head: `dffe418` — "chore: update package-lock.json after npm install"
- **This is the branch name the task-runner header for this session names as the "designated" development branch.** It is not the branch this session actually developed on. See "Discrepancy" below.
- Its history does **not** descend from `main`'s current tip and is not an ancestor of `claude/temple-foundation-hub`. `git log --all --graph` shows it as a fully separate line reaching back through ~50 commits of earlier work: VR reading-panel dragging/pagination, an early holographic-atmosphere pass, the original forge-menu and tarot-system wiring, oracle consultation wiring, and card-image-generation plumbing (`85b20ae fix: reliably render card image on card click`, marked `(grafted)` — meaning this is where the visible history is truncated by a shallow clone, not necessarily the true root commit).
- This branch was checked out first when the session began (`2026-08-08 00:55:05: checkout: moving from main to claude/temple-visual-uplift-Y2JMb`), then abandoned roughly 20 minutes later in favor of a fresh branch off `main` (`claude/temple-foundation-hub`).

**Discrepancy, stated plainly:** the branch this session's harness names as authoritative (`claude/temple-visual-uplift-Y2JMb`) is not the branch that carries the work described in this handoff. Every chamber, the neon rotunda, the pointer-capture fix, the font bundling, the zone system, and everything else documented here lives on `claude/temple-foundation-hub`, which the user has been actively testing on a physical Samsung Fold 6 across many of this session's turns. Reconstructing 15 commits of tested, user-approved work onto `claude/temple-visual-uplift-Y2JMb` now — or discarding `claude/temple-foundation-hub` in favor of restarting on the "designated" name — would destroy verified, in-progress work for no benefit. This has not been corrected by renaming or rebasing anything; both branches are left exactly as they are, and this note exists so the next engineer (human or agent) does not lose time on the mismatch or, worse, "fix" it by discarding the wrong side. **A human should decide** whether to rename `claude/temple-foundation-hub` to `claude/temple-visual-uplift-Y2JMb` (rewriting the designated branch's history), open a PR from `claude/temple-foundation-hub` under its own name, or something else — that decision was out of scope for this documentation pass.

Neither branch has been deleted, force-pushed, or rebased as part of this reconciliation. `claude/temple-visual-uplift-Y2JMb` is preserved untouched.

## Ancestry diagram

```
main (368aa86) ─┬─ claude/temple-foundation-hub (9a93985, 15 commits, HEAD)
                 │     [all session work described in this handoff lives here]
                 │
                 └─ ... (main has its own history back through the same
                          e819e31 merge point as temple-visual-uplift)

claude/temple-visual-uplift-Y2JMb (dffe418)
   — diverges from main/temple-foundation-hub well before 368aa86;
     shares distant ancestry (e819e31 "Merge pull request #12", and
     further back) but is not on the direct line to either.
   — NOT touched this session after the initial ~20-minute checkout.
```

## Reflog highlights (last 50 entries, `--date=iso`)

The reflog confirms the branch-switch sequence above and shows no destructive operations (no `reset --hard`, no `rebase`, no forced checkouts discarding work) at any point in the visible window:

```
9a93985 2026-08-10 05:34:12  commit: perf: merge colonnade into instanced/batched draws
053fe43 2026-08-09 11:59:33  commit: feat: rotunda colonnade and constellation dome; fix the seal halos
baa75d7 2026-08-09 11:42:48  commit: feat: neon rotunda floor - give the temple a ground to stand on
47a2013 2026-08-09 10:15:35  commit: perf: instance the glyph rose petals shared by every sigil
4a280a6 2026-08-09 04:31:42  commit: fix: one pointer implementation, and make chamber labels readable in VR
e1b76b8 2026-08-09 04:26:35  commit: perf: instance the star field and deck constellation
5e89a8f 2026-08-09 04:02:52  commit: fix: repair the Cell's axis desync and the chamber layout collisions
afc382f 2026-08-09 03:57:14  commit: fix: bundle the font and cut the runtime CDN dependency
6b39276 2026-08-09 02:17:18  commit: feat: collapse the Sanctum into the morph, and fix a raycast collision
08c0c5c 2026-08-09 02:14:17  commit: feat: the Four Chambers - a morphing multi-tool occult temple
ff935d8 2026-08-08 11:41:53  commit: establish spatial zone discipline for the temple UI
b4dbe81 2026-08-08 11:36:54  commit: repair XR interaction defects in the workbench UI
5fce663 2026-08-08 09:23:35  checkout: moving from main to claude/temple-foundation-hub
368aa86 2026-08-08 09:23:29  checkout: moving from claude/temple-foundation-hub to main
5fce663 2026-08-08 09:22:59  commit: chore: remove dead code, document setup, add api dev proxy
e8ca6bf 2026-08-08 09:21:10  commit: refactor: split RitualWorkbench into src/scene/workbench modules
3ff8bd0 2026-08-08 09:20:05  reset: moving to HEAD
3ff8bd0 2026-08-08 09:17:34  commit: build: type-check the api/ directory
1387b54 2026-08-08 09:15:18  commit: connect temple tablet reading surface and repair oracle prompt
368aa86 2026-08-08 09:14:04  checkout: moving from claude/temple-visual-uplift-Y2JMb to claude/temple-foundation-hub
dffe418 2026-08-08 00:55:05  checkout: moving from main to claude/temple-visual-uplift-Y2JMb
368aa86 2026-08-08 00:55:04  checkout: moving from 368aa8645... to main
```

The `reset: moving to HEAD` entry at `3ff8bd0` is a no-op reset (same commit before and after) and not a history-losing event.

## Not present

- No open stashes (`git stash list` empty).
- No extra worktrees (`git worktree list` shows only the primary checkout).
- No tags.
- No uncommitted changes, staged or unstaged, at the time of this audit.
- No local-only scratch commits that were never pushed — `claude/temple-foundation-hub` local and remote match exactly.

## What is *not* in this inventory because it is not part of the Git repository at all

The session also produced Playwright verification scripts (`shot.js`, `shot2.js`, `shot3.js`, `shot4.js`, `verify.js`, `chambers.js`, `histogram.js`, `attribute.js`, `perf.js`) and a planning document, all written to the Claude Code session scratchpad (`/tmp/claude-0/.../scratchpad/pw-test/` and `/root/.claude/plans/...`) rather than to this repository. They are real, they were used repeatedly to verify the work described here, and they will not be visible to anyone who only has GitHub access. See `CLAUDE_PROJECT_HANDOFF.md` → "Local-only artifacts" for the full list and a recommendation on what to do with them.
