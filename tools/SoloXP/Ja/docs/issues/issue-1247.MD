---
issue: 1247
title: "[Task] xp_Auditor/SKILL.md から PR 発行手順を削除・全コピー同期"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-06-10T18:09:56Z
epic: SoloXP
---

# #1247 [Task] xp_Auditor/SKILL.md から PR 発行手順を削除・全コピー同期

## 本文

## 概要

バグ #1238 の修正。`xp_Auditor/SKILL.md` の Story-level GREEN フェーズに残存する `gh pr create` および `xp_Reviewer` 呼び出しを削除し、「PR発行は xp_Director の責務」と明記する。全コピーを同期する。

## やること

### 1. `dotfiles/.claude/skills/xp_Auditor/SKILL.md` の修正

Story-level Auditor フェーズ（test モード）の GREEN セクション（67-82行付近）を修正する：

**削除対象:**
- `xp_Reviewer <epic> <story>` の呼び出し
- `gh pr create` コマンド一式
- `[親ブランチ PR 発行済み]` コメント手順
- `ストーリーイシューをクローズする` 手順

**追記内容:**
```
**GREEN を xp_Director に返す。xp_Reviewer 呼び出し・PR発行・ストーリークローズは xp_Director の責務。**
```

### 2. `SoloXP/skills/xp_Auditor/SKILL.md` を dotfiles コピーと同一内容に同期

（dotfiles と SoloXP は現時点で同一内容なので同じ修正を適用）

### 3. `.claude/skills/xp_Auditor/SKILL.md`（project-level）を最新版に同期

project-level コピーは古いバージョンで doc モードにも PR 発行手順が残存している。dotfiles/SoloXP の修正後の内容と同一にする。

### 4. `workflow/docs/spec/xp-director-pr-responsibility.md` との整合性確認

spec が Story-level（test モード）についても Director 責務と明記しているか確認し、不足があれば追記する。

## 受け入れ条件

- [x] `xp_Auditor/SKILL.md`（全コピー）に `gh pr create` が存在しない
- [x] `xp_Auditor/SKILL.md`（全コピー）の Story-level GREEN セクションに「PR発行は xp_Director の責務」が明記されている
- [x] dotfiles / SoloXP / project-level の3コピーが同一内容である
- [x] `xp-director-pr-responsibility.md` との矛盾が解消されている

## 依存関係

なし（即着手可能）

## 親ストーリー

#1238

## 親ブランチ

feature/issue-1238

## コメント

### noragrammer-crypto — 2026-06-11T00:07:48Z

作業開始 2026-06-11 00:07

[ProjectStatus: InProgress]

Session: https://claude.ai/code/session_01UqiiHJyDSWvhqGh9z7gnQx

---

### noragrammer-crypto — 2026-06-11T00:07:56Z

[Tester実行中]

---

### noragrammer-crypto — 2026-06-11T00:08:26Z

## テスト実行結果

スキップ: Unit / Functional / E2E — 変更対象が SKILL.md（マークダウン文書）と spec ファイルのみ。テスト対象コードなし。

→ xp_Implementer へ引き継ぎます。

---

### noragrammer-crypto — 2026-06-11T00:08:29Z

[Tester完了]

---

### noragrammer-crypto — 2026-06-11T00:08:35Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-11T00:10:36Z

## 実装完了

変更ファイル:
- `dotfiles/.claude/skills/xp_Auditor/SKILL.md`: Story-level GREEN セクションから `xp_Reviewer` 呼び出し・`gh pr create`・`[親ブランチ PR 発行済み]` コメント手順・ストーリークローズ手順を削除。「xp_Director の責務」と明記。
- `SoloXP/skills/xp_Auditor/SKILL.md`: dotfiles版と同一内容に同期
- `.claude/skills/xp_Auditor/SKILL.md`: dotfiles版で完全置き換え（古いバージョンをリセット）
- `workflow/docs/spec/xp-director-pr-responsibility.md`: Story-level Auditor → Director 責務移管のフローと変更箇所を追記

テスト結果:
- ドキュメントのみの変更のためスキップ

受け入れ条件チェック:
- [x] 全コピーに `gh pr create` が存在しない
- [x] Story-level GREEN セクションに「PR発行は xp_Director の責務」が明記されている
- [x] dotfiles / SoloXP / project-level の3コピーが同一内容
- [x] `xp-director-pr-responsibility.md` との矛盾が解消されている

---

### noragrammer-crypto — 2026-06-11T00:10:39Z

[Implementer完了]

---

### noragrammer-crypto — 2026-06-11T00:10:56Z

[Auditor テスト実行中]

---

### noragrammer-crypto — 2026-06-11T00:13:38Z

[Auditor GREEN]
PASS: Unit 279件（DiscordAIbot 172件 + DiscordBotDashboard 107件）

### Functional テスト
SKIP（環境依存）— Vercel プレビューが BUILDING 状態のため HTML を返却。コード変更と無関係。

### 受け入れ条件確認
- [x] 全コピーに `gh pr create` が存在しない
- [x] Story-level GREEN セクションに「xp_Reviewer 呼び出し・PR発行・ストーリークローズは xp_Director の責務」が明記されている
- [x] dotfiles / SoloXP / project-level の3コピーが同一内容
- [x] `xp-director-pr-responsibility.md` に Story-level の責務移管フローを追記し矛盾を解消済み

---

### noragrammer-crypto — 2026-06-11T09:35:46Z

作業再開 2026-06-11 09:32

前セッション（session_01UqiiHJyDSWvhqGh9z7gnQx）の実装が未コミット・未プッシュで消失していることを確認。
xp_Implementer を再実行して実装し直します。

[Implementer実行中]

---

### noragrammer-crypto — 2026-06-11T09:37:59Z

## 実装完了（再実行）

変更ファイル:
- `dotfiles/.claude/skills/xp_Auditor/SKILL.md`: Story-level GREEN セクション（lines 70-82）から `xp_Reviewer` 呼び出し・`gh pr create`・`[親ブランチ PR 発行済み]` コメント手順・ストーリークローズ手順を削除。「xp_Director の責務」と明記
- `SoloXP/skills/xp_Auditor/SKILL.md`: dotfiles 版と同一内容に同期
- `.claude/skills/xp_Auditor/SKILL.md`: dotfiles 版で完全置き換え
- `workflow/docs/spec/xp-director-pr-responsibility.md`: Story-level test モード（AllGREEN 後）の Director 責務フローを追記

テスト結果:
- ドキュメントのみの変更のためスキップ

[Implementer完了]

---

### noragrammer-crypto — 2026-06-11T09:39:38Z

[Auditor GREEN]
PASS: Unit 289件（DiscordAIbot 289件、27スイート）

### 機能テスト
DiscordBotDashboard: 5 FAIL（personas.functional.test.js）— Vercel preview 依存の既存問題。本タスクの変更（SKILL.md）とは無関係。

### Bug 修正実環境確認
[実環境確認 OK]
- `gh pr create` → NOT FOUND（全3コピー）
- 「xp_Reviewer 呼び出し・PR発行・ストーリークローズは xp_Director の責務」明記を確認（全3コピーの line 71）

### 受け入れ条件確認
- [x] 全コピーに `gh pr create` が存在しない
- [x] Story-level GREEN セクションに「xp_Reviewer 呼び出し・PR発行・ストーリークローズは xp_Director の責務」が明記されている
- [x] dotfiles / SoloXP / project-level の3コピーが同一内容
- [x] `xp-director-pr-responsibility.md` に Story-level の責務フローを追記し矛盾を解消済み

---
