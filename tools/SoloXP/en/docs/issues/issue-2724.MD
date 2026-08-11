# Issue #2724: [Bug] pre-push.sh: New skill directory remains uncommitted/Skills deleted from the original remain on dotfiles side

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2724
- Parent story: #2168
- Parent branch: feature/issue-2168

## Body

## How it was discovered
Two complaints were received in the Codex automatic review for PR #2723 (#2639 "Reversal of synchronization direction of pre-push.sh"), but the PR was merged before the notice arrived, so it was incorporated into `feature/issue-2168` without being reflected.

## Bug details

### 1. New skill directory remains uncommitted (P1)
Final decision on `.claude/hooks/pre-push.sh` `git diff --quiet "$DOTFILES_SKILLS"` ignores untracked (new) files and directories. Skills that exist only in the original and do not yet have a mirror in `dotfiles/.claude/skills/` (currently `ProcessIssue` and `ProcessTaskIssue`) are copied using `cp`, but `git diff --quiet` determines that there are no differences, and `git add`/`git commit` does not proceed, leaving them in an untracked state (`??`). The next time it is run, `diff -rq` will determine that it has already been copied and matches, so it will not be permanently committed.

> Codex original text (PR #2723 review comment, `.claude/hooks/pre-push.sh:50`):
> "When a canonical skill has no tracked dotfiles mirror—as is currently true for `ProcessIssue` and `ProcessTaskIssue`—`cp` creates an untracked directory, but `git diff --quiet` ignores untracked paths and exits before `git add`. Running this hook in a clean worktree at the reviewed commit left exactly those two directories as `??`; subsequent runs then consider their contents synchronized and exit even earlier, so they are never committed or pushed. Check status including untracked files, or stage the copies before deciding whether there is anything to commit."

### 2. Skills deleted from the original remain on the dotfiles side (P2)
The current implementation only has a loop that enumerates and copies only `canonical_sources()` (`SoloXP/skills/xp_*` + `workflow/skills/*`), and there is no path to detect and delete directories that exist only on the `dotfiles/.claude/skills/` side (deleted/renamed from the original, or added directly). Therefore, although it claims to "detect and correct drift", it does not correct drift in the deletion direction.

> Codex original text (PR #2723 review comment, `.claude/hooks/pre-push.sh:35`):
> "When a canonical skill is deleted or renamed, or a directory is added directly under `dotfiles/.claude/skills`, this loop never examines that target-only entry because it enumerates only `canonical_sources`. If all remaining mirrors match, `has_diff` stays zero and the obsolete generated skill survives indefinitely, contradicting the new canonical-to-generated synchronization model and leaving removed automation installed. Compare both directory sets and delete entries that have no canonical source."

## Amendment policy (draft)
- Change the commit necessity judgment from `git diff --quiet` to `git status --porcelain -- "$DOTFILES_SKILLS"` (including untracked)
- Compare the name list on the original side with the existing directory list in `dotfiles/.claude/skills/`, run `rm -rf` on directories that do not exist on the original, and then judge the difference and commit.

## Scope of influence
`.claude/hooks/pre-push.sh` (original version newly created in #2639 → binary synchronization logic)

## Related issues
#2639 (implemented task), PR #2723 (merged/modification not reflected)

## Parent story
#2168

## Parent branch
feature/issue-2168

## Comment history

### Comment 1 (2026-08-07 01:41 JST) Conflict check with existing implementation (code-architect)

## Conflict check with existing implementation (code-architect)

Target: #2724

Fallback activation: Yes Reason for activation: Switched to manual tracing because `code-architect` does not exist in the Agent types available in the current session (only `claude`, `claude-code-guide`, `Explore`, `general-purpose`, `Plan`, `statusline-setup`). #2168 Same constraints as when processing.

**Patterns & Conventions Found:**
- Checked `.claude/hooks/pre-push.sh` (`feature/issue-2168` latest = commit `4b9430f`).
- **Confirmed that bug 1 (remaining uncommitted) has already been resolved in #2640 (commit `b922b6f`)**: The original implementation (PR #2723 merge point = commit `02f66e1`) was fixed after copying `git diff --quiet "$DOTFILES_SKILLS"` (working Since the necessity of commit was determined by tree comparison (ignoring untracked), skills that existed only in the original (`ProcessIssue` and `ProcessTaskIssue`) were left untracked even if they were `cp`. Later, with support for symlinking `.claude/skills/` (#2640), it was changed to `git add "${add_targets[@]}"` → `git diff --cached --quiet` to ``detect replacement with symlinks'', and as a side effect of this, new directories were also picked up by `git add`. The Implementer comment for #2640 also states that ``Unsynchronized ProcessIssue and ProcessTaskIssue on the dotfiles/.claude/skills/ side have also been resolved.'' → In this task, we will reproduce and confirm as a regression prevention test.
- **Confirmed that Bug 2 (undetected deletion drift) is still unresolved**: `canonical_sources()` only enumerates `SoloXP/skills/xp_*` + `workflow/skills/*`, and both copy processing and diff detection processing loop only on the results of this enumeration. There is no path to detect and delete directories that exist only on the `dotfiles/.claude/skills/`/`.claude/skills/` side (deleted or renamed from the original). → Requires action in this task.
- The current `dotfiles/.claude/skills/` (38 items) and the total of original copies (`SoloXP/skills/xp_*` 27 items + `workflow/skills/*` 11 items = 38 items) are a complete match in field confirmation, and no actual damage has manifested at this time, but it will definitely recur when skills are deleted or renamed in the future.

**Architecture Decision (Summary):**
- The existing function structure (`canonical_sources()` / `is_termux()` / dotfiles synchronization block / `.claude/skills` synchronization block) will not be changed, and a policy will be adopted to add pruning processing to the end of both blocks to ``delete unnecessary entries by comparing with the original name list.''
- Add a new helper function `canonical_names()` (basename list of `canonical_sources()`), and add a common function to detect and delete unnecessary entries (directories/symlinks with no corresponding name in the original) for `dotfiles/.claude/skills/` and `.claude/skills/` respectively.
- No new code changes are required for bug 1 (solved in #2640). Add only reproduction tests to prevent future regressions.
- Deletions caused by fixing bug 2 are also committed in the existing `git add "${add_targets[@]}"` → `git diff --cached --quiet` (since `git add` defaults to detect deletions under the specified path since Git 2.0, no additional flag changes are required).

Conflicts: None (This is not a new implementation, but an addition and modification of an existing hook, and the change does not conflict with other functions)

---

Work started 2026-08-07 01:20 JST Session URL: https://claude.ai/code/session_0136gsaW53BQTYu2khuUFKQm [ProjectStatus: InProgress]

### Comment 2 (2026-08-07 01:51 JST) [Tester completed]

[Tester completed]

## Test type determination

Target: `.claude/hooks/pre-push.sh` (Bash script, synchronous behavior at runtime)

- Unit: Static verification (checking the existence of the `prune_stale_entries` function, where it is called, and the description of the commit judgment logic)
- Functional: Execute the hook on a temporary git sandbox and verify the following:
  1. Bug 1 regression confirmed: New skills that exist only in the original copy are copied to `dotfiles/.claude/skills/` and are committed instead of being left untracked (confirmation that this has been resolved in #2640)
  2. Bug 2 fix confirmed: Remnants of deleted skills remaining in `dotfiles/.claude/skills/` are deleted and committed.
  3. Bug 2 fix confirmed: Symlinks to deleted skills are deleted and committed on the `.claude/skills/` (symlink mode) side as well.
  4. Existing skills are not affected/Idempotency

Additional test files:
- `SoloXP/tests/unit/issue-2724-pre-push-hook-stale-entry-pruning.unit.test.js`
- `SoloXP/tests/functional/issue-2724-pre-push-hook-stale-entry-pruning.functional.test.js`

E2E: Not applicable (`.claude/hooks/pre-push.sh` is a local git hook that does not have a web application endpoint)

### Comment 3 (2026-08-07 01:52 JST) [Implementer completed]

[Implementer completed]

## Implementation completed

Target: `.claude/hooks/pre-push.sh`

### Bug 1 (New skill directory remains uncommitted)

As a result of investigation, we confirmed that this issue has already been resolved in #2640 (commit `b922b6f`). The commit necessity judgment has been changed from `git diff --quiet "$DOTFILES_SKILLS"` (working tree comparison/ignoring untracked) to `git add "${add_targets[@]}"` → `git diff --cached --quiet` (staged comparison), and new directories are now picked up at the time of `git add`. In this task, no additional code changes were made, and only regression confirmation was added using a functional test.

### Bug 2 (skills deleted from the original remain in dotfiles)

New implementation. Add:

- `canonical_names()`: Helper function that returns a list of basenames for `canonical_sources()`
- `prune_stale_entries(target_dir)`: Scan under `target_dir` and use `canonical_names()`.
  Delete entries (directories/symlinks) without corresponding names with `rm -rf`. Contrary to the existing `canonical_sources()` loop (original → copy destination), by scanning from the copy destination in a direction that matches the list of names in the original, it is now possible to detect the remains of skills that have been deleted or renamed from the original.
- End of synchronized block of `dotfiles/.claude/skills/`, `.claude/skills/` (both symlink/Termux copy modes)
  calls `prune_stale_entries` at the end of each synchronized block of
- Add `-A` to `git add` to the commit target to make deletion detection explicit (default behavior after Git 2.0)
  matches, but was explicitly specified to clarify the intent)

## Test results

- New test (issue-2724): PASS 13 (unit 6 + functional 7) / FAIL 0
- Regression confirmation `SoloXP/tests/unit`: PASS 138 / FAIL 0
- Regression confirmation `SoloXP/tests/functional`: PASS 33 / FAIL 0

Please check with Auditor.

### Comment 4 (2026-08-07 01:52 JST) [Running Auditor test]

[Auditor test running]

## Independent execution results equivalent to /xp_RunTestSuites

Execution date and time: 2026-08-07 01:55 JST Branch: claude/issue-processing-avnrbd (base: feature/issue-2168)

### Static checks
- `bash -n .claude/hooks/pre-push.sh`: No syntax errors

### Unit tests
```
npx jest --testPathPatterns=tests/unit
Test Suites: 15 passed, 15 total
Tests:       138 passed, 138 total
```
- Results: 138 PASS / 0 FAIL (including 6 new cases, no regression of existing items)

### Functional testing
```
npx jest --testPathPatterns=tests/functional
Test Suites: 4 passed, 4 total
Tests:       33 passed, 33 total
```
- Results: 33 PASS / 0 FAIL (including 7 new cases, no regression of existing items)

### Check implementation details
- Confirmed in the code that `prune_stale_entries()` is called at the end of both `dotfiles/.claude/skills/` and `.claude/skills/` synchronization blocks, and is implemented to delete entries (both directories and symlinks) that do not correspond to the original.
- It was confirmed in the code (`git diff --cached --quiet`) that bug 1 (remaining uncommitted) has been resolved with #2640, and it was confirmed to be reproduced in the functional test.
- This task is a change to the local git hook and does not involve changes to the web application, so the preview URL communication check is not applicable (same judgment as #2639, #2640, and #2641)

### Overall judgment
✅ GREEN

[Auditor GREEN] PASS: 171 (unit 138 + functional 33) / Test command: `npx jest --testPathPatterns=tests/unit`, `npx jest --testPathPatterns=tests/functional`

### Comment 5 (2026-08-07 01:53 JST) [Documenter completed]

[Documenter completed]

## Document generation completed

Generated/updated files:
- `docs/skill-files-sync.md`: Added "Bidirectionality of Drift Detection (#2724)" section. Clarified that difference detection (update/addition) from the original source and deletion detection from the copy destination source using `prune_stale_entries()` are separate logics.
- `SoloXP/docs/tests/UnitTests/issue-2724-pre-push-hook-stale-entry-pruning.md`: New (unit test documentation)
- `SoloXP/docs/tests/FunctionTests/issue-2724-pre-push-hook-stale-entry-pruning.md`: New (Functional Test Document)
- `SoloXP/docs/issues/issue-2724.MD`: New (archive of all text and comments of this issue, equivalent to xp_issue2md)

`SoloXP/docs/spec/README.md` does not need to be updated as there is an existing link to `docs/skill-files-sync.md` (the explanation of the existing entry still applies to the additions of this task).

Skipped products:
- `xp_doc_reference`: `.claude/hooks/pre-push.sh` is a git hook script and is not subject to API reference.
