---
issue: 1199
title: "[Task] 機能仕様書更新"
state: closed
labels: [task, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-09T01:35:36Z
epic: CodeCompass
---

# #1199 [Task] 機能仕様書更新

## 本文

## 概要
ストーリー #1178 の実装内容を spec/ に反映する。
全実装タスク完了後に実施する。

記載内容:
- `CodeCompass/lib/hotspot.js` の API 仕様
- `analyzeHotspots` 関数の入出力フォーマット
- 密度スコア算出アルゴリズムの説明
- `hotspots.md` / `hotspots.json` の出力形式

## 見積もり
1pt — 機能仕様書の更新・整備

## 依存関係
このタスクは全実装タスク（#1197, #1198）の完了後に着手すること。
（全実装タスクに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #1197, #1198

## 親ストーリー
#1178

## 親ブランチ
feature/issue-1178

## 備考
task_type: spec_update
xp_Director はこのタスクを xp_doc_spec CodeCompass 1178 で処理すること。

## 実施内容

### 更新ファイル

- `CodeCompass/docs/spec/hotspot-engine.md` — ホットスポット判定エンジン仕様書（作成済み）
- `CodeCompass/docs/spec/README.md` — 索引のイシュー状態更新
- `CodeCompass/docs/issues/issue-1198.MD` — state: open → closed に更新

### 確認結果

`hotspot-engine.md` と実装（`lib/hotspot.js`, `scripts/hotspot.js`）を照合した結果、
以下の全項目が正確に記載済みであることを確認した：

| 項目 | 状態 |
|------|------|
| `CodeCompass/lib/hotspot.js` の API 仕様（mergeData / computeHotspotScores / analyzeHotspots） | ✅ |
| `analyzeHotspots` 関数の入出力フォーマット | ✅ |
| 密度スコア算出アルゴリズム `(changes × complexity) / loc` の説明 | ✅ |
| `hotspots.json` の出力形式（フィールド定義付き） | ✅ |
| `hotspots.md` の出力形式（Markdown テーブル） | ✅ |
| CLI インターフェース（parseArgs / main / --outDir / --out / --md） | ✅ |
| ゼロ除算回避ルール（loc=0 または complexity=0 → hotspotScore=0） | ✅ |
