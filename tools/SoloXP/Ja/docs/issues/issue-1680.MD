---
issue: 1680
title: "[Task] バグ再現テスト追加"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-26T17:13:22Z
epic: SoloXP
---

# #1680 [Task] バグ再現テスト追加

## 本文

## 概要

報告されたバグ #1293 を再現するテストケースを追加する。
テストファーストでバグの存在を証明し、修正タスクの受け入れ基準を定める。

`xp_RunE2ETests` の SKILL.md には「テストランナーが Jest か Playwright かを `package.json` の `test:e2e` スクリプト内容で判定し、Jest の場合は Vercel/localhost への疎通チェックをスキップしてそのまま `npm run test:e2e` を実行する」という分岐ロジックが存在しない。
そのため `SoloXP/tests/e2e/`（Jest ベース、HTTP通信なし）を対象にしても、現行 SKILL.md の手順通りに進めると疎通チェック失敗で実行がスキップされてしまう。

再現テストは `SoloXP/tests/unit/` に Jest テストとして追加し、`xp_RunE2ETests` の SKILL.md 本文（3箇所: `.claude/skills/xp_RunE2ETests/SKILL.md`, `SoloXP/skills/xp_RunE2ETests/SKILL.md`, `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`）に「テストランナー自動判定」に関する記述が含まれていることを検証する形で書く（現状は記述がないため RED になる）。

## 見積もり

1pt — 再現テストの設計・作成

## 依存関係

なし（即着手可能・修正タスクより先に実施すること）

## 親ストーリー

#1293

## 親ブランチ

feature/issue-1293

## 備考

task_type: bug_reproduction_test
xp_Director はこのタスクを xp_UnitTest + xp_FunctionalTest で処理すること。

## コメント

### noragrammer-crypto — 2026-06-27T00:06:05Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #1680
観測可能な振る舞いの変更: なし
理由: SoloXP/tests/unit/ にバグ再現テストを追加するのみで、ユーザー/外部から観測可能な振る舞い（API・UI・出力内容）の変更を伴わない。Architect をスキップして実行フローへ進む。

---

### noragrammer-crypto — 2026-06-27T00:06:07Z

作業開始 2026-06-27 (時刻不明、セッション開始時)
セッションURL: https://claude.ai/code/session_01NXfxA73u9VyyM3KvYvgeaU
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-06-27T00:07:55Z

## テスト命題（Unit）

- [x] SKILL.md（3箇所）が `test:e2e` スクリプト内容を確認する記述を含む（肯定）
- [x] SKILL.md（3箇所）が `playwright` を含む場合の従来フロー記述を含む（肯定）
- [ ] SKILL.md（3箇所）が `jest`（playwright を含まない）の場合に疎通チェックをスキップする分岐ロジックを含む（否定 → 現状は記述なし、RED）

## テスト実行結果

### Unit Test
テストファイル: `SoloXP/tests/unit/issue-1680-rune2etests-runner-autodetect.unit.test.js`
対象: `.claude/skills/xp_RunE2ETests/SKILL.md`, `SoloXP/skills/xp_RunE2ETests/SKILL.md`, `dotfiles/.claude/skills/xp_RunE2ETests/SKILL.md`（3箇所とも内容一致を確認済み）

結果: PASS 6件 / FAIL 3件（3 SKILL.md × 「jestランナー時に疎通チェックをスキップする」アサーションがすべてFAIL）

```
Test Suites: 1 failed, 1 total
Tests:       3 failed, 6 passed, 9 total
```

既存スイートへの回帰なし（`npm run test:unit` 全体: 1 failed(新規), 13 passed, 133 tests / 既存130件はすべてPASS）。

### Functional Test
スキップ：本タスクは `task_type: bug_reproduction_test` のため Unit のみ実施（SKILL.md記述どおり `SoloXP/tests/unit/` への追加のみ）。

### E2E Test
スキップ：bug_reproduction_test のため対象外。

---

バグ再現テスト完了: テストがREDであることを確認。修正タスク #1681 の受け入れ基準を定義済み。
Implementer への引き継ぎは不要（本タスクはテスト作成のみ）。

---

### noragrammer-crypto — 2026-06-27T00:09:01Z

## /xp_RunTestSuites 結果

ブランチ: claude/wizardly-newton-0g1yv8

### 単体テスト（SoloXP）
- 結果: PASS 130件 / FAIL 3件
- FAIL 3件はすべて新規追加した `issue-1680-rune2etests-runner-autodetect.unit.test.js` 内、「jestランナー時に疎通チェックをスキップする分岐がSKILL.mdに記載されている」アサーション（3 SKILL.md 分）
- 既存130件への回帰なし

### 機能テスト（SoloXP）
- 結果: PASS 20件 / FAIL 0件

---

## FAIL 分析

**[issue-1680: jestランナー時の疎通チェックスキップ分岐]**
- エラー: `expect(content).toMatch(/jest/i)` / `toMatch(/疎通チェックをスキップ/)` — 3箇所の SKILL.md いずれにも一致せず
- スコープ: 本タスク（#1680）自体のスコープ内（task_type: bug_reproduction_test）
- 判断: **意図したRED**。本タスクの目的は #1293 のバグ（テストランナー自動判定ロジックの欠落）をテストで証明することであり、このREDが受け入れ基準そのもの
- 根拠: 同テストファイル内の他のアサーション（`test:e2e` 記述・`playwright` 記述の存在確認）はPASSしており、テスト自体が壊れているわけではない。FAILは欠落しているjest分岐ロジックのみを正確に検出している

[Auditor GREEN]
PASS（バグ再現テストとして妥当・意図したRED）: テストコマンド `npm run test:unit -- --testPathPattern=tests/unit`
本タスク（#1680: バグ再現テスト追加）は完了。修正タスク #1681 はこのREDをGREENにすることが受け入れ基準となる。

---
