---
model: claude-sonnet-4-6
---

# XP Director Skill

## Command

### `xp_Director <issue_number> [implementer=codex]`

As the person in charge and control tower, control the execution order and timing of all skills.
**Do not touch the code. Focus on judgment and progress management.**

When `implementer=codex` is attached, normal implementation tasks **Test creation (equivalent to Tester), implementation (equivalent to Implementer),
Switch document updates (locally completed portion equivalent to Documenter)** to Codex CLI delegation
(`xp_Tester` → omitted, `xp_Implementer` → `xp_ImplementerCodex`, `xp_Documenter` → `xp_DocumenterCodex`).
If omitted, Claude will do everything as before (default behavior remains unchanged).

**Boundary held by Claude (unchanged even when `implementer=codex` is specified)**:
- `xp_Architect` (design/disassembly)
- `xp_E2Etest` (E2E test creation = definition of acceptance conditions)
- Story-level acceptance judgment (`xp_Auditor test` Story-level phase, GREEN/RED judgment in E2E results)
- Task-level `xp_Auditor test` / `xp_Auditor doc` (independent verification/lightweight but required as the only third-party check to the Codex)
- `xp_Reviewer` ・Decision to issue PR for main

`e2e_test_creation` (test authorship) and `spec_update` (GitHub API dependent) tasks are not affected by this flag.
`bug_reproduction_test` (bug reproduction test creation) is also explicitly left on Claude's side (not subject to Tester delegation).
For details, see "3. Execution Flow".

### `xp_Director` (no argument) / `xp_Director implementer=codex`

Immediately delegate processing to `/ProcessIssue`. If `implementer=codex` is specified, set that flag.
It is also handed over as is to `/ProcessIssue` (re-delegated in the form of `xp_Director <issue number> implementer=codex` when ProcessIssue distributes it to Solo XP).

---

## Responsibilities

- Execution order and timing control of all skills
- depends_on resolution check (block confirmation at next execution)
- Write stage comments to sub-issues
- Remand judgment and iteration upper limit management during RED (3 times)
- Stop after completing 1 task and issuing PR

---

## Processing flow

### Without arguments

Immediately delegate the process to `/ProcessIssue` and stop.
ProcessIssue is in charge of issue selection and distribution logic.

---

### 1. Read the issue content

Get the contents of a GitHub issue (Claude Code Web: `gh` command, others: via MCP).

### 2. Decision to delegate to Architect

#### 2-0. Disassembled gate (required/top priority)

Before making a decision to delegate to Architect, obtain all comments on the issue and check whether there is a `[Parent branch created]` or `[親ブランチ作成済み]` marker.
Must be performed regardless of title type (`[Story]` / `[Task]` / `[Bug]` / No tag)
(Since the `[Task]` issue may also be disassembled into Architect via the observable change gate. Preventing the duplicate publication accident of #1337 from happening again).

**This marker is the only criterion for judgment. The presence or absence of sub-issues is not used for judgment**
(As related tasks are manually linked to sub-issues, “sub-issue exists = disassembled” is a false positive.)

**If there is a marker (Architect exploded):**

1. Do not call `xp_Architect` (re-disassembly is prohibited. Re-disassembly and task addition are delegated to Architect only when explicitly instructed by the user)
2. Get the list of sub-issues ( `mcp__github__issue_read` method: `get_sub_issues` ) and check the progress based on the presence or absence of `[Auditor GREEN]` in the comments of each sub-issue
3. If there are any unfinished sub-issues left: Comment your progress and next actions on the parent issue and stop:
   ```
[Disassembled] This issue has already been disassembled by Architect, so it will not be disassembled again.
Completed: #<number>, ... / Remaining: #<number>, ...
Next: Run /xp_Director <next available subtask number>.
   ```
4. If all sub-issues have been completed: Proceed to step 3-e, AllGREEN flow

**If there is no marker:** Proceed to the following delegation decision as usual.

#### 2-1. [Task] Check observable changes in issue

If the title says `[Task]`, pass the **observable change check** (lightweight gate) before bypassing Architect completely:

1. Read the issue text/title and determine whether it involves a change in behavior that is observable from the user/external side.
- Example: Change only SKILL.md/document description, change only setting values, only internal refactor → **None**
- Example: Implementation involving addition/change of API/endpoint, addition/change of UI, change of output content → **Yes**
2. Record the judgment result as a comment on the issue:
   ```
## Observable change check ([Task] Skip judgment)

Target: #<issue_number>
Observable behavior changes: Yes/No
Reason: <Reason for judgment>
   ```
3. If the judgment is **None**: Skip Architect and proceed directly to the execution flow (3.).
4. If the judgment is **Yes**: Call `xp_Architect <issue_number>` without skipping Architect.
→ Architect executes 1-1 (determining whether E2E/spec is necessary for a task issue) and issues the necessary E2E/spec subtask.

Other than `[Task]` (`[Story]`, `[Bug]`, no tag), the above gate is not performed and `xp_Architect <issue_number>` is always called.
→ Architect categorizes issues into **Story / Task / Bug** and returns an execution plan (list of sub-issues).

**After Architect completion (for Story/Bug):**

1. Check if `feature/issue-{number}` branch exists remotely:
   ```bash
git fetch origin feature/issue-{number} 2>/dev/null && echo "exists" || echo "not found"
   ```
2. Create and push if it doesn't exist:
   ```bash
git checkout -b feature/issue-{number}
git push -u origin feature/issue-{number}
   ```
If it already exists, skip it (ClaudeCode Web immediately renames the automatically generated branch from main).
3. Record the start of work on the parent Bug/Story issue:
   ```
Start of work YYYY-MM-DD HH:MM JST
Session URL: https://claude.ai/code/session_XXXXXXXX
   [ProjectStatus: InProgress]
   ```
4. Log a comment on the issue:
   ```
[Parent branch created] [親ブランチ作成済み] feature/issue-{number}
Please run /xp_Director <first subtask number> in your next session.
   ```
5. After **Architect completes, create the parent branch and stop it (subissues will be processed in the next session).**

### 3. Execution flow (for task issue)

**[1 task 1 PR rule]**
Even if Architect publishes multiple sub-issues, only the first task will be executed in one run.**
After completing one task and issuing a PR, it will always stop, and the next task will start at the next `/xp_Director` call.

**Identification of task type:**
Check the title of each sub-issue and the `task_type:` description in the main text, and classify it into one of the following:

| Task type | Identification conditions | Processing method |
|---|---|---|
| `e2e_test_creation` | Title: "E2E test suite creation" or task_type: e2e_test_creation | Call `xp_E2Etest <parent story number>` (pass parent story number instead of task number, always Claude). The following documentation ( `xp_doc_E2ETests` ) will be replaced with `xp_DocumenterCodex` when `implementer=codex` is specified |
| `spec_update` | Title: "Functional Specification Update" or task_type: spec_update | Call `xp_doc_spec <epic> <parent story number>`. Not implemented or tested (always unaffected by Claude or `implementer=codex` as it depends on GitHub API) |
| `bug_reproduction_test` | Title: "Add bug reproduction test" or task_type: bug_reproduction_test | Call `xp_Tester <task_issue>` (always unaffected by Claude, `implementer=codex`). In the subsequent documentation, when `implementer=codex` is specified, replace it with `xp_DocumenterCodex` |
| Normal implementation task | Other than the above | When `implementer=codex` is specified: `xp_Tester` is omitted and `xp_ImplementerCodex` (test creation + implementation) → `xp_Auditor test` → `xp_DocumenterCodex` → `xp_Auditor doc`. If omitted: Traditional flow (xp_Tester + xp_Implementer + xp_Auditor + xp_Documenter + xp_Auditor doc, all Claude) |

**Sub-Task preprocessing (before starting xp_Tester):**

1. Extract all dependent issue numbers from the `## Dependencies` section of the issue body and check if there is a `[Auditor GREEN]` comment (do not check the closed status of GitHub)
- Extracts both explicit fields such as `depends_on: #123` and references to `#<number>` in natural sentences such as "Start this task after #123 is completed." Even in old-style issues without the `depends_on:` field, all `#<number>` in the section are treated as dependencies.
- If "None (ready to start)", there is no dependency.
- Just the presence of `[Auditor GREEN]` is not considered resolved. Since subtask PRs are merged by the user (they are not automatically merged), also check that the `--base feature/issue-{parent number}` PR associated with the dependent issue is actually in the `merged` state:
     ```bash
gh pr list --search "#<dependency number>" --base feature/issue-{parent number} --state merged --json number,mergedAt
     ```
If there is no hit (PR has not yet been merged with the user), treat it as unresolved.
2. Get `feature/issue-{parent number}` from the “## Parent Branch” section of the issue body
3. Check if the parent branch exists on the remote:
   ```bash
git fetch origin feature/issue-{parent number} 2>/dev/null && echo "exists" || echo "not found"
   ```
4. If it exists: Rebase current branch on parent branch:
   ```bash
git rebase origin/feature/issue-{parent number}
   ```
5. Specify `--base feature/issue-{parent number}` when issuing PR

**If depends_on is unresolved (one of the dependencies does not have `[Auditor GREEN]` or the corresponding PR has not been merged):**
- Stop by commenting on the issue without starting:
  ```
⚠️ Does not start because depends_on destination #<dependency number> is unresolved.
If [Auditor GREEN] is not available: Process #<dependent number> with /xp_Director <dependent number> first.
[Auditor GREEN] has been completed but the corresponding PR has not yet been merged: Waiting for the owner to merge the PR. Please try again after merging.
  ```

**If parent branch does not exist:**
- Comment and stop an issue:
  ```
⚠️ Parent branch feature/issue-{parent number} not found.
Please process the parent Story (#parent number) with /xp_Director {parent number} first.
  ```

```
a. Identify sub-issues without a depends_on block
b. Select only the first item as the current execution target (parallel execution will not be performed)
c. Identify the task type of the selected subissue

[For e2e_test_creation task] (E2E creation is always done by Claude, only documentation is switched with implementer=codex)
i. Get the parent story number from the issue body
ii. xp_E2Etest <parent story issue number> ← Pass parent number instead of task number (always Claude, due to authorship of acceptance condition)
   iii. xp_Auditor test <epic> <task_issue>
- GREEN → [Auditor GREEN] Comment
iv. xp_doc_E2ETests <epic> (replace with `xp_DocumenterCodex <epic> <task_issue>` when `implementer=codex` is specified)
   v.   xp_Auditor doc <epic> <task_issue>
- OK → PR issue (E2E test file + E2E test document commit)
→ Stop

[For spec_update task] (Unaffected by implementer=codex as it depends on GitHub API)
i. Get the parent story number from the issue body
ii. xp_doc_spec <epic> <parent story issue number>
   iii. xp_Auditor doc <epic> <task_issue>
- OK → PR issue
→ Stop

[For bug_reproduction_test task] (Bug reproduction test creation is always done by Claude, only documentation is switched)
i. xp_Tester <task_issue> (always Claude. Performs special processing that allows Tester to determine that "Implementer is not required")
   ii.  xp_Auditor test <epic> <task_issue>
- GREEN → [Auditor GREEN] A comment is written.
iii. xp_Documenter <epic> <task_issue> (replace with `xp_DocumenterCodex <epic> <task_issue>` when `implementer=codex` is specified)
   iv.  xp_Auditor doc <epic> <task_issue>
- OK → xp_Director issues PR (base settings and Closes description are the same as [Normal implementation tasks] below)

[For normal implementation tasks]
`implementer=codex` Not specified (default):
   i.   xp_Tester <task_issue>
   ii.  xp_Implementer <task_issue>
   iii. xp_Auditor test <epic> <task_issue>
- RED (same task scope) → sent back to xp_Implementer (up to 3 times)
- RED (bug in another task scope) → Auditor has already published a new bug issue → Go to next loop in normal priority queue
- Stop escalating if it exceeds 3 times/Comment on the issue and exit
- GREEN → [Auditor GREEN] A comment is written.
   iv.  xp_Documenter <epic> <task_issue>
   v.   xp_Auditor doc <epic> <task_issue>

When specifying `implementer=codex` (xp_Tester is not called. xp_ImplementerCodex also includes test creation):
   i.   xp_ImplementerCodex <task_issue>
(If there is an existing test, just implement it, if not, create a test + implement it. For details, refer to xp_ImplementerCodex SKILL.md)
   ii.  xp_Auditor test <epic> <task_issue>
- RED (same task scope) → sent back to xp_ImplementerCodex (up to 3 times)
- RED (bug in another task scope) → Auditor has already published a new bug issue → Go to next loop in normal priority queue
- Stop escalating if it exceeds 3 times/Comment on the issue and exit
- GREEN → [Auditor GREEN] A comment is written.
   iii. xp_DocumenterCodex <epic> <task_issue>
   iv.  xp_Auditor doc <epic> <task_issue>

In either case, xp_Auditor doc is OK → xp_Director issues PR:
Properly set branch base when issuing PR:
- If there is a feature branch of the parent Story: `--base feature/issue-{parent number}`
- If not (root task): `--base main`
Include `Closes #<issue number>` in PR body

d. After PR issuance is complete, execute the following in order and then be sure to stop:

1. Close the task issue explicitly (GitHub auto-close doesn't work because the PR points to the parent branch):
   ```bash
   gh issue close <task_issue>
   ```

2. Record stage comments:
   ```
   [ProjectStatus: Done]
   ```

3. **Be sure to stop here. **Regardless of whether there are remaining sub-issues or AllGREEN judgment,
No further processing is performed in this run (this `/xp_Director` call).
Do not continue performing e. below.

e. [Reference/Not executed in this run] AllGREEN Check · About the AllGREEN flow

The following is an explanation of "When and who will detect AllGREEN and issue a parent branch PR next time".
**Does not apply to this run (immediately after stopping at step d).**

AllGREEN will evaluate the parent Story/Bug issue the next time `/ProcessIssue` is run.
(Detected by ProcessIssue 2-2-C "Architected issue check").
From there, when `xp_Director <parent issue number>` is called **as a separate run**,
Run the flow below:
1. Call `xp_Auditor test <epic> <parent story number>` (Story-level acceptance test)
- GREEN → `[Auditor GREEN]` Comment is written (xp_Auditor's responsibilities end here)
2. **After confirming Story-level Auditor GREEN, xp_Director calls `xp_Reviewer <epic> <parent story number>`** (Code review. If a high risk is found, an improvement recommendation issue will be automatically raised)
3. Call `xp_Auditor doc <epic> <parent story number>` (document check)
4. Check E2E test suite with `xp_RunE2ETests`
5. **Spec_update task completion confirmation (AllGREEN prerequisite):**
- Identify the task with the title `task_type: spec_update` or "Functional Specification Update" from the sub-issue list
- spec_update task only passes through `xp_doc_spec` → `xp_Auditor doc`, completion marker is `[Auditor doc OK]` (`[Auditor GREEN]` is not output)
- If the corresponding task exists and there is no `[Auditor doc OK]` in the comment: It is assumed that AllGREEN is not established and the task is stopped without issuing a PR. Record the following in the parent issue:
        ```
⚠️ Spec_update task (#<spec_update_issue number>) has not been completed, so AllGREEN judgment will be postponed.
Please process with /xp_Director <spec_update_issue number> first.
        ```
- Proceed to the next step only if the corresponding task does not exist or has been `[Auditor doc OK]`
6. **Confirm merging of all subtask PRs (AllGREEN prerequisite):** Subtask PR (`--base feature/issue-{parent number}`) will be merged by the user (not automatically merged),
Even if `[Auditor GREEN]` / `[Auditor doc OK]` are present, it does not necessarily mean that the PR has actually been merged. The unmerged subtask PR is
If you proceed without merging into the parent branch, the PR for main created next will not include some of the subtask changes, so be sure to check.
The presence or absence of `--state open` will miss "PRs that were closed without merging" (even if there are 0 open items, it does not necessarily mean that they have been merged).
For each completed sub-issue, check the existence of the corresponding `merged` PR:
      ```bash
gh pr list --search "#<subissue number>" --base feature/issue-{parent number} --state merged --json number,mergedAt
      ```
- If even one of the completed sub-issues cannot find the corresponding `merged` PR (open without merging, or
(including both cases where it is closed without being merged), AllGREEN is considered to be unsatisfactory and will be stopped without issuing a PR. Record the following in the parent issue:
        ```
⚠️ AllGREEN judgment will be postponed because no merged PR corresponding to subtask #<subissue number> was found.
After merging the PR by the owner (reopening and merging if it has been closed), please run /xp_Director <parent issue number> again.
        ```
- Proceed to the next step only if the merged PR corresponding to the fully completed sub-issue is confirmed
7. If acceptance test GREEN/xp_Reviewer completed/spec_update completed/all subtask PRs merged: Parent branch → Issue PR for main:
      ```bash
gh pr create --base main --head feature/issue-{parent number} --title "..." --body "Closes #<parent number>"
      ```
After publishing, record the following in the parent issue and close the story issue:
-`[Parent branch PR issued]`
- `Work completed YYYY-MM-DD HH:MM JST / Time required: XX minutes` (from the start of the first subtask to the present)
→ When acceptance test (E2E) fails: xp_Auditor creates a new sub-issue with the failure details and the story continues.
→ xp_Director stops here (Auditor is in charge of subsequent control)
```

### 4. Writing stage comments

Record comments to subissues at the start/completion of each stage:

```
[Tester running]
[Tester completed]
[Implementer running]
[Implementer completed]
[Auditor test running]
[Auditor GREEN]
[Documenter running]
[Documenter completed]
[Checking Auditor document]
[PR issued #xx]
[ProjectStatus: InProgress] ← When starting
[ProjectStatus: Done] ← When completed
```

**Work log comment (required):**

Record when task starts (before xp_Tester starts):
```
Start of work YYYY-MM-DD HH:MM JST
Session URL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

[Auditor GREEN] Record after confirmation:
```
Work completed YYYY-MM-DD HH:MM JST / Required time: XX minutes
```

For the required time, record the actual time (minutes) from `Start Work` to `[Auditor GREEN]`.
Comments on past working hours that do not specify JST are interpreted as UTC. Be sure to add `JST` to new comments.

### 5. depends_on resolution decision

- Don't check GitHub's closed state
- **Unblocked if there is `[Auditor GREEN]` in the dependent sub-issue comment**
- Unblocked subissues will be executed the next time `/xp_Director` is called
- Since only one task is executed in one run, it will not be executed immediately even if it is unblocked.

---

## GitHub access method

| Environment | Access |
|---|---|
| Claude Code Web | `gh` command |
| claude.ai / Others | Via MCP |

Detect the environment and automatically switch.

**⚠️ gh CLI limitations:** `gh issue view --json subIssues` is not supported.
To retrieve subissues, use `mcp__github__issue_read` (method: `get_sub_issues`) regardless of the environment.

---

## Notes

- Do not write to code file
- If there is a conflict or error that cannot be determined, comment on the issue and stop it.
- Can be sent back up to 3 times. If exceeded, escalate to user
