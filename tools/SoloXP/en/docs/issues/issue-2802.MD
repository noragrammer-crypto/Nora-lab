# Issue #2802: [Task] Bug reproduction test added

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2802
- Parent story: #2735
- Parent branch: feature/issue-2735

## Overview

Reported bug #2735 (`SoloXP/skills/xp_RunE2ETests/SKILL.md` is a HolyAutomater-specific absolute path
`/home/user/HolyAutomater/scripts/dev-server.js` is hardcoded and does not work in the public version)
Task to add test cases to reproduce (`task_type: bug_reproduction_test`).

## Compatible details

Added `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`.
`dotfiles/` / `SoloXP/` / Nora-lab public snapshot (`Nora-lab/tools/SoloXP/Ja/skills/`)
Verify the following two propositions for three copies of `xp_RunE2ETests/SKILL.md`:

1. HolyAutomater-specific absolute path (`/home/user/HolyAutomater/scripts/dev-server.js`) does not remain (negation)
2. `DEV_SERVER_CMD` is connected to the actual startup command with the default value (`npx vercel dev`) (affirmative).
   (requires the number of connections equivalent to two original hardcoded locations)

`bug_reproduction_test` Implementer/Functional/E2E is not applicable because it is a task.
Correct implementation is done in dependent task #2803 (`depends_on: #2802`).

### PR #2925 Codex review compatible

After the first commit, two P2 points were pointed out in the Codex review (Nora-lab public snapshot omission of verification target,
`DEV_SERVER_CMD` presence check does not guarantee connection to actual startup command) and enhanced testing:
- `make publish-nora-lab` references the verification target from two copies of `dotfiles/` / `SoloXP/`
  Expanded to 3 copies including Nora-lab public snapshot
- Removed simple string existence check for `DEV_SERVER_CMD` and added it with default value (`npx vercel dev`)
  Enhanced to verify that it is connected to the actual startup command

## Test results

- `SoloXP/tests/unit/issue-2735-dev-server-cmd-configurable.unit.test.js`: 6 FAIL / 0 PASS
  (As intended = Proof that the bug is reproduced in the current state before modification. Functions as acceptance criterion for #2803)
- `SoloXP/tests/unit` Overall: No regression for all other 35 suites PASS
- I observed an unrelated existing FAIL (`issue-1461-ai-dev-cost-token-tracking.test.js`, `issue-254-workflow-update.test.js`), but
  This is a known prior failure that existed before this task was changed and is out of scope.

[Auditor GREEN] (completed as a reproduction test creation task)
