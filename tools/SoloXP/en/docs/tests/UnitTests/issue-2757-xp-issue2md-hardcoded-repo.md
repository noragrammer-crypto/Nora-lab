# Unit Test: issue-2757 xp-issue2md-hardcoded-repo

Target file: `SoloXP/tests/unit/issue-2757-xp-issue2md-hardcoded-repo.unit.test.js`
Validation target: `SoloXP/skills/xp_issue2md/SKILL.md`

## Background

The `gh issue view` command of `xp_issue2md/SKILL.md`
It was fixed and hard-coded. Since `xp_Documenter` calls this skill for all tasks, other than HolyAutomater
Every time I introduce SoloXP to a repository, it references the wrong issue in the repository (Nora-lab PR #21)
Codex Auto Review Notice, #2757).

## Test case

1. There is no hard-coded fixed repository like `--repo noragrammer-crypto/HolyAutomater`
2. The `gh issue view` command line has no `--repo` argument, leaving it to automatic resolution from the `gh` current directory.
3. Policies for generalizing operations in other repositories (automatic resolution, automatic detection, current) are clearly specified in the file.

## Execution result

- Before fix (currently after bug): 3 FAIL / 0 PASS (RED as expected)
- After modification (remove `--repo noragrammer-crypto/HolyAutomater` and change to `gh issue view <issue_number> --json ...`): 3 PASS / 0 FAIL (GREEN)
- Related regression confirmation: `issue-2640-claude-skills-sync-strategy.unit.test.js`, `issue-1557-xp-skill-acceptance-criteria-docs.unit.test.js` are both PASS

## Additional information

`dotfiles/.claude/skills/xp_issue2md/SKILL.md` uses `SoloXP/skills/xp_*` as the original pre-push hook
(`.claude/hooks/pre-push.sh`) is automatically synchronized, so in this modification, `SoloXP/skills/xp_issue2md/SKILL.md`
Edited only.
