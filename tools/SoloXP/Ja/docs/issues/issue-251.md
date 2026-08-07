---
issue: 251
title: "[Task] xp_DirectorスキルにAllGREEN→受け入れテスト→PR発行フローを追加"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-03-18
epic: SoloXP
---

# #251 [Task] xp_DirectorスキルにAllGREEN→受け入れテスト→PR発行フローを追加

## 本文

## 概要
xp_Director SKILL.md を修正し、全サブイシューが [Auditor GREEN] になった時点で親ストーリーイシューの受け入れテスト（E2E含む）を実行し、結果に応じてPRを発行するフローを追加する。

### フロー仕様
1. 各サブタスク完了後、親ストーリーの全サブイシューが [Auditor GREEN] かどうかを確認する
2. 全件完了の場合：
   - 親ストーリーイシューの受け入れテストを実行（xp_RunE2ETests 経由）
   - ✅ 通過 → 親イシューのPRを発行してClose
   - ❌ 失敗 → 失敗内容で新サブイシューを起票し、親イシューは継続

### 変更対象ファイル
- `SoloXP/skills/xp_Director/SKILL.md`
- `dotfiles/.claude/skills/xp_Director/SKILL.md`

## 見積もり
2pt — SKILL.md 修正（フロー追加）

## 依存関係
このタスクは #250 の完了後に着手すること。
（#250 に [Auditor GREEN] コメントが記録されてから着手する）

## 親ストーリー
#243

## コメント

### noragrammer-crypto — 2026-03-18T03:37:28Z

作業開始 2026-03-18 03:37

---

### noragrammer-crypto — 2026-03-18T03:37:34Z

[Tester実行中]

---

### noragrammer-crypto — 2026-03-18T03:38:51Z

## テスト実行結果

### Unit Test
スキップ — SKILL.md 修正タスクはテスト対象コードなし（ドキュメント変更のみ）

### Functional Test
スキップ — 同上

### E2E Test（受け入れ条件の事前確認）
テストファイル: `SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js`
結果: PASS 0件 / FAIL 8件（実装前の RED 状態）

内訳:
- 条件1（Auditor SKILL.md: 4件 FAIL）→ PR #257 未マージのため main では FAIL。タスク #250 のスコープ
- 条件2（Director SKILL.md: 4件 FAIL）→ このタスク #251 のスコープ

このタスクの実装目標: 条件2の4件を GREEN にする

---

### noragrammer-crypto — 2026-03-18T03:38:56Z

[Tester完了]

---

### noragrammer-crypto — 2026-03-18T03:39:03Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-03-18T03:40:33Z

## 実装完了

変更ファイル:
- `.claude/skills/xp_Director/SKILL.md`: AllGREEN確認 → 受け入れテスト(xp_RunE2ETests) → ✅通過→PR発行 / ❌失敗→新サブイシュー起票 フローを追加
- `SoloXP/skills/xp_Director/SKILL.md`: 同上（ソース用）

テスト結果:
- E2E（条件2）: PASS 4件 / FAIL 0件 ✅
- E2E（条件1）: FAIL 4件（PR #257 未マージのため。#250 のスコープ）

---

### noragrammer-crypto — 2026-03-18T03:40:39Z

[Implementer完了]

---

### noragrammer-crypto — 2026-03-18T03:40:46Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-03-18T03:41:42Z

[Auditor GREEN]
PASS: 4件 / テストコマンド: `node SoloXP/tests/e2e/issue-243-sub-issue-reporting.test.js`

受け入れ条件 2（xp_Director SKILL.md 変更）に対応する全テストが通過。
FAIL 4件は受け入れ条件 1（xp_Auditor SKILL.md）= タスク #250 のスコープ（PR #257 未マージ状態）。

---

### noragrammer-crypto — 2026-03-18T03:41:50Z

作業完了 2026-03-18 03:41 / 所要時間: 5分

---

### noragrammer-crypto — 2026-03-18T03:41:56Z

[Documenter実行中]

---
