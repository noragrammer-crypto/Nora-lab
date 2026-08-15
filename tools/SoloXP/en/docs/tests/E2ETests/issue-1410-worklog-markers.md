# E2E Test Document: Issue #1410
## xp_Director Parent issue work start record + xp_Implementer Add thread marker

Test file: `SoloXP/tests/e2e/issue-1410-worklog-markers.test.js`

---

## User scenario overview

Verify that there is an instruction to record the start of work on the parent Bug/Story issue in the "After Architect Completion" section of xp_Director SKILL.md, that there is an instruction to record the work completed when AllGREEN is completed, and that there is an instruction to record the `[Implementer running] marker in xp_Implementer SKILL.md. Also make sure that the dotfiles and SoloXP copies are identical.

---

## Prerequisites

- `dotfiles/.claude/skills/xp_Director/SKILL.md` must exist
- `SoloXP/skills/xp_Director/SKILL.md` must exist
- `dotfiles/.claude/skills/xp_Implementer/SKILL.md` must exist
- `SoloXP/skills/xp_Implementer/SKILL.md` must exist

---

## List of test cases (9)

### Acceptance condition 1: xp_Director - Architect There is an instruction to record the start of work on the parent issue in the after completion section (3 items)

| # | Given | When | Then |
|---|---|---|---|
| 1 | xp_Director SKILL.md exists | Check the "After Architect completion (for Story/Bug)" section | Section exists |
| 2 | Section exists | Check the work start record instructions | There is a description of “start work” |
| 3 | Section exists | [ProjectStatus] Check recording instructions | `[ProjectStatus: InProgress]` is written |

### Acceptance condition 2: xp_Director - AllGREEN Upon completion, there is an instruction to record work completion to the parent issue (2 cases)

| # | Given | When | Then |
|---|---|---|---|
| 4 | xp_Director SKILL.md exists | Check AllGREEN check section | Section exists |
| 5 | A section exists | Check the work completion record instructions | There is a description of “work completed” |

### Acceptance condition 3: xp_Implementer SKILL.md has [Implementer running] recording instructions (2 items)

| # | Given | When | Then |
|---|---|---|---|
| 6 | xp_Implementer SKILL.md exists | [Implementer running] Check the text | There is a description of `[Implementer running]` |
| 7 | [Implementer running] exists | Check if it exists as a comment recording instruction | `Comment` and `[Implementer running]` are close within 300 characters |

### Acceptance condition 4: dotfiles and SoloXP's SKILL.md have the same content (2 items)

| # | Given | When | Then |
|---|---|---|---|
| 8 | dotfiles and SoloXP's xp_Director SKILL.md exist | Compare both files | The contents match exactly |
| 9 | dotfiles and SoloXP's xp_Implementer SKILL.md exist | Compare both files | The contents match exactly |

---

## Implementation status

| Subissue | Contents | Status |
|---|---|---|
| #1444 | Added reproduction test + corrected implementation | Completed |
| #2059 | Regression: the AllGREEN section heading changed and acceptance condition 2 turned RED again. Resolved by #2792 (reproduction test) and #2793 (heading correction). | Complete |

---

## Execution result

| Execution date | PASS | FAIL | Status |
|---|---|---|---|
| 2026-06-15 | 0 | 9 | Before implementation (RED confirmation) |
| 2026-06-15 | 9 | 0 | #1444 After implementation (all GREEN) |
| 2026-08-08 | 7 | 2 | #2059 regression detected: the `AllGREEN Check` heading text had disappeared, so acceptance condition 2 became RED again. |
| 2026-08-09 | 9 | 0 | After #2793: heading corrected and all cases returned to GREEN. |
