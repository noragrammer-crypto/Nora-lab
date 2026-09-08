# issue-1733-spec-update-issue2md-step unit test

## Test target

`SoloXP/skills/xp_Director/SKILL.md` (and duplicate `dotfiles/.claude/skills/xp_Director/SKILL.md`)

The xp_Director spec_update taskflow has a call step to `xp_issue2md <task_issue>`.
Verify that it exists and is called with the correct arguments and order (Issue #1733).

Before modification, only `xp_doc_spec` → `xp_Auditor doc`, after running spec_update task
`<EpicName>/docs/issues/issue-<task_issue番号>.MD` is not generated and `xp_Auditor doc` is
There were some omissions that were detected as "missing (NG)" by issue2md log check.

## Test file

`SoloXP/tests/unit/issue-1733-spec-update-issue2md-step.unit.test.js`

## Test case list

### `xp_Director SKILL.md（dotfiles / soloxp）の spec_update フロー`

Run the same assertion for both SoloXP and dotfiles replicas with `describe.each`.

| Test case | Type | Content |
|---|---|---|
| A spec update step with `xp_doc_spec` exists | Regression check | A call to `xp_doc_spec` remains in the spec_update block |
| There is a call step for issue2md log generation (`xp_issue2md`) | Bug reproduction/regression prevention | A call to `xp_issue2md` exists in the spec_update block |
| `xp_issue2md` takes task_issue as an argument (not the parent story number) | Bug reproduction/regression prevention | The argument of `xp_issue2md <task_issue>` is `task_issue` (issue2md log check of `xp_Auditor doc` takes task_issue Since the path is derived at the starting point, passing the parent story number will result in NG again) |
| The issue2md generation step is called before `xp_doc_spec` | Bug reproduction/regression prevention | The appearance position of `xp_issue2md` must be before `xp_doc_spec` (following the canonical order of `xp_Documenter` issue2md→doc_spec) |
| There is a document check by `xp_Auditor doc` after `xp_doc_spec` | Regression confirmation | The appearance position of `xp_Auditor doc` is after `xp_doc_spec` |

## Implementation notes

- Fixed `SoloXP/skills/xp_Director/SKILL.md` in this issue (#1733).
  Add a new `ii. xp_issue2md <task_issue>` to the `【spec_update タスクの場合】` block,
  Subsequent step numbers (`xp_doc_spec` → iii, `xp_Auditor doc` → iv) have been moved down.
- The description of the `spec_update` row in the task type table was also updated to `xp_issue2md <task_issue> → xp_doc_spec <epic> <親ストーリー番号>`.
- Applied the same changes to `dotfiles/.claude/skills/xp_Director/SKILL.md` to maintain replication match with SoloXP (continuously verified with replication match test for `issue-1705-e2e-test-creation-doc-step.unit.test.js`)
- Although the same type of `xp_issue2md` is structurally missing in the `e2e_test_creation` task flow, it has been separately flagged as outside the scope of this issue (separated according to the 1 task 1 PR rule)

## Coverage Summary

- SoloXP side spec_update block verification: 5 items- dotfiles side spec_update block verification: 5 items
- Total: 10 items
