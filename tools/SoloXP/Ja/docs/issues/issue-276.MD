---
issue: 276
title: "[Task] xp_Director SKILL.md にAllGREEN→E2Eテスト→クローズフローを追記する"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-03-18T10:54:59Z
epic: SoloXP
---

# #276 [Task] xp_Director SKILL.md にAllGREEN→E2Eテスト→クローズフローを追記する

## 本文

## 概要
xp_Director の SKILL.md（2箇所）に、全サブイシュー完了後のE2Eテスト実行→ストーリークローズフローを追記する。

対象ファイル:
- `/root/.claude/skills/xp_Director/SKILL.md`（稼働中のスキル定義）
- `SoloXP/skills/xp_Director/SKILL.md`（リポジトリ内のスキル定義）

追記内容:
- PR発行後に親ストーリーの全サブイシューを確認する
- 全サブイシューに [Auditor GREEN] があれば AllGREEN と判断
- AllGREEN → xp_RunE2ETests を実行
- E2E GREEN → 親ストーリーイシューをクローズ
- E2E 実行不可/スキップ → イシューにコメントしてユーザーに判断を委ねる（自動クローズしない）
- E2E 失敗 → 失敗内容で新サブイシューを起票し、親イシューは継続

参照: `SoloXP/docs/spec/xp_director.md` の「AllGREEN→受け入れテスト→PR発行フロー」セクションに記載済み。

## 見積もり
1pt — SKILL.md 2ファイルへの追記

## 依存関係
なし（即着手可能）

## 親ストーリー
#274

## コメント

### noragrammer-crypto — 2026-03-18T11:16:48Z

作業開始 2026-03-18 11:22

[Tester実行中]

---

### noragrammer-crypto — 2026-03-18T11:17:24Z

## テスト実行結果

### Unit Test
スキップ — SKILL.md ドキュメント変更のみ（テスト対象コードなし）

### Functional Test
スキップ — 同上

### E2E Test（Issue #275 で作成済みのテストスイートを使用）
テストファイル: `SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js`
結果: PASS 0件 / FAIL 10件 — **RED（SKILL.md 未更新のため正しい状態）**

[Tester完了]

---

### noragrammer-crypto — 2026-03-18T11:17:34Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-03-18T11:22:35Z

## 実装完了

変更ファイル:
- `/root/.claude/skills/xp_Director/SKILL.md`: AllGREEN→E2Eテスト→クローズフローを追記
- `SoloXP/skills/xp_Director/SKILL.md`: 同上（リポジトリ内同期）

テスト結果:
- Unit Test: スキップ（ドキュメント変更のみ）
- Functional Test: スキップ（同上）
- E2E Test: PASS 10件 / FAIL 0件 ✅ ALL GREEN

[Implementer完了]

---

### noragrammer-crypto — 2026-03-18T11:22:44Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-03-18T11:23:03Z

[Auditor GREEN]
PASS: 10件 / テストコマンド: `node SoloXP/tests/e2e/issue-274-story-close-on-allgreen.test.js`

### 分析

- Unit / Functional: スキップ（SKILL.md ドキュメント変更のみ・テスト対象コードなし）
- E2E: 10/10 PASS ✅

dotfiles版・SoloXP版の両 SKILL.md に AllGREEN→xp_RunE2ETests→クローズフローが正しく追記されていることを確認。

作業完了 2026-03-18 11:30 / 所要時間: 8分

---

### noragrammer-crypto — 2026-03-18T11:23:10Z

[Documenter実行中]

---
