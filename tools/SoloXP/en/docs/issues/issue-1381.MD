---
issue: 1381 title: "[Story] Delegating xp_Architect conflict checking to feature-dev" state: open labels: [enhancement, epic/SoloXP] author: noragrammer-crypto created_at: 2026-06-13T19:20:17Z epic: SoloXP
---

# #1381 [Story] Delegate xp_Architect conflict checking to feature-dev

## Body

## overview

Replace step 3 of xp_Architect (checking conflicts with existing implementation) with `/feature-dev` call to improve code analysis quality.

Step 4 and subsequent steps (execution plan formulation → GitHub subissue publication) will remain as they are.

## Background

- `xp_Reviewer` has already called `/review` (review subcommand of feature-dev)
- `xp_Architect`'s SKILL.md has a "Design Philosophy (Learn from feature-dev code-explorer/architect)" section, which I have referenced as philosophy but **do not actually call it**
- Currently in step 3, Claude manually traces the code, so there is a risk of oversight.

## policy

Use feature-dev's architect subcommand as a bridge to convert the output to an xp execution plan.

```
New flow in xp_Architect:

step 1-2: Load issue/classify type (no change)
step 3: Call /feature-dev to get code analysis/conflict check ← ★Changes
step 4: Create an execution plan from the output of feature-dev + estimate.breakdown
step 5-7: Issue subissue, update story card, reply to xp_Director (no change)
```

## Acceptance conditions

- [ ] step 3 of xp_Architect calls `/feature-dev` (or equivalent subcommand)
- [ ] How to convert the output of feature-dev into an xp execution plan (depends_on / task_type mapping) is specified in SKILL.md.
- [ ] Specifies the fallback procedure when feature-dev cannot be called (command not supported/error)
- [ ] The existing xp flow (subissue issue/GitHub linkage part) is not broken.

## Scope of influence

- `~/.claude/skills/xp_Architect/SKILL.md` (major changes)
- E2E testing: Update `SoloXP/tests/e2e/` with xp_Architect acceptance tests if available.

## estimate

estimate:
  total: 2pt breakdown:
    - task: Investigate feature-dev calling procedure/revise SKILL.md
      pt: 1 depends_on: null
    - task: Defining fallback procedures and updating E2E tests
      pt: 1 depends_on: previous task

## comment

### noragrammer-crypto — 2026-07-15T12:08:50Z

Work started 2026-07-15 12:07 Session URL: https://claude.ai/code/session_01Lc9rjuhGzAudSsCrGDnA6d [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-15T12:12:35Z

## Execution plan

Issue type: Story Story issue: #1381 Sub-issue (4 issues in total):
  - #2097 [Task] E2E test suite creation (1pt) depends_on: None — task_type: e2e_test_creation
  - #2098 [Task] Investigate feature-dev calling procedure/revise SKILL.md (1pt) depends_on: None
  - #2099 [Task] Define fallback procedures and update E2E tests (1pt) depends_on: #2098
  - #2100 [Task] Functional specification update (1pt) depends_on: #2098, #2099 — task_type: spec_update

Ready to start (no depends_on):
  - #2097, #2098

Blocking (waiting for depends_on):
  - #2099 ← Waiting for [Auditor GREEN] in #2098
  - Waiting for [Auditor GREEN] in #2100 ← #2098, #2099

---
⚠️ Design concern (investigate #2098 before implementation): feature-dev does not have an "architect" subcommand, requiring human interaction in phases 3 and 5. When embedding it in an automatic flow, consider equivalent means such as the `Explore` subagent.

[Parent branch created] feature/issue-1381 Please run /xp_Director 2097 in your next session.

---

### noragrammer-crypto — 2026-07-16T12:12:27Z

Sub-issue #2097 completed. Remaining: #2098, #2099, #2100

---

### noragrammer-crypto — 2026-07-16T13:25:04Z

Subissue #2098 completed (PR #2119 published, waiting to be merged into `feature/issue-1381`). Remaining: #2099, #2100

---

### noragrammer-crypto — 2026-07-17T00:14:28Z

Sub-issue #2100 completed. PR #2138 has been issued based on `feature/issue-1381`.

[Auditor GREEN] / [Auditor doc OK] for all sub-issues (#2098, #2099, #2100) are now available. Next time run the AllGREEN flow on `/xp_Director 1381`.

---

### noragrammer-crypto — 2026-07-17T01:22:38Z

[Auditor GREEN]

### Story-level E2E test results (`SoloXP`)

Command: `cd SoloXP && npm run test:e2e` (`jest --testPathPattern=tests/e2e`)

- Acceptance test for this story `tests/e2e/issue-1381-xp-architect-feature-dev.test.js`: **PASS 14/14** (all AC GREEN)
- Overall suite: 16 PASS/2 FAIL out of 18 suites, 213 PASS/3 FAIL out of 216 tests

### FAIL Isolation of 2 cases (out of scope/known)

These are all existing bugs unrelated to this Story change (`xp_Architect` step 3 code-architect delegation), and have already been filed and tracked as separate bug issues:

- `tests/e2e/issue-1410-worklog-markers.test.js` → #2059 (Missing AllGREEN section description in xp_Director SKILL.md)
- `tests/e2e/issue-254-workflow-update.test.js` → #2060 (missing deviation issue identification logic description in xp_review_workflow SKILL.md)

At the time of writing the Test plan for PR #2133, it has been confirmed that it can be reproduced under the same conditions (`origin/feature/issue-1381` with `git stash` excluding the differences in this Story), and it has been determined that there is no impact on the merge decision for this Story.

### Acceptance judgment

✅ Story #1381 acceptance conditions (AC1-AC4) are met. GREEN.

xp_Director then calls xp_Reviewer.

---

### noragrammer-crypto — 2026-07-17T01:25:26Z

## xp_Reviewer report

Target differences: `origin/main...origin/feature/issue-1381` (substantive changed files: `.claude/skills/xp_Architect/SKILL.md`, `SoloXP/skills/xp_Architect/SKILL.md`, `dotfiles/.claude/skills/xp_Architect/SKILL.md`, `SoloXP/docs/spec/xp_architect.md`, `SoloXP/tests/e2e/issue-1381-xp-architect-feature-dev.test.js`, `SoloXP/docs/tests/E2ETests/issue-1381-xp-architect-feature-dev.md`, `SoloXP/docs/issues/issue-209{7,8,9}.MD`, `issue-2100.MD`)

### High Risk
none

### Moderate/low risk indication

- **[Low] Branch difference noise**: `git diff origin/main...origin/feature/issue-1381 --stat` also shows files unrelated to this Story, such as `wiki/`, `ProcessTaskIssue`, `bookmark_save`, and `CLAUDE.md`, as having been modified (the branch history of `feature/issue-1381` shows commits that appear to be from other sessions) (Because `2b22986`/`a59baa2`/`5948912` are mixed in). However, when I diffed the content individually, it was found that except for a minor difference in `CLAUDE.md` (JST notation was added, main was developed later and there is no conflict), the content completely matches that of main**, and the only substantial changes are the xp_Architect related files mentioned above. There is no actual damage when merging to main, but there is room to review the base selection when creating a branch from next time onwards (no action required/recorded as an observation).

### Overall review

`code-architect` The design decision to delegate to subagent invocation is consistently reflected in both SKILL.md and spec, and the output → xp execution plan conversion rules (depends_on/task_type mapping table) and fallback activation conditions and confirmation procedures are also specifically specified. The changes were only to the documentation and did not affect the code execution logic, and all 14 E2E acceptance tests were GREEN. No quality concerns.

No high risk indications. There is no need to raise an improvement recommendation issue.

---

### noragrammer-crypto — 2026-07-17T01:26:18Z

[Checking Auditor document]

### Document check results
- spec/README.md: OK — Index entry to `xp_architect.md` is maintained correctly as it already exists.
- spec/xp_architect.md: OK — Check the description of code-architect delegation, mapping table, fallback procedure, and version history v1.2.0 in step3 (Auditor doc has already been OKed in #2100)
- reference/: Not applicable (This Story is not applicable to the reference document)
- issue2md log: **NG: Missing** — `SoloXP/docs/issues/issue-1381.MD` (Story's own log) does not exist. The issue2md logs for subtasks (#2097 to #2100) are complete, but the log for parent story #1381 itself has not been generated.

[Auditor doc NG: issue2md log] Target: SoloXP/docs/issues/issue-1381.MD Reason: Missing xp_Director is by xp_issue2md Story #1381 Please generate your own log.

---
