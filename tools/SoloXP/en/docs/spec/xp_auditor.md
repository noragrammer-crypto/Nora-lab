# xp_Auditor functional specifications

## overview

xp_Auditor is a skill responsible for test execution, result analysis, and quality reporting. Does not perform workflow control and returns results to xp_Director.

## Command

### `xp_Auditor test <epic> <issue>`

Executes the tests for the specified task issue, comments the results to the issue, and returns them to xp_Director.

### `xp_Auditor doc <epic> <issue>`

Checks the document and returns the results to xp_Director. PR issuance is the responsibility of xp_Director.

### `xp_Auditor` (no arguments)

Audit the entire repository and print a report.

---

## Processing flow of test mode

### Test execution rules

**Do not run test commands (npx jest, pytest, etc.) directly.**

Test execution must be performed via the following skills:

- Unit + Functional tests → `xp_RunTestSuites` Follow SKILL.md
- E2E test → `xp_RunE2ETests` Follow SKILL.md

### procedure

1. Read the issue and understand the scope and task type
2. Run Unit + Functional tests via `xp_RunTestSuites`
3. **E2E test decision (Story-level Auditor phase)**: Skip E2E for a single task issue. Run **Story-level Auditor phase** if called as `xp_Auditor test <epic> <story>` after AllGREEN from xp_Director:
   - Run E2E tests with `xp_RunE2ETests`
   - GREEN → Record `[Auditor GREEN]` in the story issue and **return it to xp_Director**. xp_Director is responsible for calling xp_Reviewer, issuing PR, and closing stories.
   - RED → File a bug issue and continue the story
   - E2E cannot be executed → `[E2E Skip]` Record the comment and leave it to the user

4. Determine the scope for each FAIL test:
   - **Within the same task scope**: Returned to Implementer
   - **Separate task scope**: Issue a new bug issue and put it in the normal queue

5. **Real environment verification of bug fix tasks (Bug tasks only)**: If the parent issue of the task is `[Bug]`, in addition to test GREEN, perform the following:
   1. Read the bug issue text/reproduction test and understand the reproduction steps
   2. Run the reproduction steps without mocks and make sure the error does not occur
   3. If confirmed → record `[Actual environment confirmation OK]` as a comment and issue [Auditor GREEN]
   4. If actual environment confirmation is not possible (environment dependent, network unavailable, etc.) → `[Actual environment confirmation skip]` + Comment the reason and leave the decision to the user ([Auditor GREEN] will not be automatically recorded)

6. Record the results as stage comments in the issue

### Stage comments

For GREEN:
```
[Auditor GREEN]
PASS: n items / test command: `<command>`
```

For RED (same task scope):
```
[Auditor RED]
FAIL: n results
### FAIL analysis
...
```

### Sub-issue completion report

When the task issue becomes GREEN, write a completion report comment to the parent story issue.

**procedure:**
1. Get the parent issue number from the sub-issue body "## Parent story" section
2. Among open sub-issues with the same parent, those that have not been recorded as `[Auditor GREEN]` are considered "remaining"
3. Comment to parent issue: `Sub issue #xx completed. Remaining: #yy, #zz`

**Comment format:**
```
Sub-issue #42 completed. Remaining: #43, #45
```
When all sub-issues are completed:
```
Sub-issue #42 completed. Remaining: None (all tasks completed)
```

### Return to xp_Director

- GREEN: Return as completed (completion has been reported to the parent issue)
- RED (same task scope): Return with cause and relevant part → Director returns to Implementer
- Found a bug in another task: Return it as "Bug issue issued" with the bug issue number

---

## doc mode processing flow

### procedure

1. Check index integrity of `<EpicName>/docs/spec/README.md`
2. Make sure each spec document is not too thin
3. Comment the check results on the issue:

```
[Checking Auditor document]

### Document check results
- spec/README.md: <OK/NG: Reason>
- spec/<area>.md: <OK/NG: Reason>
```

4. If OK: Return OK to xp_Director (xp_Director is responsible for issuing PR):
```
[Auditor doc OK]
xp_Director issues a PR.
```

### Return to xp_Director

- OK: Record `[Auditor doc OK]` and return to Director. PR issuance is the responsibility of the Director
- NG: Return with problem points

---

## Notes

- **Do not edit files**. Only allowed to read with Read tool
- **Do not run test commands directly**. Always run via skill
- GREEN impersonation (test deletion/skip addition) is prohibited
- Silent skip is prohibited for bugs in other task scopes. Always issue a bug issue
