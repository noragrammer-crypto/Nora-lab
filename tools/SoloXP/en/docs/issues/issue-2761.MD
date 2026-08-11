# Issue #2761: [Bug] There is no pre-check to detect pollution of the Nora-lab subtree (there is a track record of the main body's private history being leaked to a public repository)

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2761

## overview

Before executing `git subtree push --prefix=Nora-lab`, there was no mechanism to detect whether the ancestor history of `Nora-lab/` was mixed with the private commit history of HolyAutomater itself. On 2026-08-06, an accident occurred where the main body's private history (including AIchats bulk sync commits from 2026-03 and Discord Bot tokens) was leaked to the main of the public repository `noragrammer-crypto/Nora-lab` (see the GitHub issue text for details).

In an additional comment after the accident was discovered, it was demonstrated that even after the fact (PR #2760), ``delete `Nora-lab/` with `git rm -r` → re-add it with `git subtree add --squash'', the contaminated system could not be isolated, and a policy was decided to ``abolish `git subtree push` (history-preserving method) from continuous synchronization itself'' as a permanent solution.

## Determined response policy (scope of this issue)

Re-design "initial separation" and "continuation synchronization" as different things:

| Role | Frequency | Means |
|---|---|---|
| First-time split: Create a new public repository | One-time use | `git subtree split --prefix=Nora-lab` |
| Continue Private → Public | Each time | Public HEAD standard snapshot/diff commit (newly established: `make publish-nora-lab`) |
| Continue Public → Private | Each time | `git subtree pull --prefix=Nora-lab nora-lab main --squash` (no change) |

Once the public repository already has a separate history and is also being worked directly on, there is no need to "reproject the private history" (=subtree split/push) every time you perform a continuous sync. All you need to do is set the public HEAD as the parent and accumulate one commit of the difference with the current snapshot. Since this method ``does not refer to the main body's `.git` history at all,'' it is structurally impossible for the ancestor graph to be transferred to the public side even if any accident (accidental deletion, revert, etc.) occurs on the main body side. With this redesign, the ``pre-check to detect contamination'' that was part of the original acceptance condition will be replaced with a design that ``prevents contamination from occurring'' instead of ``detecting it.''

## implementation

- `SoloXP/scripts/publish-nora-lab.sh`: New. Clone the public repository with `--depth 1` and add the tracking file to
  Replace with snapshot (`Nora-lab/`), add 1 commit, and push as a new branch
- `SoloXP/Makefile`: Create a new `publish-nora-lab` target and call the above script
  (Can be overwritten with `NORA_LAB_REMOTE_URL`, `NORA_LAB_BASE_BRANCH`, `NORA_LAB_PUBLISH_BRANCH`, `NORA_LAB_COMMIT_MESSAGE`)
- `SoloXP/docs/spec/nora_lab_publish.md`: Completely revised Step 2. New system design and structural accident prevention
  Describe the reason why it doesn't happen
- `CLAUDE.md` (root): Updated Nora-lab synchronization command guide to new method
- `Nora-lab/CLAUDE.md`: Updated Repository Relationship section to match new method.

## Test

`SoloXP/tests/functional/issue-2761-publish-nora-lab-snapshot.functional.test.js` — Run `publish-nora-lab.sh` on a real temporary git environment (bare repository) and verify the following:

- Additions, changes, and deletions of files are correctly reflected on the publishing side.
- The parent of the new commit must be only one public HEAD
- No matter how much the history on the private side is polluted (even if it is merged with unrelated history), the number of commits on the public side will be
  No change (regression test that directly proves the non-reproducibility of the accident pattern of 2026-08-06)
- Skip push if there are no differences
- Untracked files under the snapshot (equivalent to `.gitignore` exclusion on the main unit) will not be made public.
- Abort publishing if the publishing side has progressed from the last import point on the private side (can be overwritten with `NORA_LAB_ALLOW_DIVERGED_PUBLISH=1`)

## PR #2762 Additional points in Codex review (implemented)

For the first version implementation (PR #2762 first commit), Codex made the following two P1 points, both of which have been fixed in the same PR:

1. **Incorrect publication of untracked files**: Physical copying by `cp -r` is excluded by `.gitignore` on the main body side
   Even files that actually exist (eg `Nora-lab/.env`) will be made public. Workaround by changing to `git ls-files` based tracked-files-only copy
2. **Silent deletion of unincorporated changes on the public side**: Changes directly pushed/PRed by the owner on the public side are transferred to the private side
   If you publish without being pulled, you will create a PR that deletes and undoes the changes. This is because the new method did not have the safety net of non-fast-forward rejection that the old method (`git subtree push`) had. `git-subtree-split:` Added a check for interrupting reference SHA comparison by trailer.

## connection

- Accident detection/investigation/post-incident response: HolyAutomater PR #2760
- Original source of contamination: PR #2426 / #2428
- subtree public pipeline (Phase3): #2168, #2642, #2643
