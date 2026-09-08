# issue-2736-workflow-allgreen-gates unit test

## Test target

`SoloXP/WORKFLOW.md`

In the "### 6. AllGREEN Check → Acceptance Test" section, `SoloXP/skills/xp_Director/SKILL.md`
The 5 gates (Story-level Auditor execution, xp_Reviewer
review, document check, spec_update completion gate, merge confirmation of all subtask PRs)
Verify that the mention exists (bug reproduction/regression prevention for Issue #2736).

## Test file

`SoloXP/tests/unit/issue-2736-workflow-allgreen-gates.unit.test.js`

## Test case list

### `SoloXP/WORKFLOW.md AllGREEN節の必須ゲート記載`

| Test case | Type | Content |
|---|---|---|
| AllGREEN sections can be extracted | Normal system | `### 6. AllGREEN チェック` The section from the heading to just before the next heading can be extracted |
| There is a mention of Story-level Auditor execution (xp_Auditor test) | Bug reproduction | There is a string `xp_Auditor test` in the section |
| There is a mention of code review by xp_Reviewer | Bug reproduction | There is a string `xp_Reviewer` in the section |
| There is a reference to document check (xp_Auditor doc) | Bug reproduction | There is a string `xp_Auditor doc` in the section |
| spec_update There is a mention of the task completion gate | Bug reproduction | There is a string `spec_update` in the section |
| There is a reference to confirming the merge of all subtask PRs | Bug reproduction | There is a string of `マージ確認` or `merged` in the section |

## Implementation notes

- At the time of creation of `#2926` (test task to reproduce this bug), the AllGREEN clause of WORKFLOW.md was
  "For AllGREEN → Run acceptance test with `xp_RunE2ETests` → If it passes, issue parent PR and Close"
  It only explained the simple flow, and lacked any mention of the five gates mentioned above. 5 gate mention test is
  Register as "known failure" in `test.failing` and `npm test` / `npm run test:unit` are always non-zero
  Avoided the termination issue (PR #2928 Codex review pointed out)
- Added 5 gates in bullet points to the AllGREEN section of WORKFLOW.md in `#2927` (fixing task for this bug),
  After confirming that all 5 propositions are true, change `test.failing` to normal `test()`.
  Returned (total 6 items GREEN)
- The regular expression for section extraction is from `### 6\. AllGREEN チェック` to the following `### ` / `## ` / `---`
  Targets up to just before (follows the extraction pattern of `#2059`)

## Coverage Summary

- AllGREEN section extraction confirmation: 1 item
- Verification of bug reproduction for references to required 5 gates: 5 items
- Total: 6 items
