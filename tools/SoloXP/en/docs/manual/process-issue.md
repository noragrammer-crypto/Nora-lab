# ProcessIssue — Issue Triage and Automatic Selection

## Overview

The note article, ["The AI Blurted Out My Issue Triage Before I Wrote It"](https://note.com/noragrammer/n/n82e787b91fdb) (Japanese), puts into words the **judgment criteria themselves** behind how `ProcessIssue` automatically selects one issue from the open issue list — which label to use for what, and what to prioritize versus defer. This document reorganizes those criteria as `ProcessIssue`'s implementation and label conventions.

The automatic-selection entry point that ships with SoloXP itself is `xp_Director` (with no argument), but `xp_Director` (no argument) has no selection logic of its own — it functions as a backward-compatible entry point that, once called, immediately delegates to `/ProcessIssue` (see `SoloXP/skills/xp_Director/SKILL.md` for the implementation). The actual issue-selection logic lives in `ProcessIssue`. When you run multiple workflows (for example, work other than software development sharing the same issue queue) out of a single queue, you need a layer that decides which workflow a selected issue should go to — think of `ProcessIssue` as one implementation that combines that selection logic with a routing layer.

## The role of ProcessIssue

`ProcessIssue`'s responsibility is limited to the following two things. It never makes the actual design/implementation call.

1. **Selection** — pick one issue from the open issue list that's safe to start on automatically, right now
2. **Routing** — delegate to the appropriate workflow (`xp_Director`, etc.) based on the selected issue's content

Because both selection and routing are rule-based mechanical processing, `ProcessIssue` itself can run on a lightweight model. The substantive design/implementation judgment is left to whichever skill it delegates to, at that skill's own discretion (its declared model) — so improving `ProcessIssue`'s own judgment accuracy has no effect on implementation quality. That's the division of labor.

```
Open issue list
      ↓
[ProcessIssue] selects one unblocked issue (the label rules covered later in this document)
      ↓
[ProcessIssue] routes it to a workflow based on content (no judgment call — routing only)
      ↓
The actual design/implementation judgment is made by whichever skill it delegated to
```

## Customizing: matching workflow routing to your own repository

`ProcessIssue`'s workflow routing is meant to be customized to match the kind of work each repository handles. Write the match conditions using labels or title/body keywords. This is especially useful when a single repository runs multiple lines of work (for example, writing or data-processing work alongside software development) out of the same issue queue.

Points to keep in mind when writing match conditions:

- **Prefer labels over keyword matching.** Use title/body keyword matching only as a fallback for when a label was forgotten; making labels (e.g. `epic/<name>`) the primary signal produces fewer misclassifications.
- **Build in a way to pass options straight through to the delegate skill.** If `ProcessIssue` receives a flag such as `implementer=codex`, designing it to forward that flag unchanged to the delegate call lets you change the delegate's behavior without touching `ProcessIssue` itself.
- **If a software-development-only workflow is all you need, it's fine to route to just one destination.** In that case `ProcessIssue` effectively becomes nothing more than an "issue selection layer" — a thin wrapper that hands the selected issue straight to `xp_Director`.
- **Don't automatically run a workflow combination you're unsure about.** For issue types that need a manual call, also build in the option of commenting on the issue and stopping to wait for the user's instructions (avoiding the risk of over-automating into unintended work).

## Automatic issue selection by label

This is where the note article's central theme comes in. Even once the "how to select" mechanism is in place, "which label to attach, and how" tends to remain tacit knowledge. What follows puts that criteria into words.

### Priority: three tiers of eligible work, plus FIFO

Issues eligible to be worked on fall into three tiers.

| Bucket | Condition |
|---|---|
| `emergency` | Has the `Emergency` label (today or tomorrow) |
| `high` | Has the `PriorityHigh` label (this week) |
| `normal` | Neither (unlabeled — oldest first, steadily) |

Buckets are processed in the order `emergency` → `high` → `normal`, and **within each bucket, issues are always processed in ascending issue-number order (oldest first)**. Within the same priority tier, "newer vs. older" is never judged case by case. Keeping it a plain FIFO concentrates the cost of prioritization into a single decision: which bucket does this belong in.

### The exclusion labels: backlog / block / ignore

There are three labels that pull an issue out of selection, but **the mechanical behavior is identical for all three** (the issue simply drops out of the candidate pool). What differs is only the stated reason for *why* it's not happening right now.

| Label | Meaning | Resumption condition |
|---|---|---|
| `backlog` | Deferred. Direction and approach are already decided; it's simply waiting its turn | Resumes once the `backlog` label is removed (the exclusion filter is evaluated *before* the priority-bucket classification, so raising a priority label while `backlog` is still attached does not bring the issue back into selection. If you want to expedite it, remove the label first and, if needed, add a priority label separately) |
| `block` | Judgment withheld. Letting it proceed automatically would be risky, or you haven't yet made up your own mind | Not time-based — resumes only once the underlying state itself changes (direction settles, the cause is identified, etc.) |
| `ignore` | Deliberately ignored. Used, after commenting with the reason, for cases such as not being convinced by an AI's automated review finding — the terminal state for "not doing this" | Doesn't resume until manually revisited |

Concrete cases for using `block`: torn between multiple implementation approaches, a bug with an unknown cause that needs exploratory debugging, or the blast radius is large enough that you don't want it to run unattended without confirmation.

When in doubt, there's exactly one criterion: **"Is it safe to let this start automatically, right now?"** If yes, leave it as `backlog` or unlabeled; if it feels risky, use `block`.

### The two faces of environment labels: "excluding" vs. "restricting"

When you have more than one development environment (phone, browser-based Claude Code Web, GitHub Codespaces, a local machine, etc.), the same issue queue ends up being pulled from by multiple environments. Environment labels (`env/*`) deserve a note here: **the same label format carries two opposite intents at once.**

1. **Exclusion use (guarding against unsupported environments):** for work that's unstable or simply can't run in a particular environment — browser automation tasks, for example — label only the environments that *can* handle it, so unsupported environments are automatically skipped.
2. **Restriction use (forcing a specific environment):** for work that depends on local files, or that you want to walk through visually, deliberately attach a label limiting it to one specific environment. Other environments then wait, hands off, until you open a session in that specific environment.

The design that makes both uses work within the same label system is: no label is the default (runnable anywhere), and a label is only added when there's an actual constraint.

### Relationship to the dependency and in-progress checks

Beyond the priority and exclusion labels above, `ProcessIssue` also checks each candidate issue for whether it's "already being processed on another thread" (a `[ProjectStatus: InProgress]` comment) and whether "its dependency issue is complete" (the `## Dependencies` section, and whether the dependency's completion marker is present) before making its final selection. These two are less a matter of judgment and more of a mechanical consistency check, and differ in nature from the "labels expressing intent" this document otherwise covers, so the details are left out here — except for one point worth calling out explicitly because it's easy to miss when customizing your own selection logic: the completion marker to look for is `[Auditor GREEN]` when the dependency is a normal task, but `[Auditor doc OK]` when it's a `spec_update` task (one that only passes through `xp_doc_spec` → `xp_Auditor doc`, so `[Auditor GREEN]` is structurally never emitted).

## Why triage becomes a "one-time cost"

Rethinking your judgment criteria from scratch every time is exhausting. The "exclude" vs. "restrict" split for environment labels, and the "defer" vs. "withhold" split for priority — once you've written these boundaries down explicitly, applying them the next time is all that's left to do. That's the point of this label system: it concentrates the cost of judgment into the one-time act of writing the rules.

## Related documents

- note article: ["The AI Blurted Out My Issue Triage Before I Wrote It"](https://note.com/noragrammer/n/n82e787b91fdb) (Japanese)
- [The SoloXP operating loop](./actual-loop.md) — Where the issues that `ProcessIssue` processes come from in the first place (the outer-loop big picture)
- [Setup manual](./setup.md) — The initial label-preparation steps (the label list and who assigns them)
- [Usage tutorial](./tutorial.md) — A worked example from filing an Issue to merging the PR
