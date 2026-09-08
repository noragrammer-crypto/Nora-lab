# Unit Test: issue-3204 xp-issue2md-gh-cli-fallback

対象ファイル: `SoloXP/tests/unit/issue-3204-xp-issue2md-gh-cli-fallback.unit.test.js`
検証対象: `SoloXP/skills/xp_issue2md/SKILL.md`

## 背景

`xp_issue2md/SKILL.md` の Issue 取得処理が `gh issue view` に固定依存しており、ClaudeCodeWeb 等
`gh` CLI が利用できない環境（GraphQL クエリがセッションで無効化され `HTTP 403` になるケースを含む）
では `xp_issue2md` が完走できなかった（#3204）。GitHub MCP ツール（`mcp__github__issue_read`）への
フォールバックを追加し、取得手段によらず同一のMarkdownが生成されるようにした。

## テストケース

1. `gh issue view` による従来経路がそのまま残っている（回帰防止）
2. `gh` CLI が使えない場合の GitHub MCP フォールバック（`mcp__github__issue_read`）が明記されている
3. フォールバックが issue 本文取得（`get`）とコメント取得（`get_comments`）の両方をカバーする
4. フォールバック発動条件（gh 未導入・認証エラー・403等で「使えない」場合）が明記されている
5. コメントが100件を超える場合のページング（`page`/`perPage`）継続取得に触れている
6. 取得手段によらず同一の正規化済みフィールドに揃える方針が明記されている
7. 正規化対象フィールド（title/body/state/labels/author/createdAt）が明記されている
8. 「注意事項」がgh失敗時の即エラー終了ではなく、まずMCPフォールバックへ切り替える旨を反映している
9. #2757 で修正済みのリポジトリハードコード（`--repo noragrammer-crypto/HolyAutomater`）が再発していない（回帰防止）

## 実行結果

- 修正前（バグ再現時点）: PASS 3件 / FAIL 6件（想定通りRED。MCPフォールバック未記載・正規化方針未記載・注意事項未更新の3系統）
- 修正後（手順1にMCPフォールバック分岐・正規化フィールド対応表を追記、注意事項を更新）: PASS 9件 / FAIL 0件（GREEN）
- 関連回帰確認: `issue-2757-xp-issue2md-hardcoded-repo.unit.test.js`（PASS 3件）、`SoloXP/tests/unit` 全体32スイート（PASS 251件）

## 補足

`dotfiles/.claude/skills/xp_issue2md/SKILL.md` は `SoloXP/skills/xp_*` を正本として pre-push hook
（`.claude/hooks/pre-push.sh`）が自動同期するため、本修正では `SoloXP/skills/xp_issue2md/SKILL.md`
のみを編集した。
