---
issue: 1198
title: "[Task] ホットスポット判定エンジン実装"
state: closed
labels: [task, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-09T01:35:28Z
epic: CodeCompass
---

# #1198 [Task] ホットスポット判定エンジン実装

## 本文

## 概要
変更頻度（`analyzeChangeFrequency`）と複雑度スコア（`analyzeComplexity`）を統合し、
密度スコア `(changes × complexity) / loc` でホットスポットをランキングする。

### 実装内容
- `CodeCompass/lib/hotspot.js` — コアロジック
  - `analyzeHotspots({ repoPath, days? })` 関数を実装
  - 両データセットをファイル名で結合し密度スコアを算出
  - スコア降順でソートした配列を返す
- `CodeCompass/scripts/hotspot.js` — CLI ランナー
  - コマンドライン引数でリポジトリパスを受け取る
  - `codecompass/hotspots.md`（人間用ランキング表）を出力
  - `codecompass/hotspots.json`（xp_Architect 連携用 JSON）を出力
- `CodeCompass/__tests__/hotspot.unit.test.js` — ユニットテスト
- `CodeCompass/__tests__/hotspot.functional.test.js` — 機能テスト

### 出力フォーマット（hotspots.json）
```json
[
  {
    "file": "path/to/file.js",
    "hotspotScore": 0.82,
    "complexity": 34,
    "changes": 120,
    "loc": 250,
    "linesChanged": 1800
  }
]
```

### 注意点
- LOC が 0 のファイルはゼロ除算を避けるため hotspotScore = 0 とする
- complexity が 0 のファイル（単純ファイル）は hotspotScore = 0 とする
- 変更頻度データに存在しないファイル（変更なし）は changes = 0 として扱う

## 見積もり
2pt — コアロジック + CLI スクリプト + テスト

## 依存関係
なし（即着手可能。E2Eテストスイートと並行実施可）

## 親ストーリー
#1178

## 親ブランチ
feature/issue-1178

## コメント

### noragrammer-crypto — 2026-06-09T01:48:59Z

作業開始 2026-06-09 01:55

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-09T01:49:52Z

[Tester実行中]

---

### noragrammer-crypto — 2026-06-09T01:50:56Z

[Tester完了]
[Implementer実行中]

---

### noragrammer-crypto — 2026-06-09T01:52:27Z

[Implementer完了]
[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-06-09T01:53:03Z

[Auditor GREEN]
PASS: 74件 / テストコマンド: `npx jest CodeCompass --no-coverage`

Unit: 10件 PASS / Functional: 7件 PASS / その他既存テスト: 57件 PASS（リグレッションなし）

---

### noragrammer-crypto — 2026-06-09T01:53:07Z

作業完了 2026-06-09 02:00 / 所要時間: 5分

---
