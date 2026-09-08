---
model: claude-sonnet-4-6
---

# ProcessCodexIssue skill

## Overview

Codex (`@chatgpt-codex-connector`) determines a single Codex issue automatically generated from PR reviews,
If you are satisfied with it, make the corrections and submit a PR. If you are not satisfied, please comment the reason and label it as `ignore`.

Dedicated skill (#2907) separated from workflow 4 of `/ProcessIssue`. Issue selection/block judgment/
The caller `/ProcessIssue` determines whether or not continuous processing is possible, and this skill processes one selected Codex issue.
Responsible only for judgment, correction, and PR creation. This judgment is a substantial review work to decipher the validity of the code, so
Maintain high accuracy model (Sonnet) separately from `/ProcessIssue` (Haiku).

---

## Command

### `/ProcessCodexIssue <issue番号>`

Process one specified Codex issue.

---

## Responsibilities

- Reading and determining the validity of the points raised in one designated issue
- Modified implementation and PR creation if acceptable
- If you are not satisfied, comment the reason/`ignore` Label

---

## Assumptions

Assuming that the caller (`/ProcessIssue`) has confirmed the following:

- Title is in `**<sub><sub>![P1 Badge]` or `**<sub><sub>![P2 Badge]` format
- body contains `@chatgpt-codex-connector`
- Clears blocking conditions such as InProgress and depends_on

When invoking it alone (e.g. manual individual processing), the above assumptions should be confirmed separately on the calling side.

---

## Processing flow

### 1. Get issue contents

```bash
gh issue view <issue番号> --json title,body,comments --repo <owner>/<repo>
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__issue_read` (method: `get`, issue_number).
Comment the text with `mcp__github__issue_read` (method: `get_comments`, issue_number, perPage: 100)
Get (pattern established in `xp_issue2md`〈#3204〉. #3218).

### 2. Read the content and decide whether you agree with it.

Read the content pointed out in the title + body, and judge whether it is technically appropriate based on the context of the target code.

### 3-A. If you are satisfied

- Identify and fix target files (no need to run the entire test suite)
- Create `codex/issue-{番号}` branch and commit/push your fixes
  (Do not use `feature/issue-*`. All GREEN marker required check (`.github/workflows/allgreen-check.yml`,
  #1691/#3037) is the parent issue's `[Auditor GREEN]`/`[Auditor doc OK]` for all `feature/issue-*` branches.
  Requests a marker, but Codex issues do not pass through xp_Director/xp_Tester/xp_Auditor due to policy.
  The marker is not attached structurally and CI always fails. Discovered in #3055)
- Create a PR to include `Closes #<番号>`

### 3-B. If you are not satisfied

- Comment the issue with the reason
- Exit with label `ignore`

---

## Notes

- Only one issue is processed in one call (the caller `/ProcessIssue` determines whether continuous processing is possible)
- If in doubt, ask the user
