# xp_review_workflow functional specifications

## Overview

xp_review_workflow is a skill responsible for reviewing workflows and detecting deviations.
Analyze comment patterns in issue logs and identify differences from expected workflow achievement conditions.
Report only one improvement proposal. **Do not modify files. It ends with just a report. **

## Command

### `/xp_review_workflow`

Looking back at the XP skills workflow,
“If this part had been written like this, it would have worked better.”
Identify and report **just one** location.

---

## Constraints

- Do not make suggestions that conflict with Nora's policies or judgments.
- Just "Improving the writing style to make it easier for Claude to work"
- **Only one point**. Do not list multiple

---

## Workflow expected achievement conditions (normal completion conditions)

Comment patterns indicating successful completion of each skill (expected achievement conditions):

| Skills | Expected achievement conditions |
|---|---|
| xp_Architect | `[Architect完了]` or sub-issue publication comment |
| xp_Tester | `[Tester完了]` |
| xp_Implementer | `[Implementer完了]` |
| xp_Auditor (test) | `[Auditor GREEN]` |
| xp_Auditor (doc) | `[PR発行済み #\d+]` |
| xp_Documenter | `[Documenter完了]` |

---

## Deviation detection logic

Identify deviant issues using the following patterns:

- Issues without `[Implementer実行中]` after `[Tester完了]`
- Issues without `[Auditor GREEN]` after `[Implementer完了]`
- Issues where the same phase is repeated three or more times (remand loop)
- Issues with `[PR発行済み]` recorded without `[Auditor GREEN]`

---

## Identify the cause SKILL

If a deviation is found, identify which SKILL.md is the cause (identifying the cause SKILL).

1. Identify the deviation phase (after which skill comment the problem occurred)
2. Read the SKILL.md of the skill in charge
3. Look for vague instructions, missing assumptions, and contradictory statements.

---

## Report format

```
## ワークフロー振り返り

### 課題箇所
<スキル名>の「<セクション名>」

### 現状の書き方の問題
<具体的に何が起きたか / どう誤解されたか>

### 改善案（一言）
<どう書き直せばよいか>

### 根拠となったイシュー
- #<番号> <タイトル>（<理由>）
```

---

## GitHub access method/MCP fallback

Issue/PR log acquisition (`gh issue list` / `gh pr list`) is not possible in environments where `gh` cannot be used (such as ClaudeCodeWeb).
`mcp__github__list_issues` / `mcp__github__list_pull_requests` (Page to get up to 200 results)
(pattern established in `xp_issue2md`〈#3204〉. #3217).

---

## Notes

- Points are fact-based. Do not include guesses that are not recorded in the issue log.
- The improvement proposal is a modification of the "writing style" of the skill definition (do not propose implementation changes or policy changes)
- This skill does not modify files. End with just a report
