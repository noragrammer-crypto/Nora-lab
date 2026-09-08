# Unit Test: issue-3214 xp-director-architect-gh-cli-fallback

対象ファイル: `SoloXP/tests/unit/issue-3214-xp-director-architect-gh-cli-fallback.unit.test.js`
検証対象: `SoloXP/skills/xp_Director/SKILL.md` / `SoloXP/skills/xp_Architect/SKILL.md`

## 背景

`xp_Director/SKILL.md` の「## GitHub アクセス方法」表が実態と逆になっていた
（Claude Code Web → `gh` コマンド／その他 → MCP経由、と記載されていたが、実際には
ClaudeCodeWeb は `gh` CLI が使えずMCP経由が必須、その他環境は `gh` が使える側）。
また `xp_Director`・`xp_Architect` の主要な `gh` コマンド（PRマージ確認・issue close・
main向けPR発行・サブイシュー紐付け・ラベル作成）に、`xp_issue2md`（#3204）で確立した
「gh優先→失敗時MCPフォールバック→フィールド正規化」パターンが未適用だった（#3205 調査で判明、#3214）。

## テストケース

1. 「## GitHub アクセス方法」セクションが存在する
2. Claude Code Web の行が MCP経由と記載されている（修正後の正しいマッピング）
3. ClaudeCodeWeb以外（ローカル等）の行が `gh` コマンドと記載されている
4. `gh pr list --search ... --state merged` に MCP フォールバック（`mcp__github__search_pull_requests` 等）が明記されている
5. `gh issue close` に `mcp__github__issue_write`（state: closed）フォールバックが明記されている
6. `gh pr create --base main` に `mcp__github__create_pull_request` フォールバックが明記されている
7. gh CLI が使えない場合のフォールバック発動条件（gh優先パターン）に言及している
8. xp_Architect: `gh api .../sub_issues`（POST）に `mcp__github__sub_issue_write` フォールバックが明記されている
9. xp_Architect: `gh label create` のMCP側ギャップと代替手段（頻出ラベル事前作成＋手動作成依頼）が明記されている
10. xp_Architect: ラベル欠落時、手動作成後に既存イシューへ遡って付与する必要があることが明記されている（Codexレビュー指摘: #3254）

## 実行結果

- 修正前（バグ再現時点）: PASS 1件 / FAIL 8件（想定通りRED。環境マッピングが逆＋MCPフォールバック未記載）
- 修正後（環境マッピング表を修正し、主要コマンドにMCPフォールバックを追記）: PASS 9件 / FAIL 0件（GREEN）
- Codexレビュー指摘反映後（ラベル遡及付与の必須明記を追加、テストケース10を追加）: PASS 10件 / FAIL 0件（GREEN）
- 関連回帰確認: `SoloXP/tests/unit` 全体33スイート（PASS 262件→263件）

## 補足

`dotfiles/.claude/skills/xp_Director/SKILL.md` ・ `xp_Architect/SKILL.md` は `SoloXP/skills/xp_*` を
正本として pre-push hook（`.claude/hooks/pre-push.sh`）が自動同期するが、本修正ではテストGREEN確認の
ため `dotfiles/` 側の実体コピーも手動で同期した（`.claude/skills/` は正本への symlink のため対応不要）。
