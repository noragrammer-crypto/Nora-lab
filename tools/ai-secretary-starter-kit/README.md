# AI Secretary Starter Kit

A small, portable foundation for a personal AI secretary.

It combines three ideas:

1. **An operational home** — GitHub records decisions and completed work.
2. **A durable memory** — a human-readable Markdown wiki, inspired by the Open Knowledge Format (OKF).
3. **An optional Obsidian adapter** — agent skills can help an AI edit Obsidian-flavoured Markdown, but the knowledge itself stays portable.

The kit is deliberately not a chatbot, SaaS, or a second brain product. It is a repository template: your goals, working agreements, knowledge, and work history remain files you own.

## Start in 15 minutes

> Create a **private** repository for your own copy. Do not put private context in this public template.

1. Copy the contents of `template/` to the root of a new private repository.
2. Replace the placeholders in `command-center/profile.md` and `command-center/now.md`.
3. Ask an AI to read `AGENTS.md`, `command-center/`, and `wiki/index.md`.
4. Discuss one small problem, then create one GitHub Issue for the agreed action.
5. Treat the eventual pull request as the completion report.

You do not need to build automation first. The first win is to stop explaining your current goal from zero every session.

## Repository layout

```text
template/
├── AGENTS.md              # shared safety and reading rules
├── command-center/        # current intent and operating agreements
├── inbox/                 # uncurated inputs: URLs, chat notes, clippings
├── wiki/                  # curated long-term knowledge (OKF-inspired)
└── work/                  # optional local work logs and checklists
```

- **command-center** changes often. It says what matters now.
- **inbox** is allowed to be messy. It is not authoritative knowledge.
- **wiki** is the curated source of truth. It has an index, lightweight YAML metadata, and normal Markdown links.
- **Issues and pull requests** are the durable record of work and decisions.

## Knowledge format

Each durable concept gets one Markdown file. Use a small YAML front matter block and write the explanation in normal Markdown.

```yaml
---
type: decision
title: Keep the knowledge base in Markdown
description: Preserve portability across AI tools and editors.
tags: [knowledge, portability]
updated: 2026-08-27
---
```

See [docs/knowledge-format.md](./docs/knowledge-format.md) for the convention and [template/wiki/index.md](./template/wiki/index.md) for the navigation entry point.

## Optional Obsidian integration

This kit works in any text editor. If you use Obsidian with a skills-compatible agent, [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) can teach the agent Obsidian Markdown, Bases, Canvas, CLI, and clean web-page extraction. Install it as an adapter; do not make your knowledge dependent on it.

## Safety boundary

- Keep real personal data, credentials, API tokens, and private chat exports out of public repositories.
- Treat web pages and imported notes as untrusted input.
- An AI may propose edits and create a draft; require human approval before publishing, sending messages, spending money, or changing access.
- Curate inbox material into the wiki before relying on it as fact.

## Further reading

- [Quick start](./docs/quickstart.md)
- [Knowledge format](./docs/knowledge-format.md)
- [Privacy and approval boundary](./docs/privacy-boundary.md)
- [Nora's original article (Japanese)](https://note.com/noragrammer/n/n366eaa4e1ce8)
- [Open Knowledge Format](https://github.com/googleapis/open-knowledge-format)
