# Issue #2642: [Task] SoloXP/Makefile 新設・sync-nora-lab ターゲット実装

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2642
- 親ストーリー: #2168
- 親ブランチ: feature/issue-2168

## 本文

## 概要
`SoloXP/` 直下にMakefileを新設し、`SoloXP/`（`skills/xp_*` + `ARCHITECTURE.md` 等のdoc）と `workflow/skills/ProcessIssue`（および必要な関連ファイル）を唯一のソースとして `Nora-lab/tools/SoloXP/Ja` へrsyncする `sync-nora-lab` ターゲットを実装する。

## 見積もり
2pt — Makefile実装 + rsync対象整理

## 依存関係
このタスクは #2638 の完了後に着手すること（Phase1完了でSoloXP配下がxp_*のみになっていることが前提のため）。

depends_on: #2638

## 親ストーリー
#2168

## 親ブランチ
feature/issue-2168

## コメント履歴

### コメント1（2026-08-07 07:47 JST）

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2642
観測可能な振る舞いの変更: なし
理由: `SoloXP/` 直下にMakefileを新設し `sync-nora-lab` ターゲットを実装する開発ツール変更。API/エンドポイント・UI・出力内容に変化はなく、リポジトリの開発運用機構（`.claude/hooks/pre-push.sh` と同種の内部ツール）の新設にとどまるため、Architectをバイパスして通常実装タスクとして処理する。

作業開始 2026-08-07 07:47 JST
セッションURL: https://claude.ai/code/session_013vkg9HCsAB6sSZheo3k2KR
[ProjectStatus: InProgress]

### コメント2（2026-08-07 07:50 JST）

[Tester完了]

テスト命題（Unit、6件）と Functional Test（一時gitリポジトリ上での `make -C SoloXP sync-nora-lab` 実行検証）を作成。Makefile未実装のためRED（`ENOENT`）を確認しImplementerに引き継いだ。

### コメント3（2026-08-07 07:51 JST）

[Implementer完了]

`SoloXP/Makefile` を新規実装（`sync-nora-lab` ターゲット）。正本（`SoloXP/` 全体 + `workflow/skills/ProcessIssue`）を `Nora-lab/tools/SoloXP/Ja` へ `rm -rf` + `cp -r` ベースで同期する（rsyncコマンドは実行環境によっては未導入のため依存しない設計。#2639のpre-push.shと同一方針）。単体6件・機能8件PASS、`SoloXP/tests/unit`全体131件・`tests/functional`全体22件で回帰なしを確認。

### コメント4（2026-08-07 07:52 JST）

[Auditor テスト実行中]→[Auditor GREEN]

`npx jest --testPathPatterns=SoloXP/tests/unit`（131件PASS）・`npx jest --testPathPatterns=SoloXP/tests/functional`（22件PASS）を実行し全件GREENを確認。Story E2E「受け入れ条件5」もPASS。「受け入れ条件4」の既存FAIL1件は本タスク対象外（#2641スコープ）の既存差分であることを確認した。

[Auditor GREEN]
PASS: 153件（unit 131 + functional 22）
