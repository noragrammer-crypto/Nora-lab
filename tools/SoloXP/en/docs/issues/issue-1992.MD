---
issue: 1992 title: "[Task] Implementation of issue triage skill" state: open labels: [task] author: noragrammer-crypto created_at: 2026-07-11T13:50:31Z epic: SoloXP
---

# #1992 [Task] Implementation of issue triage skill

## Body

## overview

Implement the issue triage agent itself as a new skill.

### Things to do
- Get list of open issues with `bug` label
- Go back through the comments of the most recent `daily-tasks` tracking issue ("YYYY MM Month DD Day Daily Task") and extract the tasks recorded as `ERROR` and the bug issue number referenced there.
- Give the `PriorityHigh` label to the same bug issue only if it is recorded as ERROR continuously for multiple days.
- Do nothing for single ERRORs or cases where multiple causes are involved and the isolation is ambiguous (if you are not confident in the judgment, you can skip it)
- Do not use the number of days that have passed as a basis for judgment.
- Do not refer to the conversation log (subagent session content). Use only the text on GitHub issues as judgment material

### Placement
According to the "3-copy structure of skill files" in CLAUDE.md, place them in both of the following locations (manually align them as they are not automatically synchronized):
- `.claude/skills//SKILL.md`
- `dotfiles/.claude/skills//SKILL.md`

## estimate
2pt — Judgment logic implementation/skill file creation

## Dependencies
None (can be started immediately. However, it is preferable to start after creating the E2E test of #1991 to test first)

## Parent story
#1990

## comment

### noragrammer-crypto — 2026-07-11T14:10:00Z

## Observable change check ([Task] Skip judgment)

Target: #1992 Observable behavior change: Yes (`PriorityHigh` label is automatically assigned to GitHub issues when the skill is executed) Reason: However, parent story #1990 is already `xp_Architect` The story has been decomposed (`[parent branch created]` confirmed), and the E2E test task (#1991, completed and closed) to verify the acceptance conditions of this task and the functional specification update task (#1994, `task_type: spec_update`) have already been published as sub-issues. Since the necessity of E2E/spec has been determined at the time of Story decomposition, no additional Architect calls are made for each task (to prevent duplicate issuance), and the process proceeds to the normal implementation flow (xp_Tester → xp_Implementer → xp_Auditor → xp_Documenter).

---

### noragrammer-crypto — 2026-07-11T14:10:03Z

Work started 2026-07-11 23:09 [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-11T14:11:06Z

[Tester running]

## Test type determination

This task only creates two new parts of SKILL.md (Claude Code skill definition = Markdown as instructions) for the new skill `issue-triage-agent`, and does not involve adding executable JS/TS code. Skip the Unit / Functional / E2E layer tests as they correspond to "document only changes".

## How to guarantee acceptance conditions

It has been confirmed that Story-level's E2E test (`SoloXP/tests/e2e/issue-1990-issue-triage-agent.test.js`, PR #1995/unmerged) is a contract that verifies the acceptance condition of this task by regular expression matching of file contents. Request an Implementer to implement the following:

- Make the contents of `.claude/skills/issue-triage-agent/SKILL.md` and `dotfiles/.claude/skills/issue-triage-agent/SKILL.md` exactly the same
- Include the following in the main text: `PriorityHigh` / `Emergency...Not applicable` / `bug...label` / `daily-tasks` + `ERROR` / `Multiple days` or `Continuous` / `Single-shot` / `Number of elapsed days...not based` / `Conversation log`

## Skip

- Unit Test: Skip — No code to test (Markdown instructions only)
- Functional Test: Skip — Same as above
- E2E Test: Skip — Separately contracted for Story-level (#1990) (this task is not applicable as it is a subtask)

---

### noragrammer-crypto — 2026-07-11T14:13:20Z

[Implementer running]

## Implementation completed

Change file:
- `.claude/skills/issue-triage-agent/SKILL.md`: New creation
- `dotfiles/.claude/skills/issue-triage-agent/SKILL.md`: New creation (exact match with `.claude/` version)

Contents: For open issues with bug labels, write a judgment logic that traces back the comments of the daily-tasks tracking issue (`YYYYYYYYYMM/DD Daily Task`) and matches the ERROR record, and assigns `PriorityHigh` only when the same bug issue is continuously recorded for multiple days. It is clearly stated that single-shot ERRORs and ambiguous cases will be skipped, the number of days that have passed will not be used as a basis, and conversation logs will not be referenced. The `Emergency` label is not applicable (not assigned).

## Test results (for reference)

The result of temporarily placing the Story-level E2E test (PR #1995/unmerged `SoloXP/tests/e2e/issue-1990-issue-triage-agent.test.js` locally) and checking:
- 21 out of 23 PASS
- 2 items left FAIL — Related to acceptance condition 6 (inclusion in daily-tasks base set). This is the scope of another task #1993 and is outside the scope of this task (#1992), so it is not as expected.

All acceptance conditions 1 to 5, which are the scope of this task (#1992), are met.

- Unit test: Skip (no code under test)
- Functional testing: Skip (no code under test)

---

### noragrammer-crypto — 2026-07-11T14:14:05Z

[Auditor test running]

Check the Tester/Implementer's "Document only changes (no code to be tested)" determination. The only implementation file is Markdown's SKILL.md, and there are no changes to the existing JS/TS code. Just to be sure, I checked whether the baseline was affected using the `xp_RunTestSuites` procedure (SoloXP/):

- Unit test: PASS 178 (17 suites) / `npm run test:unit`
- Functional test: PASS 50 (8 suites) / `npm run test:functional`
- No impact on existing suites (newly added files are outside the tested code)

As for the Story-level E2E acceptance conditions (1 to 5 of this task scope), 21/23 cases have been confirmed as PASS as per Implementer's comment (the remaining 2 are in the daily-tasks built-in scope of #1993 and are not covered by this task).

[Auditor GREEN] PASS: Unit 178 + Functional 50 / Test command: `npm run test:unit && npm run test:functional` (SoloXP/)

---

### noragrammer-crypto — 2026-07-11T14:16:23Z

[Documenter running]

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-1992.MD`: Newly created (issue2md, text + all comments)
- `SoloXP/docs/spec/issue_triage_agent.md`: New creation (describes the issue-triage-agent skill specifications, judgment criteria, and implementation status table. Specifies that acceptance condition 6 is not implemented until #1993 is completed. Final confirmation will be done in #1994)
- `SoloXP/docs/spec/README.md`: Added `issue_triage_agent.md` line to index.

Skip type:
- xp_doc_reference: Skip — This task is only SKILL.md (Markdown), no JS/Python code added or changed
- xp_doc_UnitTests / xp_doc_FunctionTests / xp_doc_E2ETests: Skip — No new or changed test files in this task.

[Documenter completed]

---
