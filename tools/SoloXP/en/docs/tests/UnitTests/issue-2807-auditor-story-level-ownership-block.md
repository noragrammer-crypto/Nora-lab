# Unit test: issue-2807-auditor-story-level-ownership-block

## Test target

`SoloXP/skills/xp_Auditor/SKILL.md`

Verifies that the RED-case judgment in xp_Auditor's Story-level Auditor phase includes
ownership-based asymmetric block logic, depending on whether an existing bug issue's parent
is "the current story" or "another open story" (bug reproduction / regression prevention for
Issue #2807).

## Test file

`SoloXP/tests/unit/issue-2807-auditor-story-level-ownership-block.unit.test.js`

## Test case list

### `Extraction of the Story-level Auditor phase section`

| Test case | Type | Content |
|---|---|---|
| The Story-level Auditor phase section exists | Happy path | The `**Story-level Auditor フェーズ` section exists in SKILL.md |
| In the "already linked to a different parent" branch of the RED case, it is explicitly stated that a RED owned by another story does not block the current story | Regression prevention | The "already linked to a different parent (another story, etc.)" branch contains the wording "他のオープンなストーリー" (another open story) and "ブロックしない" (does not block) |
| The RED-case conclusion is not left as an unconditional, hard-coded "the story continues (do not close)" | Regression prevention | The unconditional top-level line that blocks regardless of ownership (3-space-indented, unconditional) is no longer present |
| The GREEN-recording condition mentions "zero blocking items owned by the current story" | Regression prevention | The GREEN-recording condition description mentions, in order, "自ストーリー" (current story) → "所有/ブロック対象" (owned/blocking items) → "ゼロ/0件" (zero) |

## Implementation notes

- In `#2809` (the fix task for this bug), ownership-based asymmetric block logic was added
  to the Story-level Auditor phase of `SoloXP/skills/xp_Auditor/SKILL.md` (parent is the
  current story → block; parent is another open story → do not block; no parent → link as a
  sub-issue and block), and all 4 cases in this test turned GREEN.
- The section-extraction regex covers from `\*\*Story-level Auditor フェーズ` up to just
  before `### 4.` (following the existing pattern of not depending on the section's internal
  numbering).

## Coverage summary

- Existence check for the Story-level Auditor phase: 1 case
- Bug-reproduction checks for the ownership-based asymmetric block: 3 cases
- Total: 4 cases
