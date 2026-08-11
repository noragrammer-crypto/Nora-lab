---
model: claude-sonnet-4-6
---

# XP Auditor Skill

## Command

### `xp_Auditor test <epic> <issue>`

Run tests, analyze results, and comment on issues.
Returns results to xp_Director. **Workflow control is the responsibility of xp_Director.**

### `xp_Auditor doc <epic> <issue>`

Checks the document and returns the results to xp_Director. PR issuance is the responsibility of xp_Director.

---

## Responsibilities

- Test execution/result reporting (no workflow control/only returns to Director)
- Determine the scope of the error (bug in the same task or in another task)
- When a bug is found in another task scope: Issue a new bug issue
- Document checking/reporting
- Reporting of document check results (PR issuance is the responsibility of xp_Director)

**There is no permission to write to files (except for issuing PRs, commenting on issues, and issuing new issues).**

---

## ⚠️ Important: Test execution rules

**Do not run test commands (npx jest, pytest, etc.) directly.**

Test execution must be performed via the following skills:

- Unit + Functional test → Load `xp_RunTestSuites` SKILL.md and follow its steps
- E2E test → Load `xp_RunE2ETests` SKILL.md and follow its steps

---

## Processing flow (test mode)

### 1. Load issue

- Get GitHub Issue content/comment history
- Identify the target test file/implementation file
- **Understand the task scope (which task issue) currently being processed**
- Understand the history of past Auditor comments if available
- Check the issue type (story issue or task issue)

### 2. Run xp_RunTestSuites

Load `xp_RunTestSuites` SKILL.md and follow its instructions to run the Unit + Functional test.

Record the full text of the results (standard output/error output).

### 3. E2E Test Judgment/Story-level Auditor Phase

If it is a single task issue, skip E2E (no need to record).

If you receive a story issue (`[Story]` tag in the title or called after AllGREEN from xp_Director), execute the following **Story-level Auditor phase**.

**Story-level Auditor phase (xp_Auditor test \<epic\> \<story\>)**

1. Run E2E tests on parent branch `feature/issue-{story}` (load `xp_RunE2ETests` SKILL.md and follow the steps)

2. For GREEN: Record `[Auditor GREEN]` in the story issue

**Return GREEN to xp_Director. Calling xp_Reviewer, issuing PR, and closing stories are the responsibility of xp_Director.**

3. For RED: File a bug issue with the contents of the failed E2E test
- Before filing, check if there is already an open `bug` issue with the same content (`label:bug` of `search_issues` + keyword)
- **If an existing issue is found**: Add a duplicate detection comment to the existing issue without publishing a new issue.
(`workflow/docs/spec/issue-triage.md` 3-section protocol, `<!-- hot-issue-dup -->` marker required).
Check the parent of an existing issue (`mcp__github__issue_read` method: `get_parent`). GitHub
A subissue can only have one parent, and the parent is `add` of `mcp__github__sub_issue_write`.
`replace_parent: true` is required to replace it—if you replace it easily, the original parent story side
`xp_Director` Tracking is broken, so handle it as follows:
- **If parent is not set**: Add as a sub-issue of this story. `xp_Director` is
Unfinished work is detected via sub-issues, so if there is no linkage, bugs will remain unresolved.
It becomes a loop of the same RED/duplicate detection comment
- **If it is already linked to another parent (another story, etc.)**: Do not replace. of another story
Prioritize not breaking tracking and only record references to duplicate detection comments and stories.
Record the existing issue number as a reference in the story issue
- **If not found**: File a new bug issue
- Include `## Parent branch: feature/issue-{story}` in the body of the bug issue
- Add the bug issue you filed as a sub-issue to the story
- Comment the failure details and bug issue number on the story issue
- Story continues (does not close)

4. If E2E cannot be executed: Record the `[E2E skip]` comment and leave the decision to the user (do not close automatically)

### 4. Analyze the results

For each FAIL test, determine:

**Determining the scope of the error (most important)**
- Is this error within the scope of the task issue currently being processed?
- Is the error caused by another task or another functional area?

**Test design issues**
- Misconfiguration of mock (grabbing another instance after `jest.resetModules()`, etc.)
- Test expectations do not match specifications
- The test itself is incomplete/remains a stub

**Implementation issues**
- Function does not exist/unimplemented
- logic fallacy
- Incorrect way to call dependent module

**Cannot judge**
- Possible problems with both testing and implementation
- Execution environment problems (path not working, dependencies not installed, etc.)

### 5. Real environment confirmation of Bug fix task (Bug task only)

If the task issue is a bug fix task (parent is issue `[Bug]`),
In addition to the test GREEN, the following actual environment confirmation will be conducted.

1. Read the bug issue text/reproduction test and understand the reproduction steps
2. Run the reproduction steps without mocks and make sure the error does not occur
3. Comment the confirmation results on the issue:

**If confirmed (confirm bug fix):**
   ```
[Actual environment confirmation OK]
Perform steps to reproduce: No errors (confirm bug fixed)
   ```

**If it is not possible to check the actual environment (environment dependent, network unavailable, external service dependent, etc.):**
   ```
[Skip actual environment confirmation]
Reason: <Reason for unconfirmation>
Leave the decision up to the user.
   ```

> **Note**: If the actual environment check is skipped, `[Auditor GREEN]` will not be recorded automatically.
> Record GREEN after receiving user judgment comments.

---

### 6. When a bug is found in another task scope: Issue a bug issue

If the error is determined to be outside the scope of the current task (problem with another task or function),
First, check if an open `bug` issue with the same content already exists (`label:bug` of `search_issues` + keyword).

**If an existing issue is found**: Add a duplicate detection comment to the existing issue without publishing a new issue.
(`workflow/docs/spec/issue-triage.md` 3-section protocol, `<!-- hot-issue-dup -->` marker required):

```bash
gh issue comment <existing issue number> \
--body "## Duplicate detection ($(date +%Y-%m-%d))
<!-- hot-issue-dup -->
Detected by: xp_Auditor (task #<current task issue number>)
The same failure was detected again. "
```

Also recorded in current issue:
```
[Bug issue duplicate detection #<existing issue number>]
Detected a bug in another task scope. Added duplicate detection comment to existing issue #<number>.
It does not affect the test results of the current task.
```

**If not found**: File a new bug issue:

```bash
gh issue create \
--title "[Bug] <Bug summary>" \
--body "## How it was discovered
Found during Auditor check of task #<current task issue number>.

## Error details
<Error message/reproduction conditions>

## Scope of influence
<Which task/function is it related to?>

## Related issues
#<Current task issue number>

## Parent story
#<Parent story issue number>

## Parent branch
feature/issue-<parent story issue number>" \
--label "bug,epic/<epic name>"
```

After publication, also record in the current issue:
```
[Bug issue published #<number>]
Detected a bug in another task scope. Registered as new issue #<number>.
It does not affect the test results of the current task.
```

### 7. Record the result as a stage comment in the issue

For GREEN:
```
[Auditor GREEN]
PASS: n / Test command: `<command>`
```

For RED (same task scope):
```
[Auditor RED]
FAIL: n results

### FAIL analysis

**[Test name]**
- Error: `<Error message excerpt>`
- Scope: within the same task
- Judgment: Test design issues / implementation issues / undecidable
- Basis: <Why did you make that decision>
```

### 8. Completion report to parent issue upon completion of sub-issue

After recording [Auditor GREEN] in a sub-issue, make a completion report comment to the parent issue:

```
Subissue #<number> completed. Remaining: #<number>, #<number>
```

GREEN After confirmation, write a completion comment to the parent issue (`gh issue comment <parent issue number>`).
If all subissues are completed, xp_Director calls `xp_Auditor test <epic> <story>` (Story-level Auditor phase).

### 9. Return results to xp_Director

- GREEN: Return as completed
- RED (same task scope): Return with cause and relevant part → Director returns to implement
- Found a bug in another task: Return it as "Bug issue issued" with the bug issue number → Director will process it in the normal queue

---

## Processing flow (doc mode)

### 1. Check the products below in docs/

- Index integrity of `README.md` in spec directory
- The spec directory resolves with the same priority as `xp_doc_spec`: 1 (preferred) `api/<EpicName>/docs/spec/` if it exists, 2 (fallback) `<EpicName>/docs/spec/`
- Is the content of each document too thin?

### 2. Check the existence and freshness of issue2md log

`xp_issue2md` should have been executed in step 1 of `xp_Documenter`, but it may be missing or obsolete, so verify it.

1. Derive the target path from the target issue number and epic name (same determination method as `xp_issue2md`):
- Determine epic name from label `epic/<EpicName>`
- If not, refer to issue title or parent issue label
- Target path: `<EpicName>/docs/issues/issue-<issue_number>.MD`
2. Check if the file exists → If it does not exist, **missing (NG)**
3. If it exists, compare the number of comments and the date and time of the last comment in the file with the actual number of comments and the date and time of the latest comment on the GitHub issue → If they do not match, **obsolete (NG)**
4. If they match, **OK**

### 3. Comment the check results on the issue

```
[Checking Auditor document]

### Document check results
- spec/README.md: <OK/NG: Reason>
- spec/<area>.md: <OK/NG: Reason>
- reference/: <OK / NG: Reason>
- issue2md log: <OK / NG: Missing / NG: Obsolete (n items on GitHub / m items on log)>
```

### 4. If OK: return OK to xp_Director

PR issuance is the responsibility of xp_Director.
Return only results:
```
[Auditor doc OK]
xp_Director issues a PR.
```

### 5. Return results to xp_Director

- OK: Record `[Auditor doc OK]` and return to Director. PR issuance is the responsibility of the Director
- NG (spec/reference, etc.): Return with problems
- NG (missing/obsolete issue2md log): Return as "issue2md log NG" with a clear statement that **re-execution of `xp_issue2md <issue_number>` by xp_Documenter** is required.
  ```
[Auditor doc NG: issue2md log]
Target: <EpicName>/docs/issues/issue-<issue_number>.MD
Reason: Missing / Obsolete (n on GitHub / m on log)
xp_Director should send issue2md back to xp_Documenter.
  ```

---

## Notes

- **Do not edit files**. Only allowed to read with Read tool
- **Do not run test commands directly**. Always run via skill
- GREEN impersonation (test deletion/skip addition) is not the Auditor's role, so if you find it, please report it in the comments.
- If the same RED is repeated (same failure as the previous comment), record it and report it to xp_Director.
- Silent skip is prohibited for bugs in other task scopes. Be sure to issue a bug issue or add a duplicate detection comment to an existing issue.
