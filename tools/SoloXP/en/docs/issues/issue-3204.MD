---
issue: 3204
title: "xp_issue2md cannot be executed from ClaudeCodeWeb due to fixed dependency on gh CLI"
state: closed
labels: [Emergency]
author: noragrammer-crypto
created_at: 2026-08-27T17:56:43Z
epic: SoloXP
---

# #3204 xp_issue2md cannot be executed from ClaudeCodeWeb due to fixed dependency on gh CLI

## Body

## Background

The issue acquisition process of `SoloXP/skills/xp_issue2md/SKILL.md` is fixed to `gh issue view`.

```bash
gh issue view <issue_number> --json number,title,body,labels,state,createdAt,author,comments
```

In recent ClaudeCodeWeb environments, there are cases where `gh` CLI cannot be used, and `xp_issue2md` becomes unexecutable even if there is a means to access GitHub.

Even in the latest weekly worklog (2026-08-15 to 2026-08-22), `xp_issue2md` cannot be executed for this reason, and local MD tracking of the target issue is skipped.

Models other than Haiku may acquire it by other means and continue processing, but the skill specification is fixed at `gh`, so it is dependent on behavioral differences and implicit avoidance for each model.

## Problem

- Skill stops without `gh` CLI in ClaudeCodeWeb
- Cannot be used even if available acquisition methods such as GitHub MCP/API are available
- May or may not be implicitly avoided depending on the model, and reproducibility is low.
- Unprocessed items accumulate in downstream processes such as worklog aggregation and issue MD synchronization.
- The implementation method (`gh` CLI) is more fixed than the skill's original requirements (obtaining issue text, comments, and metadata)

## Improvement ideas

The requirement for `xp_issue2md` is "Obtain the text, comments, and metadata of a GitHub issue and convert it to Markdown" and do not fix the method of obtaining it.

Candidate:

1. `gh` If CLI is available, use it as usual
2. If unavailable, fallback to available methods such as GitHub MCP / API / Connector etc.
3. Normalize the obtained results into a common format and standardize subsequent processing
4. Test that the output Markdown does not change depending on the acquisition method

## Acceptance conditions

- [ ] `gh` `xp_issue2md <issue_number>` completes even in an environment without CLI
- [ ] You can get the issue text, all comments, labels, state, createdAt, and author.
- [ ] Maintain existing save destination determination and Markdown format
- [ ] Equivalent Markdown is generated when using `gh` and when using fallback.
- [ ] Add tests or E2E assuming ClaudeCodeWeb environment

## Related

- `SoloXP/skills/xp_issue2md/SKILL.md`
- `worklog/weekly/iteration_report_week-2026-08-15_to_2026-08-22.md`

## Comment

### noragrammer-crypto — 2026-08-27T23:09:13Z

## Conflict check with existing implementation (code-architect fallback)

Target: #3204

Fallback activation: Yes
Reason for activation: `code-architect` subagent (`subagent_type: code-architect`) is unavailable in this session as "Agent type 'code-architect' not found" (feature-dev plugin not provided). I switched to manual tracing and investigated.

Patterns & Conventions Found:
- `SoloXP/skills/xp_issue2md/SKILL.md` is a Markdown instruction read by Claude Code's Skill feature that has no code implementation. There is a fixed dependency on `gh issue view <issue_number> --json number,title,body,labels,state,createdAt,author,comments` in step 1.
- There is an existing pattern in `xp_Director/SKILL.md` for switching GitHub access methods based on environment detection ("GitHub access methods" table: Claude Code Web → `gh` command, claude.ai / Others → via MCP). There is an existing practice of detecting the environment for `ProcessIssue/SKILL.md` as well as using the `CLAUDE_CODE_ENV` environment variable (defaults to `ClaudeCodeWeb` when unset).
- Reproduced in this session itself: `gh issue view --json ...` failed with `HTTP 403: This GraphQL query is not enabled for this session`, `gh api repos/.../issues/<n>` (REST) ​​also failed with `GitHub access is not enabled for this session`. On the other hand, `mcp__github__issue_read` (method: get / get_comments) worked fine. This is a real-world reproduction of the problem pointed out in the issue text, and supports the validity of the correction policy.
- The test pattern already exists in `SoloXP/tests/unit/issue-2757-xp-issue2md-hardcoded-repo.unit.test.js`: `fs.readFileSync` reads `SKILL.md` as a string and asserts the written content using regular expressions (SKILL.md is not a code but a prompt instruction, so this "text assertion" is the standard unit testing method for this project).

Architecture Decision:
- Do not introduce new abstractions or new directories. `xp_issue2md/SKILL.md` This is supported by adding a branch to step 1 that says, "If `gh` cannot be used, fallback to `mcp__github__issue_read` (get / get_comments), normalize to the same field configuration, and pass to step 4" (an extension of the existing environment detection pattern of `xp_Director`).
- The fix is ​​a bug issue and follows the TDD principle of CLAUDE.md (reproduction test + fix completed in a single task). E2E/spec additional tasks are not covered by bug issues.

Presence of conflict: None (can be handled as an extension of existing patterns)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:09:21Z

## Execution plan

Issue type: Bug
Verdict: Single task (no subissues/no parent branch)
Target issue: #3204 (this issue itself is treated as a task)
Execution method: xp_Director is processed in 1 session/1 PR with the root task route of --base mainReason: In accordance with the TDD principle of CLAUDE.md (bug fixes include adding a reproduction test and implementing the correction as a single task/single PR), treat the work of modifying the `gh` CLI fixed dependency of `xp_issue2md/SKILL.md` to support MCP fallback as a single task including reproduction tests. Additional tasks required due to bug issues (E2E test suite creation, functional specification update) are not covered.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:09:30Z

Start of work 2026-08-28 08:15 JST
Session URL: https://claude.ai/code/session_01PJSK2EhujxQEHrxJtCma7a
[ProjectStatus: InProgress]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:11:58Z

## Test proposition (Unit/bug reproduction)

Target: `SoloXP/skills/xp_issue2md/SKILL.md` (String assertion test targeting the text of SKILL.md, as it is a prompt instruction rather than a code implementation. Same method as the existing #2757)

- [ ] The conventional route by `gh issue view` is maintained (affirmative)
- [ ] `gh` GitHub MCP fallback (`mcp__github__issue_read`) in case CLI cannot be used is specified (Negation → RED)
- [ ] Fallback covers both issue body retrieval (get) and comment retrieval (get_comments) (negation → RED)
- [ ] Conditions for triggering fallback (GH not installed, authentication error, 403, etc.) are clearly specified (Negation → RED)
- [ ] Over 100 comments mention continuous paging (denial → RED)
- [ ] It is clearly stated that the same normalized field is used regardless of the acquisition method (Negation → RED)
- [ ] Field to be normalized (title/body/state/labels/author/createdAt) is specified (Negation → RED)
- [ ] Notes reflect switching to fallback instead of immediate error termination when gh fails (Negation → RED)
- [ ] Repository hardcode fixed in #2757 has not recurred (positive/regression prevention)

## Test execution results

### Unit Test
Test file: `SoloXP/tests/unit/issue-3204-xp-issue2md-gh-cli-fallback.unit.test.js`
Result: 3 PASS / 6 FAIL (RED because it is not fixed, proving the existence of the bug)

```
Tests:       6 failed, 3 passed, 9 total
```

FAIL: 6 cases of 3 systems: MCP fallback not described, normalization policy not described, and notes not updated. As expected.

### Functional Test / E2E Test
Skip: Since the target is only adding a description to one file of the prompt instruction document (SKILL.md), and there is no linkage of multiple modules or acceptance conditions via the UI, the acceptance conditions can be sufficiently expressed in Units (text assertions). The existing similar fix (#2757) is also supported by Unit only.

---
Handover to Implementer: Please correct Step 1 (Issue acquisition) and Notes section of `SoloXP/skills/xp_issue2md/SKILL.md` to resolve the above RED item.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:12:03Z

[Implementer running]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:12:43Z

[Implementer completed]

## Implementation completed

Change file:
- `SoloXP/skills/xp_issue2md/SKILL.md`: Added GitHub MCP fallback in case of `gh` CLI failure (get/get_comments of `mcp__github__issue_read`, continuous paging acquisition of over 100 comments) and normalization field correspondence table to step 1 (issue retrieval). The note "If acquisition fails, an error occurs immediately" has been corrected to "First, switch to MCP fallback, then error only if both fail."

(`dotfiles/.claude/skills/xp_issue2md/` and `.claude/skills/xp_issue2md/` are generated files, so do not edit them directly. As per `docs/skill-files-sync.md`, the pre-push hook automatically synchronizes from the original.)

Test results:
- Unit test (new: issue-3204-xp-issue2md-gh-cli-fallback.unit.test.js): 9 PASS / 0 FAIL
- Unit test (regression: issue-2757-xp-issue2md-hardcoded-repo.unit.test.js): 3 PASS / 0 FAIL
- SoloXP/tests/unit entire (32 suites): PASS 251 / FAIL 0
- Functional testing: Not applicable (Follows the decision made in the Tester phase. This is an addition to the SKILL.md description and there is no inter-module coordination)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:13:16Z

[Auditor test running]

## /xp_RunTestSuites Results

Execution date and time: 2026-08-28 08:40 JST
Branch: claude/issue-processing-hf5ntv

### Unit tests
- Results: 251 PASS / 0 FAIL (32 suites, including 9 new tests for issue-3204 and 3 regression tests for issue-2757)

### Functional testing
- Preview URL: Not applicable (This task only involves modifying the prompt instructions for `SoloXP/skills/xp_issue2md/SKILL.md`, and there is no need to confirm communication as it does not have an API endpoint to be deployed to Vercel)
- Result: 60 PASS / 0 FAIL (all existing SoloXP functional tests. Not affected by changes to this task)

### Overall judgment
- ✅ GREEN

---

## Real environment confirmation of bug fix task

Steps to reproduce: ClaudeCodeWeb environment where the session itself is `HTTP 403: This GraphQL query is not enabled for this session` and `gh issue view`/`gh api` are unavailable. In this actual environment, we have confirmed that we can actually call the fallback method specified by the modification policy (method: get / get_comments of `mcp__github__issue_read`) and successfully retrieve the issue text and comments (all comments posted and retrieved to this issue so far have been done via the MCP tool).[Actual environment confirmation OK]
Execute the reproduction steps: No errors (`gh` Confirmed in a real environment that it is possible to retrieve issues with MCP fallback even in environments where CLI cannot be used)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:13:20Z

[Auditor GREEN]
PASS: 251 items (all SoloXP/tests/unit) / Test command: `npx jest tests/unit` (under SoloXP)
Functional test: PASS 60 (no impact due to untargeted changes) / Test command: `npx jest tests/functional`
Real environment confirmation: OK (see comment above)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:13:23Z

Work completed 2026-08-28 08:42 JST / Required time: 27 minutes

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:15:11Z

[Documenter running]

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-3204.MD`: Convert all issue texts and comments into Markdown (xp_issue2md. Since `gh` cannot be used in this session, it was obtained and generated using the very MCP fallback path <`mcp__github__issue_read`> added in the modification)
- `SoloXP/docs/tests/UnitTests/issue-3204-xp-issue2md-gh-cli-fallback.md`: New unit test documentation

Not applicable (no change):
- xp_doc_spec: All references to `xp_issue2md` under `SoloXP/docs/spec/` only describe "call timing" and do not mention the internal acquisition means (gh/MCP). No update required as internal fallback is added without user observable specification changes
- xp_doc_reference: Not applicable because the target is SKILL.md in prompt format and does not correspond to the code module (class/function) for which the reference document is generated.
- xp_doc_FunctionTests: Not applicable because no functional tests were created (skipped at tester stage)
- xp_doc_E2ETests: Not applicable as it is a single task issue (not a story)

[Documenter completed]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:16:09Z

[Checking Auditor document]

### Document check results
- spec/README.md: OK (spec is not updated because this task does not involve user-observable specification changes. There are no inconsistencies in the index)
- reference/: OK (not applicable. SKILL.md is not targeted for code reference documentation generation)
- issue2md log: OK (`SoloXP/docs/issues/issue-3204.MD` exists. Number of GitHub actual comments: 10, last comment 2026-08-27T23:15:11Z ([Documenter completed]) and log contents match)

[Auditor doc OK]
xp_Director issues a PR.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:17:19Z

[PR issued #3211]
https://github.com/noragrammer-crypto/HolyAutomater/pull/3211
(`--base main` / `Closes #3204`. GitHub will auto-close when merging to determine a single task)

[ProjectStatus: Done]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:21:14Z

There were 2 P1 points raised in PR #3211 in the Codex automatic review (concern about comments being missed due to unspecified perPage for get_comments / labels normalization of MCP fallback not supporting object format), both of which were corrected and pushed as they were valid points (both threads resolved). All 253 tests were PASS. CI is continuously monitored.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:23:58Z

`skill-sync-check` CI of PR #3211 was red. Investigation into the cause: `skill-sync-check.yml` (new CI workflow, #3201/#3208/#3209/#3210) was merged into `main` after this PR branch was created, and this PR branch was not imported because it was branched from the previous `main`. The nine failures (`workflow/__tests__/e2e/issue-579-kakuyomu-post-web.test.js`, etc.) are unrelated to this PR change, and the Codex review findings have already been reflected on the `main` side (strengthening verification accuracy dependent on `/root/dotfiles`).

Correspondence: `main` was merged and imported, and all passes were confirmed and pushed for `workflow` (859 items) and `SoloXP` (313 items).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-27T23:29:33Z

The red `skill-sync-check` in PR #3211 turned out to be a bug in `.github/workflows/skill-sync-check.yml` itself (because of `--testPathPatterns` which was invalid in Jest 29 series, the filter was not working and all tests were executed). I filed a bug as an independent bug #3212 and created a fix PR #3213, and the same fix was also ported and pushed to #3211. Both PRs are waiting for CI.

---
_Generated by [Claude Code](https://claude.ai/code)_

---
