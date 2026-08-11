# issue-638-pr-autoclose-keywords E2E Tests

## User scenario overview

Verify that the `gh pr create` body template in xp_Auditor SKILL.md includes the `Closes #<issue number>` keyword so that issues are automatically closed when merging PRs.

Related issues: #638 / #640

## Prerequisites

- `dotfiles/.claude/skills/xp_Auditor/SKILL.md` must exist
- `SoloXP/skills/xp_Auditor/SKILL.md` must exist

## Given/When/Then step

### Acceptance conditions 2-dotfiles: /root/.claude/skills/xp_Auditor/SKILL.md

| # | Given | When | Then |
|---|---|---|---|
| 1 | dotfiles version xp_Auditor SKILL.md exists | Search for gh pr create command | `gh pr create` command is found |
| 2 | dotfiles version xp_Auditor SKILL.md exists | Search for close keywords in the PR body | Contains either `Closes #`/`Fixes #`/`Resolves #` |
| 3 | dotfiles version xp_Auditor SKILL.md exists | Search for template variable format | Contains templates in `Closes #<issue number>` format |

### Acceptance conditions 2-SoloXP: SoloXP/skills/xp_Auditor/SKILL.md

| # | Given | When | Then |
|---|---|---|---|
| 4 | SoloXP version xp_Auditor SKILL.md exists | Search for gh pr create command | `gh pr create` command is found |
| 5 | SoloXP version xp_Auditor SKILL.md exists | Search for close keywords in the PR text | Contains either `Closes #`/`Fixes #`/`Resolves #` |
| 6 | SoloXP version xp_Auditor SKILL.md exists | Search template variable format | Contains templates in `Closes #<issue number>` format |

## Coverage Summary

- Test file: `SoloXP/tests/e2e/issue-638-pr-autoclose-keywords.test.js`
- Number of tests: 6
