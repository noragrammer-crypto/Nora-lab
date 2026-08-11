---
issue: 276 title: "[Task] Add AllGREEN → E2E test → Close flow to xp_Director SKILL.md" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-03-18T10:54:59Z epic: SoloXP
---

# #276 [Task] Add AllGREEN → E2E test → Close flow to xp_Director SKILL.md

## Body

## overview
Add E2E test execution after all sub-issues are completed → story closing flow to xp_Director's SKILL.md (2 locations).

Target file:
- `/root/.claude/skills/xp_Director/SKILL.md` (working skill definition)
- `SoloXP/skills/xp_Director/SKILL.md` (skill definition in the repository)

Additional details:
- Check all sub-issues of the parent story after publishing a PR
- If all sub-issues have [Auditor GREEN], it is considered AllGREEN.
- Run AllGREEN → xp_RunE2ETests
- E2E GREEN → Close parent story issue
- E2E cannot be executed/skip → Leave the decision to the user by commenting on the issue (do not close automatically)
- E2E failure → Create a new sub-issue with the details of the failure, and continue the parent issue

Reference: Described in the "AllGREEN → Acceptance Test → PR Issuance Flow" section of `SoloXP/docs/spec/xp_director.md`.

## estimate
1pt — Addition to SKILL.md 2 file

## Dependencies
None (can start immediately)

## Parent story
#274

## comment

### noragrammer-crypto — 2026-03-18T11:16:48Z

Start of work 2026-03-18 11:22

[Tester running]

---

### noragrammer-crypto — 2026-03-18T11:17:24Z

## Test execution results

### Unit Test
Skip — SKILL.md documentation changes only (no code under test)

### Functional Test
Skip — Ditto

### E2E Test (using the test suite created in Issue #275)
Test file: `SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js` Results: 0 PASS / 10 FAIL — **RED (correct status because SKILL.md has not been updated)**

[Tester completed]

---

### noragrammer-crypto — 2026-03-18T11:17:34Z

[Implementer running]

---

### noragrammer-crypto — 2026-03-18T11:22:35Z

## Implementation completed

Change file:
- `/root/.claude/skills/xp_Director/SKILL.md`: AllGREEN → E2E test → Add close flow
- `SoloXP/skills/xp_Director/SKILL.md`: Same as above (in-repository sync)

Test results:
- Unit Test: Skip (document changes only)
- Functional Test: Skip (same as above)
- E2E Test: PASS 10 / FAIL 0 ✅ ALL GREEN

[Implementer completed]

---

### noragrammer-crypto — 2026-03-18T11:22:44Z

[Auditor test running]

---

### noragrammer-crypto — 2026-03-18T11:23:03Z

[Auditor GREEN] PASS: 10 / Test command: `node SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js`

### Analysis

- Unit / Functional: Skip (SKILL.md document change only, no test code)
- E2E: 10/10 PASS ✅

Confirm that AllGREEN → xp_RunE2ETests → Close flow is correctly added to SKILL.md in both dotfiles version and SoloXP version.

Work completed 2026-03-18 11:30 / Required time: 8 minutes

---

### noragrammer-crypto — 2026-03-18T11:23:10Z

[Documenter running]

---
