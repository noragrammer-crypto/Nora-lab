# Unit Test: issue-3214 xp-director-architect-gh-cli-fallback

Target file: `SoloXP/tests/unit/issue-3214-xp-director-architect-gh-cli-fallback.unit.test.js`
Verification target: `SoloXP/skills/xp_Director/SKILL.md` / `SoloXP/skills/xp_Architect/SKILL.md`

## Background

The "## GitHub access method" table for `xp_Director/SKILL.md` was reversed from the actual situation.
(It was written that it was via Claude Code Web → `gh` Command/Others → MCP, but in reality it was
ClaudeCodeWeb cannot use `gh` CLI and must use MCP; other environments can use `gh`).
In addition, the main `gh` commands of `xp_Director` and `xp_Architect` (PR merge confirmation, issue close,
Established with `xp_issue2md` (#3204) for main PR issue, sub-issue linking, label creation)
The pattern "gh priority → MCP fallback in case of failure → field normalization" was not applied (#3205 found through investigation, #3214).

## Test case

1. “## GitHub access method” section exists
2. Claude Code Web line is stated as via MCP (correct mapping after modification)
3. Lines other than ClaudeCodeWeb (local, etc.) are described as `gh` command
4. `gh pr list --search ... --state merged` specifies MCP fallback (`mcp__github__search_pull_requests`, etc.)
5. `gh issue close` specifies `mcp__github__issue_write` (state: closed) fallback
6. `gh pr create --base main` specifies `mcp__github__create_pull_request` fallback
7. It mentions the fallback activation condition (gh priority pattern) when the gh CLI cannot be used.
8. xp_Architect: `gh api .../sub_issues` (POST) specifies `mcp__github__sub_issue_write` fallback
9. xp_Architect: `gh label create` gaps on the MCP side and alternative methods (pre-creation of frequently appearing labels + manual creation request) are clearly specified.
10. xp_Architect: When a label is missing, it is specified that it must be added retroactively to an existing issue after manual creation (Codex review pointed out: #3254)

## Execution result

- Before fix (as of now): 1 PASS / 8 FAIL (RED as expected. Environment mapping is reversed + MCP fallback not described)
- After modification (modified environment mapping table and added MCP fallback to main commands): PASS 9 cases / FAIL 0 cases (GREEN)
- After reflecting the Codex review findings (added mandatory statement for retroactive labeling, added 10 test cases): PASS 10 cases / FAIL 0 cases (GREEN)
- Related regression confirmation: `SoloXP/tests/unit` Total 33 suites (PASS 262 → 263)

## Additional information

`dotfiles/.claude/skills/xp_Director/SKILL.md` ・ `xp_Architect/SKILL.md` replaces `SoloXP/skills/xp_*`
The pre-push hook (`.claude/hooks/pre-push.sh`) is automatically synchronized as the original, but in this modification, the test GREEN confirmation
Therefore, the actual copy on the `dotfiles/` side was also manually synchronized (`.claude/skills/` is a symlink to the original, so no action is required).
