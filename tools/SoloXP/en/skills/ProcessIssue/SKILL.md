---
model: claude-haiku-4-5-20251001
---

# ProcessIssue skill

## Overview

Select one unblocked issue from the open issue list, and run one of three workflows depending on the issue's content.

Functions as the successor / migration destination for `/xp_Director` (with no argument). `/xp_Director` (with no argument) itself is not being removed; it remains available.

Both issue selection and workflow routing are rule-based mechanical processing, so this skill runs on a lightweight model (Haiku). The substantive design/implementation judgment is carried out by whichever skill it delegates to (`xp_Director`, `NovelGeneratorRun`, `ProcessCodexIssue`), each declaring its own model in its frontmatter — so changing ProcessIssue's own model has no effect on that judgment (#2907).

---

## Command

### `/ProcessIssue [implementer=codex]`

Select an unblocked issue from the open issues and run the workflow that matches its content.

If `implementer=codex` is given, the flag is passed through unchanged when delegating to `xp_Director` in Workflow 3 (software/skill development). This option exists for batch experiments that clear the backlog using the Codex CLI as implementer. Behavior is unchanged when the flag is omitted.

---

## Responsibilities

- Fetching the open issue list and selecting an unblocked issue
- Deciding which workflow to route to, based on issue content
- Delegating processing to each workflow

---

## Processing flow

### 1. Fetch the open issue list

```bash
gh issue list --repo <owner>/<repo> --state open --limit 50 --json number,title,labels,createdAt,body
```

Fetch everything at once, then process it in priority/FIFO order using the selection logic below. Preferential fetching by the `task` label has been discontinued. Priority (`Emergency` > `PriorityHigh` > normal) + FIFO is the sole selection criterion.

### 2. Select an unblocked issue

#### 2-1. Basic filter

Exclude candidates that meet any of the following conditions:

- The labels include `backlog`, `block`, or `ignore` → skip (`ignore` means a deliberate suggestion to ignore, `backlog` means the work is postponed, `block` means a temporary hold)
- Detect the current environment (the `CLAUDE_CODE_ENV` environment variable, or `ClaudeCodeWeb` as the default when unset)
  - If the issue carries an `env/*` label, skip it unless that label matches the current environment
  - Supported labels: `env/Termux`, `env/ClaudeCodeWeb`, `env/Codespace`, `env/Windows`
  - If there is no `env/*` label, treat the issue as runnable in any environment

#### 2-2. Priority-bucket classification and FIFO sort

Classify the issues that passed the filter into three buckets:

| Bucket | Condition |
|----------|------|
| `emergency` | Has the `Emergency` label |
| `high` | Has the `PriorityHigh` label |
| `normal` | Neither of the above |

Within each bucket, sort by issue number in **ascending** order (the smaller number — i.e. the oldest — takes priority: FIFO). `gh issue list` returns results in descending order of last update, so **you must always re-sort by number**.

#### 2-3. Evaluate candidates in order and select one

Process the buckets in the order `emergency` → `high` → `normal`, and within each bucket evaluate candidates one at a time in ascending number order (oldest first).

**Evaluation procedure (for each candidate issue):**

**A. InProgress check**

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo>
```

Find the **most recent** comment containing `[ProjectStatus: InProgress]` among the comments.

- **No such comment** → not InProgress (proceed to the next check)
- The comment was posted **within the last hour** → skip to the next candidate (being processed by another thread)
- The comment was posted **more than an hour ago** → InProgress is stale (treat the earlier processing as having stopped); pass this check and continue
- If fetching the comments fails, this check may be skipped

**B. `depends_on` check**

Extract the dependency issue number(s) from the issue body's `## Dependencies` section. This covers both an explicit field such as `depends_on: #<number>` and a natural-language reference such as `#<number>` inside a sentence like "start this task only after #<number> is done." For older-style issues without a `depends_on:` field, treat every `#<number>` inside the section as a dependency. If one or more dependencies are found:

```bash
gh issue view <depends_on number> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); bodies=[c.get('body','') for c in cs]; print('GREEN') if any('[Auditor GREEN]' in b or '[Auditor doc OK]' in b for b in bodies) else None"
```

- If `[Auditor GREEN]` is found, treat the dependency as resolved. If the dependency is a `spec_update` task (one that only passes through `xp_doc_spec` → `xp_Auditor doc`, so `[Auditor GREEN]` is structurally never emitted), judge instead by the presence of `[Auditor doc OK]` (the two markers are mutually exclusive, so it's fine to check for both without first determining the dependency's type)
- If neither marker is found → still blocked → skip to the next candidate
- **Do not look at GitHub's closed status** (even if closed, the issue is still considered blocking unless `[Auditor GREEN]` / `[Auditor doc OK]` is present)

**C. Architected-issue check**

For the issue you're about to select as a candidate, check its comments regardless of its title type (`[Story]` / `[Task]` / `[Bug]` / no tag) — a `[Task]` issue can also have been decomposed by Architect via the observable-change gate. Do not judge by the presence of sub-issues, since related tasks are sometimes manually linked to sub-issues as a matter of operational practice:

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print(sum(1 for c in cs if '[Parent branch created]' in c.get('body','') or '[親ブランチ作成済み]' in c.get('body','')))"
```

- **Neither** `[Parent branch created]` **nor** `[親ブランチ作成済み]` **is present** → select it as a normal candidate (go to step D)
- **Either marker is present** → treat it as an **Architected issue** and delegate to its subtasks:

  **Subtask delegation flow:**
  1. Fetch the list of sub-issues for this Story.
     Since `gh` CLI's `--json subIssues` is unsupported, fetch it via the MCP tool instead:
     - tool: `mcp__github__issue_read`
     - method: `get_sub_issues`
     - issue_number: `<story number>`
  2. For each sub-issue, narrow down the candidates by checking:
     - No `backlog` / `block` label
     - `env` label matches (or no `env` label at all)
     - Not InProgress (the most recent `[ProjectStatus: InProgress]` comment either **doesn't exist**, or was posted **more than an hour ago**)
     - `depends_on` resolved (`[Auditor GREEN]` present — but if the dependency is a `spec_update` task, identified by "spec update" in the title or `task_type: spec_update` in the body, then `[Auditor doc OK]` present instead)
  3. Sort the eligible sub-issues by issue number in **ascending** order and select the oldest
  4. If there are zero eligible sub-issues:
     - Check the comments on every sub-issue
     - The completion marker for each sub-issue is `[Auditor GREEN]` for a normal task, or `[Auditor doc OK]` for a `spec_update` task (identified by "spec update" in the title or `task_type: spec_update` in the body — a `spec_update` task only passes through `xp_doc_spec` → `xp_Auditor doc`, so `[Auditor GREEN]` is structurally never emitted)
     - If every sub-issue satisfies its applicable completion marker → call `xp_Director <story number>` and delegate to the AllGREEN completion flow
     - If any sub-issue is still missing its applicable completion marker → hold this Story as having incomplete sub-issues, and return to candidate evaluation

**D. Confirm the selection**

Select the issue (or the sub-issue delegated from a Story) that passed all of the above checks.

---

### 3. Workflow routing

Check the selected issue's title, labels, and body, and run one of the following workflows:

#### Workflow 1: NovelGenerator workflow

**Match conditions:**
- The labels include `epic/AINovelGenerator`
- The title or body mentions "novel," "episode," "NovelGenerator," etc.

**Processing:**
Call NovelGeneratorRun:
```
/NovelGeneratorRun <issue number>
```

#### Workflow 2: The fallen-puppeteer writing series

**Match conditions:**
- The labels include `epic/ningyotsukai`
- The title or body mentions "fallen" or "puppeteer," etc.

**Processing:**
Does not run automatically. Treat it as manual work that follows the user's instructions. Comment on the issue and stop:
```
⚠️ Detected an issue in the fallen-puppeteer writing series.
This workflow is manual. Waiting for the user's instructions.
Issue: #<issue number> <title>
```

#### Workflow 3: Software / skill development

**Match conditions:**
- None of workflows 1, 2, or 4 apply

**Processing:**
Pass the issue number to `xp_Director` and delegate:
```
/xp_Director <issue number>
```
If `ProcessIssue` itself was called with `implementer=codex`, pass that flag through unchanged:
```
/xp_Director <issue number> implementer=codex
```

#### Workflow 4: Codex automated-review issue

**Match conditions (all must hold):**
- The title is in the format `**<sub><sub>![P1 Badge]` or `**<sub><sub>![P2 Badge]`
- The body contains `@chatgpt-codex-connector`

**Processing:**
Do not call `xp_Director`; delegate to `ProcessCodexIssue` instead (judging the finding, fixing it, opening the PR, and applying the `ignore` label are all that skill's responsibility — split out in #2907):
```
/ProcessCodexIssue <issue number>
```

**Handling consecutive Codex issues:**
If the selected issue was a Codex issue, after `/ProcessCodexIssue` finishes, re-evaluate the next candidate using the selection logic in section 2. If that candidate is also a Codex issue, delegate to `/ProcessCodexIssue` again (consecutive processing within one session is fine). If, however, a regular software-development issue turns up in the mix, stop after one issue and check with the user.

---

## Notes

- In the normal flow (workflows 1–3), only one issue is processed per invocation
- Codex issues (workflow 4) can still be processed consecutively, even after delegating to `ProcessCodexIssue`
- If in doubt, ask the user
- The only difference from `xp_Director` (with no argument) is the addition of workflow-routing logic
