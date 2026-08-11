# Solo XP operational workflow

> For an overview, features, and document list of SoloXP itself, see [README.md](./README.md).
> Background explanation of branch naming, base branch, why merge conflicts are likely to occur, etc.
> See [Notes on branch/PR merge strategy](./docs/manual/branch-strategy.md).

> **Assumptions**: The following workflow includes branch operation, PR issuance pre-approval, and
> It is assumed that TDD principles, work time recording rules, etc. are defined. If you don't have one yet,
> Copy [`CLAUDE.md.template`](./CLAUDE.md.template) to your `CLAUDE.md` and edit it.

## Basic flow

```
Issue creation (user)
    ↓
/xp_Director <issue_number> Start
    ↓
xp_Architect: Subissue issue
    ↓
xp_Director: Process each task one by one
  └─ xp_Tester → xp_Implementer → xp_Auditor test → xp_Documenter → xp_Auditor doc
    ↓
[Auditor GREEN] → Completion report to parent issue
    ↓
All sub-issues AllGREEN → xp_RunE2ETests (acceptance test)
    ↓
✅ Pass → Parent story PR issue/Close
❌ Failure → Create new sub-issue and continue with failure details
```

---

## Detailed Workflow

### 1. Issue creation (user)

```bash
# Using any method such as the web version of Claude Code, Termux, GitHub app, etc.
gh issue create \
  --title "[Story] Function name" \
  --body "## Background\n...\n\n## Acceptance Conditions\n- [ ] ..."
```

### 2. Start xp_Director

```
/xp_Director <issue_number>
```

Or auto-select unprocessed issues without arguments:

```
/xp_Director
```

### 3. Task decomposition using xp_Architect

`[Story]`, `[Bug]`, untagged → xp_Architect publishes sub-issue. `[Task]` Tagged → Skip Architect and go straight to the execution flow.

Architect:
- Categorize issue types into Story / Task / Bug
- Publish tasks as sub-issues with dependencies
- Record the execution plan as an Architect analysis result comment

### 4. Task processing (1 task 1 PR rule)

**Only one task is processed in one xp_Director execution.**

#### Task type and processing method

| Task type | Identification method | Processing skill |
|---|---|---|
| `e2e_test_creation` | "E2E test suite creation" or task_type: e2e_test_creation | xp_E2Etest <parent story number> |
| `spec_update` | "Functional specification update" or task_type: spec_update | xp_doc_spec <epic> <parent story number> |
| `bug_reproduction_test` | "Add bug reproduction test" or task_type: bug_reproduction_test | xp_Tester <task_issue> |
| Normal implementation task | Other than above | xp_Tester → xp_Implementer → xp_Auditor → xp_Documenter |

#### Typical implementation task steps

```
[Tester running] → Test suite creation/execution
[Tester completed]
[Implementer running] → Implementation to make the test green
[Implementer completed]
[Auditor test running] → Test execution/result analysis
[Auditor GREEN] or [Auditor RED]
[Documenter running] → Generate all types of documents
[Documenter completed]
[Checking Auditor document] → Check spec/reference
[PR issued #xx]
```

### 5. Sub-issue completion report

When a task issue becomes `[Auditor GREEN]`, xp_Auditor reports to the parent story issue:

```
Sub-issue #42 completed. Remaining: #43, #45
```

When all sub-issues are completed:

```
Sub-issue #42 completed. Remaining: None (all tasks completed)
```

### 6. AllGREEN check → acceptance test

Immediately after issuing a PR, xp_Director checks `[Auditor GREEN]` for all subissues:

- **For AllGREEN** → Run acceptance tests with `xp_RunE2ETests`
  - ✅ Pass → Publish PR for parent story issue and Close
  - ❌ Failure → Create a new sub-issue with failure details, continue the parent issue
- **If there are unfinished sub-issues** → Stop immediately (the next task will start the next time you call `/xp_Director`)

### 7. Human confirmation/merge (user)

```bash
# Confirm PR
gh pr view <number>
gh pr diff <number>

# merge
gh pr merge <number> --squash
```

---

## Resolving depends_on (dependency)

- Don't check GitHub's closed state
- **Unblocked if there is `[Auditor GREEN]` in the dependent sub-issue comment**
- Unblocked subissues will be executed on the next `/xp_Director` call

---

## Work logging rules

Record work time with issue comments (device independent, stays on GitHub timeline).

**At start:**
```
Start of work YYYY-MM-DD HH:MM
```

**When completed:**
```
Work completed YYYY-MM-DD HH:MM / Required time: XX minutes
```

Aggregation is done in `/xp_worklog`.

---

## Retry control during RED

RED of the same task scope is returned by xp_Director to xp_Implementer (up to 3 times). If it exceeds 3 times, the escalation will be stopped and the user will be contacted by commenting on the issue.

---

## Skill list

| Skill | Role |
|---|---|
| xp_Director | Control tower. Control the execution order and timing of all skills |
| xp_Architect | Classify issues into Story/Task/Bug and publish sub-issues |
| xp_Tester | Create and run a test suite |
| xp_Implementer | Implement to make tests green |
| xp_Auditor | Test execution/quality audit/sub-issue completion report |
| xp_Documenter | Generate all types of documentation (spec/reference/tests) |
| xp_E2Etest | Create an E2E test suite |
| xp_RunTestSuites | Run Unit + Functional tests |
| xp_RunE2ETests | Run E2E tests |
| xp_RunAllUnitTests | Run and report all unit tests |
| xp_worklog | Total work time and report |
| xp_review_workflow | Review the workflow and show areas for improvement |

---

**Updated date**: 2026-03-18
