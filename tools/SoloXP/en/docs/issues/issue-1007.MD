---
issue: 1007 title: "[Task] Add bug reproduction test" state: open labels: [bug, task, epic/workflow] author: noragrammer-crypto created_at: 2026-05-15T22:25:42Z epic: workflow
---

# #1007 [Task] Bug reproduction test added

## Body

## overview
Add a test case that reproduces reported bug #822. `kakuyomu_post_ab` The eval example in SKILL.md proves that `$(cat /path/to/story.md)` fails when the body contains backticks or `${...}`.

Test first to prove the existence of bugs and set acceptance criteria for fix tasks.

## estimate
1pt — Design and create reproduction tests

## Dependencies
None (can be started immediately / must be performed before the correction task)

## Parent story
#822

## Parent branch
feature/issue-822

## remarks
task_type: bug_reproduction_test xp_Director should process this task with xp_UnitTest + xp_FunctionalTest.

## comment

### noragrammer-crypto — 2026-05-15T22:29:31Z

Start of work 2026-05-15 22:28

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-15T22:29:43Z

[Tester running]

---

### noragrammer-crypto — 2026-05-15T22:32:06Z

## Test proposition (Unit)

- [ ] [RED] The eval example in SKILL.md does not include a pattern that directly injects `$(cat ...)` into a template literal (after modification GREEN)
- [ ] [GREEN/Bug Proof] Directly injecting a body containing backticks into a template literal causes a JS syntax error.
- [ ] [GREEN/Bug Proof] If the body containing `${...}` is directly injected into a template literal, it will be evaluated as a variable reference.

## Test proposition (Functional)

- [ ] [RED] buildEvalSafe (function after modification) can safely handle body containing backticks (GREEN after modification)
- [ ] [GREEN/Bug Proof] To prove by simulation that backquotes destroy JS with direct injection equivalent to shell variable expansion.

---

### noragrammer-crypto — 2026-05-15T23:04:38Z

## Test execution results

### Unit Test
Test file: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.unit.test.js` Results: 3 PASS / 1 FAIL

Proposition check:
- [ ] [RED] The eval example in SKILL.md does not include a pattern that directly injects `$(cat ...)` into a template literal (**Currently FAIL: Bug existence confirmed**)
- [x] [GREEN/Bug Proof] Directly injecting a body containing backticks into a template literal causes a JS syntax error.
- [x] [GREEN/Bug Proof] When a body containing `${...}` is directly injected into a template literal, it is evaluated as a variable reference.
- [x] [GREEN/Bug Proof] Body containing double quotes breaks shell quotes.

### Functional Test
Test file: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.functional.test.js` Results: 8 PASS / 0 FAIL

Proposition check:
- [x] [GREEN/Bug Proof] Direct injection of a real file containing backquotes results in a JS error.
- [x] [GREEN/Reference Implementation] Make sure that buildEvalSafe (JSON escape method) handles various special characters safely.

### E2E Test
Skip: for `bug_reproduction_test` task

---

**Bug reproduction test completed**: Confirmed that the test is RED. Defined acceptance criteria for fix task (#1008).

**Amended acceptance criteria**:
- Remove `` `$(cat /path/to/story.md)` `` pattern from `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`
- Write safe alternatives with JSON escaping methods (`JSON.stringify` + `JSON.parse`)
- 1 RED unit test becomes GREEN

---

### noragrammer-crypto — 2026-05-15T23:04:42Z

[Tester completed]

---

### noragrammer-crypto — 2026-05-15T23:05:14Z

[Auditor test running]

---

### noragrammer-crypto — 2026-05-15T23:06:23Z

[Auditor GREEN]

Bug reproduction test completed: Verify test is RED. Defined acceptance criteria for fix task #1008.

### Test execution results

**Unit test**: 69 PASS / 1 FAIL (intentional RED)
**Functional test**: PASS 17 / FAIL 0

### FAIL analysis (intentional RED)

**Test name**: `The eval example in SKILL.md does not contain a pattern that injects $(cat ...) directly into a template literal`
- Scope: within current task #1007
- Decision: **Intentional RED** — Correct behavior for `bug_reproduction_test` task.
- Evidence: Proved that `` `$(cat /path/to/story.md)` `` exists in `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` line 139. Fixed task #1008 becomes GREEN after completion.

### Acceptance criteria for fix task #1008

When we remove the dangerous pattern `` `$(cat ...)` `` from SKILL.md and add a safe alternative to JSON escaping, the Unit test changes from RED to GREEN.

---

### noragrammer-crypto — 2026-05-15T23:06:37Z

[Documenter running]

---
