# issue-2814-auditor-story-level-unit-functional-green unit testing

## Test target

`SoloXP/skills/xp_Auditor/SKILL.md`, `SoloXP/docs/spec/xp_auditor.md`

The GREEN/RED judgment in the Story-level Auditor phase (section 3) of xp_Auditor is not only based on the E2E result.
Verify that the results of the Unit + Functional test executed in Section 2 are also included (bug reproduction/reproduction of Issue #2814).
prevention of regression). Before the modification, as long as E2E passed, `[Auditor GREEN]` was recorded even if Unit/Functional failed.
There was a structural gap to gain.

## Test file

`SoloXP/tests/unit/issue-2814-auditor-story-level-unit-functional-green.unit.test.js`

## Test case list

### `SKILL.md: 2節→3節の接続`

| Test case | Type | Content |
|---|---|---|
| Section 2 exists | Normal system | `### 2. xp_RunTestSuites を実行する` section exists in SKILL.md |
| It is clearly stated that the execution results of section 2 are included in the judgment of section 3 (Story-level) | Bug reproduction/regression prevention | The text of section 2 contains a reference to "section 3" or "Story-level" and the words "incorporate/reflect/determine" |

### `SKILL.md: Story-level Auditor フェーズセクションの抽出`

| Test case | Type | Content |
|---|---|---|
| Story-level Auditor phase section exists | Normal system | `**Story-level Auditor フェーズ` section exists in SKILL.md |
| The conditional statement for GREEN mentions both Unit and Functional | Bug reproduction/regression prevention | The GREEN conditional statement must include both `Unit` and `Functional` |
| In the case of RED, the target refers not only to E2E but also to Unit/Functional | To prevent bug reproduction and regression | Both `Unit` and `Functional` must be included in the RED conditional statement |
| The section 6 scope limitation notes dedicated to Task-level remain unchanged | Regression confirmation | Existing wordings such as "Only for Task-level" and "Not applicable/cannot be used" remain after the change |

### `SKILL.md: Unit/Functional合算判定の注記が所有権免除を無視しない（Codexレビュー指摘の回帰防止）`

| Test case | Type | Content |
|---|---|---|
| Unit/Functional summation judgment notes exist | Normal system | New note block at the beginning of section 3 can be extracted |
| It is clearly stated that unblocked REDs owned by other stories are not unconditionally blocked (reference to ownership determination) | Bug reproduction/regression prevention | Notes include references to "ownership" and "block targets owned by own story" or "owned by other stories" |

### `docs/spec/xp_auditor.md: Story-level要約にUnit/Functionalへの言及がある`

| Test case | Type | Content |
|---|---|---|
| Story-level Auditor phase summary exists | Normal system | Summary section can be extracted |
| The summary clearly states that the GREEN/RED judgment also includes Unit+Functional | Bug reproduction/regression prevention | The summary must include both `Unit` and `Functional` |

## Implementation notes

- With the correction of this issue (#2814), at the end of section 2 of `SoloXP/skills/xp_Auditor/SKILL.md`, "The result is determined in section 3.
  Added a connection statement "Include" and added a new note parallel to the existing "Scope limited (#2784)" note at the beginning of section 3.
  (Unit/Functional summation judgment) was added.- Change the conditional statement in Step 2 (in the case of GREEN) to "E2E All PASS" → "Unit + Functional comprehensive judgment in Section 2 and E2E
  In step 3 (for RED), change the target to "E2E test" → "Unit/Functional/E2E test".
  Expanded to ``any of these.'' Ownership-based asymmetric block logic (#2807/#2809/#2818) itself has not changed
- The same content was added to the corresponding summary sentence of `docs/spec/xp_auditor.md`. Existing `RED → バグイシューを起票し`
  (which the issue-2818 test relies on as a regex anchor), and references to Unit/Functional are
  Added as a bracket immediately after
- The existing test `issue-2784-xp-auditor-story-level-scope-exemption.unit.test.js` has been changed in section 3 with this modification.
  As the amount of text increased, the regular expression window size was expanded from 2500 to 3200 characters (the assertion content itself
  (not changed)
- Section 6 (Task-level exclusive logic), heading wording, Step 1 (E2E execution)/Step 4 (E2E execution not possible) remain unchanged.
- **Additional correction to Codex review issue (PR #3398, P1 badge)**: The note at the beginning of section 3 at the time of initial implementation is
  Because the text stated, "If the overall judgment in Section 2 is RED, it will not be judged as GREEN unconditionally," so E2E's ownership base
  Asymmetric blocks (#2807/#2809/#2818) recognize that "all remaining REDs are non-block targets owned by other stories"
  GREEN" exception, and could have reintroduced mutual locking (a problem that #2807 was supposed to solve).
  Corrected the note to "via ownership determination (2./3.)" and added a regression test to prevent this discrepancy from occurring again.

## Coverage Summary

- Connection confirmation of section 2 → section 3: 2 items
- Story-level Auditor phase existence confirmation: 1 item
- Verification of bug reproduction of Unit/Functional built-in to GREEN/RED judgment: 2 items
- Regression confirmation (limited to section 6 scope): 1 item
- Verification that notes on Unit/Functional combination judgment do not ignore ownership exemption (preventing regression of Codex review points): 2 items
- Spec summary verification: 2 items
- Total: 10 items
