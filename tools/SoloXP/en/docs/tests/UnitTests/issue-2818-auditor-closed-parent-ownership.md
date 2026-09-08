# issue-2818-auditor-closed-parent-ownership unit test

## Test target

`SoloXP/skills/xp_Auditor/SKILL.md`, `SoloXP/docs/spec/xp_auditor.md`

Ownership-based asymmetric block logic in the Story-level Auditor phase of xp_Auditor.
Verify that the handling when the parent story of an existing bug issue is **closed** is clearly specified.
(Bug reproduction and regression prevention of Issue #2818). Closed parents are treated the same as "parent not set",
`replace_parent: true` retakes ownership of the current story and blocks it.

## Test file

`SoloXP/tests/unit/issue-2818-auditor-closed-parent-ownership.unit.test.js`

## Test case list

### `SKILL.md: Story-level Auditor フェーズセクションの抽出`

| Test case | Type | Content |
|---|---|---|
| Story-level Auditor phase section exists | Normal system | `**Story-level Auditor フェーズ` section exists in SKILL.md |
| A branch exists "if it is already linked to another parent" | Normal system | The text of the branch in question can be extracted |
| The handling when the parent story is "closed" is clearly specified | Bug reproduction/regression prevention | The word "closed" must be included in the branch |
| In the case of a closed parent, the reacquisition of ownership (`replace_parent: true`) is specified | To prevent bug reproduction and regression | `replace_parent: true` must be immediately after the "closed" description |
| In the case of a closed parent, it is specified that the current story is "blocked" (= the story continues/does not close) | To prevent bug reproduction/regression | "Story continues (does not close)" is written near the "closed" description |
| Existing "do not block" wording for open parents remains in place | Regression confirmation | Existing wording for "other open stories" and "do not block" remains after change |

### `docs/spec/xp_auditor.md: 所有権ベースブロックの要約`

| Test case | Type | Content |
|---|---|---|
| The handling when the parent story is already closed is clearly specified in the summary | Bug reproduction/regression prevention | The summary line of an ownership-based asymmetric block must include "closed" and "replace_parent: true" |

## Implementation notes

- With the correction of this issue (#2818), `SoloXP/skills/xp_Auditor/SKILL.md`'s "already assigned to another parent (other story, etc.)
  "If linked" branch is set to "Open" and "Closed" with a step to check the status of the parent story.
  Divided into 2 small branches. If it has been closed, it will be treated in the same way as "if the parent is not set" (reacquisition of ownership/block)
  and specified `replace_parent: true`.
- Added the same content to the first sentence of the summary of `docs/spec/xp_auditor.md`
- Existing tests `issue-2807-auditor-story-level-ownership-block.unit.test.js` and
  `issue-2784-xp-auditor-story-level-scope-exemption.unit.test.js` is the target section of this modification.
  As the amount of text has increased, the regular expression window size (number of characters allowed to match) has been expanded.
  (The content of the assertion itself has not changed)

## Coverage Summary

- Story-level Auditor phase existence confirmation: 2 cases
- Bug reproduction verification for closed parent cases: 3 cases
- Regression confirmation (open parent case): 1 case
- Verification of spec summary: 1 item
- Total: 7 items
