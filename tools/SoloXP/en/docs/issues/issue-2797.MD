# Issue #2797: [Task] Add a bug reproduction test

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2797
- Parent Story: #2060
- Parent branch: `feature/issue-2060`

## Overview

Add a test case that reproduces bug #2060 and defines the acceptance criteria for its fix.

The target is `SoloXP/skills/xp_review_workflow/SKILL.md` and its synchronized `dotfiles/.claude/skills/xp_review_workflow/SKILL.md` copy. The current skill mentions a “divergent log,” but does not contain language matching `/deviation.*issue/i` (or the Japanese equivalent) that the existing `SoloXP/tests/e2e/issue-254-workflow-update.test.js` expects.

Add `SoloXP/tests/unit/issue-2060-review-workflow-deviation-issue-identification.unit.test.js`. It must check both copies with `describe.each` and fail until each describes identifying the Issue that deviates from the intended workflow.

## Estimate / dependency

1pt. No dependency; start immediately before the fix task. `task_type: bug_reproduction_test`; use `xp_UnitTest` + `xp_FunctionalTest`.

## Execution record

The observable-change check found no user-visible behavior change: this task only adds a Jest reproduction test. Work started at 2026-08-09 11:10 JST (session `session_011ictpFLYs5Necr7xK3G7Er`).

The new test found the expected RED state:

- Both dotfiles and SoloXP skill copies lacked wording equivalent to “identify the deviating Issue.”
- Unit result: PASS 149 / FAIL 2; the two failures were the new reproduction-test assertions, while the existing 149 tests had no regression.
- Functional result: PASS 50 / FAIL 0.
- E2E was skipped for this `bug_reproduction_test`; the existing `tests/e2e/issue-254-workflow-update.test.js` is the bug's acceptance test.

The Auditor confirmed that the expected RED proves the bug and recorded `[Auditor GREEN]`: existing 149 tests passed and the two intentional failures proved the reproduction. The fix task is #2798; no Implementer handoff is needed for this test-only task.

## Documentation output

Generated:

- `SoloXP/docs/issues/issue-2797.MD`
- `SoloXP/docs/tests/UnitTests/issue-2060-review-workflow-deviation-issue-identification.md`

No specification, reference, Functional-test, or E2E-test documentation changed because this task only adds the reproduction test.
