# Unit Test: issue-2791 claude-md-worklog-tokens-model

Target file: `SoloXP/tests/unit/issue-2791-claude-md-worklog-tokens-model.unit.test.js`
Under test: `CLAUDE.md` (repository root, "work time recording rules" section)

## Background

The "precondition: CLAUDE.md defines the token-consumption recording format" block in
`SoloXP/tests/e2e/issue-1461-ai-dev-cost-token-tracking.test.js` (#1461) expects the body of
CLAUDE.md's "work time recording rules" section to directly contain a `tokens:` / `model:`
format example and the policy of confirming with the user when the format breaks. However,
the current CLAUDE.md section only references `docs/worklog-format.md`, and the expected
wording is missing from the body text (#1461 regression, #2791).

This task (#2799, `task_type: bug_reproduction_test`) adds a unit test that reproduces and
pins down this bug at the unit level without running the whole E2E suite.

## Test cases

Using the same extraction logic and regular expressions as the "precondition" block of the
E2E test (`issue-1461-ai-dev-cost-token-tracking.test.js`), this verifies the following 4
items:

1. The body of the "work time recording rules" section contains `tokens:`.
2. Somewhere in the file, the pattern `tokens:.*prompt=.*completion=.*total=` matches.
3. The body of the "work time recording rules" section contains `model:`.
4. The body of the "work time recording rules" section mentions the policy of confirming
   with the user when the format breaks
   (`/tokens.*confirm|confirm.*tokens|フォーマット.*tokens|tokens.*フォーマット/i`).

## Execution result (at bug reproduction, #2799)

4 FAIL / 0 PASS (RED as expected = bug reproduced). No regressions in the existing 151
`SoloXP/` unit tests or 50 functional tests either.

The acceptance criterion is that, after fix task #2800 appends the `tokens:` / `model:`
format example to CLAUDE.md's "work time recording rules" section, this test turns GREEN.
