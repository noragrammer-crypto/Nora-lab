# E2E Tests: issue-615 PR stacking flow to parent issue branch

Test file: `SoloXP/tests/e2e/issue-615-parent-branch-pr-stacking.test.js` Test target: `dotfiles/.claude/skills/xp_Director/SKILL.md`, `dotfiles/.claude/skills/xp_Auditor/SKILL.md`, `dotfiles/.claude/skills/xp_Architect/SKILL.md`, `CLAUDE.md`

---

## User scenario overview

When processing a parent Story/Bug in a Solo XP workflow, subtask PRs are accumulated on the parent branch (`feature/issue-{number}`), and a PR from the parent branch to main is issued after AllGREEN.

---

## Acceptance conditions and test case list

### Acceptance condition 1: Feature branch is created and pushed during parent Story processing and stops — 4 results

| # | Test case | Confirmation pattern | Results |
|---|---|---|---|
| 1 | xp_Director SKILL.md contains instructions to create feature/issue-{number} branch | `/feature\/issue-\{?number\}?/` | ✅ PASS |
| 2 | xp_Director SKILL.md contains branch push instructions after Story processing | `/git push.*feature\|push.*origin.*feature/` | ✅ PASS |
| 3 | xp_Director SKILL.md contains instructions to stop Architect after completion | `/Architect.*After completion.*Stop\|Parent.*Branch.*Create.*Stop\|feature.*push.*Stop/` | ✅ PASS |
| 4 | xp_Director SKILL.md contains a record of the [Parent branch created] comment | `/Parent branch created/` | ✅ PASS |

### Acceptance condition 2: Parent branch detection/rebase/PR base change during sub-task processing — 4 results

| # | Test case | Confirmation pattern | Results |
|---|---|---|---|
| 5 | xp_Director SKILL.md contains instructions for parent branch detection | `/parent branch.*discovery\|feature\/issue.*discovery\|fetch.*feature/` | ✅ PASS |
| 6 | xp_Director SKILL.md contains git rebase instructions | `/git rebase/` | ✅ PASS |
| 7 | xp_Director SKILL.md includes --base option specification for PR | `/--base.*feature\|base.*parent branch/` | ✅ PASS |
| 8 | xp_Director SKILL.md includes stop processing when the parent branch is not found | `/parent branch.*not found\|feature.*not found/` | ✅ PASS |

### Acceptance condition 3: PR of parent branch → main is issued after AllGREEN — 2 results

| # | Test case | Confirmation pattern | Results |
|---|---|---|---|
| 9 | xp_Director SKILL.md includes feature→main PR publication instructions after AllGREEN | `/AllGREEN.*feature.*main\|feature.*main.*PR\|Parent branch.*main.*PR/` | ✅ PASS |
| 10 | xp_Director SKILL.md contains parent branch PR comment record after AllGREEN | `/Parent Branch PR Issued\|Parent.*PR.*Issued/` | ✅ PASS |

### Acceptance condition 4: CLAUDE.md branch operation rules have been updated — 3 items

| # | Test case | Confirmation pattern | Results |
|---|---|---|---|
| 11 | CLAUDE.md contains the parent branch operation flow of feature/issue-{number} | `/feature\/issue-\{?number\}?.*Automatic creation\|xp_Director.*feature\|parent.*Story.*feature/` | ✅ PASS |
| 12 | CLAUDE.md contains the rebase flow when processing a subTask | `/SubTask.*Rebase\|rebase.*Parent branch\|SubTask.*Parent branch/` | ✅ PASS |
| 13 | CLAUDE.md contains the parent branch → main PR flow after AllGREEN | `/AllGREEN.*feature.*main\|feature.*main.*PR.*Publish/` | ✅ PASS |

### Acceptance condition 5: PR creation responsibility is transferred to xp_Director — 2 items

| # | Test case | Confirmation pattern | Results |
|---|---|---|---|
| 14 | xp_Director SKILL.md contains a description for Director to issue PR | `/Director.*PR.*Issuance\|xp_Director.*gh pr create\|PR.*Director.*Responsibility/` | ✅ PASS |
| 15 | The doc mode of xp_Auditor SKILL.md states that PR will not be issued | `/PR.*Director\|Director.*PR\|PR.*issue.*do not\|PR issue.*xp_Director/` | ✅ PASS |

### Acceptance condition 6: xp_Architect specifies the parent branch name in the subissue body — 2 items

| # | Test case | Confirmation pattern | Results |
|---|---|---|---|
| 16 | Sub-issue template in xp_Architect SKILL.md contains parent branch section | `/parent branch/` | ✅ PASS |
| 17 | xp_Architect SKILL.md has a description of feature/issue-{parent number} | `/feature\/issue-\{?parent number\}?/` | ✅ PASS |

---

## overview

A specification verification test group for SKILL.md (natural language instructions). Read the file with `fs.readFileSync` and check the specification text using regular expression pattern matching.

Acceptance conditions 9 and 10 have been changed to GREEN by clarifying the wording of SKILL.md in issue #998/#1100.

---

## connection

- #615: Parent story (PR stacking flow implementation to parent issue branch)
- #689–#692: Each subtask (feature branch creation, rebase, PR responsibility transfer, AllGREEN PR)
- #998: Bug (issue-615 E2E test FAIL discovered)
- #1100: Correction task (SKILL.md AllGREEN section wording clarification)
- `workflow/docs/spec/xp-director-allgreen-pr.md`: Specification
