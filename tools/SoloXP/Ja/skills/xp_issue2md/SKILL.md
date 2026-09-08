---
model: claude-sonnet-4-6
---

# XP Issue2MD Skill

## コマンド

### `/xp_issue2md <issue_number> [EpicName]`

GitHub イシュー（本文・コメント全件）を取得し、Markdown ファイルとして保存する。

`[EpicName]` は省略可能。呼び出し元が保存先エピックディレクトリを既に特定済みの場合
（例: `xp_issueArchiveFinalize` が候補ファイルを発見した時点のディレクトリ）に明示的に渡す。
省略時は手順2のラベルベースのエピック判定を行う。

---

## 処理フロー

### 1. イシューを取得

`gh` CLI が利用可能な場合は次のコマンドで取得する（従来経路）：

```bash
# イシュー本文を取得（--repo は固定せず、実行ディレクトリのリポジトリを gh に自動解決させる）
gh issue view <issue_number> --json number,title,body,labels,state,createdAt,author,comments
```

`gh` コマンドが未インストール、認証エラー、または `HTTP 403`（GraphQLクエリがセッションで無効化されている等）
で失敗し利用できない場合は、GitHub MCP ツールにフォールバックする（ClaudeCodeWeb 環境等、
`gh` CLI が使えないケースへの対応。#3204）：

```
mcp__github__issue_read（method: get, issue_number: <issue_number>）
  → number, title, body, state, labels, created_at, user.login（author）を取得

mcp__github__issue_read（method: get_comments, issue_number: <issue_number>, perPage: 100）
  → 各コメントの body, user.login（author）, created_at を取得
  → perPage は省略せず必ず 100（最大値）を明示指定する（省略時のデフォルトは30件であり、
    31〜100件のコメントを持つイシューで暗黙に切り詰められ取りこぼす恐れがあるため）。
    返却件数が100件（＝指定したperPage）に達した場合は page を1ずつ増やし、
    返却件数が100件未満になるまで繰り返し呼び出して全件を取得する
```

MCP フォールバック時も `owner`/`repo` はリポジトリ設定（現在のリポジトリ）から解決し、固定値をハードコードしない。

**取得結果の正規化：** `gh` CLI・MCP フォールバックいずれで取得した場合も、以降の手順（2〜5）に渡す前に
以下の共通フィールドに正規化する。これにより取得手段の違いによらず同一のMarkdownが生成される：

| 正規化フィールド | gh CLI (`--json`) | GitHub MCP フォールバック |
|---|---|---|
| title | `title` | `issue_read get` の `title` |
| body | `body` | `issue_read get` の `body` |
| state | `state` | `issue_read get` の `state` |
| labels | `labels[].name` | `issue_read get` の `labels`（配列。要素がオブジェクトの場合は `.name` を、文字列の場合はそのまま使用する。標準的なGitHub Issue表現ではラベルオブジェクトの配列であり、`.name`抽出を怠ると `epic/<EpicName>` パターンの文字列マッチが失敗し、`gh` 経路とMarkdownが食い違う） |
| createdAt | `createdAt` | `issue_read get` の `created_at` |
| author | `author.login` | `issue_read get` の `user.login` |
| comments[].author | `comments[].author.login` | `issue_read get_comments` 各要素の `user.login` |
| comments[].body | `comments[].body` | `issue_read get_comments` 各要素の `body` |
| comments[].createdAt | `comments[].createdAt` | `issue_read get_comments` 各要素の `created_at` |

- 本文・コメント全件・ラベル・状態・作成日・作者を取得する
- GitHub リポジトリは固定値をハードコードせず、`gh` のカレントディレクトリからの自動解決に委ねる（他リポジトリへの導入時にも正しく動作させるため）

### 2. エピックを判定

呼び出し元から `[EpicName]` が明示的に渡された場合は、以下のラベルベース判定を**行わず**
その値をそのまま使用する（呼び出し元が保存先を特定済みのケース。ラベル `epic/<EpicName>`
の値が実際のディレクトリ構成と食い違っている場合でも、明示指定を優先する。#2971関連・
Codexレビュー指摘・PR #3508）。

`[EpicName]` が省略された場合、取得したラベルから `epic/<EpicName>` パターンのラベルを探す。

- 例: ラベル `epic/DiscordAIbot拡張` → エピック名 `DiscordAIbot`
- ラベル `epic/<EpicName>` の `<EpicName>` に含まれる日本語接尾辞（拡張・改善・修正等）は除去し、ディレクトリ名と突合する
- 突合方法: `ls` でリポジトリルートのディレクトリ一覧を取得し、`<EpicName>` の前方一致または完全一致で対応ディレクトリを特定する
- エピックラベルがない場合: イシューのタイトルや親イシューのラベルを参照する
- それでも判定できない場合: ユーザーにエピック名を確認する

### 3. 保存先ディレクトリを決定

```
<EpicName>/docs/issues/
```

例:
- `DiscordAIbot` エピック → `DiscordAIbot/docs/issues/`
- `DiscordBotDashboard` エピック → `DiscordBotDashboard/docs/issues/`

ディレクトリが存在しない場合は作成する。

### 4. Markdown ファイルを生成

ファイル名: `issue-<issue_number>.MD`

以下の形式で出力する：

```markdown
---
issue: <issue_number>
title: "<イシュータイトル>"
state: <open|closed>
labels: [<ラベル1>, <ラベル2>, ...]
author: <作者>
created_at: <作成日時>
epic: <EpicName>
---

# #<issue_number> <イシュータイトル>

## 本文

<イシュー本文をそのまま転写>

## コメント

### <作者> — <日時>

<コメント本文>

---

### <作者> — <日時>

<コメント本文>

---
```

コメントがない場合は「## コメント」セクションを省略する。

### 5. ファイルを保存

`<EpicName>/docs/issues/issue-<issue_number>.MD` に書き込む。

---

## アウトプット

- `<EpicName>/docs/issues/issue-<issue_number>.MD`（新規 or 上書き）

完了後に以下を表示する：

```
## Issue2MD 完了

保存先: <EpicName>/docs/issues/issue-<issue_number>.MD
イシュー: #<issue_number> <タイトル>
コメント数: <件数>
```

---

## 注意事項

- コメントは作成日時の昇順で出力する（古いものが先）
- ファイルが既に存在する場合は上書きする（冪等性を保つ）
- `gh` CLI での取得に失敗した場合は即座にエラーとせず、まず GitHub MCP フォールバック（`mcp__github__issue_read`）へ切り替える。フォールバックも失敗した場合に限り、エラーを報告してスキルを終了する
- エピックが判定できない場合はユーザーに確認してから進める
