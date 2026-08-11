---
issue: 1008 title: "[Task] kakuyomu_post_ab eval injection fix" state: open labels: [task, epic/workflow] author: noragrammer-crypto created_at: 2026-05-15T22:25:56Z epic: workflow
---

# #1008 [Task] kakuyomu_post_ab eval injection fix

## Body

## overview
`kakuyomu_post_ab` Correct the text input example in SKILL.md.

Current code example:
```bash
npx agent-browser --session-name kakuyomu eval "
  const textarea = document.querySelector('textarea[name=body]');
  if (textarea) { textarea.value = \`$(cat /path/to/story.md)\`; textarea.dispatchEvent(new Event('input', {bubbles:true})); }
"
```

If you expand shell variables with `$(cat /path/to/story.md)` and inject manuscript text containing backticks or `${...}` directly into a template literal, the following error occurs:
- Backquote → JavaScript template literal closes prematurely
- `${...}` → evaluated as a JavaScript expression
- double quote → outer bash quote closes

## Modification policy
1. JSON escape the body with `node -e` or `printf '%s'` in the shell
2. Use the string decoded with `JSON.parse(...)` for JavaScript eval

Example of modification:
```bash
BODY_JSON=$(node -e "const fs=require('fs'); process.stdout.write(JSON.stringify(fs.readFileSync('/path/to/story.md','utf8')))")
npx agent-browser --session-name kakuyomu eval "
  const textarea = document.querySelector('textarea[name=body]');
  if (textarea) { textarea.value = JSON.parse($BODY_JSON); textarea.dispatchEvent(new Event('input', {bubbles:true})); }
"
```

## estimate
1pt — SKILL.md example code modification

## Dependencies
Start this task after completing #1007. (Start after the [Auditor GREEN] comment is recorded in the dependent sub-issue)

depends_on: #1007

## Parent story
#822

## Parent branch
feature/issue-822

## comment

### noragrammer-crypto — 2026-05-15T23:27:03Z

Start of work 2026-05-15 23:27

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-15T23:27:18Z

[Tester running]

---

### noragrammer-crypto — 2026-05-15T23:28:22Z

## Test execution results

### Unit Test
Test file: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.unit.test.js` Results: 3 PASS / 1 FAIL

Proposition check:
- [ ] [RED] The eval example in SKILL.md does not include a pattern that directly injects `$(cat ...)` into a template literal (**Currently FAIL: Bug existence confirmed → GREEN** after fixing)
- [x] [GREEN/Bug Proof] Directly injecting a body containing backticks into a template literal causes a JS syntax error.
- [x] [GREEN/Bug Proof] If a body containing ${...} is directly injected into a template literal, it will be evaluated as a variable reference.
- [x] [GREEN/Bug Proof] Body containing double quotes breaks outer shell quotes.

### Functional Test
Test file: `SoloXP/__tests__/issue-822-kakuyomu-post-ab-eval-injection.functional.test.js` Results: 11 PASS / 0 FAIL

### E2E Test
Skip: SKILL.md Document modification only, not eligible for E2E

**Handover to Implementer:**
- Fixed target: `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`
- Change `textarea.value = \`$(cat /path/to/story.md)\`` around line 139 to JSON escape method
- Check that RED of Unit test becomes GREEN after modification

---

### noragrammer-crypto — 2026-05-15T23:28:27Z

[Tester completed]

---

### noragrammer-crypto — 2026-05-15T23:29:32Z

## Implementation completed

Change file:
- `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`: Corrected the example text input on lines 136-140.

  **Before change (dangerous):**
  ```bash
  npx agent-browser --session-name kakuyomu eval "
    const textarea = document.querySelector('textarea[name=body]');
    if (textarea) { textarea.value = \`$(cat /path/to/story.md)\`; ... }
  "
  ```

  **After change (safe):**
  ```bash
  BODY_JSON=$(node -e "const fs=require('fs'); process.stdout.write(JSON.stringify(fs.readFileSync('/path/to/story.md','utf8')))")
  npx agent-browser --session-name kakuyomu eval "
    const textarea = document.querySelector('textarea[name=body]');
    if (textarea) { textarea.value = JSON.parse($BODY_JSON); ... }
  "
  ```

Test results:
- Unit test: 4 PASS / 0 FAIL (RED before modification changed to GREEN)
- Functional test: 11 PASS / 0 FAIL

---

### noragrammer-crypto — 2026-05-15T23:29:35Z

[Implementer completed]

---

### noragrammer-crypto — 2026-05-15T23:30:28Z

[Auditor test running]

---

### noragrammer-crypto — 2026-05-15T23:30:41Z

[Auditor GREEN]

**Unit test**: PASS 70 cases / FAIL 0 cases (RED test of #822 changed to GREEN)
**Functional test**: PASS 17 / FAIL 0

Acceptance criteria achieved for fix task #1008. Removed the dangerous pattern `` `$(cat ...)` `` from `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` and replaced it with a safe alternative to JSON escaping.

---
