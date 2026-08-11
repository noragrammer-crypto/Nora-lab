---
issue: 2097 title: "[Task] Create E2E test suite" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-07-15T12:11:29Z epic: SoloXP
---

# #2097 [Task] E2E test suite creation

## Body

## overview
Create an E2E test suite based on the acceptance conditions of story #1381. Define acceptance tests with tests first before implementation begins.

Acceptance conditions:
1. step 3 of xp_Architect calls `/feature-dev` (or equivalent subcommand/agent)
2. SKILL.md clearly specifies how to convert the output of feature-dev to an xp execution plan (depends_on / task_type mapping)
3. Fallback procedures are clearly specified in case feature-dev cannot be called (command not supported/error)
4. The existing xp flow (subissue issue/GitHub linkage part) is not broken.

## estimate
1pt — E2E test design and creation

## Dependencies
None (can be started immediately/implemented before implementation tasks)

## Parent story
#1381

## Parent branch
feature/issue-1381

## remarks
task_type: e2e_test_creation xp_Director should process this task with xp_E2Etest 1381.

## comment

### noragrammer-crypto — 2026-07-16T12:06:03Z

Work started 2026-07-16 12:00 Session URL: https://claude.ai/code/session_01WwRaZuAxWnvWLQYhKdSvfM [ProjectStatus: InProgress]

---
## Observable change check ([Task] Skip judgment)

Target: #2097 Change in observable behavior: None Reason: Creating an E2E test suite is an addition to the test infrastructure and does not change the behavior of the product (xp_Architect skill) itself. Architect Skip directly to the e2e_test_creation flow.

---

### noragrammer-crypto — 2026-07-16T12:06:19Z

[Running E2Etest] Call xp_E2Etest 1381

---

### noragrammer-crypto — 2026-07-16T12:10:42Z

## E2E test suite creation completed

Test file: `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js` Number of test cases: 11

| # | Acceptance Condition | Test Case | Status |
|---|---|---|---|
| 1 | SKILL.md exists | xp_Architect SKILL.md exists | ✅ GREEN |
| 2 | AC1: step 3 calls feature-dev or equivalent | Contains reference to feature-dev or equivalent code exploration agent | ✅ GREEN (section title) |
| 3 | AC1: step 3 section-specific check | Conflict check step includes agent invocation description | 🔴 RED (waiting for implementation) |
| 4 | AC2: depends_on/task_type mapping instructions | Contains instructions for mapping depends_on to task_type | 🔴 RED (pending implementation) |
| 5 | AC2: Description of conversion steps | Includes steps to convert code search results to task plans | 🔴 RED (waiting for implementation) |
| 6 | AC3: Fallback mention | Includes mention of fallback | 🔴 RED (waiting for implementation) |
| 7 | AC3: Fallback alternative behavior | Fallback procedure describes alternative behavior (such as manual code tracing) | 🔴 RED (waiting for implementation) |
| 8 | AC4: Sub-issue publication | Sub-issue publication instructions exist | ✅ GREEN |
| 9 | AC4: depends_on field | depends_on: field description exists | ✅ GREEN |
| 10 | AC4: GitHub Sub-Issues integration | GitHub Sub-Issues API integration description exists | ✅ GREEN |
| 11 | AC4: task_type field | task_type field description exists | ✅ GREEN |

**Test execution results: 5 failed, 6 passed (RED state is correct)**

RED test will become GREEN with implementation of #2098 (revised SKILL.md) and #2099 (fallback definition).

---
[E2Etest completed]

---

### noragrammer-crypto — 2026-07-16T12:11:00Z

[Auditor test running]

---

### noragrammer-crypto — 2026-07-16T12:12:20Z

[Auditor GREEN] PASS: 185 (SoloXP unit tests all GREEN, no regression)

### Auditor Analysis

**Target task**: e2e_test_creation (E2E test suite creation)
**Test file**: `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`

**Unit test**: 185 PASS / 0 FAIL (existing 18 suites, no regressions)

**E2E test condition**: 5 RED / 6 GREEN (correct condition as TDD)
- RED: AC1-step3, AC2×2, AC3×2 → Scheduled to become GREEN in implementation task #2098/#2099
- GREEN: Existing flow protection 4 items + SKILL.md existence confirmation + AC1-feature-dev reference

**Judgment**: The purpose of the e2e_test_creation task (predefined acceptance test) has been achieved.
E2E testing being RED is a correct state based on TDD principles. No out-of-scope bugs.

---

### noragrammer-crypto — 2026-07-16T12:12:33Z

[Documenter running]

---

### noragrammer-crypto — 2026-07-16T12:13:32Z

[Documenter completed] E2E test documentation: `SoloXP/docs/tests/E2ETests/issue-1381-xp-architect-feature-dev.md`

[Checking Auditor document]

---

### noragrammer-crypto — 2026-07-16T12:15:58Z

[Checking Auditor document]

### Document check results
- E2ETests documentation (`SoloXP/docs/tests/E2ETests/issue-1381-xp-architect-feature-dev.md`): OK ✅
- issue2md log: NG ❌ (missing)

---

[Auditor doc NG: issue2md log] Target: `SoloXP/docs/issues/issue-2097.MD` Reason: Missing (file does not exist) xp_Director should send issue2md back to xp_Documenter.

---
