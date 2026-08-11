# SoloXP Functional Specification Index

## Skill specifications

| File | Target skills | Overview |
|---|---|---|
| [xp_plan.md](xp_plan.md) | xp_plan | Story card task decomposition and estimation (verifies required) |
| [xp_architect.md](xp_architect.md) | xp_Architect | Issue type classification (observability axis), sub-issue issuance, E2E/spec mandatory determination |
| [xp_auditor.md](xp_auditor.md) | xp_Auditor | Test execution/quality audit/sub-issue completion report |
| [xp_director.md](xp_director.md) | xp_Director | Including xp_Reviewer call after AllGREEN, E2E/PR issue/close flow |
| [xp_reviewer.md](xp_reviewer.md) | xp_Reviewer | Code review, high-risk automatic filing, execution after AllGREEN and before PR issuance |
| [xp_review_workflow.md](xp_review_workflow.md) | xp_review_workflow | Workflow review, deviation detection, cause SKILL identification |
| [xp_doc_generation.md](xp_doc_generation.md) | xp_doc_reference / xp_doc_spec / xp_doc_UnitTests / xp_doc_FunctionTests / xp_doc_E2ETests | Prioritized resolution of document generation target/output destination directories (api/<EpicName> priority → fallback, #1532) |

## SoloXP originalization/publication pipeline (#2168)

| File | Overview |
|---|---|
| `docs/skill-files-sync.md` (Path in the monorepo. Since it is outside the Nora-lab public range, the path is not a link) | Original (`SoloXP/skills/xp_*` + `workflow/skills/*`) → binary (`dotfiles/.claude/skills/`・`.claude/skills/`) synchronization direction/pre-push hook mechanism (Phase1/2) |
| [nora_lab_publish.md](nora_lab_publish.md) | Nora-lab publishing pipeline using `make sync-nora-lab` + `make publish-nora-lab` (snapshot/diff commit method based on public HEAD standards) (Continuous sync method redesigned in Phase 3, #2761) |

## Work log/measurement skills

| File | Target skills | Overview |
|---|---|---|
| [xp_worklog.md](xp_worklog.md) | xp_worklog | Aggregation of work time/token consumption, report output, worklog storage (aggregation by issue #2143, ROI aggregation by epic #2144) |

## Development principles

| File | Overview |
|---|---|
| [tdd_principles.md](tdd_principles.md) | Solo XP TDD development principles (bug fixes, one-task one PR, simultaneous document updates, token consumption records, etc.) |

## Related documents

- [README.md](../../README.md) — SoloXP overview/features/document list (for first-time users, start here)
- [CLAUDE.md.template](../../CLAUDE.md.template) — A set of settings required for `CLAUDE.md` to run Solo XP with a new repository
- [WORKFLOW.md](../../WORKFLOW.md) — Overall workflow
- [tests/E2ETests/](../tests/E2ETests/) — E2E acceptance test
- [history/memo/](../history/memo/) — Initial design phase study materials/ADR (**Please do not refer to it as an operational document as it deviates from the current implementation**. `ARCHITECTURE.md` etc. have been saved here)

## Regarding specifications for non-xp_ skills (#2637)

`SoloXP/docs/spec/` is a directory dedicated to specifications for xp_* skills under `SoloXP/skills/`. Specifications for non-xp_ skills/plugins, such as ProcessIssue, NovelGeneratorRun, issue-triage-agent, ops-meeting, kakuyomu_post, kakuyomu_post_ab, feature-dev plug-ins, have been moved to the following locations according to the actual destination of each skill. These files are specific to the HolyAutomater monorepo and are not included in Nora-lab (only `SoloXP/` + `workflow/skills/ProcessIssue` is exposed), so they are listed as paths within the monorepo rather than links (#2643):

- ProcessIssue: `workflow/docs/spec/process-issue.md`
- issue-triage-agent: `workflow/docs/spec/issue-triage-agent-skill.md`
- ops-meeting: `workflow/docs/spec/ops-meeting-skill.md`
- kakuyomu_post: `workflow/docs/spec/kakuyomu-post-skill.md`
- kakuyomu_post_ab: `workflow/docs/spec/kakuyomu-post-ab-skill.md`
- feature-dev plugin: `workflow/docs/spec/feature-dev-plugin.md`
- NovelGeneratorRun: `AINovelGenerator/docs/spec/novel_generator_run.md` (originally moved in #404)
