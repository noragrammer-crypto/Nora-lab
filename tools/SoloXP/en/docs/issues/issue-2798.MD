# Issue #2798: [Task] xp_review_workflow SKILL.md: add wording for identifying the deviating Issue

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2798
- Parent Story: #2060
- Parent branch: `feature/issue-2060`

## Overview

Update `SoloXP/skills/xp_review_workflow/SKILL.md` so that #2797's reproduction test turns GREEN. Add language in section 3, “Identify the single most divergent log,” that explicitly identifies the Issue that deviates from the intended workflow. Preserve the existing “divergent log” wording and meaning; this is an additive, minimal change. The other three conditions — defining expected achievement, identifying the cause skill, and detecting comment patterns — already pass.

The pre-push hook synchronizes the source to `dotfiles/.claude/skills/xp_review_workflow/SKILL.md` and `.claude/skills/xp_review_workflow/SKILL.md`; do not update generated copies manually.

## Estimate / dependency

1pt. Start after #2797 has `[Auditor GREEN]`; its PR #2804 has been merged into `feature/issue-2060`.

## Execution record

No observable user-visible behavior changes. The existing #2797 unit test was RED before implementation (PASS 149 / FAIL 2).

The implementation appended this sentence near line 103: “This step also identifies the Issue that has deviated from the expected workflow.” It made no other semantic change.

Validation:

- SoloXP unit: PASS 151 / FAIL 0, including `issue-2060-review-workflow-deviation-issue-identification.unit.test.js`.
- SoloXP functional: PASS 50 / FAIL 0.
- Reference E2E `tests/e2e/issue-254-workflow-update.test.js`: PASS. One unrelated failure in the concurrently run issue-e2e suite was known bug #2791 and outside this task.

The Auditor recorded `[Auditor GREEN]`; an unmapped real-file test run also confirmed the wording change resolves the #2060 reproduction.

## Documentation output

Generated or updated:

- `SoloXP/docs/issues/issue-2798.MD`
- `SoloXP/docs/tests/UnitTests/issue-2060-review-workflow-deviation-issue-identification.md` (GREEN result)
- `SoloXP/docs/tests/E2ETests/issue-254-workflow-update.md` (regression-to-recovery history)

No specification change was necessary because `docs/spec/xp_review_workflow.md` already described identifying a deviating Issue correctly.
