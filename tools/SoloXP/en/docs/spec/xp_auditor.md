# xp_Auditor functional specifications

## Overview

xp_Auditor is a skill responsible for test execution, result analysis, and quality reporting.
Does not perform workflow control and returns results to xp_Director.

## Command

### `xp_Auditor test <epic> <issue>`

Executes the tests for the specified task issue, comments the results to the issue, and returns them to xp_Director.

### `xp_Auditor doc <epic> <issue>`

Checks the document and returns the results to xp_Director. PR issuance is the responsibility of xp_Director.

### `xp_Auditor` (no argument)

Audit the entire repository and print a report.

---

## Processing flow of test mode

### Test execution rules

**Do not run test commands (npx jest, pytest, etc.) directly. **

Test execution must be performed via the following skills:

- Unit + Functional test → Follow `xp_RunTestSuites` SKILL.md
- E2E test → Follow `xp_RunE2ETests` SKILL.md

### Steps

1. Read the issue and understand the scope and task type
2. Run Unit + Functional tests via `xp_RunTestSuites`
3. **E2E test decision (Story-level Auditor phase)**: Skip E2E for a single task issue. Run **Story-level Auditor phase** if called as `xp_Auditor test <epic> <story>` after AllGREEN from xp_Director:
   - Run E2E tests with `xp_RunE2ETests`
   - **GREEN/RED judgment includes not only E2E alone but also 2. Unit + Functional comprehensive judgment (#2814)**
   - GREEN (The number of block targets owned by the own story is zero. Both Unit + Functional comprehensive judgment and E2E are applicable) → Record `[Auditor GREEN]` in the story issue and **return to xp_Director**. xp_Director is responsible for calling xp_Reviewer, issuing PR, and closing the story.
   - RED → Raise a bug issue (if there is RED in either Unit/Functional/E2E. Same logic regardless of test type), apply **ownership-based asymmetric block (#2807/#2809)**: The parent of the existing bug issue is the own story, the parent is not set, or the parent story is already **closed** (`replace_parent: true` #2818) If new ownership is acquired, the story will be blocked (the story will not be continued or closed). Do not block if the parent is **another open story** (Record only the duplicate detection comment and proceed. Mutual lock resolution of #2807)
   - E2E cannot be executed → `[E2E スキップ]` Record comments and leave it to the user
   - **Scope limited (#2784)**: The "separate task scope" criteria in 4. below (does not affect the test results of the current task) is only for Task-level and cannot be applied or used in the Story-level Auditor phase. Even if it is a known/different task scoped RED, ownership determination (above) is followed at Story-level.

4. Determine the scope for each FAIL test (Task-level `xp_Auditor test <epic> <task_issue>` only; not applicable to the Story-level Auditor phase in 3.):
   - **Within the same task scope**: Returned to Implementer
   - **Separate task scope**: Issue a new bug issue and put it in the normal queue5. **Real environment verification of bug fix tasks (Bug tasks only)**: If the parent issue of the task is `[Bug]`, in addition to test GREEN, perform the following:
   1. Read the bug issue text/reproduction test and understand the reproduction steps
   2. Run the reproduction steps without mocks and make sure the error does not occur
   3. If confirmed → record `[実環境確認 OK]` as a comment and issue [Auditor GREEN]
   4. If it is impossible to check the actual environment (environment dependent, network unavailable, etc.) → `[実環境確認 スキップ]` + Comment the reason and leave the decision to the user (Do not automatically record [Auditor GREEN])

6. Record the results as stage comments in the issue

### Stage comments

For GREEN:
```
[Auditor GREEN]
PASS: n件 / テストコマンド: `<コマンド>`
```

For RED (same task scope):
```
[Auditor RED]
FAIL: n件
### FAIL 分析
...
```

### Sub-issue completion report

When the task issue becomes GREEN, write a completion report comment to the parent story issue.

**Steps:**
1. Get the parent issue number from the sub-issue body "## Parent story" section
2. Among open sub-issues with the same parent, `[Auditor GREEN]` unrecorded ones are considered "remaining"
3. Comment to parent issue: `サブイシュー #xx 完了。残り: #yy, #zz`

**Comment format:**
```
サブイシュー #42 完了。残り: #43, #45
```
When all sub-issues are completed:
```
サブイシュー #42 完了。残り: なし（全タスク完了）
```

### Return to xp_Director

- GREEN: Return as completed (completion has been reported to the parent issue)
- RED (same task scope): Return with cause and relevant part → Director returns to Implementer
- Found a bug in another task: Return it as "Bug issue issued" with the bug issue number

---

## doc mode processing flow

### Steps

1. Check index integrity of `<EpicName>/docs/spec/README.md`
2. Make sure each spec document is not too thin
3. **Consistency check between PR Summary and `git diff --stat` (#2625)**: Set base to
   `origin/feature/issue-{親番号}`, for root task `origin/main`, for Story-level AllGREEN flow
   Explicitly fetch `origin/feature/issue-{親番号}` and resolve `origin/main` as base.
   Get `git diff --stat <base>` (second argument omitted, work tree comparison. Uncommitted changes are also included in the detection target),
   Compare with the expected range of changes stated in the issue text/stage comments. If the discrepancy is large (not explained)
   Addition/deletion of a large number of files, etc.) will be rejected and `[Auditor doc OK]` will not be issued (Summary in PR #2426 in the past)
   Unable to detect the discrepancy between "only adding 2 files" and actually deleting 8385 files from the entire repository, urgent revert
   (PR #2428) was required)
4. Comment the check results on the issue:

```
[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- spec/README.md: <OK / NG: 理由>
- spec/<領域>.md: <OK / NG: 理由>
- diffスコープ整合性: <OK / NG: 理由（git diff --stat件数 vs 想定範囲）>
```

5. If OK: Return OK to xp_Director (xp_Director is responsible for issuing PR):
```
[Auditor doc OK]
xp_Director がPRを発行します。
```

### Return to xp_Director

- OK: Record `[Auditor doc OK]` and return to Director. PR issuance is the responsibility of the Director
- NG: Return with problem points
- NG (diff scope inconsistent): As `[Auditor doc NG: diffスコープ不整合]`, the actual change range isPlease reply with a clear statement that it deviates from the issue's expectations. `[Auditor doc OK]` is not issued

---

## GitHub access method/MCP fallback

`gh` CLI cannot be used in ClaudeCodeWeb environment (`HTTP 403` etc.). `gh` Priority → MCP fallback in case of failure →
The field normalization pattern was established in `xp_issue2md` (#3204) and has been applied to this skill (#3216):

| `gh` Command | Purpose | MCP Fallback |
|---|---|---|
| `gh issue comment` (duplicate detection/completion report) | Recording comments on issues | `mcp__github__add_issue_comment` |
| `gh issue create` (automatic bug filing) | Raising a new issue when a bug is found in another task scope | `mcp__github__issue_write` (method: `create`, labels) |
| `gh issue view --json state` (Check parent issue status) | Determine parent story status of duplicate bug | `mcp__github__issue_read` (method: `get`) |

---

## Notes

- **Do not edit files**. Only allowed to read with Read tool
- **Do not run test commands directly**. Always run via skill
- GREEN impersonation (test deletion/skip addition) is prohibited
- Silent skip is prohibited for bugs in other task scopes. Always issue a bug issue
