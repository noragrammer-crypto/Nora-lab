---
issue: 771
title: "[Task] kakuyomu_post_ab SKILL.md 作成"
state: open
labels: [task]
author: noragrammer-crypto
created_at: 2026-05-01T00:30:54Z
epic: SoloXP
---

# #771 [Task] kakuyomu_post_ab SKILL.md 作成

## 本文

## 概要

`dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` を作成する。
agent-browser 版カクヨム投稿スキルのドキュメントを整備する。

## やること

- SKILL.md のフロントマター（name, description, trigger）作成
- スキルの使い方・前提条件を記述
- `agent-browser` CLI の呼び出し方法・コマンド例を記述
- プロキシ対応が必要な場合はその設定方法を明記
- kakuyomu_post（Playwright版）との使い分け・切り替え方法を記述

## 見積もり

2pt — スキルドキュメント作成・agent-browser コマンド設計

## 依存関係

このタスクは #770 の完了後に着手すること。
（プロキシ動作確認・環境設定が確定してから SKILL.md を書くため）
（#770 に [Auditor GREEN] コメントが記録されてから着手する）

depends_on: #770

## 親ストーリー

#605

## 親ブランチ

feature/issue-605

## コメント

### noragrammer-crypto — 2026-05-07T00:18:07Z

作業開始 2026-05-07 00:00

[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-05-07T00:18:32Z

[Tester実行中]

## テスト実行結果

スキップ: Unit / Functional / E2E — ドキュメント作成のみのタスクのためテスト対象コードなし

`dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md` の新規作成は純粋なドキュメント作業。
実装コードの変更なし → 全テスト層スキップ。Implementer へ引き継ぎ。

[Tester完了]

---

### noragrammer-crypto — 2026-05-07T00:22:38Z

[Implementer実行中]

## 実装完了

### 変更ファイル

- `dotfiles/.claude/skills/kakuyomu_post_ab/SKILL.md`（新規作成・211行）

### 記載内容

- **フロントマター**: `name: kakuyomu_post_ab`, `description`
- **環境変数設定**: `AGENT_BROWSER_IGNORE_HTTPS_ERRORS=true`, `AGENT_BROWSER_EXECUTABLE_PATH`, `AGENT_BROWSER_ARGS`
- **プロキシ対応**: HTTP_PROXY 自動読み込み + SSL エラー無視（#770 調査結果反映）
- **セッション永続化**: `--session-name kakuyomu` によるログイン Cookie 保持
- **基本コマンド**: open / snapshot / click / fill / eval / screenshot
- **ログイン手順**: ホームページウォームアップ → ログインページ → フォーム入力
- **下書き投稿フロー**: 作品ページ → 新規エピソード → タイトル・本文入力 → 下書き保存
- **Playwright MCP 版との比較表**: 使い分けガイドライン
- **トラブルシューティング**: ERR_CERT_AUTHORITY_INVALID / Chromium未検出 / ログイン維持

[Implementer完了]

---

### noragrammer-crypto — 2026-05-07T00:24:01Z

[Auditor GREEN]
PASS: 253件 (DiscordAIbot: 146件, DiscordBotDashboard: 107件)

### テスト結果サマリー

実行日時: 2026-05-07
ブランチ: claude/vigilant-franklin-O3REM

**DiscordAIbot ユニットテスト**
- 結果: PASS 12スイート / 146件

**DiscordBotDashboard ユニットテスト**
- 結果: PASS 6スイート / 107件

**機能テスト**
- ドキュメント作成のみのタスクでコード変更なし → スキップ

判定: **GREEN**

---
