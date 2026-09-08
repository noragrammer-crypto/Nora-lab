# Unit Test: issue-1831 substory-progress-spec-update-marker

Target file: `SoloXP/tests/unit/issue-1831-substory-progress-spec-update-marker.unit.test.js`
Verification target: `dotfiles/.claude/skills/xp_Director/SKILL.md`, `SoloXP/skills/xp_Director/SKILL.md`

## Background

xp_Director's "2-0. Disassembled Gate" step 2 (step to understand the progress of sub-issues) checks the completion of each sub-issue.
It was determined only by the presence or absence of `[Auditor GREEN]`. On the other hand, the `spec_update` task (with title “Functional Specification Update” or
`task_type: spec_update`) in the body only passes through `xp_issue2md` → `xp_doc_spec` → `xp_Auditor doc` as a completion marker.
Outputs `[Auditor doc OK]` (`[Auditor GREEN]` is structurally not output).

Therefore, even if the story has all the implementation tasks `[Auditor GREEN]` and the spec_update task has also been `[Auditor doc OK]`,
This progress tracking step incorrectly judges the spec_update task as "incomplete" and marks it as "Remaining: #<spec_update number>".
There was a problem where `/xp_Director` kept stopping and it was not possible to proceed to the AllGREEN flow (parent PR issue) in step 3-e (Codex automatic review
Point #1831).

The same kind of inconsistency was not present on the AllGREEN prerequisite check side (step 3-e, fixed in #1642), but it was before it.
This was overlooked in the progress assessment step (Step 2).

## Test case

For each copy of `dotfiles/` and `SoloXP/` (`describe.each`):

1. It is specified that the progress tracking step judges the spec_update task based on the presence or absence of `[Auditor doc OK]`.
2. The line in the progress tracking step has not returned to the old wording that is determined only by `[Auditor GREEN]` (regression prevention)

## Execution result (after modification)

`cd SoloXP && npx jest tests/unit/issue-1831-substory-progress-spec-update-marker.unit.test.js --no-coverage`
— 4 tests PASS
