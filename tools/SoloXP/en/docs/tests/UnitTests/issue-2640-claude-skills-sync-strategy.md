# issue-2640-claude-skills-sync-strategy unit test

## Test target

`.claude/hooks/pre-push.sh` (Static verification of synchronous processing for `.claude/skills/`)

A process to synchronize `.claude/skills/` (project local, for Codex reference) as a relative symlink to the original (`SoloXP/skills/xp_*` + `workflow/skills/*`) has been added, a copy synchronization fallback and test override exists for unstable symlink environments such as Termux, and the existing `dotfiles/.claude/skills/` Verify that sync (#2639) remains (Issue #2640).

## Test file

`SoloXP/tests/unit/issue-2640-claude-skills-sync-strategy.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Proposition 1: Synchronization processing for `.claude/skills/` has been added | Normal system | The `CLAUDE_SKILLS` variable is defined and referenced |
| Proposition 2: There is a mechanism to detect unstable symlink environments such as Termux | Normal system | There is a detection process that includes `termux` |
| Proposition 3: There is a symlink creation process using `ln -s` for a symlink stable environment | Normal system | `ln -s` command exists |
| Proposition 4: In the branch for Termux, synchronize with `.claude/skills/` by copy | Normal system | `cp -r` for `CLAUDE_SKILLS` exists (symlinks are not unified) |
| Proposition 5: There is an override that can override the environment judgment from the test | Normal system | `PRE_PUSH_FORCE_TERMUX` is referenced |
| Proposition 6: Synchronization (#2639) to `dotfiles/.claude/skills/` remains | Normal system (regression prevention) | `DOTFILES_SKILLS`, `SoloXP/skills`, and `workflow/skills` descriptions remain |

## Coverage Summary

- Static verification of `.claude/skills/` synchronization method of pre-push.sh: 6 items
- Total: 6 items
