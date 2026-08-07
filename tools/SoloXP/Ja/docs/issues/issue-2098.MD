---
issue: 2098
title: "[Task] feature-dev 呼び出し手順の調査・SKILL.md 改訂"
state: open
labels: [task, epic/SoloXP]
author: noragrammer-crypto
created_at: 2026-07-15T12:11:41Z
epic: SoloXP
---

# #2098 [Task] feature-dev 呼び出し手順の調査・SKILL.md 改訂

## 本文

## 概要
xp_Architect の step 3（既存実装との競合チェック）で `/feature-dev` または同等の
コード探索手段を呼び出す記述に改訂する。

### 調査事項（実装前に確認すること）
- feature-dev に "architect" サブコマンドや "explore" サブコマンドが存在するか
- feature-dev のフェーズ 1-2（Discovery + Codebase Exploration）のみを自動利用できるか
- フェーズ 3（Clarifying Questions）の人間インタラクション要件を回避できるか
- `Explore` サブエージェントや `Plan` サブエージェントを代替として使える場合の仕様

### 実装内容
- xp_Architect の SKILL.md step 3 を feature-dev（または同等コード探索手段）を呼ぶ記述に改訂
- feature-dev の出力から `depends_on` / `task_type` を xp 実行計画にマッピングする変換ルールを SKILL.md に明記

### 注意事項（設計懸念）
feature-dev は 7 フェーズのフルワークフローであり、フェーズ 3（Clarifying Questions）と
フェーズ 5（Implementation）で人間のインタラクションが必要。
自動フローに埋め込む際は人間待ちが発生しない範囲（フェーズ 1-2 のみ、または Explore サブエージェント利用）
での利用を検討すること。

## 見積もり
1pt — 調査・SKILL.md 改訂

## 依存関係
なし（即着手可能）

## 親ストーリー
#1381

## 親ブランチ
feature/issue-1381

## コメント

### noragrammer-crypto — 2026-07-15T12:49:42Z

code-architect
エージェントがいたはずだけど？

---

### noragrammer-crypto — 2026-07-16T13:18:30Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2098
観測可能な振る舞いの変更: なし
理由: xp_Architect の SKILL.md（内部オーケストレーション定義）の記述変更のみ。ユーザー/外部から観測可能なAPI・UI・出力内容の変化を伴わない。Architect分解は不要と判断し、実行フローへ進む。

---

### noragrammer-crypto — 2026-07-16T13:18:32Z

作業開始 2026-07-16 13:18
セッションURL: https://claude.ai/code/session_01WF2Uu3Gj7CH4eLwtsjKzKX
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-16T13:18:53Z

[Tester実行中]

## テスト実行結果

対象: xp_Architect SKILL.md（`dotfiles/.claude/skills/xp_Architect/SKILL.md` ほか2コピー）のドキュメント記述変更のみ。実行コードの追加・変更を伴わない。

スキップ: Unit / Functional / E2E — 理由: テスト対象コードなし（ドキュメントのみの変更）。

## 調査結果サマリー（Implementer 引き継ぎ用）

1. `/feature-dev` に "architect" / "explore" サブコマンドは存在しない（`commands/feature-dev.md` は単一コマンドで、Phase1〜7の直列フロー）。
2. ただし feature-dev プラグインは Phase 2 で `code-explorer` エージェント、Phase 4 で `code-architect` エージェント、Phase 6 で `code-reviewer` エージェントを**サブエージェントとして個別に**利用している（`plugins/feature-dev/agents/{code-explorer,code-architect,code-reviewer}.md`）。これらはAgent toolで直接単体起動可能で、`/feature-dev` コマンド本体を経由する必要はない。
3. `/feature-dev` 本体を自動フローに組み込むのは不可（Phase 3 Clarifying Questions・Phase 5 Implementation承認・Phase 6 レビュー判断で人間の応答待ちが必須設計になっている）。
4. 一方 `code-architect` サブエージェント単体は人間応答待ちなしで呼び出せる（tools: Glob, Grep, LS, Read, NotebookRead, WebFetch, TodoWrite, WebSearch, KillShell, BashOutput — 読み取り専用ツールのみで完結）。既存パターン分析→アーキテクチャ設計→実装ブループリント（ファイル単位の変更計画・データフロー・ビルド順）を返す仕様で、xp_Architect step 3（既存実装との競合チェック）の代替として利用できる。
5. 本セッション環境にはビルトインの `Explore`（読み取り専用コード探索）・`Plan`（実装計画設計）エージェントも存在し、`code-explorer` / `code-architect` と役割が重複する。

→ 実装方針: xp_Architect step 3 を `code-architect` サブエージェント（Agent tool, subagent_type: code-architect）の直接呼び出しに差し替える。`/feature-dev` コマンド本体は人間応答待ちのため自動フローには組み込まない。

---

### noragrammer-crypto — 2026-07-16T13:19:41Z

[Implementer実行中]

---

### noragrammer-crypto — 2026-07-16T13:20:37Z

[Implementer完了]

## 実装完了

変更ファイル:
- `dotfiles/.claude/skills/xp_Architect/SKILL.md`: step 3（既存実装との競合チェック）を `code-architect` サブエージェント（Agent tool, `subagent_type: code-architect`）呼び出しに改訂。出力（Patterns & Conventions Found / Build Sequence / Implementation Map 等）から xp 実行計画（depends_on / task_type）へのマッピング表を追記。フォールバック条件を明記（詳細定義は #2099）。
- `.claude/skills/xp_Architect/SKILL.md`: 上記と同一内容を反映（CLAUDE.md のスキル3コピー同期ルールに従い手動同期。`SoloXP/skills/` はpre-pushフックで自動追従）。

テスト結果:
- 単体テスト: 対象外（ドキュメントのみの変更）
- 機能テスト: 対象外（ドキュメントのみの変更）

⚠️ Auditor への申し送り:
- 受け入れ条件1・2（feature-dev/同等エージェント呼び出し記述・出力マッピング明記）は本PRで充足。
- 受け入れ条件3（フォールバック手順の明記）は「ツール未対応・エラー時は手動トレースに切り替える」という条件のみ明記し、詳細な発動条件・確認手順は依存タスク #2099（フォールバック手順の定義とE2Eテスト更新）に委ねる設計とした。#2098 のイシュー本文の実装内容スコープが「feature-dev呼び出し手順の調査・SKILL.md改訂」であり、フォールバック定義自体は #2099 の担当範囲であるため。
- 受け入れ条件4（既存 xp フローが壊れていない）は該当ファイルの他セクション（手順1・1-1・2・4-7、設計思想、注意事項）を変更していないため維持されている。

---

### noragrammer-crypto — 2026-07-16T13:21:04Z

[Auditor テスト実行中]

## 独立検証

`git diff --stat` で変更範囲を確認:
```
.claude/skills/xp_Architect/SKILL.md          | 51 ++++++++++++++++++++++++---
dotfiles/.claude/skills/xp_Architect/SKILL.md | 51 ++++++++++++++++++++++++---
```

- 変更ファイルは2件とも SKILL.md（ドキュメント）のみ。実行コードの変更なし → Tester/Implementer の「テスト対象コードなし」報告と一致（独立検証済み）。
- `.claude/skills/xp_Architect/SKILL.md` と `dotfiles/.claude/skills/xp_Architect/SKILL.md` の内容が完全一致（`diff` で無出力を確認）→ CLAUDE.md の3コピー同期ルール（手動同期対象2ファイル）を満たしている。
- 受け入れ条件1（feature-dev/同等エージェント呼び出し記述）: step 3 に `code-architect` サブエージェント（Agent tool, subagent_type: code-architect）呼び出しの記述を確認。feature-dev プラグイン提供のエージェントであり、body記載の「`/feature-dev`（または同等サブコマンド）」の条件を満たす。
- 受け入れ条件2（出力→実行計画マッピング）: code-architect の出力（Build Sequence / Implementation Map 等）から depends_on / task_type への変換ルール表を確認。
- 受け入れ条件3（フォールバック手順）: 「ツール未対応・エラー時は手動トレースへ切替」の条件を確認。詳細な発動条件は #2099（本タスクの依存先）に委譲する設計であることをイシュー本文・Implementer報告で確認済み。#2098 単体の実装内容スコープ（feature-dev呼び出し手順の調査・SKILL.md改訂）としては充足と判断。
- 受け入れ条件4（既存xpフロー無停止）: diffを確認し、手順1・1-1・2・4-7、設計思想、注意事項は変更なし。既存フローを壊していない。

テスト対象コードなし（ドキュメントのみの変更）のため xp_RunTestSuites は本タスクでは非該当。

[Auditor GREEN]
対象: #2098 — ドキュメントのみの変更を独立検証（diff確認・受け入れ条件1-4の充足確認）。

---

### noragrammer-crypto — 2026-07-16T13:21:13Z

作業完了 2026-07-16 13:21 / 所要時間: 3分

---

### noragrammer-crypto — 2026-07-16T13:22:46Z

[Documenter実行中]

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-2098.MD`: `xp_issue2md` — 本イシューの本文・コメント全件を転写

非該当（理由付き）:
- `xp_doc_spec`: `SoloXP/docs/spec/xp_architect.md` の更新は、本ストーリー内で独立タスクとして切り出されている `[Task] 機能仕様書更新` (#2100, task_type: spec_update, depends_on: #2098, #2099) の担当範囲。#2099（フォールバック手順定義）未完了のうちに前倒しで更新すると #2100 で二重更新・記述の食い違いが発生するため、本タスクでは実施しない。
- `xp_doc_reference` / `xp_doc_UnitTests` / `xp_doc_FunctionTests` / `xp_doc_E2ETests`: 本タスクはコード・テストファイルの追加変更を伴わない（SKILL.md のみの変更）ため対象外。

[Documenter完了]

---
