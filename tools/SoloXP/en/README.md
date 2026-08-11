# SoloXP

**A system that enables individuals to develop software with a disciplined process in the age of AI coding agents.**
In modern parlance, this is an example of "harness engineering."

Issue-driven development based on GitHub (or similar git environment tools).

> ⚠️ Before you start using it, please copy [`CLAUDE.md.template`](./CLAUDE.md.template) to `CLAUDE.md` in your repository.
> Each skill in SoloXP operates based on the branch operations, PR issuance assumptions, TDD principles, and work time recording formats defined therein.

---

## Quick start

The shortest route is the following 5 steps (for details on number 0, see [Installation Manual](./docs/manual/install.md) and [Setup Manual](./docs/manual/setup.md)):

0. (First time only) Register the SoloXP skills in `.claude/skills/` or an equivalent location, then copy `CLAUDE.md.template` to your repository's `CLAUDE.md`.
1. Raise a GitHub Issue (e.g. `gh issue create --title "[Task] ..." --body "..."`)
2. Run `/xp_Director <issue number>` in Claude Code
3. xp_Tester → xp_Implementer → xp_Auditor (Test) → xp_Documenter → xp_Auditor (Document)
   will run automatically and a PR will be issued when the document audit turns green.
4. Verify and merge PR (`gh pr merge <PR number> --squash --delete-branch`)

### Execution example

While `/xp_Director` is running, progress comments are automatically accumulated in the issue (excerpt):

```
[Tester completed] Add tests/unit/dateFormat.test.js (4 cases)
[Implementer completed] Implemented lib/dateFormat.js and replaced existing calls.
[Auditor GREEN] All 4 cases pass. No regression in existing tests. Verify that the implementation meets the test intent.
[Documenter completed] Updated docs/spec/dateFormat.md, docs/reference/dateFormat.md
[Auditor doc OK]
[PR issued #102]
```

For a complete example of how to write the issue body to PR merge, see [Usage tutorial](./docs/manual/tutorial.md).

---

## Supported platforms

In principle, it aims to work with multiple AI coding agent platforms such as Claude Code and Codex. However, the author mainly uses Claude Code (also the web version) for development and testing, and we cannot guarantee that it will work on other platforms. **No Warranty**.

This is essentially the same for Claude Code (no guarantees), but since the author himself verifies it on a daily basis, there is a difference in relative reliability.

---

## Features

### 1. Issue-driven delta approach

Using GitHub Issues as the starting point for development, we build up "deltas" called issues to get closer to the finished product. The basic rule is 1 task, 1 PR, and each issue is designed to be an independently verifiable unit.

### 2. AI agent collaboration workflow based on XP

Based on XP (Extreme Programming), which is a representative and pioneering approach to agile processes, we have added workflow definitions (role division such as Architect / Tester / Implementer / Auditor, etc., reversal control, simultaneous document updates, etc.) for stable collaboration with AI agents. This is a system designed to allow development to proceed repeatedly and stably, rather than one-off instructions and responses.

### 3. TDD-focused — heavier than vibe coding

Because TDD is at the center of development, the system is built up little by little. On the other hand, compared to methodologies that ``quickly produce results'' like vibe coding, it is a considerably heavier method.

**SoloXP is especially suitable for people who find it increasingly difficult to judge whether vibe-coded output is good or bad.** By expressing acceptance criteria as tests, the workflow can protect quality without requiring a human to evaluate every individual AI response.

### 4. Human-on-the-Loop operation style

The basic style is to start development by raising an issue and have humans involved at the time of PR merging. This is between Human-in-the-Loop (one-by-one intervention) and Human-off-the-Loop (full autonomy).
It is designed to be **Human-on-the-Loop** (humans monitor from outside the loop and intervene only at key points).

The key point is that by combining other agents for issue selection and PR merge decisions, there is room to naturally expand to Human-off-the-Loop.

---

## Suitable for these people

- People who are tired of deciding whether ``this is right'' with vibe coding
- People who want to leave the development to an AI agent but still have explicit quality standards such as testing
- People who want to proceed with development on an issue-by-issue basis from environments where it is difficult to secure consistent work time, such as smartphones or cafes.
- People who are familiar with or want to get used to the development flow on GitHub (Issue/PR based)

---

## Document

### For first-time users

- [Why SoloXP uses branches this way (beginner introduction)](./docs/manual/branch-concept.md) — Understand the mechanism through the metaphor of a “work desk, workshop, and finished product,” with almost no Git terminology required
- [Installation manual](./docs/manual/install.md)
- [Setup manual](./docs/manual/setup.md)
- [Usage tutorial](./docs/manual/tutorial.md)
- [Operation know-how in Claude Code Web environment](./docs/manual/claude-code-web.md)
- [`CLAUDE.md.template`](./CLAUDE.md.template) — A set of settings required for `CLAUDE.md` in your repository

### Operation/Specifications

- [WORKFLOW.md](./WORKFLOW.md) — Detailed operational workflow/skill list
- [Branch/PR merge strategy notes](./docs/manual/branch-strategy.md) — Branch naming, base branches, why merge conflicts occur, and behavioral differences in Claude Code Web; assumes basic Git terminology
- [docs/spec/](./docs/spec/) — Functional specification index for each skill

### Past design materials

- [docs/history/memo/](./docs/history/memo/) — Initial design studies and ADRs; do not use these as operational documentation because they differ from the current implementation

---

## Questions/Support

Questions and consultations other than issues will be accepted through note membership (details will be released soon). [note.com/noragrammer](https://note.com/noragrammer)

---

## License

[MIT License](./LICENSE). As shown in the "Supported Platforms" above, there is no warranty. Please use at your own risk.
