# ProcessIssue ─ Issue triage and automatic selection

## Overview

The note article "[Issues triage, the story told first by AI] (https://note.com/noragrammer/n/n82e787b91fdb)"
`ProcessIssue` is the **judgment criteria** itself when automatically selecting one issue from an open issue (which label to use, how to use it, etc.)
It is a verbalization of what to prioritize and what to postpone. This document describes the criteria for
This has been reorganized as the implementation and label operation of `ProcessIssue`.

The automatic selection entry included with SoloXP itself is `xp_Director` (no argument), but `xp_Director` (no argument) itself is
It has no selection logic and acts as a backward compatible entry point that immediately delegates processing to `/ProcessIssue` when called.
(See `SoloXP/skills/xp_Director/SKILL.md` for implementation). The actual issue selection logic is on the `ProcessIssue` side.
There is. Combine multiple workflows (work other than software development in the same issue queue, etc.) into one
When operating in a queue, a layer is required to decide which workflow the selected issue should be passed to,
You can think of `ProcessIssue` as an implementation example that combines the selection logic and distribution layer.

## Role of ProcessIssue

`ProcessIssue`'s responsibilities are limited to two things: Actual design and implementation decisions are not made.

1. **Select** ─ Select one issue from the open issue list that you can start automatically right now.
2. **Distribution** ─ Delegates to the appropriate workflow (`xp_Director`, etc.) depending on the content of the selected issue

Since both selection and sorting are mechanical processes based on rules, `ProcessIssue` itself is a lightweight model.
be made to work. Substantive design and implementation decisions are made by the delegated skill at its own discretion (declared model).
The division of roles is such that even if the accuracy of judgment on the `ProcessIssue` side is improved, the implementation quality will not be affected.

```
オープンイシュー一覧
      ↓
[ProcessIssue] 未ブロックの1件を選択（本ドキュメント後半のラベルルール）
      ↓
[ProcessIssue] 内容に応じてワークフローへ委譲（判断はしない・振り分けるだけ）
      ↓
実際の設計・実装判断は委譲先スキルが行う
```

## Customization: Tailor workflow distribution to your repository

Customize `ProcessIssue` workflow distribution according to the type of work handled by each repository.
This is part of the premise. Judgment conditions are written using keywords in the label or title/text. in one repository
When multiple types of work (writing other than software development, data processing, etc.) are being done in the same issue queue.
especially effective.

Points to note when writing judgment conditions:

- **Give priority to judgment based on labels. ** Title/body keyword determination is a fallback in case you forget to add a label
  It is better to use a label (e.g. `epic/<名前>`) as the main judgment to avoid false judgments.
- **Prepare a mechanism to pass options through to the delegated skill. ** `ProcessIssue` is
  If a flag like `implementer=codex` is received, it is passed on to the delegate call as is.
  By designing it, you can replace only the behavior of the delegate destination without changing `ProcessIssue` itself.
- **If you only need software development workflows, you can narrow down the allocation to one destination. ** In that case
  `ProcessIssue` is essentially only the "issue selection layer", and the selected issue is directly transferred to `xp_Director`
  It becomes a thin wrapper that can be passed around.
- **Do not automatically execute workflow combinations that are difficult to judge. ** Detects lineage issues that require manual judgment
  If so, provide the option to comment on the issue, stop the process, and wait for user instructions.(Avoid the risk of over-automating and initiating unintended tasks).

## Automatic selection of issues by label

This is the central theme of the note article. Even if the ``selection procedure'' itself can be structured, ``which label should be attached and how?''
The criteria for judgment tend to be tacit knowledge. The following is a written statement of the criteria.

### Priority: 3 stages of execution + FIFO

The issues targeted for action are divided into three stages.

| Bucket | Condition |
|---|---|
| `emergency` | `Emergency` Labeled (today and tomorrow) |
| `high` | `PriorityHigh` Label available (this week) |
| `normal` | None (unmarked/oldest first) |

Process buckets in the order `emergency` → `high` → `normal`, **Always issue number within each bucket.
Process in ascending order (oldest first). ** Do not judge "new or old" individually within the same priority.
By using a simple FIFO, the cost of prioritization decisions can be reduced to just the one-time process of deciding which bucket to put the data into.

### How to use exclusions: backlog / block / ignore

There are three types of labels that can be removed from selection, but all have the same mechanical behavior (they are only removed from selection candidates).
The only difference is in the statement of intent: ``Why not do it now?''

| Label | Meaning | Restart condition |
|---|---|---|
| `backlog` | Postponed. The policy and starting method are decided, and you are simply waiting for your turn. | Restart by removing the `backlog` label (exclusion filters are evaluated before priority bucket classification, so even if you raise the priority label with `backlog` attached, it will not return to the selection target. If you want to hurry, remove the label and add a separate priority label if necessary) |
| `block` | Judgment pending. Is it dangerous to let it proceed automatically, or have you not yet made up your mind? | It is not the passage of time, but the state itself that changes (the policy is fixed, the cause is determined, etc.) |
| `ignore` | Consciously ignored. If you are not satisfied with the automatic review pointed out by AI, you can use it after commenting the reason. | Do not restart until you manually review it |

Specific example of using `block`: You are confused between multiple implementation strategies, you need exploratory debugging due to an unknown bug,
The area of influence is large and I don't want to let it run on its own without checking, etc.

Another specific example (#3116): **Starting the code implementation phase of a new Epic in parallel with the existing bug inventory**.
Research phases and manual setup tasks can be undertaken in parallel at low cost;
Involves code implementation of a new Epic (an Epic that has no past merged PR experience and is not in stable operation)
The task is to open the entire repository with the `bug` label and without `backlog`/`ignore`
While at least one issue remains, add `block` to remove it from the automatic start target and resolve the existing bug.
Prioritize (Add `block` to new Epic tasks waiting in `backlog` as well. `backlog`
(to avoid bypassing this gate when unlocking). Judgments are made each time based on the open issue list at that time.
Do it - Even if two or three specific bugs are resolved, the inventory will not be reduced to 0 if another target bug has newly occurred.
When the inventory reaches 0, remove `block` and restart the process (for details, see `docs/issues/backlog-triage-3116.md`reference).

When in doubt, there's only one criterion: **"Is it okay to start automatically now?"** If it's okay.
`backlog` or unmarked, if you feel unsafe, `block`.

### The dual nature of environmental labels: “repelling” or “binding”?

If you have multiple development environments (smartphone, ClaudeCode Web on a browser, GitHub Codespaces, local PC, etc.),
The same issue queue will be picked up from multiple environments. At this time, the environment label (`env/*`) is
**Note that two diametrically opposed intentions coexist within the same format**.

1. **Purpose of use (unsupported environment guard)**: Tasks that involve browser automation, etc. are unstable or cannot be executed in certain environments.
   Label only the environments that are compatible with certain types of work, so that environments that are not compatible are not automatically selected.
2. **Use for binding (specified execution)**: For work that depends on local files or work that you want to proceed with visual confirmation.
   Add a label that is limited to a specific environment. This allows other environments to open until you open a session in the specified environment.
   Wait without reaching out.

As for the design, ``No label is the default and can be executed anywhere'' ``Label is only added when there are restrictions''
By using this method, both uses can be expressed using the same label system.

### Relationship with dependencies/ongoing checks

In addition to the above filtering by priority/exclusion labels, `ProcessIssue` is used for each candidate issue.
"Is it being processed in another thread?" (`[ProjectStatus: InProgress]` comment)
"Is the dependent issue complete?" (`## 依存関係` section, whether there is a completion marker for the dependent issue)
After checking, select the final one. These two are mechanical consistency checks rather than judgment criteria,
The details are omitted because the nature is different from the "statement of intent by label" that this document deals with, but the completion marker is
If the dependent is a normal task, `[Auditor GREEN]`, `spec_update` tasks (`xp_doc_spec` → `xp_Auditor doc`
`[Auditor GREEN]` is not output structurally), then `[Auditor doc OK]` is seen.
It is easy to overlook this when customizing the selection logic by yourself, so please note it clearly.

## Why triage is a “one-time cost”

It is tiring to rethink the criteria for judgment from scratch every time. ``Repelling'' and ``binding'' environmental labels, and ``postponing'' priorities.
``Reservation'' - Once the boundaries have been clearly defined, all you have to do is apply them from now on. cost of decision
The aim of this labeling system is that it can be summarized as ``one-time creation of rules''.

## Related documents

- Note article: [Issu triage, the story told first by AI](https://note.com/noragrammer/n/n82e787b91fdb)
- [Solo
  How is it born in the first place (overall picture of the outer loop)
- [Setup manual](./setup.md) ── Initial procedure for preparing labels (list of types and sources)
- [How to use tutorial](./tutorial.md) ── Examples from issuing an issue to merging PR
