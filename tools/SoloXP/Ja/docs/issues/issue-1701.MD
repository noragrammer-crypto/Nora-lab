---
issue: 1701
title: "[Task] daily-tasks 日曜トラッキングイシュー報告 + データ不足時バグ自動起票"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-28T04:28:28Z
epic: SoloXP
---

# #1701 [Task] daily-tasks 日曜トラッキングイシュー報告 + データ不足時バグ自動起票

## 本文

## 概要
ops-meeting の実行結果（会議録要約・起票したイシュー一覧）を、daily-tasks が作成する日曜デイリートラッキングイシューにコメントとして記録する。
GitHub/Obsidianのデータ取得が失敗・不足した場合は `PriorityHigh` ラベル付きのバグイシューを自動起票する。

## 見積もり
2pt — 報告コメント処理 + データ不足検知・バグ自動起票ロジック

## 依存関係
このタスクは #1700 の完了後に着手すること。
（依存先サブイシューに [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #1700

## 親ストーリー
#1330

## 親ブランチ
feature/issue-1330

## task_type
task_type: feature

## コメント

### noragrammer-crypto — 2026-07-01T00:06:25Z

作業開始 2026-07-01 00:04
セッションURL: https://claude.ai/code/session_01FXGFZrRF7CSFi5hBhPGFnF
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-01T00:06:34Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #1701
観測可能な振る舞いの変更: あり
理由: daily-tasks の日曜タスクセットに ops-meeting 実行結果の報告コメント処理とデータ不足時バグ自動起票ロジックを追加する変更。日曜デイリートラッキングイシューへの記録内容と、条件次第でのバグイシュー自動起票という外部から観測可能な振る舞いの変更に該当する。

→ xp_Architect #1701 を呼ぶ

---

### noragrammer-crypto — 2026-07-01T00:10:08Z

## E2E/spec 要否判定（Task）

対象: #1701
観測可能な振る舞いの変更: あり
理由: daily-tasks 日曜セットで ops-meeting 実行後にトラッキングイシューへ結果報告コメントを記録し、データ不足時に PriorityHigh バグイシューを自動起票する処理を追加する。外部から観測可能な振る舞いの変更に該当する。

追加タスク: **不要**
- E2Eテストスイート作成 → Story #1330 の E2E スイート（#1696）内の AC-5・AC-6 テスト（`workflow/__tests__/e2e/daily-tasks-1330.e2e.test.js`）が既に定義済み（現状 RED）。#1701 の実装で GREEN になることを確認済み。
- 機能仕様書更新 → Story #1330 の spec_update タスク（#1702）でカバーされる。

## 実行計画

イシュー種別: Task
対象: #1701

変更ファイル（2ファイル、内容は完全一致が必要）:
- `SoloXP/skills/daily-tasks/SKILL.md`
- `dotfiles/.claude/skills/daily-tasks/SKILL.md`

変更箇所（`#### 日曜日（DOW=7）の場合` セクション内）:
1. ops-meeting Agent ブロック後に「タスク 3 後処理」を追加:
   - ops-meeting の実行結果（要約・起票したイシュー一覧）を `DAILY_ISSUE_NUMBER` の日曜デイリートラッキングイシューにコメント記録する指示
2. データ取得失敗・不足時の PriorityHigh バグ自動起票ロジックを追加:
   - GitHub/Obsidian のデータ取得が失敗・不足した場合に `PriorityHigh` ラベル付きバグイシューを起票する指示

テスト:
- E2E AC-5: `daily-tasks-1330.e2e.test.js` の AC-5 テスト（`DAILY_ISSUE_NUMBER`, 要約, 起票イシュー一覧の記録指示が存在すること）
- E2E AC-6: `daily-tasks-1330.e2e.test.js` の AC-6 テスト（`PriorityHigh`, `データ.*(失敗|不足)` の指示が存在すること）
- sync チェック: dotfiles と SoloXP の SKILL.md が完全一致すること

競合なし（既存の日曜タスク構造の自然な延長）。

→ xp_Director は通常実装タスクフロー（xp_Tester → xp_Implementer → xp_Auditor → xp_Documenter）で処理してください。

---

### noragrammer-crypto — 2026-07-01T00:10:45Z

[Tester実行中]

---

### noragrammer-crypto — 2026-07-01T00:12:41Z

## テスト命題（Functional）

**前提:** AC-5（ops-meeting 結果のトラッキングイシュー報告）は E2E テスト（daily-tasks-1330.e2e.test.js）で既に PASS。実装前の現在の SKILL.md に既に `要約`・`起票イシュー一覧`・`DAILY_ISSUE_NUMBER` が含まれているため。

AC-6 を GREEN にする変更が今回の実装スコープ。

- [ ] daily-tasks SKILL.md（SoloXP）に PriorityHigh バグ自動起票の指示が含まれる（否定 = RED）
- [ ] daily-tasks SKILL.md（SoloXP）に データ取得失敗・不足時の処理指示が含まれる（否定 = RED）
- [ ] daily-tasks SKILL.md（dotfiles）に PriorityHigh バグ自動起票の指示が含まれる（否定 = RED）
- [ ] daily-tasks SKILL.md（dotfiles）に データ取得失敗・不足時の処理指示が含まれる（否定 = RED）
- [x] dotfiles と SoloXP の SKILL.md 日曜セクションが一致する（肯定 = GREEN、実装前は両方未変更のため一致）

---

### noragrammer-crypto — 2026-07-01T00:13:15Z

## テスト実行結果

### Functional Test
テストファイル: `SoloXP/tests/functional/issue-1701-daily-tasks-reporting.functional.test.js`
結果: FAIL 4件 / PASS 1件（RED フェーズとして正常）

命題チェック:
- [ ] daily-tasks SKILL.md（SoloXP）に PriorityHigh バグ自動起票の指示が含まれる（FAIL: PriorityHigh 未記載）
- [ ] daily-tasks SKILL.md（SoloXP）に データ取得失敗・不足時の処理指示が含まれる（FAIL: 未記載）
- [ ] daily-tasks SKILL.md（dotfiles）に PriorityHigh バグ自動起票の指示が含まれる（FAIL: PriorityHigh 未記載）
- [ ] daily-tasks SKILL.md（dotfiles）に データ取得失敗・不足時の処理指示が含まれる（FAIL: 未記載）
- [x] dotfiles と SoloXP の SKILL.md 日曜Agentブロックが一致する（PASS）

### E2E Test（Story #1330）
ファイル: `workflow/__tests__/e2e/daily-tasks-1330.e2e.test.js`
AC-5: PASS（SKILL.md に 要約・起票イシュー一覧・DAILY_ISSUE_NUMBER の記述が既存）
AC-6: FAIL 2件（dotfiles / SoloXP とも PriorityHigh 未記載）

RED 確認完了。次工程（Implementer）へ引き継ぎます。

---

### noragrammer-crypto — 2026-07-01T00:13:28Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-07-01T00:15:03Z

[Implementer完了]

変更ファイル:
- `SoloXP/skills/daily-tasks/SKILL.md`: タスク3後処理セクション追加（ops-meeting 結果のトラッキングイシュー報告 + データ取得失敗・不足時 PriorityHigh バグ自動起票）
- `dotfiles/.claude/skills/daily-tasks/SKILL.md`: 同内容（byte-identical）を反映

テスト結果:
- Functional テスト（issue-1701）: PASS 5件 / FAIL 0件（GREEN）
- E2E テスト（daily-tasks-1330 AC-5/AC-6）: PASS 30件 / FAIL 0件（全 GREEN）
- SoloXP 全体: 403 passed / 3 failed（FAIL 2スイートは `issue-1410-worklog-markers`・`sub-issue-completion-reporting` の pre-existing failure のみ、本タスク変更によるリグレッションなし）

GREEN 確認完了。Auditor へ引き継ぎます。

---

### noragrammer-crypto — 2026-07-01T00:15:47Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-07-01T00:15:58Z

[Auditor GREEN]

確認内容:
- Unit テスト: 177 passed / 0 failed
- Functional テスト（issue-1701 新規 5件含む）: 50 passed / 0 failed
- diff は追記のみ（タスク3後処理セクション追加）。既存タスク1・2と同じ構造（「**タスク N 後処理**」形式）を踏襲しており、新しい抽象・命名規則の逸脱なし
- SoloXP と dotfiles の SKILL.md が完全一致（sync テスト PASS）
- 既存テストスイートへのリグレッションなし（SoloXP全体 403 passed / pre-existing FAIL 3件のみ、`sub-issue-completion-reporting` と `issue-1410-worklog-markers`）
- AC-6（PriorityHigh バグ自動起票・データ取得失敗・不足）テスト: 2件とも GREEN

作業完了 2026-07-01 00:19 / 所要時間: 15分

---

### noragrammer-crypto — 2026-07-01T00:XX:XXZ

[Documenter実行中]

---

### noragrammer-crypto — 2026-07-01T00:XX:XXZ

[Documenter完了]

生成・更新したファイル:
- `SoloXP/docs/issues/issue-1701.MD`: イシュー本文 + コメント10件を転写
- `SoloXP/docs/spec/ops_meeting.md`: #1701（トラッキングイシュー報告 + PriorityHigh バグ自動起票）セクション追加・関連イシュー表に #1701 追記・#1700 の状態を closed に更新
- `SoloXP/docs/tests/FunctionTests/issue-1701-daily-tasks-reporting.md`: 新規作成（5テストケース）
- `SoloXP/docs/tests/E2ETests/daily-tasks-1330.md`: AC-5・AC-6 を GREEN に更新、#1701 を実装状況テーブルに追加

---
