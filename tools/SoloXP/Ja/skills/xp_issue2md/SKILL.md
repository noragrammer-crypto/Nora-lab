---
model: claude-sonnet-4-6
---

# XP Issue2MD Skill

## コマンド

### `/xp_issue2md <issue_number>`

GitHub イシュー（本文・コメント全件）を取得し、Markdown ファイルとして保存する。

---

## 処理フロー

### 1. イシューを取得

```bash
# イシュー本文を取得
gh issue view <issue_number> --repo noragrammer-crypto/HolyAutomater --json number,title,body,labels,state,createdAt,author,comments
```

- 本文・コメント全件・ラベル・状態・作成日・作者を取得する

### 2. エピックを判定

取得したラベルから `epic/<EpicName>` パターンのラベルを探す。

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
- GitHub API の取得失敗時は即座にエラーを報告してスキルを終了する
- エピックが判定できない場合はユーザーに確認してから進める
