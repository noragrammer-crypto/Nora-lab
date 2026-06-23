# CodeCompass セットアップ手順（AI実行者向けハンドオフ）

> 対象: Nora-lab (`tools/CodeCompass/`) から CodeCompass を導入する作業者（人間 or AI エージェント）。
> 本書は実行順に並べた手順書。背景・設計思想は `concept.md` / `docs/spec/` を参照。

## 0. 前提・注意事項（インストール前に必ず確認すること）

### MVP制限: CI専用。ローカル単体実行は非対応

- ローカル/サンドボックス実行（`/codecompass` スキル経由を含む）はシャロークローンの構造的制約により、`git log --since=90.days` が実際には数十日分しか遡れず変更頻度が不正確になることが判明している（HolyAutomater#1541）。
- 本MVPでは **GitHub Actions（CI）経由の利用のみをサポート対象とする**。ローカル単体実行で得られる数値は参考値に過ぎず、正式な判定には使わない。

### 出力ディレクトリが分析対象リポジトリ内に作成される

- CodeCompass を実行すると、分析対象リポジトリのルートに `codecompass/` ディレクトリが作成され、`hotspots.md` / `hotspots.json` / `dependency-graph.mmd` / `actions.md` が出力される。
- 導入前に、このディレクトリをコミット対象にするか `.gitignore` するかを決めておくこと。

## 1. ダウンロード（sparse-checkout）

CodeCompass単体だけが必要な場合、Nora-lab全体をcloneせず sparse-checkout で取得する。

```bash
git clone --no-checkout --filter=blob:none https://github.com/noragrammer-crypto/Nora-lab.git
cd Nora-lab
git sparse-checkout init --cone
git sparse-checkout set tools/CodeCompass
git checkout main
```

→ `Nora-lab/tools/CodeCompass/` 配下にツール本体が展開される。

## 2. インストール

```bash
cd tools/CodeCompass
npm install
```

- Node.js バージョン: CI（`.github/workflows/codecompass.yml`）は `node-version: '22'` を使用。同バージョン以上を推奨。

## 3. GitHub Actions への登録（必須）

CodeCompassはCI経由でのみ使う前提（0章参照）。分析対象リポジトリに2つのワークフローを登録する。

### 3-1. ワークフローファイルをコピー

`tools/CodeCompass/workflows/` 配下にある以下2ファイルを、分析対象リポジトリの `.github/workflows/` にコピーする。

- `codecompass.yml`（PR時にホットスポット分析を実行しPRコメントを投稿）
- `hotspot-alert.yml`（main への push 時にしきい値超えを検知しIssueを自動起票）

### 3-2. パスを自分のリポジトリ構成に合わせて書き換える

コピー元のワークフローは `working-directory: CodeCompass`（リポジトリ直下に配置する想定）になっている。
CodeCompassを別のパス（例: `tools/CodeCompass`）に置く場合、両ワークフロー内の `working-directory` と `node scripts/hotspot.js ..` の相対パス引数を、実際の配置パスに合わせて修正する。

### 3-3. 必要な permissions

| ワークフロー | permissions |
|---|---|
| `codecompass.yml` | `contents: read`, `pull-requests: write` |
| `hotspot-alert.yml` | `contents: read`, `pull-requests: read`, `issues: write` |

`hotspot-alert.yml` は `gh` CLI を使うため `GH_TOKEN` 環境変数（`secrets.GITHUB_TOKEN` で足りる）が必要。

## 4. 動作確認

1. 適当な変更でPRを作成する。
2. `codecompass.yml` が走り、PRに `## CodeCompass Hotspots (Top 10)` というコメントが投稿されることを確認する。
3. PRをmainにマージする。
4. `hotspot-alert.yml` が走ることを確認する（Actions タブで実行ログを見る）。
5. しきい値を超えるホットスポットがあれば `[CodeCompass Alert] ...` というIssueが自動起票されることを確認する（しきい値以下なら起票されないのが正常動作）。
