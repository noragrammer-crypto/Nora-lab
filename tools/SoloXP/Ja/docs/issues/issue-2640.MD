# Issue #2640: [Task] .claude/skills/ 側の同期方式見直し

- URL: https://github.com/noragrammer-crypto/HolyAutomater/issues/2640
- 親ストーリー: #2168
- 親ブランチ: feature/issue-2168

## 本文

## 概要
`.claude/skills/`（プロジェクトローカル、Codex参照用）についても「正本→バイナリ」の向きで同期する仕組みを検討・実装する。symlinkが使える環境ではsymlink化、Termux等symlinkが不安定な環境向けの `dotfiles/.claude/skills/` はコピー同期を維持する（symlink一本化はできない制約は #2168 本文の通り）。

## 見積もり
2pt — 設計 + 実装

## 依存関係
このタスクは #2639 の完了後に着手すること。

depends_on: #2639

## 親ストーリー
#2168

## 親ブランチ
feature/issue-2168

## コメント履歴

### コメント1（2026-08-06 18:13 JST）

## 観測可能変更チェック（[Task]スキップ判定）

対象: #2640
観測可能な振る舞いの変更: なし
理由: `.claude/skills/`（プロジェクトローカル、Codex参照用）の同期方式（symlink化／コピー維持）を環境ごとに見直す内部ツール変更。API/エンドポイント・UI・出力内容に変化はなく、リポジトリの開発運用機構（pre-push同期と同種）の内部実装変更にとどまるため、Architectをバイパスして通常実装タスクとして処理する。

作業開始 2026-08-06 18:30 JST
セッションURL: https://claude.ai/code/session_01VLAJfpKZQyJVxKExMcYTbq
[ProjectStatus: InProgress]

### コメント2（2026-08-06 18:20 JST）[Tester完了]

テスト命題（Unit）6件・Functional Test（symlink環境・Termux環境）を作成。実装前RED確認: `Test Suites: 2 failed, 2 total / Tests: 10 failed, 6 passed, 16 total`。

### コメント3（2026-08-06 18:20 JST）[Implementer実行中]

### コメント4（2026-08-06 18:23 JST）[Implementer完了]

`.claude/hooks/pre-push.sh` に `.claude/skills/` 向けのsymlink同期（symlink安定環境）・実体コピー同期（Termux、`PRE_PUSH_FORCE_TERMUX=1` でテスト時強制切替可）を追加。フックを実行し実リポジトリの `.claude/skills/` 配下38スキルをsymlinkへ移行（コミット `fcbb9c3`）。単体テスト125件・機能テスト14件、いずれもPASS（回帰なし）。

### コメント5（2026-08-06 18:23 JST）[Auditor テスト実行中] → [Auditor GREEN]

`/xp_RunTestSuites` 実行: 単体125件・機能14件すべてPASS。実リポジトリのsymlink移行内容・非canonicalスキルの対象外維持・session-start.shのドリフト検知が誤検知しないことを確認。

PASS: 139件（unit 125 + functional 14） / テストコマンド: `npx jest --testPathPatterns=tests/unit`, `npx jest --testPathPatterns=tests/functional`
