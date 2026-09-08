# Unit Test: issue-3204 xp-issue2md-gh-cli-fallback

Target file: `SoloXP/tests/unit/issue-3204-xp-issue2md-gh-cli-fallback.unit.test.js`
Validation target: `SoloXP/skills/xp_issue2md/SKILL.md`

## Background

The issue acquisition process of `xp_issue2md/SKILL.md` is fixedly dependent on `gh issue view`, and ClaudeCodeWeb etc.
`gh` Environments where CLI is not available (including cases where GraphQL queries are disabled in the session and become `HTTP 403`)
`xp_issue2md` could not complete the race (#3204). GitHub MCP tool (`mcp__github__issue_read`)
Added a fallback so that the same Markdown is generated regardless of the acquisition method.

## Test case

1. The conventional route by `gh issue view` remains as is (regression prevention)
2. Specifies the GitHub MCP fallback (`mcp__github__issue_read`) if the `gh` CLI is not available
3. Fallback covers both issue body retrieval (`get`) and comment retrieval (`get_comments`)
4. Conditions for triggering fallback (“unusable” due to gh not installed, authentication error, 403, etc.) are clearly specified.
5. It mentions the continuous acquisition of paging (`page`/`perPage`) when there are more than 100 comments.
6. It is clearly stated that the field should be aligned to the same normalized field regardless of the acquisition method.
7. The field to be normalized (title/body/state/labels/author/createdAt) is clearly specified.
8. "Notes" now reflects the fact that when gh fails, it will switch to MCP fallback instead of immediately ending with an error.
9. Repository hardcode (`--repo noragrammer-crypto/HolyAutomater`) fixed in #2757 has not recurred (regression prevention)

## Execution result

- Before fix (bug re-present): 3 PASS / 6 FAIL (RED as expected. 3 systems: MCP fallback not described, normalization policy not described, notes not updated)
- After modification (added MCP fallback branch/normalization field correspondence table to step 1, updated notes): PASS 9 cases / FAIL 0 cases (GREEN)
- Related regression confirmation: `issue-2757-xp-issue2md-hardcoded-repo.unit.test.js` (3 PASS), `SoloXP/tests/unit` Total 32 suites (251 PASS)

## Additional information

`dotfiles/.claude/skills/xp_issue2md/SKILL.md` uses `SoloXP/skills/xp_*` as the original pre-push hook
(`.claude/hooks/pre-push.sh`) is automatically synchronized, so in this modification, `SoloXP/skills/xp_issue2md/SKILL.md`
Edited only.
