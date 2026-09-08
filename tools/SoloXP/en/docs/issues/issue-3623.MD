---
issue: 3623
title: "[Task] xp_CompleteTasks skill implementation (create new SKILL.md)"
state: closed
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-09-07T08:04:05Z
epic: SoloXP
---

# #3623 [Task] Implementation of xp_CompleteTasks skill (create new SKILL.md)

## Body

## Overview
Create a new `SoloXP/skills/xp_CompleteTasks/SKILL.md`.

Command specifications:

- `/xp_CompleteTasks <親issue番号>`
  1. Parent issue has been decomposed into sub-issues by `xp_Architect` (`[親ブランチ作成済み]` marker
     `feature/issue-{親番号}` branch exists). If it is not disassembled,
     Displays "Please run /xp_Director <parent issue number> first" and stops
  2. Use `get_sub_issues` to get a list of sub-issues of the parent issue and classify them as follows:
     - Completed: regular task includes `[Auditor GREEN]`, spec_update task includes `[Auditor doc OK]`
       **AND** The corresponding PR (`--base feature/issue-{親番号}`) is `merged`
       (Follows the same confirmation method and gh priority/MCP fallback as in the "depends_on cancellation judgment" section of `xp_Director`)
     - PR published/waiting to be merged: There is a corresponding PR with `open`
     - Not started: None of the above
  3. If all sub-issues are “completed”, proceed to step 6 (Start AllGREEN flow)
  4. If there is even one sub-issue of "PR published/waiting to merge": the PR will be merged (or closed)
     poll and wait until Once merged, return to step 2. Closed and not merged
     If finished, report to user and ask if they want to rerun or skip
  5. If there is an unstarted sub-issue: depends_onSelect one sub-issue that has been resolved and can be started,
     Run `/xp_Director <サブイシュー番号>`. After execution, return to step 2
     (This task does not intervene in the internal flow of `/xp_Director` / 1 task 1 PR rule, and only calls and
     Just wait for completion [PR issue or report of reason for suspension])
  6. Once there are no unfinished subissues, rerun `/xp_Director <親issue番号>` with the parent issue number,
     Start AllGREEN flow for `xp_Director` (PR issue for `feature/issue-{親番号}` → `main`)
  7. After confirming that the PR for `feature/issue-{親番号}` → `main` has been issued, stop as completed.
     (Do not wait for merging to main as it is the responsibility of the owner). `xp_Director` stopped due to AllGREEN failure
     If so, report the reason to the user and stop it.

- `/xp_CompleteTasks` (no arguments): if the current git branch name is of the form `feature/issue-{番号}`
  Use that number as the parent issue number. If it cannot be parsed, ask the user

Please note the following in the SKILL.md text:

- This skill does not change `xp_Director`'s 1 task 1 PR rule/stop condition (only calls)
- Sub-Task PRs will not be automatically merged
- If `xp_Director` is in a state where it requires user judgment during the loop (RED remand limit exceeded, etc.)
  This skill will also stop there and report to the user.

## Quote
2pt — New SKILL.md creation only

## Dependencies
None (can start immediately)

## Parent story
#3621

## Parent branch
feature/issue-3621

## Comment

### noragrammer-crypto — 2026-09-07T08:30:45Z

Start of work 2026-09-07T17:30:41+09:00
Session URL: https://claude.ai/code/session_01BoYYCF3g9cfo6FQH2Y5Q4F
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-09-07T08:31:03Z

[Tester running]

## Test execution results

The target is a new task of `SoloXP/skills/xp_CompleteTasks/SKILL.md` (prompt definition read by Claude Code, not an executable code file). There is no code subject to Unit/Functional testing.

### Unit Test
Skip - No code to test (SKILL.md is a prompt document and there is no unit test target for each function or class)

### Functional Test
Skip — no code under test (same as above)

### E2E Test
Skip — This task is a single task issue (parent story #3621 has already created an E2E test in #3622. `SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js` verifies the acceptance conditions of this implementation)

---
[Tester completed]
Hands over to implementation (xp_Implementer). The acceptance decision will be left to the existing E2E test (created in #3622).

---

### noragrammer-crypto — 2026-09-07T08:32:38Z

[Implementer running]

---

### noragrammer-crypto — 2026-09-07T08:33:21Z

## Implementation completed

Change file:
- `SoloXP/skills/xp_CompleteTasks/SKILL.md` (new creation): Define the `/xp_CompleteTasks <親issue番号>` command. Describe the sub-task loop (dependency resolution confirmation, `/xp_Director` sequential calls, PR merge wait polling) and AllGREEN flow start/completion conditions

Test results (`SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js`):
- Suite 1 (SKILL.md text contract/AC1 to AC9): PASS 16 / FAIL 0
- Suite 2 (Functional specifications/AC10): 2 FAILs — As expected because #3624 (Functional specifications update task) has not been started

[Implementer completed]

---

### noragrammer-crypto — 2026-09-07T08:33:43Z

[Auditor GREEN]
PASS: 399 (Unit 330 + Functional 69) / Test command: `npm run test:unit && npm run test:functional` (under `SoloXP/`)E2E: Skip because it is a single task issue (E2E acceptance test of parent story #3621 is PASS for 16 cases of Suite 1 (AC1 to AC9). Suite 2 (AC10/#3624 target) has not been started and FAIL as expected)

---

### noragrammer-crypto — 2026-09-07T08:34:55Z

[xp_doc_spec] Check `SoloXP/docs/spec/`. The functional specification (`xp_complete_tasks.md` new creation/README index addition) has already been assigned to the dedicated spec_update task #3624, so it will not be implemented in this task (#3623) (to avoid duplicate work). There is no corresponding work because the "related issue" status synchronization table does not exist in `README.md`.

---

### noragrammer-crypto — 2026-09-07T08:35:02Z

[xp_doc_reference] Not applicable — This task changes only `SoloXP/skills/xp_CompleteTasks/SKILL.md` (prompt document) and does not change the code files that have classes and functions, so there is no reference document to be generated.

---

### noragrammer-crypto — 2026-09-07T08:35:14Z

[xp_doc_UnitTests] [xp_doc_FunctionTests] [xp_doc_E2ETests] None of these are targeted — This task does not create a new Unit/Functional test file (skipped because there is no code to test based on `xp_Tester`). The E2E test has already been created in #3622 as an acceptance test for parent story #3621, and no additional test documentation will be generated in this task.

---

### noragrammer-crypto — 2026-09-07T08:35:19Z

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-3623.MD` (newly created): Issue snapshot by xp_issue2md

Not applicable (see each comment for reasons):
- `xp_doc_spec`: Will not be executed because it has already been assigned to spec_update task #3624
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: No target code tested

[Documenter completed]

---

### noragrammer-crypto — 2026-09-07T08:36:00Z

[Checking Auditor document]

### Document check results
- spec/README.md: OK (no changes made in this task, assigned to spec_update task #3624)
- issue2md log: Obsolescence detected (9 items on GitHub / 5 items on log) → Updated by re-running. OK
- diff scope consistency: OK (only 2 new untracked items confirmed in `git diff --stat origin/feature/issue-3621`: `SoloXP/skills/xp_CompleteTasks/`, `SoloXP/docs/issues/issue-3623.MD`. As expected)

[Auditor doc OK]
xp_Director issues a PR.

---

### noragrammer-crypto — 2026-09-07T08:36:54Z

[PR issued #3628]
[ProjectStatus: Done]

---
