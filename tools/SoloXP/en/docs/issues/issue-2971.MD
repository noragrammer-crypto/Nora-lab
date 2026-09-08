---
issue: 2971
title: "[Task] Finalize issue markdown and sync to closed state upon completion of Epic"
state: closed
labels: []
author: noragrammer-crypto
created_at: 2026-08-16T15:16:25Z
epic: SoloXP
---

# #2971 [Task] Finalize Issue Markdown and synchronize to closed state when Epic completes

## Body

## Overview

Regarding Markdown snapshots of GitHub issues stored in `<epic>/docs/issues/issue-*.MD`, there is an issue where the issue that was `state: open` at the time of acquisition is actually closed later, but the Markdown side is not updated, and an old state remains when greping or searching.

Example: `modal/docs/issues/issue-1036.MD` is saved including the main text and comments, while `state` in the front matter remains as it was at the time of acquisition.

This will be changed to a mechanism that reacquires unconfirmed issues at the completion of SoloXP's Epic/Story and updates closed issues to the final snapshot.

## Policy

Issue Markdown is handled in two stages:

- **Open:** Working cache. Allow some stale
- **After closed:** Completed document. Re-fetch from GitHub and finalize when Epic completes

There is no constant synchronization, but the synchronization point is around the PR issue for SoloXP's AllGREEN~main.

## Draft processing flow

After Epic/Story is judged AllGREEN, the following will be carried out before and after issuing PR for main.

1. Scan `docs/issues/issue-*.MD` under the target Epic
2. Extract only files with front matter `state: open` as synchronization candidates
   - Example: `grep -rl '^state: open$' <epic>/docs/issues/`
3. Re-obtain candidate issues from GitHub API
4. Issues marked as `closed` on GitHub will be replaced with the latest version of Markdown, including the body, comments, and front matter.
5. Don't change the issue of `open` yet
6. The parent Story/Bug that is being processed this time may be open at the time the main PR is issued, so after the issue is closed, get it and finalize it.

## Separation of duties

`xp_Director` will maintain its current commitment to "not rewrite code/documentation, but to focus on judgment and progress management."

Therefore, the basic idea is to make the synchronization process itself an independent responsibility of the Documenter system, and delegate the following processes to the Director during AllGREEN.

```text
xp_Director
  ↓ AllGREEN
Issue archive finalize / Documenter
  ↓
xp_Auditor Story-level
  ↓
main PR
  ↓
親Story close後に親Issueを最終同期
```

In terms of implementation, it can be added to the existing Documenter or separated as a small process/skill for issue archive synchronization.

## front matter proposal

At the very least, update the existing `state`.

```yaml
state: closed
```

We will also consider adding the following for future difference determination.

```yaml
synced_at: 2026-08-17T00:00:00+09:00
github_updated_at: <GitHub issue updated_at>
```

However, in the initial implementation, to avoid complication, the required range is ``Re-check the local issue with state: open on GitHub, and if it is closed, replace it with the latest version'' **.

Skip reacquisition using `github_updated_at` will be expanded in the future.

## Non-purpose

- We will not create a constant synchronization mechanism that synchronizes Markdown every time an issue comment is added.
- Do not re-enumerate all GitHub Issues with API each time
- Do not use Issue Markdown's `state` as SSOT for SoloXP dependency removal/completion judgment
  - Workflow judgment will continue to follow existing rules such as the state on GitHub and `[Auditor GREEN]`
  - Markdown synchronization aims to improve the freshness of search, history, and local reference materials

## Expected effect

- `grep` / Reduce stale information where closed issues remain as open when referencing past issues in local search
- Materials can be finalized at the natural boundary of Epic completion while avoiding constant synchronization of all issues
- Local issue archives can be clearly treated as "working cache → finalized material after completion"
- GitHub API calls can be limited to local candidates for `state: open`

## Acceptance conditions

- [ ] Issue Markdown finalize processing is included in the AllGREEN~Epic/Story completion flow
- [ ] Only Issue Markdown of `state: open` under the target Epic is a sync candidate.
- [ ] Issues closed on GitHub have been updated to the latest version of Markdown, and the front matter has been changed to `state: closed`
- [ ] Open issues on GitHub will not be rewritten unnecessarily
- [ ] Parent Story/Bug itself is also synchronized to the final state after closing
- [ ] Synchronization results are not used to cancel SoloXP's depends_on or judge Auditor GREEN.
- [ ] Do not always synchronize/re-acquire all issues

## Related

- `modal/docs/issues/issue-1036.MD`
- `SoloXP/skills/xp_Director/SKILL.md`
- `SoloXP/docs/spec/xp_director.md`

## Comment

### noragrammer-crypto — 2026-09-03T09:40:38Z

## Observable change check ([Task] Skip judgment)

Target: #2971
Observable behavior changes: Yes
Reason: Add a new finalize process to SoloXP's Epic/Story completion flow (near the AllGREEN process of `xp_Director`) to re-obtain and replace the Issue Markdown snapshot (`docs/issues/issue-*.MD`) to the closed state on GitHub. Since new behaviors such as processing execution timing, target range, and front matter update (`state: closed`) are added, it is determined that decomposition using Architect is necessary.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T09:40:50Z

## E2E/spec necessity determination (Task)

Target: #2971
Observable behavior changes: YesReason: A new finalize process will be added to SoloXP's PR issue flow for AllGREEN~main to re-obtain and replace the Issue Markdown snapshot (`docs/issues/issue-*.MD`) to the closed state on GitHub. Since new behaviors such as processing timing, target range narrowing, and front matter updates are added, we will also issue E2E test suite creation and functional specification update tasks as equivalent to Story.
Additional tasks: E2E test suite creation / functional specification update (to be published after this comment)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T09:43:28Z

## Conflict check with existing implementation (code-architect)

Target: #2971

Fallback activation: Yes
Reason for firing: `code-architect` Subagent is unavailable for this session (`Agent type 'code-architect' not found`), switching to manual code tracing

**Patterns & Conventions Found:**
- `xp_issue2md` (`SoloXP/skills/xp_issue2md/SKILL.md`) is the only implementation of Issue → Markdown conversion. The front matter has a fixed 7-field format: `issue` / `title` / `state` / `labels` / `author` / `created_at` / `epic`. The save destination is `<EpicName>/docs/issues/issue-<番号>.MD`. gh It already has a normalization pattern of CLI priority → MCP fallback.
- `xp_Documenter` (`SoloXP/skills/xp_Documenter/SKILL.md`) calls `xp_issue2md <issue_number>` as step 1 at the completion of each task, but this is only executed for the task's own issue_number. The execution timing is **before** `xp_Director` `gh issue close` the corresponding task (in the order of Documenter → Auditor doc → PR issue → close), so the task MD itself is always saved as `state: open` at the time of creation, and is not updated even if it is closed immediately after (confirmed with the actual sample `Cowork/docs/issues/issue-576.MD`: Although the content is a completed task, it remains as `state: open`). This is the main source of the inconsistency pointed out in this issue.
- The parent Story/Bug issue itself is not passed as `issue_number` in the Documenter phase of any task, so it always remains stale if the MD file exists (and often does not).
- The principle of `xp_Director`, ``Do not rewrite code or documents, concentrate on judgment and progress management'' is consistent with the current skill, and all writing-related processing is designed to be handled by the delegated skill (xp_Documenter, etc.).

**Architecture Decision:**
New abstractions and naming conventions will be kept to a minimum, and the following will be adopted as an extension of existing patterns.
1. Add a new skill `xp_issueArchiveFinalize <EpicName>` (Separate it as a Documenter-related responsibility. Make it an independent skill rather than adding functionality to xp_Documenter - xp_Documenter's responsibility is to "generate a full document for a single issue_number" so that it does not break the existing calling convention [`<epic_name> <issue_number>`]).
   - Identify candidates using `grep -rl '^state: open$' <EpicName>/docs/issues/` (same as the proposed processing flow in the issue body)
   - Perform a lightweight status check for each candidate (`gh issue view <n> --json state -q .state`, fallback to MCP `mcp__github__issue_read` method: get on failure)
   - If it is `closed` on GitHub, call `xp_issue2md <n>` as is and regenerate the entire thing (update all front matter, body, and comments. Do not create new Markdown generation logic and reuse existing xp_issue2md)
   - Do nothing if it remains `open`
2. Add a call to `xp_issueArchiveFinalize <EpicName>` to the AllGREEN flow of `xp_Director` (between existing steps 6 and 7, before issuing PR for main). This eliminates the staleness of all task MDs at the time of Epic completion (xp_Director itself does not write files, it only delegates, maintaining the existing principle).
3. The close detection of the parent Story/Bug issue itself is an asynchronous event that occurs after the PR merge ends this session, and since there is no active session at that point, it cannot be completed within the AllGREEN flow of `xp_Director`. Add a step to run `xp_issueArchiveFinalize` across Epics to the existing cyclic execution mechanism (`daily-tasks` skill), and target each Epic directory that has `docs/issues/` locally (API call is made to `state: open` of each Epic) Since it is limited to candidates only, it does not conflict with the non-purpose of "Do not always synchronize all issues" in CLAUDE.md).

**Conflicts:** None (only added one new skill and added calls to `xp_Director` and `daily-tasks`. The existing `xp_issue2md` generation logic itself is not changed)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T09:44:58Z

Start of work 2026-09-03T18:44:55+09:00
Session URL: https://claude.ai/code/session_01PDkYyHCXrLGqRPSg8wFgBS
[ProjectStatus: InProgress]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T09:45:05Z

## Execution plan

Issue type: Task (with observable behavior changes, decomposed into sub-issues as equivalent to Story)
Story issue: #2971
Sub-issues (5 total):
  - #3484 [Task] Issue Markdown finalize skill (xp_issueArchiveFinalize) New creation (2pt) depends_on: None- #3485 [Task] Including Issue Markdown finalize in xp_Director AllGREEN flow (1pt) depends_on: #3484
  - #3486 [Task] Incorporating Epic cross-Issue Markdown finalize into daily-tasks (1pt) depends_on: #3484
  - #3487 [Task] E2E test suite creation (1pt) depends_on: None
  - #3488 [Task] Functional specification update (1pt) depends_on: #3484, #3485, #3486

Ready to start (no depends_on):
  - #3484, #3487

Blocking (waiting for depends_on):
  - #3485 ← Waiting for [Auditor GREEN] for #3484
  - #3486 ← Waiting for #3484's [Auditor GREEN]
  - #3488 ← Waiting for [Auditor GREEN] for #3484, #3485, #3486

[Parent branch created] feature/issue-2971
Please run /xp_Director <first subtask number> in your next session.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T09:52:32Z

Sub-issue #3484 completed. Remaining: #3485, #3486, #3487, #3488

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:00:24Z

Sub-issue #3487 completed. Remaining: #3485, #3486, #3488

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:10:44Z

Sub-issue #3485 completed. Remaining: #3486, #3488

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:14:32Z

Sub-issue #3486 completed. Remaining: #3488

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:27:54Z

Auditor test running (Story-level)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:28:15Z

## /xp_RunTestSuites Results

Execution date and time: 2026-09-03 19:32 JST
Branch: feature/issue-2971

### Unit tests
- Results: 321 PASS / 0 FAIL

### Functional testing
- Preview URL: Not applicable (because only the SoloXP script/skill file was changed without any changes to the Vercel API in this story)
- Results: 69 PASS / 0 FAIL

### Overall judgment
✅ GREEN

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:28:44Z

## /xp_RunE2ETests results

Execution date and time: 2026-09-03 19:34 JST
Target: SoloXP tests/e2e (Jest based, not subject to communication check)
Target story: #2971

### Results
- PASS: 224 / SKIP: 1 (derived from another existing story, unrelated to this story) / FAIL: 0

### E2E test specific to this story (issue-2971-issue-archive-finalize-workflow.test.js) details
- Total of 14 PASS (as of #3487 last time, 8 were RED and 2 were PASS, but it has been confirmed that Suite 3〈#3485〉 and Suite 4〈#3486〉 have changed to GREEN)

### Acceptance judgment
✅ All PASS: Story completed/PR creation possible

## Story-level Auditor Overall Judgment

- Unit + Functional (`xp_RunTestSuites`): GREEN (321 + 69, FAIL 0)
- E2E (`xp_RunE2ETests`): GREEN (224 PASSes, 14 total PASSes unique to this Story)
- Block target RED owned by own story: None

[Auditor GREEN]
PASS: Unit 321 + Functional 69 + E2E 224 (including 14 Story-specific) / Test command: `npm run test:unit && npm run test:functional && npm run test:e2e`

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:29:02Z

[Reviewer running]

Since the `code-reviewer` subagent is unavailable in this session (`Agent type 'code-reviewer' not found`), we will switch to a manual check equivalent to a normal code review instead of the built-in skill `/security-review` as a fallback (equivalent to `/review`).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:51:37Z

## xp_Reviewer Report (Story #2971・AllGREEN flow)

`feature-dev:code-reviewer` by subagent `git diff origin/main...feature/issue-2971` overall
(SoloXP/scripts, SoloXP/skills/xp_issueArchiveFinalize, xp_Director/daily-tasks integration, various tests/specs/
Review the complete set of documents).

### High Risk

None.

### Moderate/low risk indication

- **Important (78-80% confidence)**: E2E test documentation
  The "prerequisites" clause of `SoloXP/docs/tests/E2ETests/issue-2971-issue-archive-finalize-workflow.md` is
  The products `.claude/skills/xp_Director/SKILL.md` and `.claude/skills/daily-tasks/SKILL.md` are
  Although it was written as a premise, the actual test code (`tests/e2e/issue-2971-...test.js`) isOriginal copy `SoloXP/skills/xp_Director/SKILL.md` due to the Codex review of PR #3490.
  This is an implementation that directly validates `workflow/skills/daily-tasks/SKILL.md`, and the documentation is
  It was out of sync with the implementation. → Fixed (committed/pushed).

### Overall review

- `find-stale-issue-archives.sh` is a careful implementation that limits judgment to front matter blocks,
  The Codex issue in PR #3489 (false positive due to quotation in the comment text) has also been resolved.
- `xp_issueArchiveFinalize` consistently follows the design policy of reusing existing `xp_issue2md`,
  No new Markdown generation logic has been introduced.
- It is clearly stated in both SKILL.md and spec that it will not be SSOT for `depends_on`・Auditor GREEN judgment,
  The non-purpose (constant synchronization, not re-obtaining all issues) is also consistent.
- Integration into xp_Director/daily-tasks follows existing call patterns (gh/MCP fallback, etc.)
  No new design decisions are introduced.
- Each subtask PR (#3489 to #3493) has a history of responses to Codex review points, and gradual improvements are made.
  It's piling up.

Since no High Risk has been identified, an improvement proposal issue will not be automatically raised (`xp_Reviewer/SKILL.md` Step 4).

Next step: Execute `xp_SecurityReviewer`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:51:45Z

[SecurityReviewer running]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:52:13Z

## xp_SecurityReviewer report

`security-review` skill makes all changes to `feature/issue-2971` branch (new bash script)
`find-stale-issue-archives.sh`, `xp_issueArchiveFinalize` skills, xp_Director/daily-tasks integration,
Review various tests, specs, documents) from a security perspective.

### High Risk

None.

### Moderate/low risk indication

None.

### Overall review

- `find-stale-issue-archives.sh` only performs read-only file system scans, and `eval` and
  We do not dynamically construct commands for external processes. Extracted from front matter block
  Just output the issue number to standard output, and avoid dangerous operations (such as building shell commands) using the extracted value.
  Not present in script.
- GitHub API integration (`gh issue view` / `mcp__github__issue_read`) is a procedure description on SKILL.md,
  The execution is done by the orchestrator (Claude Code) himself. established in the existing `xp_issue2md`
  It follows the gh/MCP fallback pattern and does not add any new attack surfaces.
- Most of the changes are in documents (SKILL.md, spec, tests) except for the code file, and are secret/
  New I/O extensions that lead to hard-coding authentication information, injection/path traversal, etc.
  Not confirmed.

Since no high risks have been identified, an improvement recommendation issue will not be automatically raised.

[SecurityReviewer completed]

Next step: Execute `xp_Auditor doc` (Story-level).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T10:54:50Z

[Checking Auditor document]

### Document check results
- spec/README.md: OK (check indexing of `xp_issue_archive_finalize.md`)
- spec/xp_issue_archive_finalize.md・spec/xp_director.md: OK (content enriched, updated to built-in notation in #3488)
- reference/find-stale-issue-archives.md: OK
- issue2md log: NG → Corrected. The issue2md snapshot of the Story itself (#2971) was missing, so
  Created a new `SoloXP/docs/issues/issue-2971.MD` by processing equivalent to `xp_issue2md 2971`
  (Same type support as AINovelGenerator #3440. Supports Story-level Auditor doc check)
- diff scope integrity: OK (`git diff --stat origin/main...origin/feature/issue-2971`: 28 file changes
  〈+1796/-26〉. All files are within the scope of this Story (SoloXP scripts/skills/tests/spec/docs, workflow/daily-tasks,
  Make sure that dotfiles synchronous replication and codecompass hotspots automatic update are in place. Changing to an unexpected directory/
  (No mass deletion)

[Auditor doc OK]
xp_Director issues a PR.

---
_Generated by [Claude Code](https://claude.ai/code)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-09-03T20:21:09Z

## Issue Archive Finalize completed

Target Epic: SoloXP
Number of scans: 80 (snapshot of front matter `state: open`)
Number of finalizes: 79
Skip count: 1 (#2971 himself. Not rewritten as it is still open on GitHub)

This is the result of calling `xp_issueArchiveFinalize`, which was implemented by this Story itself, in actual operation for the first time. All existing stale snapshots (#269 to #3488, including subtasks #3484 to #3488 of this story) that had been accumulated under SoloXP Epic since before the introduction of this feature were synchronized with the actual state (closed) on GitHub and replaced with the latest version. The results are not used to determine whether AllGREEN is established (non-purpose of #2971).

Commit/Pushed (`feature/issue-2971`).

Next step: Issue PR for `feature/issue-2971` → `main`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---### noragrammer-crypto — 2026-09-03T20:21:47Z

[Parent branch PR published]
https://github.com/noragrammer-crypto/HolyAutomater/pull/3508

(`--base main` / `Closes #2971`. GitHub auto-closes on merge)

Work completed 2026-09-04T05:21:15+09:00 / Required time: 636 minutes
model: claude-sonnet-5

[ProjectStatus: Done]

---
_Generated by [Claude Code](https://claude.ai/code)_

---
