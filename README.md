# Nora-lab

A public monorepo for software experiments, AI tooling, and articles — mirrored from private development.

## Contents

| Directory | Description |
|-----------|-------------|
| `articles/` | Articles published on [Zenn](https://zenn.dev) (Japanese) |
| `books/` | Books published on [Zenn](https://zenn.dev) (Japanese) |
| `tools/` | AI harness & software development tools (e.g., CodeCompass, SoloXP) |
| `experiments/` | Public build-in-public experiments using those tools |

## Tools

### CodeCompass

A SKILL.md-based tool that detects refactoring hotspots from git history and AST analysis: `(change frequency × complexity) / LOC`. CI-only MVP — see [`tools/CodeCompass/`](./tools/CodeCompass/) for setup and the workflows this repo dogfoods at [`.github/workflows/codecompass.yml`](./.github/workflows/codecompass.yml) and [`.github/workflows/hotspot-alert.yml`](./.github/workflows/hotspot-alert.yml).

### Claude Weekly Limit Meter

A simple web app to track your remaining Claude weekly usage.

- Enter current usage % → see remaining capacity and today's recommended budget
- Countdown to next reset (day/time configurable)
- Auto-saves to LocalStorage; no backend required

**[Try it →](https://noragrammer-crypto.github.io/Nora-lab/tools/ClaudeWeekMeator/)**

## Contribution Policy

This repository is **read-only from the outside**.

- **Pull Requests**: Not accepted. This repo is a mirror of private development; changes flow one way.
- **Issues**: Welcome. Bug reports, question, and feedback are appreciated.
- **Discussions**: Open for broader conversations if you want to share ideas.

> If you find something useful here, feel free to fork and adapt it for your own work.

## Notes

- Development happens privately; this repo receives periodic syncs of publishable work.
- Zenn articles are in Japanese. Code and documentation in this repo are in English.
- No stability guarantees — this is experimental work shared as-is.

## License

[MIT](./LICENSE) — Copyright (c) 2026 noragrammer-crypto.
Free to use and adapt, but copyright is retained. No warranty provided.
