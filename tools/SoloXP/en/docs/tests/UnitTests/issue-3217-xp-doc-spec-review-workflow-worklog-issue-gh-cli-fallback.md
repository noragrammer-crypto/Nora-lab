# Unit Test: issue-3217 xp-doc-spec-review-workflow-worklog-issue-gh-cli-fallback

Target file: `SoloXP/tests/unit/issue-3217-xp-doc-spec-review-workflow-worklog-issue-gh-cli-fallback.unit.test.js`
Validation target: `SoloXP/skills/xp_doc_spec/SKILL.md` / `xp_review_workflow/SKILL.md` / `xp_worklog/SKILL.md` / `xp_issue/SKILL.md`

## Background

`gh` command for status confirmation and aggregation (`gh issue view --json state` / `gh issue list` / `gh pr list` /
`gh label create` / `gh repo view`) had a fixed dependency on `gh` CLI. In ClaudeCodeWeb environment, `gh` CLI is
Since it cannot be used, "gh priority → MCP fallback in case of failure → field normalization" established with `xp_issue2md` (#3204)
Applied the pattern (found in #3205 investigation, #3217).

## Test case

1. xp_doc_spec: `gh issue view --json state` specifies `mcp__github__issue_read` fallback
2. xp_review_workflow: The conventional route by `gh issue list` remains as is (regression prevention)
3. xp_review_workflow: `gh issue list` now specifies `mcp__github__list_issues` fallback
4. xp_review_workflow: `gh pr list` now specifies `mcp__github__list_pull_requests` fallback
5. xp_worklog: `mcp__github__list_issues` (including paging) fallback is specified in `gh issue list` of open issue count
6. xp_issue: `gh label create` MCP side gaps and alternatives (same as xp_Architect) are specified
7. xp_issue: The handling of `gh repo view` when going through MCP (owner/repo explicit resolution) is specified.

## Execution result

- RED status has not been measured because the test was created at the same time as implementation. After implementation: 7 PASS / 0 FAIL (GREEN)
- Related regression confirmation: `SoloXP/tests/unit` Total 35 suites (276 PASS)

## Additional information

`dotfiles/.claude/skills/xp_doc_spec` , `xp_review_workflow` , `xp_worklog` , `xp_issue`
`SKILL.md` uses `SoloXP/skills/xp_*` as the original and pre-push hook (`.claude/hooks/pre-push.sh`)
Although it is automatically synchronized, in this modification, the actual copy on the `dotfiles/` side was also manually synchronized to confirm the test GREEN.
(`.claude/skills/` is a symlink to the original, so no support is required.)
