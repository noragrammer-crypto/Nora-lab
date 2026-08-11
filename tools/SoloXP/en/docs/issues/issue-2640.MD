# Issue #2640: [Task] Review the synchronization method on the .claude/skills/ side

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2640
- Parent story: #2168
- Parent branch: feature/issue-2168

## Body

## overview
Consider and implement a mechanism to synchronize `.claude/skills/` (project local, for Codex reference) in the direction of "original → binary". In environments where symlinks can be used, copy synchronization is maintained for `dotfiles/.claude/skills/` for environments where symlinks are unstable such as Termux (restrictions that cannot be combined with a single symlink are as in the text of #2168).

## estimate
2pt — Design + Implementation

## Dependencies
Start this task after completing #2639.

depends_on: #2639

## Parent story
#2168

## Parent branch
feature/issue-2168

## Comment history

### Comment 1 (2026-08-06 18:13 JST)

## Observable change check ([Task] Skip judgment)

Target: #2640 Change in observable behavior: None Reason: Internal tool change to review the synchronization method (symlinking/copy maintenance) of `.claude/skills/` (project local, for Codex reference) for each environment. There is no change in the API/endpoint, UI, or output content, and the only change is the internal implementation of the repository's development and operation mechanism (same type as pre-push synchronization), so it bypasses Architect and processes it as a normal implementation task.

Work started 2026-08-06 18:30 JST Session URL: https://claude.ai/code/session_01VLAJfpKZQyJVxKExMcYTbq [ProjectStatus: InProgress]

### Comment 2 (2026-08-06 18:20 JST) [Tester completed]

Created 6 test propositions (Units) and Functional Tests (symlink environment/Termux environment). RED confirmation before implementation: `Test Suites: 2 failed, 2 total / Tests: 10 failed, 6 passed, 16 total`.

### Comment 3 (2026-08-06 18:20 JST) [Implementer running]

### Comment 4 (2026-08-06 18:23 JST) [Implementer completed]

Added symlink synchronization (symlink stable environment) and entity copy synchronization (can be forcibly switched during testing with Termux, `PRE_PUSH_FORCE_TERMUX=1`) for `.claude/skills/` to `.claude/hooks/pre-push.sh`. Execute the hook and migrate the 38 skills under `.claude/skills/` in the real repository to symlinks (commit `fcbb9c3`). 125 unit tests and 14 functional tests, all PASS (no regression).

### Comment 5 (2026-08-06 18:23 JST) [Auditor test running] → [Auditor GREEN]

`/xp_RunTestSuites` Execution: 125 single items and 14 functions all passed. Confirmed that the actual repository's symlink migration contents, non-canonical skill exclusion, and session-start.sh drift detection do not cause false positives.

PASS: 139 (unit 125 + functional 14) / Test command: `npx jest --testPathPatterns=tests/unit`, `npx jest --testPathPatterns=tests/functional`
