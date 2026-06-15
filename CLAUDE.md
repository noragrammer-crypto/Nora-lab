# Nora-lab — Project Context

## Overview

Public monorepo mirrored from private development (noragrammer-crypto/HolyAutomater).
Publishes work-in-progress experiments, AI tooling, and Zenn articles.

## Repository Relationship

- **HolyAutomater** (private): Main development repo. Source of truth.
- **Nora-lab** (this repo, public): Receives periodic syncs of publishable content via copy/subdirectory.
- Sync direction is one-way: HolyAutomater → Nora-lab.
- PRs to this repo are not accepted. Issues and feedback are welcome.

## Planned Directory Structure

```
zenn/         # Zenn articles (Japanese)
tools/        # AI harness and dev tools (e.g., CodeCompass, SoloXP)
experiments/  # Build-in-public experiments using those tools
```

## Language Policy

- Repository documentation, code, and comments: **English**
- Zenn article content under `zenn/`: **Japanese**

## Development Notes

- HolyAutomater is outside the GitHub MCP scope in Claude Code web sessions.
  To sync content, copy files manually or use `git subtree` from a local machine.
- This repo started empty; structure grows as content is migrated from HolyAutomater.
- No stability guarantees — experimental work shared as-is.
