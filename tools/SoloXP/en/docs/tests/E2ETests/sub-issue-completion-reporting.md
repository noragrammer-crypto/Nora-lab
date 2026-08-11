# sub-issue-completion-reporting E2E Tests

## User scenario overview

Verify that the separation of sub-issue completion report and parent issue acceptance confirmation is correctly described in SKILL.md. Check the flow in which xp_Auditor comments on the parent issue upon completion and xp_Director executes the acceptance test upon full completion.

Related issue: #243

## Prerequisites

- `SoloXP/skills/xp_Auditor/SKILL.md` must exist
- `SoloXP/skills/xp_Director/SKILL.md` must exist

## Given/When/Then step

### AC1: Report completion to parent issue when sub-issue is completed

| # | Given | When | Then |
|---|---|---|---|
| 1 | xp_Auditor SKILL.md exists | Search for completion report processing to parent issue | Completion report processing to parent issue is described |
| 2 | xp_Auditor SKILL.md exists | Search completion report format | `Remaining: #xx` format is defined |
| 3 | xp_Auditor SKILL.md exists | Search for parent issue comment processing after GREEN | Steps to comment on parent issue after GREEN confirmation |

### AC2: Run acceptance test of parent issue upon completion of all sub-issues

| # | Given | When | Then |
|---|---|---|---|
| 4 | xp_Director SKILL.md exists | Search for all completion detection processing | All subissue completion detection processing is described |
| 5 | xp_Director SKILL.md exists | Search for E2E acceptance test execution flow | There is mention of acceptance test/E2E execution |
| 6 | xp_Director SKILL.md exists | Search the flow when passing the test | The parent PR issue/Close flow when passing the test is described |
| 7 | xp_Director SKILL.md exists | Search for flow when test fails | New sub-issue creation/parent issue continuation flow when test fails is described |

### Structural integrity check

| # | Given | When | Then |
|---|---|---|---|
| 8 | SoloXP/skills directory exists | Check the existence of xp_Auditor SKILL.md | The file exists |
| 9 | SoloXP/skills directory exists | Check the existence of xp_Director SKILL.md | The file exists |

## Coverage Summary

- Test file: `SoloXP/tests/e2e/sub-issue-completion-reporting.test.js`
- Number of tests: 9
