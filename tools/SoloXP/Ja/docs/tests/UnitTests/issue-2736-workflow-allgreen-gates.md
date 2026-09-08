# issue-2736-workflow-allgreen-gates ユニットテスト

## テスト対象

`SoloXP/WORKFLOW.md`

「### 6. AllGREEN チェック → 受け入れテスト」節に、`SoloXP/skills/xp_Director/SKILL.md`
のAllGREENフロー（手順3-e）が必須としている5ゲート（Story-level Auditor実行・xp_Reviewer
レビュー・ドキュメントチェック・spec_update完了ゲート・全サブタスクPRのマージ確認）への
言及が存在することを検証する（Issue #2736 のバグ再現・回帰防止）。

## テストファイル

`SoloXP/tests/unit/issue-2736-workflow-allgreen-gates.unit.test.js`

## テストケース一覧

### `SoloXP/WORKFLOW.md AllGREEN節の必須ゲート記載`

| テストケース | 種別 | 内容 |
|---|---|---|
| AllGREENセクションが抽出できる | 正常系 | `### 6. AllGREEN チェック` 見出しから次の見出し直前までのセクションが抽出できること |
| Story-level Auditor実行（xp_Auditor test）への言及がある | バグ再現 | セクション内に `xp_Auditor test` の文字列があること |
| xp_Reviewer によるコードレビューへの言及がある | バグ再現 | セクション内に `xp_Reviewer` の文字列があること |
| ドキュメントチェック（xp_Auditor doc）への言及がある | バグ再現 | セクション内に `xp_Auditor doc` の文字列があること |
| spec_update タスク完了ゲートへの言及がある | バグ再現 | セクション内に `spec_update` の文字列があること |
| 全サブタスクPRのマージ確認への言及がある | バグ再現 | セクション内に `マージ確認` または `merged` の文字列があること |

## 実装メモ

- `#2926`（本バグの再現テストタスク）作成時点では、WORKFLOW.mdのAllGREEN節は
  「AllGREENの場合 → `xp_RunE2ETests` で受け入れテストを実行する → 通過なら親PR発行してClose」
  という単純な流れしか説明しておらず、上記5ゲートへの言及を欠いていた。5ゲート言及テストは
  `test.failing` で「既知の失敗」として登録し、`npm test` / `npm run test:unit` が常に非ゼロ
  終了する問題を回避した（PR #2928 Codexレビュー指摘）
- `#2927`（本バグの修正タスク）で WORKFLOW.md のAllGREEN節に5ゲートを箇条書きで追記し、
  5命題すべてが成立するようになったことを確認したうえで、`test.failing` を通常の `test()` に
  戻した（全6件GREEN）
- セクション抽出の正規表現は `### 6\. AllGREEN チェック` から次の `### ` / `## ` / `---` の
  直前までを対象とする（`#2059` の抽出パターンを踏襲）

## カバレッジサマリー

- AllGREENセクション抽出確認: 1件
- 必須5ゲートへの言及のバグ再現検証: 5件
- 合計: 6件
