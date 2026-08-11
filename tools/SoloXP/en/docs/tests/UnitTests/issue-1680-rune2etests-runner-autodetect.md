# Unit Tests: xp_RunE2ETests test runner automatic determination logic

**Test file**: `SoloXP/tests/unit/issue-1680-rune2etests-runner-autodetect.unit.test.js`
**Corresponding issue**: #1680 (Bug reproduction test added) / #1681 (Fixed implementation) / Parent bug: #1293

## Test target

`xp_RunE2ETests` SKILL.md (3 locations: `.claude/skills/`, `SoloXP/skills/`, `dotfiles/.claude/skills/`), if the `test:e2e` script in `package.json` is Jest-based (does not include Playwright), Vercel/localhost Verify that the branching logic that skips the communication check is written.

Although `SoloXP/tests/e2e/` is based on Jest and does not perform HTTP communication,
As of #1680, SKILL.md was RED with only a communication check flow based on Playwright and no branching logic.
In #1681, a step to "determine test runner" (playwright/jest determination → skip communication check in case of jest) was added to SKILL.md in three places, and it was changed to GREEN.

## Test case list

`describe.each` verifies the following for each of the three SKILL.md locations:

| Test name | Type | Verification content |
|---|---|---|
| `There is a description to check the contents of test:e2e script in package.json` | Check existing description | The string `test:e2e` exists in SKILL.md (PASS) |
| `If test:e2e includes playwright, it is stated that the conventional communication check flow will be used` | Check existing description | The character string `playwright` exists (PASS) |
| `If test:e2e includes jest (does not include playwright), it is stated that the communication check will be skipped` | Normal system (correction confirmation) | There is a description of `jest` and `Skip communication check` (PASS) |

## Coverage Summary

- 9 items PASS (3 SKILL.md × 3 items) / FAIL 0 items

## How to run

```bash
cd SoloXP && npm test -- --testPathPattern="issue-1680"
```

## remarks

This test was created by the `bug_reproduction_test` task (#1680) and was intentionally RED (3 FAIL) when #1680 completed. With the implementation of correction task #1681 (addition of branch logic to `xp_RunE2ETests`), descriptions for jest runner judgment/communication check skip were added to all three SKILL.md locations, and this test was all GREEN (confirmed in #1681).
