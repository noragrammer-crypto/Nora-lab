---
issue: 1532 title: "[Enhancement] xp_doc_spec/UnitTests/FunctionTests/E2ETests only supports api/<EpicName>/ fixed path and spec/test documentation generation for non-api epics does not work" state: open labels: [enhancement] author: noragrammer-crypto created_at: 2026-06-20T03:20:22Z epic: SoloXP
---

# #1532 [Enhancement] xp_doc_spec/UnitTests/FunctionTests/E2ETests supports only the api/<EpicName>/ fixed path and spec/test document generation for non-api epics does not work.

## Body

## How it was discovered

When checking the target of `xp_doc_spec` in the Documenter step of #1528 (CodeCompass test directory unification), it was incorrectly determined that “the `spec/` directory does not exist, so it is not targeted.” Actually, `CodeCompass/docs/spec/` exists, and the cause of the misjudgment was the path assumption on the skill side.

## Problem

The following four skills under `dotfiles/.claude/skills/` fix the document output destination/scan target to `api/<EpicName>/...`:

| Skill | Applicable location |
|---|---|
| `xp_doc_spec` | `api/<EpicName>/docs/spec/README.md` etc. |
| `xp_doc_UnitTests` | `api/<EpicName>/tests/unit/`、`api/<EpicName>/docs/tests/UnitTests/` |
| `xp_doc_FunctionTests` | `api/<EpicName>/tests/functional/`、`api/<EpicName>/docs/tests/FunctionTests/` |
| `xp_doc_E2ETests` | `api/<EpicName>/tests/e2e/`、`api/<EpicName>/docs/tests/E2ETests/` |

However, HolyAutomater has a monorepo configuration where only Vercel Function entry points are placed under `api/` (see CLAUDE.md), and source test documents are placed directly under the root of each epic (e.g. `CodeCompass/docs/spec/`, `CodeCompass/__tests__/`). For epics where `api/<EpicName>/` does not exist (most of CodeCompass, SocialMediaAgent, workflow, etc.), these four skills will incorrectly detect the target directory, incorrectly judge that the document does not exist even though it exists, or complete without generating the document that should have been updated.

## Reference: Skills already supported

`xp_doc_reference` addresses the same problem with a prioritized fallback:

```
1 (preferred): if api/<EpicName>/ exists → api/<EpicName>/docs/reference/
2: If <EpicName>/scripts/ exists → <EpicName>/docs/reference/
3 (Fallback): *.js/*.py directly under <EpicName>/ → <EpicName>/docs/reference/
```

## Modification policy

Add prioritized path resolution logic similar to `xp_doc_reference` to the four skills `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`.

## Scope of influence

- `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md`
- `dotfiles/.claude/skills/xp_doc_E2ETests/SKILL.md`

## Related issues

#1528 (discovered task)
#1531 (Specific bug where this skill deficiency led to direct damage)

## comment

### noragrammer-crypto — 2026-07-28T22:51:21Z

## Conflict check with existing implementation (manual trace)

Target: #1532

Fallback activation: Yes Reason for activation: The target was not the application code but the Claude Skill definition file (`dotfiles/.claude/skills/*/SKILL.md`), and it was determined that it was not the target of the codebase structure search normally assumed by the `code-architect` subagent, so manual tracing was performed directly.

**Patterns & Conventions Found:**
- `xp_doc_reference` already implements prioritized fallback
- Since the time of reporting this issue, `xp_doc_E2ETests` has already changed from the fixed path `api/<EpicName>/` to `api/<EpicName>/`, and has been changed to a two-choice fallback that uses the existing `<EpicName>/tests/e2e/` or `<EpicName>/__tests__/e2e/` (the one that has not been started is `xp_doc_spec` / Only 3 files: `xp_doc_UnitTests` / `xp_doc_FunctionTests`)
- Real repository reality check (CodeCompass / SocialMediaAgent / workflow / DiscordAIbot / DiscordBotDashboard): `api/<EpicName>/tests/...` and `api/<EpicName>/docs/spec/` do not exist in any existing epics.

**Architecture Decision:**
Add a prioritized fallback isomorphic to `xp_doc_reference` to the three skills `xp_doc_spec` / `xp_doc_UnitTests` / `xp_doc_FunctionTests`. `xp_doc_E2ETests` is already supported and is out of scope (no need to change).

Conflict: None (change as an extension of existing pattern)

---

### noragrammer-crypto — 2026-07-28T22:51:31Z

## E2E/spec necessity determination (Task)

Target: #1532 Issue type: Task (as this is a one-time fix that mechanically applies a single implementation pattern to three files, decomposition into stories is not necessary) Observable behavior changes: Yes Additional tasks: None

Reason: The target of the change is the Claude Skill instruction manual (`SKILL.md`) itself, and is an area where automated testing infrastructure (such as jest) does not exist, such as application code. And `xp_doc_reference` already has the same type of implementation pattern, and `xp_doc_E2ETests` has also been migrated to the same type of fallback with a separate modification. Due to mechanical horizontal deployment that does not require new design decisions, we will not issue independent E2E test suite creation tasks and functional specification update tasks, and will directly implement this issue (#1532) as a single task. Acceptance judgment is done using `xp_Auditor doc`.

Parent branch: None (issue PR with `--base main` as root task)

---

### noragrammer-crypto — 2026-07-28T22:51:42Z

Work started 2026-07-29 07:51 JST [ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-28T22:51:53Z

[Tester running]

## Test execution results

Targets: `dotfiles/.claude/skills/xp_doc_spec/SKILL.md`, `dotfiles/.claude/skills/xp_doc_UnitTests/SKILL.md`, `dotfiles/.claude/skills/xp_doc_FunctionTests/SKILL.md` (and `SoloXP/skills/` (subordinate mirror with the same name)

Verdict: Change only the document (Claude Skill instructions = Markdown. Does not include executable application code) Processing: Skip all layers (no code to be tested)

[Tester completed]

---

### noragrammer-crypto — 2026-07-28T22:52:00Z

[Implementer running]

---

### noragrammer-crypto — 2026-07-28T22:53:06Z

## Implementation completed

`xp_doc_reference` / Modified Fallback with priority isomorphic to `xp_doc_E2ETests` (1. `api/<EpicName>/` priority = backward compatible → 2. directly under `<EpicName>/`) was added to the following 3 skills x 3 copies (9 files in total):

- `SoloXP/skills/xp_doc_spec/SKILL.md`, `xp_doc_UnitTests/SKILL.md`, `xp_doc_FunctionTests/SKILL.md`
- 3 files with the same name under `.claude/skills/`
- 3 files with the same name under `dotfiles/.claude/skills/`

Test results: Neither unit nor functional tests are included (changes in documentation only)

[Implementer completed]

---

### noragrammer-crypto — 2026-07-28T22:53:31Z

[Auditor test running]

Difference review results:
- `api/<EpicName>/` priority → `<EpicName>/` 2-stage fallback logic has been added correctly for all 3 skills.
- The fallback destination path is consistent with the existing `xp_doc_reference` design concept and the actual repository survey results.
- 3 copies verified to match byte for byte
- Existing `api/<EpicName>/` preferred path is maintained and backwards compatible.

[Auditor GREEN] Rationale: Automated testing is not applicable as this is only a document change. A differential review confirmed that the implementation was as intended.

---

### noragrammer-crypto — 2026-07-28T22:53:40Z

Work completed 2026-07-29 07:53 JST / Required time: 2 minutes

---
