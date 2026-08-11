# issue-904-auditor-bug-template-parent-branch unit test

## Test target

`~/.claude/skills/xp_Auditor/SKILL.md`

Verify that the bug issue template automatically raised by xp_Auditor includes the parent branch and parent story fields (prevention of bug reproduction and regression of Issue #904).

## Test file

`SoloXP/__tests__/issue-904-auditor-bug-template-parent-branch.unit.test.js`

## Test case list

### `gh issue create template in Step 5 "When a bug is found in another task scope" section`

| Test case | Type | Content |
|---|---|---|
| ``When a bug is discovered in another task scope'' section exists | Normal system | ``When a bug is discovered in another task scope'' section exists in SKILL.md |
| The gh issue create template contains the ## parent story section | Normal | The bug report template contains the `## parent story` field |
| The gh issue create template contains the ## parent branch section | Normal | The bug report template has the `## parent branch` field |

### `Step 3 “Story-level Auditor Phase” RED Case`

| Test case | Type | Content |
|---|---|---|
| Story-level Auditor phase section exists | Normal system | `E2E test judgment/Story-level Auditor phase` section exists |
| In the RED case, there is a description of ## parent branch when filing a bug issue | Normal system | There is a `## parent branch` field in the bug filing when E2E fails |

## Implementation notes

- Write the regular expression for section extraction in a way that does not depend on the section number (use `\d+\.`)
  - To make it resistant to number changes due to section additions to SKILL.md (fixed in Issue #1279)
- `Story-level Auditor phase` section (### 3.) is extracted with a fixed number (no change at this time)

## Coverage Summary

- Required field validation for xp_Auditor bug report template: 3 items
- RED case validation in Story-level Auditor phase: 2 cases
- Total: 5 items
