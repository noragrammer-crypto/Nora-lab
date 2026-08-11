---
model: claude-fable-5
---

# XP Implementer Codex Skill

## Command

### `xp_ImplementerCodex <#issue number>`

Read the task issue and delegate both test creation (equivalent to Tester) and implementation (equivalent to Implementer) to Codex CLI (`codex exec`)**. If there are no existing tests, Codex will also write the tests (TDD). If there are existing tests (bug fix follow-up, etc.), only the implementation will be delegated. The completion report format is an extension of `xp_Implementer`. Aim for green unit tests and functional tests.

> **Caller**: Called by `xp_Director <issue number> implementer=codex`.
> Replacement for `xp_Tester` + `xp_Implementer` (or `xp_ImplementerCodex` older version), typically for implementation tasks
> Only applicable (excluding `e2e_test_creation` / `spec_update` / `bug_reproduction_test`).
> When `implementer=codex` is specified, Director does not call `xp_Tester` before calling this skill
> (Because this skill also includes the role of Tester).

**Boundaries held by Claude**: Architect (design/disassembly), E2E test creation (definition of acceptance conditions), Story-level acceptance judgment
Claude continues. This skill only delegates subtask level test creation and implementation.

---

## Responsibilities

- Delegate test creation (if necessary) and implementation to Codex CLI
- **Do not trust Codex self-reports.** Run the test yourself after completion and record the results
- Return to xp_Director regardless of the result (Director calls Auditor)

**It is the responsibility of the Auditor to determine the correctness of the test. This skill does not judge.**
Since Codex writes both tests and implementation, the Auditor’s independent test rerun is the only third-party check. As before, xp_Auditor must rerun the tests itself through `xp_RunTestSuites` / `xp_RunE2ETests`; this safety net is unchanged.

---

## Operating procedure

### 0. Check before starting

Same as `xp_Implementer`.

#### Check branch
- For ClaudeCode Web: Check automatically generated branches when starting a task
- Local/Codespaces: Create a working branch
  ```bash
git checkout -b feature/issue-{number}-{summary}
  ```
- **Don't start working on the main branch**
- **The `feat-<Issue number>` branch naming and `git worktree` separation rules written in `Codex.md` in the repository root / `Codex.md` in each project directory do not apply here.** These are the rules when operating Codex independently, and the existing Solo XP branch operation (this section) is prioritized in the Solo XP subtask flow.

#### Check dependent issues
- Check the issue's `depends_on` field
- If there is a dependent issue, **Check if there is `[Auditor GREEN]` in the comment of the dependent sub-issue**
- If there is no `[Auditor GREEN]`, do not start. Comment and close the issue:
  ```
⚠️ Start block: Issue #XX [Auditor GREEN] has not been recorded yet. Called again by xp_Director after completion.
  ```

#### Codex CLI communication check
- Check if CLI is available with `codex --version`
- If `~/.codex/auth.json` does not exist (`CODEX_AUTH_JSON_B64` is not set, etc.), it will not start, but will report to xp_Director and end:
  ```
⚠️ Codex CLI is not available (authentication not set). Consider falling back to xp_Implementer (Claude version).
  ```

### 1. Record markers

Record a comment on the issue (it will be known after the judgment in step 3 whether or not a new test needs to be created, so the judgment result will also be recorded):
```
[Tester running][Implementer running]
Implementation agent: Codex CLI (codex exec)
```

### 2. Load task issue

Same as `xp_Implementer`. Understand:
- Functions/processing to be implemented
- Estimate (pt/note)
- Parent story issue
- Existing tests (UnitTest/FunctionalTest)
- Epic name (taken from `epic/<EpicName>` label)

### 3. Determine whether there are existing tests

- Check if there is already a test in `<EpicName>/__tests__/` that is acceptable for this task.
(Including cases where `xp_Tester` has already created a test in the previous subtask, such as bug fix follow-up)
- **If there is an existing test (implementation only mode)**: Understand the expected behavior of the test. The prompt in step 4 only asks for implementation,
Maintain the constraint "Test files should not be modified or deleted"
- **When there is no existing test (test creation included mode)**: Understand the proposition to be verified by the test from the acceptance conditions of the issue body.
The prompt in step 4 requests both test creation (TDD) and implementation, and only in this case removes the restriction that "test files should not be modified or deleted" (because Codex becomes the author of the test)

### 4. Assembling the Codex execution prompt

Combine the following into one prompt:

1. Issue text (content to be implemented/estimate)
2. **Implementation only mode**: Tell the expected behavior of the existing test (corresponding part of the file read in step 3) and request implementation to make it GREEN.
**Test creation included mode**: Inform the acceptance conditions of the issue body, and write `<EpicName>/__tests__/unit/`・`functional/` first.
"Create a test case (make the proposition clear; don't distort the test to make it GREEN), and then implement the test to make it GREEN"
3. If `Codex.md` of the target epic directory exists, its contents (directory-specific work rules and test commands)
4. Explicit constraints (**must include**):
   ```
- Do not create new branches/git worktrees. Edit files directly in the currently checked out branch.
- Avoid excessive abstraction and future support in accordance with the style and design of the existing code.
- Do not cause security problems (injection, XSS, etc.).
- Do not modify files outside the scope of this task.
   ```
For implementation only mode, additionally:
   ```
- Do not modify or delete test files (under __tests__/).
   ```

### 5. Codex CLI execution

```bash
codex exec \
  --sandbox workspace-write \
--cd <absolute path of target epic directory> \
  --json \
-o /tmp/codex-last-<issue number>.txt \
"<Prompt assembled in step 4>"
```

- Use `--sandbox workspace-write` (no approval prompt = equivalent to full-auto; do not use `--dangerously-bypass-approvals-and-sandbox`)
- Proxy environment variables are already set on the session side, so no additional settings are required.
- Leave the execution log (`--json` output) for investigation in case of abnormal termination.

### 6. Test execution (does not use Codex self-declaration)

`xp_Implementer` Same as step 5. Don't just take the results given in the Codex completion message; do it yourself:

```bash
# unit test
npm test -- --testPathPattern="unit"

# Functional test
npm test -- --testPathPattern="functional"
```

Record the results. Whether it's GREEN or RED, move on to the next step.
**Even if you have doubts about the test, don't stop at self-judgment. Hand over to Auditor.**

### 7. Understanding the changes

```bash
git diff --name-status
```

Get a list of changed files from the output of (using the actual diff, not the Codex self-report).

### 8. Report results to xp_Director and exit

Extended the completion report format of `xp_Implementer`. In case of test creation mode, also include the list of propositions:

```
## Implementation completed

Implementation agent: Codex CLI (codex exec)
Mode: Implementation only / Test creation included

<Only for test creation mode>
## Test proposition (Unit/Functional, newly created by Codex)

- [x] <Proposition 1>
- [x] <Proposition 2>

Change file:
- `<path>`: <Change contents> (In test creation mode, the test file is also included in the changed file)

Test results:
- Unit tests: PASS n / FAIL n
- Functional test: PASS n cases / FAIL n cases

<If you have doubts about the test>
⚠️ Ask Auditor to review the following tests:
- <Test Name>: <Concern>
```

---

## Notes

- In implementation only mode, tests must not be modified or deleted for the purpose of greening the test (this should also be specified in the prompt to the Codex)
- In test authoring mode, Codex becomes the author of both the test and the implementation. **Are you distorting the test to make it self-evidently GREEN?
(Isn't the proposition empty?) Claude himself also briefly checks the changed files and test contents.
- Even if you have doubts about the test, do not stop at your own judgment and always pass it on to Auditor via xp_Director
- E2E testing is not covered by this skill (Claude's `xp_E2Etest` is in charge of defining acceptance conditions, and Claude confirms it upon Story completion)
- Codex CLI works with user's personal ChatGPT OAuth authentication (`CODEX_AUTH_JSON_B64`). Please note that it consumes the usage quota on the Codex side.
- `xp_Auditor` does not trust the completion report of this skill and reruns the test independently. Tests and implementations are written by Codex including test creation
mode, this independent re-execution is the only third-party check, so no steps on the Auditor side are omitted.
