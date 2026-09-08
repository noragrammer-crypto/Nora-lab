# Issue #2803: [Task] xp_RunE2ETests SKILL.md: Make dev-server startup command configurable with DEV_SERVER_CMD environment variable

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2803
- Parent story: #2735
- Parent branch: feature/issue-2735

## Overview

In `### 0. 実行環境チェック` and `### 2. テスト対象URLの確認` of `SoloXP/skills/xp_RunE2ETests/SKILL.md`
Hardcoded `node /home/user/HolyAutomater/scripts/dev-server.js` can be overridden with `DEV_SERVER_CMD` environment variable,
The default is changed to the general-purpose command `npx vercel dev --listen 3000`, which is the same as `webServer.command` of `playwright.config.js`.

Depends on: #2802 (Bug reproduction test. Merged with PR #2925)

## Compatible details

The following three files (same snapshot contents) were modified at the same time:
- `SoloXP/skills/xp_RunE2ETests/SKILL.md`
- `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`
- `Nora-lab/tools/SoloXP/Ja/skills/xp_RunE2ETests/SKILL.md` (Public snapshot referenced by `make publish-nora-lab`. Added to verification due to Codex review issue #2802)

In both cases, the hard-coded absolute path is specified in two places (execution environment check section and test target URL confirmation section).
Replaced with `DEV_SERVER_CMD="${DEV_SERVER_CMD:-npx vercel dev --listen 3000}"; eval "$DEV_SERVER_CMD"`.

## Test results

- `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`: 6 PASS / 0 FAIL (RED → GREEN)
- `SoloXP/tests/unit` Overall: 18 suites / 155 results No regression for all PASSes
- [Actual environment confirmation OK]: The default value resolves to `npx vercel dev --listen 3000` in bash execution without mocking,
  and confirmed that the `DEV_SERVER_CMD` override is evaluated as the actual startup command
- Unrelated existing FAILs (`issue-1461`, `issue-254`) are known prior failures that existed before the change and are out of scope.

[Auditor GREEN]
