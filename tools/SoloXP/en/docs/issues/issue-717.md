---
issue: 717 title: "[Task] Implementing priority label propagation from parent issue to child issue" state: open labels: [task, epic/workflow] author: noragrammer-crypto created_at: 2026-04-24T00:34:13Z epic: workflow
---

# #717 [Task] Implement priority label propagation from parent issue to child issue

## Body

## overview
Add the process to propagate the priority label of the parent issue to the child issue to the sub-issue issuing logic of `xp_Architect/SKILL.md`.

### Changes

**Propagation target label:**
- `Emergency`
- `PriorityHigh`

**Propagation timing:**
- When xp_Architect creates sub-issues, if the parent issue has `Emergency` or `PriorityHigh`, it will give all sub-issues the same label.

### File to be changed
- `.claude/skills/xp_Architect/SKILL.md` (Add label propagation rule to section "5. Publish all sub-issues")

## estimate
2pt — SKILL.md revision/propagation rule added

## Dependencies
This task should be undertaken after completion of #716 (ProcessIssue priority label selection logic implementation).

## Parent story
#705

## comment

### noragrammer-crypto — 2026-04-24T01:00:00Z

Start of work 2026-04-24 01:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-04-24T01:05:00Z

[Tester completed]

E2E Test: 8 PASS / 4 FAIL (RED before implementation is normal) Skip: Unit / Functional — Change only SKILL.md

---

### noragrammer-crypto — 2026-04-24T01:08:00Z

[Implementer completed]

Add label propagation rules to `.claude/skills/xp_Architect/SKILL.md`. Test results: 12 PASS / 0 FAIL

---

### noragrammer-crypto — 2026-04-24T01:10:00Z

[Auditor GREEN] PASS: 12 items

Work completed 2026-04-24 01:10 / Required time: 10 minutes
