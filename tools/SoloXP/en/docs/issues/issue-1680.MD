---
issue: 1680 title: "[Task] Add bug reproduction test" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-06-26T17:13:22Z epic: SoloXP
---

# #1680 [Task] Bug reproduction test added

## Body

## overview

Add a test case that reproduces reported bug #1293. Test first to prove the existence of bugs and set acceptance criteria for fix tasks.

SKILL.md of `xp_RunE2ETests` does not have a branching logic that says “Determine whether the test runner is Jest or Playwright based on the `test:e2e` script content in `package.json`, and if it is Jest, skip the communication check to Vercel/localhost and execute `npm run test:e2e` as is.” Therefore, even if you target `SoloXP/tests/e2e/` (Jest-based, no HTTP communication), if you follow the steps in the current SKILL.md, the communication check will fail and execution will be skipped.

Add the reproduction test to `SoloXP/tests/unit/` as a Jest test, and add the SKILL.md body of `xp_RunE2ETests` (3 places: `.claude/skills/xp_RunE2ETests/SKILL.md`, `SoloXP/skills/xp_RunE2ETests/SKILL.md`, Write to verify that `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`) contains a description regarding "test runner automatic determination" (currently it is RED because there is no description).

## estimate

1pt — Design and create reproduction tests

## Dependencies

None (can be started immediately / must be performed before the correction task)

## Parent story

#1293

## Parent branch

feature/issue-1293

## remarks

task_type: bug_reproduction_test xp_Director should process this task with xp_UnitTest + xp_FunctionalTest.

## comment

### noragrammer-crypto — 2026-06-27T00:06:05Z

## Observable change check ([Task] Skip judgment)

Target: #1680 Changes in observable behavior: None Reason: Just adds a bug reproduction test to SoloXP/tests/unit/, without changing the behavior (API, UI, output content) that can be observed by users/externals. Skip Architect and proceed to the execution flow.

---

### noragrammer-crypto — 2026-06-27T00:06:07Z

Work started 2026-06-27 (time unknown, session start) Session URL: https://claude.ai/code/session_01NXfxA73u9VyyM3KvYvgeaU [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-27T00:07:55Z

## Test proposition (Unit)

- [x] SKILL.md (3 places) includes a description to check the `test:e2e` script contents (affirmative)
- [x] Contains conventional flow description when SKILL.md (3 places) includes `playwright` (affirmative)
- [ ] Contains branching logic that skips communication check when SKILL.md (3 locations) is `jest` (does not include playwright) (Negation → No description at present, RED)

## Test execution results

### Unit Test
Test file: `SoloXP/tests/unit/issue-1680-rune2etests-runner-autodetect.unit.test.js` Target: `.claude/skills/xp_RunE2ETests/SKILL.md`, `SoloXP/skills/xp_RunE2ETests/SKILL.md`, `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md` (Content matching has been confirmed in all three locations)

Result: 6 PASS / 3 FAIL (3 SKILL.md × "Skip communication check during jest runner" assertion all FAIL)

```
Test Suites: 1 failed, 1 total
Tests:       3 failed, 6 passed, 9 total
```

No regression to existing suite (`npm run test:unit` entire: 1 failed (new), 13 passed, 133 tests / all 130 existing tests are PASS).

### Functional Test
Skip: This task is executed only on Unit because `task_type: bug_reproduction_test` (only added to `SoloXP/tests/unit/` as described in SKILL.md).

### E2E Test
Skip: Not applicable due to bug_reproduction_test.

---

Bug reproduction test completed: Confirmed that the test is RED. Defined acceptance criteria for fix task #1681. No need to transfer to Implementer (this task is only for test creation).

---

### noragrammer-crypto — 2026-06-27T00:09:01Z

## /xp_RunTestSuites Results

Branch: claude/wizardly-newton-0g1yv8

### Unit test (SoloXP)
- Results: 130 PASS / 3 FAIL
- All 3 FAIL items are newly added `issue-1680-rune2etests-runner-autodetect.unit.test.js`, assertion "The branch that skips communication check during jest runner is described in SKILL.md" (3 SKILL.md minutes)
- No return to existing 130 items

### Functional test (SoloXP)
- Results: 20 PASS / 0 FAIL

---

## FAIL analysis

**[issue-1680: Communication check skip branch during jest runner]**
- Error: `expect(content).toMatch(/jest/i)` / `toMatch(/Skip connectivity check/)` — None of the 3 SKILL.md locations match
- Scope: Within the scope of this task (#1680) itself (task_type: bug_reproduction_test)
- Verdict: **INTENTED RED**. The purpose of this task is to prove bug #1293 (missing test runner automatic judgment logic) through testing, and this RED is the acceptance criterion itself.
- Rationale: Other assertions in the same test file (checking the existence of `test:e2e` description and `playwright` description) are PASS, so the test itself is not broken. FAIL is accurately detecting only the missing jest branch logic

[Auditor GREEN] PASS (Valid/intended RED as a bug reproduction test): Test command `npm run test:unit -- --testPathPattern=tests/unit` This task (#1680: Bug reproduction test addition) is completed. The acceptance criterion for modification task #1681 is to change this RED to GREEN.

---
