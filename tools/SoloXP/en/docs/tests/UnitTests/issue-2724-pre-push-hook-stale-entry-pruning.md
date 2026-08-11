# issue-2724-pre-push-hook-stale-entry-pruning unit test

## Test target

`.claude/hooks/pre-push.sh` (static validation of contents)

Implemented a fix for the issue where skills deleted or renamed from the original remain in `dotfiles/.claude/skills/` and `.claude/skills/` (Bug 2), prevent regression of the issue where new skill directories remain uncommitted (Bug 1, resolved in #2640), and specific to projects that coexist in `.claude/skills/` Static verification of symlink limited pruning (correction of Codex review issue) to prevent accidental deletion of skills (substantive directories without original copies) (Issue #2724).

## Test file

`SoloXP/tests/unit/issue-2724-pre-push-hook-stale-entry-pruning.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Proposition 1: `.claude/hooks/pre-push.sh` exists | Normal system | Check the existence of the hook file itself |
| Proposition 2: A name-based pruning function (`prune_stale_copies`) for dotfiles is defined | Normal system | Checking the existence of the function definition |
| Proposition 3: `prune_stale_copies` is called for `dotfiles/.claude/skills/` | Normal system | Check existence of call |
| Proposition 4: Symlink limited pruning function (`prune_stale_canonical_symlinks`) for `.claude/skills/` is defined | Normal system | Check existence of function definition |
| Proposition 5: `prune_stale_canonical_symlinks` is called for `.claude/skills/` | Normal system | Check existence of call |
| Proposition 6: Commit necessity determination is based on `git diff --cached` (untracked is also detected) | Normal/abnormal system (regression prevention) | Existence of `--cached` determination, old implementation (working tree comparison) does not remain |
| Proposition 7: Add to commit target is marked with `-A` (deletion is also detected) | Normal system | Check existence of `git add -A "${add_targets[@]}"` |
| Proposition 8: Pruning of `.claude/skills/` is determined based on whether it is a symlink or not, and project-specific skills (substantive directory) are not deleted by mistake | Normal system (prevention of regression pointed out by Codex review) | `[ -L "$link" ] \|\| continue` Confirm the existence of a corresponding symlink judgment |

## Coverage Summary

- Static verification of pre-push.sh deletion drift detection, prevention of uncommitted remaining, and protection of excluded skills: 8 items
- Total: 8 items
