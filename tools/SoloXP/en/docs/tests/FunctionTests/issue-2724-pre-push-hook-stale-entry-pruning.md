# issue-2724-pre-push-hook-stale-entry-pruning Functional test

## Test target

`.claude/hooks/pre-push.sh` (actual synchronization behavior at runtime)

On the temporary git repository, new skills (`brand-new-skill`) that exist only in the original copy, remnants of deleted skills (`stale_skill`) that only exist in `dotfiles/.claude/skills/`, broken symlinks to deleted skills (`xp_Removed`) that exist only in `.claude/skills/` (symlink mode), and `.claude/skills/` Create a fixture that includes project-specific skills (equivalent to `project-only-skill`, `wiki_ingest`, etc.) that do not have an original copy that coexists as an actual directory in `.claude/skills/` and project-specific skills (`project-only-symlink`) that coexist in the form of a symlink that points outside the original copy, and actually execute the hook.

1. The new skill is copied and committed (confirmed regression of bug 1)
2. The remains of the deleted skill will be deleted and committed (confirmation of bug 2 fix, physical copy side)
3. The broken symlink to the deleted skill is deleted and committed (confirmation of bug 2 fix, symlink side)
4. Existing original skills will not be affected.
5. **Project-specific skills (substantive directory) that do not have an original copy will not be deleted or made into a symlink.
   No changes whatsoever** (Regression confirmation of Codex review points)
6. **Project-specific symlinks pointing to other sources are not deleted or rewritten, and the reference destination remains as a symlink.
   Must be able to access the content** (Regression confirmation of Codex follow-up review findings)
7. Idempotency (if there is no difference, nothing will be committed even if re-executed)
8. While Termux physical copy mode does not prune `.claude/skills/`,
   Delete drift detection on the `dotfiles/.claude/skills/` side still works (checking known limitations)

(Issue #2724).

## Test file

`SoloXP/tests/functional/issue-2724-pre-push-hook-stale-entry-pruning.functional.test.js`

## Test case list

### symlink mode (normal environment, `describe('issue-2724: pre-push.sh commits new skills and prunes remnants of deleted skills')`)

| Test case | Type | Content |
|---|---|---|
| Bug 1 regression confirmation: brand-new-skill is copied to dotfiles/.claude/skills/ | Normal system | Confirmation of copying of new skill that existed only in the original version |
| Bug 1 regression confirmed: The copy of brand-new-skill is not left untracked and is committed | Normal system (regression prevention) | The working tree is clean and the file is included in the commit |
| Bug 2 fix confirmation: stale_skill is deleted from dotfiles/.claude/skills/ | Normal system | Confirm deletion of directories that do not correspond to the original |
| Bug 2 fix confirmation: Deletion of stale_skill is committed | Normal system | The working tree is clean and the deletion is included in the commit |
| Bug 2 fix confirmation: The symlink to xp_Removed is deleted from .claude/skills/ | Normal system | Confirm deletion of broken symlinks that do not correspond to the original (confirm that there are no remains with `fs.lstatSync`) |
| Existing original skills (xp_Sample・sample-non-xp) remain unaffected | Normal | Pruning does not accidentally delete entries corresponding to the original |
| Confirmation of regression pointed out by Codex review: project-only-skill is not deleted | Normal system (regression prevention) | Confirm that the actual directory remains and the contents do not change |
| Confirmation of regression of Codex follow-up review points: Project-specific symlinks pointing outside the original are retained | Normal system (regression prevention) | Confirm that the symlink remains, the reference path remains unchanged, and the contents are accessible |
| Idempotency: Even if you re-execute, if there is no difference, nothing will be committed | Normal system | HEAD will not change even if you re-execute without a difference |

### Termux entity copy mode (`describe('issue-2724: Termux entity copy mode does not prune .claude/skills/ (known limitation)')`)

| Test case | Type | Content |
|---|---|---|
| Deletion drift detection on the dotfiles/.claude/skills/ side still works in Termux | Normal system | stale_skill on the dotfiles side is deleted even with `PRE_PUSH_FORCE_TERMUX=1` |
| project-only-skill is not deleted even in entity copy mode | Normal system (checking known constraints) | It is preserved by the design that does not perform pruning on the `.claude/skills/` side |

## set up

After `git init` to the temporary directory with `beforeAll`, create the original side (`SoloXP/skills/xp_Sample`, `workflow/skills/sample-non-xp`, `workflow/skills/brand-new-skill`) and the binary side (`dotfiles/.claude/skills/xp_Sample`, `dotfiles/.claude/skills/sample-non-xp`, `dotfiles/.claude/skills/stale_skill` (remains that do not exist in the original), `.claude/skills/xp_Sample`, `.claude/skills/sample-non-xp`, `.claude/skills/xp_Removed` (symlink remnants that do not exist in the original), Create `.claude/skills/project-only-skill` (an entity directory that does not have an original copy, equivalent to wiki_ingest, etc.) and `.claude/skills/project-only-symlink` (a project-specific skill in the form of a symlink pointing to `vendor/external-skill-source` that is not an original copy), copy the entity of `.claude/hooks/pre-push.sh` and execute it once. Remove the sandbox with Termux mode tests use the same fixture generation function, configured as a separate `describe` block that executes the hook with `PRE_PUSH_FORCE_TERMUX=1`.

## Coverage Summary

- Behavior verification of new skill synchronization, deletion drift detection, and protection of excluded skills when executing pre-push.sh: 11 items
- Total: 11 items
