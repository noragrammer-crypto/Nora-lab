---
issue: 1360
title: "[Task] issue-904 テスト正規表現をセクション番号非依存に修正する"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-13T15:50:09Z
epic: SoloXP
---

# #1360 [Task] issue-904 テスト正規表現をセクション番号非依存に修正する

## 本文

## 概要

バグ #1279 の修正。`SoloXP/__tests__/issue-904-auditor-bug-template-parent-branch.unit.test.js` の正規表現がセクション番号 `5` をハードコードしているため、xp_Auditor SKILL.md のセクション追加により番号が `6` に変わった結果テストが3件 FAIL している。

## 変更内容

`SoloXP/__tests__/issue-904-auditor-bug-template-parent-branch.unit.test.js` の line 33-36:

## 完了条件

- [ ] `npm test -- --testPathPattern issue-904` が3件すべて PASS する
- [ ] 正規表現がセクション番号に依存しない形になっている

## 見積もり

1pt — 正規表現1行の修正

## 依存関係

なし（即着手可能）

## 親ストーリー
#1279

## 親ブランチ
feature/issue-1279

## task_type
task_type: refactoring

## コメント

### noragrammer-crypto — 2026-06-13T15:57:01Z

作業開始 2026-06-13 16:00
セッションURL: https://claude.ai/code/session_01JwnmYsQYRAvoyn1eK9yJBa
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-13T15:57:04Z

[Tester実行中]

---

### noragrammer-crypto — 2026-06-13T15:58:22Z

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/__tests__/issue-904-auditor-bug-template-parent-branch.unit.test.js`
結果: **FAIL 3件 / PASS 2件**（RED 確認）

命題チェック:
- [ ] `「別タスクスコープのバグ発見時」セクションが存在する` → FAIL（`bugSectionContent` が空: 正規表現 `/###\s+5\.` がセクション6に一致しない）
- [ ] `gh issue create テンプレートに ## 親ストーリー セクションが含まれる` → FAIL（セクション未取得）
- [ ] `gh issue create テンプレートに ## 親ブランチ セクションが含まれる` → FAIL（セクション未取得）
- [x] `Story-level Auditor フェーズのセクションが存在する` → PASS（`### 3.` は変更なし）
- [x] `RED ケースでバグイシュー起票時に ## 親ブランチ の記述がある` → PASS

スキップ: Functional Test — テスト修正タスクのため既存テストがユニット兼受け入れ基準
スキップ: E2E Test — タスクスコープ対象外

[Tester完了]

---

### noragrammer-crypto — 2026-06-13T17:11:05Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-13T17:11:42Z

## 実装完了

変更ファイル:
- `SoloXP/__tests__/issue-904-auditor-bug-template-parent-branch.unit.test.js`: line 33 正規表現 `/###\s+5\.` → `/###\s+\d+\.` に変更（セクション番号非依存化）

テスト結果:
- 単体テスト: **PASS 5件 / FAIL 0件**（RED → GREEN 確認）

[Implementer完了]

---

### noragrammer-crypto — 2026-06-13T17:11:56Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-06-13T17:12:45Z

[実環境確認 OK]
再現手順を実行: `npx jest --testPathPatterns="issue-904"` → 5件 PASS（バグが修正されていることを確認）
テストは実際の xp_Auditor SKILL.md を直接読み込むため、モックなしの実環境確認済み。

[Auditor GREEN]
PASS: 88件（unit） + 20件（functional） / テストコマンド: `npx jest`

---

### noragrammer-crypto — 2026-06-13T17:13:47Z

[Documenter実行中]
