# Issue #2642: [Task] SoloXP/Makefile new creation/sync-nora-lab target implementation

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2642
- Parent story: #2168
- Parent branch: feature/issue-2168

## Body

## overview
Create a new Makefile directly under `SoloXP/` and rsync `SoloXP/` (docs such as `skills/xp_*` + `ARCHITECTURE.md`) and `workflow/skills/ProcessIssue` (and necessary related files) to `Nora-lab/tools/SoloXP/Ja` as the only source `sync-nora-lab` Implement the target.

## estimate
2pt — Makefile implementation + rsync target organization

## Dependencies
Start this task after #2638 is completed (because it is assumed that after completing Phase 1, only xp_* is under SoloXP).

depends_on: #2638

## Parent story
#2168

## Parent branch
feature/issue-2168

## Comment history

### Comment 1 (2026-08-07 07:47 JST)

## Observable change check ([Task] Skip judgment)

Target: #2642 Changes in observable behavior: None Reason: Changed the development tool to create a new Makefile directly under `SoloXP/` and implement the `sync-nora-lab` target. There are no changes to the API/endpoints, UI, or output content, and the only change is the creation of a new repository development and operation mechanism (an internal tool similar to `.claude/hooks/pre-push.sh`), so Architect will be bypassed and processed as a normal implementation task.

Work started 2026-08-07 07:47 JST Session URL: https://claude.ai/code/session_013vkg9HCsAB6sSZheo3k2KR [ProjectStatus: InProgress]

### Comment 2 (2026-08-07 07:50 JST)

[Tester completed]

Created test propositions (Unit, 6 items) and Functional Test (`make -C SoloXP sync-nora-lab` execution verification on temporary git repository). Since the Makefile was not implemented, I checked RED (`ENOENT`) and passed it on to the Implementer.

### Comment 3 (2026-08-07 07:51 JST)

[Implementer completed]

New implementation of `SoloXP/Makefile` (`sync-nora-lab` target). Synchronize the original copy (the entire `SoloXP/` + `workflow/skills/ProcessIssue`) to `Nora-lab/tools/SoloXP/Ja` based on `rm -rf` + `cp -r` (The rsync command is not installed in some execution environments, so it is designed to be independent. Same policy as pre-push.sh in #2639). Confirmed that there were no regressions in 6 unit cases and 8 functional cases, 131 cases in total for `SoloXP/tests/unit` and 22 cases in `tests/functional`.

### Comment 4 (2026-08-07 07:52 JST)

[Auditor test running] → [Auditor GREEN]

Execute `npx jest --testPathPatterns=SoloXP/tests/unit` (131 results PASS) and `npx jest --testPathPatterns=SoloXP/tests/functional` (22 results PASS) and check all results are GREEN. Story E2E “Acceptance Condition 5” is also PASS. We confirmed that one existing FAIL with "acceptance condition 4" is an existing difference that is not covered by this task (#2641 scope).

[Auditor GREEN] PASS: 153 items (unit 131 + functional 22)
