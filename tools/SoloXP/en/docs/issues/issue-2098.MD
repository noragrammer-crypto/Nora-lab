---
issue: 2098 title: "[Task] Investigating feature-dev calling procedure and revising SKILL.md" state: open labels: [task, epic/SoloXP] author: noragrammer-crypto created_at: 2026-07-15T12:11:41Z epic: SoloXP
---

# #2098 [Task] Investigate feature-dev calling procedure/revise SKILL.md

## Body

## overview
Revise the description to call `/feature-dev` or an equivalent code search method in step 3 of xp_Architect (checking conflicts with existing implementations).

### Investigation items (things to check before implementation)
- Does feature-dev have "architect" or "explore" subcommands?
- Is it possible to automatically use only phase 1-2 of feature-dev (Discovery + Codebase Exploration)?
- Can human interaction requirements in Phase 3 (Clarifying Questions) be avoided?
- Specifications when `Explore` subagent or `Plan` subagent can be used as an alternative

### Implementation details
- Revised xp_Architect's SKILL.md step 3 to call feature-dev (or equivalent code search method)
- Specified conversion rule in SKILL.md to map `depends_on` / `task_type` from feature-dev output to xp execution plan.

### Notes (design concerns)
Feature-dev is a full 7-phase workflow, with human interaction required in Phase 3 (Clarifying Questions) and Phase 5 (Implementation). When embedding it in an automatic flow, consider using it in a range where there is no human waiting (only in Phases 1-2 or using Explore subagents).

## estimate
1pt — Survey/SKILL.md Revised

## Dependencies
None (can start immediately)

## Parent story
#1381

## Parent branch
feature/issue-1381

## comment

### noragrammer-crypto — 2026-07-15T12:49:42Z

There must have been a code-architect agent?

---

### noragrammer-crypto — 2026-07-16T13:18:30Z

## Observable change check ([Task] Skip judgment)

Target: #2098 Changes in observable behavior: None Reason: Only changes in the description of xp_Architect's SKILL.md (internal orchestration definition). There are no changes to the API, UI, or output content that can be observed by the user/externally. Determine that Architect decomposition is unnecessary and proceed to the execution flow.

---

### noragrammer-crypto — 2026-07-16T13:18:32Z

Work started 2026-07-16 13:18 Session URL: https://claude.ai/code/session_01WF2Uu3Gj7CH4eLwtsjKzKX [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-16T13:18:53Z

[Tester running]

## Test execution results

Target: Only document description changes in xp_Architect SKILL.md (`dotfiles/.claude/skills/xp_Architect/SKILL.md` and 2 copies). Does not involve adding or changing execution code.

Skip: Unit / Functional / E2E — Reason: No code under test (documentation only changes).

## Survey results summary (for Implementer takeover)

1. There are no "architect" / "explore" subcommands in `/feature-dev` (`commands/feature-dev.md` is a single command, a serial flow of Phases 1 to 7).
2. However, the feature-dev plugin uses the `code-explorer` agent in Phase 2, the `code-architect` agent in Phase 4, and the `code-reviewer` agent in Phase 6 as individual subagents (`plugins/feature-dev/agents/{code-explorer,code-architect,code-reviewer}.md`). These can be started directly with the Agent tool, and there is no need to go through the `/feature-dev` command body.
3. It is not possible to incorporate the `/feature-dev` body into an automatic flow (the design requires waiting for a human response based on Phase 3 Clarifying Questions, Phase 5 Implementation approval, and Phase 6 review judgment).
4. On the other hand, the `code-architect` subagent alone can be called without waiting for a human response (tools: Glob, Grep, LS, Read, NotebookRead, WebFetch, TodoWrite, WebSearch, KillShell, BashOutput — complete with read-only tools). It has a specification that returns existing pattern analysis → architecture design → implementation blueprint (change plan for each file, data flow, build order), and can be used as an alternative to xp_Architect step 3 (checking conflicts with existing implementation).
5. This session environment also has built-in `Explore` (read-only code search) and `Plan` (implementation planning) agents, which have overlapping roles with `code-explorer` / `code-architect`.

→ Implementation policy: Replace xp_Architect step 3 with a direct call to the `code-architect` subagent (Agent tool, subagent_type: code-architect). The `/feature-dev` command body is not included in the automatic flow as it waits for a human response.

---

### noragrammer-crypto — 2026-07-16T13:19:41Z

[Implementer running]

---

### noragrammer-crypto — 2026-07-16T13:20:37Z

[Implementer completed]

## Implementation completed

Change file:
- `dotfiles/.claude/skills/xp_Architect/SKILL.md`: Revised step 3 (checking conflicts with existing implementation) to call `code-architect` subagent (Agent tool, `subagent_type: code-architect`). Added mapping table from output (Patterns & Conventions Found / Build Sequence / Implementation Map, etc.) to xp execution plan (depends_on / task_type). Specified fallback conditions (detailed definition in #2099).
- `.claude/skills/xp_Architect/SKILL.md`: Reflects the same content as above (manual synchronization according to skill 3 copy synchronization rules of CLAUDE.md. `SoloXP/skills/` follows automatically with pre-push hook).

Test results:
- Unit test: Not applicable (changes in documentation only)
- Functional testing: Not applicable (document changes only)

⚠️ Note to Auditor:
- Acceptance conditions 1 and 2 (feature-dev/equivalent agent invocation description/output mapping specified) are satisfied with this PR.
- Acceptance condition 3 (clarification of fallback procedure) was designed to specify only the condition "If the tool is not supported or an error occurs, switch to manual tracing" and leave the detailed activation conditions and confirmation procedure to dependent task #2099 (definition of fallback procedure and update of E2E test). The implementation scope of the issue body of #2098 is "Investigation of feature-dev calling procedure and revision of SKILL.md", and the fallback definition itself is the scope of #2099.
- Acceptance condition 4 (existing xp flow is not broken) is maintained because other sections of the relevant file (steps 1, 1-1, 2, 4-7, design philosophy, notes) have not been changed.

---

### noragrammer-crypto — 2026-07-16T13:21:04Z

[Auditor test running]

## Independent Verification

Check the changes with `git diff --stat`:
```
.claude/skills/xp_Architect/SKILL.md          | 51 ++++++++++++++++++++++++---
dotfiles/.claude/skills/xp_Architect/SKILL.md | 51 ++++++++++++++++++++++++---
```

- The only changed file in both cases is SKILL.md (document). No changes to the executable code → Matches Tester/Implementer's "No code to test" report (independently verified).
- The contents of `.claude/skills/xp_Architect/SKILL.md` and `dotfiles/.claude/skills/xp_Architect/SKILL.md` are an exact match (confirm no output with `diff`) → The 3-copy synchronization rule for CLAUDE.md (2 files subject to manual synchronization) is satisfied.
- Acceptance condition 1 (feature-dev/equivalent agent call description): Check the description of the `code-architect` subagent (Agent tool, subagent_type: code-architect) call in step 3. This is an agent provided by the feature-dev plugin and satisfies the conditions for "`/feature-dev` (or equivalent subcommand)" in the body.
- Acceptance condition 2 (output → execution plan mapping): Check the conversion rule table from code-architect output (Build Sequence / Implementation Map, etc.) to depends_on / task_type.
- Acceptance condition 3 (fallback procedure): Check the condition of "Switch to manual tracing if tool is not supported or error occurs." It has been confirmed in the issue text and Implementer report that the detailed activation conditions are designed to be delegated to #2099 (this task depends on). #2098 Determined to be sufficient as a single implementation scope (investigation of feature-dev calling procedure and revision of SKILL.md).
- Acceptance condition 4 (existing xp flow not stopped): Check the diff, steps 1, 1-1, 2, 4-7, design philosophy, and notes remain unchanged. Does not break existing flow.

xp_RunTestSuites is not applicable to this task because there is no code to be tested (only the documentation has been changed).

[Auditor GREEN] Target: #2098 — Independent verification of document-only changes (diff confirmation/confirmation of fulfillment of acceptance conditions 1-4).

---

### noragrammer-crypto — 2026-07-16T13:21:13Z

Work completed 2026-07-16 13:21 / Required time: 3 minutes

---

### noragrammer-crypto — 2026-07-16T13:22:46Z

[Documenter running]

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-2098.MD`: `xp_issue2md` — Transcript of all text and comments of this issue

Not applicable (with reason):
- `xp_doc_spec`: The update of `SoloXP/docs/spec/xp_architect.md` is the responsibility of `[Task] Functional specification update` (#2100, task_type: spec_update, depends_on: #2098, #2099), which is separated as an independent task in this story. #2099 (Fallback procedure definition) If it is updated ahead of schedule while it is not completed, double updates and discrepancies in the description will occur in #2100, so it will not be implemented in this task.
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: This task is not applicable as it does not involve any additional changes to the code/test files (changes only to SKILL.md).

[Documenter completed]

---
