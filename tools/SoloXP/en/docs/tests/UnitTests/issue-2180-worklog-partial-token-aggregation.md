# Unit Test: issue-2180 worklog-partial-token-aggregation

Target file: `SoloXP/tests/unit/issue-2180-worklog-partial-token-aggregation.unit.test.js`
Verification target: `dotfiles/.claude/skills/xp_worklog/SKILL.md`, `SoloXP/skills/xp_worklog/SKILL.md`

## Background

`xp_worklog`'s token consumption aggregation rules had the following two clauses:

1. Issues that span multiple sessions will **sum up** token consumption.
2. Session issues without the `tokens:` line will be displayed as "no record"

If the issue is a "mixed issue" that spans multiple sessions and only some sessions have `tokens:` records,
If Article 2 is applied on a per-session basis, it can be misinterpreted as ``There are sessions with no records = no records,'' and this is not the case with the aggregation rule in Article 1.
contradictory. Due to this ambiguity, even the token consumption data of other recorded sessions is treated as "unrecorded".
There was a possibility that it would be discarded (Codex automatic review point #2180).

The correct specification is to limit "No record" to cases where there is no record of at least one `tokens:` issue in the entire issue.
For mixed issues where only some sessions are recorded, the recorded sessions are added up, and the unrecorded sessions are added up.
To add something.

## Test case

For each copy of `dotfiles/` and `SoloXP/` (`describe.each`):

1. "No record" is specified only when there are no records for all sessions in the issue.
2. For mixed issues where only some sessions are recorded, it is clearly stated that the recorded sessions will be added together.
3. It is clearly stated that recorded sessions will not be discarded even if there are unrecorded sessions (regression prevention)
4. The old ambiguous parallelism (wording that says "no record" for session issues) remains (prevention of regression)

## Execution result (after modification)

`cd SoloXP && npx jest tests/unit/issue-2180-worklog-partial-token-aggregation.unit.test.js --no-coverage`
— 8 tests PASS
