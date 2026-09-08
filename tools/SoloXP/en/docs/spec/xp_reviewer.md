# xp_Reviewer functional specification

## Overview

xp_Reviewer is a code review skill.
xp_Director calls after confirming AllGREEN/E2E GREEN and performs code review before issuing PR.

---

## Command

| Command | Description |
|---|---|
| `xp_Reviewer <epic> <issue>` | Review the current PR branch and record the results as an issue comment |

---

## Call timing

Called from xp_Director's AllGREEN flow:

```
AllGREEN → xp_RunE2ETests → ✅ GREEN → xp_Reviewer → PR発行 → イシュークローズ
```

---

## Risk classification and response

| Risk level | Response |
|---|---|
| High Risk | Record issue comments + Automatically raise issues with improvement recommendations (Label: `bug`) |
| Medium Risk | Issue comments only (no user action required) |
| Low Risk | Issue comments only (no user action required) |

---

## Output

### Issue comment (required)

```markdown
## xp_Reviewer レポート

### 高リスク指摘（High Risk）
<指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<指摘一覧。なければ「なし」>

### 総評
<全体的な品質評価>
```

### Improvement recommendation issue (only for high risk cases)

Automatically raise one issue for each high-risk finding:
- Title: `[改善勧告] <指摘の概要>`
- Label: `bug`

Raising an improvement recommendation issue (`gh issue create`) is not possible in environments where `gh` cannot be used (such as ClaudeCodeWeb).
Fallback to `mcp__github__issue_write` (method: `create`, labels: [`bug`])
(Pattern established in `xp_issue2md`〈#3204〉. #3216).

---

## Notes

- If the Auditor's decision is to close, you can close the parent issue.
- No user action required for risks below medium (maintain status quo)
- Do not write directly to code files

---

## Related specifications

The following files in the HolyAutomater monorepo have details (`workflow/` is not included in Nora-lab, so
Write it as a path within the monorepo instead of a link. #2643):

- `workflow/docs/spec/xp-reviewer-skill.md` — Detailed specifications
- `workflow/docs/spec/xp-director-allgreen-pr.md` — Entire AllGREEN flow
- `workflow/docs/reference/xp-reviewer-skill.md` — Command reference
