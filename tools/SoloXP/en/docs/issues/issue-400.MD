---
issue: 400
title: "[Task] New ProcessIssue skill creation"
state: closed
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-03-23T06:29:28Z
epic: SoloXP
---

# #400 [Task] ProcessIssue skill newly created

## Body

## Overview
Select an unblocked issue from the open issue list,
Create a new skill `ProcessIssue` that executes one of three workflows depending on the content.

### Requirements (from #397)
Three workflow distribution logics:
1. **NovelGenerator Workflow** → Call `NovelGeneratorRun`
2. **Fallen Puppet User Writing Issue** → Manual work (following user instructions). Do not run automatically
3. **Software development/skill development system** → Call `/xp_Director `

### Positioning
- Successor/migration destination of `/xp_Director` (no argument)
- `/xp_Director` (no argument) itself is not deleted

### Location
`/root/.claude/skills/ProcessIssue/`

## Quote
2pt — Skill design/distribution logic implementation

## Dependencies
Start this task after completing #399 (new NovelGeneratorRun skill).
(Start after the [Auditor GREEN] comment is recorded in the dependent sub-issue)

## Parent story
#397

## Comment

### noragrammer-crypto — 2026-03-23T06:48:20Z

Start of work 2026-03-23 07:00

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
- [ ] There is a manual execution instruction for the fallen puppet user writing system (it does not execute automatically)
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
Test file: `SoloXP/__tests__/process-issue-skill.unit.test.js`
Result: 0 PASS / 11 FAIL (RED is correct because SKILL.md has not been created)

Proposition check:
- [ ] SKILL.md file exists (FAIL: file not created)
- [ ] Contains command definition section (FAIL: file not created)
- [ ] Includes role/purpose section (FAIL: file not created)
- [ ] Includes processing flow/procedure section (FAIL: file not created)
- [ ] There is an open issue list acquisition logic (FAIL: file not created)
- [ ] There is an instruction to select unblocked issues (FAIL: file not created)
- [ ] There is a NovelGenerator workflow distribution (FAIL: file not created)
- [ ] There is a classification of fallen puppet masters and writers (FAIL: file not created)
- [ ] There is a manual execution instruction for the fallen puppet master writing system (FAIL: file not created)
- [ ] There is xp_Director distribution for software development (FAIL: file not created)
- [ ] There is an instruction to pass the issue number when calling xp_Director (FAIL: file not created)

### Functional Test
Test file: `SoloXP/__tests__/process-issue-skill.functional.test.js`
Result: 0 PASS / 6 FAIL (RED is correct because SKILL.md has not been created)

---
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

[Auditor GREEN]
PASS: 17 items / Test command: `npx jest --testPathPattern='process-issue-skill'`

- Unit test: 11 PASS / 0 FAIL
- Functional test: 6 PASS / 0 FAIL

Work completed 2026-03-23 07:15 / Required time: 15 minutes

---

### noragrammer-crypto — 2026-03-23T06:52:23Z

[Documenter running]

---

### noragrammer-crypto — 2026-03-23T06:55:00Z

[Documenter completed]

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-400.MD`: Issue Archive
- `SoloXP/docs/spec/process_issue.md`: ProcessIssue skill functional specification (new)- `SoloXP/docs/spec/README.md`: Add ProcessIssue to index
- `SoloXP/docs/tests/E2ETests/issue-397-process-issue-commands.md`: E2E test documentation

---

### noragrammer-crypto — 2026-03-23T06:55:11Z

[Checking Auditor document]

---

### noragrammer-crypto — 2026-03-23T06:55:44Z

[PR issued #403]

### Document check results
- spec/README.md: OK (Added ProcessIssue to index)
- spec/process_issue.md: OK (describes commands, processing flow, distribution logic, and relationship with xp_Director)
- docs/issues/issue-400.MD: OK (issue archive created)
- tests/E2ETests/issue-397-process-issue-commands.md: OK (recorded 15 E2E test scenarios)

---
