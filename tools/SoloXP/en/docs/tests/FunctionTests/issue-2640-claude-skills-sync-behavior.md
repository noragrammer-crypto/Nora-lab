# issue-2640-claude-skills-sync-behavior functional test

## Test target

`.claude/hooks/pre-push.sh` (Runtime behavior of synchronous processing for `.claude/skills/`)

"Original copy (equivalent to `SoloXP/skills/xp_Sample`/equivalent to `workflow/skills/sample-non-xp`)" and "`dotfiles/.claude/skills/` (existing #2639 synchronization target, simulating drift)" on the temporary git repository. Create a fixture for "`.claude/skills/` (mock physical copy before migration)" and actually execute the hook.

- Symlink stable environment (default): `.claude/skills/<name>` is a relative symlink to the original.
- Symlink unstable environment such as Termux (`PRE_PUSH_FORCE_TERMUX=1`): `.claude/skills/<name>` is synchronized as a physical copy.
- In any case, existing synchronization to `dotfiles/.claude/skills/` (#2639) is not broken.
- Idempotency when committing and redoing changes

(Issue #2640).

## Test file

`SoloXP/tests/functional/issue-2640-claude-skills-sync-behavior.functional.test.js`

## Test case list

### symlink stable environment (default)

| Test case | Type | Content |
|---|---|---|
| `.claude/skills/xp_Sample` becomes a relative symlink to `SoloXP/skills/xp_Sample` | Normal | The path where the symlink is generated is as expected |
| `.claude/skills/sample-non-xp` becomes a relative symlink to `workflow/skills/sample-non-xp` | Normal system | Non-xp_ system (from workflow) is also symlinked |
| The content read via symlink matches the original | Normal system | No actual copy content from before migration remains |
| `dotfiles/.claude/skills/xp_Sample` is synchronized as an actual copy as before | Normal system (regression prevention) | Synchronization of #2639 does not cause regression |
| Changes are committed to git and are idempotent even when rerun | Normal | The working tree is clean and HEAD does not change when rerun without diffs |

### Symlink unstable environment such as Termux (`PRE_PUSH_FORCE_TERMUX=1`)

| Test case | Type | Content |
|---|---|---|
| `.claude/skills/xp_Sample` is synchronized as an actual copy rather than a symlink | Normal system | Do not fall back to symlinking in Termux |
| `.claude/skills/sample-non-xp` is also synchronized as an actual copy rather than a symlink | Normal system | Same as above (from workflow) |
| Synchronization on the `dotfiles/.claude/skills/` side continues to function as an actual copy | Normal system (regression prevention) | Synchronization in #2639 should work even in Termux branch |
| Changes are committed to git and are idempotent even when re-executed | Normal system | Idempotency holds even in Termux branches |

## set up

After `git init` to the temporary directory with `beforeAll`, the original side (`SoloXP/skills/xp_Sample`, `workflow/skills/sample-non-xp`), `dotfiles/.claude/skills/` (simulating drift), Create `.claude/skills/` (mock actual copy before migration), copy the actual object of `.claude/hooks/pre-push.sh` and execute it once. By passing the environment variable `PRE_PUSH_FORCE_TERMUX=1`, the Termux branch can be tested without depending on the actual machine's Termux judgment (checking the existence of `/data/data/com.termux`). Delete the sandbox in `afterAll`.

## Coverage Summary

- Synchronization behavior in symlink stable environment: 5 items
- Synchronization behavior in unstable symlink environments such as Termux: 4 items
- Total: 9 items
