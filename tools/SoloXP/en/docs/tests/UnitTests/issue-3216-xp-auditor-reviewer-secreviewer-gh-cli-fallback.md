# Unit Test: issue-3216 xp-auditor-reviewer-secreviewer-gh-cli-fallback

Target file: `SoloXP/tests/unit/issue-3216-xp-auditor-reviewer-secreviewer-gh-cli-fallback.unit.test.js`
Verification target: `SoloXP/skills/xp_Auditor/SKILL.md` / `xp_Reviewer/SKILL.md` / `xp_SecurityReviewer/SKILL.md`

## Background

`gh` command for creating and commenting issues for `xp_Auditor`, `xp_Reviewer`, `xp_SecurityReviewer`
(`gh issue comment` / `gh issue create` / `gh issue view --json state`) had a fixed dependency on `gh` CLI.
Since `gh` CLI cannot be used in ClaudeCodeWeb environment, `xp_issue2md` (#3204) was established.
The "gh priority → MCP fallback in case of failure → field normalization" pattern was applied (found in #3205 investigation, #3216).

## Test case

1. xp_Auditor: `gh issue comment` for duplicate detection now specifies `mcp__github__add_issue_comment` fallback
2. xp_Auditor: `gh issue create` of the bug file clearly specifies `mcp__github__issue_write` (method: create) fallback
3. xp_Auditor: `mcp__github__issue_read` fallback is specified in parent issue status confirmation (`gh issue view --json state`)
4. xp_Auditor: `mcp__github__add_issue_comment` fallback is specified in `gh issue comment` (recorded in parent issue) of completion report
5. xp_Reviewer: `gh issue create` of the improvement recommendation issue clearly specifies `mcp__github__issue_write` fallback.
6. xp_SecurityReviewer: `gh issue create` of the improvement recommendation issue clearly specifies `mcp__github__issue_write` fallback

## Execution result

- Before fix (bug re-current): 1 PASS / 5 FAIL (RED as expected. Only confirming the parent issue status with existing MCP and preceding GREEN)
- After modification (Added MCP fallback to each gh issue comment/create): PASS 6 / FAIL 0 (GREEN)
- After reflecting the Codex review points (required arguments for `mcp__github__issue_write` / `mcp__github__add_issue_comment` `owner`/`repo` (add_issue_comment also includes `issue_number`/`body`), added assertion to each test): 6 PASS / 0 FAIL (GREEN)
- Related regression confirmation: `SoloXP/tests/unit` Total 34 suites (269 PASS)

## Additional information

Each of `dotfiles/.claude/skills/xp_Auditor` , `xp_Reviewer` , `xp_SecurityReviewer` `SKILL.md` is
The pre-push hook (`.claude/hooks/pre-push.sh`) automatically synchronizes with `SoloXP/skills/xp_*` as the original, but
In this modification, the actual copy on the `dotfiles/` side was also manually synchronized to confirm the test GREEN.
(`.claude/skills/` is a symlink to the original, so no support is required.)
