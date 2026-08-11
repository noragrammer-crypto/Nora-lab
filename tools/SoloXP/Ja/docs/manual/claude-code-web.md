# Claude Code Web 環境での運用ノウハウ

作者が主に検証しているのは **Claude Code Web版**（[README.md](../../README.md) の
「対応プラットフォーム」参照）。Web版特有の制約・落とし穴と、その回避策をまとめる。
CLI版や他のAIコーディングエージェント環境では読み飛ばしてよい。

## 1. GitHub認証について

Claude Code Web のセッション作成画面「Environment variables」にGitHubトークン（`GH_TOKEN` 等）
を設定しておくと、セッション開始時に自動的に利用可能になる。`gh auth login` は不要。

### `gh auth status` の誤検出に注意

**Claude Code Web環境ではアウトバウンド通信がプロキシ経由になっており、GitHubのGraphQL API・
REST APIの一部リポジトリ操作系エンドポイントへの直接アクセスがブロックされることがある**
（`GraphQL proxying is not enabled` 等のエラー）。`gh auth status` や `gh issue list` は内部で
GraphQLを使うため、**トークン自体は有効でも「トークン無効」と誤表示することがある。**
この表示だけを見てトークンが無効と判断しないこと。

トークンの有効性そのものを確認したい場合は、GraphQLを使わない軽量なREST APIエンドポイントで
確認する:

```bash
curl -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user
```

### GitHub MCP サーバーツールの利用を推奨

GitHub MCPサーバー（`mcp__github__*` ツール）が利用可能な環境では、`gh` CLIより先にこちらを
検討する。プロキシ制約を受けにくく、認証確認・イシュー一覧取得等を代替できる:

```bash
# 認証確認: gh auth status ではなく mcp__github__get_me 相当のツールを使う
# イシュー一覧確認: gh issue list --json ではなく mcp__github__list_issues 相当のツールを使う
```

### `gh` CLI 自体の既知の制約

`gh issue view --json subIssues` は環境によって非対応（`Unknown JSON field: "subIssues"`）
なことがある。サブイシュー取得はGitHub MCPの `get_sub_issues` 相当のメソッド、または
GitHub REST/GraphQL APIを直接叩く方法に切り替える。

## 2. デプロイ先環境の認証・疎通確認について（Vercel等を使う場合）

SoloXPのワークフロー自体はデプロイ先の有無を前提にしないが、Webアプリ等デプロイを伴う
プロジェクトで運用する場合、`xp_RunE2ETests`・`xp_RunTestSuites` はローカルサーバーだけでなく
ブランチプレビュー環境に対してテストすることが多い。以下はVercelを例にするが、他のPaaSでも
考え方は同じ。

### トークンの設定

デプロイ先のAPIトークン（Vercelなら `VERCEL_TOKEN`）をClaude Code Webのセッション作成画面
「Environment variables」に設定しておくと、API経由でデプロイ状況・プレビューURLを取得できる。

```bash
# 認証確認の例（Vercel）
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v2/user" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('name'))"
```

### ブランチプレビュー環境のURL導出

Claude Code Webのタスクは起動時点で専用ブランチが自動生成され、pushされた時点でデプロイ先が
プレビュー環境を自動生成することが多い。プレビューURLはブランチ名をそのまま使わず、
サービス側で切り詰め・ハッシュ付与されることが多いため、**手動で予測せずAPIで取得するのが確実。**

```bash
# 例（Vercel）: ブランチ名からプレビューURLを取得する
BRANCH=$(git rev-parse --abbrev-ref HEAD)
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=<プロジェクトID>&limit=20" \
  | python3 -c "
import sys, json
deps = json.load(sys.stdin)['deployments']
branch = '$BRANCH'
for d in deps:
    if d['meta'].get('githubCommitRef') == branch:
        print('https://' + d['url'])
        break
"
```

`<プロジェクトID>` は自分のデプロイ先プロジェクトのIDに置き換える。

### 疎通確認手順（E2Eテスト実行前に必ず行う）

デプロイ完了前にテストを実行すると、テスト対象自体が存在せず失敗する。プレビューURL取得後は
HTTPステータスで疎通を確認してからテストに進む:

```bash
PREVIEW_URL="<上記で取得したURL>"
echo "Preview URL: $PREVIEW_URL"
curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL"
```

疎通が取れない場合はデプロイ未完了の可能性があるため、待機するか、対象イシューにその旨を
コメントして状況を残す。この節の内容は
[`CLAUDE.md.template`](../../CLAUDE.md.template) の「動作確認・プレビュー環境
（プロジェクト固有・要編集）」セクションに、自分のプロジェクトの実際のコマンドとして
書き起こしておくとよい。

## 3. 作業開始時の確認事項

- GitHub認証が有効か確認する（1節の方法で。`gh auth status` の表示だけを鵜呑みにしない）
- オープンなIssueを確認してから作業を開始する

## 4. ブラウザ自動化・プロキシ制約

Claude Code Webはアウトバウンド通信がプロキシ経由になっているため、Playwright等でブラウザを
起動する自動化スキルを新規作成する場合、`net::ERR_CONNECTION_CLOSED` 等プロキシ由来のエラーに
遭遇することがある。一般的な回避策:

- プロキシ設定（`HTTP_PROXY`/`HTTPS_PROXY`）をブラウザ自動化ツール側が読み込むか確認する
- SSL/TLSインスペクションを行うプロキシの場合、証明書エラーを無視するオプションが必要になることがある
  （ツールにより設定名は異なる。例: 「HTTPSエラーを無視する」系のフラグ）
- サンドボックス関連のブラウザ起動オプション（`--no-sandbox` 等）が必要になることがある

具体的な設定はブラウザ自動化ツール・実行環境によって異なるため、上記を出発点に自分の
環境で疎通確認しながら調整する。

## 5. スキルファイルの置き場所が複数ある場合の同期

SoloXPのスキル定義（`skills/xp_*/SKILL.md`）を、プロジェクトスコープ（`.claude/skills/`）と
個人スコープ（`~/.claude/skills/`）の両方に置く、あるいは複数リポジトリで使い回す等、
配置先が複数になる運用を組む場合は、**どちらか一方を正本（source of truth）と決め、
そこからもう一方へ一方向に同期する**運用にしておく。双方向に手動編集できる状態にすると、
「どちらが最新か分からなくなる」「片方だけ更新して機能が食い違う」といった事故が起きやすい。

同期の実装は任意（コピースクリプト・git hook・シンボリックリンク等）で構わない。
シンボリックリンクを使う場合は、`git subtree` 等で履歴越しに別リポジトリへ持ち出す運用と
組み合わせると、リンク先の実体ではなくリンクという文字列自体が運ばれてリンク切れになる点に
注意する（[インストールマニュアル](./install.md) の「シンボリックリンクする場合」の注記も参照）。

## 関連ドキュメント

- [インストールマニュアル](./install.md)
- [セットアップマニュアル](./setup.md)
- [使い方チュートリアル](./tutorial.md)
