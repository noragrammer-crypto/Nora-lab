# Unit Test: issue-3216 xp-auditor-reviewer-secreviewer-gh-cli-fallback

対象ファイル: `SoloXP/tests/unit/issue-3216-xp-auditor-reviewer-secreviewer-gh-cli-fallback.unit.test.js`
検証対象: `SoloXP/skills/xp_Auditor/SKILL.md` / `xp_Reviewer/SKILL.md` / `xp_SecurityReviewer/SKILL.md`

## 背景

`xp_Auditor`・`xp_Reviewer`・`xp_SecurityReviewer` のissue作成・コメント系の `gh` コマンド
（`gh issue comment` / `gh issue create` / `gh issue view --json state`）が `gh` CLI に固定依存していた。
ClaudeCodeWeb環境では `gh` CLIが使えないため、`xp_issue2md`（#3204）で確立した
「gh優先→失敗時MCPフォールバック→フィールド正規化」パターンを適用した（#3205調査で判明、#3216）。

## テストケース

1. xp_Auditor: 重複検知の `gh issue comment` に `mcp__github__add_issue_comment` フォールバックが明記されている
2. xp_Auditor: バグ起票の `gh issue create` に `mcp__github__issue_write`（method: create）フォールバックが明記されている
3. xp_Auditor: 親イシュー状態確認（`gh issue view --json state`）に `mcp__github__issue_read` フォールバックが明記されている
4. xp_Auditor: 完了報告の `gh issue comment`（親イシューへの記録）に `mcp__github__add_issue_comment` フォールバックが明記されている
5. xp_Reviewer: 改善勧告イシュー起票の `gh issue create` に `mcp__github__issue_write` フォールバックが明記されている
6. xp_SecurityReviewer: 改善勧告イシュー起票の `gh issue create` に `mcp__github__issue_write` フォールバックが明記されている

## 実行結果

- 修正前（バグ再現時点）: PASS 1件 / FAIL 5件（想定通りRED。親イシュー状態確認のみ既存のMCP併記で先行GREEN）
- 修正後（各gh issue comment/createにMCPフォールバックを追記）: PASS 6件 / FAIL 0件（GREEN）
- Codexレビュー指摘反映後（`mcp__github__issue_write` / `mcp__github__add_issue_comment` の必須引数 `owner`/`repo`〈add_issue_commentは`issue_number`/`body`も〉の明記を追加、各テストにアサーション追加）: PASS 6件 / FAIL 0件（GREEN）
- 関連回帰確認: `SoloXP/tests/unit` 全34スイート（PASS 269件）

## 補足

`dotfiles/.claude/skills/xp_Auditor` ・ `xp_Reviewer` ・ `xp_SecurityReviewer` の各 `SKILL.md` は
`SoloXP/skills/xp_*` を正本として pre-push hook（`.claude/hooks/pre-push.sh`）が自動同期するが、
本修正ではテストGREEN確認のため `dotfiles/` 側の実体コピーも手動で同期した
（`.claude/skills/` は正本への symlink のため対応不要）。
