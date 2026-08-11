# Function Test: PR #2746 Preventing regression of Codex review issues

Target file: `SoloXP/tests/functional/pr-2746-codex-review-fixes.functional.test.js`

## Background

Codex automatic review has raised two P2 points for PR #2746, which merges Story #2168 from `feature/issue-2168` to `main`.

### Point 1: `sync-nora-lab` in `SoloXP/Makefile` does not propagate copy failures

Even if `cp` fails in the `find ... | while read ...; do cp ...; done` loop, the loop itself will continue, and if the last iteration was successful, the exit status of the entire `while` will be 0, and make will appear to have succeeded. ``✅ Synchronization complete'' is displayed while the synchronization destination is incomplete.
The same type of accident as the "silent omission of file names containing spaces" fixed in #2734 may occur again through a different route.

**Fixed**: Added `set -e -o pipefail` to the beginning of the recipe and appended `|| exit 1` to the `cp` call.
Abnormal termination of the `while` subshell is reflected in the exit status of the entire pipeline by `pipefail`, and the make recipe itself fails by `set -e`.

### Point 2: Termux fallback for `.claude/hooks/pre-push.sh` does not replace symlinks

Termux branch difference detection was determined only by `diff -rq "$src" "$CLAUDE_SKILLS/$name"`, but if `$CLAUDE_SKILLS/$name` is already a symlink (content matches the original), `diff -rq` incorrectly determines that there is no difference because it follows the link and compares the contents, and the replacement with the physical copy, which is essential in the Termux environment, does not occur.

**Fixed**: Added `[ -L "$CLAUDE_SKILLS/$name" ]` to the has_diff judgment condition, and it must be a symlink.
Treat itself as a difference.

## Test case

1. If `cp` fails, `make sync-nora-lab` exits non-zero (in root execution environment
   Since it cannot be reproduced using permissions, skip if `process.getuid() === 0`, and statically ensure the existence of `set -e -o pipefail` / `|| exit 1` in the corresponding unit test (Propositions 8 and 9).
2. In Termux force mode (`PRE_PUSH_FORCE_TERMUX=1`), `.claude/skills/xp_Sample` is
   If you run a hook from a state that already exists as a symlink, it will be replaced with the actual directory.
3. The replaced content matches the original.

## Execution result

PASS 3 cases / FAIL 0 cases (Test 1 is essentially skipped because it is a root execution environment, statically secured by Propositions 8 and 9)
