# xp_CompleteTasks functional specification

## Overview

After the parent Story/Bug issue is decomposed into sub-issues by `xp_Architect`, each sub-Task is
An orchestrator skill that automates the work of implementing one step at a time with `/xp_Director <サブTask番号>`.
Wait until the sub-task PR is merged, and after all sub-tasks are completed, call `xp_Director` with the parent issue number.
Run it again to start the AllGREEN flow, confirm the PR issuance for `feature/issue-{親番号}` → `main`, and complete.

`xp_Director` 1 task 1 PR rule/stop condition itself is not changed, but outside of it, ``Select sub-issue →
Implement as a thin orchestration layer that repeats `xp_Director` call → wait for PR merge confirmation.

## Command

| Command | Description |
|---|---|
| `/xp_CompleteTasks <親issue番号>` | Automatically implement sub-tasks of the specified parent Story/Bug issue one by one in the order of their dependencies using `/xp_Director` |
| `/xp_CompleteTasks` (no argument) | If the current git branch name is in the format `feature/issue-{番号}`, use that number as the parent issue number |

## Assumptions

The target issue has already been decomposed into sub-issues by `xp_Architect` (the parent issue
`[親ブランチ作成済み]` marker, `feature/issue-{親番号}` branch exists remotely).

If it is not disassembled (`[親ブランチ作成済み]` marker is not found), do not start,
``Please run /xp_Director <parent issue number> first'' is displayed and the process ends.
This skill itself does not perform Architect decomposition.

## Processing flow

### 1. Determine parent issue number

Get the parent issue number from the argument or the current git branch name (`feature/issue-{番号}` format).

### 2. Assumption check

Check the existence of the `[親ブランチ作成済み]` marker and `feature/issue-{親番号}` branch.
If any of them is missing, the process is terminated without starting.

### 3. Sub-Task loop

Repeat the following until there are no incomplete sub-tasks.

**Sub-issue classification (be sure to check on every pass):**

| Classification | Conditions |
|---|---|
| Completed | The regular task contains `[Auditor GREEN]` and the spec_update task contains `[Auditor doc OK]` **AND** The corresponding PR (`--base feature/issue-{親番号}`) is `merged` |
| PR published/waiting to be merged | Corresponding PR exists with `open` |
| PR closed (unmerged) | Corresponding PR exists but is not `closed` and `merged` |
| Not started | No corresponding PR |

- If all sub-issues are "completed", proceed to step 4 (start AllGREEN flow)
- If there is "PR issued/waiting to merge": Poll and wait until it is merged (or closed)
  (Approximately every 10 to 20 minutes). Sub-Task PRs will not be automatically merged as they will be merged by the user.
- If there is "PR closed (unmerged)": including if it was already closed at the time of startup/resumption,
  Do not treat it as incomplete and do not re-execute it (preventing duplicate work and duplicate PR). state to user
  Report and ask for rerun or skip decision- If there is an "unstarted" sub-issue: depends_onSelect one sub-issue that has been resolved and can be started,
  Run `/xp_Director <サブイシュー番号>`. The internal flow/1 task 1 PR rule of `xp_Director` is
  don't intervene

### 4. Launching the AllGREEN flow

Once there are no unfinished sub-issues, re-run `/xp_Director <親issue番号>` with the parent issue number.
As a result, the disassembled gate of `xp_Director` is judged as "all sub-issues completed", and AllGREEN flow is started.
(Acceptance test/Reviewer/SecurityReviewer confirmation → `feature/issue-{親番号}` → Main PR issue)
Start.

### 5. Completion conditions

After confirming that the PR for `feature/issue-{親番号}` → `main` has been issued, stop as completed.
(Do not wait for merging to main as it is the responsibility of the owner). If `xp_Director` stops due to AllGREEN not being established,
We will report the reason to the user and stop it.

## Constraints/non-purpose

- Do not overwrite `xp_Director` 1 task 1 PR rule/stop condition
- Sub-Task PRs will not be automatically merged (merging is the responsibility of the owner)
- Codex issues/sub-issues with the `ignore` label are not applicable (only sub-issues for Solo XP)
- `xp_Director` is in a state where it asks the user to make a decision due to RED remand, iteration limit exceeded, etc. during the loop.
  If this happens, this skill will also stop there.
- When processing a sub-Task in a new session (new session auto-generated branch), change that branch to
  Do not rename to `feature/issue-{親番号}` (parent branch). Branch used as parent branch
  will not be used for subsequent implementation work (`xp_Director` Notes on SKILL.md "B. Normal sub-issue decomposition"
  ). If this is broken, the branch separation based on 1 task 1 PR will be broken and a direct commit to the parent branch will occur.
  (Actual accident that occurred in #3621, measures to prevent recurrence added in #3626)

## Related

- Parent issue: #3621
- Implementation issue: #3623
- E2E test: `SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js` (#3622)
