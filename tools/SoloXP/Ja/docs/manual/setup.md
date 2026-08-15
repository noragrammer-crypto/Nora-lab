# セットアップマニュアル

SoloXPのスキルを実際に動かす前に必要な準備。[インストールマニュアル](./install.md) でスキルを
登録した後、以下を一通り済ませてから [使い方チュートリアル](./tutorial.md) に進む。

## 1. `gh` CLI 認証

SoloXPの全スキルはGitHub Issue/PR操作に `gh` CLIを使う。未導入・未認証の場合は先に済ませる。

```bash
# インストール確認
gh --version

# 認証（ブラウザ経由でログイン）
gh auth login

# 認証状態・スコープの確認
gh auth status
```

対象リポジトリに対して Issue の読み書き・PR の作成・ラベル作成ができる権限が必要。

> Claude Code Web版では `gh auth status` がプロキシ制約により「トークン無効」と誤表示する
> ことがある。Web版特有の注意点は [Claude Code Web 環境での運用ノウハウ](./claude-code-web.md)
> を参照。

## 2. ラベルの準備

Issueの種別（Story/Task/Bug）自体は、ラベルではなく**タイトルの `[Story]`/`[Task]`/`[Bug]` タグ**
で判定される（xp_Directorがタイトルを見て委譲先を決める）。ラベルは主にxp_Architectが発行する
サブイシューの分類・優先度伝播に使われる。使用する主なラベル：

| ラベル | 用途 |
|---|---|
| `task` | xp_Architectが発行するサブタスクイシューに自動付与される |
| `bug` | バグ修正イシュー（`[Bug]` タイトルタグと合わせて付与することが多い） |
| `epic/<名前>` | 親ストーリーが属するエピック名（xp_Architectが親イシューのepicラベルから伝播） |
| `PriorityHigh` | 優先度高（親→子に自動伝播） |
| `Emergency` | 緊急対応（親→子に自動伝播） |

> `task` ラベルを付けるだけではTaskフロー（Architectバイパス）にはならない。Architectを
> バイパスするタイトルタグ `[Task]` と、サブイシューに付くラベル `task` は別物なので混同しない。

上記に加えて `ProcessIssue`（イシュー自動選択層）を導入する場合は、選択対象から外す
`backlog` / `block` / `ignore` ラベルや、実行環境を制御する `env/*` ラベルも使うことになる。
それぞれの使い分け・判断基準は
[ProcessIssue ── イシュートリアージと自動選択](./process-issue.md) にまとめてある。

ラベルが存在しない場合、xp_Architectがサブイシュー発行時に `gh label create` で自動作成する
ため、事前に手動で用意する必要は必須ではない。ただし初回実行時にラベル作成権限がないと失敗する
ため、リポジトリ管理者権限（またはラベル作成が許可された権限）でリポジトリに参加していること。

## 3. Node/npm 環境（テスト実行用）

xp_Tester・xp_Implementer・xp_Auditorが実行するテストスイートは Jest ベース。

```bash
cd SoloXP
npm install
npm test              # 全テスト
npm run test:unit     # unitのみ
npm run test:functional
npm run test:e2e
```

自分のプロジェクト側にテストランナーが既にある場合は、そちらに揃えて構わない
（SoloXP自体のテスト構成は一例）。

## 4. `CLAUDE.md.template` の配置

SoloXPの各スキルは、リポジトリルートの `CLAUDE.md` に以下が定義されていることを前提に動作する：

- ブランチ運用（Story/Bug/SubTask処理時のフロー、AllGREEN後のフロー）
- PR発行についてのユーザー事前承認
- Issue/PRワークフロー
- TDD開発原則
- 作業時間記録ルール
- 動作確認・プレビュー環境（プロジェクト固有）

[`CLAUDE.md.template`](../../CLAUDE.md.template) をそのまま自分のリポジトリの `CLAUDE.md`
（既存の `CLAUDE.md` がある場合はその末尾）にコピーし、`<...>` のプレースホルダーを埋める。

```bash
cat SoloXP/CLAUDE.md.template >> CLAUDE.md
# または CLAUDE.md がまだ無ければ
cp SoloXP/CLAUDE.md.template CLAUDE.md
```

このファイルが無いままスキルを実行すると、ブランチ運用や PR 発行可否の判断基準を
スキル側が参照できず、意図しない動作（PR発行の都度確認が入る／親ブランチ運用が機能しない等）
になる。

## 5. 対応プラットフォームについて

作者は主に Claude Code（Web版）で日常的に検証している。Claude Code CLI・Codex 等、他の
AIコーディングエージェント環境でも原理的には動作するはずだが、確実な動作保証はない
（**No Warranty**、詳細は [README.md](../../README.md) を参照）。

Claude Code Web版を使う場合は、プロキシ制約・GitHub認証の誤検出・デプロイ先プレビュー環境の
疎通確認等、Web版特有のノウハウをまとめた
[Claude Code Web 環境での運用ノウハウ](./claude-code-web.md) も参照。

## 準備完了チェックリスト

- [ ] `gh auth status` が対象リポジトリに対して有効な権限を示している
- [ ] `CLAUDE.md` に `CLAUDE.md.template` の内容が反映済み（プレースホルダー埋め込み済み）
- [ ] （テストを動かす場合）`npm install` が完了している
- [ ] スキルが `.claude/skills/` または `~/.claude/skills/` に登録済み（[インストールマニュアル](./install.md)）

すべて済んだら [使い方チュートリアル](./tutorial.md) へ。
