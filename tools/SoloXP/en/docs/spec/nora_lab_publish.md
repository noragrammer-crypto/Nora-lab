# Nora-lab publishing pipeline (`make sync-nora-lab` + `make publish-nora-lab`)

Synchronization and publication procedure for publishing the SoloXP framework itself to the public repository `noragrammer-crypto/Nora-lab` (#2168 Phase3, #2761 redesigned the continuous synchronization method).

## Overall design (#2761)

Continuous synchronization is divided into three roles: ``Initial separation,'' ``Private→Public,'' and ``Public→Private,'' and each is handled differently.

| Role | Frequency | Means |
|---|---|---|
| First-time separation: Create a new public repository | One-time use | Cut out the history with `git subtree split --prefix=Nora-lab` |
| Continue Private → Public | Each time | **`make publish-nora-lab`** (snapshot/diff commit based on public HEAD) |
| Continue Public → Private | Each time | `git subtree pull --prefix=Nora-lab nora-lab main --squash` |

### Why did I recreate the continuation synchronization (accident on 2026-08-06)

`git subtree push` (split method) traces ``all commits that touched `Nora-lab/` at least once'' along the ancestor graph. Once the public repository already has an independent history and is also being worked directly on, there is no need to reproject the private history on each continuous sync. All that is required is to ``accumulate the difference between the current snapshot and the public HEAD by one commit.''

However, in the old method (using `git subtree split --prefix=Nora-lab` for continuous synchronization), if an unrelated accident occurs on the main body side (accidental deletion of PR #2426 → revert of PR #2428), the revert commit will also touch the `Nora-lab/` path, and from the perspective of `git subtree split`, the entire history of the main body will be treated as "commits related to `Nora-lab/`". (Includes AIchats bulk sync commit in March, Discord token) as its ancestor. `git subtree push` on 2026-08-06 dutifully carried this tainted ancestor graph to the public repository (details: #2761).

As a result of testing the reactive response (#2760) of ``delete `Nora-lab/` with `git rm -r` → re-add it with `git subtree add --squash`,'' it was found that the contamination line could not be isolated. As long as you pile up new commits on the same branch, you can't create boundaries because the new commits themselves have the entire history of the body as ancestors (see comment #2760).

**Conclusion: Eliminate the operation of "tracing the history of the main body as an ancestor graph" (subtree split/push) from continuous synchronization itself.**

## Step 1: `make -C SoloXP sync-nora-lab`

**Implementation**: `SoloXP/Makefile`

Synchronize the original (the entire `SoloXP/` + `workflow/skills/ProcessIssue`) to `Nora-lab/tools/SoloXP/Ja`. The implementation/design of this step is not changed by #2761 (as before).

- Since the synchronization destination is recreated with `rm -rf` and then the actual copy is made with `cp -r`, files that have been deleted on the original side are also deleted.
  Disappears from the synchronization destination (equivalent to `--delete`)
- Does not depend on the `rsync` command (because it is not installed depending on the execution environment). `find -print0` +
  `while IFS= read -r -d ''` enumerates NUL-separated names, and correctly handles file names containing spaces. (Found and fixed as pointed out by #2734 Codex review. `for entry in $(ls -A ...)` is subject to word splitting, and file names with spaces are silently dropped.)
- `SHELL := /bin/bash` (explicitly specified because `read -d ''` is a bash extension that is not in POSIX sh such as dash)

### Exclude from synchronization (`EXCLUDE`)

| Exclude entry | Reason |
|---|---|
| `node_modules` | Products |
| `.git` | Repository metadata |
| `package-lock.json` | Local only |
| `Makefile` | This Makefile itself |
| `tests` | `SoloXP/tests/` mostly depends on the relative path to the monorepo structure (`dotfiles/`, `.claude/hooks/pre-push.sh`, `SoloXP/Makefile` itself, etc.), and if you copy it to the single publication destination (`Nora-lab/tools/SoloXP/Ja`), the resolution destination of `REPO_ROOT` will be shifted and `ENOENT` (Nora-lab PR #20 Codex review pointed out, #2643). Since the test content can be referenced by the publishing side as a document in `docs/tests/{UnitTests,FunctionTests,E2ETests}/`, only the source is excluded without publishing it in an executable form |

### Additional synchronization of `workflow/skills/ProcessIssue`

`ProcessIssue` serves as a triage for the entire workflow required to run the Solo XP framework, but since it is located outside of `SoloXP/` (`workflow/skills/`), it is additionally copied to `Nora-lab/tools/SoloXP/Ja/skills/ProcessIssue/` in addition to the copy of `SoloXP/` itself.

### Removal of test-related settings from `package.json`

As a result of excluding `tests`, there is a misleading statement that only returns "No tests found" when you run `npm test` etc. on the synchronization destination, so when you run `sync-nora-lab`, `scripts.test`, `scripts.test:unit`, `scripts.test:functional`, `scripts.test:e2e`, `jest` are added from the `package.json` on the synchronization destination. Settings/Delete `devDependencies.jest` (as pointed out by PR #2737 Codex review).

## Step 2: `make -C SoloXP publish-nora-lab` (new in #2761. `git subtree push` is not used)

**Implementation**: `SoloXP/scripts/publish-nora-lab.sh` (called from the `publish-nora-lab` target in `SoloXP/Makefile`)

Reflect `Nora-lab/` (including the synchronization result of Step 1) to the public repository `noragrammer-crypto/Nora-lab`.

### Method: snapshot/diff commit with public HEAD criteria

1. Clone the public repository with `--depth 1`. At this point, it is physically unrelated to the history on the Private side (local
   There is no commit before the public HEAD on the temporary clone)
2. Delete all trace files of the cloned working tree and replace them with the contents of `Nora-lab/`
   (Similar to `sync-nora-lab`, files that have been deleted on the original side will also be deleted from the public side)
3. If there are differences, accumulate them as one commit. **The parent of this commit is only one public HEAD**, and the parent of this commit is the private HEAD.
   It is structurally impossible to bring history (private commits of the main body, AIchats/etc.) into the ancestor graph.
4. `git push` as a new branch

Skip push if there is no difference (no-op).

### Why this method structurally prevents accidents from occurring

`git subtree split/push` traces ``which commit in the main repository touched `Nora-lab/`'' from the entire commit graph of the main repository. If an unrelated accident (accidental deletion, revert, etc.) on the main body side touches the `Nora-lab/` path, a contaminated ancestor graph will be mixed into the calculation.

`publish-nora-lab.sh` does not refer to the `.git` history of the main repository as an ancestor. All it has as an ancestor is the one public HEAD at the time of cloning.

`SoloXP/tests/functional/issue-2761-publish-nora-lab-snapshot.functional.test.js` contains a regression test that verifies that the number of commits on the public side does not change even if the history on the private side is intentionally polluted (merged with unrelated history).

### Additional safety measures (PR #2762 Codex review pointed out)

The first version implementation had the following two omissions, which were pointed out in the review in PR #2762 and have been corrected:

1. **Preventing accidental publication of untracked files**: When you physically copy the snapshot directory with `cp -r`,
   A file that actually exists but is excluded by `.gitignore` (e.g. `Nora-lab/.env`) on the main body side will not be subject to the exclusion rules in the independent clone destination and will be published as is with `git add -A`. `publish-nora-lab.sh` requires that the snapshot directory is always under the git repository, and prevents this by enumerating and copying `git ls-files` (tracked files only). Files that are not tracked by git will not be copied at all, regardless of the reason (gitignore, simply unadded, etc.).
2. **Detection of unincorporated changes on the public side**: Changes directly pushed/PRed by the owner on the public side are transferred to the private side.
   If you run `publish-nora-lab.sh` when `git subtree pull --squash` has not yet imported the change, the old method (`git subtree push`) would have rejected it with a non-fast-forward, but the new method always uses the latest public HEAD as a reference when recloning, so it will not be rejected, and you may end up creating a commit that silently deletes and rolls back the unincorporated changes. To prevent this, read the `git-subtree-split: <sha>` trailer embedded in the most recent `git subtree pull/add --squash` commit on the private side as the "last imported public commit SHA", and abort if it differs from the actual public HEAD. If you want to overwrite it intentionally, set the environment variable `NORA_LAB_ALLOW_DIVERGED_PUBLISH=1`.

### Branch protection/PR flow for publishing destination (same as before)

`main` of the public repository is branch protected and cannot be pushed directly. Push the generated branch to the public side, issue a PR on the public repository side, and merge it with the owner (branch name can be overwritten with `NORA_LAB_PUBLISH_BRANCH` in `Makefile`).

Even if there are changes that are directly pushed/PRed on the publishing side (article additions, etc.), `publish-nora-lab.sh` always uses the public HEAD as the latest clone standard, so non-fast-forward rejections like the old method do not occur (because it always uses the latest public HEAD as the standard at the time of re-cloning).

### About running ClaudeCode in a web session

ClaudeCode web sessions have outbound `git push` blocked by proxy (`git push` to a repository outside the GitHub MCP scope results in a 403, see `Nora-lab/CLAUDE.md`). In this case, an alternative procedure to achieve the same design principle of "one commit based on public HEAD standards" using the GitHub Contents API (`GET/PUT /repos/.../contents/<path>` + `POST /repos/.../pulls`) is described in `Nora-lab/CLAUDE.md` ``Syncing from Claude Code Web.'' Both methods have the same design principle of ``not tracing the history of the main body,'' and the only difference is the implementation (transport) due to differences in the environment.

## Initial split (`git subtree split`) — one-time operation, not used for continuous synchronization

Only when creating a new public repository from scratch, cut out the history with `git subtree split --prefix=Nora-lab`. This operation should only be performed when bootstrapping the repository, not for continuous synchronization (#2761).

## Relative link bounds check (`workflow/scripts/check-relative-links.js`)

Since `Nora-lab/` is the root of the public repository, relative links pointing outside `Nora-lab/` and relative links pointing to files that do not exist will be broken on the public side. `checkBrokenRelativeLinks(scanDir, boundaryDir)` detects this (#2643). This verification is independent of the Step 2 method change (#2761) and is not affected.

- Determine links pointing outside the bounds or links to non-existent files as broken.
- http(s), anchor only, and mailto links are not applicable.
- Relative links with anchors are determined by the existence of the actual file excluding the anchor.

Through this verification, an existing relative link depth bug in `SoloXP/docs/spec/README.md` and `xp_reviewer.md` (where it should have been two levels above `SoloXP/docs/spec/` was pointing one level above) was discovered and fixed. Specification links that point outside the Nora-lab public scope (under `workflow/` and `AINovelGenerator/`) have been changed from links to paths within the monorepo (see README.md "About specifications for non-xp_ skills" section).

## connection

- Skill synchronization (original → binary, Phase1/2): `docs/skill-files-sync.md` (Path in monorepo. Path notation is not a link because it is outside the Nora-lab public range)
- Published to: [noragrammer-crypto/Nora-lab](https://github.com/noragrammer-crypto/Nora-lab)
- Parent story: #2168
- Redesign of continuous synchronization (premise of this document): #2761
