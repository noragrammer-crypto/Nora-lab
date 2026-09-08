---
model: claude-sonnet-4-6
---

# XP Reviewer Skill

## Command

### `xp_Reviewer <epic> <issue>`

Review the code in the current PR/branch and record the results as issue comments.
High Risk issues are automatically raised as improvement recommendation issues.

---

## Responsibilities

- Call the `code-reviewer` subagent (provided by feature-dev plugin) to perform code review
- Record review results as issue comments
- Automatically raise improvement recommendation issues for High Risk findings
- For Medium Risk / Low Risk, only comments (no user action required)

---

## Processing flow

### 1. Perform a review

**Calling method (preferred):**

Call the Agent tool passing the following:
- `subagent_type`: `code-reviewer`
- `prompt`: Indicates that the current branch's `git diff` (if there are no uncommitted changes, the difference from the base branch) will be subject to review,
  Specify that compliance with the terms and conditions listed in CLAUDE.md is also included in the scope of confirmation.
- `isolation`: Not specified (worktree is not required as it is completed with only read-only tools)

**Mapping of output to risk classification:**

`code-reviewer` only returns indications with confidence ≥ 80 in two stages: Critical / Important. Map the risk categories in step 2 as follows:

| code-reviewer output | xp risk classification |
|---|---|
| Critical (Bug Security) | High Risk |
| Important (Quality/Terms Violation) | Medium Risk |
(Since confidence < 80 is not originally reported, low risk basically does not occur. If it is pointed out, it will be treated as low risk) | Low Risk |

**Fallback when SOLOXP_INLINE_11__ cannot be called (tool not supported/error):**

**Activation conditions (activated if any one of them applies):**
- The call to the Agent tool itself fails with an error timeout.
- `subagent_type: code-reviewer` is not found/unavailable error is returned
- The call was successful, but the output does not contain any content that can be used to determine whether there is an issue or its severity (empty response/format collapse)

**Confirmation steps:**
1. Record any error messages or insufficient output as they occur.
2. Call the built-in skill `/review` to perform an equivalent review:
   ```
   /review
   ```
3. Obtain the output report of `/review` and proceed to the following steps (risk classification/comment recording)

### 2. Risk classification

Classify each finding in the review report by risk level:

| Risk level | Response |
|---|---|
| High Risk | Issue comment record + Automatically raise improvement recommendation issue |
| Medium Risk | Issue comments only (comments only, no user action required) |
| Low Risk | Issue comments only (comments only, no user action required) |

### 3. Record in issue comment

Record (write) review results as issue comments in the following format:

```markdown
## xp_Reviewer レポート

### 高リスク指摘（High Risk）
<高リスクの指摘一覧。なければ「なし」>

### 中程度・低リスク指摘
<中程度・低リスクの指摘一覧。なければ「なし」>

### 総評
<全体的な品質評価>
```

### 4. Raise an issue to recommend improvements for high-risk issuesIf there is one or more High Risk findings, issue an improvement recommendation issue for each finding:

```bash
gh issue create \
  --repo <owner>/<repo> \
  --title "[改善勧告] <指摘の概要>" \
  --body "<詳細な説明・改善方法・影響範囲>" \
  --label "bug"
```

If `gh` cannot be used (such as ClaudeCodeWeb), use `mcp__github__issue_write` (owner, repo, method: `create`, title, body,
labels: [`bug`]) (pattern established in `xp_issue2md`〈#3204〉. #3216).

Add the raised issue number to the comment of the review report.

---

## Notes

- If the Auditor's decision is to close, you can close the parent issue.
- For risks of medium or lower, the status quo will be maintained if there is no action from the user.
- Do not write directly to code files
