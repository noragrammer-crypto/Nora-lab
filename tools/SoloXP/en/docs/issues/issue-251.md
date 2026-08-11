---
issue: 251 title: "[Task] Add AllGREEN → Acceptance test → PR issue flow to xp_Director skill" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-03-18 epic: SoloXP
---

# #251 [Task] Add AllGREEN → Acceptance test → PR issue flow to xp_Director skill

## Body

## overview
Modify xp_Director SKILL.md and add a flow that executes the acceptance test (including E2E) of the parent story issue when all sub-issues become [Auditor GREEN] and issues a PR according to the results.

### Flow specification
1. After completing each subtask, check whether all subissues of the parent story are [Auditor GREEN]
2. If all items are completed:
   - Run acceptance tests for parent story issue (via xp_RunE2ETests)
   - ✅ Pass → Publish PR for parent issue and Close
   - ❌ Failure → Create a new sub-issue with failure details, continue the parent issue

### File to be changed
- `SoloXP/skills/xp_Director/SKILL.md`
- `dotfiles/.claude/skills/xp_Director/SKILL.md`

## estimate
2pt — Modified SKILL.md (added flow)

## Dependencies
Start this task after completing #250. (Start after [Auditor GREEN] comment is recorded in #250)

## Parent story
#243

## comment

### noragrammer-crypto — 2026-03-18T03:37:28Z

Start of work 2026-03-18 03:37

---

### noragrammer-crypto — 2026-03-18T03:37:34Z

[Tester running]

---

### noragrammer-crypto — 2026-03-18T03:38:51Z

## Test execution results

### Unit Test
Skip — SKILL.md modification task has no code to test (document changes only)

### Functional Test
Skip — Ditto

### E2E Test (prior confirmation of acceptance conditions)
Test file: `SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js` Results: 0 PASS / 8 FAIL (RED status before implementation)

breakdown:
- Condition 1 (Auditor SKILL.md: 4 FAIL) → PR #257 FAIL in main because it was not merged. Scope of task #250
- Condition 2 (Director SKILL.md: 4 FAIL) → Scope of this task #251

Implementation goal of this task: Make 4 items of condition 2 GREEN

---

### noragrammer-crypto — 2026-03-18T03:38:56Z

[Tester completed]

---

### noragrammer-crypto — 2026-03-18T03:39:03Z

[Implementer running]

---

### noragrammer-crypto — 2026-03-18T03:40:33Z

## Implementation completed

Change file:
- `.claude/skills/xp_Director/SKILL.md`: AllGREEN confirmation → acceptance test (xp_RunE2ETests) → ✅Pass → PR issue / ❌Failure → Add new sub-issue flow
- `SoloXP/skills/xp_Director/SKILL.md`: Same as above (for source)

Test results:
- E2E (condition 2): 4 PASS / 0 FAIL ✅
- E2E (condition 1): 4 FAILs (PR #257 due to unmerged. Scope of #250)

---

### noragrammer-crypto — 2026-03-18T03:40:39Z

[Implementer completed]

---

### noragrammer-crypto — 2026-03-18T03:40:46Z

[Auditor test running]

---

### noragrammer-crypto — 2026-03-18T03:41:42Z

[Auditor GREEN] PASS: 4 / Test command: `node SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js`

All tests corresponding to acceptance condition 2 (change xp_Director SKILL.md) passed. 4 FAILs are acceptance conditions 1 (xp_Auditor SKILL.md) = scope of task #250 (PR #257 unmerged state).

---

### noragrammer-crypto — 2026-03-18T03:41:50Z

Work completed 2026-03-18 03:41 / Required time: 5 minutes

---

### noragrammer-crypto — 2026-03-18T03:41:56Z

[Documenter running]

---
