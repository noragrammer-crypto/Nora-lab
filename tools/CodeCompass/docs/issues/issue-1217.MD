---
issue: 1217
title: "[Task] SKILL.md 整備（CodeCompass 独立呼び出し化）"
state: open
labels: [task, epic/CodeCompass]
author: noragrammer-crypto
created_at: 2026-06-09T19:13:23Z
epic: CodeCompass
---

# #1217 [Task] SKILL.md 整備（CodeCompass 独立呼び出し化）

## 本文

## 概要
CodeCompass 分析パイプライン（ホットスポット→依存グラフ→リファクタリング提案）を
SKILL.md として独立呼び出し可能な形に整備する。

### 実装内容

**CodeCompass/SKILL.md** を新規作成:
- `/codecompass <repoPath>` で全パイプラインを実行できるスキル定義
- 実行手順:
  1. hotspot.js でホットスポット判定（codecompass/hotspots.json 出力）
  2. dependency-graph.js で依存グラフ生成（codecompass/dependency-graph.mmd 出力）
  3. refactoring-proposal.js で構造化JSON生成→提案出力（codecompass/actions.md 出力）
- 実行後に actions.md の内容をサマリー出力する

## 見積もり
1pt — SKILL.md 作成・動作確認

## 依存関係
このタスクは #1216（構造化JSON生成・リファクタリング提案エンジン実装）の完了後に着手すること。
（#1216 に [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #1216

## 親ストーリー
#1180

## 親ブランチ
feature/issue-1180

## コメント

### noragrammer-crypto — 2026-06-10T03:01:56Z

作業開始 2026-06-10 03:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-10T03:02:08Z

[Tester実行中]

---

### noragrammer-crypto — 2026-06-10T03:02:59Z

## テスト実行結果

スキップ: Unit / Functional / E2E — SKILL.md はスキル定義マークダウンファイルであり、実行可能コードではないため全層スキップ。

既存の実装（hotspot.js / dependency-graph.js / refactoring-proposal.js）はそれぞれのUnit/Functionalテストで検証済み（#1216）。E2E テストスイートは #1215 で作成済み。

[Tester完了]

---

### noragrammer-crypto — 2026-06-10T03:03:03Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-10T03:05:34Z

## 実装完了

変更ファイル:
- `CodeCompass/SKILL.md`: CodeCompass パイプラインを `/codecompass <repoPath>` で独立呼び出し可能なスキルとして定義

内容:
- パイプライン3ステップ（hotspot.js → dependency-graph.js → refactoring-proposal.js）の実行手順を記述
- 出力ファイル（hotspots.json/md, dependency-graph.mmd, actions.md）の説明
- オプション（--days, --topN）の一覧

動作確認:
- 単体・機能テスト: PASS 83件（既存テストで scripts/lib の動作を確認済み）
- 大規模リポジトリ（HolyAutomater 本体）では git log の ENOBUFS が発生（change-frequency.js の maxBuffer 上限超過）。これは #1217 スコープ外の既存バグのため、Auditor に確認を依頼します。

[Implementer完了]

---

### noragrammer-crypto — 2026-06-10T03:05:38Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-06-10T03:06:39Z

[Auditor GREEN]
PASS: Unit 53件 / Functional 30件（回帰なし）

テストコマンド:
- `npx jest --testPathPattern=unit`: 53 passed
- `npx jest --testPathPattern=functional`: 30 passed

SKILL.md 実装内容を確認:
- `CodeCompass/SKILL.md` 作成済み（102行）
- パイプライン3ステップ（hotspot.js → dependency-graph.js → refactoring-proposal.js）の実行手順が正確に記述されている
- オプション（--days, --topN）の説明あり
- 出力ファイル一覧記述あり

[Bug イシュー発行済み #1226]
別タスクスコープのバグを検出。`change-frequency.js` の ENOBUFS 問題を新規イシュー #1226 として登録済み。現タスクのテスト結果には影響しない。

---

### noragrammer-crypto — 2026-06-10T03:06:48Z

作業完了 2026-06-10 03:15 / 所要時間: 15分

[Documenter実行中]

---
