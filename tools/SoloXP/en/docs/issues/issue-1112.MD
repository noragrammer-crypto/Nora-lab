---
issue: 1112 title: "[Task] Added bug reproduction test: Runtime execution verification test for $BODY_JSON pattern" state: open labels: [task, epic/workflow] author: noragrammer-crypto created_at: 2026-05-21T12:13:49Z epic: workflow
---

# #1112 [Task] Added bug reproduction test: Runtime execution verification test for $BODY_JSON pattern

## Body

## overview

Add a runtime operation check test for the `$BODY_JSON` pattern of `kakuyomu_post_ab/SKILL.md`, which was pointed out in Issue #1011.

`isValidJavaScript` in the existing test (`issue-822-kakuyomu-post-ab-eval-injection.unit.test.js`) is only a syntax check using `new Function(code)`. There is a lack of a test to verify that the code after expanding `textarea.value = $BODY_JSON` actually sets textarea.value correctly.

## Tests to add

### Add to unit test

Create a new `SoloXP/__tests__/issue-1011-body-json-runtime.unit.test.js`:

- Use mock `document` + `querySelector` to simulate textarea object
- If you directly assign a JSON.stringified string, the correct string will be set to `textarea.value`.
- Works correctly with the following special characters:
  - Line break (`\n`)
  - backquotes (``````)
  - double quotes (`"`)
  - `${ }` Template literal string
- The eval code example in SKILL.md has a pattern of directly assigning `$BODY_JSON` without using `JSON.parse`.

## estimate

1pt — Adding runtime execution tests

## Dependencies

None (can start immediately)

## Parent story
#1011

## Parent branch
feature/issue-1011

## remarks
task_type: bug_reproduction_test xp_Director should process this task with xp_Tester (Implementer is not required).

## comment

### noragrammer-crypto — 2026-05-22T03:53:42Z

Start of work 2026-05-22 04:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-22T03:53:46Z

[Tester running]

---

### noragrammer-crypto — 2026-05-22T03:57:44Z

## Test proposition (Unit)

- [ ] The `JSON.parse($BODY_JSON)` pattern is not included in the eval example of SKILL.md (Check SKILL.md modification)
- [ ] The eval example in SKILL.md includes the `textarea.value = $BODY_JSON` direct assignment pattern.
- [ ] Direct assignment pattern can correctly set normal text to `textarea.value` (runtime confirmation)
- [ ] The direct assignment pattern can correctly set the body including line breaks (`\n`) (runtime confirmation)
- [ ] Direct assignment pattern can correctly set the body including backticks (runtime confirmation)
- [ ] Direct assignment pattern can correctly set the body including double quotes (runtime confirmation)
- [ ] The direct assignment pattern `${ }` can be set as a template literal string without variable expansion (runtime confirmation)
- [ ] `JSON.parse($BODY_JSON)` pattern causes SyntaxError (proof of bug existence)

## Test proposition (Functional)

- [ ] The normal text is set correctly in the complete flow via the actual file (file loading → JSON.stringify → eval)
- [ ] Novel manuscripts containing special characters (line breaks, back quotes, double quotes, `${}`) are set correctly.

---

### noragrammer-crypto — 2026-05-22T03:59:09Z

## Test execution results

### Unit Test
Test file: `SoloXP/__tests__/issue-1011-body-json-runtime.unit.test.js` Results: 9 PASS / 0 FAIL

Proposition check:
- [x] The eval example in SKILL.md does not contain the `JSON.parse($BODY_JSON)` pattern.
- [x] The eval example in SKILL.md contains the `textarea.value = $BODY_JSON` direct assignment pattern.
- [x] Direct assignment pattern can correctly set normal text to `textarea.value`
- [x] Direct assignment pattern can correctly set the body containing line breaks (`\n`)
- [x] Direct assignment pattern can correctly set the body including backticks.
- [x] Direct assignment pattern can correctly set the body containing double quotes.
- [x] Direct assignment pattern allows setting of `${ }` template literal-like strings without variable expansion.
- [x] `JSON.parse($BODY_JSON)` usually raises SyntaxError on text (bug proof)
- [x] `JSON.parse($BODY_JSON)` causes a SyntaxError even if the body contains line breaks (bug proof)

### Functional Test
Test file: `SoloXP/__tests__/issue-1011-body-json-runtime.functional.test.js` Results: 3 PASS / 0 FAIL

- [x] Normal text is set correctly in full flow via real files.
- [x] Novel manuscripts containing special characters (line breaks, backquotes, double quotes, `${}`) are set correctly.
- [x] `dispatchEvent` is called correctly

Skip: E2E — unnecessary due to bug_reproduction_test

[Tester completed]

---

### noragrammer-crypto — 2026-05-22T04:00:12Z

[Auditor GREEN] PASS: unit 86 / functional 20 — No regression Test command: `cd SoloXP && npx jest --no-coverage`

All 12 new tests GREEN:
- `issue-1011-body-json-runtime.unit.test.js`: 9 items PASS
- `issue-1011-body-json-runtime.functional.test.js`: 3 items PASS

Out-of-scope bugs: None

---
