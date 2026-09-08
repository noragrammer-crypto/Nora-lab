---
issue: 3630
title: "[Bug] Files containing non-xp_ keywords (daily-tasks) remain in SoloXP/tests/unit/ (#2168 Misorganized)"
state: closed
labels: [bug, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-09-07T08:57:38Z
epic: SoloXP
---

# #3630 [Bug] Files containing non-xp_ keywords (daily-tasks) remain in SoloXP/tests/unit/ (#2168 Misorganized)

## Body

## How it was discovered
Found while running the Story-level acceptance test (`xp_Auditor test`) of #3621 (new xp_CompleteTasks skill creation).

## Error details
Acceptance condition 2 for `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js`
("There are no non-xp_ files remaining in lib/scripts/tests/docs") reports the following FAIL:

```
SoloXP/tests/ に非xp_系キーワードを含むファイルが存在しない

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js",
+ ]
```

We have confirmed that the same failure is reproduced on the `main` branch (pre-existing, not the problem introduced by #3621).

## Scope of influence
The file name is `SoloXP/tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js`.
#2168 (SoloXP originalization/only xp_* files
(Organization) is in violation of the acceptance conditions. Move the file to a non-xp_ directory such as `workflow/` or
Naming needs to be changed.

## Parent story
#3621

## Parent branch
feature/issue-3621

## Comment

### noragrammer-crypto — 2026-09-07T08:59:15Z

## Conflict check with existing implementation (manual trace)

Fallback activation: Yes
Reason for activation: Due to a simple file movement modification, it was handled by manual tracing without using the code-architect subagent.

Patterns & Conventions Found:
- The target file `SoloXP/tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` is actually a test to verify the description of `workflow/skills/daily-tasks/SKILL.md` (non-xp_ skills), and has nothing to do with SoloXP's xp_* skills.
- The entities of non-xp_ related skills (daily-tasks, etc.) have already been moved to `workflow/skills/` (#2637), and it is an established practice to place the corresponding tests in `workflow/__tests__/unit/` (because the same repository root is resolved with the `REPO_ROOT = path.resolve(__dirname, '../../..')` pattern, there is no need to change the path resolution logic even if moved)

Architecture Decision:
- `SoloXP/tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` to `workflow/__tests__/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` to `git mv` (no need to change the file contents)

Conflict: None

## Execution plan

Issue type: Bug
Verdict: Single task (no subissue issued, already linked as a subissue with parent branch `feature/issue-3621`)
Target issue: #3630 (this issue itself is treated as a task)
Execution method: `xp_Director` cuts a new working branch from the `feature/issue-3621` branch and processes it with the PR of `--base feature/issue-3621` (TDD principle of CLAUDE.md: Reproduction test + modification can be completed in a single task. This time, a new reproduction test is not necessary because the placement of the existing test is corrected, and the execution result of the existing test itself serves as confirmation of reproduction and modification)

Conflict: None

---

### noragrammer-crypto — 2026-09-07T08:59:23Z

Start of work 2026-09-07T17:59:19+09:00
Session URL: https://claude.ai/code/session_01BoYYCF3g9cfo6FQH2Y5Q4F
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-09-07T09:00:44Z

[Actual environment confirmation OK]
Execute the steps to reproduce: Confirm that acceptance condition 2 of `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` (detection of files containing non-xp_ keywords) is now GREEN (confirm that the bug has been fixed)

[Auditor GREEN]
PASS: 658 items (SoloXP: Unit 327 items + Functional 69 items, workflow: Unit 262 items) / Test command: `npm run test:unit && npm run test:functional` (`SoloXP/` and `workflow/` both)
E2E: Skip because it is a single task issue (`issue-2168` It was separately recorded in the actual environment confirmation above that the corresponding acceptance condition of the E2E test was changed to GREEN)

---

### noragrammer-crypto — 2026-09-07T09:01:27Z

## Issue2MD completed

Save to: `SoloXP/docs/issues/issue-3630.MD`
Issue: #3630 [Bug] Files containing non-xp_ keywords (daily-tasks) remain in SoloXP/tests/unit/ (#2168 Misorganized)
Number of comments: 3

## xp_doc_spec / xp_doc_reference / xp_doc_UnitTests / xp_doc_FunctionTests / xp_doc_E2ETests

None of these are applicable — Only modifying the layout of existing test files (`git mv`), new specifications, new test cases,
No class/function changes. There is no corresponding UnitTests document for either the source or destination.
(confirmed), so there is no follow-up work on the document side.

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-3630.MD` (newly created): Issue snapshot by xp_issue2md

[Documenter completed]

---

### noragrammer-crypto — 2026-09-07T09:02:01Z

[Checking Auditor document]

### Document check results
- spec/README.md: Not applicable (no specification changes)
- issue2md log: Obsolescence detected (4 items on GitHub / 3 items on log) → Updated by re-running. OK
- diff scope consistency: OK (1 file renamed (0 lines changed) with `git diff --stat origin/feature/issue-3621` + 1 new untracked (issue2md snapshot) confirmed. As expected)

[Auditor doc OK]
xp_Director issues a PR.

---

### noragrammer-crypto — 2026-09-07T09:02:29Z

[PR issued #3631]
[ProjectStatus: Done]

---
