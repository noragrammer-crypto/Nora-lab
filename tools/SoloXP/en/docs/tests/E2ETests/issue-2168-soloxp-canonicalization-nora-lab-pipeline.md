# E2E Test Document: Issue #2168
## SoloXP officialization and Nora-lab public pipeline maintenance

Test file: `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js`

---

## User scenario overview

Eliminate the situation where non-xp_related skills (`ops-meeting`, `daily-tasks`, `kakuyomu_post`, etc.) are mixed in `SoloXP/skills/`, and implementations, tests, and specifications are concentrated in `SoloXP/lib`, `scripts`, `tests`, and `docs`, and achieve the following:

1. Normalize `SoloXP/skills/` to xp_* series only (Phase 1)
2. Reverse the synchronization direction of the `pre-push` hook to "original (SoloXP/workflow) → binary (dotfiles/.claude)",
   Make it possible to detect and correct drift caused by direct editing on the binary side (Phase 2)
3. Sync to `Nora-lab/tools/SoloXP/Ja` with `sync-nora-lab` target in `SoloXP/Makefile`,
   Make it possible to update the public repository (`noragrammer-crypto/Nora-lab`) with `git subtree push` without breaking the link (Phase 3)

Acceptance test that checks file system/script contents (method to verify structure/contract; exact match of document wording is not asserted).

---

## Prerequisites

- `SoloXP/skills/`, `SoloXP/lib`, `SoloXP/scripts`, `SoloXP/tests`, `SoloXP/docs` exist (existing)
- `.claude/hooks/pre-push.sh` exists (existing, subject to be rewritten in Phase2)
- `docs/skill-files-sync.md` exists (existing, subject to be rewritten in Phase 2 to match the new structure)
- `workflow/skills/ProcessIssue` exists (existing)

---

## List of test cases (21, of which 1 was skipped)

### Acceptance condition 1: There are no skills other than xp_* in `SoloXP/skills/` (1 item)

| # | Given | When | Then |
|---|---|---|---|
| 1 | Non-xp_ skills are mixed under `SoloXP/skills/` | Enumerate directories directly under | All are `xp_` prefixes |

### Acceptance condition 2: There are no non-xp_ files left in lib/scripts/tests/docs (4 files)

| # | Given | When | Then |
|---|---|---|---|
| 2～5 | Non-xp_ type files are mixed in each directory (lib/scripts/tests/docs) | Scan file names with non-xp_ type keywords (ops-meeting, daily-tasks, kakuyomu_post, etc.) | The corresponding file does not exist |

### Acceptance condition 3: The pre-push hook operates in the "original → binary" direction (4 cases)

| # | Given | When | Then |
|---|---|---|---|
| 6 | `.claude/hooks/pre-push.sh` | Check the file | Exists |
| 7 | Hook contents | Check the copy direction pattern | There is a description of the direction of `SoloXP/workflow → dotfiles` |
| 8 | Hook contents | Check the description of drift detection and correction | There is a description of `dotfiles` and `diff/drift/drift` |
| 9 | Hook contents | Check if the old version (`cp -r "$DOTFILES_SKILLS`) remains | There is none left |

### Acceptance condition 4: The relevant section of CLAUDE.md explains the new structure (5 items)

| # | Given | When | Then |
|---|---|---|---|
| 10 | `docs/skill-files-sync.md` | Check file | Exists |
| 11 | `CLAUDE.md` | Check the reference to the relevant section | There is a description of `skill-files-sync` or `skill file` |
| 12 | `docs/skill-files-sync.md` | Check the description of the original | `SoloXP`/`workflow` is clearly stated as the original |
| 13 | Same as above | Check the binary description | It is clearly stated that `dotfiles` is a binary (product) |
| 14 | Same as above | Check the description of the synchronization direction | There is a description of "original → binary" |

### Acceptance condition 5: Synchronized to Nora-lab/tools/SoloXP/Ja with `make sync-nora-lab` (4 items)

| # | Given | When | Then |
|---|---|---|---|
| 15 | `SoloXP/Makefile` | Check file | Exists |
| 16 | Makefile contents | Check the `sync-nora-lab` target | Defined |
| 17 | Same as above | Check the synchronization destination path | There is a description of `Nora-lab/tools/SoloXP/Ja` |
| 18 | Same as above | Check if ProcessIssue is included | There is a description of `ProcessIssue` |

### Acceptance condition 6: git subtree push reflects without broken links (structural pre-verification, 2 + 1 skip)

| # | Given | When | Then |
|---|---|---|---|
| 19 | Under `SoloXP/` | Recursively scan symbolic links | Does not exist |
| 20 | Under `workflow/skills/ProcessIssue` | Recursively scan symbolic links | Does not exist |
| skip | Actual `git subtree push` reflection confirmation | — | Not subject to automatic execution as it depends on network/external public repository (manual confirmation with #2643) |

---

## Implementation status

| Subissue | Contents | Status |
|---|---|---|
| #2635 | E2E test suite creation | Completed |
| #2636 | SoloXP/skills Moving non-xp_skills to workflow/skills/ | Not started |
| #2637 | Moving non-xp_ files under SoloXP/lib, scripts, tests, and docs to workflow/ | Not yet started |
| #2638 | Confirmation of completion of Phase 1 | Not started (depends_on #2636, #2637) |
| #2639 | Reverse synchronization direction of pre-push.sh | Not started (depends_on #2638) |
| #2640 | Review of synchronization method on .claude/skills/ side | Not yet started (depends_on #2639) |
| #2641 | Skill file synchronization section update of CLAUDE.md | Not started (depends_on #2639, #2640) |
| #2642 | SoloXP/Makefile Newly created/sync-nora-lab target implementation | Not started (depends_on #2638) |
| #2643 | Publication of Nora-lab by git subtree push | Not yet started (depends_on #2642) |
| #2644 | Functional specification update | Not started (depends_on all subtasks) |

---

## Execution result

| Execution date | PASS | FAIL | SKIP | Status |
|---|---|---|---|---|
| 2026-08-05 | 6 | 14 | 1 | #2635 Immediately after creation (RED because Phases 1 to 3 have not been started. As expected) |
