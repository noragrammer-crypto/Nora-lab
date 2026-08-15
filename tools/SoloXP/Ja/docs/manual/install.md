# インストールマニュアル

SoloXPのスキル（`skills/xp_*`・`skills/ProcessIssue`・`skills/ProcessCodexIssue`）を自分の
リポジトリ・Claude Code環境に導入する手順。

> 前提として [Claude Code](https://claude.com/product/claude-code)（CLI版・Web版のどちらでも可）が使える状態であること。
> `gh` CLI・Node/npm 等の周辺ツールの準備は [セットアップマニュアル](./setup.md) を参照。

## 1. SoloXPを自分のリポジトリに取り込む

このディレクトリ（`SoloXP/`）を、自分のプロジェクトの任意の場所にコピーする。

```bash
# 例: 自分のリポジトリのルートに SoloXP/ ごと配置する
cp -r /path/to/Nora-lab/tools/SoloXP/Ja <your-project>/SoloXP
```

`skills/`・`WORKFLOW.md`・`CLAUDE.md.template` 一式がまとまって入っていれば、配置場所自体は
どこでも構わない（後述のスキル登録さえ済ませれば動作する）。

## 2. スキルをClaude Codeに登録する

Claude Codeはスキルを2種類のスコープで認識する。どちらか、または両方を使う。

| スコープ | 配置先 | 有効範囲 |
|---|---|---|
| プロジェクトスコープ | `<リポジトリルート>/.claude/skills/<スキル名>/SKILL.md` | そのリポジトリのみ |
| 個人スコープ | `~/.claude/skills/<スキル名>/SKILL.md` | 実行環境上の全リポジトリ |

`SoloXP/skills/` 配下の各ディレクトリ（`xp_Director`・`xp_Architect`・`xp_Tester`・`ProcessIssue`・
`ProcessCodexIssue` 等）が、そのまま1スキル1ディレクトリに対応している。登録は「コピー」でも
「シンボリックリンク」でも良い。

> `ProcessIssue`・`ProcessCodexIssue` は `xp_*` と役割が異なる。`xp_Director`（引数なし）は
> 呼ばれると直ちに `/ProcessIssue` に処理を委譲する（イシュー選択・振り分けロジック自体は
> `ProcessIssue` 側にある）。さらに `ProcessIssue` は、Codexの自動レビューから生成されたイシュー
> を検出すると `/ProcessCodexIssue` に処理を委譲する。**`xp_*` だけを登録すると、`xp_Director`
> の自動選択の入口（引数なし呼び出し）が動作しない**ため、`ProcessIssue`・`ProcessCodexIssue`
> も忘れずに登録すること（詳細: [ProcessIssue ── イシュートリアージと自動選択](./process-issue.md)）。

### コピーする場合（シンプル・環境非依存）

```bash
mkdir -p .claude/skills
for d in SoloXP/skills/xp_* SoloXP/skills/ProcessIssue SoloXP/skills/ProcessCodexIssue; do
  cp -r "$d" ".claude/skills/$(basename "$d")"
done
```

SoloXP側を更新したら都度コピーし直す必要がある。

### シンボリックリンクする場合（SoloXP側の更新が自動反映される）

```bash
mkdir -p .claude/skills
for d in "$(pwd)"/SoloXP/skills/xp_* "$(pwd)"/SoloXP/skills/ProcessIssue "$(pwd)"/SoloXP/skills/ProcessCodexIssue; do
  ln -s "$d" ".claude/skills/$(basename "$d")"
done
```

複数リポジトリで使い回す場合は `~/.claude/skills/` に対して同様のシンボリックリンクを張ると、
どのリポジトリからでも同じスキル定義を参照できる（本プロジェクトの開発環境でもこの方式を採用している）。

> シンボリックリンクは `git subtree push` 等、履歴を辿ってファイルを運ぶ同期方式を越えられない
> （リンク先の実体ではなくリンクという文字列自体が運ばれてリンク切れになる）。他リポジトリへ
> スキル一式を継続的に公開・同期する運用を組む場合は、実体コピーの同期スクリプトを使うこと。

## 3. 動作確認

Claude Codeを起動し、`/` に続けて `xp_Director` と入力してみる。スキル候補（コマンド一覧）に
`xp_Director` を含む `xp_*` スキル群が表示されれば登録成功。

> ⚠️ この時点ではまだ **実際にIssue番号を指定して実行しないこと。** `xp_Director <issue番号>` は
> 単なる動作確認コマンドではなく、指定したIssueへのコメント・ブランチ作成/push・PR発行まで
> 行う実処理。`gh` CLI認証や `CLAUDE.md` の準備（[セットアップマニュアル](./setup.md)）が
> 済む前に実イシューに対して実行すると、意図しない変更が入ってしまう。動作確認は候補表示の
> 確認までに留め、実際の実行はセットアップ完了後、[使い方チュートリアル](./tutorial.md) の
> 手順に沿って行う。

インストールはこれで完了。次はセットアップマニュアルへ進む。

## 次のステップ

- [セットアップマニュアル](./setup.md) — 使い始める前に必要な準備
- [使い方チュートリアル](./tutorial.md) — 最初のIssueからPRマージまでの実例
