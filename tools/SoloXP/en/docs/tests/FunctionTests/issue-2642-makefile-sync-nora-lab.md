# issue-2642-makefile-sync-nora-lab functional test

## Test target

`make -C SoloXP sync-nora-lab` (sync behavior on actual temporary git repository)

Actually run the `sync-nora-lab` target in `SoloXP/Makefile` and set `SoloXP/`(`skills/xp_*`
+ top-level doc) and `workflow/skills/ProcessIssue` to `Nora-lab/tools/SoloXP/Ja`
Verify that it is synchronized as an actual copy, that exclusion targets such as `node_modules` and `Makefile` themselves are not included in the synchronization destination, that file names containing spaces are not lost due to shell word splitting, and that if a file is deleted on the original side, it is also deleted from the synchronization destination by re-execution (recreation with `rm -rf` achieves behavior equivalent to `--delete`) (Issue #2642).

## Test file

`SoloXP/tests/functional/issue-2642-makefile-sync-nora-lab.functional.test.js`

## Test case list

| Test case | Type | Content |
|---|---|---|
| `SoloXP/skills/xp_Sample` is synchronized | Normal system | Contents of `Nora-lab/tools/SoloXP/Ja/skills/xp_Sample/SKILL.md` match |
| `SoloXP/ARCHITECTURE.md` is synchronized | Normal system | Confirm that the top-level doc is also synchronized |
| `workflow/skills/ProcessIssue` is synchronized | Normal system | Contents of `Nora-lab/tools/SoloXP/Ja/skills/ProcessIssue/SKILL.md` match |
| File names containing spaces are synchronized without being lost due to word splitting | Abnormal system (regression prevention) | Preventing recurrence of the word splitting bug (#2734 Codex review pointed out) in `for entry in $$(ls -A ...)` |
| `node_modules` is not included in the synchronization destination | Abnormal system (exclusion confirmation) | Confirmation that exclusion targets are not omitted |
| `Makefile` itself is not included in the synchronization destination | Abnormal system (exclusion confirmation) | Confirmation that exclusion targets are not omitted |
| The original side is not changed | Normal system | Confirmation that synchronization is unidirectional |
| Files deleted in the original are also deleted from the synchronization destination when re-executed | Normal system (deleted reflected) | `SoloXP/skills/xp_Sample` When re-executed after deletion, they also disappear from the synchronization destination |
| Other synchronization targets remain even after re-execution | Normal system (regression prevention) | Deletion reflection does not affect files other than the target files |

## Coverage Summary

- Verification of synchronization behavior by actually running `make sync-nora-lab`: 9 results
- Total: 9 items
