---
model: claude-haiku-4-5-20251001
---

# ProcessIssue skill

## Overview

Select one unblocked issue from the open issue list,
Execute one of three workflows depending on the content of the issue.

Functions as a successor/migration destination for `/xp_Director` (no argument).
`/xp_Director` (no argument) itself is not deleted. Still available.

Issue selection and sorting decisions are both rule-based mechanical processes that operate on a lightweight model (Haiku).
Substantive design and implementation decisions are made by the delegates (`xp_Director`, `NovelGeneratorRun`, `ProcessCodexIssue`).
This is done in the model declared in frontmatter and is not affected by model changes in ProcessIssue itself (#2907).

---

## Command

### `/ProcessIssue [implementer=codex]`

Select an unblocked issue from open issues,
Execute workflows according to the content.

If `implementer=codex` is specified, workflow 3 (software development/skills development)
Pass the flag as is when delegating to `xp_Director`. Backlog with Codex CLI implementation
Option for batch experiments to digest. The default behavior is unchanged.

---

## Responsibilities

- Obtain open issue list and select unblocked issues
- Workflow distribution judgment based on issue content
- Delegation of processing to each workflow

---

## Processing flow

### 1. Get the open issue list

`gh` If CLI is available, use this (legacy route):

```bash
gh issue list --repo <owner>/<repo> --state open --limit 1000 --json number,title,labels,createdAt,body
```

`--limit` is the "maximum number of items to retrieve", and gh CLI internally pages (multiple API calls) until the specified number is reached.
do. If you fix the number low like `--limit 50`, repositories with more than 50 open issues will
Items after the 51st (including older and high-priority issues) are not included in the retrieved results and cannot be restored even with subsequent sorting (#2759).
`--limit 1000` is a value that is well above the current number of open issues (127, at the time of filing #2759), and the paging function of gh CLI
Obtain virtually all open issues at once. If the number of open issues increases to nearly 1000, this value should be increased further.

If `gh` cannot be used (such as ClaudeCodeWeb, `gh issue list` fails with `HTTP 403` etc.)
Falling back to GitHub MCP tools (pattern established in `xp_issue2md` <#3204>. #3215):

```
mcp__github__list_issues（owner, repo, state: OPEN, fields: [number, title, labels, created_at, body], perPage: 100）
  → 1ページ最大100件。pageInfo.hasNextPage が true の間、after にそのページの endCursor を渡して呼び出しを繰り返し、全オープンイシューを取得する
```

**Normalization of obtained results:** The differences in field names between `gh` CLI (`--json`) and MCP are as follows. The following steps (2-3) are
Treat it so that it can be referenced by any of the normalized names (`number` / `title` / `labels` / `createdAt or created_at` / `body`):

| Normalization fields | gh CLI (`--json`) | GitHub MCP fallback |
|---|---|---|
| number | `number` | `list_issues` of `number` || title | `title` | `title` of `list_issues` |
| labels | `labels[].name` | `labels` of `list_issues` (string array; use `.name` only when the element is an object) |
| createdAt | `createdAt` | `created_at` of `list_issues` |
body | `body` | `list_issues` of `body` |

Retrieve all items at once and process them in priority/FIFO order using subsequent selection logic.
`task` Preferential acquisition by label has been abolished. Priority (Emergency > PriorityHigh > Normal) + FIFO is the only selection criterion.

### 2. Select unblocked issues

#### 2-1. Basic filter

Exclude items to be skipped under the following conditions:

- Label contains `backlog`, `block`, or `ignore` → Skip (`ignore` is a suggestion to consciously ignore, `backlog` is a work postponement, `block` is a temporary block)
- Detect the current environment (`CLAUDE_CODE_ENV` environment variable, or default if unset: `ClaudeCodeWeb`)
  - If the issue is labeled `env/*`, skip if it does not match the current environment
  - Compatible labels: `env/Termux`, `env/ClaudeCodeWeb`, `env/Codespace`, `env/Windows`
  - `env/*` If there is no label, consider it executable in any environment

#### 2-2. Priority bucket classification and FIFO sorting

Sort the issues that passed the filter into the following three buckets:

| Bucket | Condition |
|----------|------|
| `emergency` | `Emergency` Labeled |
| `high` | `PriorityHigh` Labeled |
| `normal` | None of the above |

Within each bucket, sort by issue number **ascending order** (smaller number takes priority = oldest first/FIFO).
The return order of `gh issue list` is descending order of update date and time, so **be sure to re-sort by number**.

#### 2-3. Evaluate candidate issues in order and select one

Process the buckets in the order `emergency` → `high` → `normal`,
Within each bucket, candidates are evaluated one by one in ascending numerical order (oldest first).

**Evaluation procedure (for each candidate issue):**

**A. InProgress check**

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo>
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__issue_read` (method: `get_comments`, issue_number,
perPage: 100. When it reaches 100, increase `page` by 1 and fall back to get all the results. Appears in subsequent B and CThe same type of "batch issue comment retrieval" also uses the same fallback (comment body is `comments[].body`,
The posting date and time will be treated as `comments[].created_at`. `gh --json` of `comments[].body` / `comments[].createdAt` and
The content will be the same).

Find the **latest** comments containing `[ProjectStatus: InProgress]` from the comment list.

- **No applicable comment** → No InProgress (Go to next check)
- The date and time of the comment was posted within **one hour** → Skip to next candidate (processing in another thread)
- The comment was posted more than 1 hour ago** → InProgress is invalid (old processing is considered stopped). Pass the check and proceed
- You can skip this check if comment acquisition fails.

**B. `depends_on` Check**

Extract the dependent issue number from the `## 依存関係` section of the issue body.
This includes both explicit fields such as `depends_on: #<番号>` and `#<番号>` references in natural sentences such as "This task should begin after #<number> is completed." Even in old-style issues without the `depends_on:` field, all `#<数字>` in the section are treated as dependencies.
If one or more dependencies are found:

```bash
gh issue view <depends_on番号> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); bodies=[c.get('body','') for c in cs]; print('GREEN') if any('[Auditor GREEN]' in b or '[Auditor doc OK]' in b for b in bodies) else None"
```

(If `gh` cannot be used, use the same MCP fallback as A)

- If `[Auditor GREEN]` is found, the dependency is considered resolved. If the dependent is a `spec_update` task (passes only `xp_doc_spec` → `xp_Auditor doc`, and `[Auditor GREEN]` is not output structurally), it is determined by the presence or absence of `[Auditor doc OK]` (both markers are exclusive, so you can check both without determining the type of the dependent separately)
- If neither is found, it is blocked → Skip to the next candidate
- **Don't check GitHub's close status** (Even if it is closed, it will be blocked if `[Auditor GREEN]` / `[Auditor doc OK]` is not present)

**C. Architected issue check**

Check the comments for the issue you tried to make a candidate, regardless of the title type (`[Story]` / `[Task]` / `[Bug]` / no tag)
(`[Task]` Issues may also be decomposed into Architect via observable change gates.
It is not determined based on the presence or absence of sub-issues (because related tasks are manually linked to sub-issues):

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print(sum(1 for c in cs if '[親ブランチ作成済み]' in c.get('body','')))"
```

(If `gh` cannot be used, use the same MCP fallback as A)

- `[親ブランチ作成済み]` is **missing** → Select it as a normal candidate (go to step D)
- `[親ブランチ作成済み]` is **existed** → Delegated to subtask as **Architected issue**:

  **Subtask delegation flow:**
  1. Get a list of sub-issues for this Story:
     `gh` CLI's `--json subIssues` is not supported, so obtain it via MCP tool:
     - tool: `mcp__github__issue_read`
     - method: `get_sub_issues`- issue_number: `<story番号>`
  2. Narrow down the candidates by checking the following for each sub-issue:
     - `backlog` / `block` No label
     - env label matching (or no env label)
     - Not InProgress (the most recent `[ProjectStatus: InProgress]` comment **doesn't exist** or **more than 1 hour has passed** since it was posted)
     - `depends_on` has been resolved (`[Auditor GREEN]` exists. However, if the dependent task is `spec_update` (title is "Functional specification update" or body is `task_type: spec_update`), `[Auditor doc OK]` is present)
  3. Sort the active subissues by issue number **ascending** and select the oldest one
  4. If there are zero active subissues:
     - Check comments for all sub-issues
     - The completion marker for each sub-issue should be `[Auditor GREEN]` for normal tasks, `spec_update` for tasks (with "Functional Specification Update" in the title or `task_type: spec_update` in the body) and `[Auditor doc OK]` (for `spec_update` tasks) `xp_doc_spec` → `xp_Auditor doc` only is passed, `[Auditor GREEN]` is not output structurally)
     - All sub-issues meet the corresponding completion marker → Call `xp_Director <ストーリー番号>` and delegate to AllGREEN completion flow
     - There are unfinished sub-issues that do not meet the corresponding completion marker → This Story will be held as having unfinished sub-issues and return to candidate evaluation

**D. Confirm selection**

Select the issue (or sub-issue delegated from Story) that passes all of the above checks.

---

### 3. Workflow distribution

Check the title, label, and body of the selected issue, then perform one of the following workflows:

#### Workflow 1: NovelGenerator Workflow

**Judgment conditions:**
- Label contains `epic/AINovelGenerator`
- The title or text includes "novel", "episode", "NovelGenerator", etc.

**Processing:**
Calling NovelGeneratorRun:
```
/NovelGeneratorRun <issue番号>
```

#### Workflow 2: Fallen Puppeteer Writing System

**Judgment conditions:**
- Label contains `epic/ningyotsukai`
- The title or text contains words such as "dropout" or "puppet master"

**Processing:**
Does not run automatically. Treat it as a manual task that follows user instructions.
Comment and stop the issue:
```
⚠️ 落ちこぼれ人形使い執筆系イシューを検出しました。
このワークフローは手動作業です。ユーザーの指示をお待ちします。
Issue: #<issue番号> <タイトル>
```

#### Workflow 3: Software development/skill development

**Judgment conditions:**
- If workflows 1 to 2 or 4 do not apply

**Processing:**
Pass the issue number to xp_Director and delegate:
```
/xp_Director <issue番号>
```
If ProcessIssue itself was called with `implementer=codex`, pass that flag as is:
```
/xp_Director <issue番号> implementer=codex
```

#### Workflow 4: Codex Auto Review Issue

**Judgment conditions (if all are met):**
- Title is in `**<sub><sub>![P1 Badge]` or `**<sub><sub>![P2 Badge]` format
- body contains `@chatgpt-codex-connector`

**Processing:**Don't call xp_Director, delegate to `ProcessCodexIssue` (judgment, correction, PR creation, and assigning ignore labels are the responsibility of the same skill. Separated in #2907):
```
/ProcessCodexIssue <issue番号>
```

**Processing consecutive Codex issues:**
If the selected issue is a Codex issue, after processing `/ProcessCodexIssue`,
Reevaluate the next candidate issue using the selection logic in Chapter 2. If it is a Codex issue, continue
Delegate to `/ProcessCodexIssue` (can be processed continuously in one session). However, normal software development issues
If they are mixed, stop at one and check with the user.

---

## Notes

- In the normal flow (workflows 1 to 3), only one issue is processed in one execution
- Codex issue (workflow 4) can be processed continuously even after being delegated to `ProcessCodexIssue`
- If in doubt, ask the user
- The only difference from `xp_Director` (no argument) is the addition of distribution logic
