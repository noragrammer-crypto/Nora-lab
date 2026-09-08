# Unit Test: issue-3217 xp-doc-spec-review-workflow-worklog-issue-gh-cli-fallback

対象ファイル: `SoloXP/tests/unit/issue-3217-xp-doc-spec-review-workflow-worklog-issue-gh-cli-fallback.unit.test.js`
検証対象: `SoloXP/skills/xp_doc_spec/SKILL.md` / `xp_review_workflow/SKILL.md` / `xp_worklog/SKILL.md` / `xp_issue/SKILL.md`

## 背景

状態確認・集計系の `gh` コマンド（`gh issue view --json state` / `gh issue list` / `gh pr list` /
`gh label create` / `gh repo view`）が `gh` CLI に固定依存していた。ClaudeCodeWeb環境では `gh` CLIが
使えないため、`xp_issue2md`（#3204）で確立した「gh優先→失敗時MCPフォールバック→フィールド正規化」
パターンを適用した（#3205調査で判明、#3217）。

## テストケース

1. xp_doc_spec: `gh issue view --json state` に `mcp__github__issue_read` フォールバックが明記されている
2. xp_review_workflow: `gh issue list` による従来経路がそのまま残っている（回帰防止）
3. xp_review_workflow: `gh issue list` に `mcp__github__list_issues` フォールバックが明記されている
4. xp_review_workflow: `gh pr list` に `mcp__github__list_pull_requests` フォールバックが明記されている
5. xp_worklog: オープンイシュー数カウントの `gh issue list` に `mcp__github__list_issues`（ページング含む）フォールバックが明記されている
6. xp_issue: `gh label create` のMCP側ギャップと代替手段（xp_Architectと同様）が明記されている
7. xp_issue: `gh repo view` のMCP経由時の扱い（owner/repo明示解決）が明記されている

## 実行結果

- 実装と同時にテスト作成したためRED状態は未計測。実装後: PASS 7件 / FAIL 0件（GREEN）
- 関連回帰確認: `SoloXP/tests/unit` 全35スイート（PASS 276件）

## 補足

`dotfiles/.claude/skills/xp_doc_spec` ・ `xp_review_workflow` ・ `xp_worklog` ・ `xp_issue` の各
`SKILL.md` は `SoloXP/skills/xp_*` を正本として pre-push hook（`.claude/hooks/pre-push.sh`）が
自動同期するが、本修正ではテストGREEN確認のため `dotfiles/` 側の実体コピーも手動で同期した
（`.claude/skills/` は正本への symlink のため対応不要）。
