# Solo XP TDD development principles

## overview

Development in Solo XP is based on test-driven development (TDD). Agents and developers must adhere to the principles defined herein.

---

## List of principles

### 1. Bug fixes can be completed in one task

Bug fixes can be completed from test creation to GREEN in one task and one PR. Don't separate bug reproduction testing and fixing into separate tasks.

### 2. Be sure to capitalize and commit bug reproduction tests

Be sure to commit tests that reproduce the bug and turn them into assets. Record the fact that it was ``reproducible'' as a code.

### 3. One Task One PR

One PR will be issued for each completed task. Do not promote multiple tasks at once.

### 4. When changing the code, update the document at the same time (code is correct)

If you change the implementation, update the documentation with the same PR.
**Code is correct**. Documentation follows code.

### 5. Be aware of the integration of requirements from the entire issue group

Implementation decisions are made based on a bird's-eye view of what the entire issue group is looking for, not just individual issues.

### 6. Don't use process.exit in test files

Do not call `process.exit()` inside a Jest test file. Because the Jest worker process is killed and other test suites cascade fail.

```js
// ❌ Forbidden
if (failures > 0) process.exit(1);

// ✅ Use Jest native failure mechanism
if (failures > 0) {
  throw new Error(`${failures} tests failed`);
}
// or native notation using expect() / it() / test()
```

### 7. Do not assert SKILL.md text (structure/contract testing principle)

Tests that assert the text, heading numbers, and code block text of SKILL.md as they are using `toContain` / regular expressions are prohibited. SKILL.md is subject to review of the wording and structure each time the specification is improved, and the wording test becomes a "copy of the implementation" that breaks every time the specification is improved (examples include #1313, #1279, #1294, etc.).

**❌ Patterns to avoid**:
- Fix specific Japanese text/paragraph/code block body with `expect(content).toContain('...')`
- Extract sections using regular expressions depending on the heading number (`### 3.` etc.)
- Compare the entire contents of a code block as a string

**✅ Patterns to adopt (structure/contract verification)**:
- Schema validation of frontmatter (`model:` / `persona:` etc.)
- "Existence" verification of required sections (flexible match of keywords instead of heading numbers)
- Check the existence of reference file path (`fs.existsSync`)
- Index consistency between documents (such as whether the files listed in the README actually exist)
- `dotfiles/.claude/skills/` generated from the original book (`SoloXP/skills/xp_*` + `workflow/skills/*`, total 38 skills)
  Confirm that the entries on the `.claude/skills/` side match the contents of the corresponding original (updated to the expression after reversing the synchronization direction in #2168/#2639/#2640). Since `.claude/skills/` also contains non-target skills (approximately 11 skills such as `wiki_ingest` and `NovelGeneratorRun`) that do not have the original copy, the comparison target is limited to the 38 skill entries generated from the original copy (see `docs/skill-files-sync.md` ``Excluded Skills'' section)

**Rejection/rewriting judgment flow**:
1. If the test relies on text/heading numbers, consider whether it is possible to redefine the contract you want to verify.
   - If the contract is "existence of section", rewrite it to a flexible match of the heading keyword
   - If the contract is ``the text of specific operating procedures'', give up on guarantees based on testing,
     SKILL.md Leave the test to the responsibility of the reviewer (Auditor/human) and delete the test.
2. When it is necessary to guarantee the wording itself (procedural statements that cannot be removed for operational reasons),
   Leave it explicitly as a "word test" and make it an operational rule to update with the same PR when changing SKILL.md

### 8. Add token consumption to the work completion comment (optional)

By adding the following line immediately after the `work completed` comment, you can track the AI ​​consumption cost for each issue on the GitHub timeline.

```
Work completed YYYY-MM-DD HH:MM JST / Required time: XX minutes
tokens: prompt=XXXk completion=XXXk total=XXXk
model: <model-id>
```

- `tokens:` / `model:` can be omitted (add it only if it can be recorded)
- `Start work` Do not add to comments (only when completed)
- If the format is broken, do not auto-complete and ask the user (same operation as timestamp)
- `/xp_worklog` parses this format and generates an Epic-based ROI summary (after implementing #1461)

**Definition of formatting corruption:**
- The value of `tokens:` is not in the format `prompt=XXXk completion=XXXk total=XXXk`
- `model:` value is blank or a string that cannot be interpreted as a model ID

**Parent issue:** #1461 (AI development cost visualization — issue-based token consumption tracking)

---

## Applicable scope

- Complete Solo XP workflow
- Implementation tasks by xp_Implementer
- Progress management with xp_Director
- Bug determination by xp_Auditor (handled as a bug in another task scope)

---

## reference

- CLAUDE.md "TDD Development Principles" section (root project definition)
- [xp_director.md](xp_director.md) — 1 task 1 PR rule implementation
- [xp_auditor.md](xp_auditor.md) — Scope determination/bug issue issue
