# Nora-lab — Project Context

## Overview

Public monorepo mirrored from private development (noragrammer-crypto/HolyAutomater).
Publishes work-in-progress experiments, AI tooling, and Zenn articles.

## Repository Relationship

- **HolyAutomater** (private): Main development repo. Source of truth.
- **Nora-lab** (this repo, public): Receives periodic syncs of publishable content via copy/subdirectory.
- Sync direction is one-way: HolyAutomater → Nora-lab.
- `main` is branch-protected (no direct push); syncs land via PR (see below).

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

## Syncing from Claude Code Web (current workaround)

In a Claude Code Web session, outbound git traffic goes through a proxy that allows
`git fetch`/`clone` of public repos but returns `403` on `git push` (including
`git subtree push`) to anything outside the GitHub MCP scope — confirmed against both
`main` and a freshly created branch. The GitHub REST API over HTTPS is **not** blocked
the same way, so syncing uses raw API calls with `$GH_TOKEN` instead of git/MCP:

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
