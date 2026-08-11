# issue-2639-pre-push-hook-sync-behavior functional test

## Test target

`.claude/hooks/pre-push.sh` (actual synchronization behavior at runtime)

Create fixtures for the "original copy (equivalent to `SoloXP/skills/xp_*` / `workflow/skills/*`)" and "binary (equivalent to `dotfiles/.claude/skills/*`, in a drifted state)" on a temporary git repository, and actually run the hook to synchronize, correct drift, commit, and idempotency in the original → binary direction. Verify that it holds true (Issue #2639).

`SoloXP` created a new `tests/functional/` directory because this task was the first functional layer test (no configuration changes were necessary as `testMatch` of `jest` already included `**/tests/functional/**/*.test.js`).

## Test file

`SoloXP/tests/functional/issue-2639-pre-push-hook-sync-behavior.functional.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| dotfiles/.claude/skills/xp_Sample is overwritten with the contents of SoloXP/skills/xp_Sample (original) | Normal system | Drift caused by manual editing is corrected to the contents of the original |
| dotfiles/.claude/skills/sample-non-xp is overwritten with the contents of workflow/skills/sample-non-xp (original) | Normal system | Non-xp_ system (from workflow) is also subject to synchronization |
| The original side (SoloXP/workflow) is not changed | Normal system | The copy direction is one-way from original to binary |
| Differences due to synchronization are committed (drift corrections remain in the git history) | Normal system | Commits are accumulated after hook execution and the working tree is clean |
| If there is no difference even if re-executed, nothing is committed (idempotency) | Normal system | HEAD does not change when re-executed with no differences |

## set up

After `git init` to the temporary directory with `beforeAll`, create the original side (`SoloXP/skills/xp_Sample`, `workflow/skills/sample-non-xp`) and the binary side (`dotfiles/.claude/skills/xp_Sample`, Create `dotfiles/.claude/skills/sample-non-xp` (with intentionally mismatched contents to simulate drift), copy the entity of `.claude/hooks/pre-push.sh` and run it once. Delete the sandbox in `afterAll`.

## Coverage Summary

- Synchronous behavior when running pre-push.sh: 5 items
- Total: 5 items
