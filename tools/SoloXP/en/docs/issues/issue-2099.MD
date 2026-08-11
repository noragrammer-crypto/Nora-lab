---
issue: 2099 title: "[Task] Defining fallback procedures and updating E2E tests" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-07-15T12:11:51Z epic: SoloXP
---

# #2099 [Task] Define fallback procedures and update E2E tests

## Body

## overview
Define the fallback procedure in SKILL.md if feature-dev (or equivalent) cannot be called in xp_Architect step 3. At the same time, confirm that the existing E2E test is not broken and update the E2E test in accordance with the acceptance conditions.

### Implementation details
1. Define fallback procedure (add to SKILL.md):
   - If the feature-dev command is not supported or there is an error: Switch to manual code tracing (current flow)
   - Specify fallback activation conditions and confirmation method
2. Check and update existing E2E test suites:
   - Check that the existing tests under `SoloXP/tests/e2e/` pass
   - Update and add a test to verify acceptance condition 4 "Existing xp flow (subissue issue/GitHub linkage part) is not broken"

## estimate
1pt — Fallback definition/E2E update

## Dependencies
Start this task after completing #2098. (Start after [Auditor GREEN] comment is recorded in #2098)

depends_on: #2098

## Parent story
#1381

## Parent branch
feature/issue-1381

## comment

### noragrammer-crypto — 2026-07-16T20:26:53Z

## Observable change check ([Task] Skip judgment)

Target: #2099 Changes in observable behavior: None Reason: Only adding fallback procedures to xp_Architect's SKILL.md (internal orchestration definition) and adding test cases to the existing E2E test suite (`SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`). There are no changes to the API, UI, or output content that can be observed by the user/externally. Determine that Architect decomposition is unnecessary and proceed to the execution flow.

---

### noragrammer-crypto — 2026-07-16T20:26:58Z

Work started 2026-07-17 05:25 JST Session URL: https://claude.ai/code/session_014TCTUEnNExTeGFrdHShUQr [ProjectStatus: InProgress]

depends_on #2098: [Auditor GREEN] Confirmed that PR #2119 has been merged into feature/issue-1381. I'll get started.

---

### noragrammer-crypto — 2026-07-16T20:27:05Z

[Tester running]

## Testing policy

Add 3 tests to strengthen the validation of acceptance condition 3 (fallback procedure) to the existing E2E test suite (`SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`, created with #2097, 11 tests):

- AC3: Verify specific details of fallback “activation conditions” (timeout, unavailability, empty response, etc.)
- AC3: Verify the fallback "confirmation procedure" (step/comment recording format of manual trace).
- AC4: Verify that existing processing flow sections (0, 1, 2, 4 to 7) are not missing even after adding fallback (regression confirmation)

Before implementation, we confirmed that the above three items were RED.

---

### noragrammer-crypto — 2026-07-16T20:27:18Z

[Implementer running] [Implementer completed]

## Implementation completed

Change file:
- `dotfiles/.claude/skills/xp_Architect/SKILL.md`: In the "Fallback when `code-architect` cannot be called" section of step 3, **Triggering conditions** (error/timeout in Agent tool call itself/`code-architect` not found/unavailable/output is formatted due to empty response) and **Confirmation procedure** (1. Record error details → 2. Switching to manual code tracing (spec/code/reading existing tests) → 3. Added ``Fallback activation: Yes`` to the existing conflict check comment format → 4. Clarified manual tracing results (described as equivalent to Patterns & Conventions Found).
- `.claude/skills/xp_Architect/SKILL.md`: Reflects the same content as above (manual synchronization according to skill 3 copy synchronization rules of CLAUDE.md. `SoloXP/skills/` follows automatically with pre-push hook).
- `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`: Added 3 test cases (11 → 14), 2 test cases that verify AC3 activation conditions/confirmation procedures, and 1 test case that verifies AC4 regression confirmation (maintaining existing process flow section).

Test results:
- `cd SoloXP && npx jest tests/e2e/issue-1381-xp-architect-feature-dev.test.js`: **PASS 14/14** (Additional 3 items changed from RED to GREEN, existing 11 items continue to be PASS)
- `cd SoloXP && npx jest tests/e2e/`: 16 PASS / 2 FAIL out of 18 suites. The two FAILs (`issue-1410-worklog-markers.test.js`, `issue-254-workflow-update.test.js`) are unrelated to the changes in this task (it has been confirmed that they can be reproduced under the same conditions on `origin/feature/issue-1381` with the differences of this task removed using `git stash`. Instead of xp_Architect, xp_Director / xp_review_workflow related existing defects).

---

### noragrammer-crypto — 2026-07-16T20:27:38Z

[Auditor test running]

## Independent Verification

Check the changes with `git diff --stat`:
```
 .claude/skills/xp_Architect/SKILL.md                | 21 +++++++++++++++++++--
 SoloXP/docs/tests/E2ETests/issue-1381-xp-architect-feature-dev.md | 16 ++++++++++------
 SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js | 20 ++++++++++++++++++++
 dotfiles/.claude/skills/xp_Architect/SKILL.md       | 21 +++++++++++++++++++--
```

- The contents of `.claude/skills/xp_Architect/SKILL.md` and `dotfiles/.claude/skills/xp_Architect/SKILL.md` are an exact match (confirm no output with `diff`) → The 3-copy synchronization rule for CLAUDE.md (2 files subject to manual synchronization) is satisfied.
- Re-run `cd SoloXP && npx jest tests/e2e/issue-1381-xp-architect-feature-dev.test.js` and independently check **PASS 14/14**.
- Acceptance condition 3 (activation condition/confirmation procedure): Confirm that the 3 activation conditions (Agent tool error/timeout, code-architect not found/unavailable, empty response) and the 4 steps of confirmation procedure (record → manual trace switch → comment record format → result entry) are clearly specified in SKILL.md.
- Acceptance condition 4 (no destruction of existing flow): Check with `git diff` that there are no changes to steps 0, 1, 1-1, 2, 4-7, design philosophy, and precautions (mechanically verified with new tests).
- Confirmed that this task satisfies the "detailed activation conditions/confirmation procedures" that were outside the scope of dependent task #2098.

## Code under test

Due to changes in the document (SKILL.md) + test file itself, xp_RunTestSuites (unit/functional) is not applicable. We have run the entire E2E suite (18 suites) and have confirmed that all of them are PASS except for two existing bugs (related to #1410, #254, unrelated) (see Implementer comments).

[Auditor GREEN] Target: #2099 — Independent verification of fallback activation conditions/confirmation procedure definition and E2E test update.

---

### noragrammer-crypto — 2026-07-16T20:27:41Z

Work completed 2026-07-17 05:32 JST / Required time: 7 minutes

---
