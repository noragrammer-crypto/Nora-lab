---
issue: 1341
title: "[Task] Review of SKILL.md Content Assertion Testing Policy (Structural Reduction of Vulnerability Testing)"
state: closed
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-13T00:54:50Z
epic: SoloXP
---

# #1341 [Task] Review of SKILL.md Content Assertion Testing Policy (Structural Reduction of Vulnerability Testing)

## Body

## Content

The test that asserts the wording and section structure of SKILL.md solves the structural problem that breaks every time the skill is improved.

## Background

Isomorphic bug issues are accumulating:
- #1313 (Test cannot follow changes to NovelGeneratorRun SKILL.md)
- #1301 / #1302 (LLMwiki settings.json changed/failed due to wiki not being generated)
- #1291~#1294 (SoloXP 4 suite 14 tests)
- #1279 (failure to change xp_Auditor section number)

Asserting prompt content is a "transcription of implementation," and double maintenance occurs every time the specifications change.
The time that could be devoted to AI operations continues to be structurally absorbed by this testing and maintenance (2026-06-13 Management Review).

## Consideration policy

- [ ] Change the test target from "word matching" to "structure/contract" (e.g. existence of required sections, frontmatter schema, existence of referenced files)
- [ ] Inventory of word-dependent tests and formulation of deletion/rewriting criteria
- [ ] Evaluate whether the above group of isomorphic bug issues can be resolved all at once using this policy.
- [ ] Added the principle "Do not assert SKILL.md text" to the test creation guide (skills such as xp_UnitTest)

## Completion conditions

- Testing policy has been documented and a policy for handling existing isomorphic bug issues has been determined.

## Comment

### noragrammer-crypto — 2026-06-21T18:04:15Z

## Observable change check ([Task] Skip judgment)

Target: #1341
Observable behavior changes: None
Reason: The purpose is to review and document the policy of the SKILL.md assert type test, and does not involve changes to user-observable behavior such as external APIs, UI, and output content (only internal changes to the test structure and guide document).

→ Skip Architect and proceed to the execution flow (xp_Tester/xp_Implementer/xp_Auditor/xp_Documenter).

---

### noragrammer-crypto — 2026-06-21T18:04:20Z

Start of work 2026-06-21 18:04
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-21T18:04:38Z

[Tester running]

## Test execution results

This task requires consideration and documentation of the test policy, and does not involve adding or changing implementation code (application logic).
Skip all Unit/Functional/E2E layers as it corresponds to "document only changes".

Skip: Unit/Functional/E2E — No code under test (due to policy document development task)

[Tester completed]

---

### noragrammer-crypto — 2026-06-21T18:04:47Z

[Implementer running]

---

### noragrammer-crypto — 2026-06-21T18:10:17Z

## Implementation completed

This task is to examine and document the test policy (no changes to the implementation code).

### Testing policy (added as principle 7)

Added "7. Do not assert SKILL.md text (Principles of structure/contract testing)" to `SoloXP/docs/spec/tdd_principles.md`:
- ❌ Patterns to avoid: Fixed assertion of text/paragraph/code block body, regular expression extraction dependent on heading number
- ✅ Patterns to adopt: frontmatter schema validation, flexible matching of required section existence, reference file existence confirmation, inter-document index consistency
- Rejection/rewrite decision flow: Can it be rewritten to a “section exists” contract? → If not, leave it explicitly as a wording test and cover it with operational rules

### Addition of principles to guide

Added reference to Principle 7 to "Notes" in SKILL.md of `xp_UnitTest` / `xp_FunctionalTest` / `xp_E2Etest` (both copies of `dotfiles/.claude/skills/` and `SoloXP/skills/`, 6 files in total).

### Evaluation of treatment policy for existing isomorphic bug issues

- #1313 (CLOSED) / #1279 (CLOSED): Resolved, for reference only as an example of this policy
- **#1294**: Determined to be directly covered by this policy. We have adopted the policy of updating tests (A), and have commented on the revision policy for each target test in the issue.
- #1301 / #1302: This is a drift caused by settings/wiki data and is not covered by the policy. Commented.
- #1292 / #1293: Vercel preview URL construction/E2E execution flow classification issue, judged to be outside the scope of the policy, commented.

Change file:
- `SoloXP/docs/spec/tdd_principles.md`: Added principle 7
- `dotfiles/.claude/skills/{xp_UnitTest,xp_FunctionalTest,xp_E2Etest}/SKILL.md`: Added to notes
- `SoloXP/skills/{xp_UnitTest,xp_FunctionalTest,xp_E2Etest}/SKILL.md`: Added to notes (synchronized with dotfiles version)

Test results:
- `npm test` (SoloXP): 5 failed, 25 passed / 14 failed, 289 passed (same number of failures as before change = known failure originating from #1294, confirmed that there is no impact from changing this task)

[Implementer completed]

---

### noragrammer-crypto — 2026-06-21T18:10:45Z

[Auditor test running]

## /xp_RunTestSuites Results

Execution date and time: 2026-06-21 18:10
Branch: claude/elegant-goldberg-topiux

### Unit tests
- Results: 106 PASS / 0 FAIL

### Functional testing
- Results: 20 PASS / 0 FAIL

### E2E
- This task is skipped because it is a task issue (not a story)

### Existing known failures (reference/unrelated to this task)
- For `npm test` (all), it has been confirmed that the number of existing failures (5 suites / 14 tests) derived from #1294 is the same before and after the change (no new REDs have occurred due to document changes for this task)

[Auditor GREEN]
PASS: 126 / Test command: `npm run test:unit && npm run test:functional`

---

### noragrammer-crypto — 2026-06-21T18:11:30Z

[Documenter running]

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-1341.MD`: Transcribe the entire text and comment history of this issue (xp_issue2md)- `SoloXP/docs/spec/tdd_principles.md`: Add principle 7 "Do not assert SKILL.md statement" (xp_doc_spec, integration to existing file)

Skipped steps (no-op because there is no target):
- `xp_doc_reference`: No changes to classes/functions (only changes to documentation)
- `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: No new additions or changes to test files (this task is only for documenting the test policy)

[Documenter completed]

---

### noragrammer-crypto — 2026-06-21T18:12:24Z

[Checking Auditor document]

### Document check results
- spec/README.md: OK (tdd_principles.md is already indexed, no new files will be added in this task)
- spec/tdd_principles.md: OK (Principle 7 added, consistency with existing principles also confirmed)
- reference/: OK (not applicable - no changes to classes/functions)
- issue2md log: OK (`SoloXP/docs/issues/issue-1341.MD` generated, matched with 7 comments and regenerated)

Reference (existing gaps unrelated to changes in this task):
- README.md links to `novel_generator_run.md` Does not exist → Tracking with known #1364
- `../WORKFLOW.md` / `../ARCHITECTURE.md` linked by README.md does not exist → Since it is outside the scope of this task, it will not be created as a new issue but only recorded.

[Auditor doc OK]
xp_Director issues a PR.

---

### noragrammer-crypto — 2026-06-21T18:13:05Z

[PR issued #1591]

---

### noragrammer-crypto — 2026-06-21T18:13:05Z

[ProjectStatus: Done]
Work completed 2026-06-21 18:18 / Required time: 14 minutes

---
