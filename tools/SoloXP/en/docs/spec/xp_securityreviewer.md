# xp_SecurityReviewer functional specification

## Overview

xp_SecurityReviewer is a security review skill.
After xp_Director confirms AllGREEN and E2E GREEN, it calls `xp_Reviewer` (code review),
Conduct a review from a security perspective before issuing a PR.

`xp_Reviewer` is responsible for reviewing bugs, quality, and rules, while xp_SecurityReviewer is responsible for reviewing bugs, quality, and regulations.
Specializes in security aspects such as injection, authentication and authorization, secret leakage, and known vulnerabilities in dependencies.

---

## Command

| Command | Description |
|---|---|
| `xp_SecurityReviewer <epic> <issue>` | Security review the current PR/branch and record the results as an issue comment |

---

## Call timing

Called from the AllGREEN flow of xp_Director, just after `xp_Reviewer` and before `xp_Auditor doc`:

```
AllGREEN（全サブイシュー完了マーカー確認）
  → xp_Auditor test（Story-level 受け入れテスト） → ✅ GREEN
  → xp_Reviewer（コードレビュー）
  → xp_SecurityReviewer（セキュリティレビュー）
  → xp_Auditor doc（ドキュメントチェック）
  → xp_RunE2ETests（E2Eテストスイート確認）
  → spec_update完了確認・全サブタスクPRマージ確認
  → main向けPR発行 → イシュークローズ
```

For detailed procedures and gate conditions, refer to `xp_director.md` "AllGREEN → xp_Auditor Story-level delegation flow".

---

## Review execution method

Call the built-in skill `security-review` (`/security-review`) via Skill tool.
If the call cannot be made (tool not supported, error, empty response), record the error details and skip the review.
Report this to xp_Director (does not block PR issuance). In this case too, in the issue comment
Explicitly record `[SecurityReviewer完了]` (this is to prevent omissions in the record since steps 3 and 4 of the normal route are not passed through).

---

## Risk classification and response

| security-review output | xp risk classification | response |
|---|---|---|
| Critical/High (exploitable vulnerabilities, secret leaks, authentication/authorization flaws, etc.) | High Risk | Issue comment record + Automatically raise improvement recommendation issues (Label: `bug`) |
| Medium (implementation that is defensive but has room for improvement, etc.) | Medium (Medium Risk) | Issue comment only (no user action required) |
| Low Info (minor indication) | Low Risk | Issue comment only (no user action required) |

---

## Stage comments

`[SecurityReviewer実行中]` at the start of the review, report record (improvement recommendation issue raised if applicable)
Log `[SecurityReviewer完了]` in issue after completion.

---

## Output

### Issue comment (required)

```markdown
## xp_SecurityReviewer レポート

### 高リスク指摘（High Risk）
<指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<指摘一覧。なければ「なし」>

### 総評
<全体的なセキュリティ評価>
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

- Do not block work just by raising a high risk issue (Similar to `xp_Reviewer`, raise a separate improvement recommendation issue and do not block the current PR issue itself)- No user action required for risks below medium (maintain status quo)
- Do not write directly to code files

---

## Changelog

| Date | Version | Changes | Issue |
|---|---|---|---|
| 2026-08-20 | 1.0.0 | New creation | #1688, #3026 |
| 2026-08-20 | 1.1.0 | Added stage comments (`[SecurityReviewer実行中]`/`[SecurityReviewer完了]`) | #1688, #3027 |
| 2026-08-20 | 1.2.0 | Corrected the call timing diagram to the actual AllGREEN flow order (including xp_Auditor doc, xp_RunE2ETests, etc.) | #1688, #3029 |
| 2026-08-20 | 1.2.1 | Fixed the omission of recording of `[SecurityReviewer完了]` in the fallback route when security-review cannot be called (clarified because it does not go through steps 3 and 4 of the normal route) | #1688, PR #3034 |
| 2026-08-29 | 1.3.0 | Added `mcp__github__issue_write` fallback to `gh issue create` of the improvement recommendation issue | #3205, #3216 |
