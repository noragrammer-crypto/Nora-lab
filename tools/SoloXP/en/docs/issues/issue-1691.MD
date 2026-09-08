---
issue: 1691
title: "[Improvement] feature/issue-* → Add required status check for AllGREEN marker confirmation to main PR"
state: closed
labels: [enhancement, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-27T12:33:30Z
epic: SoloXP
---

# #1691 [Improvement] feature/issue-* → Add required status check for AllGREEN marker confirmation to main PR

## Body

## Overview

In response to the problem reported in #1690 that "PRs to main are issued and merged directly without going through the AllGREEN gate" (example #1294), in addition to strengthening the wording on the SKILL.md side (#1690), we will introduce a two-step mechanical check using GitHub Actions.

## Background

The AllGREEN flow of `xp_Director` is a prompt procedure, and there is no mechanism to stop it even if the agent (session) skips this and directly performs an operation equivalent to `gh pr create --base main`. The response to #1690 (strengthening the SKILL.md wording) is not enforceable by itself, so we would like to add a lightweight mechanical check on the CI side.

## Suggestion

In GitHub Actions, add required status check for PR based on `main`:

- **Fire condition**: Execute check only if PR head branch name matches `feature/issue-*` (Solo XP parent branch naming convention)
- **Check contents**: Get the comment history of the PR body or the corresponding parent issue number (extracted from the branch name) using GitHub API, and check the existence of the following marker string.
  - Story-level `[Auditor GREEN]`
  - xp_Reviewer report (completion marker)
  - `[Auditor doc OK]`
- If not, fail the status check and block the merge with the required check setting in branch protection

There is no need to run Claude Code itself on Actions, and it can be implemented with a single lightweight Node script that just calls the GitHub API (the same logic as the API call made during the post-test of #1294).

## Scope

- Applies only to PRs from the **`feature/issue-*` branch**. Saving content such as novels and Note articles (branch names such as `claude/...` or pushing directly to `main`) is not covered and can be done freely as before.
- While increasing the `main` protection of the code system (Story/Bug managed by Solo XP), the design will not affect the operational flow of the content system.

## Related issues

- #1690 (Enhancement of AllGREEN gate on SKILL.md side, first part of this issue)
- #1294 (Example of bug)

## Parent branch

None (processed as an independent task separate from #1690. No changes to production code are expected due to the addition of CI settings)

## Comment

### noragrammer-crypto — 2026-08-20T09:22:20Z

## Conflict check with existing implementation (code-architect)

Target: #1691

**Patterns & Conventions Found:**
- The existing workflow (`.github/workflows/codecompass.yml`, `hotspot-alert.yml`) has a thin configuration that executes `node scripts/*.js` under `actions/checkout@v4` → `actions/setup-node@v4` (node 22) → `working-directory`
- `github.head_ref` is not directly embedded in `run: |`, but passed through `env:` (measure against injection, already implemented with `codecompass.yml:41-42`)
- Node implementation is separated into `lib/` (pure logic/unit test target) and `scripts/` (thin CLI), and `gh` CLI is called with the array argument of `execFileSync('gh', [...])` (avoiding shell injection, `CodeCompass/lib/hotspot-alert.js`)
- The test has two layers: `__tests__/unit/*.unit.test.js` (mock) + `__tests__/functional/*.functional.test.js` (real subprocess startup using fake gh binary)
- Documentation is `docs/spec/*.md` + `docs/tests/{UnitTests,FunctionTests}/*.md`

**Architecture Decision:**
Do not create a new project directory, but implement it in `workflow/` (`workflow/lib`, `workflow/scripts`, `workflow/__tests__`, `workflow/docs`). `CodeCompass/` is irrelevant for hotspot analysis purposes, `SoloXP/` is a general-purpose framework package that is synchronized to Nora-lab and is not the place to put HolyAutomater-specific branch policy implementation. `workflow/` already has similar ops-meeting scripts, tests, and spec assets, and `workflow/docs/spec/xp-director-allgreen-pr.md` already exists as the primary information source for the AllGREEN flow, making it ideal.

The new workflow `.github/workflows/allgreen-check.yml` guards the job itself with the `pull_request` trigger and `if: startsWith(github.head_ref, 'feature/issue-')` (excluded branches are treated as `skipped`=passing scoped on GitHub, so no additional branching is required). The marker requires both `[Auditor GREEN]` and `[Auditor doc OK]` to be present (consistent with story-level AllGREEN flow entity). `gh` fail-closed (non-0 exit) if the call fails.

**Implementation Map:**
- `.github/workflows/allgreen-check.yml` (new)
- `workflow/lib/check-allgreen.js` (new, pure logic)
- `workflow/scripts/check-allgreen.js` (new, CLI)
- `workflow/__tests__/unit/*.unit.test.js` / `workflow/__tests__/functional/*.functional.test.js` + fake gh fixture (new)
- `workflow/docs/spec/allgreen-check.md` (new), `workflow/docs/spec/xp-director-allgreen-pr.md` (added cross reference)

**Conflicts:** None (Can be implemented as an extension of existing patterns. No new dependencies added)**Known remaining issues (not subject to implementation/scope as per issue text):** Paths that directly PR to `--base main` (`claude/...` branch, etc.) with a single task determination remain excluded from this check. Setting required check for branch protection cannot be done by changing the code, so you need to manually set the owner after merging.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T09:23:20Z

Start of work 2026-08-20 09:23 JST
Session URL: https://claude.ai/code/session_01C9qfHMG4KJkLiPeTKrV5BZ
[ProjectStatus: InProgress]

[Parent branch created] feature/issue-1691
Please run /xp_Director <first subtask number> in your next session.

## Execution plan

Issue type: Story (observable behavior change that allows you to write acceptance conditions/spans multiple tasks)
Story issue: #1691
Sub-issues (total 3):
  - #3036 [Task] E2E test suite creation (1pt) depends_on: None
  - #3037 [Task] Implementation of AllGREEN marker mandatory status check (3pt) depends_on: None
  - #3038 [Task] Functional specification update (1pt) depends_on: #3037

Ready to start (no depends_on):
  - #3036, #3037

Blocking (waiting for depends_on):
  - #3038 ← Waiting for #3037's [Auditor GREEN]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:18:54Z

Auditor test running (Story-level)

### xp_RunTestSuites Results

Execution date and time: 2026-08-20 10:20 JST
Branch: feature/issue-1691 (latest origin, after merging PR #3039 and #3040)

#### Unit tests
- Results: 159 PASS / 0 FAIL (18 suites)

#### Functional testing
- Results: 78 PASS / 0 FAIL (12 suites)

### xp_RunE2ETests results

Execution date and time: 2026-08-20 10:21 JST
Target URL: Not applicable (Jest-based e2e suite, Playwright/communication confirmation not applicable)
Target story: #1691

#### Results
- Results: 517 PASS / 0 FAIL (28 suites)
- All items are GREEN, including the acceptance test for this story `workflow/__tests__/e2e/issue-1691-allgreen-check.e2e.test.js` (13 items)

### Acceptance judgment
✅ All PASS: Story completed/PR creation possible

Sub-issues #3036, #3037, #3038 are all closed/green, and the corresponding PRs (#3039, #3040) have also been merged.
There are 0 block targets owned by your own story.

[Auditor GREEN]
PASS: 159(unit) + 78(functional) + 517(e2e) = 754 items

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:21:47Z

## xp_Reviewer report

For: `git diff origin/main...origin/feature/issue-1691` (reviewed by `code-reviewer` subagent)

### High Risk
None

### Moderate/low risk indication
None

### Overall review
- **Shell injection countermeasures**: Designed to receive `github.head_ref` via `env: HEAD_REF:` and not expand it directly to the `run:` block (same pattern as the existing `codecompass.yml`). In addition, calling `gh` is also doubly safe by passing the array argument of `execFileSync` without going through the shell.
- **fail-closed design**: Check the path where `fetchIssueComments` exceptions are converted to `fail` in `checkAllGreen` and ensure a non-0 exit on the CLI side. There is no route to unintentionally exiting to 0 due to an uncaught exception.
- **gh CLI argument configuration**: `gh issue view <n> --repo <owner/repo> --json comments` matches the actual CLI specifications and output format
- **Test/implementation integrity**: All three layers, unit/functional/e2e, match the public contract (function signature, return value, exit code). E2E test verifies workflow yaml string (branches specification, job guard, head_ref appearance count) and there is no deviation
- **Consistency with existing patterns**: Permissions filtering and GH_TOKEN passing style is similar to `hotspot-alert.yml`

Compliant with CLAUDE.md rules (handling under `api/`, simultaneous code and document updates in line with TDD principles).

High risk identified: None / Issue raised: None

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:21:56Z

[SecurityReviewer running]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:23:27Z

## xp_SecurityReviewer report

Target: `git diff origin/main...origin/feature/issue-1691` (Security-specific review by `/security-review`)

### High Risk
None

### Moderate/low risk indication
None

### Overall review
We focused on the handling of `github.head_ref` (a value that can be controlled by the PR author) in the new workflow `.github/workflows/allgreen-check.yml`:- The configuration `env: HEAD_REF: ${{ github.head_ref }}` → `run: ... --head-ref="$HEAD_REF"` does not use GitHub's template expression expansion (method of directly embedding `${{ }}` into the run script body). Bash's `"$VAR"` expansion only assigns the variable value as a single literal string, and even if the value contains `"` `;` `$()` etc., it will not be interpreted as shell syntax again, so it does not fall under the known GitHub Actions script injection vulnerability class.
- `gh` All CLI calls are executed using `execFileSync` (array argument passing without going through the shell), and there is no route for command injection.
- `issueNumber` is used with the regular expression `^feature\/issue-(\d+)` constrained to numbers only, further limiting the injection surface.
- Workflow permissions are limited to `contents: read` / `issues: read`, following the principle of least privilege.

High risk identified: None / Issue raised: None

[SecurityReviewer completed]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:24:38Z

Auditor Document Checking (Story-level)

### Document check results
- workflow/docs/spec/README.md: OK (`allgreen-check.md` has been added to the index, reflected in #3037/#3038)
- workflow/docs/spec/allgreen-check.md: OK (describes trigger conditions, check details, CLI specifications, design decisions, and known constraints)
- workflow/docs/spec/xp-director-allgreen-pr.md: OK (cross-reference section and related issue list reflected)
- issue2md log: NG (missing) → Resolved by creating a new `SoloXP/docs/issues/issue-1691.MD` during this check

[Auditor doc OK]
xp_Director issues a PR.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:25:30Z

[Parent branch PR issued] #3041
feature/issue-1691 → main

Work completed 2026-08-20 10:25 JST / Duration: Approximately 63 minutes (started on first subtask #3036 at 09:41 JST)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-08-20T10:36:28Z

## PR #3041 Review response (additional)

There were two P1 points raised in the Codex review (PR #3041), and an additional bug (bootstrap self-reference paradox) was also discovered and fixed during the correction process.

1. **Stricter Marker Judgment** (as pointed out by Codex): Simple substring matching also falsely detected the text that explains the meaning of the marker (actually reproduced in #1691's own first comment). Changed to exact line-by-line match (`hasStandaloneMarkerLine`)
2. **Reliable code execution in checkout** (as pointed out by Codex): With the default checkout, PR could disable the gate by rewriting check-allgreen.js itself. Changed to overwrite method with base.sha side script
3. **bootstrap self-reference paradox** (self-discovered by running CI while implementing fix 2): When fix 2 was implemented by fixing it to the checkout ref itself, when it was executed against this PR itself (#3041) where this check was introduced for the first time, it failed with MODULE_NOT_FOUND (script does not exist in base yet). We modified the fallback method (overwrite if it exists on the base side, use the PR side if it does not exist) and confirmed that the `allgreen-check` job actually passes as GREEN for PR #3041 itself.

All 760 tests PASS, `{"status":"pass","issueNumber":1691}` confirmed in actual CI execution (allgreen-check job to PR #3041 itself).

---
_Generated by [Claude Code](https://claude.ai/code)_

---
