# E2E test document: Sub-issue completion report and parent issue acceptance confirmation

## Test file

`SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js`

## Scenario overview

Verify the acceptance conditions of Issue #243 "Separate sub-issue completion report and parent issue acceptance confirmation". Ensure that the SKILL.md for xp_Auditor and xp_Director contains the necessary instructions.

---

## Acceptance condition 1: Parent issue completion report when sub-issue is completed

### Test target

`xp_Auditor` SKILL.md（`.claude/skills/xp_Auditor/SKILL.md`）

### Test case

| # | Test name | Confirmation pattern |
|---|---|---|
| 1 | Includes completion report comment instructions for parent issue | `/parent issue.*completion report\|completion report.*parent issue/` |
| 2 | Contains example comments in the format "Subissue #xx completed. Remaining: #yy" | `/subissue.+completed.+remaining/` |
| 3 | Includes steps to obtain parent story issue number | `/parent story\|parent.*stor\|parent issue.*number\|number.*parent/i` |
| 4 | Contains remaining subissue identification logic | `/remaining.*subissue\|open.*task\|open.*task\|remaining.*task/i` |

**Supported implementation**: PR #257 (issue #250)

---

## Acceptance condition 2: Execute acceptance test and issue PR upon completion of all sub-issues

### Test target

`xp_Director` SKILL.md（`.claude/skills/xp_Director/SKILL.md`）

### Test case

| # | Test name | Confirmation pattern |
|---|---|---|
| 1 | Includes instructions for checking all subissues complete | `/all.*subissues.*complete\|all.*GREEN\|AllGREEN\|all.*green/i` |
| 2 | Contains instructions to run acceptance tests when all sub-issues are completed | `/Acceptance Test\|acceptance.*test\|xp_RunE2ETests/i` |
| 3 | Includes the flow of acceptance test passing → PR issuance | `/pass.*PR\|✅.*PR\|GREEN.*PR\|pass.*PR/i` |
| 4 | Includes the flow of acceptance test failure → new sub-issue filing | `/fail.*sub-issue\|❌.*sub-issue\|fail.*issue\|new.*sub-issue.*sub-issue/i` |

**Corresponding implementation**: issue #251 (this task)

---

## Prerequisites

- `.claude/skills/xp_Auditor/SKILL.md` must exist
- `.claude/skills/xp_Director/SKILL.md` must exist

## How to run

```bash
node SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js
```
