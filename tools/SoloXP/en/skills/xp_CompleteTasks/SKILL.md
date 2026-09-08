---
model: claude-sonnet-4-6
---

# XP CompleteTasks Skill

## Command

### `/xp_CompleteTasks <親issue番号>`

After the parent Story/Bug issue is decomposed into sub-issues by `xp_Architect`, each sub-Task is
An orchestrator that automates the work of implementing one step at a time with `/xp_Director <サブTask番号>`.
Wait until the sub-task PR is merged, and after all sub-tasks are completed, call `xp_Director` with the parent issue number.
Rerun and start AllGREEN flow, check the PR issue of `feature/issue-{親番号}` → `main`
Mark it as complete.

### `/xp_CompleteTasks` (no argument)

If the currently checked out git branch name is in the `feature/issue-{番号}` format, enter its number
Use as parent issue number. If it cannot be parsed, ask the user.

---

## Assumptions

The target issue has already been broken down into sub-issues by `xp_Architect`
(The parent issue has a `[親ブランチ作成済み]` marker and a `feature/issue-{親番号}` branch.)
be remotely present).

If it is not disassembled (Architect has not been executed, the `[親ブランチ作成済み]` marker is not found)
Instead of starting, it reports to the user, "Please run /xp_Director <parent issue number> first."
Finish the process. This skill itself does not perform Architect decomposition.

---

## Responsibilities

- Obtain a list of sub-issues of the parent issue/identify unfinished sub-issues
- Selection of the next sub-task that can be started (depends_on has been resolved)
- Sequential calls to `/xp_Director <サブTask番号>`
- Waiting for sub-Task PR to merge (polling)
- After all sub-tasks are completed, start the AllGREEN flow by re-executing `/xp_Director` for the parent issue
- `feature/issue-{親番号}` → `main` Completed/stopped with confirmation of PR issue

---

## Processing flow

### 1. Determine parent issue number

Uses the number specified in the argument. `feature/issue-{番号}` from the current git branch name if no arguments
Parse the format and get the number (if unable to parse, ask the user).

### 2. Assumption check

Get the main issue text/comments, check the presence or absence of the `[親ブランチ作成済み]` marker,
Check the existence of the `feature/issue-{親番号}` branch. If any of the marker branches
If it is missing (if the parent issue is not decomposed into Architect), the process will end without starting.

### 3. Sub-Task loop

Repeat the following until there are no unfinished sub-tasks:

1. Use `get_sub_issues` to get the list of sub-issues of the parent issue, and check the status of the corresponding PR (`merged` /
   `open` / `closed` (unmerged) / no PR) **Be sure to check on every pass** Classify below
   (Includes the first pass immediately after starting or resuming the skill without exception. Only if detected during polling
   Rather than checking, cases where the PR has already been closed without being merged at the start are treated the same way.
   Codex review pointed out/PR #3628):
   - **Completed**: `[Auditor GREEN]` for regular tasks, `[Auditor doc OK]` for spec_update tasksContains **and** the corresponding PR (`--base feature/issue-{親番号}`) is in the `merged` state
     (Same confirmation method as in the “depends_on cancellation judgment” section of `xp_Director` / gh priority/MCP fallback
     Follow. Just having `[Auditor GREEN]` is not considered resolved)
   - **PR published/waiting to merge**: Corresponding PR exists with `open`
   - **PR closed (unmerged)**: Corresponding PR exists but is not `closed` and `merged`
     (Neither `merged` nor `open`)
   - **Not started**: There is no corresponding PR.
2. If all sub-issues are “completed”, proceed to step 4 (Start AllGREEN flow)
3. If there is at least one sub-issue with "PR issued/waiting for merging":
   - Poll and wait until the PR is merged (or closed) (roughly every 10 to 20 minutes).
     In environments where session self-waiting methods such as `ScheduleWakeup`/`send_later` can be used, use them.
     (You don't have to wait for a chat each time.) Sub-Task PRs are merged by the user (does not auto-merge),
     Wait until it is properly merged. While waiting for the merge, it became necessary to respond to the review points.
     If so, respond on that PR and then continue waiting.
   - Return to step 1 once merged
   - If it is closed during polling and ends without being merged, switch to the same treatment as in 3-b below
3-b. If there is even one sub-issue that is “PR closed (unmerged)” (already at the time of startup/resumption)
   (including if it was closed):
   - Should not be treated as unstarted and re-executed (prevention of duplicate work/duplicate PR)
   - Report the status to the user and ask them to decide whether to rerun or skip before proceeding.
4. If there are unfinished sub-issues:
   - Sub-issues that can be started with depends_on resolved (dependency has been completed. Definition is the same as 1 above)
     Select one item in ascending order of number
   - Run `/xp_Director <サブイシュー番号>` with the selected subissue number. This skill is
     `xp_Director` does not intervene in the internal flow of 1 task 1 PR rule, and calls and completes (PR issue or
     Just wait for the report on the reason for the suspension.
   - After execution, return to step 1

### 4. Launching the AllGREEN flow

Once there are no unfinished sub-issues, re-run `/xp_Director <親issue番号>` with the parent issue number.
As a result, the disassembled gate of `xp_Director` is judged as "all sub-issues are completed", and AllGREEN flow is started.
(Acceptance test/Reviewer/SecurityReviewer confirmation → `feature/issue-{親番号}` → Main PR issue)
starts.

### 5. Completion conditions

Once you confirm that the PR for `feature/issue-{親番号}` → `main` has been issued, this skill will be considered complete.
Stop (merging into main is the responsibility of the owner, so don't wait).

AllGREEN fails in AllGREEN flow (acceptance test not completed, spec_update not completed, subtask PR)
If `xp_Director` stops because it is determined that it is not merged, etc., please report the reason directly to the user.
Stop (this skill does not force it on its own).

---

## Notes

- This skill does not overwrite the **1 task 1 PR** rules and stop conditions of `xp_Director`. Just to the lastFocus on the outer loop of "sequential calls to `/xp_Director` + polling for merge wait"
- **Do not auto-merge** sub-Task PRs. Merging is done by the owner (user)
- Codex issues/`ignore` Cases in which labeled sub-issues are mixed are not covered (for Solo XP)
  (Only deals with sub-issues)
- `xp_Director` asks the user for judgment due to RED remand, iteration limit exceeded, etc. during the loop.
  If it becomes necessary, this skill will also stop and report to the user.
- When processing a subTask in a new session (new session auto-generated branch),
  Do not rename the branch to the parent branch name (`xp_Director` SKILL.md "B. Normal sub-issue
  (Refer to the precautions in “In case of disassembly”)
