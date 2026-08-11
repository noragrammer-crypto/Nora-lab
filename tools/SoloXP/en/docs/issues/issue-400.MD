---
issue: 400 title: "[Task] New ProcessIssue skill" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-03-23T06:29:28Z epic: SoloXP
---

# #400 [Task] ProcessIssue skill newly created

## Body

## overview
Create a new `ProcessIssue` skill that selects an unblocked issue from the open issue list and executes one of three workflows depending on the content.

### Requirements (from #397)
Three workflow distribution logics:
1. **NovelGenerator Workflow** → Call `NovelGeneratorRun`
2. **Fallen Puppet User Writing Issue** → Manual work (following user instructions). Do not run automatically
3. **Software development/skill development system** → Call `/xp_Director <issue_number>`

### Positioning
- Successor/migration destination of `/xp_Director` (no argument)
- `/xp_Director` (without argument) itself is not deleted

### Location
`/root/.claude/skills/ProcessIssue/`

## estimate
2pt — Skill design/distribution logic implementation

## Dependencies
Start this task after completing #399 (new NovelGeneratorRun skill). (Start after the [Auditor GREEN] comment is recorded in the dependent sub-issue)

## Parent story
#397

## comment

### noragrammer-crypto — 2026-03-23T06:48:20Z

Start of work 2026-03-23 ​​07:00

---

### noragrammer-crypto — 2026-03-23T06:48:53Z

[Tester running]

---

### noragrammer-crypto — 2026-03-23T06:49:05Z

## Test proposition (Unit)

- [ ] SKILL.md file exists (.claude/skills/ProcessIssue/SKILL.md)
- [ ] Contains command definition section (/ProcessIssue command)
- [ ] Contains role/purpose section
- [ ] Contains process flow/procedure section
- [ ] There is an open issue list acquisition logic (gh issue list)
- [ ] There is an instruction to select unblocked issues (depends_on / block judgment)
- [ ] There is NovelGenerator workflow distribution (NovelGeneratorRun call)
- [ ] There is a classification of fallen puppet master writers.
- [ ] There is a manual execution instruction for the fallen puppet master writing system (it does not execute automatically)
- [ ] There is xp_Director distribution for software development.
- [ ] There is an instruction to pass the issue number when calling xp_Director.

## Test proposition (Functional)

- [ ] The three workflow distributions are comprehensively described.
- [ ] The identification criteria for NovelGenerator issues are clearly stated.
- [ ] The criteria for identifying failed puppeteer issues are clearly specified.
- [ ] Identification criteria for software development issues are clearly specified.
- [ ] The role relationship and positioning with xp_Director is clearly specified.

---

### noragrammer-crypto — 2026-03-23T06:50:00Z

## Test execution results

### Unit Test
Test file: `SoloXP/__tests__/process-issue-skill.unit.test.js` Results: 0 PASS / 11 FAIL (RED is correct because SKILL.md has not been created)

### Functional Test
Test file: `SoloXP/__tests__/process-issue-skill.functional.test.js` Results: 0 PASS / 6 FAIL (RED is correct because SKILL.md has not been created)

Skip: E2E — E2E is not required due to skill file definition task

[Tester completed]

---

### noragrammer-crypto — 2026-03-23T06:50:33Z

[Implementer running]

---

### noragrammer-crypto — 2026-03-23T06:51:53Z

## Implementation completed

Change file:
- `.claude/skills/ProcessIssue/SKILL.md`: New ProcessIssue skill
- `SoloXP/__tests__/process-issue-skill.unit.test.js`: Unit test
- `SoloXP/__tests__/process-issue-skill.functional.test.js`: Functional test

Test results:
- Unit test: 11 PASS / 0 FAIL
- Functional test: 6 PASS / 0 FAIL

[Implementer completed]

---

### noragrammer-crypto — 2026-03-23T06:52:06Z

[Auditor test running]

---

### noragrammer-crypto — 2026-03-23T06:52:15Z

[Auditor GREEN] PASS: 17 / Test command: `npx jest --testPathPattern='process-issue-skill'`

- Unit test: 11 PASS / 0 FAIL
- Functional test: 6 PASS / 0 FAIL

Work completed 2026-03-23 ​​07:15 / Required time: 15 minutes

---

### noragrammer-crypto — 2026-03-23T06:52:23Z

[Documenter running]

---
