---
issue: 1992
title: "[Task] イシュートリアージスキルの実装"
state: open
labels: [task]
author: noragrammer-crypto
created_at: 2026-07-11T13:50:31Z
epic: SoloXP
---

# #1992 [Task] イシュートリアージスキルの実装

## 本文

## 概要

イシュートリアージエージェント本体を新規スキルとして実装する。

### やること
- `bug`ラベル付きオープンイシュー一覧を取得する
- 直近の`daily-tasks`トラッキングイシュー（「YYYY年MM月DD日 デイリータスク」）のコメントを遡り、`ERROR`として記録されたタスクと、そこで参照されているbugイシュー番号を抽出する
- 同一のbugイシューが**複数日にわたって継続的に**ERROR記録されている場合のみ、そのイシューに`PriorityHigh`ラベルを付与する
- 単発ERROR・複数原因が絡んで切り分けが曖昧なものは何もしない（判定に自信が持てない場合はスキップしてよい）
- 経過日数は判定根拠にしない
- 会話ログ（サブエージェントのセッション内容）は参照しない。GitHub issue上のテキストのみを判定材料にする

### 配置
CLAUDE.mdの「スキルファイルの3コピー構造」に従い、以下の両方に配置する（自動同期されないため手動で揃える）:
- `.claude/skills//SKILL.md`
- `dotfiles/.claude/skills//SKILL.md`

## 見積もり
2pt — 判定ロジック実装・スキルファイル作成

## 依存関係
なし（即着手可能。ただしテストファーストのため #1991 のE2Eテスト作成後に着手するのが望ましい）

## 親ストーリー
#1990

## コメント

### noragrammer-crypto — 2026-07-11T14:10:00Z

## 観測可能変更チェック（[Task]スキップ判定）

対象: #1992
観測可能な振る舞いの変更: あり（スキル実行時にGitHub issueへ`PriorityHigh`ラベルが自動付与される）
理由: ただし親ストーリー #1990 は既に `xp_Architect` によりStory分解済み（`[親ブランチ作成済み]`確認済み）であり、本タスクの受け入れ条件を検証するE2Eテストタスク（#1991、実施済みでクローズ済み）と機能仕様書更新タスク（#1994、`task_type: spec_update`）が既にサブイシューとして発行済み。Story分解時点でE2E/spec必要性は判定済みのため、本タスク単位での追加Architect呼び出しは行わず（重複発行防止）、通常実装フロー（xp_Tester → xp_Implementer → xp_Auditor → xp_Documenter）へ進む。

---

### noragrammer-crypto — 2026-07-11T14:10:03Z

作業開始 2026-07-11 23:09
[ProjectStatus: InProgress]

---

### noragrammer-crypto — 2026-07-11T14:11:06Z

[Tester実行中]

## テスト種別判定

本タスクは新規スキル `issue-triage-agent` の SKILL.md（Claude Code スキル定義＝指示書としてのMarkdown）2箇所を新規作成するのみで、実行可能なJS/TSコードの追加を伴わない。「ドキュメントのみの変更」に該当するため、Unit / Functional / E2E の各層テストはスキップする。

## 受け入れ条件の担保方法

Story-level の E2E テスト（`SoloXP/tests/e2e/issue-1990-issue-triage-agent.test.js`、PR #1995・未マージ）が本タスクの受け入れ条件をファイル内容の正規表現マッチで検証する契約になっていることを確認済み。以下を満たすよう Implementer に実装を依頼する:

- `.claude/skills/issue-triage-agent/SKILL.md` と `dotfiles/.claude/skills/issue-triage-agent/SKILL.md` の内容を完全一致させる
- 本文に以下の記載を含めること: `PriorityHigh` / `Emergency...対象外` / `bug...ラベル` / `daily-tasks` + `ERROR` / `複数日`または`継続` / `単発` / `経過日数...根拠にしない` / `会話ログ`

## スキップ

- Unit Test: スキップ — テスト対象コードなし（Markdown指示書のみ）
- Functional Test: スキップ — 同上
- E2E Test: スキップ — Story-level（#1990）で別途契約済み（本タスクはサブタスクのため対象外）

---

### noragrammer-crypto — 2026-07-11T14:13:20Z

[Implementer実行中]

## 実装完了

変更ファイル:
- `.claude/skills/issue-triage-agent/SKILL.md`: 新規作成
- `dotfiles/.claude/skills/issue-triage-agent/SKILL.md`: 新規作成（`.claude/`版と完全一致）

内容: bugラベル付きオープンイシューを対象に、daily-tasksトラッキングイシュー（`YYYY年MM月DD日 デイリータスク`）のコメントを遡ってERROR記録を照合し、同一bugイシューが複数日にわたり継続記録されている場合のみ`PriorityHigh`を付与する判定ロジックを記述。単発ERROR・切り分け曖昧なものはスキップ、経過日数は根拠にしない、会話ログは参照しない旨を明記。`Emergency`ラベルは対象外（付与しない）。

## テスト結果（参考確認）

Story-level E2Eテスト（PR #1995・未マージの`SoloXP/tests/e2e/issue-1990-issue-triage-agent.test.js`）を一時的にローカルへ配置し確認した結果:
- 23件中21件 PASS
- 残り2件 FAIL — 受け入れ条件6（daily-tasksベースセットへの組み込み）関連。これは別タスク #1993 の範囲であり、本タスク（#1992）のスコープ外のため想定通り

本タスク（#1992）のスコープである受け入れ条件1〜5はすべて満たしている。

- 単体テスト: スキップ（テスト対象コードなし）
- 機能テスト: スキップ（テスト対象コードなし）

---

### noragrammer-crypto — 2026-07-11T14:14:05Z

[Auditor テスト実行中]

Tester/Implementer の「ドキュメントのみの変更（テスト対象コードなし）」判定を確認。実装ファイルはMarkdownのSKILL.mdのみで既存のJS/TSコードへの変更はない。念のため `xp_RunTestSuites` 手順（SoloXP/）でベースラインへの影響有無を確認した:

- 単体テスト: PASS 178件（17 suites）/ `npm run test:unit`
- 機能テスト: PASS 50件（8 suites）/ `npm run test:functional`
- 既存スイートへの影響なし（新規追加ファイルはテスト対象コード外）

Story-level E2E受け入れ条件（本タスクスコープの1〜5）についてはImplementerコメントの通り21/23件PASSを確認済み（残り2件は#1993のdaily-tasks組み込みスコープであり本タスク対象外）。

[Auditor GREEN]
PASS: Unit 178件 + Functional 50件 / テストコマンド: `npm run test:unit && npm run test:functional`（SoloXP/）

---

### noragrammer-crypto — 2026-07-11T14:16:23Z

[Documenter実行中]

## ドキュメント生成完了

生成・更新したファイル:
- `SoloXP/docs/issues/issue-1992.MD`: 新規作成（issue2md、本文＋コメント全件）
- `SoloXP/docs/spec/issue_triage_agent.md`: 新規作成（issue-triage-agentスキル仕様、判定基準・実装状況テーブルを記載。#1993完了までは受け入れ条件6が未実装である旨を明記。最終確定は#1994で実施）
- `SoloXP/docs/spec/README.md`: 索引に `issue_triage_agent.md` の行を追加

スキップした種別:
- xp_doc_reference: スキップ — 本タスクはSKILL.md（Markdown）のみでJS/Pythonコードの追加・変更なし
- xp_doc_UnitTests / xp_doc_FunctionTests / xp_doc_E2ETests: スキップ — 本タスクで新規・変更されたテストファイルなし

[Documenter完了]

---
