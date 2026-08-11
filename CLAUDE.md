# Nora-lab — Project Context

## Overview

Public monorepo mirrored from private development (noragrammer-crypto/HolyAutomater).
Publishes work-in-progress experiments, AI tooling, and Zenn articles.

## Repository Relationship

- **HolyAutomater** (private): Main development repo. Source of truth.
- **Nora-lab** (this repo, public): Receives periodic syncs of publishable content via copy/subdirectory.
- Sync direction is one-way for the automated pipeline: HolyAutomater → Nora-lab. Direct edits and PRs
  on this repo (e.g. by the owner, or Codex review fixes) are also welcome and get pulled back into
  HolyAutomater's `Nora-lab/` via `git subtree pull --squash` (owner-driven, not automated).
- `main` is branch-protected (no direct push); syncs land via PR (see below).

### How syncs land (redesigned in HolyAutomater issue #2761)

Continuous Private → Public sync does **not** use `git subtree push` (history-preserving split).
A 2026-08-06 incident leaked private commit history from HolyAutomater into this repo's `main`
because `git subtree push` walks the full ancestor graph of every commit that ever touched the
`Nora-lab/` subtree on the private side — an unrelated accident there (a bulk delete + revert)
pulled that whole graph along with it.

Instead, each sync is a single new commit built directly on top of this repo's current `main` HEAD:
HolyAutomater clones this repo's `main` at `--depth 1`, replaces the working tree with the current
snapshot of its `Nora-lab/` directory, and commits+pushes the diff as one commit whose only parent
is this repo's own HEAD. HolyAutomater's private git history is never referenced, so it structurally
cannot leak in via this pipeline. See `SoloXP/docs/spec/nora_lab_publish.md` in HolyAutomater for the
full design and `SoloXP/scripts/publish-nora-lab.sh` for the implementation.

The one-time repo-creation step (`git subtree split`) is unaffected — it's a bootstrap operation, not
part of the continuous sync loop.

## Planned Directory Structure

```
articles/     # Zenn articles (Japanese)
books/        # Zenn books (Japanese)
tools/        # AI harness and dev tools (e.g., CodeCompass, SoloXP)
experiments/  # Build-in-public experiments using those tools
```

## Language Policy

- Repository documentation, code, and comments: **English**
- Zenn article content under `articles/` and `books/`: **Japanese**

## Development Notes

- Nora-lab is outside the GitHub MCP scope in Claude Code web sessions (MCP is scoped to
  `noragrammer-crypto/holyautomater` only). `mcp__github__*` tools cannot target this repo.
- This repo started empty; structure grows as content is migrated from HolyAutomater.
- No stability guarantees — experimental work shared as-is.

## Syncing from Claude Code Web (Contents API transport)

In a Claude Code Web session, outbound git traffic goes through a proxy that allows
`git fetch`/`clone` of public repos but returns `403` on `git push` (including
`git subtree push`, and `SoloXP/scripts/publish-nora-lab.sh`'s own `git push` step) to
anything outside the GitHub MCP scope — confirmed against both `main` and a freshly
created branch. The GitHub REST API over HTTPS is **not** blocked the same way, so
syncing from a web session uses raw API calls with `$GH_TOKEN` instead of git/MCP.

This isn't a bolted-on workaround — it implements the same design principle as
`publish-nora-lab.sh` (issue #2761: one new commit built on top of this repo's current
`main` HEAD, HolyAutomater's private git history never referenced), just over a
different transport because `git push` itself is unavailable in this environment:

1. **Get base SHA**: `GET /repos/noragrammer-crypto/Nora-lab/git/refs/heads/main`
2. **Create a branch**: `POST /repos/noragrammer-crypto/Nora-lab/git/refs`
   with `{"ref": "refs/heads/<branch-name>", "sha": "<base-sha>"}`
3. **Write files**: for each file, `PUT /repos/noragrammer-crypto/Nora-lab/contents/<path>`
   with base64 `content`, `branch`, and (if updating an existing file) its current `sha`
   fetched via `GET .../contents/<path>?ref=<branch-name>`
4. **Open a PR**: `POST /repos/noragrammer-crypto/Nora-lab/pulls`
   with `{"title", "head": "<branch-name>", "base": "main", "body"}`
5. Merge is left to the repo owner (human-in-the-loop on the public repo).

All four calls just need `Authorization: Bearer $GH_TOKEN` — no `nora-lab` git remote or
`git subtree` required. (`git remote add nora-lab ...` only helps for read-side `git fetch`
diffing; it cannot push.) This is the working procedure for now — revisit if the proxy
policy changes or a less manual path becomes available.
