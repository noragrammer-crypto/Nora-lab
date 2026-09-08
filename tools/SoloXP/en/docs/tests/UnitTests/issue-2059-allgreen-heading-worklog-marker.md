# Unit Test: issue-2059 allgreen-heading-worklog-marker

Target file: `SoloXP/tests/unit/issue-2059-allgreen-heading-worklog-marker.unit.test.js`
Under test: `dotfiles/.claude/skills/xp_Director/SKILL.md`, `SoloXP/skills/xp_Director/SKILL.md`

## Background

`tests/e2e/issue-1410-worklog-markers.test.js` (#1410) expects the AllGREEN flow section
heading in xp_Director's SKILL.md to contain the substring "AllGREEN チェック" (AllGREEN
check), and expects that section to contain the "作業完了" (work completed) recording
instruction. However, the current heading (`e.【参考・このランでは実行しない】AllGREENフローについて`)
does not contain the string "AllGREEN チェック", so the E2E test's extraction function
(`extractAllGreenSection`) fails to locate the section and returns `null`, causing the test
to fail (#1410 regression, #2059).

## Test cases

For both the `dotfiles/` and `SoloXP/` copies (`describe.each`):

1. A heading containing "AllGREEN チェック" exists, and the AllGREEN section can be extracted.
2. The extracted section contains the "作業完了" (work completed) recording instruction.

Both cases extract the section using the same regular expression as the E2E test's
`extractAllGreenSection()` (`issue-1410-worklog-markers.test.js`), keeping this test
consistent with the E2E test.

## Execution result (at bug reproduction, #2792)

4 FAIL / 0 PASS (RED as expected = bug reproduced)

## Execution result (after fix, #2793)

After fixing the heading to `e.【参考・このランでは実行しない】AllGREEN チェック・AllGREENフローについて`,
4 PASS / 0 FAIL (GREEN). No regressions in the existing 145 `SoloXP/` unit tests either.
