---
issue: 717
title: "[Task] 親イシューから子イシューへの優先度ラベル伝播実装"
state: open
labels: [task, epic/workflow]
author: noragrammer-crypto
created_at: 2026-04-24T00:34:13Z
epic: workflow
---

# #717 [Task] 親イシューから子イシューへの優先度ラベル伝播実装

## 本文

## 概要
`xp_Architect/SKILL.md` のサブイシュー発行ロジックに、親イシューの優先度ラベルを子イシューへ伝播する処理を追加する。

### 変更内容

**伝播対象ラベル：**
- `Emergency`
- `PriorityHigh`

**伝播タイミング：**
- xp_Architect がサブイシューを作成するとき、親イシューに `Emergency` または `PriorityHigh` が付いていれば、作成する全サブイシューに同じラベルを付与する

### 変更対象ファイル
- `.claude/skills/xp_Architect/SKILL.md`（セクション「5. サブイシューを全件発行」にラベル伝播ルールを追記）

## 見積もり
2pt — SKILL.md 改訂・伝播ルール追加

## 依存関係
このタスクは #716 （ProcessIssue優先度ラベル選択ロジック実装）の完了後に着手すること。

## 親ストーリー
#705

## コメント

### noragrammer-crypto — 2026-04-24T01:00:00Z

作業開始 2026-04-24 01:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-04-24T01:05:00Z

[Tester完了]

E2E Test: PASS 8件 / FAIL 4件（実装前REDは正常）
スキップ: Unit / Functional — SKILL.md のみの変更

---

### noragrammer-crypto — 2026-04-24T01:08:00Z

[Implementer完了]

`.claude/skills/xp_Architect/SKILL.md` にラベル伝播ルールを追記。
テスト結果: PASS 12件 / FAIL 0件

---

### noragrammer-crypto — 2026-04-24T01:10:00Z

[Auditor GREEN]
PASS: 12件

作業完了 2026-04-24 01:10 / 所要時間: 10分
