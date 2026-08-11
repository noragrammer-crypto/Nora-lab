---
issue: 640 title: "[Task] Add Close keyword to xp_Auditor's PR issue command" state: open labels: [enhancement, task] author: noragrammer-crypto created_at: 2026-04-14T02:39:35Z epic: SoloXP
---

# #640 [Task] Added Close keyword to xp_Auditor PR issue command

## Body

## overview
Add the `Closes #` keyword to the body template of the `gh pr create` command in the `doc` mode of xp_Auditor SKILL.md so that the issue will be automatically closed when PR merged.

## Survey confirmation items (confirm before starting)
- Read the PR publication part of `/root/dotfiles/.claude/skills/xp_Auditor/SKILL.md`
- `gh pr create --body` Check if template includes `Closes #`

## Implementation details
Modify the PR issue step of `/root/dotfiles/.claude/skills/xp_Auditor/SKILL.md` as follows:

```bash
gh pr create --title "<title>" --body "## Summary
Closes #

<Explanation of changes>"
```

Also specify the closing keyword requirements when issuing a PR in the `xp_Director` SKILL.md (explanation of the `xp_Auditor doc` step).

## estimate
1pt — SKILL.md fix

## Dependencies
None (can start immediately)

## Parent story
#638

## comment

### noragrammer-crypto — 2026-04-14T05:15:34Z

Start of work 2026-04-14 05:14

[ProjectStatus: InProgress] [Tester running]

---

### noragrammer-crypto — 2026-04-14T05:16:36Z

## Test execution results

### Unit Test
Skip — SKILL.md (template file) is not subject to unit testing

### Functional Test
Skip — no module coordination

### Acceptance test (existing E2E test suite: issue-638-pr-autoclose-keywords.test.js)
Test file: `SoloXP/tests/e2e/issue-638-pr-autoclose-keywords.test.js` Results: 2 PASS / 4 FAIL (RED is correct before implementation)

| # | Test case | Results |
|---|---|---|
| 1 | [dotfiles] gh pr create command exists | ✅ PASS |
| 2 | [dotfiles] PR body contains Closes # keyword | ❌ RED (not implemented) |
| 3 | [dotfiles] Closes # is specified as a template variable | ❌ RED (not implemented) |
| 4 | [SoloXP] gh pr create command exists | ✅ PASS |
| 5 | [SoloXP] PR body contains Closes # keyword | ❌ RED (not implemented) |
| 6 | [SoloXP] Closes # is specified as a template variable | ❌ RED (not implemented) |

**Implementation target:**
- `/root/.claude/skills/xp_Auditor/SKILL.md` — Add `Closes #<issue number>` to gh pr create --body
- `SoloXP/skills/xp_Auditor/SKILL.md` — Same as above
- (Optional) Specifying PR closing keyword requirements in xp_Director SKILL.md

[Tester completed]

---

### noragrammer-crypto — 2026-04-14T05:18:43Z

## Implementation completed

Change file:
- `dotfiles/.claude/skills/xp_Auditor/SKILL.md`: Added `Closes #<issue number>` template to gh pr create --body
- `SoloXP/skills/xp_Auditor/SKILL.md`: Same as above.
- `.claude/skills/xp_Auditor/SKILL.md`: Same as above (older version also synced)
- `dotfiles/.claude/skills/xp_Director/SKILL.md`: Clarified close keyword requirement in xp_Auditor doc step description
- `SoloXP/skills/xp_Director/SKILL.md`: Same as above.

Test results:
- Acceptance test (issue-638-pr-autoclose-keywords.test.js): 6 PASS / 0 FAIL ✅

[Implementer completed]

---

### noragrammer-crypto — 2026-04-14T05:19:49Z

[Auditor GREEN] PASS: 36 (Unit + Functional) / Test command: `npx jest --testPathPatterns="unit|functional"` Acceptance test (issue-638-pr-autoclose-keywords.test.js): PASS 6 / FAIL 0 ✅

Work completed 2026-04-14 05:25 / Required time: 11 minutes

---
