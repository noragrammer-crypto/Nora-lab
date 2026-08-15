# The SoloXP Operating Loop — From an Idea to Implementation, Evaluation, and the Next Issue

## Overview

The note article, ["Do not write a large specification. Just split it into tasks and work through them — SoloXP, a PR production line for solo development"](https://note.com/n/n81773d3c58c0), explains the **coding phase** from opening an Issue to issuing a PR as a four-stage flow:

```
1. Open an Issue (human) → 2. Break it into tasks (AI: Architect role) →
3. Implement with one task per PR (AI: Tester → Implementer → Auditor → Documenter) →
4. Acceptance test → issue PR (AI + human)
```

This is the operating flow defined by [WORKFLOW.md](../../WORKFLOW.md). In practice, however, two more stages surround the coding phase, forming a loop. This document records that outer loop: what creates Issues, how coded work is evaluated, and how that evaluation leads to the next Issue.

## The complete loop (six steps)

```
[0] Write the idea as a one-line Issue (human)
        ↓
[1] Discuss it with AI and redefine it at an executable size (human + AI)
        ↓
[2] AI files the Issue (AI)
        ↓
[3] Code it (AI: the note article's four-stage flow)
        ↓
[4] Review it in the PR (human)
        ↓
[5] Evaluate what was produced (human)
        │
        └── Insights from the evaluation return to [0] as new one-line Issues
```

## Details of each step

### [0] Write the idea as a one-line Issue

Without polishing it, put the idea in an Issue in roughly one line. It need not be executable at this stage; it may remain abstract and rough. The goal is to prevent it from evaporating. Putting it first in the durable structure of an Issue rather than in an ephemeral prompt or memo follows the same principle as the note article's discussion of plan mode: externalize a plan as the durable unit of an Issue instead of confining it to session notes.

### [1] Discuss it with AI and redefine it at an executable size

A one-line Issue is often not specific enough for `xp_Architect` to decompose. The human and AI discuss what counts as complete and what belongs within the Issue's scope. The goal is to make it concrete enough for `ProcessIssue` / `xp_Director` to handle: an amount that can be classified as a Story, Bug, or Task.

### [2] AI files the Issue

AI formats the result of [1] as the Issue body and files it (for example, using `xp_issue`). **Do not create an additional new Issue here: update the same Issue opened in [0] by editing its body.** Otherwise, the rough one-line Issue from [0] remains neither closed nor linked, and `ProcessIssue` FIFO selection can mistakenly process an old unrefined Issue first. If a new Issue must be created, close the old one or explicitly link it, for example with `Closes #<old-number>`.

This is where the four-stage flow in the note article first enters its starting point: opening an Issue.

### [3] Code it (the note article's four-stage flow)

The existing note article and [WORKFLOW.md](../../WORKFLOW.md) already explain this phase, so this document does not repeat it in detail. In short:

Break down tasks (Architect role; classify as Story/Bug/Task and create sub-issues) → implement one task per PR (Tester → Implementer → Auditor → Documenter, with TDD RED/GREEN management) → acceptance test and issue PR.

See the note article, [WORKFLOW.md](../../WORKFLOW.md), [docs/spec/](../spec/), and the [usage tutorial](./tutorial.md) for details.

### [4] Review it in the PR

When implementation is complete and a PR arrives, a human reads and reviews the diff. Merging and closing the Issue are fundamentally human responsibilities. Even when a repository's `CLAUDE.md` defines a pre-approved scope for PR creation, the final merge decision remains with a human. See [CLAUDE.md.template](../../CLAUDE.md.template).

### [5] Evaluate what was produced

Use the merged feature and evaluate whether it works as intended, whether it has unexpected behavior, and what improvement is wanted next. Record insights from that evaluation as one-line Issues at [0], continuing the loop.

## Why this outer loop matters

The note article's four-stage flow guarantees the **inner** process of turning an Issue into code. Whether a product actually moves forward, however, depends on the quality of the outer loop: deciding what becomes an Issue and whether the finished work was genuinely good.

- Do not immediately write an abstract thought as a large specification. First make it small and concrete in [0] → [1], then pass it to the inner four-stage flow.
- Do not move to the next implementation without evaluating the finished work. Skipping [4] → [5] risks mass-producing PRs that miss the mark.
- Always externalize evaluation as the next Issue. Do not end with an ephemeral impression; keep the [5] → [0] connection intact.

## Why one-line Issues are enough

Although [0] says that a one-line Issue is sufficient, this can look as though AI reads only that line and expands requirements from nothing. That is not what happens.

One-line Issues work in SoloXP not because AI works from that line alone. GitHub accumulates past Issues, PRs, implementation code, tests, decision history, CLAUDE.md, and skill definitions. AI is expected to use them as searchable context. Even a line such as “do something about ownership of existing E2E REDs” can be reconstructed into a substantially concrete Issue by searching the related Issues, PRs, current implementation, tests, and CLAUDE.md stored in the repository:

```
One-line intent + accumulated context → a substantially concrete Issue
```

GitHub therefore functions not only as task and source management, but also as **AI's external memory**. Issues and PRs are not merely progress records; they are external memory that lets AI supplement intent in the next development cycle.

### The loop becomes stronger as it turns

This external memory grows with every loop:

```
Write an Issue → create a PR → leave decision history →
write the next Issue → AI refers to the past and supplements it → more Issues/PRs accumulate
```

Thus, the six-step loop produces not only development output but also the context AI needs for its next job. The more the loop repeats, the more accurately one-line Issues can be reconstructed.

### This does not abandon specifications

The core of SoloXP can therefore be restated as follows:

> Rather than creating a large specification first, turn small Issues and PRs, and make their history the context for understanding the next specification.

This does not abandon writing specifications. Instead of fixing a specification in one huge document, SoloXP grows it incrementally in the code and in the history of Issues and PRs.

## Summary

```
Abstract thought
   │ One-line Issue
   ▼
Make it concrete through discussion with AI
   │ File the Issue
   ▼
Code it with the note article's four-stage flow (Architect → Tester/Implementer/Auditor/Documenter → PR)
   │ PR
   ▼
Human review
   │ Use it
   ▼
Evaluation
   │ Insight
   └──▶ Return to [0] as a new one-line Issue
```

The actual SoloXP cycle is: discuss an abstract idea and make it concrete → break the concrete work down → review and merge it in small pieces → use it and open another Issue.

## Related documents

- note article: ["Do not write a large specification. Just split it into tasks and work through them — SoloXP, a PR production line for solo development"](https://note.com/n/n81773d3c58c0)
- [WORKFLOW.md](../../WORKFLOW.md) — Detailed operating workflow and skill list (the inner flow corresponding to [3] in this document)
- [Usage tutorial](./tutorial.md) — An example from filing an Issue to merging a PR
- [docs/spec/](../spec/) — Index of functional specifications for every skill
