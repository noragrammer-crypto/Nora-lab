---
issue: 1412 title: "[Task] Modify ProcessIssue's depends_on check to --json comments (including reproduction test)" state: open labels: [task, epic/SoloXP, Emergency] author: noragrammer-crypto created_at: 2026-06-14T13:37:13Z epic: SoloXP
---

# #1412 [Task] Modify ProcessIssue's depends_on check to --json comments (including reproduction test)

## Body

## overview

I am using `gh issue view --comments` in ProcessIssue's `depends_on` check (SKILL.md Step 2-2 B) and Architected Story check (Step 2-2 C), but this option does not return the comment body, only a GraphQL Deprecated warning.

As a result, issues whose depends_on has been resolved are always incorrectly determined to be blocked.

## Correction details

### Added reproduction test

Add the following to `SoloXP/tests/unit/process-issue-skill.unit.test.js`:
- Test to ensure that depends_on check in SKILL.md does not include `--comments`
- Test to ensure that depends_on check in SKILL.md includes `--json comments`
- Test to ensure that Architected Story check in SKILL.md does not contain `--comments`
- Test to ensure that Architected Story check in SKILL.md includes `--json comments`

### SKILL.md Target of modification (2 locations)

**workflow/skills/ProcessIssue/SKILL.md**

1. **Line 95: depends_on check (Step 2-2 B)**
   - Before:
     ```bash
     gh issue view  --comments --repo / | grep "\[Auditor GREEN\]"
     ```
   - After changes:
     ```bash
     gh issue view  --json comments --repo / \
       | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print('GREEN') if any('[Auditor GREEN]' in c.get('body','') for c in cs) else None"
     ```

2. **Line 107: Architected Story Check (Step 2-2 C)**
   - Before:
     ```bash
     gh issue view --comments --repo / | grep -c "\[Parent branch created\]"
     ```
   - After changes:
     ```bash
     gh issue view  --json comments --repo / \
       | python3 -c "import json,sys; cs=json.load(sys.stdin).get('comments',[]); print(sum(1 for c in cs if '[parent branch created]' in c.get('body','')))"
     ```

## estimate

2pt — 4 reproduction tests + 2 SKILL.md corrections

## Dependencies

None (can start immediately)

## Parent story (bug)

#1411

## Parent branch

feature/issue-1411

## comment

### noragrammer-crypto — 2026-06-14T13:55:31Z

Work started 2026-06-14 13:53 Session URL: https://claude.ai/code/session_01KSgNBTVH2mQZVxS6VA7iaS [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-14T13:55:40Z

[Tester running]

---

### noragrammer-crypto — 2026-06-14T13:58:12Z

## Test execution results

### Unit Test
Test file: `SoloXP/tests/unit/process-issue-skill.unit.test.js` Results: 13 PASS / 4 FAIL

Proposition check:
- [x] `--comments` standalone flag is not used for depends_on check (confirm bug fix) → FAIL (confirm bug existence)
- [x] `--json comments` is used for depends_on check → FAIL (confirm that bug exists)
- [x] `--comments` single flag is not used for Architected Story check (confirm bug fix) → FAIL (confirm bug existence)
- [x] `--json comments` is used to check the Architected Story → FAIL (confirm the existence of a bug)

### Functional Test
Skip — SKILL.md Functional layer is not applicable as it is only a verification test

### E2E Test
Skip — Not applicable for E2E due to modification of skill definition file

---
4 reproduction tests prove the existence of bug in RED. Modify SKILL.md with Implementer and make it GREEN.

---

### noragrammer-crypto — 2026-06-14T13:58:15Z

[Tester completed]

---

### noragrammer-crypto — 2026-06-14T13:58:20Z

[Implementer running]

---

### noragrammer-crypto — 2026-06-14T13:59:22Z

## Implementation completed

Change file:
- `workflow/skills/ProcessIssue/SKILL.md`: Corrected `--comments` in depends_on check (Step B) and Architected Story check (Step C) to `--json comments` + python3 pipe (2 places)

Test results:
- Unit test: 17 PASS / 0 FAIL (all GREEN including 4 reproduction tests)
- Functional test: Skip (Not applicable as SKILL.md verification only)

---

### noragrammer-crypto — 2026-06-14T13:59:27Z

[Implementer completed]

---

### noragrammer-crypto — 2026-06-14T13:59:31Z

[Auditor test running]

---

### noragrammer-crypto — 2026-06-14T14:00:50Z

[Auditor GREEN] PASS: 92 items (Unit) + 20 items (Functional) = 112 items in total / Test command: `node_modules/.bin/jest`

[Actual environment confirmation OK]
- `gh issue view 1255 --json comments --repo ...` → `[Auditor GREEN]` successfully detected ("GREEN" output)
- `gh issue view 1411 --json comments --repo ...` → `[Parent branch created]` Count = 1 (normal)

Confirm that bug fixes work properly in a real environment.

---

### noragrammer-crypto — 2026-06-14T14:00:55Z

Work completed 2026-06-14 14:05 / Required time: 12 minutes

---

### noragrammer-crypto — 2026-06-14T14:01:10Z

[Documenter running]

---
