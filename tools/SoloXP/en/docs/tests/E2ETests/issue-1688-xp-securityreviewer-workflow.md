# issue-1688-xp-securityreviewer-workflow E2E Tests

## User scenario overview

Security review-specific skill `xp_SecurityReviewer` is newly introduced in SoloXP, and `xp_Director`
Verify that it is configured to be called before issuing a PR to `main` from the AllGREEN flow.
`xp_Reviewer` Follow the same approach (SKILL.md/spec document structure/contract validation) as the acceptance test during implementation (issue-746).

Related issues: #1688 / #3026 / #3027 / #3028

## Prerequisites

- `.claude/skills/xp_SecurityReviewer/SKILL.md` exists (symlink to `SoloXP/skills/xp_SecurityReviewer/SKILL.md`)
- `.claude/skills/xp_Director/SKILL.md` must exist
- `SoloXP/WORKFLOW.md`, `SoloXP/docs/spec/xp_securityreviewer.md`, `SoloXP/docs/spec/README.md` must exist
- `dotfiles/.claude/skills/xp_SecurityReviewer/SKILL.md` and `dotfiles/.claude/skills/xp_Director/SKILL.md` must exist

## Given/When/Then step

### Acceptance condition 1: existence and definition of xp_SecurityReviewer SKILL.md

| # | Given | When | Then |
|---|---|---|---|
| 1 | Load xp_SecurityReviewer/SKILL.md | Inspect frontmatter | `model:` field is defined |
| 2 | Load xp_SecurityReviewer/SKILL.md | Search for calling description of `security-review` | Description found |
| 3 | Load xp_SecurityReviewer/SKILL.md | Search for instructions for recording issue comments | Description found |
| 4 | Load xp_SecurityReviewer/SKILL.md | Search for the description of the high risk indication/improvement recommendation issue filing | Both descriptions are found |
| 5 | Load xp_SecurityReviewer/SKILL.md | Search for moderate or lower risk policies | Description found |
| 6 | Load xp_SecurityReviewer/SKILL.md | Search for `[SecurityReviewer実行中]`/`[SecurityReviewer完了]` markers | Both descriptions are found |
| 7 | Load xp_SecurityReviewer/SKILL.md | Search for fallback procedure | Description found |

### Acceptance condition 2: xp_SecurityReviewer integration in xp_Director SKILL.md

| # | Given | When | Then |
|---|---|---|---|
| 8 | Load xp_Director/SKILL.md | Search for calling description for `xp_SecurityReviewer` | Description found |
| 9 | Load xp_Director/SKILL.md | Check proximity distance from `xp_Reviewer` | `xp_SecurityReviewer` appears immediately after `xp_Reviewer` (within 400 characters) |
| 10 | Load xp_Director/SKILL.md | main Search for PR issue conditions | `xp_SecurityReviewer` completion is included in the conditions |
| 11 | Load xp_Director/SKILL.md | Inspect the "Boundaries held by Claude" list | Contains `xp_SecurityReviewer` |### Acceptance condition 3: AllGREEN gate description in WORKFLOW.md

| # | Given | When | Then |
|---|---|---|---|
| 12 | Load WORKFLOW.md | Search AllGREEN gate list | Contains `xp_SecurityReviewer` |

### Acceptance condition 4: Existence of functional specification/index consistency

| # | Given | When | Then |
|---|---|---|---|
| 13 | Check the existence of docs/spec/xp_securityreviewer.md | Attempt to read the file | The file exists |
| 14 | Load docs/spec/README.md | Search index | Found reference to `xp_securityreviewer.md` |

### Acceptance condition 5: Original → dotfiles/.claude/skills/ synchronous consistency

| # | Given | When | Then |
|---|---|---|---|
| 15 | Load the original `SoloXP/skills/xp_SecurityReviewer/SKILL.md` and the dotfiles version | Compare the contents | Exact match |
| 16 | Load the original `SoloXP/skills/xp_Director/SKILL.md` and the dotfiles version | Compare the contents | Exact match |

## Coverage Summary

- Test file: `SoloXP/tests/e2e/issue-1688-xp-securityreviewer-workflow.test.js`
- Number of tests: 19
