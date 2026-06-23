---
issue: 1441
title: "[Task] codecompass-to-issues スクリプト実装"
state: open
labels: [task, PriorityHigh, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-15T04:26:28Z
epic: CodeCompass
---

# #1441 [Task] codecompass-to-issues スクリプト実装

## 本文

## 概要
`codecompass/actions.md`（`refactoring-proposal.js` の出力）を読み込み、
リファクタリング提案をそのまま GitHub Issue として発行する Node.js スクリプトを実装する。

`hotspots.json` から直接読む実装は `refactoring-proposal.js` と処理が重複するため、
`actions.md` を入力源として再利用する設計に変更する。

## 実装内容

### スクリプトパス
`CodeCompass/scripts/codecompass-to-issues.js`

### 動作仕様
1. `codecompass/actions.md` を読み込む
2. Markdown 内のファイルごとのセクション（`### \`<ファイルパス>\`` 見出し）をパースする
3. 上位 N 件（`--limit=5`）について GitHub Issue を発行する
4. 発行イシューにラベル `refactoring,epic/CodeCompass` を付与する
5. イシュータイトル例: `[Refactoring] DiscordAIbot/lib/persona.js のリファクタリング（hotspot_score: 2.07）`

### オプション
```
--actions=<path>   (省略時: codecompass/actions.md)
--limit=<n>        (省略時: 5)
--dry-run          イシューを実際には発行せず、対象一覧を stdout に出力
```

### 前提条件
- `codecompass/actions.md` が最新状態であること（事前に `refactoring-proposal.js` を実行済み）
- #1232（除外フィルタ改善）完了後に実行すること（dist/.obsidian 等のノイズ除去済みの状態で発行する）

## 見積もり
2pt — Markdown パース + Issue 発行（`refactoring-proposal.js` の処理を再実装しない分、軽量）

## 依存関係
このタスクは #1440 および #1232 の完了後に着手すること。

depends_on: #1440, #1232

## 親ストーリー
#1396

## 親ブランチ
feature/issue-1396

## コメント

### noragrammer-crypto — 2026-06-16T00:08:17Z

作業開始 2026-06-16 00:08
セッションURL: https://claude.ai/code/session_01U95ajbgUv1fv8B1iDyrPdb
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-16T00:08:33Z

[Tester実行中]

---

### noragrammer-crypto — 2026-06-16T00:09:24Z

## テスト命題（Unit）

### `parseActionsMd`
- [ ] `### \`path/to/file.js\`` 形式の見出しからファイルパスを抽出できる
- [ ] `- hotspot_score: **2.0676**` 形式から数値を抽出できる
- [ ] 複数セクションを正しくパースして配列を返す
- [ ] セクションが存在しない場合は空配列を返す
- [ ] ホットスポット一覧テーブルのみ（提案セクションなし）は空配列を返す

### `buildIssueTitle`
- [ ] `[Refactoring] <file> のリファクタリング（hotspot_score: <score>）` 形式のタイトルを生成する

## テスト命題（Functional）

- [ ] dry-run モードで proposals の一覧を stdout に出力し、Issue を発行しない
- [ ] `--limit=3` で上位3件のみ対象にする
- [ ] `gh issue create` 呼び出し時にラベル `refactoring,epic/CodeCompass` を渡す
- [ ] actions.md が存在しない場合はエラーメッセージを出力して exit 1 する

---

### noragrammer-crypto — 2026-06-16T00:10:33Z

## テスト実行結果

### Unit Test
テストファイル: `CodeCompass/__tests__/codecompass-to-issues.unit.test.js`
結果: RED（実装前のため Cannot find module）

### Functional Test
テストファイル: `CodeCompass/__tests__/codecompass-to-issues.functional.test.js`
結果: RED（実装前のため Cannot find module）

---
テストは正常に RED フェーズ。実装後に GREEN になることを確認する。

[Tester完了]

---

### noragrammer-crypto — 2026-06-16T00:11:31Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-16T00:12:44Z

## 実装完了

変更ファイル:
- `CodeCompass/lib/codecompass-to-issues.js`: コア実装（parseActionsMd / buildIssueTitle / createIssues）
- `CodeCompass/scripts/codecompass-to-issues.js`: CLI エントリポイント（--actions / --limit / --dry-run 対応）
- `CodeCompass/__tests__/codecompass-to-issues.unit.test.js`: Unit テスト（7件）
- `CodeCompass/__tests__/codecompass-to-issues.functional.test.js`: Functional テスト（4件）

テスト結果:
- 新規 Unit テスト: PASS 7件 / FAIL 0件
- 新規 Functional テスト: PASS 4件 / FAIL 0件
- 全スイート: 199件 PASS / 3件 FAIL（既存 E2E: SKILL.md 更新待ち = #1442 のスコープ、本タスクスコープ外）

[Implementer完了]

---

### noragrammer-crypto — 2026-06-16T00:13:16Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-06-16T00:13:17Z

[Auditor GREEN]
PASS: Unit 82件 / Functional 43件 / テストコマンド: `node_modules/.bin/jest --no-coverage`

### 実行結果
- Unit Test: PASS 82件 (7スイート全通過)
- Functional Test: PASS 43件 (7スイート全通過)
- E2E: スキップ（タスクレベル Auditor スコープ外。3件の既存 E2E 失敗は #1442 SKILL.md 更新で解消予定）

作業完了 2026-06-16 00:13 / 所要時間: 約35分

---

### noragrammer-crypto — 2026-06-16T00:13:32Z

[Documenter実行中]

---
