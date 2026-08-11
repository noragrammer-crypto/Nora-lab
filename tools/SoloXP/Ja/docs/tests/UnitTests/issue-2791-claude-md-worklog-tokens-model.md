# Unit Test: issue-2791 claude-md-worklog-tokens-model

対象ファイル: `SoloXP/tests/unit/issue-2791-claude-md-worklog-tokens-model.unit.test.js`
検証対象: `CLAUDE.md`（リポジトリルート、「作業時間記録ルール」節）

## 背景

`SoloXP/tests/e2e/issue-1461-ai-dev-cost-token-tracking.test.js`（#1461）の「前提条件: CLAUDE.md に
トークン消費記録フォーマットが定義されている」ブロックは、CLAUDE.md の「作業時間記録ルール」節本文に
`tokens:` / `model:` フォーマット例とフォーマット崩れ時のユーザー確認方針が直接記載されていることを
期待している。しかし現行の CLAUDE.md 同節は `docs/worklog-format.md` への参照のみで、期待する文言が
本文から失われている（#1461 リグレッション、#2791）。

本タスク（#2799、`task_type: bug_reproduction_test`）は、このバグを E2E スイート全体を回さずに単体で
再現・固定するためのユニットテストを追加した。

## テストケース

E2Eテスト（`issue-1461-ai-dev-cost-token-tracking.test.js`）の「前提条件」ブロックと同一の抽出ロジック・
正規表現を用いて、以下4件を検証する:

1. 「作業時間記録ルール」セクション本文に `tokens:` が含まれる
2. `tokens:.*prompt=.*completion=.*total=` パターンにファイル全体のどこかでマッチする
3. 「作業時間記録ルール」セクション本文に `model:` が含まれる
4. 「作業時間記録ルール」セクション本文にフォーマット崩れ時のユーザー確認方針への言及がある
   （`/tokens.*confirm|confirm.*tokens|フォーマット.*tokens|tokens.*フォーマット/i`）

## 実行結果（バグ再現時点、#2799）

FAIL 4件 / PASS 0件（想定通りRED＝バグ再現）。既存151件（`SoloXP/`単体テスト）・50件（機能テスト）も回帰なし。

修正タスク #2800 で CLAUDE.md「作業時間記録ルール」節に `tokens:` / `model:` フォーマット例を追記した後、
本テストがGREEN化することを受け入れ基準とする。
