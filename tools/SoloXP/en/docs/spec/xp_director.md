# xp_Director functional specification

## overview

xp_Director is the command center skill for Solo XP workflow. Controls the execution order and timing of all skills and does not touch the code.

---

## Command

| Command | Description |
|---|---|
| `xp_Director <issue_number>` | Controls the workflow of the specified issue |
| `xp_Director` (no arguments) | Immediately delegate to `/ProcessIssue` |

---

## Processing flow

### Without arguments: Delegates to ProcessIssue

Immediately delegate processing to `/ProcessIssue` and stop. ProcessIssue is in charge of issue selection and distribution logic.

### Delegation decision to Architect (observable change check)

If the title says `[Task]`, pass the observable change check (lightweight gate) before bypassing Architect completely:

1. Determine from the issue text/title whether it involves changes in behavior that are observable from users/externals.
   - Example: Change only SKILL.md/document description, change only setting values, only internal refactor → **None**
   - Example: Implementation involving addition/change of API/endpoint, addition/change of UI, change of output content → **Yes**
2. Record the judgment result as a comment on the issue:
   ```
   ## Observable change check ([Task] Skip judgment)

   Target: #<issue_number>
   Observable behavior changes: Yes/No
   Reason: <Reason for judgment>
   ```
3. **None** → Skip Architect and proceed directly to the execution flow
4. **Yes** → Call `xp_Architect <issue_number>` without skipping Architect (Architect executes 1-1 E2E/spec necessity judgment)

For anything other than `[Task]` (`[Story]`, `[Bug]`, no tag), the above gate is not performed and `xp_Architect <issue_number>` is always called.

### Task issue processing

**[1 task 1 PR rule]** — Even if there are multiple sub-issues, only one task is executed at a time.

#### Identifying task type

| Type | Identification condition | Processing |
|---|---|---|
| `e2e_test_creation` | "E2E test suite creation" or task_type: e2e_test_creation | xp_E2Etest <parent story number> |
| `spec_update` | "Functional specification update" or task_type: spec_update | xp_doc_spec <epic> <parent story number> |
| `bug_reproduction_test` | "Add bug reproduction test" or task_type: bug_reproduction_test | xp_Tester <task_issue> |
| Normal implementation task | Other than above | xp_Tester + xp_Implementer + xp_Auditor + xp_Documenter |

#### Execution steps for typical implementation tasks

```
a. Identify sub-issues without a depends_on block
b. Select only the first item (do not execute in parallel)
c. Identify the task type and execute the corresponding flow
d. PR issuance complete → Always stop (no further processing will be performed in this run, regardless of whether there is an AllGREEN judgment)
```

### AllGREEN → xp_Auditor Story-level delegation flow (run as a separate run)

The AllGREEN check will not be run in this `/xp_Director` run. The next time `/ProcessIssue` is executed, it will be detected during the evaluation stage of the parent Story/Bug issue (ProcessIssue 2-2-C "Architected Story check"):

1. If there is `[Auditor GREEN]` in the comments of all sub-issues, **AllGREEN**
2. For AllGREEN, ProcessIssue calls `xp_Director <parent issue number>` as a separate run and does the following:
   - Delegate to `xp_Auditor test <epic> <parent story number>` (Story-level quality gate)
   - xp_Auditor executes acceptance tests (E2E tests) and xp_Reviewer calls
   - **spec_update task completion confirmation (AllGREEN prerequisite):**
     - Identify the task with the title `task_type: spec_update` or "Functional specification update" from the sub-issue list
     - If the relevant task exists but `[Auditor GREEN]` is not present: It is assumed that AllGREEN is not established and stops without issuing a PR. Record the following in the parent issue:
       ```
       ⚠️ Spec_update task (#<spec_update_issue number>) has not been completed, so AllGREEN judgment will be postponed.
       Please process with /xp_Director <spec_update_issue number> first.
       ```
     - Proceed to the next step only if the corresponding task does not exist or has been `[Auditor GREEN]`
   - If the acceptance test is GREEN and spec_update has been completed: Parent branch (feature/issue-{number}) → issue PR for main and close the story issue. Record `[parent branch PR issued]` comment after publishing
   - When the acceptance test fails: A new sub-issue will be created with the details of the failure and the story will continue.
3. If there are unfinished sub-issues → stop immediately

---

## depends_on resolution decision

- Extract the dependent issue number from the `## Dependencies` section. Targets both explicit fields like `depends_on: #123` and `#<number>` references in natural sentences such as "This task should start after #123 is completed" (even in old-style issues without the `depends_on:` field, all `#<number>` in the section are treated as dependencies)
- Don't check GitHub's closed state
- Unblock if there is `[Auditor GREEN]` in the dependent sub-issue comment
- Even if it is unblocked, it will not be executed immediately in one run (it will start on the next call)

---

## Stage comments

Record in subissues at the start/completion of each stage:

```
[Tester running] / [Tester completed]
[Implementer running] / [Implementer completed]
[Auditor test running] / [Auditor GREEN]
[Documenter running] / [Documenter completed]
[Checking Auditor document]
[PR issued #xx]
[Parent branch PR issued] #xx ← When feature→main PR is issued after AllGREEN
```

**Work log (required):**

**Log to parent Bug/Story issue (after Architect completes):**
After completing Architect and creating the parent branch, record it in the parent Bug/Story issue:
```
Start of work YYYY-MM-DD HH:MM JST
Session URL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

**Record in subtask issue (when task starts):**
At the start of each subtask (before starting xp_Tester), record the following in one comment:
```
Start of work YYYY-MM-DD HH:MM JST
Session URL: https://claude.ai/code/session_XXXXXXXX
[ProjectStatus: InProgress]
```

**Record in parent issue after AllGREEN completion:**
```
Work completed YYYY-MM-DD HH:MM JST / Required time: XX minutes
```


## Working hours time zone

For new working time comments, be sure to add the `JST` suffix to the date and time in Japan time. Past comments that do not specify JST are interpreted as UTC for backward compatibility. `xp_worklog` calculates the required time after normalizing the time with `JST` to JST and the time without `JST` to UTC.

---

## Notes

- Do not write to code file
- Can be sent back up to 3 times. If exceeded, stop escalation

---

## Changelog

| Date | Version | Changes | Issue |
|---|---|---|---|
| 2026-06-21 | 1.1.0 | `[Task]` Added observable change check (lightweight gate) before skipping. Added completion confirmation gate for spec_update task to AllGREEN prerequisites | #1557, #1566, #1567 |
| 2026-07-15 | 1.2.0 | Unify working time comments to JST specification and add backward compatibility rules to treat past comments without JST specification as UTC | #2080 |
