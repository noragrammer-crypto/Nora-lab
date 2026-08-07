---
issue: 640
title: "[Task] xp_AuditorのPR発行コマンドにCloseキーワード追加"
state: open
labels: [enhancement, task]
author: noragrammer-crypto
created_at: 2026-04-14T02:39:35Z
epic: SoloXP
---

# #640 [Task] xp_AuditorのPR発行コマンドにCloseキーワード追加

## 本文

## 概要
xp_Auditor SKILL.md の `doc` モードにある `gh pr create` コマンドの本文テンプレートに
`Closes #` キーワードを追加し、PRマージ時にイシューが自動クローズされるようにする。

## 調査確認事項（着手前に確認）
- `/root/dotfiles/.claude/skills/xp_Auditor/SKILL.md` の PR 発行箇所を読む
- `gh pr create --body` テンプレートに `Closes #` が含まれているか確認する

## 実装内容
`/root/dotfiles/.claude/skills/xp_Auditor/SKILL.md` の PR 発行ステップを以下のように修正する：

```bash
gh pr create --title "<タイトル>" --body "## Summary
Closes #

<変更内容の説明>"
```

`xp_Director` SKILL.md にも PR 発行時のクローズキーワード要件を明記する（`xp_Auditor doc` ステップの説明箇所）。

## 見積もり
1pt — SKILL.md 修正

## 依存関係
なし（即着手可能）

## 親ストーリー
#638

## コメント

### noragrammer-crypto — 2026-04-14T05:15:34Z

作業開始 2026-04-14 05:14

[ProjectStatus: InProgress]
[Tester実行中]

---

### noragrammer-crypto — 2026-04-14T05:16:36Z

## テスト実行結果

### Unit Test
スキップ — SKILL.md（テンプレートファイル）はユニットテスト対象外

### Functional Test
スキップ — モジュール連携なし

### 受け入れテスト（既存 E2E テストスイート: issue-638-pr-autoclose-keywords.test.js）
テストファイル: `SoloXP/tests/e2e/issue-638-pr-autoclose-keywords.test.js`
結果: PASS 2件 / FAIL 4件（実装前の RED は正しい状態）

| # | テストケース | 結果 |
|---|---|---|
| 1 | [dotfiles] gh pr create コマンドが存在する | ✅ PASS |
| 2 | [dotfiles] PR 本文に Closes # キーワードが含まれる | ❌ RED（未実装） |
| 3 | [dotfiles] Closes # がテンプレート変数として明記 | ❌ RED（未実装） |
| 4 | [SoloXP] gh pr create コマンドが存在する | ✅ PASS |
| 5 | [SoloXP] PR 本文に Closes # キーワードが含まれる | ❌ RED（未実装） |
| 6 | [SoloXP] Closes # がテンプレート変数として明記 | ❌ RED（未実装） |

**実装ターゲット:**
- `/root/.claude/skills/xp_Auditor/SKILL.md` — gh pr create --body に `Closes #<issue番号>` 追加
- `SoloXP/skills/xp_Auditor/SKILL.md` — 同上
- （任意）xp_Director SKILL.md への PR クローズキーワード要件の明記

[Tester完了]

---

### noragrammer-crypto — 2026-04-14T05:18:43Z

## 実装完了

変更ファイル:
- `dotfiles/.claude/skills/xp_Auditor/SKILL.md`: gh pr create --body に `Closes #<issue番号>` テンプレート追加
- `SoloXP/skills/xp_Auditor/SKILL.md`: 同上
- `.claude/skills/xp_Auditor/SKILL.md`: 同上（古いバージョンも同期）
- `dotfiles/.claude/skills/xp_Director/SKILL.md`: xp_Auditor doc ステップの説明にクローズキーワード要件を明記
- `SoloXP/skills/xp_Director/SKILL.md`: 同上

テスト結果:
- 受け入れテスト（issue-638-pr-autoclose-keywords.test.js）: PASS 6件 / FAIL 0件 ✅

[Implementer完了]

---

### noragrammer-crypto — 2026-04-14T05:19:49Z

[Auditor GREEN]
PASS: 36件（Unit + Functional） / テストコマンド: `npx jest --testPathPatterns="unit|functional"`
受け入れテスト（issue-638-pr-autoclose-keywords.test.js）: PASS 6件 / FAIL 0件 ✅

作業完了 2026-04-14 05:25 / 所要時間: 11分

---
