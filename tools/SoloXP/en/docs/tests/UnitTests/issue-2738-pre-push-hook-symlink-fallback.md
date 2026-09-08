# issue-2738-pre-push-hook-symlink-fallback unit test

## Test target

`.claude/hooks/pre-push.sh` (static validation of content)

Problem where the skill directory disappears in an environment where symlink creation can fail even in non-Termux (pointed out 1),
and `.claude/skills/` drift fix commit involves unsynchronized staged changes
Statically verify the corrected implementation of issue (Issue 2) (Issue #2738, Implementation Task #2936).

## Test file

`SoloXP/tests/unit/issue-2738-pre-push-hook-symlink-fallback.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Proposition 1: `.claude/hooks/pre-push.sh` exists | Normal system | Check the existence of the hook file itself |
| Proposition 2: A function (`can_create_symlinks`) that actually probes whether a symlink can be created is defined | Normal system | Confirm the existence of the probe body by function definition/`ln -s` |
| Proposition 3: The mode judgment considers not only the failure of `is_termux()` but also the failure of `can_create_symlinks()` | Normal system (prevention of regression of point 1) | Confirmation of existence of judgment condition equivalent to `is_termux \|\| ! can_create_symlinks` |
| Proposition 4: Each `ln -s` also has a fallback to `cp -r` in case of failure | Normal system (insurance fallback) | Confirmation that `cp -r` fallback exists in the context immediately after `ln -s` |
| Proposition 5: Staged contents are saved before `git add` | Normal system (preventing regression of point 2) | Confirming the existence of `git diff --cached --name-only` |
| Proposition 6: If the saved staged content is non-empty, there is a branch that skips automatic commit | Normal system (preventing regression of point 2) | Checking the existence of the `pre_existing_staged` variable and `exit 0` after non-empty determination |
| Proposition 7: A staged change protection message is included | Normal system (accountability to users) | Confirm the existence of warning message text |

## Coverage Summary

- pre-push.sh Static verification of symlink fallback/staged change protection: 7 items
- Total: 7 items
