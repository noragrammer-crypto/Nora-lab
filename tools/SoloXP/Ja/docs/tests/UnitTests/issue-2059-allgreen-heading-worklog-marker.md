# Unit Test: issue-2059 allgreen-heading-worklog-marker

対象ファイル: `SoloXP/tests/unit/issue-2059-allgreen-heading-worklog-marker.unit.test.js`
検証対象: `dotfiles/.claude/skills/xp_Director/SKILL.md`, `SoloXP/skills/xp_Director/SKILL.md`

## 背景

`tests/e2e/issue-1410-worklog-markers.test.js`（#1410）は、xp_Director SKILL.md の AllGREEN フローセクションの
見出しに `AllGREEN チェック` という部分文字列が含まれ、かつそのセクション内に `作業完了` の記録指示が
含まれることを期待している。しかし現行の見出し（`e.【参考・このランでは実行しない】AllGREENフローについて`）には
`AllGREEN チェック` という文字列が含まれておらず、E2Eテストの抽出関数（`extractAllGreenSection`）が
セクションを特定できずに `null` を返し、テストが失敗している（#1410 リグレッション、#2059）。

## テストケース

`dotfiles/` と `SoloXP/` の両コピーそれぞれについて（`describe.each`）:

1. `AllGREEN チェック` を含む見出しが存在し、AllGREENセクションが抽出できる
2. 抽出したセクションに「作業完了」記録指示が含まれる

いずれも、E2Eテスト（`issue-1410-worklog-markers.test.js`）の `extractAllGreenSection()` と
同一の正規表現を用いてセクションを抽出し、E2Eテストとの整合を保っている。

## 実行結果（バグ再現時点、#2792）

FAIL 4件 / PASS 0件（想定通りRED＝バグ再現）

## 実行結果（修正後、#2793）

見出しを `e.【参考・このランでは実行しない】AllGREEN チェック・AllGREENフローについて` に修正した結果、
PASS 4件 / FAIL 0件（GREEN）。既存145件（`SoloXP/`単体テスト）も回帰なし。
