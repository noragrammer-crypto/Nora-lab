# issue-2761-publish-nora-lab-snapshot functional test

## Test target

`SoloXP/scripts/publish-nora-lab.sh` (Nora-lab continuous synchronization with snapshot/diff commit method based on public HEAD)

Verify on the actual temporary git environment (bare repository acting as a public repository + snapshot directory) that the continuous synchronization has been switched to a method of cloning a public repository with `--depth 1` and loading only one commit instead of using `git subtree push` (Issue #2761).

This directly proves that the new method is structurally impossible to recur the ``accident in which the main body's private history (including AIchats/bulk sync commits and Discord tokens) was leaked to the public repository via the ancestor graph of `git subtree push`'' that occurred on 2026-08-06.

## Test file

`SoloXP/tests/functional/issue-2761-publish-nora-lab-snapshot.functional.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Added/changed files in the snapshot are reflected on the publishing side | Normal system | New files/changed files exist in the branch after pushing |
| Files that do not exist in the snapshot are deleted from the publishing side | Normal system (reflection of deletion) | Files that exist only on the publishing side disappear after synchronization (equivalent to `--delete`) |
| The parent of a new commit is only one public HEAD | Normal system (the core of the design) | Directly verify that the number of parent commits of `git log -1 --pretty=%P` is one |
| No matter how contaminated the history on the private side is, the number of commits on the public side does not increase | Abnormal system (regression prevention/proof of the impossibility of reproducing the accident) | Even if we prepare a "contaminated repository" that intentionally merges unrelated history on the private side, it does not appear in the script argument at all, so we confirmed that the number of commits on the public side (2: public HEAD + 1 new commit) does not change |
| If there is no difference with the public HEAD, push is skipped and no branch on the public side is created | Normal system (no-op) | No useless commit branch is created when there is no difference |
| Untracked files under snapshots are not published | Abnormal system (regression prevention, PR #2762 Codex review pointed out) | Confirm that files that have not been `git add` (equivalent to `.gitignore` exclusion on the main unit, e.g. `.env`) are excluded by `git ls-files`-based copy |
| If the snapshot directory is not under the git repository, interrupt with an error | Abnormal system (guard confirmation) | Reject input that does not satisfy the premise of copying only tracked files |
| Publish will be successful if the last point imported by the private side and the public HEAD match | Normal system (case where the divergence check does not apply) | `git-subtree-split:` If the SHA of the trailer and the actual public HEAD match, proceed as usual |
| If the public HEAD is ahead of the known point on the private side, interrupt publishing and do not create a branch | Abnormal system (regression prevention, PR #2762 Codex review pointed out) | Detect unincorporated changes on the publishing side (direct push by owner, etc.), interrupt publishing, and do not create a commit that deletes or rolls back |
| Unincorporated change detection can be explicitly overridden with `NORA_LAB_ALLOW_DIVERGED_PUBLISH` | Normal system (escape hatch) | Divergence check can be intentionally overridden with environment variables |

## Coverage Summary

- Verification of `publish-nora-lab.sh` through actual git operations: 10 items
- Total: 10 items

## connection

- Specification: `SoloXP/docs/spec/nora_lab_publish.md` (Step 2)
- Issue: `SoloXP/docs/issues/issue-2761.MD`
