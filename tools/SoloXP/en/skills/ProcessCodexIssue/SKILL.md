---
model: claude-sonnet-4-6
---

# ProcessCodexIssue skill

## Overview

Judges a single Codex issue (`@chatgpt-codex-connector`) that was auto-generated from a PR review: if the finding is convincing, fixes it and opens a PR; if not, comments with the reason and applies the `ignore` label.

Split out of `/ProcessIssue`'s Workflow 4 as a dedicated skill (#2907). Issue selection, block-condition checks, and the decision of whether consecutive processing is allowed are all handled by the caller, `/ProcessIssue`; this skill's sole job is judging, fixing, and opening a PR for the one Codex issue it was handed. Because that judgment is substantive review work — reading and evaluating whether code is actually correct — it keeps a high-accuracy model (Sonnet) separate from `/ProcessIssue` (Haiku).

---

## Command

### `/ProcessCodexIssue <issue number>`

Processes the single specified Codex issue.

---

## Responsibilities

- Reading and judging the validity of the finding in the specified issue
- Implementing a fix and opening a PR when the finding is convincing
- Commenting with the reason and applying the `ignore` label when it is not

---

## Prerequisites

Assumes the caller (`/ProcessIssue`) has already confirmed:

- The title is in the format `**<sub><sub>![P1 Badge]` or `**<sub><sub>![P2 Badge]`
- The body contains `@chatgpt-codex-connector`
- Blocking conditions such as InProgress and `depends_on` have been cleared

When calling this skill on its own (e.g. for manual, one-off processing), confirm the above conditions yourself first.

---

## Processing flow

### 1. Fetch the issue's content

```bash
gh issue view <issue number> --json title,body,comments --repo <owner>/<repo>
```

### 2. Read the finding and judge whether it's convincing

Read the title and body, and — taking the context of the affected code into account — judge whether the finding is technically valid.

### 3-A. If convincing

- Identify and fix the affected file(s) (no need to run the full test suite)
- Create a `feature/issue-{number}` branch, commit the fix, and push it
- Open a PR that includes `Closes #<number>`

### 3-B. If not convincing

- Comment on the issue with the reason
- Apply the `ignore` label and stop

---

## Notes

- Only one issue is processed per invocation (whether consecutive processing is allowed is decided by the caller, `/ProcessIssue`)
- If in doubt, ask the user
