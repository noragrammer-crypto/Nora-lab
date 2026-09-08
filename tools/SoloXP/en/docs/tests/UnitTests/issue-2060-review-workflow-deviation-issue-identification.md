# Unit Test: issue-2060 review-workflow-deviation-issue-identification

Target file: `SoloXP/tests/unit/issue-2060-review-workflow-deviation-issue-identification.unit.test.js`
Under test: `dotfiles/.claude/skills/xp_review_workflow/SKILL.md`, `SoloXP/skills/xp_review_workflow/SKILL.md`

## Background

`SoloXP/tests/e2e/issue-254-workflow-update.test.js` (#254) expects xp_review_workflow's
SKILL.md to contain "logic that identifies issues that deviated [from the workflow]",
matched against the pattern `/逸脱.*Issue|逸脱.*イシュー|逸脱.*特定|deviation.*issue/i`.
However, in the current SKILL.md the word "逸脱" (deviation) appears only as part of
"逸脱ログ" (deviation log, in the workflow expectation-achievement-conditions section), with
no phrase combining it with "イシュー/特定" (issue/identify), so the pattern doesn't match
and the test fails (#254 regression, #2060).

## Test cases

For both the `dotfiles/` and `SoloXP/` copies (`describe.each`):

1. Wording equivalent to "logic that identifies issues that deviated [from the workflow]"
   is present (`/逸脱.*Issue|逸脱.*イシュー|逸脱.*特定|deviation.*issue/i`).

Uses the same regular expression as the corresponding assertion in the E2E test
(`issue-254-workflow-update.test.js`), keeping this test consistent with the E2E test.

## Execution result (at bug reproduction, #2797)

2 FAIL / 0 PASS (RED as expected = bug reproduced)

## Execution result (after fix, #2798)

Fix task #2798 appended "この工程は、あるべきワークフローから逸脱したイシューを特定するステップでもある。"
("This step also serves to identify issues that deviated from the intended workflow.") to
the SKILL.md in both the `dotfiles/` and `SoloXP/` copies, resulting in 2 PASS / 0 FAIL
(GREEN). No regressions in the existing 149 `SoloXP/` unit tests either.
