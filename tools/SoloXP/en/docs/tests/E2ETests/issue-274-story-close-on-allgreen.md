# E2E Test Document: Issue #274
## xp_Director E2E test when all sub-issues of the story are completed → Close flow

Test file: `SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js`

---

## User scenario overview

Verify that the flow that executes the E2E test and then closes the parent story when xp_Director detects that all sub-issues of a story issue have been completed (AllGREEN) is correctly defined in SKILL.md.

---

## Prerequisites

- `xp_Director` SKILL.md must exist in two locations
  - dotfiles version: `/root/.claude/skills/xp_Director/SKILL.md`
  - SoloXP version: `SoloXP/skills/xp_Director/SKILL.md`

---

## Test case list (10)

### [dotfiles] AllGREEN → E2E → Close flow (5 items)

| # | Given | When | Then |
|---|---|---|---|
| 1 | Dotfiles version of SKILL.md exists | Check AllGREEN detection logic | All sub-issue checks of `AllGREEN` or `[Auditor GREEN]` are listed |
| 2 | Dotfiles version of SKILL.md exists | Check xp_RunE2ETests call | `xp_RunE2ETests` string is written |
| 3 | Dotfiles version of SKILL.md exists | Check the closing process after E2E GREEN | E2E GREEN → Story closing instructions are written |
| 4 | The dotfiles version of SKILL.md exists | Check the processing when E2E execution is not possible | Instructions to be left to the user when execution is not possible/skip |
| 5 | A dotfiles version of SKILL.md exists | Check the fallback in case of E2E failure | Instructions for filing a new sub-issue in the event of failure are included |

### [SoloXP] AllGREEN → E2E → Close flow (5 items)

| # | Given | When | Then |
|---|---|---|---|
| 6 | SoloXP version SKILL.md exists | Check AllGREEN detection logic | All sub-issue checks of `AllGREEN` or `[Auditor GREEN]` are listed |
| 7 | SoloXP version SKILL.md exists | Check xp_RunE2ETests call | `xp_RunE2ETests` string is listed |
| 8 | SoloXP version SKILL.md exists | Check the closing process after E2E GREEN | E2E GREEN → Story closing instructions are listed |
| 9 | SoloXP version SKILL.md exists | Check the processing when E2E execution is not possible | Instructions to be entrusted to the user when execution is impossible/skip |
| 10 | SoloXP version SKILL.md exists | Check fallback in case of E2E failure | Instructions for filing a new sub-issue in case of failure are included |

---

## How to run the test

```bash
node SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js
```

---

## Acceptance conditions (Issue #274)

- [x] xp_Director detects that all subissues have `[Auditor GREEN]` → execute `xp_RunE2ETests`
- [x] E2E GREEN → Close parent story issue
- [x] E2E cannot be executed/skip → Leave the decision to the user by commenting on the issue (do not close automatically)
- [x] E2E failure → Create a new sub-issue with failure details, continue the parent issue
- [x] Add flow to xp_Director's SKILL.md (dotfiles + SoloXP)
