---
model: claude-fable-5
---

# XP Documenter Codex Skill

## Command

### `xp_DocumenterCodex <epic_name> <issue_number>`

Replacement for `xp_Documenter`. **Delegating network (GitHub API) independent parts of documentation generation to Codex CLI (`codex exec`)**. Claude will continue to handle the parts that require the GitHub API (obtaining issue texts and comments).

> **Caller**: Called from `xp_Director <issue number> implementer=codex` instead of `xp_Documenter`.

---

## Responsibilities

- `xp_issue2md` / `xp_doc_spec` (GitHub API dependent) is executed by Claude himself
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests` (locally complete) is bulk delegated to Codex CLI
- After completion, it will be handed over to xp_Auditor (doc mode) (As Auditor independently re-inspects the file existence and contents, it does not depend on the accuracy of the report content of this skill)

---

## Why this division?

`codex exec --sandbox workspace-write` has limited network access. `xp_issue2md` (obtains issue text and comments with `gh issue view`) and `xp_doc_spec` (also refers to the issue history and resynchronizes the `state` of the related issue table with the actual state on GitHub) cannot be delegated to Codex because they require live access to the GitHub API. On the other hand, `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests` can be completed by simply ``reading local code, test files, and existing docs, and writing markdown that reflects them'' and does not require the GitHub API, so they can be safely delegated to Codex.

---

## Operating procedure

### 0. Check before starting

Same as `xp_ImplementerCodex` (Checking Codex CLI communication, checking existence of `~/.codex/auth.json`).

### 1. Record the `[Documenter running]` marker

Log a comment on an issue:
```
[Documenter running]
Document generation agent: Claude (issue2md/spec) + Codex CLI (reference/tests)
```

### 2. Part executed by Claude himself (depends on GitHub API)

1. Run `xp_issue2md <issue_number>` as is
2. Run `xp_doc_spec <epic_name> <issue_number>` as is

All follow the steps in the existing `xp_issue2md` / `xp_doc_spec` SKILL.md (there are no changes specific to this skill).

### 3. Assembling the bulk delegation prompt to Codex

Combine the following into one prompt:

1. List of files modified by this task (output of `git diff --name-status`)
2. Request details:
   ```
Update the following documentation to reflect the code tests changed in this diff:
- Under docs/reference/: References for modified functions and classes (according to xp_doc_reference output conventions)
- Under docs/tests/UnitTests/: List of changed/added unit test cases
- Under docs/tests/FunctionTests/: List of changed/added functional test cases
- Under docs/tests/E2ETests/: List of changed/added E2E test cases (only if applicable)

First, read one or two files under the existing docs/reference/ or docs/tests/ to understand the existing format, such as heading structure and table format, and adapt it accordingly. If the corresponding document file does not exist, create a new one. Do not touch unrelated changes (code files, test files, documents unrelated to this task).
   ```
3. If `Codex.md` in the target epic directory exists, its contents
4. Explicit constraints (**must include**):
   ```
- Do not create new branches/git worktrees. Edit directly in the currently checked out branch.
- Do not change code files (scripts/ etc.) and test files (under __tests__/). Change only the documentation (under docs/).
- Do not modify documents outside the scope of this task.
   ```

### 4. Codex CLI execution

```bash
codex exec \
  --sandbox workspace-write \
--cd <absolute path of target epic directory> \
  --json \
-o /tmp/codex-doc-last-<issue number>.txt \
"<Prompt assembled in step 3>"
```

### 5. Light verification (does not use Codex self-declaration)

Verify the following with `git diff --name-status`:
- The modified file is only under `docs/` (does not touch code/test files)
- Not touching any non-target documents

Since Auditor's doc mode independently re-inspects the file content and freshness, deep content verification is not performed here (it is left to Auditor). If there is a file change that is out of scope, please comment the issue and report it to xp_Director.

### 6. Report results to xp_Director and exit

Report format isomorphic to `xp_Documenter`:

```
## Document generation completed

Generated/updated files:
- `<path>`: <Summary of contents> (by xp_issue2md / xp_doc_spec, executed by Claude himself)
- `<path>`: <Summary of contents> (by Codex CLI)
...

<If an untargeted change is found>
⚠️ Out-of-range file change detected:
- <path>: <content>
```

---

## Notes

- Claude executes `xp_issue2md` / `xp_doc_spec`, so their accuracy is guaranteed as before.
- The content of the Codex delegation (reference/tests) is limited to "light verification", and the detailed accuracy can be determined by Auditor's doc mode.
Inspect independently (file existence/content/freshness check of issue2md log is not modified)
- Codex CLI works with user's personal ChatGPT OAuth authentication (`CODEX_AUTH_JSON_B64`). Please note that it consumes the usage quota on the Codex side.
