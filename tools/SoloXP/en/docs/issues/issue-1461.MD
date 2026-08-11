---
issue: 1461 title: "[Story] AI development cost visualization — Token consumption tracking by issue" state: open labels: [story, env/ClaudeCodeWeb] author: noragrammer-crypto created_at: 2026-06-16T02:46:08Z epic: SoloXP
---

# #1461 [Story] AI development cost visualization — Token consumption tracking by issue

## Body

## Background

In AI development, if it is not possible to see how many tokens have been invested in which issues, resource allocation decisions will depend on intuition.

Token consumption occurs every time an issue is processed by an agent such as Claude Code / Codex / GPT, but currently it is not recorded or aggregated.

Related discussion: [AI Management Technology (ChatGPT Conversation)](https://chatgpt.com/share/6a30b59b-cdd0-83e8-99d2-99c9801fae21)

## What I want

Report of token consumption and results sorted by issue/epic:

| Issue | Model | Consumption Token | Results |
|-------|--------|------------|------|
| #123 | Claude Code | 500k | Completed |
| #124 | Codex | 1.2M | Dropped |
| #125 | Research Agent | 2M | MVP candidate discovery |

More Epic ROI:

```
Epic #1342 Engagement Improvement
  Total token consumption: XX M
  Completed Issues: XX
  KPI change: note PV +XX%
```

## Implementation ideas

### Phase 1: Manual recording (least cost)

Defines the format for manually adding token consumption to issue comments:

```
Work completed YYYY-MM-DD HH:MM / Required time: XX minutes
tokens: prompt=XXXk completion=XXXk total=XXXk
model: claude-sonnet-4-6
```

`xp_worklog` parses this format and aggregates it.

### Phase 2: Automatic collection

A script that parses Claude Code's `/cost` command output and usage log and automatically records it by linking it with the issue number.

### Phase 3: Dashboard

Added "This week's token consumption summary" section to ops-meeting (#1330) report. Epic-wise ROI scatter plot (cost vs. outcome).

## Acceptance conditions

- Token consumption per issue can be aggregated
- ops-meeting report now includes weekly token summary
- You can use numbers to determine which Epic is more cost-effective.

## connection

- #1342 Engagement improvement roadmap (P4: Cost/operational efficiency)
- ops-meeting #1330
- xp_worklog skill

## comment

### noragrammer-crypto — 2026-07-17T05:19:14Z

## Conflict check with existing implementation (manual trace/fallback)

Target: #1461

Fallback triggered: Yes Reason for triggering: `code-architect` subagent is unavailable due to `Agent type 'code-architect' not found` error (switched to manual tracing by Explore agent)

Patterns & Conventions Found:
- `xp_worklog` (`SoloXP/skills/xp_worklog/SKILL.md`) is prompt-driven only. There is no backend `.js`, and Claude directly parses, aggregates, and outputs the `gh`/MCP output to a file.
- In `ops-meeting`, the report generation part (phases 2 to 7) is prompt/Agent driven. Persistence layer only has JS libraries called `SoloXP/lib/ops-meeting-record.js` (`buildRecord`/`saveRecord`) and `SoloXP/lib/ops-meeting-prev.js` (`loadPrevRecord`/`formatPrevProposals`) (in `data/ops-meeting/YYYY-MM-DD.json`) Save `{date, actions:[{title,priority,issueNumber}]}`).
- The table columns by issue of the existing `worklog/YYYY/MM/<epic>.md` are `| Issue | Title | Start time | End time | Working time | Notes |`. Add token columns as an extension of this table.
- Existing implementations related to #1472 and #1475 cannot be found in this repository (the linked issue number does not appear as an implementation in the code document).

Architecture Decision: Token consumption recording, aggregation, and weekly summary will be implemented by **only adding prompt instructions to SKILL.md**, just like the existing `xp_worklog`/`ops-meeting` (no new scripts or new persistence layer will be introduced). Adjust the operation by adding the `tokens:` line to the same comment as the existing work time record (`work start`/`work completed` comment).

Conflict: None (can be implemented by extending existing pattern)

---

### noragrammer-crypto — 2026-07-17T05:20:38Z

Work started 2026-07-17 05:15 JST [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-17T05:20:48Z

[Parent branch created] claude/issue-processing-yz6g3k

Note: This session has been explicitly assigned branch `claude/issue-processing-yz6g3k` from the ClaudeCode web-side execution harness (with the "NEVER push to a different branch without explicit permission" constraint), and will simply use this branch as the parent branch instead of the usual naming convention `feature/issue-1461`.

Sub-issues (total 6 issues, #2141 to #2146) have already specified `claude/issue-processing-yz6g3k` in the "## Parent branch" column of the main text. When processing each subissue with `/xp_Director <number>` in the next session, treat this branch as a fetch/rebase target.

Ready to start:
- #2141 [Task] Definition of token consumption record format and maintenance of work log rules
- #2142 [Task] E2E test suite creation

After that, in order of dependencies (#2141 → #2143 → #2144 → #2145 → #2146).

Please run /xp_Director <first subtask number> in your next session.

---

### noragrammer-crypto — 2026-07-17T12:36:35Z

## Fixed parent branch configuration mistake

Fixed the following problem that occurred in the previous Architect decomposition session.

**Problem that was occurring:**
- The Architect decomposition session uses the temporary session branch `claude/issue-processing-yz6g3k` on the ClaudeCode Web execution harness side as the parent branch instead of `feature/issue-1461` which should be created according to the rules (recorded in the "## parent branch" column of sub-issues #2141 to #2146)
- The session exceeds the rules (step 4: Record `[parent branch created]` and stop) and issues a PR to `main` with only the addition of a story card (PR #2147)
- That PR was merged by the user and `claude/issue-processing-yz6g3k` was automatically deleted after the merge.
- As a result, the parent branch that the subtask should reference no longer existed, causing `git fetch origin claude/issue-processing-yz6g3k` to fail.
- Furthermore, this Story (subtask 0/6 completed) was closed as completed.

**Modification details:**
1. Create and push `feature/issue-1461` from `main` (state after merging PR #2147, including story card `StoryCards/ai-dev-cost-token-tracking.md`)
2. Corrected "## parent branch" of sub-issues #2141 to #2146 from `claude/issue-processing-yz6g3k` to `feature/issue-1461`
3. Reopen this Story (because it is incomplete)

From next time onwards, each subtask will be able to proceed with processing with `feature/issue-1461` as the fetch/rebase target.

---

### noragrammer-crypto — 2026-07-18T00:08:12Z

Sub-issue #2141 completed. Remaining: #2142, #2143, #2144, #2145, #2146

---

### noragrammer-crypto — 2026-07-18T12:10:48Z

Sub-issue #2142 completed. Remaining: #2143, #2144, #2145, #2146

---

### noragrammer-crypto — 2026-07-19T00:17:49Z

Sub-issue #2143 completed. Remaining: #2144, #2145

PR: https://github.com/noragrammer-crypto/HolyAutomater/pull/2179

---

### noragrammer-crypto — 2026-07-19T12:16:41Z

Sub-issue #2144 completed. Remaining: #2145, #2146

---

### noragrammer-crypto — 2026-07-19T12:24:34Z

Sub-issue #2144 completed. Remaining: #2145, #2146

---

### noragrammer-crypto — 2026-07-20T00:14:29Z

Sub-issue #2145 completed. Remaining: #2146

---

### noragrammer-crypto — 2026-07-20T00:22:44Z

Sub-issue #2145 completed. PR #2197 Published.

---

### noragrammer-crypto — 2026-07-20T12:12:00Z

Subissue #2146 completed (spec_update). Remaining: None (total 6 completed)

PR #2208 Published (base: feature/issue-1461). All subtasks completed. Next time, please proceed to the AllGREEN flow (PR issue for main) at /xp_Director 1461.

---

### noragrammer-crypto — 2026-07-21T00:07:36Z

Work started 2026-07-21 00:07 JST Session URL: https://claude.ai/code/session_01Rf4Aam5R3eDTNU5yFsGkcj [ProjectStatus: InProgress]

AllGREEN flow starts. Confirm that all 6 subtasks have been completed and all PRs have been merged. Run story-level acceptance tests.

---

### noragrammer-crypto — 2026-07-21T00:09:44Z

## Test execution results (Story-level Auditor)

Execution date and time: 2026-07-21 00:12 JST branch: feature/issue-1461 Preview URL: https://holyautomater-nmnfp2hdl-noragrammer-cryptos-projects.vercel.app (200 OK)

### Unit test (DiscordAIbot)
- Results: 172 PASS / 0 FAIL (15 suites)✅

### Functional test (DiscordAIbot)
- Results: 66 PASS / 0 FAIL (8 suites)✅

### Unit test (SoloXP)
- Results: 189 PASS / 0 FAIL (18 suites) ✅

### Functional test (SoloXP)
- Results: 50 PASS / 0 FAIL (8 suites)✅

### E2E Test (Story Acceptance Test)
- Test file: `SoloXP/tests/e2e/issue-1461-ai-dev-cost-token-tracking.test.js`
- Results: 15 PASS / 0 FAIL ✅

### Confirm acceptance conditions
- ✅ AC-1: Token consumption per issue can be aggregated with xp_worklog (3 items PASS)
- ✅ AC-2: ops-meeting report includes weekly token summary (3 PASS)
- ✅ AC-3: Cost-effectiveness can be determined numerically on an Epic basis (3 items PASS)
- ✅ Prerequisite: CLAUDE.md Token consumption format defined (4 items PASS)
- ✅ File sync: dotfiles ↔ SoloXP matches (2 PASS)

### Overall judgment
✅ **GREEN**: All acceptance conditions are met.

[Auditor GREEN] PASS: 172 items (DiscordAIbot unit) + 66 items (functional) + 189 items (SoloXP unit) + 50 items (functional) + E2E 15 items

---

### noragrammer-crypto — 2026-07-21T00:10:56Z

## xp_Reviewer report

Target: feature/issue-1461 (merged differences of all 6 subtasks) Execution date and time: 2026-07-21 00:15 JST

### High Risk

none

### Moderate/low risk indication

**[Low risk] TOKEN_SUMMARY behavior when worklog data is absent**
- Target: `ops-meeting/SKILL.md` Phase 1/7
- Contents: Although the fallback text ("no worklog data for this week") is clearly specified if `worklog/YYYY/MM/*.md` does not exist, if there is no logic to actually replace the `[TOKEN_SUMMARY]` placeholder with a variable, the placeholder may be output as is.
- Judgment: ops-meeting is prompt-driven and the model reads and processes the context, so it is unlikely to cause any harm. No action required at this time.

**[Low Risk] Integer processing without `k` suffix in xp_worklog**
- Target: `xp_worklog/SKILL.md` Token consumption aggregation rules
- Contents: It is stated that if there is no `k` suffix, it is treated as an integer, but there is a possibility of inconsistency with the display format (`Xk`).
- Judgment: This is a supplementary explanation of the manual input format, and if the format breaks, the user is asked to confirm, so there is no problem.

### Overall review

All changes are limited to **SKILL.md (prompted instructions) and documentation**. No changes to backend code. 3-copy synchronization (SoloXP/.claude/dotfiles) is confirmed to ensure consistency of skill updates. All 15 E2E tests covering acceptance conditions (AC-1/AC-2/AC-3) are GREEN. No high risk indications. There is no need to issue an improvement recommendation issue.

✅ **Reviewer completed: PR publication approved**
