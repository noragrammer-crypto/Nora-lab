# How to use tutorial

The series of steps from filing the first issue to `xp_Director` execution and PR merge will be explained with examples. It is assumed that [Installation Manual](./install.md) and [Setup Manual](./setup.md) have been completed.

## Big picture

```
Issue creation (you)
    ↓
/xp_Director <issue number>
    ↓
xp_Tester → xp_Implementer → xp_Auditor（test）→ xp_Documenter → xp_Auditor（doc）
    ↓
[Auditor GREEN] Comments are recorded in the issue
    ↓
PR will be automatically issued
    ↓
You check and merge the PR
```

One small issue with the `[Task]` tag can be completed with one `xp_Director` execution using the above flow (1 task, 1 PR rule). In the case of `[Story]` or `[Bug]`, xp_Architect breaks it down into sub-issues and then repeats the same process (see [WORKFLOW.md](../../WORKFLOW.md) for details).

## Example: Extracting duplicate date format processing into a common function

`xp_Director` does not bypass Architect and may additionally issue a subtask equivalent to E2E/spec even if the issue is tagged with `[Task]`, if it involves a change in behavior that can be observed from the user/externally (addition/change of API, UI, output content, etc.) (``Observable change check'' in [WORKFLOW.md](../../WORKFLOW.md)). The first one is an example of **internal refactor only** (no change in behavior) that is not caught by this gate.

### 1. Create an issue (you)

```bash
gh issue create \
  --title "[Task] Extract duplicate code for date display processing into common functions" \
  --body "## background
Almost the same date format processing (YYYY-MM-DD formatting) is duplicated in multiple locations.

## Things to do
- Add \`formatDate(date)\` to \`lib/dateFormat.js\`
- Replace each duplicate call with a call to \`formatDate(date)\`
- Do not change externally visible output/behavior (internal organization only)

## Acceptance conditions
- [ ] All existing tests continue to pass (guarantee that the output has not changed)
- [ ] \`formatDate\` Add unit test for single "
```

`gh issue create` can be executed from anywhere, including the web version of Claude Code, the terminal, and the GitHub app on your smartphone. The development target is determined the moment the application is submitted (delta approach).

Note the issued issue number (below it will be `#101`).

### 2. Run `xp_Director`

Enter the following in Claude Code.

```
/xp_Director 101
```

This time, since ``only internal refactoring is done, external behavior is not changed'', the observable change check is determined to be ``none'', and as per the `[Task]` tag, Architect is bypassed and the task processing flow is entered as is. During execution, progress comments are piled up on the issue:

```
## Observable change check ([Task] Skip judgment)
Target: #101
Observable behavior changes: None
Reason: Existing date format processing is simply extracted into a common function, output and external interface are not changed.

[Running Tester] Creating test suite...
[Tester completed] Add tests/unit/dateFormat.test.js (4 cases)

Start of work 2026-08-08 10:00 JST

[Implementer running] We are implementing a green test...
[Implementer completed] Implemented lib/dateFormat.js and replaced existing calls.

[Running Auditor test] Re-running and analyzing the test from an independent perspective...
[Auditor GREEN] All 4 cases pass. No regression in existing tests. Verify that the implementation meets the test intent.

[Documenter running] Generating spec/reference/tests documentation...
[Documenter completed] Updated docs/spec/dateFormat.md, docs/reference/dateFormat.md

[Checking Auditor documentation] Checking consistency of spec/reference...
[Auditor doc OK]

Work completed 2026-08-08 10:24 JST / Required time: 24 minutes

[PR issued #102]
```

(The actual comment wording and granularity will vary slightly depending on the skill version. The above is an example to get a sense of the flow)

Unlike this example, if the task involves adding or changing API/UI/output content, it will be determined that there is a change in observable behavior, and `xp_Architect` will be called to issue an additional E2E/spec subtask. In that case, it will not be a one-shot flow like the one above, but will be a flow that processes multiple sub-issues in order, similar to Story/Bug in [WORKFLOW.md](../../WORKFLOW.md).

### 3. Check your PR (you)

```bash
gh pr view 102
gh pr diff 102
```

The PR text includes the corresponding issue (`Closes #101`), changes, and test results. If there is no problem with the difference, merge.

```bash
gh pr merge 102 --squash --delete-branch
```

Adding `--delete-branch` ensures that both remote and local branches are deleted after merging (see [Branch deletion rules](../../CLAUDE.md.template)). If "Automatically delete head branches" is enabled in the repository settings, the remote side will be automatically deleted, but it is safe to add this flag to ensure deletion without depending on the settings.

Issue #101 is now closed and one cycle is complete.

### 4. Go to next issue

If you run `/xp_Director` without any arguments, it will automatically select the next issue to be processed from among the open issues.

```
/xp_Director
```

## In case of `[Story]`/`[Bug]` (development)

When you raise an issue with `[Story]` (adding functionality across multiple tasks) or `[Bug]` (bug fixing), `xp_Architect` breaks down the implementation into sub-issues and creates a `feature/issue-{number}` branch. After that, run `/xp_Director <subissue number>` for each subissue individually, and when all subissues become `[Auditor GREEN]` (or `[Auditor doc OK]` in the case of the `spec_update` task), `feature/issue-{number}` → PR for the default branch will be issued.

For detailed role allocation, dependency resolution, and retry control, refer to [WORKFLOW.md](../../WORKFLOW.md).

## If you stumble

- `gh` authentication/authorization error → Re-check sections 1 and 2 of [Setup manual](./setup.md)
- The skill does not appear as a candidate → Reconfirm Section 2 (Skill Registration) of [Installation Manual](./install.md)
- Unexpected behavior → Check if the contents of `CLAUDE.md.template` are correctly reflected in `CLAUDE.md`.
  (The placeholder `<...>` is not filled in, the description itself is missing, etc.)
