---
model: claude-sonnet-4-6
---

# XP SecurityReviewer Skill

## Command

### `xp_SecurityReviewer <epic> <issue>`

Perform security reviews on current PR/branch changes and record results as issue comments.
Significant findings (High Risk) will automatically raise an issue with recommendations for improvement.

`xp_Reviewer` (Code review: bugs, quality, rules perspective) and responsibilities are separated, and this skill is from a security perspective
(Specializes in injection, authentication and authorization, secret leakage, known vulnerabilities in dependencies, etc.).

---

## Responsibilities

- Call built-in skill `security-review` (`/security-review`) to perform security review
- Record review results as issue comments
- Automatically raise improvement recommendation issues for serious points (High Risk)
- For Medium Risk / Low Risk, only comments (no user action required)

---

## Processing flow

### 0. Recording stage comments

Record `[SecurityReviewer実行中]` to the issue when the review starts. Step 3 (recording in issue comment)・
If applicable, record `[SecurityReviewer完了]` after completing step 4 (improvement recommendation issue filing).

### 1. Perform a review

**How to call:**

Call `security-review` in the skill tool (pending changes, uncommitted changes on the current branch)
If not, the differences with the base branch will be reviewed).

```
Skill: security-review
```

**Fallback when SOLOXP_INLINE_11__ cannot be called (tool not supported/error):**

**Activation conditions (activated if any one of them applies):**
- The skill tool call itself fails with an error or timeout.
- `security-review` is not found/unavailable error is returned
- The call was successful, but the output does not contain any content that can be used to determine whether or not there is an issue (empty response/format collapse)

**Confirmation steps:**
1. Record any error messages or insufficient output as they occur.
2. Record the following in the issue and report it to xp_Director (do not block the PR, leave it to xp_Director to proceed to the next step <`xp_Auditor doc`> without interruption):
   ```
   ## xp_SecurityReviewer レポート

   ⚠️ security-review 呼び出し失敗
   理由: <エラー内容>
   セキュリティレビューは未実施です。手動確認を推奨します。

   [SecurityReviewer完了]
   ```
   This fallback route does not go through steps 3 and 4 (recording issue comments and filing improvement recommendation issues).
   `[SecurityReviewer完了]` must be explicitly recorded in step 2 (if you forget to record it, the issue will be raised).
   `[SecurityReviewer実行中]` appears to be stuck, and the AllGREEN flow is progressing but is in a completed state.
   result in an inconsistency).

### 2. Risk classification

Map the findings output by `security-review` (severity: Critical / High / Medium / Low, etc., depending on the review content) to xp's risk classification using the following criteria:

| security-review output | xp risk classification |
|---|---|
| Critical/High (exploitable vulnerabilities, secret leaks, authentication/authorization flaws, etc.) | High Risk |
| Medium (defensive implementation with room for improvement, deprecated patterns, etc.) | Medium Risk |
| Low・Info (minor indication, deviation from best practice) | Low Risk |
| No indication | None |

| Risk level | Response |
|---|---|
| High Risk | Issue comment record + Automatically raise improvement recommendation issue || Medium Risk | Issue comments only (no user action required) |
| Low Risk | Issue comments only (no user action required) |

### 3. Record in issue comment

Record (write) review results as issue comments in the following format:

```markdown
## xp_SecurityReviewer レポート

### 高リスク指摘（High Risk）
<高リスクの指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<中程度・低リスクの指摘一覧。なければ「なし」>

### 総評
<全体的なセキュリティ評価>
```

### 4. Raise an issue to recommend improvements for high-risk issues

If there is one or more High Risk findings, issue an improvement recommendation issue for each finding:

```bash
gh issue create \
  --repo <owner>/<repo> \
  --title "[改善勧告] <指摘の概要>" \
  --body "<詳細な説明・影響範囲・修正方法の提案>" \
  --label "bug"
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__issue_write` (owner, repo, method: `create`, title, body,
labels: [`bug`]) (pattern established in `xp_issue2md`〈#3204〉. #3216).

Add the raised issue number to the comment of the review report.

---

## Call timing from xp_Director

From the AllGREEN flow of `xp_Director` (after confirming Story-level `xp_Auditor test` GREEN), immediately after `xp_Reviewer`
Called before issuing a PR to `xp_Auditor doc` and `main`. See `xp_Director` SKILL.md for details.

---

## Notes

- Do not block work only by filing a high risk issue (it will be raised separately as an improvement recommendation issue, and the current PR issue itself will not be blocked. Same operation as xp_Reviewer)
- For risks of medium or lower, the status quo will be maintained if there is no action from the user.
- Do not write directly to code files
