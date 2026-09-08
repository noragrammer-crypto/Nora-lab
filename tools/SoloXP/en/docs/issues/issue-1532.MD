---
issue: 1532
title: "[Enhancement] xp_doc_spec/UnitTests/FunctionTests/E2ETests only supports api/<EpicName>/ fixed path, and spec/test document generation for non-api epics does not work."
state: closed
labels: [enhancement]
author: noragrammer-crypto
created_at: 2026-06-20T03:20:22Z
epic: SoloXP
---

# #1532 [Enhancement] xp_doc_spec/UnitTests/FunctionTests/E2ETests supports only the api/<EpicName>/ fixed path and spec/test document generation for non-api epics does not work.

## Body

## How it was discovered

When checking the target of `xp_doc_spec` in the Documenter step of #1528 (CodeCompass test directory unification), it was incorrectly determined that "`spec/` directory does not exist, so it is not targeted." In reality, `CodeCompass/docs/spec/` exists, and the cause of the misjudgment was the pass assumption on the skill side.

## Problem

The following four skills under `dotfiles/.claude/skills/` have their document output destination/scan target fixed to `api/<EpicName>/...`:

| Skill | Applicable location |
|---|---|
| `xp_doc_spec` | `api/<EpicName>/docs/spec/README.md` etc. (dotfiles/.claude/skills/xp_doc_spec/SKILL.md:20,29,40,46,47) |
| `xp_doc_UnitTests` | `api/<EpicName>/tests/unit/`, `api/<EpicName>/docs/tests/UnitTests/` (same SKILL.md:19,23,30) |
| `xp_doc_FunctionTests` | `api/<EpicName>/tests/functional/`, `api/<EpicName>/docs/tests/FunctionTests/` (same SKILL.md:19,23,30) |
| `xp_doc_E2ETests` | `api/<EpicName>/tests/e2e/`, `api/<EpicName>/docs/tests/E2ETests/` (same SKILL.md:19,23,30) |

However, HolyAutomater has a monorepo configuration (see CLAUDE.md) where only Vercel Function entry points are placed under `api/`, and source test documents are placed directly under the root of each epic (e.g. `CodeCompass/docs/spec/`, `CodeCompass/__tests__/`). In epics where `api/<EpicName>/` does not exist (most of CodeCompass, SocialMediaAgent, workflow, etc.), these four skills will incorrectly detect the target directory, incorrectly judge that the document does not exist even though it exists, or complete without generating the document that should have been updated.

## Reference: Skills already supported

`xp_doc_reference` addresses the same issue with a prioritized fallback (dotfiles/.claude/skills/xp_doc_reference/SKILL.md:20-26):

```
1（優先）: api/<Epic>/ が存在する場合 → api/<Epic>/docs/reference/
2: <Epic>/scripts/ が存在する場合 → <Epic>/docs/reference/
3（フォールバック）: <Epic>/ 直下の *.js/*.py → <Epic>/docs/reference/
```

## Modification policy

Add prioritized path resolution logic similar to `xp_doc_reference` to the four skills `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`:

- If `api/<Epic>/` exists, give priority to it (backward compatibility)
- If it does not exist, target directly under the epic root, such as `<Epic>/docs/spec/` `<Epic>/__tests__/`

## Scope of influence

- `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_E2ETests/SKILL.md`

## Related issues

#1528 (discovered task)
#1531 (Specific bug where this skill deficiency led to direct damage)

## Comment

### noragrammer-crypto — 2026-07-28T22:51:21Z

## Conflict check with existing implementation (manual trace)

Target: #1532

Fallback activation: Yes
Reason for triggering: The target was the Claude Skill definition file (`dotfiles/.claude/skills/*/SKILL.md`), not the application code, and it was determined that it was not the target of the codebase structure search normally assumed by the `code-architect` subagent, so manual tracing was performed directly.

**Patterns & Conventions Found:**
- `xp_doc_reference` (`dotfiles/.claude/skills/xp_doc_reference/SKILL.md:20-26`) already implemented prioritized fallback:
  1. If `api/<Epic>/` exists, it takes precedence (backward compatibility)
  2. If `<Epic>/scripts/` exists
  3. `*.js`/`*.py` directly under `<Epic>/` (fallback)
- Since the time of reporting this issue, `xp_doc_E2ETests` (`dotfiles/.claude/skills/xp_doc_E2ETests/SKILL.md:19-22`) has already been modified in a separate manner, leaving the fixed path of `api/<Epic>/` and changing to a two-choice fallback that uses the existing one of `<Epic>/tests/e2e/` or `<Epic>/__tests__/e2e/`. Only 3 files: `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests`).
- Investigation of actual repositories (CodeCompass / SocialMediaAgent / workflow / DiscordAIbot / DiscordBotDashboard): **`api/<Epic>/tests/...` and `api/<Epic>/docs/spec/` do not exist in any existing epics. ** All epics use `<Epic>/__tests__/{unit,functional,e2e}/` and `<Epic>/docs/spec/` / `<Epic>/docs/tests/{UnitTests,FunctionTests,E2ETests}/` (as per the CLAUDE.md configuration rule that `api/` is only for Vercel Function entry points).

**Architecture Decision:**
Add a prioritized fallback isomorphic to `xp_doc_reference` to the three skills `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests`:
1. If `api/<Epic>/` exists, it takes precedence (backward compatibility)2. If it does not exist, set the scan target/output destination directly under `<Epic>/` (`__tests__/unit/`, etc.)

`xp_doc_E2ETests` is already supported and is out of scope (no need to change).

Conflict: None (change as an extension of existing pattern)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:51:31Z

## E2E/spec necessity determination (Task)

Target: #1532
Issue type: Task (as this is a one-time fix that mechanically applies a single implementation pattern to 3 files, it is determined that decomposition into Stories is not necessary)
Observable behavior changes: Yes (The scanning target and document output destination of `xp_doc_spec`/`xp_doc_UnitTests`/`xp_doc_FunctionTests` have changed, and document generation will now work even for non-API epics)
Additional tasks: None

Reason: The target of the change is the Claude Skill instruction manual (`SKILL.md`) itself, and is an area where automated testing infrastructure (such as jest) does not exist, such as application code. And `xp_doc_reference` already has the same type of implementation pattern, and `xp_doc_E2ETests` has also been migrated to the same type of fallback with a separate modification (see comments in this issue). Due to mechanical horizontal deployment that does not require new design decisions, we will not issue independent E2E test suite creation tasks and functional specification update tasks, and will directly implement this issue (#1532) as a single task. Acceptance is determined by `xp_Auditor doc` (review of whether the descriptions in the three files reflect the fallback logic as intended).

Parent branch: None (issue a PR with `--base main` as the root task)

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:51:42Z

Start of work 2026-07-29 07:51 JST
[ProjectStatus: InProgress]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:51:53Z

[Tester running]

## Test execution results

Target: `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`, `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`, `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md` (and mirrors with the same name under `SoloXP/skills/`)

Verdict: Document only changes (Claude Skill instructions = Markdown. Does not include executable application code)
Processing: Skip all layers (no code under test)

- Unit Test: Skip
- Functional Test: Skip
- E2E Test: Skip (Task issue, no parent story)

[Tester completed]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:52:00Z

[Implementer running]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:53:06Z

## Implementation completed

`xp_doc_reference` / Fixed Fallback with priority isomorphic to `xp_doc_E2ETests` (1. `api/<Epic>/` priority = backward compatible → 2. Directly under `<Epic>/`) was added to the following 3 skills x 3 copies (9 files in total):

Change file:
- `SoloXP/skills/xp_doc_spec/SKILL.md`
- `SoloXP/skills/xp_doc_UnitTests/SKILL.md`
- `SoloXP/skills/xp_doc_FunctionTests/SKILL.md`
- `.claude/skills/xp_doc_spec/SKILL.md`
- `.claude/skills/xp_doc_UnitTests/SKILL.md`
- `.claude/skills/xp_doc_FunctionTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md`

Changes (common to all 3 skills):
- Added the step "Determine the target directory" to the beginning, and if `api/<Epic>/...` exists, it will be given priority (backwards compatibility), if it does not exist, `<Epic>/...` (location actually used by actual epics: `__tests__/unit/`, `__tests__/functional/`, `docs/spec/`) was changed to be the scan target/output destination.
- The text of the subsequent steps will be consistent with expressions that refer to the determined directory.

Test results:
- Unit test: Not applicable (Claude Skill instructions = Markdown only changes, no executable code. See tester comments)
- Functional testing: Not applicable (same as above)

[Implementer completed]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:53:31Z

[Auditor test running]

Applies to: `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` `SKILL.md` (Claude Skill instructions, no executable application code)
Test execution: Not applicable (because there is no code change targeted by xp_RunTestSuites. Tester's judgment "change only document → skip all layers" is confirmed)

Difference review results:
- `api/<Epic>/` Priority → `<Epic>/` The two-step logic of direct fallback has been added correctly for all three skills.
- The fallback destination paths (`<Epic>/__tests__/unit/`, `<Epic>/__tests__/functional/`, `<Epic>/docs/spec/`) are consistent with the existing `xp_doc_reference` design concept (see Architect comments) and the actual repository survey results.
- Verified that the three copies of `SoloXP/skills/` / `.claude/skills/` / `dotfiles/.claude/skills/` are byte-for-byte matched
- Existing `api/<Epic>/` preferred path is maintained and backwards compatible

No problem.

[Auditor GREEN]
Rationale: Automated testing is not applicable as it is only a document change. A differential review confirmed that the implementation was as intended.

---_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:53:40Z

Work completed 2026-07-29 07:53 JST / Required time: 2 minutes

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:55:31Z

[Documenter running]

## Document generation completed

Generated/updated files:
- `SoloXP/docs/issues/issue-1532.MD` (new creation — xp_issue2md)
- `SoloXP/docs/spec/xp_doc_generation.md` (Newly created — xp_doc_spec: Record the path resolution priority of the `xp_doc_*` family of document generation skills as a specification)
- `SoloXP/docs/spec/README.md` (updated — added `xp_doc_generation.md` to index)

No changes (because there is no target code):
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests` (epic: SoloXP) — What was changed in this task Only SKILL.md under `.claude/skills/`, `dotfiles/.claude/skills/`, `SoloXP/skills/` has been changed, and the application codes such as `SoloXP/lib` and `SoloXP/__tests__` have not been changed, so there are no differences in the scan targets.

[Documenter completed]

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:55:56Z

[Checking Auditor document]

### Document check results
- spec/README.md: OK (line `xp_doc_generation.md` added to index, linked file name matches)
- spec/xp_doc_generation.md: OK (new creation. API/priority → fallback resolution order and specific path for each target skill are recorded. This is not empty content)
- reference/: N/A (This task only changes SKILL.md and does not change the SoloXP application code. No target code)
- issue2md log: OK (`SoloXP/docs/issues/issue-1532.MD` exists. 8 comments at the time of Documenter execution have been recorded. The number of comments on GitHub at the time of this check is 9, but the difference is 1 completion report comment from Documenter itself, and it is not judged as obsolete because it is a self-referential comment added after log generation)

[Auditor doc OK]
xp_Director issues a PR.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### noragrammer-crypto — 2026-07-28T22:56:47Z

[PR issued #2456]
[ProjectStatus: Done]

PR: https://github.com/noragrammer-crypto/HolyAutomater/pull/2456 (`--base main`, `Closes #1532`)
GitHub will auto-close after merging. Please wait for owner to merge.

---
_Generated by [Claude Code](https://claude.ai/code)_

---
