# issue-2642-makefile-sync-nora-lab unit test

## Test target

`SoloXP/Makefile` (static verification of `sync-nora-lab` target)

Verify that the `sync-nora-lab` target is defined in the newly created Makefile directly under `SoloXP/`, that the synchronization destination is `Nora-lab/tools/SoloXP/Ja`, that `workflow/skills/ProcessIssue` is included in the synchronization target, and that it is a portable implementation (based on `cp -r`) that does not depend on the `rsync` command (Issue #2642).

## Test file

`SoloXP/tests/unit/issue-2642-makefile-sync-nora-lab.unit.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| Proposition 1: `SoloXP/Makefile` exists | Normal system | Confirm file existence |
| Proposition 2: `sync-nora-lab` target is defined | Normal system | `^sync-nora-lab:` is written |
| Proposition 3: The synchronization destination is `Nora-lab/tools/SoloXP/Ja` | Normal system | The synchronization destination path must be described |
| Proposition 4: `workflow/skills/ProcessIssue` is included in the synchronization target | Normal system | There is a reference |
| Proposition 5: `.PHONY` contains `sync-nora-lab` | Normal system | `.PHONY` line contains |
| Proposition 6: Does not depend on the rsync command | Normal system (design policy) | Since `rsync` is not installed in some execution environments, confirm that the implementation is based on `cp -r` (explanatory text in comments is acceptable) |
| Proposition 7: `SHELL` is fixed to `bash` | Abnormal system (regression prevention) | `find -print0` + `read -d ''` is a bash extension that is not in POSIX sh such as dash, so make sure that the default shell is fixed to work in the dash environment (`read: Illegal option -d`) (pointed out by #2734 Codex review) |

## Coverage Summary

- Static verification of SoloXP/Makefile: 7 items
- Total: 7 items
