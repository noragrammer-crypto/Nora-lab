---
issue: 269
title: "[Task] xp_review_workflow にワークフロー期待値・逸脱検知を追加する"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-03-18T08:38:54Z
epic: SoloXP
---

# #269 [Task] xp_review_workflow にワークフロー期待値・逸脱検知を追加する

## 本文

## 概要
xp_review_workflow SKILL.md にワークフロー検証機能を追加する。
ワークフロー自体をTDDで管理する方向に移行するための対応。

追加内容:
- ワークフローの期待達成条件を定義（各スキルの正常完了条件）
- 逸脱したIssueの特定ロジック追加（コメントパターンで検出）
- 原因SKILLの特定まで行うよう更新（どのSKILL.mdが問題だったかを特定）

## 見積もり
2pt — SKILL.md 設計・更新

## 依存関係
なし（即着手可能）

## 親ストーリー
#254

## コメント

### noragrammer-crypto — 2026-03-18T08:48:20Z

作業開始 2026-03-18 08:48

---

### noragrammer-crypto — 2026-03-18T08:48:24Z

[Tester実行中]

---

### noragrammer-crypto — 2026-03-18T08:49:46Z

## テスト実行結果

スキップ: Unit / Functional — **SKILL.md はプロンプト定義ファイルのためテスト対象コードなし**

E2E テストは既存の `SoloXP/tests/e2e/issue-254-workflow-update.test.js` で検証する。

### 現在の E2E テスト状態（RED）

```
【受け入れ条件 2】xp_review_workflow にワークフロー検証機能が追加されていること

  ❌ FAIL: xp_review_workflow SKILL.md にワークフロー期待達成条件の定義が含まれる
  ❌ FAIL: xp_review_workflow SKILL.md に逸脱したIssueを特定するロジックが含まれる
  ❌ FAIL: xp_review_workflow SKILL.md に原因SKILLの特定指示が含まれる
  ✅ PASS: xp_review_workflow SKILL.md にコメントパターンによる検出ロジックが含まれる

結果: PASS 8件 / FAIL 3件
```

REDは実装前の正しい状態。Implementerに引き渡す。

[Tester完了]

---

### noragrammer-crypto — 2026-03-18T08:49:50Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-03-18T08:51:53Z

## 実装完了

変更ファイル:
- `.claude/skills/xp_review_workflow/SKILL.md`: ワークフロー検証機能を追加
- `dotfiles/.claude/skills/xp_review_workflow/SKILL.md`: 同期更新

追加内容:
1. **ワークフロー期待達成条件テーブル**: 各スキルの正常完了コメントパターンを定義
2. **逸脱したIssueの特定ロジック**: コメントパターン検出による逸脱Issue特定（手順2）
3. **原因SKILL特定手順**: 逸脱フェーズから原因SKILLを特定するフロー（手順3）

テスト結果:
- E2E テスト: PASS 11件 / FAIL 0件 ✅

[Implementer完了]

---

### noragrammer-crypto — 2026-03-18T08:51:56Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-03-18T08:52:56Z

[Auditor GREEN]
PASS: 11件 / テストコマンド: `node SoloXP/tests/e2e/issue-254-workflow-update.test.js`

### テスト結果詳細

受け入れ条件 1（CLAUDE.md TDD原則）: PASS 7/7 ✅
受け入れ条件 2（xp_review_workflow）: PASS 4/4 ✅

### スコープ判断
`sub-issue-completion-reporting.test.js` のRED 7件を検出したが、これは xp_Director のサブイシュー報告フローに関するテストであり、タスク #269（xp_review_workflow更新）のスコープ外。pre-existing RED として記録する。

---

### noragrammer-crypto — 2026-03-18T08:53:00Z

[Documenter実行中]

---
