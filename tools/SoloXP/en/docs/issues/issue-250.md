# Issue #250: [Task] Added parent issue completion report after GREEN to xp_Auditor skill

**Epic**: SoloXP
**Status**: Completed
**Labels**: task, epic/SoloXP
**Parent Story**: #243

## overview

Modify xp_Auditor SKILL.md and add a process to write a completion report comment to the parent issue after the sub-issue becomes [Auditor GREEN].

Example comment:
```
Sub-issue #42 completed. Remaining: #43, #45
```

## File to be changed

- `SoloXP/skills/xp_Auditor/SKILL.md`
- `.claude/skills/xp_Auditor/SKILL.md`

## Added processing

1. After testing GREEN, identify the parent story issue number (obtained from the “## Parent Story” section of the sub-issue body)
2. Identify remaining sub-issues (enumerate open task issues with the same parent story)
3. Write a completion report comment to the parent issue

## estimate

1pt — SKILL.md fix

## Dependencies

None (can start immediately)

## Work log

- Work started: 2026-03-18 03:26
- Work completed: 2026-03-18 03:31
- Duration: 20 minutes

## Results

- [Auditor GREEN] — 4 items of acceptance condition 1 PASS
