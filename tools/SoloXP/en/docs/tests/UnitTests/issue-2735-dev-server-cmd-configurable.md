# Unit Test: issue-2735 dev-server-cmd-configurable (Bug Reproduction Test Task #2802)

Target file: `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`
Verification target: `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`・`SoloXP/skills/xp_RunE2ETests/SKILL.md`・
`Nora-lab/tools/SoloXP/Ja/skills/xp_RunE2ETests/SKILL.md` (3 copies)

## Background

The instructions for ClaudeCode Web environment for `SoloXP/skills/xp_RunE2ETests/SKILL.md` are now available as a local server startup command.
`node /home/user/HolyAutomater/scripts/dev-server.js` is hardcoded in multiple places (#2735).
Since SoloXP is published as a general-purpose framework in Nora-lab (a public repository), this absolute path dependency is
Does not work in public version (Nora-lab PR #20 Codex review pointed out).

## Test case

1. HolyAutomater-specific absolute path (`/home/user/HolyAutomater/scripts/dev-server.js`) does not remain (negation)
2. `DEV_SERVER_CMD` performs assignment with default value (`npx vercel dev`) and its variable
   Both `eval "$DEV_SERVER_CMD"` statements exist together (two original hardcoded locations, positive)

`dotfiles/` / `SoloXP/` / Nora-lab public snapshots (referenced by `make publish-nora-lab`
Perform identical verification with `describe.each` for 3 copies of `Nora-lab/tools/SoloXP/Ja/skills/`)
(Extended 2-copy verification format for issue-2059. PR #2925 Codex review pointed out: Public snapshots must be included.
Added because all assertions were passed even though sync was omitted by modifying only the SoloXP side. PR #2932 Codex review points out:
In the case of only determining that "the strings DEV_SERVER_CMD are close", the threshold is satisfied with only explanatory comments and assignment statements,
`eval "$DEV_SERVER_CMD"` Since the executable statement could not be detected even if it was deleted, assignments and executions were counted separately.
(reinforced to require numbers with both).

## Execution result

- Before correction (as of #2802): 6 FAIL / 0 PASS (as intended = proof that the bug exists)
- After modification (as of completion of #2803): 6 PASS / 0 FAIL (GREEN.`SoloXP/skills/xp_RunE2ETests/SKILL.md`・
  `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`・`Nora-lab/tools/SoloXP/Ja/skills/xp_RunE2ETests/SKILL.md`
  (Introducing `DEV_SERVER_CMD="${DEV_SERVER_CMD:-npx vercel dev --listen 3000}"` in all three copies of )
