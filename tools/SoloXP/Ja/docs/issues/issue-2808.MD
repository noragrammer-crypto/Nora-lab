---
issue: 2808
title: "[Task] バグ再現テスト追加"
state: open
labels: [bug, task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-08-09T07:47:20Z
epic: SoloXP
---

# #2808 [Task] バグ再現テスト追加

## 本文

## 概要
報告されたバグ #2807 を再現するテストケースを追加する。
テストファーストでバグの存在を証明し、修正タスクの受け入れ基準を定める。

`SoloXP/skills/xp_Auditor/SKILL.md` の Story-level Auditor フェーズ（`### 3. E2E テストの判断・Story-level Auditor フェーズ`）が、既存バグイシューの親ストーリーが「他のオープンなストーリー」であっても現ストーリーを無条件にブロックする（所有権の区別がない）ことを、SKILL.md の文言をregex検証するユニットテストで再現する。

再現テストは「他ストーリー所有のREDでも無条件ブロックする」という現状の欠落（=所有権に応じた分岐文言が存在しないこと）を検証し、現時点ではRED（欠落を検知）になることを確認する。

参考実装パターン: `SoloXP/tests/unit/issue-904-auditor-bug-template-parent-branch.unit.test.js`、`workflow/__tests__/unit/issue-2758-processissue-specupdate-allgreen-gate.unit.test.js`

## 見積もり
1pt — 再現テストの設計・作成

## 依存関係
なし（即着手可能・修正タスクより先に実施すること）

## 親ストーリー
#2807

## 親ブランチ
feature/issue-2807

## 備考
task_type: bug_reproduction_test
xp_Director はこのタスクを xp_UnitTest + xp_FunctionalTest で処理すること。

## コメント

### noragrammer-crypto — 2026-08-09T11:41:05Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2808
観測可能な振る舞いの変更: なし
理由: 本タスクは `SoloXP/skills/xp_Auditor/SKILL.md` の Story-level Auditor フェーズにおける所有権ベース非対称ブロックの欠落をJestユニットテストで再現するバグ再現テストの追加であり、ランタイムの振る舞い変更を伴わない。Architect への委譲はスキップし、そのまま実行フロー（`task_type: bug_reproduction_test`）へ進む。

---

### noragrammer-crypto — 2026-08-09T11:41:09Z

作業開始 2026-08-09 20:40 JST
セッションURL: https://claude.ai/code/session_01EFn5E6bJFNtWNS3Yuoqty4
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-08-09T11:41:21Z

## テスト命題（Unit）

- [x] Story-level Auditor フェーズの RED ケース（既存バグイシューが「他のオープンなストーリー」に紐付いている場合）に、現ストーリーをブロックしないという所有権判定の文言が **存在しない**（RED＝バグ再現）
- [x] RED ケースの結論が、所有権に関わらず一律「ストーリーは継続（クローズしない）」の決め打ちのままになっている（RED＝バグ再現）
- [x] GREEN 記録条件が「自ストーリーが所有するブロック対象がゼロ」であることに言及していない（RED＝バグ再現）

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/tests/unit/issue-2807-auditor-story-level-ownership-block.unit.test.js`
対象: `SoloXP/skills/xp_Auditor/SKILL.md`（正本）
結果: FAIL 3件 / PASS 1件（想定通りRED。セクション存在確認の1件のみPASS）

```
FAIL tests/unit/issue-2807-auditor-story-level-ownership-block.unit.test.js
  ✓ Story-level Auditor フェーズのセクションが存在する
  ✕ RED ケースの「既に別の親に紐付いている場合」分岐で、他ストーリー所有のREDは現ストーリーをブロックしないと明記されている
  ✕ RED ケースの結論が無条件の「ストーリーは継続（クローズしない）」の決め打ちのままになっていない
  ✕ GREEN 記録条件が「自ストーリーが所有するブロック対象がゼロ」であることに言及している
```

既存ユニットテスト全件（18スイート・152件）: PASS（回帰なし）

### Functional Test
既存機能テスト全件: PASS（回帰なし）。本タスクは SKILL.md の文言不足を検証するdocs系テストのみでモジュール横断の連携テストは対象外のため、新規Functionalテストは作成せず（`#2786` の先例と同じ扱い）。

### E2E Test
`bug_reproduction_test` のためスキップ。

---
バグ再現テスト完了: テストがREDであることを確認。修正タスク（#2809）の受け入れ基準を定義済み。
Implementer への引き継ぎ不要（本タスクはテスト作成のみ）。

---

### noragrammer-crypto — 2026-08-09T11:41:43Z

[Auditor テスト実行中]

## /xp_RunTestSuites 結果（独立検証）

実行日時: 2026-08-09 20:41 JST
ブランチ: claude/issue-processing-2gwk3t

### 単体テスト（`SoloXP/` 配下、`npm run test:unit`）
- 結果: FAIL 3件 / PASS 152件
- 新規追加テスト `issue-2807-auditor-story-level-ownership-block.unit.test.js` のうち3件がFAIL
- **本タスク（`bug_reproduction_test`）の受け入れ基準は「テストがREDであること＝バグの存在証明」であり、この3件のFAILは想定通り・意図した結果**
- 既存152件の単体テストは全PASS（回帰なし）

### 機能テスト（`SoloXP/` 配下、`npm run test:functional`）
- 結果: PASS 50件 / FAIL 0件（回帰なし）

### 総合判定
バグ再現テストとして正しく機能している（RED=バグ再現成功）。実装差し戻し不要（本タスクはテスト作成のみ、Implementer不要）。

[Auditor GREEN]
PASS: 既存152件（Unit・回帰なし）/ 50件（Functional）、新規再現テスト3件は意図通りFAIL（RED＝バグ再現証明）。テストコマンド: `npm run test:unit`, `npm run test:functional`（`SoloXP/` ディレクトリ）

---
