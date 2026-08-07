# sub-issue-completion-reporting E2E Tests

## ユーザーシナリオ概要

サブイシュー完了報告と親イシュー受け入れ確認の分離が SKILL.md に正しく記述されていることを検証する。xp_Auditor が完了時に親イシューへコメントし、xp_Director が全完了時に受け入れテストを実行するフローを確認する。

関連イシュー: #243

## 前提条件

- `SoloXP/skills/xp_Auditor/SKILL.md` が存在すること
- `SoloXP/skills/xp_Director/SKILL.md` が存在すること

## Given/When/Then ステップ

### AC1: サブイシュー完了時に親イシューへ完了報告する

| # | Given | When | Then |
|---|---|---|---|
| 1 | xp_Auditor SKILL.md が存在する | 親イシューへの完了報告処理を検索する | 親イシューへの完了報告処理が記載されている |
| 2 | xp_Auditor SKILL.md が存在する | 完了報告フォーマットを検索する | `残り: #xx` 形式のフォーマットが定義されている |
| 3 | xp_Auditor SKILL.md が存在する | GREEN 後の親イシューコメント処理を検索する | GREEN 確認後に親イシューへコメントするステップが明記されている |

### AC2: 全サブイシュー完了時に親イシューの受け入れテストを実行する

| # | Given | When | Then |
|---|---|---|---|
| 4 | xp_Director SKILL.md が存在する | 全完了検出処理を検索する | 全サブイシュー完了の検出処理が記載されている |
| 5 | xp_Director SKILL.md が存在する | E2E 受け入れテスト実行フローを検索する | 受け入れテスト/E2E 実行への言及がある |
| 6 | xp_Director SKILL.md が存在する | テスト通過時フローを検索する | 通過時の親 PR 発行・Close フローが記載されている |
| 7 | xp_Director SKILL.md が存在する | テスト失敗時フローを検索する | 失敗時の新サブイシュー起票・親イシュー継続フローが記載されている |

### 構造的整合性チェック

| # | Given | When | Then |
|---|---|---|---|
| 8 | SoloXP/skills ディレクトリが存在する | xp_Auditor SKILL.md の存在を確認する | ファイルが存在する |
| 9 | SoloXP/skills ディレクトリが存在する | xp_Director SKILL.md の存在を確認する | ファイルが存在する |

## カバレッジサマリー

- テストファイル: `SoloXP/tests/e2e/sub-issue-completion-reporting.test.js`
- テスト数: 9件
