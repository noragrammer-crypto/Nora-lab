# Knowledge format

The `wiki/` directory is an OKF-inspired knowledge bundle: ordinary Markdown files, a small YAML front matter block, index pages for navigation, and normal Markdown links.

## Required field

Every curated concept page has a `type`.

```yaml
---
type: project
---
```

## Recommended fields

```yaml
---
type: project
title: AI Secretary Starter Kit
description: A portable repository template for a personal AI secretary.
tags: [ai, knowledge-management]
updated: 2026-08-27
source: https://example.com
---
```

Use only fields that help people or tools find and understand the page. Avoid inventing a complex schema.

## File and link rules

- One durable concept per file.
- File paths are stable identifiers; rename deliberately.
- Put an `index.md` in a folder when it contains more than a few concepts.
- Use relative Markdown links, such as `[Projects](./projects/index.md)`.
- Link to source material and distinguish source facts from your own conclusions.
- Keep chronological raw logs outside the wiki until they are distilled.

## Suggested types

| Type | Use |
| --- | --- |
| `profile` | Stable preferences and working constraints |
| `project` | A continuing initiative |
| `decision` | An adopted or rejected choice and its reason |
| `reference` | A source worth keeping |
| `procedure` | A repeatable way of working |
| `glossary` | A term with local meaning |

The format is intentionally small. Interoperability comes from Markdown, front matter, index pages, and links—not from a large taxonomy.
