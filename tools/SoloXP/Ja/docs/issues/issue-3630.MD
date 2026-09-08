---
issue: 3630
title: "[Bug] SoloXP/tests/unit/ に非xp_系キーワード（daily-tasks）を含むファイルが残存している（#2168整理漏れ）"
state: closed
labels: [bug, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-09-07T08:57:38Z
epic: SoloXP
---

# #3630 [Bug] SoloXP/tests/unit/ に非xp_系キーワード（daily-tasks）を含むファイルが残存している（#2168整理漏れ）

## 本文

## 発見経緯
#3621（xp_CompleteTasksスキル新規作成）のStory-level受け入れテスト（`xp_Auditor test`）実行中に発見。

## エラー内容
`SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` の受け入れ条件2
（「lib/scripts/tests/docs に非xp_系ファイルが残っていない」）が以下のFAILを報告する：

```
SoloXP/tests/ に非xp_系キーワードを含むファイルが存在しない

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js",
+ ]
```

`main` ブランチでも同一の失敗が再現することを確認済み（pre-existing。#3621が持ち込んだ問題ではない）。

## 影響範囲
`SoloXP/tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` というファイル名に
非xp_系キーワード「daily-tasks」が含まれているため、#2168（SoloXP正本化・xp_*系ファイルのみへの
整理）の受け入れ条件に違反している。ファイルを `workflow/` 等の非xp_系ディレクトリへ移動するか、
命名を変更する必要がある。

## 親ストーリー
#3621

## 親ブランチ
feature/issue-3621

## コメント

### noragrammer-crypto — 2026-09-07T08:59:15Z

## 既存実装との競合チェック（手動トレース）

フォールバック発動: あり
発動理由: 単純なファイル移動修正のため、code-architectサブエージェントを使わず手動トレースで対応

Patterns & Conventions Found:
- 対象ファイル `SoloXP/tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` は、実際には `workflow/skills/daily-tasks/SKILL.md`（非xp_系スキル）の記述を検証するテストであり、SoloXPのxp_*系スキルとは無関係
- 非xp_系スキル（daily-tasks等）の実体は既に `workflow/skills/` へ移設済み（#2637）で、対応するテストも `workflow/__tests__/unit/` に配置する慣習が確立している（`REPO_ROOT = path.resolve(__dirname, '../../..')` パターンで同一のリポジトリルート解決になるため、移動してもパス解決ロジックの変更は不要）

Architecture Decision:
- `SoloXP/tests/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` を `workflow/__tests__/unit/issue-3508-daily-tasks-archive-pathspec.unit.test.js` へ `git mv` する（ファイル内容は変更不要）

競合の有無: なし

## 実行計画

イシュー種別: Bug
判定: 単一タスク（サブイシュー発行なし。既に親ブランチ `feature/issue-3621` を持つサブイシューとして紐付け済み）
対象イシュー: #3630（このイシュー自体をタスクとして扱う）
実行方法: `xp_Director` は `feature/issue-3621` ブランチから新規の作業ブランチを切り、`--base feature/issue-3621` のPRで処理する（CLAUDE.mdのTDD原則: 再現テスト+修正は単一タスクで完結。今回は既存テストの配置修正のため新規再現テストは不要、既存テストの実行結果自体が再現・修正確認を兼ねる）

競合の有無: なし

---

### noragrammer-crypto — 2026-09-07T08:59:23Z

作業開始 2026-09-07T17:59:19+09:00
セッションURL: https://claude.ai/code/session_01BoYYCF3g9cfo6FQH2Y5Q4F
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-09-07T09:00:44Z

[実環境確認 OK]
再現手順を実行: `SoloXP/tests/e2e/issue-2168-soloxp-canonicalization-nora-lab-pipeline.test.js` の受け入れ条件2（非xp_系キーワードを含むファイル検出）が GREEN になったことを確認（バグが修正されていることを確認）

[Auditor GREEN]
PASS: 658件（SoloXP: Unit 327件 + Functional 69件、workflow: Unit 262件）/ テストコマンド: `npm run test:unit && npm run test:functional`（`SoloXP/`・`workflow/` 双方）
E2E: タスクイシュー単体のためスキップ（`issue-2168` E2Eテストの該当受け入れ条件がGREEN化したことは上記の実環境確認で別途記録済み）

---

### noragrammer-crypto — 2026-09-07T09:01:27Z

## Issue2MD 完了

保存先: `SoloXP/docs/issues/issue-3630.MD`
イシュー: #3630 [Bug] SoloXP/tests/unit/ に非xp_系キーワード（daily-tasks）を含むファイルが残存している（#2168整理漏れ）
コメント数: 3

## xp_doc_spec / xp_doc_reference / xp_doc_UnitTests / xp_doc_FunctionTests / xp_doc_E2ETests

いずれも対象外 — 既存テストファイルの配置修正（`git mv`）のみで、新規仕様・新規テストケース・
クラス/関数変更を伴わない。移動元・移動先いずれにも対応するUnitTestsドキュメントは存在しない
（確認済み）ため、ドキュメント側の追随作業はない。

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-3630.MD`（新規作成）: xp_issue2md によるイシュースナップショット

[Documenter完了]

---

### noragrammer-crypto — 2026-09-07T09:02:01Z

[Auditor ドキュメントチェック中]

### ドキュメントチェック結果
- spec/README.md: 対象外（仕様変更なし）
- issue2mdログ: 陳腐化検知（GitHub上4件 / ログ上3件）→ 再実行して最新化済み。OK
- diffスコープ整合性: OK（`git diff --stat origin/feature/issue-3621` でファイルrename1件（0行変更）+ 新規untracked（issue2mdスナップショット）1件のみ確認。想定範囲どおり）

[Auditor doc OK]
xp_Director がPRを発行します。

---

### noragrammer-crypto — 2026-09-07T09:02:29Z

[PR発行済み #3631]
[ProjectStatus: Done]

---
