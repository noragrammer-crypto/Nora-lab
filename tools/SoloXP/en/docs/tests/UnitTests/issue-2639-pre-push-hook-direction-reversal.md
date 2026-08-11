# issue-2639-pre-push-hook-direction-reversal unit test

## Test target

`.claude/hooks/pre-push.sh` (static validation of contents)

Verify that the synchronization direction of the pre-push hook is reversed from "original (`SoloXP/skills/xp_*` + `workflow/skills/*`) to binary (`dotfiles/.claude/skills/*`)", that the old direction (`cp` that reads from `dotfiles`) remains, and that there is a description of drift detection and correction (Issue #2639).

## Test file

`SoloXP/tests/unit/issue-2639-pre-push-hook-direction-reversal.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Proposition 1: `.claude/hooks/pre-push.sh` exists | Normal system | Check the existence of the hook file itself |
| Proposition 2: There is a description of copying in the original → binary direction | Normal system | Must match `(SoloXP\|workflow).*(→\|to).*dotfiles` |
| Proposition 3: There is a description of detecting and correcting drift caused by direct editing under dotfiles | Normal system | Includes both `dotfiles` and `diff\|drift\|drift` |
| Proposition 4: There is no remaining old direction (`cp -r "$DOTFILES_SKILLS`) | Abnormal system (regression prevention) | There is no old direction cp pattern |
| Proposition 5: `workflow/skills/` is referenced as the synchronization source | Normal system | Non-xp_ skills (workflow/skills) are also included in the original |
| Proposition 6: `xp_*` of `SoloXP/skills/` is referenced as the synchronization source | Normal system | xp_* skills are referenced as the original |

## Coverage Summary

- pre-push.sh Static verification of synchronization direction: 6 items
- Total: 6 items
