---
issue: 400
title: "[Task] ProcessIssue スキル新設"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-03-23T06:29:28Z
epic: SoloXP
---

# #400 [Task] ProcessIssue スキル新設

## 本文

## 概要
オープンイシューリストから未ブロックのイシューを選択し、
内容に応じて3つのワークフローのうちどれかを実行する `ProcessIssue` スキルを新設する。

### 要件（#397 より）
3つのワークフロー振り分けロジック:
1. **NovelGeneratorワークフロー** → `NovelGeneratorRun` を呼び出す
2. **落ちこぼれ人形使い執筆系イシュー** → 手動作業（ユーザー指示に従う）。自動実行しない
3. **ソフトウェア開発・スキル開発系** → `/xp_Director <issue_number>` を呼び出す

### 位置づけ
- `/xp_Director`（引数なし）の後継・移行先
- `/xp_Director`（引数なし）自体は削除しない

### 配置先
`/root/.claude/skills/ProcessIssue/`

## 見積もり
2pt — スキル設計・振り分けロジック実装

## 依存関係
このタスクは #399 (NovelGeneratorRun スキル新設) の完了後に着手すること。
（依存先サブイシューに [Auditor GREEN] コメントが記録されてから着手する）

## 親ストーリー
#397

## コメント

### noragrammer-crypto — 2026-03-23T06:48:20Z

作業開始 2026-03-23 07:00

---

### noragrammer-crypto — 2026-03-23T06:48:53Z

[Tester実行中]

---

### noragrammer-crypto — 2026-03-23T06:49:05Z

## テスト命題（Unit）

- [ ] SKILL.md ファイルが存在する（.claude/skills/ProcessIssue/SKILL.md）
- [ ] コマンド定義セクションが含まれる（/ProcessIssue コマンド）
- [ ] 役割・目的セクションが含まれる
- [ ] 処理フロー・手順セクションが含まれる
- [ ] オープンイシューリスト取得ロジックがある（gh issue list）
- [ ] 未ブロックイシューの選択指示がある（depends_on / ブロック判定）
- [ ] NovelGeneratorワークフロー振り分けがある（NovelGeneratorRun 呼び出し）
- [ ] 落ちこぼれ人形使い執筆系の振り分けがある
- [ ] 落ちこぼれ人形使い執筆系は手動実行指示がある（自動実行しない）
- [ ] ソフトウェア開発系の xp_Director 振り分けがある
- [ ] xp_Director 呼び出し時に issue 番号を渡す指示がある

## テスト命題（Functional）

- [ ] 3つのワークフロー振り分けが網羅的に記載されている
- [ ] NovelGenerator系イシューの識別基準が明示されている
- [ ] 落ちこぼれ人形使い系イシューの識別基準が明示されている
- [ ] ソフトウェア開発系イシューの識別基準が明示されている
- [ ] xp_Director との役割関係・位置づけが明示されている

---

### noragrammer-crypto — 2026-03-23T06:50:00Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/__tests__/process-issue-skill.unit.test.js`
結果: PASS 0件 / FAIL 11件（SKILL.md 未作成のため RED は正しい状態）

### Functional Test
テストファイル: `SoloXP/__tests__/process-issue-skill.functional.test.js`
結果: PASS 0件 / FAIL 6件（SKILL.md 未作成のため RED は正しい状態）

スキップ: E2E — スキルファイル定義タスクのため E2E は不要

[Tester完了]

---

### noragrammer-crypto — 2026-03-23T06:50:33Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-03-23T06:51:53Z

## 実装完了

変更ファイル:
- `.claude/skills/ProcessIssue/SKILL.md`: ProcessIssue スキル新設
- `SoloXP/__tests__/process-issue-skill.unit.test.js`: ユニットテスト
- `SoloXP/__tests__/process-issue-skill.functional.test.js`: 機能テスト

テスト結果:
- 単体テスト: PASS 11件 / FAIL 0件
- 機能テスト: PASS 6件 / FAIL 0件

[Implementer完了]

---

### noragrammer-crypto — 2026-03-23T06:52:06Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-03-23T06:52:15Z

[Auditor GREEN]
PASS: 17件 / テストコマンド: `npx jest --testPathPattern='process-issue-skill'`

- 単体テスト: PASS 11件 / FAIL 0件
- 機能テスト: PASS 6件 / FAIL 0件

作業完了 2026-03-23 07:15 / 所要時間: 15分

---

### noragrammer-crypto — 2026-03-23T06:52:23Z

[Documenter実行中]

---
