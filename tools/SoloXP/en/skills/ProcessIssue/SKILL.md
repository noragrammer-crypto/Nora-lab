---
model: claude-sonnet-4-6
---

# ProcessIssue skill

## overview

Select one unblocked issue from the open issue list and execute one of three workflows depending on the content of the issue.

Functions as a successor/migration destination for `/xp_Director` (no argument). `/xp_Director` (without argument) itself is not deleted. Still available.

---

## Command

### `/ProcessIssue [implementer=codex]`

Select an unblocked issue from open issues and execute the workflow according to the content.

If `implementer=codex` is specified, the flag will be passed as is when delegating to `xp_Director` in Workflow 3 (software development/skill development). Option for batch experiments to digest backlog with Codex CLI implementation. The default behavior is unchanged.

---

## Responsibilities

- Obtain open issue list and select unblocked issues
- Workflow distribution judgment based on issue content
- Delegation of processing to each workflow

---

## Processing flow

### 1. Get the open issue list

```bash
gh issue list --repo <owner>/<repo> --state open --limit 50 --json number,title,labels,createdAt,body
```

Retrieve all items at once and process them in priority/FIFO order using subsequent selection logic. Priority acquisition by `task` label has been abolished. Priority (Emergency > PriorityHigh > Normal) + FIFO is the only selection criterion.

### 2. Select unblocked issues

#### 2-1. Basic filter

Exclude items to be skipped under the following conditions:

- Label contains `backlog`, `block`, or `ignore` → skip (`ignore` is a suggestion to consciously ignore, `backlog` is a postponement of work, `block` is a temporary block)
- Detect the current environment (`CLAUDE_CODE_ENV` environment variable, or default if unset: `ClaudeCodeWeb`)
- If the issue has the `env/*` label, skip it if it does not match the current environment.
- Supported labels: `env/Termux`, `env/ClaudeCodeWeb`, `env/Codespace`, `env/Windows`
- If there is no `env/*` label, it is assumed that it can be executed in any environment.

#### 2-2. Priority bucket classification and FIFO sorting

Sort the issues that passed the filter into the following three buckets:

| Bucket | Condition |
|----------|------|
| `emergency` | `Emergency` labeled |
| `high` | `PriorityHigh` labeled |
| `normal` | None of the above |

Within each bucket, sort by issue number **ascending order** (smaller number takes priority = oldest first/FIFO). The `gh issue list` is returned in descending order of update date and time, so **be sure to re-sort by number**.

#### 2-3. Evaluate candidate issues in order and select one

Buckets are processed in the order of `emergency` → `high` → `normal`, and within each bucket, candidates are evaluated one by one in ascending numerical order (oldest first).

**Evaluation procedure (for each candidate issue):**

**A. InProgress check**

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo>
```

Search for the **latest** comments containing `[ProjectStatus: InProgress]` from the comment list.

- **No applicable comment** → No InProgress (Go to next check)
- The date and time of the comment was posted within **1 hour** → Skip to next candidate (processing in another thread)
- The comment was posted more than 1 hour ago** → InProgress is invalid (old processing is considered stopped). Pass the check and proceed
- You can skip this check if comment acquisition fails.

**B. `depends_on` check**

Extract the dependent issue number from the `## Dependencies` or `## 依存関係` section of the issue body. This includes both explicit fields such as `depends_on: #<number>` and `#<number>` references in natural sentences such as “This task should begin after #<number> is completed.” Even in old-style issues without the `depends_on:` field, treat every `#<number>` in either localized section as a dependency. If one or more dependencies are found:

```bash
gh issue view <depends_on number> --json comments --repo <owner>/<repo> \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print('GREEN') if any('[Auditor GREEN]' in c.get('body','') for c in cs) else None"
```

- If `[Auditor GREEN]` is found, it is considered as dependency removal.
- If not found, blocked → Skip to next candidate
- **Does not check GitHub's close status** (Even if it is closed, it is still blocking if there is no `[Auditor GREEN]`)

**C. Architected issue check**

Check the comments for the issue you tried to make a candidate, regardless of the title type (`[Story]` / `[Task]` / `[Bug]` / No tag) (`[Task]` issues may also be decomposed in Architect via the observable change gate. This is not determined based on the presence or absence of sub-issues - there are operations in which related tasks are manually linked to sub-issues):

```bash
gh issue view <issue_number> --json comments --repo <owner>/<repo> \
| python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print(sum(1 for c in cs if '[Parent branch created]' in c.get('body','') or '[親ブランチ作成済み]' in c.get('body','')))"
```

- Neither `[Parent branch created]` nor `[親ブランチ作成済み]` is present → Select it as a normal candidate (go to step D)
- Either `[Parent branch created]` or `[親ブランチ作成済み]` is present → Delegate to subtask as **Architected issue**:

**Subtask delegation flow:**
1. Get a list of sub-issues for this Story:
Since `gh` CLI's `--json subIssues` is not supported, obtain it via MCP tool:
     - tool: `mcp__github__issue_read`
     - method: `get_sub_issues`
- issue_number: `<story number>`
2. Narrow down the candidates by checking the following for each sub-issue:
- `backlog` / `block` no label
- env ​​label matching (or no env label)
- Not InProgress (the most recent `[ProjectStatus: InProgress]` comment **doesn't exist** or **more than an hour has passed** since it was posted)
- `depends_on` resolved (with `[Auditor GREEN]`)
3. Sort the active subissues by issue number **ascending** and select the oldest one
4. If there are zero active subissues:
- Check comments for all sub-issues
- All sub-issues have `[Auditor GREEN]` → Call `xp_Director <story number>` and delegate to AllGREEN completion flow
- There are unfinished sub-issues (no `[Auditor GREEN]`) → This Story will be held as having unfinished sub-issues and return to candidate evaluation

**D. Confirm selection**

Select the issue (or sub-issue delegated from Story) that passes all of the above checks.

---

### 3. Workflow distribution

Check the title, label, and text of the selected issue, then perform one of the following workflows:

#### Workflow 1: NovelGenerator Workflow

**Judgment conditions:**
- Label contains `epic/AINovelGenerator`
- The title or text includes "novel", "episode", "NovelGenerator", etc.

**process:**
Calling NovelGeneratorRun:
```
/NovelGeneratorRun <issue number>
```

#### Workflow 2: Fallen Puppeteer Writing System

**Judgment conditions:**
- Label contains `epic/ningyotsukai`
- The title or text contains words such as "dropout" or "puppet master"

**process:**
Does not run automatically. Treat it as a manual task that follows user instructions. Comment and stop the issue:
```
⚠️ We have detected an issue written by a fallen puppet user.
This workflow is manual. Waiting for user instructions.
Issue: #<issue number> <title>
```

#### Workflow 3: Software development/skill development

**Judgment conditions:**
- If workflows 1 to 2 or 4 do not apply

**process:**
Pass the issue number to xp_Director and delegate:
```
/xp_Director <issue number>
```
If ProcessIssue itself was called with `implementer=codex`, pass that flag unchanged:
```
/xp_Director <issue number> implementer=codex
```

#### Workflow 4: Codex Auto Review Issue

**Judgment conditions (if all are met):**
- Title is in `**<sub><sub>![P1 Badge]` or `**<sub><sub>![P2 Badge]` format
- body contains `@chatgpt-codex-connector`

**process:**
Execute the following flow directly without calling xp_Director:

1. Read the content (title + body) and decide whether you agree with it.
2. **If acceptable**:
- Identify and fix target files (no need to run the entire test suite)
- Create `feature/issue-{number}` branch and commit/push the fix
- Create a PR and include `Closes #<number>`
3. **If you are not satisfied**:
- Comment the issue with the reason
- Exit with `ignore` label

**Processing consecutive Codex issues:**
If the selected issue is a Codex issue, if there is a next Codex issue after processing, it will continue to be processed (continuous processing is possible in one session). However, if normal software development issues are mixed, we will stop at one issue and check with the user.

---

## Notes

- In the normal flow (workflows 1 to 3), only one issue is processed in one execution.
- Codex issues (workflow 4) can be processed continuously
- If in doubt, ask the user
- The only difference from `xp_Director` (no argument) is the addition of distribution logic
