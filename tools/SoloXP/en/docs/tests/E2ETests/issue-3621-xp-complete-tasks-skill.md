# E2E Test Document: Issue #3621
## Create a new xp_CompleteTasks skill (loop that sequentially processes sub-tasks with xp_Director and progresses to AllGREEN)

Test file: `SoloXP/tests/e2e/issue-3621-xp-complete-tasks-skill.test.js`

---

## User scenario overview

After the parent Story/Bug issue is decomposed into sub-issues by `xp_Architect`, each sub-Task is
Verifying the new skill `xp_CompleteTasks`, which automates the work of implementing one step at a time with `/xp_Director`.
`SoloXP/skills/xp_CompleteTasks/SKILL.md` (#3623) includes sub-task completion determination, PR merge wait polling,
AllGREEN flow start/stop conditions must be clearly specified and a functional specification (#3624) has been created.
Verify that `SoloXP/docs/spec/README.md` is added to the index.

`toContain` / Structure/contract without asserting the text/heading number of SKILL.md using regular expressions
Verify only (existence of required sections, frontmatter schema, existence of referenced files, etc.)
(`SoloXP/docs/spec/tdd_principles.md` Principle 7).

---

## Prerequisites

- `SoloXP/skills/xp_CompleteTasks/SKILL.md` exists (after #3623 is completed)
- `SoloXP/docs/spec/xp_complete_tasks.md` exists (after #3624 is completed)
- `SoloXP/docs/spec/README.md` exists

---

## List of test cases (18)

### Acceptance condition 1: Existence of SKILL.md and basic contract (#3623・16 items)

| # | Given | When | Then |
|---|---|---|---|
| 1 | Repository exists | Check `SoloXP/skills/xp_CompleteTasks/SKILL.md` | File exists |
| 2 | SKILL.md exists | Extract frontmatter | `model:` field specified |
| 3 | SKILL.md exists | Check the text | `/xp_CompleteTasks` command is defined |
| 4 | SKILL.md exists | Check the heading | "Command" section exists |
| 5 | SKILL.md exists | Check heading | Responsibilities section exists |
| 6 | SKILL.md exists | Check the heading | A section equivalent to "Processing Flow" exists |
| 7 | SKILL.md exists | Check the heading | "Notes" section exists |
| 8 | SKILL.md exists | Check the description when the parent issue is not decomposed | The description of "undecomposed" or "decomposed" + "stop" is nearby |
| 9 | SKILL.md exists | Check the description of subissue completion determination | Both `[Auditor GREEN]` and `[Auditor doc OK]` are included |
| 10 | SKILL.md exists | Check the description of sub-issue completion determination | There is a mention of `merged` (merged) confirmation in the corresponding PR |
| 11 | SKILL.md exists | Check the description of waiting for PR merge | "Polling" or "Wait" and "Merge" are close to each other |
| 12 | SKILL.md exists | Check the description of AllGREEN flow activation | There is mention of both `AllGREEN` and `xp_Director` |
| 13 | SKILL.md exists | Check the description of PR issue confirmation for main | There is a description of `feature/issue-{親番号}` → `main` || 14 | SKILL.md exists | main Check the merge wait description | "main", "merge", and "don't wait/owner/user" are in close proximity |
| 15 | SKILL.md exists | Check the reference to xp_Director | There is a reference to the "1 task 1 PR" rule |
| 16 | SKILL.md exists | Check the description of whether automatic merging is enabled | "Automatic merging" and "Do not perform/do not perform" are close to each other |

### Acceptance condition 2: Functional specifications (#3624・2 items)

| # | Given | When | Then |
|---|---|---|---|
| 17 | Repository exists | Check `SoloXP/docs/spec/xp_complete_tasks.md` | File exists |
| 18 | `SoloXP/docs/spec/README.md` exists | Check index | Contains link to `xp_complete_tasks.md` |

---

## Execution result

| Execution date | PASS | FAIL | Status |
|---|---|---|---|
| 2026-09-07 | 0 | 3 | Before implementation (RED confirmation. Because SKILL.md was not created, only #1, #17, and #18 were executed and failed, the rest were not registered due to `if (skill)` guard) |
