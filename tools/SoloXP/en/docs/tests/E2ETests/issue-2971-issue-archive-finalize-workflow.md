# issue-2971-issue-archive-finalize-workflow E2E Tests

## User scenario overview

The front matter of the Issue Markdown snapshot (`<EpicName>/docs/issues/issue-*.MD`) is
A mechanism that reacquires and finalizes closed items on GitHub as `state: open` near Epic completion.
(Parent Story #2971) Whole story acceptance test. Subtasks (#3484 to #3486) are completed in stages.
Therefore, this test becomes GREEN in order from the part corresponding to the completed subtask (`xp_SecurityReviewer`
Acceptance testing during implementation, same approach as issue-1688: In addition to SKILL.md, spec document structure, contract verification,
The decisive script part combines execution verification in the real directory).

Related issues: #2971 / #3484 / #3485 / #3486 / #3487 / #3488

## Prerequisites

- `SoloXP/scripts/find-stale-issue-archives.sh`・`SoloXP/skills/xp_issueArchiveFinalize/SKILL.md`
  Must exist (after completing #3484)
- `SoloXP/skills/xp_Director/SKILL.md`・`workflow/skills/daily-tasks/SKILL.md` (Both are originals. They are products.
  `.claude/skills/` Verify the original directly, not the subordinate. The reason is that the codex review pointed out in PR #3490) exists.
- `SoloXP/docs/spec/xp_issue_archive_finalize.md` and `SoloXP/docs/spec/README.md` must exist
- `dotfiles/.claude/skills/xp_issueArchiveFinalize/SKILL.md` exists (automatic sync via pre-push hook after #3484 completes)

## Given/When/Then step

### Acceptance condition 1: xp_issueArchiveFinalize Skill existence and basic contract (AC2・3・4・6・7)

| # | Given | When | Then |
|---|---|---|---|
| 1 | Repository | Check the existence of `find-stale-issue-archives.sh` | Exists |
| 2 | Repository | Check the existence of `xp_issueArchiveFinalize/SKILL.md` | Exists |
| 3 | Load xp_issueArchiveFinalize/SKILL.md | `xp_issue2md` Search for reuse description | Description found (AC3) |
| 4 | Load xp_issueArchiveFinalize/SKILL.md | Search for not rewriting open candidates | Description found (AC4) |
| 5 | Load xp_issueArchiveFinalize/SKILL.md | Search for descriptions of `depends_on` and `SSOT` | Both descriptions are found (AC6) |
| 6 | Load xp_issueArchiveFinalize/SKILL.md | Search for description of "always syncing" | Description found (AC7) |

### Acceptance condition 2: Actual operation of candidate extraction script (direct verification of AC2)

| # | Given | When | Then |
|---|---|---|---|
| 7 | Prepare one open issue and one closed issue Markdown in the temporary directory | Execute `find-stale-issue-archives.sh` | Output only the issue number on the open side to standard output (AC2). The contents of the closed file do not change before and after execution (AC4) |

### Acceptance condition 3: Integration into xp_Director AllGREEN flow (AC1, RED until #3485 complete)

| # | Given | When | Then |
|---|---|---|---|| 8 | Load xp_Director/SKILL.md | Extract the "About AllGREEN check/AllGREEN flow" section | Find the call description for `xp_issueArchiveFinalize` |

### Acceptance condition 4: Epic cross-integration into daily-tasks (AC5, RED until #3486 completed)

| # | Given | When | Then |
|---|---|---|---|
| 9 | Load daily-tasks/SKILL.md | Search for description of `xp_issueArchiveFinalize` | Description found |

### Acceptance conditions 5-6: Document integrity/original synchronization

| # | Given | When | Then |
|---|---|---|---|
| 10 | `docs/spec/xp_issue_archive_finalize.md`・`docs/spec/README.md`・`dotfiles/.claude/skills/xp_issueArchiveFinalize/SKILL.md` | Check existence, index registration, and match with original | All are satisfied |

## Execution result (at the time of creation, #3484 PR #3489 on unmerged branch)

```
cd SoloXP && npx jest --testPathPattern="issue-2971-issue-archive-finalize-workflow"
Test Suites: 1 failed, 1 total
Tests:       8 failed, 2 passed, 10 total
```

As expected, the case corresponding to unmerged #3484 and unstarted #3485/#3486 is RED (E2E test creation task
as intended). After completing all subtasks and merging, re-execute with Story-level `xp_Auditor test` and make all GREEN
Make sure that
