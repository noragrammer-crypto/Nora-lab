---
issue: 1206
title: "[Task] 依存グラフ生成エンジン実装"
state: closed
labels: [task, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-09T02:36:48Z
epic: CodeCompass
---

# #1206 [Task] 依存グラフ生成エンジン実装

## 本文

## 概要

`lib/dependency-graph.js` に `analyzeDependencyGraph({ repoPath, topFiles, maxDepth })` を実装し、
ホットスポット上位ファイルの caller/callee 依存関係を Mermaid 形式で出力する。

### 実装内容

- `CodeCompass/lib/dependency-graph.js` — コアロジック
  - `selectTopFiles(hotspots, topN)` — スコア上位 topN 件を選択（score=0 は除外）
  - `buildMermaidGraph(edges)` — エッジリストから Mermaid graph LR 文字列を生成
  - `extractEdges(content, filePath, repoDir)` — `require()` の regex 解析で依存エッジを抽出
  - `analyzeDependencyGraph({ repoPath, topFiles, maxDepth })` — メイン解析関数
- `CodeCompass/scripts/dependency-graph.js` — CLI エントリポイント
  - `--hotspots=<path>` — hotspots.json のパス（省略時は `<repoPath>/hotspots.json`）
  - `--topN=<n>` — 上位ファイル数（省略時は非ゼロファイルの20%）
  - `--out=<path>` — 出力先ファイル（省略時は標準出力）
  - `--maxDepth=<n>` — 依存追跡の深さ（現バージョン: 1固定）

### 実装方針

`@colbymchenry/codegraph` の代わりに `require()` の regex 解析を採用。
外部パッケージへの依存なしに全受け入れ条件を満たす。

### 出力フォーマット（Mermaid）

```mermaid
graph LR
  "lib/hotspot.js" -->|calls| "lib/change-frequency.js"
  "lib/hotspot.js" -->|calls| "lib/complexity-score.js"
```

## 見積もり

3pt — CodeGraph 統合・ライブラリ実装・CLI実装

## 依存関係

なし（即着手可能）

## 親ストーリー

#1179

## 親ブランチ

feature/issue-1179

## コメント

### noragrammer-crypto — 2026-06-09T06:10

作業開始 2026-06-09 06:10

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-09T06:15

[Auditor GREEN]

PASS: 106件（Unit: 17件 / Functional: 7件 / E2E含む全スイート: 106件）

作業完了 2026-06-09 06:35 / 所要時間: 約25分

---
